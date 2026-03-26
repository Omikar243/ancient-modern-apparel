import { randomBytes } from "node:crypto";

import { supabaseAdmin } from "@/lib/supabase-admin";

type AppUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

const SYNC_SOURCE = "turso-better-auth";
const PAGE_SIZE = 200;

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function buildMirrorPayload(user: AppUser) {
  return {
    email: user.email.toLowerCase(),
    email_confirm: user.emailVerified,
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

async function listAllSupabaseAuthUsers() {
  const users: Array<any> = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
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

async function findMirroredSupabaseUser(user: Pick<AppUser, "id" | "email">) {
  const allUsers = await listAllSupabaseAuthUsers();

  const byAppUserId = allUsers.find(
    (candidate) =>
      candidate.app_metadata?.source === SYNC_SOURCE &&
      candidate.app_metadata?.tursoUserId === user.id,
  );

  if (byAppUserId) {
    return byAppUserId;
  }

  return (
    allUsers.find(
      (candidate) =>
        typeof candidate.email === "string" &&
        candidate.email.toLowerCase() === user.email.toLowerCase(),
    ) ?? null
  );
}

export async function syncUserToSupabaseAuth(user: AppUser) {
  const existing = await findMirroredSupabaseUser(user);
  const payload = buildMirrorPayload(user);

  if (existing) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      existing.id,
      payload,
    );

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    ...payload,
    password: randomBytes(24).toString("hex"),
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function deleteUserFromSupabaseAuth(user: Pick<AppUser, "id" | "email">) {
  const existing = await findMirroredSupabaseUser(user);

  if (!existing) {
    return null;
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(existing.id);

  if (error) {
    throw error;
  }

  return existing.id;
}

export async function safeSyncUserToSupabaseAuth(user: AppUser) {
  try {
    return await syncUserToSupabaseAuth(user);
  } catch (error) {
    console.error("Supabase auth mirror sync failed:", error);
    return null;
  }
}

export async function safeDeleteUserFromSupabaseAuth(user: Pick<AppUser, "id" | "email">) {
  try {
    return await deleteUserFromSupabaseAuth(user);
  } catch (error) {
    console.error("Supabase auth mirror delete failed:", error);
    return null;
  }
}
