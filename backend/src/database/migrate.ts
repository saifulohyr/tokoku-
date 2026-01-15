import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL);

async function migrate() {
  console.log('Running migration: Adding category column...');
  
  await client`
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS category VARCHAR(100)
  `;
  
  console.log('✅ Migration completed!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
