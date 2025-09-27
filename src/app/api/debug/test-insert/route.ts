import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { garments } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Test endpoint for debugging garments table insertions
export async function POST(request: NextRequest) {
  try {
    console.log('=== GARMENTS TABLE INSERT DEBUG TEST ===');
    
    // Test 1: Show current schema structure
    console.log('Testing garments table schema...');
    
    // Get existing records count
    const existingRecords = await db.select().from(garments);
    console.log(`Current records in garments table: ${existingRecords.length}`);
    
    // Test 2: Minimal required fields test
    console.log('\n--- Test 2: Minimal Required Fields ---');
    
    const minimalGarment = {
      name: 'Test Garment Debug',
      type: 'test',
      price: 99.99,
      category: 'debug',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Attempting to insert minimal garment:', minimalGarment);
    
    try {
      const minimalResult = await db.insert(garments)
        .values(minimalGarment)
        .returning();
      
      console.log('✅ Minimal insert SUCCESS:', minimalResult[0]);
    } catch (minimalError) {
      console.error('❌ Minimal insert FAILED:', minimalError);
      console.error('Error details:', {
        message: minimalError.message,
        code: minimalError.code,
        stack: minimalError.stack
      });
    }
    
    // Test 3: All fields test
    console.log('\n--- Test 3: All Fields Test ---');
    
    const fullGarment = {
      name: 'Full Test Garment',
      type: 'comprehensive',
      description: 'Complete test garment with all fields',
      imageUrl: '/test/image.jpg',
      price: 199.99,
      category: 'test',
      measurements: JSON.stringify({"chest": 40, "waist": 32}),
      qualityRating: 8,
      history: 'Test garment history for debugging purposes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Attempting to insert full garment:', fullGarment);
    
    try {
      const fullResult = await db.insert(garments)
        .values(fullGarment)
        .returning();
      
      console.log('✅ Full insert SUCCESS:', fullResult[0]);
    } catch (fullError) {
      console.error('❌ Full insert FAILED:', fullError);
      console.error('Error details:', {
        message: fullError.message,
        code: fullError.code,
        stack: fullError.stack
      });
    }
    
    // Test 4: Field-by-field testing
    console.log('\n--- Test 4: Field-by-Field Testing ---');
    
    const testFields = [
      { name: 'Test Name Only', type: 'test', price: 1.0, category: 'test' },
      { name: 'Test With Description', type: 'test', description: 'Test desc', price: 2.0, category: 'test' },
      { name: 'Test With Image', type: 'test', imageUrl: '/test.jpg', price: 3.0, category: 'test' },
      { name: 'Test With Measurements', type: 'test', measurements: '{"test": "value"}', price: 4.0, category: 'test' },
      { name: 'Test With Rating', type: 'test', qualityRating: 5, price: 5.0, category: 'test' },
      { name: 'Test With History', type: 'test', history: 'Test history', price: 6.0, category: 'test' }
    ];
    
    const fieldTestResults = [];
    
    for (let i = 0; i < testFields.length; i++) {
      const testData = {
        ...testFields[i],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Testing field combination ${i + 1}:`, testData);
      
      try {
        const result = await db.insert(garments)
          .values(testData)
          .returning();
        
        console.log(`✅ Field test ${i + 1} SUCCESS:`, result[0]);
        fieldTestResults.push({ test: i + 1, status: 'SUCCESS', data: result[0] });
      } catch (error) {
        console.error(`❌ Field test ${i + 1} FAILED:`, error);
        fieldTestResults.push({ 
          test: i + 1, 
          status: 'FAILED', 
          error: {
            message: error.message,
            code: error.code
          }
        });
      }
    }
    
    // Test 5: JSON field testing
    console.log('\n--- Test 5: JSON Field Testing ---');
    
    const jsonTests = [
      { measurements: null },
      { measurements: '{}' },
      { measurements: '{"chest": 40}' },
      { measurements: JSON.stringify({"chest": 40, "waist": 32}) }
    ];
    
    const jsonTestResults = [];
    
    for (let i = 0; i < jsonTests.length; i++) {
      const testData = {
        name: `JSON Test ${i + 1}`,
        type: 'json-test',
        price: 10.0 + i,
        category: 'test',
        ...jsonTests[i],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Testing JSON field ${i + 1}:`, testData);
      
      try {
        const result = await db.insert(garments)
          .values(testData)
          .returning();
        
        console.log(`✅ JSON test ${i + 1} SUCCESS:`, result[0]);
        jsonTestResults.push({ test: i + 1, status: 'SUCCESS', data: result[0] });
      } catch (error) {
        console.error(`❌ JSON test ${i + 1} FAILED:`, error);
        jsonTestResults.push({ 
          test: i + 1, 
          status: 'FAILED', 
          error: {
            message: error.message,
            code: error.code
          }
        });
      }
    }
    
    // Final results summary
    const finalCount = await db.select().from(garments);
    console.log(`\nFinal record count: ${finalCount.length}`);
    console.log(`Records added during test: ${finalCount.length - existingRecords.length}`);
    
    return NextResponse.json({
      success: true,
      message: 'Debug test completed',
      results: {
        initialRecordCount: existingRecords.length,
        finalRecordCount: finalCount.length,
        recordsAdded: finalCount.length - existingRecords.length,
        fieldTestResults,
        jsonTestResults,
        schemaInfo: {
          tableName: 'garments',
          columns: {
            id: 'integer PRIMARY KEY (auto-increment)',
            name: 'text NOT NULL',
            type: 'text NOT NULL', 
            description: 'text (nullable)',
            imageUrl: 'text (nullable)',
            price: 'real NOT NULL',
            category: 'text NOT NULL',
            measurements: 'text JSON mode (nullable)',
            qualityRating: 'integer (nullable)',
            history: 'text (nullable)',
            createdAt: 'text NOT NULL',
            updatedAt: 'text NOT NULL'
          }
        }
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in debug test:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Debug test failed with critical error',
      details: {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      }
    }, { status: 500 });
  }
}

// GET method to check current table state
export async function GET(request: NextRequest) {
  try {
    const records = await db.select().from(garments);
    
    return NextResponse.json({
      success: true,
      recordCount: records.length,
      records: records.map(record => ({
        id: record.id,
        name: record.name,
        type: record.type,
        category: record.category,
        price: record.price,
        hasDescription: !!record.description,
        hasImage: !!record.imageUrl,
        hasMeasurements: !!record.measurements,
        hasQualityRating: record.qualityRating !== null,
        hasHistory: !!record.history,
        createdAt: record.createdAt
      })),
      schema: {
        requiredFields: ['name', 'type', 'price', 'category', 'createdAt', 'updatedAt'],
        optionalFields: ['description', 'imageUrl', 'measurements', 'qualityRating', 'history'],
        jsonFields: ['measurements']
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve garments data',
      details: {
        message: error.message,
        code: error.code
      }
    }, { status: 500 });
  }
}

// DELETE method to clean up test records
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cleanup = url.searchParams.get('cleanup');
    
    if (cleanup === 'test') {
      // Delete test records
      const testRecords = await db.select()
        .from(garments)
        .where(eq(garments.category, 'test'));
      
      if (testRecords.length > 0) {
        const deleted = await db.delete(garments)
          .where(eq(garments.category, 'test'))
          .returning();
        
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${deleted.length} test records`,
          deletedRecords: deleted.map(r => ({ id: r.id, name: r.name }))
        }, { status: 200 });
      } else {
        return NextResponse.json({
          success: true,
          message: 'No test records found to clean up'
        }, { status: 200 });
      }
    }
    
    return NextResponse.json({
      error: 'Invalid cleanup parameter. Use ?cleanup=test'
    }, { status: 400 });
    
  } catch (error) {
    console.error('DELETE error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to clean up test records',
      details: {
        message: error.message,
        code: error.code
      }
    }, { status: 500 });
  }
}