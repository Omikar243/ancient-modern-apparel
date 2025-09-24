import { db } from '@/db';
import { materials } from '@/db/schema';

async function main() {
    const sampleMaterials = [
        {
            name: 'Khadi',
            origin: 'Various regions across India',
            description: 'Gandhi-era handspun cotton fabric symbolizing self-reliance and sustainability. This coarse-textured cotton promotes eco-friendly practices and represents India\'s freedom movement. Known for its breathable quality and natural texture, Khadi is hand-woven on traditional spinning wheels (charkhas) and supports rural artisans across the country.',
            textureType: 'cotton',
            authenticityRating: 9,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            name: 'Banarasi Silk',
            origin: 'Varanasi, Uttar Pradesh',
            description: 'Premium silk fabric from the holy city of Varanasi featuring intricate brocade weaving with metallic threads. This luxurious textile showcases elaborate patterns inspired by Mughal art and is traditionally worn for weddings and religious ceremonies. The gold and silver zari work creates stunning motifs of flowers, leaves, and geometric designs.',
            textureType: 'silk',
            authenticityRating: 10,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            name: 'Chanderi',
            origin: 'Chanderi, Madhya Pradesh',
            description: 'Lightweight silk-cotton blend fabric known for its sheer quality and traditional motifs. This textile has a rich history of royal patronage dating back to the 11th century. Chanderi features delicate gold and silver borders with characteristic transparency and lustrous texture, making it perfect for elegant sarees and formal wear.',
            textureType: 'silk-cotton blend',
            authenticityRating: 8,
            createdAt: new Date('2024-01-14').toISOString(),
            updatedAt: new Date('2024-01-14').toISOString(),
        },
        {
            name: 'Kanjeevaram Silk',
            origin: 'Kanchipuram, Tamil Nadu',
            description: 'Pure mulberry silk fabric with heavy gold zari work representing centuries-old South Indian weaving tradition. Known for temple-inspired designs featuring motifs of gods, goddesses, animals, and birds. The contrasting borders and rich pallu make Kanjeevaram sarees highly prized for weddings and festivals, with some pieces taking months to complete.',
            textureType: 'silk',
            authenticityRating: 10,
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-16').toISOString(),
        },
        {
            name: 'Bandhani',
            origin: 'Gujarat and Rajasthan (Kutch region)',
            description: 'Traditional tie-dye technique creating vibrant dot patterns through resist dyeing methods. This ancient craft involves tying small portions of fabric before dyeing, resulting in characteristic circular patterns. Bandhani fabrics feature brilliant colors like red, yellow, green, and blue, and are commonly used for turbans, sarees, and festive wear.',
            textureType: 'cotton',
            authenticityRating: 9,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            name: 'Jamdani',
            origin: 'Bengal (West Bengal and Bangladesh)',
            description: 'Fine muslin fabric featuring supplementary weft technique creating delicate floral and geometric motifs. This UNESCO-recognized craft produces semi-transparent textiles with intricate patterns woven directly into the fabric. Jamdani represents the pinnacle of handloom artistry with its ethereal quality and complex weaving process requiring exceptional skill.',
            textureType: 'muslin',
            authenticityRating: 9,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Patola',
            origin: 'Patan, Gujarat',
            description: 'Double ikat silk fabric featuring precise geometric patterns created through complex resist-dyeing technique. This royal heritage textile requires months of meticulous work with both warp and weft threads dyed before weaving. Patola sarees are among India\'s most expensive textiles, traditionally worn by royal families and featuring symbolic motifs representing prosperity and status.',
            textureType: 'silk',
            authenticityRating: 10,
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            name: 'Block Print Cotton',
            origin: 'Sanganer, Rajasthan',
            description: 'Hand-carved wooden block printing technique using natural dyes to create intricate patterns on cotton fabric. This artisan craft from Rajasthan involves skilled craftsmen who carve elaborate designs into wooden blocks and apply natural colors derived from plants and minerals. The resulting textiles feature vibrant floral and geometric patterns perfect for everyday wear and home textiles.',
            textureType: 'cotton',
            authenticityRating: 8,
            createdAt: new Date('2024-01-24').toISOString(),
            updatedAt: new Date('2024-01-24').toISOString(),
        }
    ];

    await db.insert(materials).values(sampleMaterials);
    
    console.log('✅ Materials seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});