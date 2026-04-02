import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

let fixedUrl = databaseUrl;
if (fixedUrl.includes('neon')) {
  // Replace any existing sslmode with require for Neon
  fixedUrl = fixedUrl.replace(/sslmode=[^&?]+/g, 'sslmode=require');
  console.log('Neon SSL fixed URL params');
}

console.log('Sequelize connecting to (masked):', fixedUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@').replace(/\/[^?]+/, '/***'));

const sequelize = new Sequelize(fixedUrl, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false,
      // Neon requires these additional options
      SslMode: 'require',
    },
  },
});

export default sequelize;