require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

async function check() {
  await connectDB();
  const db = mongoose.connection.db;
  const docs = await db.collection('attendances').find({}).limit(3).toArray();
  console.log('Sample docs in attendances:');
  console.dir(docs, { depth: 2 });

  const dates = await db.collection('attendances').aggregate([
    { $group: { _id: { $substr: ['$dateString', 0, 7] }, count: { $sum: 1 } } }
  ]).toArray();
  console.log('Date ranges in attendances:', dates);

  const augDocs = await db.collection('attendances').find({
    dateString: { $regex: '^2026-08' }
  }).count();
  console.log('August 2026 docs count in attendances:', augDocs);

  await mongoose.disconnect();
}
check().catch(console.error);
