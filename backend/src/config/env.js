const dotenv = require('dotenv');
const path = require('path');

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Required environment variables
const requiredVars = [
  'MONGODB_URI', 
  'ADMIN_API_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL'
];

const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error('\n   Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI,
  adminApiKey: process.env.ADMIN_API_KEY,
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5500').replace(/\/$/, ''),
  nodeEnv: process.env.NODE_ENV || 'development',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 min
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2BucketName: process.env.R2_BUCKET_NAME,
  r2PublicUrl: (process.env.R2_PUBLIC_URL || '').replace(/\/$/, ''),
};

module.exports = env;
