/**
 * One-time script: delete ALL users from the database
 * Run with: node scripts/clearUsers.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const result = await mongoose.connection.collection('users').deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} user(s) from the database`);

    await mongoose.disconnect();
    console.log('✅ Done. You can now register fresh test accounts.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

clearUsers();
