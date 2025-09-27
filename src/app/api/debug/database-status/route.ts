import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, session, account, verification, designs, garments, materials, userAvatars, orders, avatars } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting database debug diagnostics...');
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      databaseConnection: null,
      schemaInfo: {},
      tableCounts: {},
      sampleData: {},
      testOperations: {},
      errors: []
    };

    // Test 1: Basic database connection
    try {
      console.log('📊 Testing basic database connection...');
      const connectionTest = await db.execute(sql`SELECT 1 as test`);
      diagnostics.databaseConnection = {
        status: 'success',
        result: connectionTest,
        message: 'Database connection successful'
      };
      console.log('✅ Database connection test passed');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      diagnostics.databaseConnection = {
        status: 'failed',
        error: String(error),
        message: 'Database connection failed'
      };
      diagnostics.errors.push(`Connection test failed: ${error}`);
    }

    // Test 2: Get schema information
    try {
      console.log('📋 Retrieving schema information...');
      const schemaQuery = await db.execute(sql`
        SELECT name, type, sql 
        FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `);
      
      diagnostics.schemaInfo = {
        totalTables: schemaQuery.length,
        tables: schemaQuery.map((row: any) => ({
          name: row.name,
          type: row.type,
          creationSQL: row.sql
        }))
      };
      console.log(`✅ Found ${schemaQuery.length} tables in schema`);
    } catch (error) {
      console.error('❌ Schema info retrieval failed:', error);
      diagnostics.errors.push(`Schema info failed: ${error}`);
    }

    // Test 3: Count records in all tables
    const tables = [
      { name: 'user', table: user },
      { name: 'session', table: session },
      { name: 'account', table: account },
      { name: 'verification', table: verification },
      { name: 'designs', table: designs },
      { name: 'garments', table: garments },
      { name: 'materials', table: materials },
      { name: 'userAvatars', table: userAvatars },
      { name: 'orders', table: orders },
      { name: 'avatars', table: avatars }
    ];

    for (const { name, table } of tables) {
      try {
        console.log(`📊 Counting records in ${name} table...`);
        const countResult = await db.select({ count: sql`count(*)` }).from(table);
        const count = Number(countResult[0]?.count || 0);
        diagnostics.tableCounts[name] = count;
        console.log(`✅ ${name}: ${count} records`);
      } catch (error) {
        console.error(`❌ Count failed for ${name}:`, error);
        diagnostics.tableCounts[name] = { error: String(error) };
        diagnostics.errors.push(`Count failed for ${name}: ${error}`);
      }
    }

    // Test 4: Get sample data from key tables (garments and materials)
    try {
      console.log('📄 Retrieving sample data from garments table...');
      const garmentsData = await db.select().from(garments).limit(3);
      diagnostics.sampleData.garments = {
        count: garmentsData.length,
        records: garmentsData
      };
      console.log(`✅ Retrieved ${garmentsData.length} sample garments`);
    } catch (error) {
      console.error('❌ Garments sample data failed:', error);
      diagnostics.sampleData.garments = { error: String(error) };
      diagnostics.errors.push(`Garments sample data failed: ${error}`);
    }

    try {
      console.log('📄 Retrieving sample data from materials table...');
      const materialsData = await db.select().from(materials).limit(3);
      diagnostics.sampleData.materials = {
        count: materialsData.length,
        records: materialsData
      };
      console.log(`✅ Retrieved ${materialsData.length} sample materials`);
    } catch (error) {
      console.error('❌ Materials sample data failed:', error);
      diagnostics.sampleData.materials = { error: String(error) };
      diagnostics.errors.push(`Materials sample data failed: ${error}`);
    }

    // Test 5: Get sample data from all other tables
    for (const { name, table } of tables) {
      if (name === 'garments' || name === 'materials') continue; // Already done above
      
      try {
        console.log(`📄 Retrieving sample data from ${name} table...`);
        const sampleData = await db.select().from(table).limit(2);
        diagnostics.sampleData[name] = {
          count: sampleData.length,
          records: sampleData
        };
        console.log(`✅ Retrieved ${sampleData.length} sample records from ${name}`);
      } catch (error) {
        console.error(`❌ Sample data failed for ${name}:`, error);
        diagnostics.sampleData[name] = { error: String(error) };
        diagnostics.errors.push(`Sample data failed for ${name}: ${error}`);
      }
    }

    // Test 6: Test INSERT and SELECT operations
    try {
      console.log('🧪 Testing INSERT and SELECT operations...');
      
      // Test garment insert
      const testGarment = {
        name: 'Debug Test Garment',
        type: 'test',
        description: 'Test garment for database connectivity',
        imageUrl: '/test/image.jpg',
        price: 99.99,
        category: 'test',
        measurements: JSON.stringify({ chest: 40, waist: 32 }),
        qualityRating: 5,
        history: 'Test garment created during debug',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const insertResult = await db.insert(garments).values(testGarment).returning();
      console.log('✅ Test garment inserted successfully');

      // Verify the insert
      const selectResult = await db.select()
        .from(garments)
        .where(eq(garments.name, 'Debug Test Garment'))
        .limit(1);

      diagnostics.testOperations.insert = {
        status: 'success',
        insertedRecord: insertResult[0],
        selectedRecord: selectResult[0],
        message: 'INSERT and SELECT operations successful'
      };

      // Clean up test data
      if (selectResult.length > 0) {
        await db.delete(garments).where(eq(garments.id, selectResult[0].id));
        console.log('✅ Test garment cleaned up');
      }

      console.log('✅ INSERT/SELECT test completed successfully');
    } catch (error) {
      console.error('❌ INSERT/SELECT test failed:', error);
      diagnostics.testOperations.insert = {
        status: 'failed',
        error: String(error),
        message: 'INSERT and SELECT operations failed'
      };
      diagnostics.errors.push(`INSERT/SELECT test failed: ${error}`);
    }

    // Test 7: Direct raw SQL queries to verify data existence
    try {
      console.log('🔍 Running raw SQL queries for verification...');
      
      const rawGarmentsCount = await db.execute(sql`SELECT COUNT(*) as count FROM garments`);
      const rawMaterialsCount = await db.execute(sql`SELECT COUNT(*) as count FROM materials`);
      const rawGarmentsData = await db.execute(sql`SELECT * FROM garments LIMIT 2`);
      
      diagnostics.testOperations.rawSQL = {
        garmentsCount: rawGarmentsCount,
        materialsCount: rawMaterialsCount,
        garmentsData: rawGarmentsData,
        message: 'Raw SQL queries executed successfully'
      };
      
      console.log('✅ Raw SQL verification completed');
    } catch (error) {
      console.error('❌ Raw SQL queries failed:', error);
      diagnostics.testOperations.rawSQL = {
        error: String(error),
        message: 'Raw SQL queries failed'
      };
      diagnostics.errors.push(`Raw SQL queries failed: ${error}`);
    }

    // Test 8: Check for any table locks or constraints
    try {
      console.log('🔒 Checking for database locks and constraints...');
      
      const pragmaInfo = await db.execute(sql`PRAGMA database_list`);
      const foreignKeys = await db.execute(sql`PRAGMA foreign_keys`);
      const journalMode = await db.execute(sql`PRAGMA journal_mode`);
      
      diagnostics.testOperations.databaseConfig = {
        databases: pragmaInfo,
        foreignKeysEnabled: foreignKeys,
        journalMode: journalMode,
        message: 'Database configuration retrieved'
      };
      
      console.log('✅ Database configuration check completed');
    } catch (error) {
      console.error('❌ Database configuration check failed:', error);
      diagnostics.testOperations.databaseConfig = {
        error: String(error),
        message: 'Database configuration check failed'
      };
      diagnostics.errors.push(`Database config check failed: ${error}`);
    }

    // Summary
    diagnostics.summary = {
      totalTables: Object.keys(diagnostics.tableCounts).length,
      totalRecords: Object.values(diagnostics.tableCounts)
        .filter(count => typeof count === 'number')
        .reduce((sum: number, count: number) => sum + count, 0),
      errorCount: diagnostics.errors.length,
      connectionStatus: diagnostics.databaseConnection?.status || 'unknown',
      recommendedActions: []
    };

    // Add recommendations based on findings
    if (diagnostics.tableCounts.garments === 0) {
      diagnostics.summary.recommendedActions.push('Run database seeder to populate garments table');
    }
    
    if (diagnostics.tableCounts.materials === 0) {
      diagnostics.summary.recommendedActions.push('Run database seeder to populate materials table');
    }

    if (diagnostics.errors.length > 0) {
      diagnostics.summary.recommendedActions.push('Check database connection and schema integrity');
    }

    if (diagnostics.databaseConnection?.status !== 'success') {
      diagnostics.summary.recommendedActions.push('Verify database configuration and connection string');
    }

    console.log('🎯 Database debug diagnostics completed');
    console.log(`📊 Summary: ${diagnostics.summary.totalRecords} total records across ${diagnostics.summary.totalTables} tables`);
    console.log(`❗ Errors: ${diagnostics.summary.errorCount}`);

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('💥 Fatal error in debug endpoint:', error);
    return NextResponse.json({
      error: 'Fatal error in database debug',
      details: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}