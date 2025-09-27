import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const diagnostics = {
      connectivity: false,
      tablesExist: {},
      schemaInfo: {},
      sampleQueries: {},
      errors: []
    };

    // Test basic database connectivity
    try {
      await db.execute({ sql: "SELECT 1 as test", args: [] });
      diagnostics.connectivity = true;
    } catch (error) {
      diagnostics.connectivity = false;
      diagnostics.errors.push(`Database connectivity failed: ${error}`);
    }

    // Check if specific tables exist
    const tablesToCheck = ['garments', 'materials', 'user', 'session', 'account', 'verification', 'designs', 'userAvatars', 'orders', 'avatars'];
    
    for (const tableName of tablesToCheck) {
      try {
        const result = await db.execute({ 
          sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?", 
          args: [tableName] 
        });
        diagnostics.tablesExist[tableName] = result.rows.length > 0;
        
        if (result.rows.length > 0) {
          // Get detailed schema information using PRAGMA table_info
          const schemaResult = await db.execute({ 
            sql: `PRAGMA table_info(${tableName})`, 
            args: [] 
          });
          diagnostics.schemaInfo[tableName] = schemaResult.rows;
        }
      } catch (error) {
        diagnostics.tablesExist[tableName] = false;
        diagnostics.errors.push(`Error checking table ${tableName}: ${error}`);
      }
    }

    // Test basic queries on existing tables
    if (diagnostics.tablesExist.garments) {
      try {
        const garmentsCount = await db.execute({ 
          sql: "SELECT COUNT(*) as count FROM garments", 
          args: [] 
        });
        diagnostics.sampleQueries.garments = {
          count: garmentsCount.rows[0]?.count || 0,
          sample: null
        };

        // Get a sample record if any exist
        if (garmentsCount.rows[0]?.count > 0) {
          const sampleGarment = await db.execute({ 
            sql: "SELECT * FROM garments LIMIT 1", 
            args: [] 
          });
          diagnostics.sampleQueries.garments.sample = sampleGarment.rows[0];
        }
      } catch (error) {
        diagnostics.errors.push(`Error querying garments table: ${error}`);
      }
    }

    if (diagnostics.tablesExist.materials) {
      try {
        const materialsCount = await db.execute({ 
          sql: "SELECT COUNT(*) as count FROM materials", 
          args: [] 
        });
        diagnostics.sampleQueries.materials = {
          count: materialsCount.rows[0]?.count || 0,
          sample: null
        };

        // Get a sample record if any exist
        if (materialsCount.rows[0]?.count > 0) {
          const sampleMaterial = await db.execute({ 
            sql: "SELECT * FROM materials LIMIT 1", 
            args: [] 
          });
          diagnostics.sampleQueries.materials.sample = sampleMaterial.rows[0];
        }
      } catch (error) {
        diagnostics.errors.push(`Error querying materials table: ${error}`);
      }
    }

    // Check for foreign key constraints
    try {
      const foreignKeys = await db.execute({ 
        sql: "PRAGMA foreign_key_list(garments)", 
        args: [] 
      });
      diagnostics.schemaInfo.garmentsForeignKeys = foreignKeys.rows;
    } catch (error) {
      diagnostics.errors.push(`Error checking foreign keys: ${error}`);
    }

    // Check database version and settings
    try {
      const version = await db.execute({ 
        sql: "SELECT sqlite_version() as version", 
        args: [] 
      });
      diagnostics.databaseVersion = version.rows[0]?.version;

      const foreignKeysEnabled = await db.execute({ 
        sql: "PRAGMA foreign_keys", 
        args: [] 
      });
      diagnostics.foreignKeysEnabled = foreignKeysEnabled.rows[0];
    } catch (error) {
      diagnostics.errors.push(`Error checking database settings: ${error}`);
    }

    // List all tables in the database
    try {
      const allTables = await db.execute({ 
        sql: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", 
        args: [] 
      });
      diagnostics.allTables = allTables.rows.map(row => row.name);
    } catch (error) {
      diagnostics.errors.push(`Error listing all tables: ${error}`);
    }

    // Test a simple insert/delete operation on garments table if it exists
    if (diagnostics.tablesExist.garments) {
      try {
        // Insert a test record
        const testInsert = await db.execute({
          sql: `INSERT INTO garments (name, type, price, category, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            'Test Diagnostic Garment',
            'test',
            99.99,
            'test',
            new Date().toISOString(),
            new Date().toISOString()
          ]
        });
        
        diagnostics.sampleQueries.testInsert = {
          success: true,
          insertId: testInsert.meta.last_insert_rowid
        };

        // Clean up - delete the test record
        await db.execute({
          sql: "DELETE FROM garments WHERE name = ?",
          args: ['Test Diagnostic Garment']
        });

        diagnostics.sampleQueries.testInsert.cleanupSuccess = true;
      } catch (error) {
        diagnostics.sampleQueries.testInsert = {
          success: false,
          error: error.toString()
        };
        diagnostics.errors.push(`Error testing insert operation: ${error}`);
      }
    }

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('Database diagnostics error:', error);
    return NextResponse.json({ 
      error: 'Failed to run database diagnostics',
      details: error.toString()
    }, { status: 500 });
  }
}