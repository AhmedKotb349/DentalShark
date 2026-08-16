const mongoose = require('mongoose');

let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    await connectionPromise;

    console.log('✅ Connected to MongoDB Atlas');

    return mongoose.connection;
  } catch (err) {
    connectionPromise = null;

    console.error('❌ MongoDB connection failed:', err.message);

    throw err;
  }
}

async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  connectionPromise = null;
}

module.exports = {
  connectDB,
  closeDB,
};
