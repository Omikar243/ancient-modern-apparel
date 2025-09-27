import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { garments, materials, user, designs, userAvatars, orders, avatars } from '@/db/schema';
import { sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const summary: any = {
      timestamp: new Date().toISOString(),
      diagnostic: {
        garments: {},
        materials: {},
        authentication: {},
        other_tables: {}
      },
      findings: [],
      recommendations: []
    };

    // Test 1: Check garments table
    try {
      const garmentsCount = await db.select({ count: count() }).from(garments);
      summary.diagnostic.garments.count = garmentsCount[0].count;

      if (garmentsCount[0].count > 0) {
        const sampleGarments = await db.select().from(garments).limit(3);
        summary.diagnostic.garments.sample_records = sampleGarments;
        summary.diagnostic.garments.status = 'populated';
      } else {
        summary.diagnostic.garments.status = 'empty';
        summary.findings.push('Garments table exists but is empty');
      }
    } catch (error) {
      summary.diagnostic.garments.error = error.message;
      summary.diagnostic.garments.status = 'error';
      summary.findings.push(`Garments table error: ${error.message}`);
    }

    // Test 2: Check materials table
    try {
      const materialsCount = await db.select({ count: count() }).from(materials);
      summary.diagnostic.materials.count = materialsCount[0].count;

      if (materialsCount[0].count > 0) {
        const sampleMaterials = await db.select().from(materials).limit(3);
        summary.diagnostic.materials.sample_records = sampleMaterials;
        summary.diagnostic.materials.status = 'populated';
      } else {
        summary.diagnostic.materials.status = 'empty';
        summary.findings.push('Materials table exists but is empty');
      }
    } catch (error) {
      summary.diagnostic.materials.error = error.message;
      summary.diagnostic.materials.status = 'error';
      summary.findings.push(`Materials table error: ${error.message}`);
    }

    // Test 3: Check authentication tables
    try {
      const userCount = await db.select({ count: count() }).from(user);
      summary.diagnostic.authentication.user_count = userCount[0].count;
      summary.diagnostic.authentication.status = userCount[0].count > 0 ? 'populated' : 'empty';
    } catch (error) {
      summary.diagnostic.authentication.error = error.message;
      summary.diagnostic.authentication.status = 'error';
    }

    // Test 4: Check other application tables
    const otherTables = [
      { name: 'designs', table: designs },
      { name: 'userAvatars', table: userAvatars },
      { name: 'orders', table: orders },
      { name: 'avatars', table: avatars }
    ];

    for (const { name, table } of otherTables) {
      try {
        const tableCount = await db.select({ count: count() }).from(table);
        summary.diagnostic.other_tables[name] = {
          count: tableCount[0].count,
          status: tableCount[0].count > 0 ? 'populated' : 'empty'
        };
      } catch (error) {
        summary.diagnostic.other_tables[name] = {
          error: error.message,
          status: 'error'
        };
      }
    }

    // Test 5: Direct database inspection
    try {
      const tablesQuery = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
      summary.diagnostic.database_tables = tablesQuery;
    } catch (error) {
      summary.diagnostic.database_inspection_error = error.message;
    }

    // Test 6: Test raw SQL to check if data exists but isn't visible
    try {
      const rawGarmentsCount = await db.run(sql`SELECT COUNT(*) as count FROM garments`);
      summary.diagnostic.raw_queries = {
        garments_count: rawGarmentsCount,
      };

      try {
        const rawMaterialsCount = await db.run(sql`SELECT COUNT(*) as count FROM materials`);
        summary.diagnostic.raw_queries.materials_count = rawMaterialsCount;
      } catch (error) {
        summary.diagnostic.raw_queries.materials_error = error.message;
      }
    } catch (error) {
      summary.diagnostic.raw_queries = { error: error.message };
    }

    // Analysis and Recommendations
    const hasGarments = summary.diagnostic.garments.count > 0;
    const hasMaterials = summary.diagnostic.materials.count > 0;
    const hasUsers = summary.diagnostic.authentication.user_count > 0;

    if (!hasGarments && !hasMaterials) {
      summary.findings.push('Both garments and materials tables are empty - seeder data not inserted');
      summary.recommendations.push('Run database seeder to populate garments and materials tables');
      summary.recommendations.push('Check if seeder files exist and contain proper data');
      summary.recommendations.push('Verify database connection and write permissions');
    }

    if (!hasGarments && hasMaterials) {
      summary.findings.push('Materials populated but garments empty - partial seeder execution');
      summary.recommendations.push('Re-run garments seeder specifically');
    }

    if (hasGarments && !hasMaterials) {
      summary.findings.push('Garments populated but materials empty - partial seeder execution');
      summary.recommendations.push('Re-run materials seeder specifically');
    }

    if (hasGarments && hasMaterials) {
      summary.findings.push('Both core tables are populated successfully');
      summary.recommendations.push('Database is ready for API operations');
      summary.recommendations.push('Test individual API endpoints for proper functionality');
    }

    if (!hasUsers) {
      summary.findings.push('No users exist - authentication system needs setup');
      summary.recommendations.push('Create test user accounts for API testing');
    }

    // Check for any errors
    const hasErrors = summary.diagnostic.garments.status === 'error' || 
                     summary.diagnostic.materials.status === 'error' ||
                     summary.diagnostic.authentication.status === 'error';

    if (hasErrors) {
      summary.findings.push('Database connection or schema issues detected');
      summary.recommendations.push('Check database connection configuration');
      summary.recommendations.push('Verify schema migration was successful');
      summary.recommendations.push('Check database file permissions and location');
    }

    // Final status assessment
    if (hasGarments && hasMaterials && !hasErrors) {
      summary.overall_status = 'healthy';
      summary.status_message = 'Database is properly configured and populated';
    } else if (hasErrors) {
      summary.overall_status = 'error';
      summary.status_message = 'Database connection or configuration issues';
    } else {
      summary.overall_status = 'needs_seeding';
      summary.status_message = 'Database schema exists but tables need to be populated';
    }

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Database summary error:', error);
    
    return NextResponse.json({
      error: 'Critical database error during diagnosis',
      details: error.message,
      timestamp: new Date().toISOString(),
      recommendations: [
        'Check database connection configuration',
        'Verify database file exists and is accessible',
        'Check Drizzle ORM configuration',
        'Verify schema migrations have been run'
      ]
    }, { status: 500 });
  }
}