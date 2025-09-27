import { db } from '@/db';
import { materials } from '@/db/schema';

async function main() {
    // Clear existing data first
    await db.delete(materials);

    const indianTextileMaterials = [
        {
            name: 'Banarasi Silk',
            origin: 'Varanasi',
            gsm: 180,
            stretch: 0.02,
            drape: 0.85,
            colors: JSON.stringify(['#8B0000', '#FFD700', '#DC143C', '#B8860B', '#800080', '#FF6347']),
            textureUrl: '/api/placeholder/400/400?text=Banarasi%20Silk%20Texture',
            careInstructions: 'Dry clean only. Store in muslin cloth. Avoid direct sunlight. Iron on low heat with cloth barrier.',
            artisanOrigin: 'Crafted by master weavers of Varanasi who have passed down the intricate art of brocade weaving through generations. The Banarasi silk tradition dates back to the Mughal era when Persian motifs were first woven into Indian silk. These skilled artisans, known as Ustads, spend months creating each masterpiece using traditional pit looms, incorporating real gold and silver threads to create the signature metallic sheen that makes Banarasi silk the fabric of choice for Indian bridal wear.',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        }
    ];

    await db.insert(materials).values(indianTextileMaterials[0]);

    const chanderiCotton = {
        name: 'Chanderi Cotton',
        origin: 'Madhya Pradesh',
        gsm: 120,
        stretch: 0.15,
        drape: 0.75,
        colors: JSON.stringify(['#F5F5DC', '#E6E6FA', '#FFE4E1', '#F0F8FF', '#FFFAF0', '#F8F8FF']),
        textureUrl: '/api/placeholder/400/400?text=Chanderi%20Cotton%20Texture',
        careInstructions: 'Hand wash in cold water with mild detergent. Air dry in shade. Iron on medium heat while slightly damp.',
        artisanOrigin: 'Woven by the hereditary weaving communities of Chanderi town in Madhya Pradesh, this textile art form has been practiced for over 700 years. The Koshti weavers, originally brought to the region by the Bundela Rajputs, have perfected the technique of creating sheer, lightweight fabrics with distinctive coin motifs and floral patterns. These artisans use traditional handlooms and continue to employ time-honored techniques, creating fabrics that are both delicate and durable, embodying the essence of Indian craftsmanship.',
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString(),
    };

    await db.insert(materials).values(chanderiCotton);

    const kanjeevaramSilk = {
        name: 'Kanjeevaram Silk',
        origin: 'Tamil Nadu',
        gsm: 200,
        stretch: 0.01,
        drape: 0.90,
        colors: JSON.stringify(['#8B4513', '#FFD700', '#800080', '#228B22', '#FF4500', '#4169E1']),
        textureUrl: '/api/placeholder/400/400?text=Kanjeevaram%20Silk%20Texture',
        careInstructions: 'Dry clean only. Store folded with acid-free tissue paper. Avoid moth balls. Air occasionally in shade.',
        artisanOrigin: 'Created by the master weavers of Kanchipuram, the silk city of Tamil Nadu, where weaving traditions have flourished for over 400 years. These artisans, descended from sage Markanda, are considered the guardians of South Indian silk weaving heritage. Using pure mulberry silk and genuine gold thread (zari), they create sarees that are often passed down as family heirlooms. The weaving process involves intricate mathematical calculations to achieve perfect symmetry in the temple-inspired motifs that adorn these legendary fabrics.',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
    };

    await db.insert(materials).values(kanjeevaramSilk);

    const khadiCotton = {
        name: 'Khadi Cotton',
        origin: 'Gujarat',
        gsm: 140,
        stretch: 0.20,
        drape: 0.65,
        colors: JSON.stringify(['#FFFFF0', '#F5F5F5', '#FDF5E6', '#FAF0E6', '#FFEFD5', '#FFF8DC']),
        textureUrl: '/api/placeholder/400/400?text=Khadi%20Cotton%20Texture',
        careInstructions: 'Machine wash in cold water. Natural fiber may shrink slightly. Iron while damp for best results. Becomes softer with each wash.',
        artisanOrigin: 'Hand-spun and woven by rural artisans across Gujarat, Khadi represents the heart of Indian independence movement and sustainable fashion. These spinning wheel (charkha) artisans, trained in Gandhian principles of self-reliance, create fabric that embodies the spirit of swadeshi. Each thread is spun by hand, giving Khadi its characteristic irregular texture and breathable quality. The weavers, often working from their homes, maintain a tradition that supports rural livelihoods while creating eco-friendly textiles.',
        createdAt: new Date('2024-01-18').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString(),
    };

    await db.insert(materials).values(khadiCotton);

    const paithaniSilk = {
        name: 'Paithani Silk',
        origin: 'Maharashtra',
        gsm: 190,
        stretch: 0.03,
        drape: 0.88,
        colors: JSON.stringify(['#800080', '#FFD700', '#228B22', '#DC143C', '#FF8C00', '#4B0082']),
        textureUrl: '/api/placeholder/400/400?text=Paithani%20Silk%20Texture',
        careInstructions: 'Dry clean only. Store in cotton cloth bags. Avoid plastic storage. Keep away from direct sunlight and moisture.',
        artisanOrigin: 'Handcrafted by the master weavers of Paithan in Maharashtra, this ancient art form dates back to the Satavahana dynasty over 2000 years ago. The Paithani weavers, known as Paithanikar, are custodians of a unique tapestry technique where silk threads are hand-woven with real gold threads. These skilled artisans create the famous peacock and lotus motifs using a traditional technique called "kadiyal" border weaving, where the border design is woven separately and then joined to the main fabric with mathematical precision.',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
    };

    await db.insert(materials).values(paithaniSilk);

    const mugaSilk = {
        name: 'Muga Silk',
        origin: 'Assam',
        gsm: 160,
        stretch: 0.05,
        drape: 0.80,
        colors: JSON.stringify(['#DAA520', '#B8860B', '#CD853F', '#DEB887', '#F4A460', '#D2691E']),
        textureUrl: '/api/placeholder/400/400?text=Muga%20Silk%20Texture',
        careInstructions: 'Dry clean preferred. If hand washing, use cold water and mild soap. Air dry in shade. Improves with age.',
        artisanOrigin: 'Produced exclusively by the indigenous communities of Assam who have mastered the art of rearing the rare golden silkworm (Antheraea assamensis) found only in the Brahmaputra valley. These traditional sericulturists, including the Ahom and other tribal communities, have protected this unique species for over 1000 years. The silk is known for its natural golden color and durability - Muga garments are said to outlast the wearer. The entire process from cocoon rearing to weaving is done using age-old techniques passed down through generations.',
        createdAt: new Date('2024-01-22').toISOString(),
        updatedAt: new Date('2024-01-22').toISOString(),
    };

    await db.insert(materials).values(mugaSilk);

    const bandhaniCotton = {
        name: 'Bandhani Cotton',
        origin: 'Gujarat',
        gsm: 130,
        stretch: 0.18,
        drape: 0.70,
        colors: JSON.stringify(['#FF1493', '#FF6347', '#32CD32', '#FFD700', '#FF4500', '#8A2BE2']),
        textureUrl: '/api/placeholder/400/400?text=Bandhani%20Cotton%20Texture',
        careInstructions: 'First wash separately in cold water. Colors may bleed initially. Hand wash preferred. Iron on reverse side.',
        artisanOrigin: 'Created by the Khatri community artisans of Kutch and Saurashtra regions in Gujarat, who have perfected the ancient tie-dye technique of Bandhani for over 5000 years. These skilled craftspeople, particularly women artisans, create thousands of tiny knots on fabric using fingernails, then dye the cloth to create intricate patterns. Each Bandhani piece requires months of meticulous work, with some sarees containing over 100,000 individually tied dots. The patterns often tell stories of local folklore and carry cultural significance.',
        createdAt: new Date('2024-01-25').toISOString(),
        updatedAt: new Date('2024-01-25').toISOString(),
    };

    await db.insert(materials).values(bandhaniCotton);

    const tussarSilk = {
        name: 'Tussar Silk',
        origin: 'Jharkhand',
        gsm: 150,
        stretch: 0.08,
        drape: 0.78,
        colors: JSON.stringify(['#DEB887', '#D2691E', '#CD853F', '#F4A460', '#DAA520', '#BC8F8F']),
        textureUrl: '/api/placeholder/400/400?text=Tussar%20Silk%20Texture',
        careInstructions: 'Dry clean recommended. Hand wash in cold water if needed. Do not wring. Iron on low heat with pressing cloth.',
        artisanOrigin: 'Handwoven by tribal communities in the forests of Jharkhand, particularly the Santhal and Oraon tribes who have sustainably harvested wild silkworms for centuries. These forest-dwelling artisans collect cocoons from Antheraea mylitta silkworms that feed on Arjun, Sal, and Oak trees. The natural golden-beige color comes from the silkworms diet of wild leaves. The entire process from cocoon collection to spinning and weaving is done using traditional methods that have minimal environmental impact, making Tussar silk one of the most sustainable luxury fabrics in the world.',
        createdAt: new Date('2024-01-28').toISOString(),
        updatedAt: new Date('2024-01-28').toISOString(),
    };

    await db.insert(materials).values(tussarSilk);

    console.log('✅ Indian textile materials seeder completed successfully - 8 materials inserted');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});