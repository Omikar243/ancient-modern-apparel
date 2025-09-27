import { db } from '@/db';
import { garments } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    try {
        console.log('🔍 Starting diagnostic seeder for garments table...');
        
        // Step 1: Test database connection
        console.log('📡 Testing database connection...');
        
        // Step 2: Test simple SELECT query
        console.log('📊 Querying existing records...');
        const existing = await db.select().from(garments);
        console.log(`✅ Found ${existing.length} existing garment records`);
        
        // Step 3: Create minimal test garment with all required fields
        console.log('🧵 Preparing test garment data...');
        const testGarment = {
            name: 'Test Debug Garment',
            type: 'test',
            description: 'Minimal test garment for database diagnostics',
            imageUrl: '/test/debug-garment.jpg',
            price: 99.99,
            category: 'test',
            measurements: JSON.stringify({ chest: 40, waist: 32, length: 28 }),
            qualityRating: 8,
            history: 'This is a test garment created for debugging database operations.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        // Step 4: Check if test record already exists
        console.log('🔍 Checking for existing test record...');
        const existingTest = await db.select().from(garments).where(eq(garments.name, 'Test Debug Garment'));
        
        if (existingTest.length > 0) {
            console.log('⚠️ Test record already exists, skipping insert');
            console.log('📋 Existing test record:', existingTest[0]);
        } else {
            // Step 5: Attempt INSERT with proper Drizzle syntax
            console.log('💾 Inserting test garment...');
            await db.insert(garments).values(testGarment);
            console.log('✅ Test garment inserted successfully');
            
            // Step 6: Verify insertion by selecting the record back
            console.log('🔍 Verifying insertion...');
            const insertedRecord = await db.select().from(garments).where(eq(garments.name, 'Test Debug Garment'));
            
            if (insertedRecord.length > 0) {
                console.log('✅ Insertion verified successfully');
                console.log('📋 Inserted record details:', {
                    id: insertedRecord[0].id,
                    name: insertedRecord[0].name,
                    type: insertedRecord[0].type,
                    price: insertedRecord[0].price,
                    category: insertedRecord[0].category
                });
            } else {
                console.log('❌ Insertion verification failed - record not found');
            }
        }
        
        // Step 7: Final count check
        console.log('📊 Final record count check...');
        const finalCount = await db.select().from(garments);
        console.log(`📈 Total garment records: ${finalCount.length}`);
        
        console.log('✅ Diagnostic seeder completed successfully');
        
    } catch (error) {
        console.error('❌ Diagnostic seeder failed with error:');
        
        // Step 8: Specific error type detection
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            if (error.message.includes('SQLITE_ERROR')) {
                console.error('🗄️ SQLite database error detected');
            } else if (error.message.includes('no such table')) {
                console.error('📋 Table does not exist error');
            } else if (error.message.includes('UNIQUE constraint')) {
                console.error('🔒 Unique constraint violation');
            } else if (error.message.includes('NOT NULL constraint')) {
                console.error('⚠️ Required field missing');
            } else if (error.message.includes('connection')) {
                console.error('📡 Database connection error');
            } else {
                console.error('❓ Unknown error type');
            }
        } else {
            console.error('❓ Non-Error object thrown:', error);
        }
        
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder execution failed:', error);
    process.exit(1);
});