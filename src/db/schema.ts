import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const designs = sqliteTable('designs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  avatarMeasurements: text('avatar_measurements', { mode: 'json' }).notNull(),
  photoUrls: text('photo_urls', { mode: 'json' }).notNull(),
  designData: text('design_data', { mode: 'json' }).default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const garments = sqliteTable('garments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  price: real('price').notNull(),
  category: text('category').notNull(),
  measurements: text('measurements', { mode: 'json' }),
  qualityRating: integer('quality_rating'),
  history: text('history'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const materials = sqliteTable('materials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  origin: text('origin').notNull(),
  gsm: integer('gsm').notNull(),
  stretch: real('stretch').notNull(),
  drape: real('drape').notNull(),
  colors: text('colors', { mode: 'json' }).notNull(),
  textureUrl: text('texture_url').notNull(),
  careInstructions: text('care_instructions').notNull(),
  artisanOrigin: text('artisan_origin').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userAvatars = sqliteTable('user_avatars', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  measurements: text('measurements', { mode: 'json' }).notNull(),
  photos: text('photos', { mode: 'json' }).notNull(),
  unitPreference: text('unit_preference').notNull().default('cm'),
  updatedAt: text('updated_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  totalPrice: real('total_price').notNull(),
  status: text('status').notNull().default('pending'),
  invoiceNo: text('invoice_no').notNull().unique(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const avatars = sqliteTable('avatars', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  measurements: text('measurements', { mode: 'json' }).notNull(),
  fittedModelUrl: text('fitted_model_url'),
  createdAt: text('created_at').notNull(),
});

// Manually insert sample data directly into garments table during schema setup
const sampleGarmentsData = [
    {
        name: 'Fusion Anarkali Dress',
        type: 'dress',
        description: 'Elegant fusion anarkali dress with contemporary cuts and traditional embroidery',
        imageUrl: '/api/placeholder/300/400?text=Fusion%20Anarkali%20Dress',
        price: 299.99,
        category: 'women',
        measurements: '{"bust":36,"waist":28,"hips":38,"length":50}',
        qualityRating: 9,
        history: 'The Anarkali dress originated from the Mughal era, named after the legendary courtesan Anarkali. This fusion version combines traditional silhouettes with modern fabric technology and contemporary cuts. The flowing design was favored by Mughal nobility and has evolved through centuries to become a staple in Indo-western fashion. Our version features hand-embroidered motifs inspired by Mughal architecture.',
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString(),
    },
    {
        name: 'Modern Kurta Set',
        type: 'set',
        description: 'Contemporary kurta set with slim-fit silhouette and minimalist design',
        imageUrl: '/api/placeholder/300/400?text=Modern%20Kurta%20Set',
        price: 189.99,
        category: 'men',
        measurements: '{"chest":40,"waist":32,"length":30,"sleeve":24}',
        qualityRating: 8,
        history: 'The kurta has been a cornerstone of South Asian menswear for over 500 years. Originally loose-fitting garments worn by both men and women, modern kurtas have evolved to include tailored fits and contemporary styling. This set represents the fusion of traditional comfort with modern aesthetics, featuring clean lines and geometric patterns that reflect urban sensibilities while maintaining cultural authenticity.',
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString(),
    },
    {
        name: 'Indo Western Gown',
        type: 'gown',
        description: 'Flowing indo-western gown with intricate beadwork and modern silhouette',
        imageUrl: '/api/placeholder/300/400?text=Indo%20Western%20Gown',
        price: 449.99,
        category: 'women',
        measurements: '{"bust":34,"waist":26,"hips":36,"length":58}',
        qualityRating: 10,
        history: 'Indo-western gowns emerged in the 1960s as a fusion response to globalization and cultural exchange. This style combines the elegance of Western evening gowns with traditional Indian embellishments and draping techniques. The design philosophy draws from both Parisian haute couture and Indian craftsmanship, creating garments that celebrate cultural fusion while maintaining sophistication and grace.',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
    },
    {
        name: 'Contemporary Dhoti Pants',
        type: 'pants',
        description: 'Modern interpretation of traditional dhoti with comfortable elastic waistband',
        imageUrl: '/api/placeholder/300/400?text=Contemporary%20Dhoti%20Pants',
        price: 129.99,
        category: 'unisex',
        measurements: '{"waist":30,"hips":34,"length":38,"inseam":28}',
        qualityRating: 7,
        history: 'The dhoti, one of the oldest garments in human history, dates back over 5000 years to the Indus Valley Civilization. Traditionally an unstitched garment, the contemporary dhoti pant adapts this ancient draping style into a modern, practical format. This evolution represents the successful translation of cultural heritage into contemporary fashion, maintaining the comfort and breathability of traditional dhoti while adding modern functionality.',
        createdAt: new Date('2024-01-18').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString(),
    },
    {
        name: 'Nehru Blazer Jacket',
        type: 'jacket',
        description: 'Classic Nehru collar blazer with contemporary tailoring and subtle detailing',
        imageUrl: '/api/placeholder/300/400?text=Nehru%20Blazer%20Jacket',
        price: 349.99,
        category: 'men',
        measurements: '{"chest":42,"waist":36,"length":28,"sleeve":25}',
        qualityRating: 9,
        history: 'The Nehru jacket gained international recognition in the 1960s when Prime Minister Jawaharlal Nehru popularized this style on the global stage. Originally inspired by the achkan and sherwani, this collarless jacket represents the perfect blend of Eastern aesthetics with Western tailoring techniques. The jacket became a symbol of modern India and continues to be a sophisticated choice for formal and semi-formal occasions.',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
    },
    {
        name: 'Designer Cape Lehenga',
        type: 'set',
        description: 'Royal cape lehenga with hand-embroidered details and flowing silhouette',
        imageUrl: '/api/placeholder/300/400?text=Designer%20Cape%20Lehenga',
        price: 599.99,
        category: 'women',
        measurements: '{"bust":32,"waist":24,"hips":38,"length":46}',
        qualityRating: 10,
        history: 'The lehenga traces its origins to the Mughal courts of the 16th century, where it was worn by royal women. The addition of a cape represents a modern interpretation that adds drama and elegance to the traditional three-piece ensemble. This design innovation combines the grandeur of historical royal wear with contemporary fashion sensibilities, creating a garment that commands attention while honoring cultural heritage.',
        createdAt: new Date('2024-01-22').toISOString(),
        updatedAt: new Date('2024-01-22').toISOString(),
    },
    {
        name: 'Royal Bandhgala Suit',
        type: 'suit',
        description: 'Luxurious bandhgala suit with gold thread work and royal styling',
        imageUrl: '/api/placeholder/300/400?text=Royal%20Bandhgala%20Suit',
        price: 899.99,
        category: 'men',
        measurements: '{"chest":44,"waist":38,"length":32,"sleeve":26}',
        qualityRating: 10,
        history: 'The bandhgala suit evolved from the British colonial period when Indian royalty adapted Western formal wear to include traditional Indian elements. Originally popularized by the Maharajas of Rajasthan, this closed-neck jacket style became synonymous with Indian formal wear. The royal bandhgala represents the pinnacle of Indian formal fashion, combining regal aesthetics with impeccable tailoring standards.',
        createdAt: new Date('2024-01-25').toISOString(),
        updatedAt: new Date('2024-01-25').toISOString(),
    },
    {
        name: 'Saree Style Wrap Dress',
        type: 'dress',
        description: 'Innovative wrap dress inspired by saree draping with modern functionality',
        imageUrl: '/api/placeholder/300/400?text=Saree%20Style%20Wrap%20Dress',
        price: 249.99,
        category: 'women',
        measurements: '{"bust":34,"waist":28,"hips":36,"length":44}',
        qualityRating: 8,
        history: 'The saree, with its 5000-year history, is one of the worlds oldest surviving garments. This wrap dress interpretation captures the essence of saree draping while providing the convenience of Western wear. The design philosophy respects the fluid, graceful lines of traditional saree draping while incorporating modern construction techniques that make it accessible to contemporary lifestyles.',
        createdAt: new Date('2024-01-28').toISOString(),
        updatedAt: new Date('2024-01-28').toISOString(),
    },
    {
        name: 'Fusion Churidar Joggers',
        type: 'pants',
        description: 'Comfortable fusion of traditional churidar with modern jogger styling',
        imageUrl: '/api/placeholder/300/400?text=Fusion%20Churidar%20Joggers',
        price: 159.99,
        category: 'unisex',
        measurements: '{"waist":32,"hips":36,"length":40,"ankle":8}',
        qualityRating: 7,
        history: 'Churidar pants, characterized by their close-fitting style that gathers at the ankles, originated in Central Asia and were adopted into Indian fashion during the medieval period. This fusion with jogger styling represents the evolution of traditional garments to meet modern lifestyle needs. The design maintains the distinctive churidar silhouette while incorporating contemporary comfort features like elastic waistbands and breathable fabrics.',
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString(),
    },
    {
        name: 'Elegant Sharara Jumpsuit',
        type: 'jumpsuit',
        description: 'Contemporary jumpsuit with traditional sharara-inspired wide leg design',
        imageUrl: '/api/placeholder/300/400?text=Elegant%20Sharara%20Jumpsuit',
        price: 389.99,
        category: 'women',
        measurements: '{"bust":36,"waist":30,"hips":40,"length":56}',
        qualityRating: 9,
        history: 'The sharara originated in the Lucknow courts during the Nawabi era, characterized by its flared, palazzo-style pants that create a skirt-like silhouette. This jumpsuit adaptation transforms the traditional two-piece sharara into a contemporary one-piece garment. The design celebrates the dramatic flair of traditional sharara while offering the convenience and modern appeal of jumpsuit styling, perfect for the contemporary woman who values both heritage and practicality.',
        createdAt: new Date('2024-02-05').toISOString(),
        updatedAt: new Date('2024-02-05').toISOString(),
    }
];

// Insert sample data (this would typically be done via seeder, but testing direct insertion)
// await db.insert(garments).values(sampleGarmentsData);