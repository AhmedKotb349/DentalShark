const fs = require('fs');
const path = require('path');

const { connectDB, closeDB } = require('../db');
const User = require('../models/User');

async function migrateUsers() {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Read existing JSON database
    const dbPath = path.join(__dirname, '../data/db.json');

    if (!fs.existsSync(dbPath)) {
      throw new Error(`db.json not found at: ${dbPath}`);
    }

    const raw = fs.readFileSync(dbPath, 'utf8');
    const database = JSON.parse(raw);

    if (!Array.isArray(database.users)) {
      throw new Error('No "users" array found in db.json');
    }

    console.log(`Found ${database.users.length} users in JSON database.`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const oldUser of database.users) {
      if (!oldUser.email || !oldUser.uid) {
        console.log('⚠️ Skipping invalid user:', oldUser);
        skipped++;
        continue;
      }

      const email = oldUser.email.toLowerCase().trim();

      // Check if user already exists
      const existing = await User.findOne({
        $or: [
          { email },
          { uid: oldUser.uid }
        ]
      });

      if (existing) {
        console.log(`↪️ Already exists: ${email}`);
        skipped++;
        continue;
      }

      // IMPORTANT:
      // We use create() here, which normally triggers the password
      // hashing middleware. Therefore, if oldUser.password is already
      // bcrypt-hashed, we must bypass the middleware.
      const user = new User({
        uid: oldUser.uid,
        name: oldUser.name,
        email,
        password: oldUser.password,
        role: oldUser.role,
        dept: oldUser.dept,
        phone: oldUser.phone,
        initials: oldUser.initials,
        color: oldUser.color,
        orders: oldUser.orders || 0,
        spent: oldUser.spent || '—',
        joined: oldUser.joined,
        sharkPts: oldUser.sharkPts || 0,
      });

      // Prevent bcrypt from hashing an already-hashed password
      user.$__skipPasswordHash = true;

      await User.collection.insertOne(user.toObject());

      console.log(`✅ Migrated: ${email}`);
      inserted++;
    }

    console.log('\n────────────────────────────');
    console.log('Migration complete');
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped:  ${skipped}`);
    console.log(`Updated:  ${updated}`);
    console.log('────────────────────────────');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

migrateUsers();
