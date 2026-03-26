// @ts-nocheck
import { db } from '@/db';
import { garments } from '@/db/schema';

async function main() {
    console.log('🔍 Starting diagnostic seeder for garments table...');
    
    try {
        console.log('📊 Testing database connection...');
        console.log('Database object type:', typeof db);
        console.log('Garments table imported successfully');
        
        console.log('📖 Reading existing garments data...');
        const existing = await db.select().from(garments);
        console.log(`📈 Found ${existing.length} existing garments in database`);
        
        if (existing.length > 0) {
            console.log('🔍 Sample of existing data:');
            console.log('First record ID:', existing[0].id);
            console.log('First record name:', existing[0].name);
            console.log('First record category:', existing[0].category);
        }
        
        console.log('🧪 Testing single INSERT operation...');
        const testGarment = {
            name: 'Test Debug Garment',
            type: 'test',
            category: 'debug',
            price: 1.00,
            description: 'Debug test garment',
            qualityRating: 5,
            history: 'Debug test',
            measurements: '{"test": true}',
            imageUrl: '/test.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        console.log('📝 Inserting test garment with data:', JSON.stringify(testGarment, null, 2));
        const insertResult = await db.insert(garments).values(testGarment);
        console.log('✅ INSERT operation completed');
        console.log('Insert result:', insertResult);
        
        console.log('🔍 Verifying inserted record...');
        const verifyRecord = await db.select().from(garments).where(garments.name = 'Test Debug Garment');
        
        if (verifyRecord.length > 0) {
            console.log('✅ Record successfully inserted and verified');
            console.log('Verified record ID:', verifyRecord[0].id);
            console.log('Verified record name:', verifyRecord[0].name);
            console.log('Verified record type:', verifyRecord[0].type);
            console.log('Verified record category:', verifyRecord[0].category);
            console.log('Verified record price:', verifyRecord[0].price);
            console.log('Verified record measurements:', verifyRecord[0].measurements);
        } else {
            console.log('❌ Record not found after insertion - potential issue');
        }
        
        console.log('📊 Final database state...');
        const finalCount = await db.select().from(garments);
        console.log(`📈 Total garments in database: ${finalCount.length}`);
        
        console.log('🔍 Schema accessibility test completed successfully');
        console.log('✅ All diagnostic tests passed - database and schema are working correctly');
        
    } catch (error) {
        console.error('❌ Diagnostic seeder failed at step:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.message.includes('no such table')) {
            console.error('🚨 TABLE NOT FOUND: The garments table does not exist in the database');
            console.error('💡 Suggestion: Run database migrations first');
        }
        
        if (error.message.includes('FOREIGN KEY')) {
            console.error('🚨 FOREIGN KEY CONSTRAINT: There may be referential integrity issues');
            console.error('💡 Suggestion: Check foreign key relationships and referenced tables');
        }
        
        if (error.message.includes('UNIQUE')) {
            console.error('🚨 UNIQUE CONSTRAINT: Duplicate value detected');
            console.error('💡 Suggestion: Check for existing records with same unique values');
        }
        
        if (error.message.includes('NOT NULL')) {
            console.error('🚨 NOT NULL CONSTRAINT: Required field is missing');
            console.error('💡 Suggestion: Ensure all required fields are provided');
        }
        
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Diagnostic seeder failed:', error);
    process.exit(1);
});