const mongoose = require('mongoose');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bjk_healthcare';

async function check() {
  await mongoose.connect(MONGO_URI);
  const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', new mongoose.Schema({}, { strict: false }));
  const reqs = await LeaveRequest.find({
    $or: [
      { requestId: /HKRMU/i },
      { employeeId: 'BH1022' },
      { employeeName: /Dixita/i }
    ]
  });
  console.log('FOUND LEAVE REQUESTS:', JSON.stringify(reqs, null, 2));
  await mongoose.disconnect();
}
check().catch(console.error);
