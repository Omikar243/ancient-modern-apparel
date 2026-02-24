// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const diagnostics: {
      connectivity: boolean;
      tablesExist: Record<string, boolean>;
      schemaInfo: Record<string, any>;
      sampleQueries: Record<string, any>;
      errors: string[];
      databaseVersion?: string;
      foreignKeysEnabled?: any;
      allTables?: string[];
    } = {
      connectivity: false,
      tablesExist: {},
      schemaInfo: {},
      sampleQueries: {},
      errors: []
    };

    // Test basic database connectivity
    try {
      await (db as any).execute(sql`SELECT 1 as test`);
      diagnostics.connectivity = true;
    } catch (error) {
      diagnostics.connectivity = false;
      diagnostics.errors.push(`Database connectivity failed: ${String(error)}`);
    }

    // Check if specific tables exist
    const tablesToCheck = ['garments', 'materials', 'user', 'session', 'account', 'verification', 'designs', 'userAvatars', 'orders', 'avatars'];
    
    for (const tableName of tablesToCheck) {
      try {
        const result = await (db as any).execute(sql`SELECT name FROM sqlite_master WHERE type='table' AND name=${tableName}`);
        diagnostics.tablesExist[tableName] = result.rows.length > 0;
        
        if (result.rows.length > 0) {
          // Get detailed schema information using PRAGMA table_info
          const schemaResult = await (db as any).execute(sql.raw(`PRAGMA table_info(${tableName})`));
          diagnostics.schemaInfo[tableName] = schemaResult.rows;
        }
      } catch (error) {
        diagnostics.tablesExist[tableName] = false;
        diagnostics.errors.push(`Error checking table ${tableName}: ${String(error)}`);
      }
    }

    // Test basic queries on existing tables
    if (diagnostics.tablesExist.garments) {
      try {
        const garmentsCount = await (db as any).execute(sql`SELECT COUNT(*) as count FROM garments`);
        diagnostics.sampleQueries.garments = {
          count: garmentsCount.rows[0]?.count || 0,
          sample: null
        };

        // Get a sample record if any exist
        if (garmentsCount.rows[0]?.count > 0) {
          const sampleGarment = await (db as any).execute(sql`SELECT * FROM garments LIMIT 1`);
          diagnostics.sampleQueries.garments.sample = sampleGarment.rows[0];
        }
      } catch (error) {
        diagnostics.errors.push(`Error querying garments table: ${String(error)}`);
      }
    }

    if (diagnostics.tablesExist.materials) {
      try {
        const materialsCount = await (db as any).execute(sql`SELECT COUNT(*) as count FROM materials`);
        diagnostics.sampleQueries.materials = {
          count: materialsCount.rows[0]?.count || 0,
          sample: null
        };

        // Get a sample record if any exist
        if (materialsCount.rows[0]?.count > 0) {
          const sampleMaterial = await (db as any).execute(sql`SELECT * FROM materials LIMIT 1`);
          diagnostics.sampleQueries.materials.sample = sampleMaterial.rows[0];
        }
      } catch (error) {
        diagnostics.errors.push(`Error querying materials table: ${String(error)}`);
      }
    }

    // Check for foreign key constraints
    try {
      const foreignKeys = await (db as any).execute(sql.raw(`PRAGMA foreign_key_list(garments)`));
      diagnostics.schemaInfo.garmentsForeignKeys = foreignKeys.rows;
    } catch (error) {
      diagnostics.errors.push(`Error checking foreign keys: ${String(error)}`);
    }

    // Check database version and settings
    try {
      const version = await (db as any).execute(sql`SELECT sqlite_version() as version`);
      diagnostics.databaseVersion = version.rows[0]?.version;

      const foreignKeysEnabled = await (db as any).execute(sql.raw(`PRAGMA foreign_keys`));
      diagnostics.foreignKeysEnabled = foreignKeysEnabled.rows[0];
    } catch (error) {
      diagnostics.errors.push(`Error checking database settings: ${String(error)}`);
    }

    // List all tables in the database
    try {
      const allTables = await (db as any).execute(sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
      diagnostics.allTables = allTables.rows.map((row: any) => row.name);
    } catch (error) {
      diagnostics.errors.push(`Error listing all tables: ${String(error)}`);
    }

    // Test a simple insert/delete operation on garments table if it exists
    if (diagnostics.tablesExist.garments) {
      try {
        // Insert a test record
        const testInsert = await (db as any).execute(sql`
          INSERT INTO garments (name, type, price, category, createdAt, updatedAt) 
          VALUES (${'Test Diagnostic Garment'}, ${'test'}, ${99.99}, ${'test'}, ${new Date().toISOString()}, ${new Date().toISOString()})
        `);
        
        diagnostics.sampleQueries.testInsert = {
          success: true,
          insertId: testInsert.meta?.lastInsertRowid
        };

        // Clean up - delete the test record
        await (db as any).execute(sql`DELETE FROM garments WHERE name = ${'Test Diagnostic Garment'}`);

        diagnostics.sampleQueries.testInsert.cleanupSuccess = true;
      } catch (error) {
        diagnostics.sampleQueries.testInsert = {
          success: false,
          error: String(error)
        };
        diagnostics.errors.push(`Error testing insert operation: ${String(error)}`);
      }
    }

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('Database diagnostics error:', error);
    return NextResponse.json({ 
      error: 'Failed to run database diagnostics',
      details: String(error)
    }, { status: 500 });
  }
}