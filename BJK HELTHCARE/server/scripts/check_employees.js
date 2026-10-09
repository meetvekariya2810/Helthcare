const { connectDB } = require('../config/db');
const Employee = require('../models/Employee');

async function run() {
  await connectDB();
  const total = await Employee.countDocuments({});
  const nonTech = await Employee.countDocuments({
    $or: [{ isNonTechnical: true }, { staffCategory: 'NON_TECHNICAL' }]
  });
  const tech = await Employee.countDocuments({
    isNonTechnical: { $ne: true },
    staffCategory: { $ne: 'NON_TECHNICAL' }
  });
  const directoryQuery = {
    isNonTechnical: { $ne: true },
    staffCategory: { $ne: 'NON_TECHNICAL' }
  };
  const directoryCount = await Employee.countDocuments(directoryQuery);
  console.log(`Company Employees Directory Count (Excluding Non-Technical): ${directoryCount}`);
  
  const nonTechQuery = {
    $or: [{ isNonTechnical: true }, { staffCategory: 'NON_TECHNICAL' }]
  };
  const nonTechCount = await Employee.countDocuments(nonTechQuery);
  console.log(`Core HRMS Non-Technical Staff Count: ${nonTechCount}`);
  
  process.exit(0);
}
run();
