import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.log('No DATABASE_URL');
  process.exit(1);
}

let fixedUrl = url;
if (fixedUrl.includes('neon') && !fixedUrl.includes('sslmode')) {
  fixedUrl += '?sslmode=verify-full';
} else if (fixedUrl.includes('neon')) {
  fixedUrl += '&sslmode=verify-full';
}

console.log('Testing connection to (masked):', fixedUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@').replace(/\/[^?]+/, '/***'));

const client = new Client({
  connectionString: fixedUrl,
  connect_timeout: 60,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('✅ Raw PG connection successful!');
    return client.query('SELECT 1');
  })
  .then(() => {
    console.log('✅ Query successful!');
    client.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });

