const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const dns = require('dns');
    if (env.nodeEnv === 'development') {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if DB unavailable or network error
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }

  // Event listeners for connection lifecycle
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB error: ${err.message}`);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });
};

module.exports = connectDB;
