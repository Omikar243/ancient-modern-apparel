// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: {
        connectivity: null,
        tableStructure: {},
        constraints: {},
        sampleOperations: {},
        jsonFieldTests: {},
        schemaValidation: {}
      },
      recommendations: [],
      errors: []
    };

    // Test 1: Database Connectivity
    try {
      const result = await db.execute(sql`SELECT 1 as test`);
      diagnostics.tests.connectivity = { status: 'SUCCESS', message: 'Database connection established', result: result.rows };
    } catch (error) {
      diagnostics.tests.connectivity = { status: 'FAILED', error: error.message };
      diagnostics.errors.push('Database connectivity failed');
    }

    // Test 2: Table Structure Analysis
    const tables = ['garments', 'materials', 'user', 'designs', 'orders'];
    
    for (const tableName of tables) {
      try {
        // Get table info using raw SQL
        const tableInfo = await db.execute(sql.raw(`PRAGMA table_info(${tableName})`));
        diagnostics.tests.tableStructure[tableName] = {
          exists: tableInfo.rows.length > 0,
          columns: tableInfo.rows.map((row: any) => ({
            name: row.name,
            type: row.type,
            notNull: row.notnull === 1,
            defaultValue: row.dflt_value,
            primaryKey: row.pk === 1
          }))
        };

        // Get foreign keys
        const foreignKeys = await db.execute(sql.raw(`PRAGMA foreign_key_list(${tableName})`));
        diagnostics.tests.tableStructure[tableName].foreignKeys = foreignKeys.rows.map((row: any) => ({
          column: row.from,
          referencedTable: row.table,
          referencedColumn: row.to
        }));

        // Get indexes
        const indexes = await db.execute(sql.raw(`PRAGMA index_list(${tableName})`));
        diagnostics.tests.tableStructure[tableName].indexes = indexes.rows.map((row: any) => ({
          name: row.name,
          unique: row.unique === 1
        }));

      } catch (error) {
        diagnostics.tests.tableStructure[tableName] = { 
          exists: false, 
          error: error.message 
        };
        diagnostics.errors.push(`Table ${tableName} analysis failed: ${error.message}`);
      }
    }

    // Test 3: Constraint Validation
    try {
      const pragmaForeignKeys = await db.execute(sql`PRAGMA foreign_keys`);
      diagnostics.tests.constraints.foreignKeysEnabled = pragmaForeignKeys.rows[0]?.foreign_keys === 1;
      
      // Test constraint violations for garments
      const constraintTests = [];
      
      if (diagnostics.tests.tableStructure.garments?.exists) {
        try {
          await db.execute(sql`
            INSERT INTO garments (name, type, price, category, created_at, updated_at) 
            VALUES (NULL, 'test', 100, 'test', datetime('now'), datetime('now'))
          `);
          constraintTests.push({ test: 'garments_name_not_null', result: 'FAILED - Should have rejected NULL name' });
        } catch (error) {
          constraintTests.push({ test: 'garments_name_not_null', result: 'PASSED - Correctly rejected NULL name' });
        }
      }

      diagnostics.tests.constraints.validationTests = constraintTests;
    } catch (error) {
      diagnostics.tests.constraints = { error: error.message };
      diagnostics.errors.push(`Constraint testing failed: ${error.message}`);
    }

    // Test 4: Sample INSERT/SELECT/DELETE Operations
    try {
      // Test garments table operations
      if (diagnostics.tests.tableStructure.garments?.exists) {
        const insertResult = await db.execute(sql`
          INSERT INTO garments (name, type, description, image_url, price, category, measurements, quality_rating, history, created_at, updated_at)
          VALUES ('Test Diagnostic Garment', 'test', 'Diagnostic test garment', '/test.jpg', 99.99, 'test', '{"test": true}', 5, 'Test history', datetime('now'), datetime('now'))
        `);

        const insertedId = insertResult.meta?.lastInsertRowid;
        diagnostics.tests.sampleOperations.insert = {
          status: 'SUCCESS',
          insertedId: insertedId
        };

        // Test SELECT
        const selectResult = await db.execute(sql`SELECT * FROM garments WHERE id = ${insertedId}`);
        
        diagnostics.tests.sampleOperations.select = {
          status: selectResult.rows.length > 0 ? 'SUCCESS' : 'FAILED',
          recordFound: selectResult.rows.length > 0,
          data: selectResult.rows[0] || null
        };

        // Test DELETE
        const deleteResult = await db.execute(sql`DELETE FROM garments WHERE id = ${insertedId}`);
        
        diagnostics.tests.sampleOperations.delete = {
          status: 'SUCCESS',
          rowsAffected: deleteResult.meta?.changes || 0
        };
      } else {
        diagnostics.tests.sampleOperations = {
          status: 'SKIPPED',
          reason: 'Garments table does not exist'
        };
      }

    } catch (error) {
      diagnostics.tests.sampleOperations = {
        status: 'FAILED',
        error: error.message
      };
      diagnostics.errors.push(`Sample operations failed: ${error.message}`);
    }

    // Test 5: JSON Field Handling
    try {
      if (diagnostics.tests.tableStructure.materials?.exists) {
        const jsonInsertResult = await db.execute(sql`
          INSERT INTO materials (name, origin, gsm, stretch, drape, colors, texture_url, care_instructions, artisan_origin, created_at, updated_at)
          VALUES ('Test Diagnostic Material', 'Test Origin', 150, 0.5, 0.8, '["red", "blue", "green"]', '/test-texture.jpg', 'Test care instructions', 'Test Artisan', datetime('now'), datetime('now'))
        `);

        const jsonInsertedId = jsonInsertResult.meta?.lastInsertRowid;

        const jsonSelectResult = await db.execute(sql`SELECT colors FROM materials WHERE id = ${jsonInsertedId}`);

        diagnostics.tests.jsonFieldTests = {
          insert: { status: 'SUCCESS', insertedId: jsonInsertedId },
          select: { 
            status: 'SUCCESS', 
            jsonData: jsonSelectResult.rows[0]?.colors || null,
            isParseable: true
          }
        };

        // Test JSON parsing
        try {
          if (jsonSelectResult.rows[0]?.colors) {
            const parsedJson = JSON.parse(jsonSelectResult.rows[0].colors);
            diagnostics.tests.jsonFieldTests.select.parsedData = parsedJson;
          }
        } catch (parseError) {
          diagnostics.tests.jsonFieldTests.select.isParseable = false;
          diagnostics.tests.jsonFieldTests.select.parseError = parseError.message;
        }

        // Cleanup test record
        await db.execute(sql`DELETE FROM materials WHERE id = ${jsonInsertedId}`);
      } else {
        diagnostics.tests.jsonFieldTests = {
          status: 'SKIPPED',
          reason: 'Materials table does not exist'
        };
      }

    } catch (error) {
      diagnostics.tests.jsonFieldTests = {
        status: 'FAILED',
        error: error.message
      };
      diagnostics.errors.push(`JSON field testing failed: ${error.message}`);
    }

    // Test 6: Schema Validation Against Expected Structure
    const expectedSchema = {
      garments: {
        columns: ['id', 'name', 'type', 'description', 'image_url', 'price', 'category', 'measurements', 'quality_rating', 'history', 'created_at', 'updated_at'],
        requiredColumns: ['name', 'type', 'price', 'category', 'created_at', 'updated_at']
      },
      materials: {
        columns: ['id', 'name', 'origin', 'gsm', 'stretch', 'drape', 'colors', 'texture_url', 'care_instructions', 'artisan_origin', 'created_at', 'updated_at'],
        requiredColumns: ['name', 'origin', 'gsm', 'stretch', 'drape', 'colors', 'texture_url', 'care_instructions', 'artisan_origin', 'created_at', 'updated_at']
      }
    };

    for (const [tableName, expectedStructure] of Object.entries(expectedSchema)) {
      if (diagnostics.tests.tableStructure[tableName]?.exists) {
        const actualColumns = diagnostics.tests.tableStructure[tableName].columns.map(col => col.name);
        const missingColumns = expectedStructure.columns.filter(col => !actualColumns.includes(col));
        const extraColumns = actualColumns.filter(col => !expectedStructure.columns.includes(col));
        const missingRequired = expectedStructure.requiredColumns.filter(col => 
          !diagnostics.tests.tableStructure[tableName].columns.find(c => c.name === col && c.notNull)
        );

        diagnostics.tests.schemaValidation[tableName] = {
          status: missingColumns.length === 0 && missingRequired.length === 0 ? 'PASSED' : 'FAILED',
          missingColumns,
          extraColumns,
          missingRequiredConstraints: missingRequired,
          columnCount: actualColumns.length,
          actualColumns
        };

        if (missingColumns.length > 0) {
          diagnostics.errors.push(`Table ${tableName} missing columns: ${missingColumns.join(', ')}`);
        }
        if (missingRequired.length > 0) {
          diagnostics.errors.push(`Table ${tableName} missing NOT NULL constraints: ${missingRequired.join(', ')}`);
        }
      } else {
        diagnostics.tests.schemaValidation[tableName] = {
          status: 'FAILED',
          error: 'Table does not exist'
        };
      }
    }

    // Generate Recommendations
    if (diagnostics.tests.connectivity?.status === 'FAILED') {
      diagnostics.recommendations.push('Fix database connection configuration');
    }

    if (!diagnostics.tests.constraints?.foreignKeysEnabled) {
      diagnostics.recommendations.push('Enable foreign key constraints with PRAGMA foreign_keys = ON');
    }

    Object.entries(diagnostics.tests.schemaValidation).forEach(([table, validation]) => {
      if (validation.status === 'FAILED') {
        diagnostics.recommendations.push(`Review schema for table: ${table}`);
      }
    });

    if (diagnostics.tests.sampleOperations?.status === 'FAILED') {
      diagnostics.recommendations.push('Check table permissions and constraint configurations');
    }

    if (diagnostics.tests.jsonFieldTests?.status === 'FAILED') {
      diagnostics.recommendations.push('Verify JSON field handling and SQLite version compatibility');
    }

    // Add general recommendations based on findings
    if (diagnostics.errors.length === 0) {
      diagnostics.recommendations.push('Database appears to be functioning correctly');
      diagnostics.recommendations.push('Consider adding indexes on frequently queried columns');
      diagnostics.recommendations.push('Implement regular backup procedures');
    }

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('Diagnostic endpoint error:', error);
    return NextResponse.json({
      error: 'Diagnostic test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}