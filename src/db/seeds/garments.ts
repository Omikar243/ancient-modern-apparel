import { db } from '@/db';
import { garments } from '@/db/schema';

async function main() {
    const sampleGarments = [
        {
            name: 'Banarasi Saree',
            type: 'saree',
            description: 'Traditional silk saree with gold zari work from Varanasi, heritage piece with intricate brocade patterns. This exquisite handwoven masterpiece represents centuries of weaving tradition from the holy city of Varanasi. Crafted by master artisans using pure silk threads and genuine gold zari, featuring traditional motifs inspired by Mughal architecture and Hindu mythology.',
            imageUrl: '/images/garments/banarasi-saree.jpg',
            price: 250.00,
            category: 'women',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            name: 'Kanjeevaram Saree',
            type: 'saree',
            description: 'Pure silk saree from Tamil Nadu with temple border design, heavy gold zari, wedding wear. A testament to South Indian craftsmanship, this Kanjeevaram saree features the iconic temple border with traditional peacock and paisley motifs. Woven with contrasting colors and heavy gold zari work, making it the perfect choice for weddings and special ceremonies.',
            imageUrl: '/images/garments/kanjeevaram-saree.jpg',
            price: 300.00,
            category: 'women',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            name: 'Chanderi Saree',
            type: 'saree',
            description: 'Lightweight silk-cotton blend from Madhya Pradesh, sheer texture with subtle motifs. Known for its gossamer texture and lustrous finish, this Chanderi saree combines traditional weaving techniques with contemporary aesthetics. The unique silk-cotton blend creates a beautiful drape with delicate butis and geometric patterns woven throughout.',
            imageUrl: '/images/garments/chanderi-saree.jpg',
            price: 150.00,
            category: 'women',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Cotton Saree',
            type: 'saree',
            description: 'Plain handwoven cotton saree, everyday wear, breathable fabric, simple border design. This comfortable cotton saree embodies the essence of Indian daily wear with its soft, breathable texture and timeless appeal. Handwoven by rural artisans, featuring a classic border design that complements both traditional and contemporary styling.',
            imageUrl: '/images/garments/cotton-saree.jpg',
            price: 100.00,
            category: 'women',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            name: 'Cotton Dhoti',
            type: 'dhoti',
            description: 'Traditional white cotton dhoti, handwoven, ceremonial wear, comfortable drape. This pristine white dhoti represents the purest form of Indian traditional menswear. Handwoven from fine cotton threads using age-old techniques, it offers the perfect balance of comfort and cultural authenticity for religious ceremonies and traditional functions.',
            imageUrl: '/images/garments/cotton-dhoti.jpg',
            price: 50.00,
            category: 'men',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Silk Kurta',
            type: 'kurta',
            description: 'Pure silk kurta with mandarin collar, festive wear, rich texture, embroidered neckline. This elegant silk kurta showcases the perfect fusion of traditional silhouette and contemporary detailing. The rich silk fabric drapes beautifully while the intricate embroidery around the mandarin collar adds a touch of sophistication for festive occasions.',
            imageUrl: '/images/garments/silk-kurta.jpg',
            price: 150.00,
            category: 'men',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            name: 'Embroidered Sherwani',
            type: 'sherwani',
            description: 'Wedding sherwani with intricate thread work, royal blue color, formal occasion wear. This regal sherwani exemplifies the grandeur of Indian formal wear with its sophisticated royal blue hue and elaborate embroidery. Crafted for the modern groom, it features traditional Chikankari-style threadwork combined with contemporary tailoring for the perfect wedding ensemble.',
            imageUrl: '/images/garments/embroidered-sherwani.jpg',
            price: 200.00,
            category: 'men',
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            name: 'Bridal Lehenga',
            type: 'lehenga',
            description: 'Heavy embroidered lehenga with sequins and zari work, red color, wedding attire. This magnificent bridal lehenga is a masterpiece of Indian couture, featuring layers of rich red silk adorned with intricate embroidery, sequins, and gold zari work. Every stitch tells a story of celebration, making it the perfect choice for the most important day of a bride\'s life.',
            imageUrl: '/images/garments/bridal-lehenga.jpg',
            price: 500.00,
            category: 'women',
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            name: 'Party Anarkali',
            type: 'anarkali',
            description: 'Floor-length anarkali suit with mirror work, georgette fabric, party wear. This stunning floor-length anarkali captures the essence of Mughal elegance with its flowing silhouette and sparkling mirror work. Made from lightweight georgette fabric, it moves gracefully with every step, making it perfect for parties and special celebrations.',
            imageUrl: '/images/garments/party-anarkali.jpg',
            price: 300.00,
            category: 'women',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            name: 'Casual Salwar',
            type: 'salwar',
            description: 'Cotton salwar kameez set, printed fabric, daily wear, comfortable fit. This comfortable salwar kameez set is designed for the modern Indian woman who values both style and comfort. Made from soft cotton with beautiful traditional prints, it offers the perfect blend of cultural heritage and contemporary practicality for everyday wear.',
            imageUrl: '/images/garments/casual-salwar.jpg',
            price: 150.00,
            category: 'women',
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        },
        {
            name: 'Mini Kurta',
            type: 'kurta',
            description: 'Cotton kurta for boys, festive wear, comfortable, traditional collar. This adorable mini kurta introduces young ones to the beauty of Indian traditional wear. Crafted from soft cotton with a classic collar design, it ensures comfort while maintaining the authentic look of traditional menswear, perfect for festivals and family celebrations.',
            imageUrl: '/images/garments/mini-kurta.jpg',
            price: 50.00,
            category: 'kids',
            createdAt: new Date('2024-02-08').toISOString(),
            updatedAt: new Date('2024-02-08').toISOString(),
        },
        {
            name: 'Frock Saree',
            type: 'frock',
            description: 'Pre-stitched saree style dress for girls, party wear, colorful print. This delightful frock saree combines the elegance of traditional saree draping with the convenience of modern children\'s wear. Featuring vibrant colors and playful prints, it allows young girls to experience the joy of wearing traditional Indian attire with ease and comfort.',
            imageUrl: '/images/garments/frock-saree.jpg',
            price: 80.00,
            category: 'kids',
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        }
    ];

    await db.insert(garments).values(sampleGarments);
    
    console.log('✅ Garments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});