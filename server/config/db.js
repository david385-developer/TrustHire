const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('FATAL: MONGO_URI is not defined');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // Connection pool
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeouts
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      // Retry
      retryWrites: true,
      retryReads: true,
      // Heartbeat
      heartbeatFrequencyMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Database: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB Disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB Reconnected');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB Connection FAILED:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
