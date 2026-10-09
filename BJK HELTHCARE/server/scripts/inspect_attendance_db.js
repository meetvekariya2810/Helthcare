require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

async function inspectAttendance() {
  await connectDB();
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections in database:');
  const collNames = collections.map(c => c.name);
  console.log(collNames.sort());

  const attendanceColls = collNames.filter(c => c.toLowerCase().includes('attend'));
  console.log('\nAttendance related collections:', attendanceColls);

  for (const c of attendanceColls) {
    const count = await db.collection(c).countDocuments({});
    console.log(`- ${c}: ${count} documents`);
    if (count > 0) {
      const sample = await db.collection(c).findOne({});
      console.log(`  Sample doc from ${c}:`, JSON.stringify(sample).substring(0, 300));
    }
  }

  await mongoose.disconnect();
}

inspectAttendance().catch(err => {
  console.error(err);
  process.exit(1);
});
