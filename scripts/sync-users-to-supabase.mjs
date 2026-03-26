import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

import { createClient as createLibsqlClient } from "@libsql/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function loadDotEnv() {
  const envPath = ".env";
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const turso = createLibsqlClient({
  url: requireEnv("TURSO_CONNECTION_URL"),
  authToken: requireEnv("TURSO_AUTH_TOKEN"),
});

const supabase = createSupabaseClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const SYNC_SOURCE = "turso-better-auth";
const PAGE_SIZE = 200;

function toIsoString(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function listAllSupabaseUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (error) {
      throw error;
    }

    const pageUsers = data.users ?? [];
    users.push(...pageUsers);

    if (pageUsers.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return users;
}

async function findExistingSupabaseUser(user, cachedUsers) {
  const byAppUserId = cachedUsers.find(
    (candidate) =>
      candidate.app_metadata?.source === SYNC_SOURCE &&
      candidate.app_metadata?.tursoUserId === user.id,
  );

  if (byAppUserId) {
    return byAppUserId;
  }

  return (
    cachedUsers.find(
      (candidate) =>
        typeof candidate.email === "string" &&
        candidate.email.toLowerCase() === user.email.toLowerCase(),
    ) ?? null
  );
}

function buildPayload(user) {
  return {
    email: user.email.toLowerCase(),
    email_confirm: Boolean(user.emailVerified),
    user_metadata: {
      name: user.name,
      image: user.image ?? null,
    },
    app_metadata: {
      source: SYNC_SOURCE,
      tursoUserId: user.id,
      tursoCreatedAt: toIsoString(user.createdAt),
      tursoUpdatedAt: toIsoString(user.updatedAt),
    },
  };
}

async function main() {
  const result = await turso.execute(`
    SELECT id, email, name, email_verified, image, created_at, updated_at
    FROM user
    ORDER BY created_at ASC
  `);

  const users = result.rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    emailVerified: Boolean(row.email_verified),
    image: row.image ? String(row.image) : null,
    createdAt: row.created_at ? String(row.created_at) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  }));

  const supabaseUsers = await listAllSupabaseUsers();
  let created = 0;
  let updated = 0;

  for (const user of users) {
    const existing = await findExistingSupabaseUser(user, supabaseUsers);
    const payload = buildPayload(user);

    if (existing) {
      const { data, error } = await supabase.auth.admin.updateUserById(
        existing.id,
        payload,
      );

      if (error) {
        throw error;
      }

      updated += 1;
      const idx = supabaseUsers.findIndex((candidate) => candidate.id === existing.id);
      if (idx >= 0) {
        supabaseUsers[idx] = data.user;
      }
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      ...payload,
      password: randomUUID() + randomUUID(),
    });

    if (error) {
      throw error;
    }

    created += 1;
    supabaseUsers.push(data.user);
  }

  console.log(
    JSON.stringify(
      {
        scanned: users.length,
        created,
        updated,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
