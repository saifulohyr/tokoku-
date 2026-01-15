import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function main() {
  console.log('🔄 Adding shipping address columns...');
  
  try {
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT`;
    console.log('✅ Added shipping_address column');
    
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100)`;
    console.log('✅ Added shipping_city column');
    
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20)`;
    console.log('✅ Added shipping_postal_code column');
    
    await client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20)`;
    console.log('✅ Added shipping_phone column');
    
    console.log('✅ All columns added successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await client.end();
  process.exit(0);
}

main();
