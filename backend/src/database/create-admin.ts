import postgres from 'postgres';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL);

async function createAdmin() {
  console.log('Creating admin user...');
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Delete existing admin if any, then insert fresh
  await client`DELETE FROM users WHERE email = 'admin@tokoku.com'`;
  
  await client`
    INSERT INTO users (full_name, email, password, role)
    VALUES ('Admin User', 'admin@tokoku.com', ${hashedPassword}, 'admin')
  `;
  
  console.log('✅ Admin user created!');
  console.log('Email: admin@tokoku.com');
  console.log('Password: admin123');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
