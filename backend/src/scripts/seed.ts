import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../database/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Check if products exist
    const existingProducts = await db.query.products.findMany();
    if (existingProducts.length > 0) {
      console.log('Start seeding: Products table is not empty.');
    } else {
        console.log('Seeding products...');
        await db.insert(schema.products).values([
        {
            name: 'Adidas Samba OG',
            description: 'Classic lifestyle shoes with authentic football roots.',
            price: 1800000,
            stock: 50,
            category: 'shoes',
            image: "https://images.unsplash.com/photo-1596516109370-29001ec8ec36?q=80&w=2070",
        },
        {
            name: 'Adidas Ultraboost Light',
            description: 'Lightest Ultraboost ever made for endless energy.',
            price: 2800000,
            stock: 30,
            category: 'shoes',
            image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aef4?q=80&w=2031",
        },
        {
            name: 'Adidas Track Jacket',
            description: 'Iconic Firebird track jacket with 3-Stripes.',
            price: 1200000,
            stock: 100,
            category: 'clothing',
            image: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2070",
        },
        {
            name: 'Adidas Essentials Hoodie',
            description: 'Cozy fleece hoodie for everyday comfort.',
            price: 900000,
            stock: 75,
            category: 'clothing',
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070",
        },
        ]);
        console.log('✅ Products seeded!');
    }

    console.log('✨ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await client.end();
  }
}

seed();
