import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, users, orders, orderItems } from './schema';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const seedProducts = [
  // === SHOES (SEPATU) - 6 Items ===
  {
    name: 'PULLEX Velocity Pro',
    description: 'Elite running shoes with carbon fiber plate and responsive foam.',
    price: 2499000,
    stock: 50,
    category: 'shoes',
    imageUrl: '/products/shoes_velocity_pro.png',
  },
  {
    name: 'PULLEX Court Vision',
    description: 'Premium basketball sneakers designed for maximum grip.',
    price: 1899000,
    stock: 35,
    category: 'shoes',
    imageUrl: '/products/shoes_court_vision.png',
  },
  {
    name: 'PULLEX Street Legend',
    description: 'Classic lifestyle sneakers re-engineered for modern comfort.',
    price: 1299000,
    stock: 100,
    category: 'shoes',
    imageUrl: '/products/shoes_street_legend.png',
  },
  {
    name: 'PULLEX Trail Blazer',
    description: 'Rugged trail running shoes with water-resistant upper.',
    price: 2199000,
    stock: 25,
    category: 'shoes',
    imageUrl: '/products/shoes_trail_blazer.png',
  },
  {
    name: 'PULLEX Aero Sprint',
    description: 'Ultra-lightweight sprinting spikes for track athletes.',
    price: 1599000,
    stock: 15,
    category: 'shoes',
    imageUrl: '/products/shoes_aero_sprint.png',
  },
  {
    name: 'PULLEX Marathon Elite',
    description: 'Long-distance running shoes trusted by professionals.',
    price: 2799000,
    stock: 40,
    category: 'shoes',
    imageUrl: '/products/shoes_marathon_elite.png',
  },

  // === MEN (PRIA) - 5 Items ===
  {
    name: 'PULLEX Tech Fleece Hoodie',
    description: 'Advanced thermal regulation fleece for cold weather training.',
    price: 1099000,
    stock: 60,
    category: 'men',
    imageUrl: '/products/men_tech_fleece_hoodie.png',
  },
  {
    name: 'PULLEX Pro Training Tee',
    description: 'Sweat-wicking compression t-shirt for intense workouts.',
    price: 499000,
    stock: 120,
    category: 'men',
    imageUrl: '/products/men_pro_training_tee.png',
  },
  {
    name: 'PULLEX Cargo Joggers',
    description: 'Stylish utility joggers with multiple pockets.',
    price: 899000,
    stock: 45,
    category: 'men',
    imageUrl: '/products/men_cargo_joggers.png',
  },
  {
    name: 'PULLEX Windbreaker Jacket',
    description: 'Lightweight, packable jacket for unpredictable weather.',
    price: 1499000,
    stock: 30,
    category: 'men',
    imageUrl: '/products/men_windbreaker_jacket.png',
  },
  {
    name: 'PULLEX Training Shorts',
    description: 'Breathable training shorts with built-in liner.',
    price: 599000,
    stock: 80,
    category: 'men',
    imageUrl: '/products/men_training_shorts.png',
  },

  // === WOMEN (WANITA) - 5 Items ===
  {
    name: 'PULLEX High-Support Sports Bra',
    description: 'Maximum support sports bra for high-impact activities.',
    price: 699000,
    stock: 70,
    category: 'women',
    imageUrl: '/products/women_sports_bra.png',
  },
  {
    name: 'PULLEX Yoga Leggings',
    description: 'Buttery soft high-waisted leggings for yoga and pilates.',
    price: 999000,
    stock: 90,
    category: 'women',
    imageUrl: '/products/women_yoga_leggings.png',
  },
  {
    name: 'PULLEX Crop Hoodie',
    description: 'Trendy cropped hoodie perfect for post-workout layering.',
    price: 799000,
    stock: 55,
    category: 'women',
    imageUrl: '/products/women_crop_hoodie.png',
  },
  {
    name: 'PULLEX Training Tank',
    description: 'Lightweight racerback tank for unrestricted movement.',
    price: 399000,
    stock: 100,
    category: 'women',
    imageUrl: '/products/women_training_tank.png',
  },
  {
    name: 'PULLEX Running Jacket',
    description: 'Warm, sleeveless vest for running in cold conditions.',
    price: 1199000,
    stock: 20,
    category: 'women',
    imageUrl: '/products/women_running_jacket.png',
  },

  // === KIDS (ANAK) - 5 Items ===
  {
    name: 'PULLEX Junior Runners',
    description: 'Durable and comfortable running shoes for active kids.',
    price: 899000,
    stock: 60,
    category: 'kids',
    imageUrl: '/products/kids_junior_runners.png',
  },
  {
    name: 'PULLEX Kids Hoodie',
    description: 'Soft fleece hoodie for everyday school or play.',
    price: 499000,
    stock: 80,
    category: 'kids',
    imageUrl: '/products/kids_hoodie.png',
  },
  {
    name: 'PULLEX Youth Soccer Jersey',
    description: 'Breathable jersey for the future football stars.',
    price: 399000,
    stock: 100,
    category: 'kids',
    imageUrl: '/products/kids_soccer_jersey.png',
  },
  {
    name: 'PULLEX Kids Backpack',
    description: 'Perfectly sized backpack for school essentials.',
    price: 449000,
    stock: 50,
    category: 'kids',
    imageUrl: '/products/kids_backpack.png',
  },
  {
    name: 'PULLEX Kids Tracksuit',
    description: 'Complete tracksuit set for warmups or lounging.',
    price: 899000,
    stock: 30,
    category: 'kids',
    imageUrl: '/products/kids_tracksuit.png',
  },


];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clear existing products (and orders to handle FKs)
  console.log('Clearing existing data...');
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(products);

  // 2. Insert Products
  console.log(`Inserting ${seedProducts.length} products...`);
  await db.insert(products).values(seedProducts);
  
  // 3. Create Admin User (if not exists)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    fullName: 'Admin User',
    email: 'admin@tokoku.com',
    password: hashedPassword,
    role: 'admin',
  }).onConflictDoNothing();

  console.log('✅ Seeding completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
