import { db } from '@/db';
import { orders } from '@/db/schema';

async function main() {
    const sampleOrders = [
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            totalPrice: 95.00,
            status: 'delivered',
            invoiceNo: 'INV-20240115-143022-0001',
            createdAt: new Date('2024-01-15T14:30:22Z').toISOString(),
            updatedAt: new Date('2024-01-22T10:15:30Z').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            totalPrice: 175.00,
            status: 'shipped',
            invoiceNo: 'INV-20240118-091545-0002',
            createdAt: new Date('2024-01-18T09:15:45Z').toISOString(),
            updatedAt: new Date('2024-01-20T16:22:10Z').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            totalPrice: 285.00,
            status: 'delivered',
            invoiceNo: 'INV-20240125-162130-0003',
            createdAt: new Date('2024-01-25T16:21:30Z').toISOString(),
            updatedAt: new Date('2024-02-02T14:45:20Z').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            totalPrice: 220.00,
            status: 'processing',
            invoiceNo: 'INV-20240201-110845-0004',
            createdAt: new Date('2024-02-01T11:08:45Z').toISOString(),
            updatedAt: new Date('2024-02-03T09:30:15Z').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            totalPrice: 145.50,
            status: 'pending',
            invoiceNo: 'INV-20240208-145520-0005',
            createdAt: new Date('2024-02-08T14:55:20Z').toISOString(),
            updatedAt: new Date('2024-02-08T14:55:20Z').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            totalPrice: 385.00,
            status: 'processing',
            invoiceNo: 'INV-20240212-133015-0006',
            createdAt: new Date('2024-02-12T13:30:15Z').toISOString(),
            updatedAt: new Date('2024-02-14T11:20:40Z').toISOString(),
        }
    ];

    await db.insert(orders).values(sampleOrders);
    
    console.log('✅ Orders seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});