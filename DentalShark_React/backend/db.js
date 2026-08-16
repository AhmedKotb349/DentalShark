const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

let mongod = null;

async function connectDB() {
  try {
    // Attempt standard connection first with a short timeout
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout
    });
    console.log('✅ Connected to existing MongoDB instance');
  } catch (err) {
    console.log('⚠️ Could not connect to external MongoDB, falling back to embedded database...');
    
    const dbPath = path.join(__dirname, 'data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    mongod = await MongoMemoryServer.create({
      instance: {
        dbPath: dbPath,
        storageEngine: 'wiredTiger' // Needed for persistence
      }
    });

    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅ Connected to embedded MongoDB (persistence enabled)`);
  }
}

async function closeDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}

module.exports = { connectDB, closeDB };
