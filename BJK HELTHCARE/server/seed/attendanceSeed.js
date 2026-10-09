const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Employee = require('../models/hrms/Employee');
const Department = require('../models/hrms/Department');
const Designation = require('../models/hrms/Designation');
const Shift = require('../models/hrms/Shift');
const Attendance = require('../models/hrms/Attendance');
const SavedReportTemplate = require('../models/hrms/SavedReportTemplate');
const AttendanceReportHistory = require('../models/hrms/AttendanceReportHistory');
const AttendanceRegularization = require('../models/hrms/AttendanceRegularization');

async function seedAttendance() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Attendance Seed]: Connected to DB.');

    // 1. Ensure Department records exist
    let prodDept = await Department.findOne({ name: /Production/i });
    if (!prodDept) {
      prodDept = await Department.create({
        name: 'Production',
        code: 'PROD',
        branch: 'Ahmedabad',
        facility: 'Ahmedabad Plant',
        division: 'Manufacturing',
        order: 1,
        isDemo: true
      });
    }

    let qcDept = await Department.findOne({ name: /Quality Control/i });
    if (!qcDept) {
      qcDept = await Department.create({
        name: 'Quality Control',
        code: 'QC',
        branch: 'Ahmedabad',
        facility: 'Ahmedabad Plant',
        division: 'Quality',
        order: 2,
        isDemo: true
      });
    }

    let qaDept = await Department.findOne({ name: /Quality Assurance/i });
    if (!qaDept) {
      qaDept = await Department.create({
        name: 'Quality Assurance',
        code: 'QA',
        branch: 'Ahmedabad',
        facility: 'Ahmedabad Plant',
        division: 'Quality',
        order: 3,
        isDemo: true
      });
    }

    // 2. Ensure Shifts exist
    let genShift = await Shift.findOne({ name: /General/i });
    if (!genShift) {
      genShift = await Shift.create({
        name: 'General Shift (09:00 - 18:00)',
        code: 'GEN-01',
        type: 'General',
        startTime: '09:00',
        endTime: '18:00',
        gracePeriodMinutes: 15,
        breakDurationMinutes: 60,
        isDemo: true
      });
    }

    let mornShift = await Shift.findOne({ name: /Morning/i });
    if (!mornShift) {
      mornShift = await Shift.create({
        name: 'Morning Shift (06:00 - 14:30)',
        code: 'MORN-01',
        type: 'Morning',
        startTime: '06:00',
        endTime: '14:30',
        gracePeriodMinutes: 10,
        breakDurationMinutes: 30,
        isDemo: true
      });
    }

    let nightShift = await Shift.findOne({ name: /Night/i });
    if (!nightShift) {
      nightShift = await Shift.create({
        name: 'Pharma Night Shift (22:00 - 06:30)',
        code: 'NIGHT-01',
        type: 'Night',
        startTime: '22:00',
        endTime: '06:30',
        gracePeriodMinutes: 10,
        breakDurationMinutes: 30,
        nightRule: { isNightShift: true, nightHoursStart: '22:00', nightHoursEnd: '06:00' },
        isDemo: true
      });
    }

    // 3. Ensure Employees for Production, QC, QA, Warehouse, HR
    const sampleEmployees = [
      {
        employeeId: 'BJK-00101',
        firstName: 'Dr. Vikram',
        lastName: 'Mehta',
        department: qaDept._id,
        departmentName: 'Quality Assurance',
        designationTitle: 'QA Director & Head of Quality',
        branchName: 'Ahmedabad',
        assignedShift: genShift._id,
        shiftName: genShift.name
      },
      {
        employeeId: 'BJK-00102',
        firstName: 'Priya',
        lastName: 'Sharma',
        department: qcDept._id,
        departmentName: 'Quality Control',
        designationTitle: 'Senior QC Analyst',
        branchName: 'Ahmedabad',
        assignedShift: mornShift._id,
        shiftName: mornShift.name
      },
      {
        employeeId: 'BJK-00103',
        firstName: 'Rajesh',
        lastName: 'Patel',
        department: prodDept._id,
        departmentName: 'Production',
        designationTitle: 'Production Shift Supervisor',
        branchName: 'Ahmedabad',
        assignedShift: nightShift._id,
        shiftName: nightShift.name
      },
      {
        employeeId: 'BJK-00201',
        firstName: 'Suresh',
        lastName: 'Sharma',
        department: prodDept._id,
        departmentName: 'Production',
        designationTitle: 'Senior Granulation Technician',
        branchName: 'Ahmedabad',
        assignedShift: genShift._id,
        shiftName: genShift.name
      },
      {
        employeeId: 'BJK-00202',
        firstName: 'Amit',
        lastName: 'Verma',
        department: prodDept._id,
        departmentName: 'Production',
        designationTitle: 'Sterile Injectable Operator',
        branchName: 'Ahmedabad',
        assignedShift: genShift._id,
        shiftName: genShift.name
      },
      {
        employeeId: 'BJK-00203',
        firstName: 'Dipak',
        lastName: 'Parmar',
        department: prodDept._id,
        departmentName: 'Production',
        designationTitle: 'Packaging Line Lead',
        branchName: 'Ahmedabad',
        assignedShift: genShift._id,
        shiftName: genShift.name
      },
      {
        employeeId: 'BJK-00204',
        firstName: 'Nilesh',
        lastName: 'Patel',
        department: prodDept._id,
        departmentName: 'Production',
        designationTitle: 'Cleanroom Operator',
        branchName: 'Ahmedabad',
        assignedShift: nightShift._id,
        shiftName: nightShift.name
      },
      {
        employeeId: 'BJK-00301',
        firstName: 'Dr. Ananya',
        lastName: 'Iyer',
        department: qcDept._id,
        departmentName: 'Quality Control',
        designationTitle: 'Microbiology Specialist',
        branchName: 'Ahmedabad',
        assignedShift: mornShift._id,
        shiftName: mornShift.name
      },
      {
        employeeId: 'BJK-00302',
        firstName: 'Ketan',
        lastName: 'Raval',
        department: qaDept._id,
        departmentName: 'Quality Assurance',
        designationTitle: 'Validation & IPQA Officer',
        branchName: 'Ahmedabad',
        assignedShift: genShift._id,
        shiftName: genShift.name
      }
    ];

    const seededEmployees = [];
    for (const empData of sampleEmployees) {
      let emp = await Employee.findOne({ employeeId: empData.employeeId });
      if (!emp) {
        let desig = await Designation.findOne({ title: empData.designationTitle });
        if (!desig) {
          desig = await Designation.create({
            title: empData.designationTitle,
            code: empData.employeeId + '-DESIG',
            department: empData.department,
            departmentName: empData.departmentName,
            level: 'Senior Executive',
            isDemo: true
          });
        }

        emp = await Employee.create({
          employeeId: empData.employeeId,
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: `${empData.firstName.toLowerCase().replace(/[^a-z]/g, '')}.${empData.lastName.toLowerCase()}@bjkhealthcare.com`,
          phone: '+91 98250 00000',
          department: empData.department,
          departmentName: empData.departmentName,
          designation: desig._id,
          designationTitle: empData.designationTitle,
          facility: 'Ahmedabad Formulations Plant',
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
          assignedShift: empData.assignedShift,
          shiftName: empData.shiftName,
          joiningDate: new Date('2022-01-15'),
          isDemo: true
        });
      }
      seededEmployees.push(emp);
    }
    console.log(`[Attendance Seed]: Verified ${seededEmployees.length} employees.`);

    // 4. Clear existing demo attendance
    await Attendance.deleteMany({ isDemo: true });

    // 5. Generate October 2026 Daily Records (2026-10-01 to 2026-10-31)
    const recordsToInsert = [];
    const daysInOct = 31;

    for (let day = 1; day <= daysInOct; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateString = `2026-10-${dayStr}`;
      const dateObj = new Date(`${dateString}T00:00:00.000Z`);
      const dayOfWeek = dateObj.getUTCDay(); // 0 = Sun

      const isSunday = dayOfWeek === 0;
      const isGandhiJayanti = day === 2;
      const isDussehra = day === 20;

      for (const emp of seededEmployees) {
        let status = 'PRESENT';
        let checkIn = null;
        let checkOut = null;
        let scheduledIn = '09:00';
        let scheduledOut = '18:00';
        let actualIn = null;
        let actualOut = null;
        let workingHours = 0;
        let lateMinutes = 0;
        let earlyMinutes = 0;
        let overtimeHours = 0;
        let nightHours = 0;
        let punchCondition = 'HAS_BOTH';
        let leaveType = 'NONE';
        let halfDayType = 'NONE';
        let source = 'BIOMETRIC';
        let remarks = '';

        const isNightEmployee = emp.shiftName && emp.shiftName.includes('Night');

        if (isNightEmployee) {
          scheduledIn = '22:00';
          scheduledOut = '06:30';
        } else if (emp.shiftName && emp.shiftName.includes('Morning')) {
          scheduledIn = '06:00';
          scheduledOut = '14:30';
        }

        if (day === 4) {
          // TODAY (2026-10-04): Specific setup for Missing OUT testing
          const isMissingOutTarget = ['Production', 'Quality Control', 'Quality Assurance'].includes(emp.departmentName) &&
            ['BJK-00103', 'BJK-00102', 'BJK-00302'].includes(emp.employeeId);

          if (isMissingOutTarget) {
            status = 'PRESENT';
            scheduledIn = '09:00';
            scheduledOut = '18:00';
            actualIn = '08:52';
            actualOut = null;
            checkIn = new Date(`${dateString}T08:52:00.000Z`);
            checkOut = null;
            workingHours = 0;
            punchCondition = 'MISSING_OUT';
            remarks = 'Biometric IN logged; awaiting shift completion OUT punch';
          } else {
            status = 'PRESENT';
            scheduledIn = '09:00';
            scheduledOut = '18:00';
            actualIn = '08:58';
            actualOut = '18:02';
            checkIn = new Date(`${dateString}T08:58:00.000Z`);
            checkOut = new Date(`${dateString}T18:02:00.000Z`);
            workingHours = 8.0;
            punchCondition = 'HAS_BOTH';
            remarks = 'On-duty manufacturing operational log';
          }
        } else if (isGandhiJayanti || isDussehra) {
          // Company Holiday
          status = 'HOLIDAY';
          remarks = isGandhiJayanti ? 'Gandhi Jayanti Public Holiday' : 'Vijayadashami / Dussehra Festival';
          punchCondition = 'BOTH_MISSING';
        } else if (isSunday) {
          // Weekly Off
          status = 'WEEK_OFF';
          remarks = 'Scheduled Weekly Off';
          punchCondition = 'BOTH_MISSING';
        } else {
          // Regular Working Day: Create realistic healthcare scenarios
          const seedMod = (emp.employeeId.charCodeAt(emp.employeeId.length - 1) + day) % 20;

          if (seedMod === 3) {
            // Half Day scenario
            status = 'HALF_DAY';
            halfDayType = 'FIRST_HALF';
            scheduledIn = '09:00';
            scheduledOut = '18:00';
            actualIn = '09:02';
            actualOut = '13:05';
            checkIn = new Date(`${dateString}T09:02:00.000Z`);
            checkOut = new Date(`${dateString}T13:05:00.000Z`);
            workingHours = 4.0;
            remarks = 'Approved Half Day - Plant medical appointment';
            punchCondition = 'HAS_BOTH';
          } else if (seedMod === 7) {
            // Late Arrival scenario
            status = 'LATE';
            scheduledIn = '09:00';
            scheduledOut = '18:00';
            actualIn = '09:35';
            actualOut = '18:10';
            checkIn = new Date(`${dateString}T09:35:00.000Z`);
            checkOut = new Date(`${dateString}T18:10:00.000Z`);
            lateMinutes = 35;
            workingHours = 8.0;
            remarks = 'Traffic delay at SG Highway junction';
            punchCondition = 'LATE_IN';
          } else if (seedMod === 11 && emp.departmentName === 'Quality Assurance') {
            // Leave scenario
            status = 'ON_LEAVE';
            leaveType = 'CASUAL';
            remarks = 'Approved Casual Leave';
            punchCondition = 'BOTH_MISSING';
          } else if (seedMod === 13) {
            // Missing OUT Punch scenario (Crucial for Test 2!)
            status = 'PRESENT';
            actualIn = scheduledIn;
            checkIn = new Date(`${dateString}T${scheduledIn}:00.000Z`);
            checkOut = null;
            actualOut = null;
            workingHours = 0;
            punchCondition = 'MISSING_OUT';
            remarks = 'Missing OUT punch - Employee exited via Cleanroom Emergency Gate';
          } else if (seedMod === 17 && isNightEmployee) {
            // Overtime Night Shift scenario
            status = 'NIGHT_SHIFT';
            actualIn = '21:50';
            actualOut = '07:30';
            checkIn = new Date(`${dateString}T21:50:00.000Z`);
            checkOut = new Date(`${dateString}T07:30:00.000Z`);
            workingHours = 9.5;
            overtimeHours = 1.5;
            nightHours = 6.5;
            punchCondition = 'HAS_BOTH';
            remarks = 'Night batch sterilization cycle completion';
          } else if (isNightEmployee) {
            // Standard Night Shift
            status = 'NIGHT_SHIFT';
            actualIn = '21:55';
            actualOut = '06:35';
            checkIn = new Date(`${dateString}T21:55:00.000Z`);
            checkOut = new Date(`${dateString}T06:35:00.000Z`);
            workingHours = 8.5;
            overtimeHours = 0.5;
            nightHours = 6.0;
            punchCondition = 'HAS_BOTH';
            remarks = 'Standard overnight manufacturing cycle';
          } else {
            // Standard Present Day
            status = 'PRESENT';
            actualIn = '08:55';
            actualOut = '18:05';
            checkIn = new Date(`${dateString}T08:55:00.000Z`);
            checkOut = new Date(`${dateString}T18:05:00.000Z`);
            workingHours = 8.2;
            overtimeHours = 0.2;
            punchCondition = 'HAS_BOTH';
          }
        }

        recordsToInsert.push({
          employee: emp._id,
          employeeId: emp.employeeId,
          employeeName: `${emp.firstName} ${emp.lastName}`.trim(),
          companyName: 'BJK Healthcare Private Limited',
          branchName: emp.branchName || 'Ahmedabad',
          departmentName: emp.departmentName,
          designationTitle: emp.designationTitle || 'Healthcare Specialist',
          date: dateObj,
          dateString,
          shiftName: emp.shiftName || genShift.name,
          scheduledIn,
          scheduledOut,
          actualIn,
          actualOut,
          checkIn,
          checkOut,
          status,
          punchCondition,
          lateMinutes,
          earlyMinutes,
          workingHours,
          regularHours: Math.min(workingHours, 8.0),
          overtimeHours,
          nightHours,
          leaveType,
          halfDayType,
          workLocation: 'PLANT',
          source,
          remarks,
          isDemo: true
        });
      }
    }

    console.log(`[Attendance Seed]: Inserting ${recordsToInsert.length} attendance records...`);
    await Attendance.insertMany(recordsToInsert);

    // 7. Seed Saved Report Templates
    await SavedReportTemplate.deleteMany({ isDemo: true });
    await SavedReportTemplate.create([
      {
        name: 'Monthly Production Attendance',
        description: 'October 2026 Production employees attendance in Ahmedabad plant (Present, Late, Half Day)',
        reportType: 'PRODUCTION_ATTENDANCE',
        isDefault: true,
        filters: {
          dateMode: 'CUSTOM',
          startDate: '2026-10-01',
          endDate: '2026-10-31',
          branches: ['Ahmedabad'],
          departments: ['Production'],
          statuses: ['PRESENT', 'LATE', 'HALF_DAY'],
          shifts: [],
          punchConditions: []
        },
        selectedColumns: [
          { key: 'employeeId', label: 'Employee ID', order: 1 },
          { key: 'employeeName', label: 'Employee Name', order: 2 },
          { key: 'date', label: 'Date', order: 3 },
          { key: 'shift', label: 'Shift', order: 4 },
          { key: 'actualIn', label: 'IN', order: 5 },
          { key: 'actualOut', label: 'OUT', order: 6 },
          { key: 'status', label: 'Status', order: 7 },
          { key: 'lateBy', label: 'Late By', order: 8 },
          { key: 'workingHours', label: 'Working Hours', order: 9 }
        ],
        groupBy: 'NONE',
        sheetStructure: 'SINGLE',
        isDemo: true
      },
      {
        name: 'Missing Punch Audit',
        description: 'Detect missing punch anomalies across Production, QC, and QA facilities',
        reportType: 'MISSING_PUNCH',
        filters: {
          dateMode: 'TODAY',
          branches: ['Ahmedabad'],
          departments: ['Production', 'Quality Control', 'Quality Assurance'],
          punchConditions: ['MISSING_OUT', 'MISSING_IN', 'BOTH_MISSING']
        },
        selectedColumns: [
          { key: 'employeeId', label: 'Employee ID', order: 1 },
          { key: 'employeeName', label: 'Employee Name', order: 2 },
          { key: 'department', label: 'Department', order: 3 },
          { key: 'date', label: 'Date', order: 4 },
          { key: 'shift', label: 'Shift', order: 5 },
          { key: 'actualIn', label: 'IN', order: 6 },
          { key: 'actualOut', label: 'OUT', order: 7 },
          { key: 'punchCondition', label: 'Missing Type', order: 8 },
          { key: 'remarks', label: 'Remarks', order: 9 }
        ],
        sheetStructure: 'SINGLE',
        isDemo: true
      },
      {
        name: 'Pharma Night Shift Roster & Differential',
        description: 'Night shift operations (22:00 to 06:30) with night hours and overtime calculations',
        reportType: 'NIGHT_SHIFT',
        filters: {
          dateMode: 'THIS_MONTH',
          shifts: ['Pharma Night Shift (22:00 - 06:30)'],
          statuses: ['PRESENT', 'NIGHT_SHIFT', 'LATE']
        },
        selectedColumns: [
          { key: 'employeeId', label: 'Employee ID', order: 1 },
          { key: 'employeeName', label: 'Employee Name', order: 2 },
          { key: 'department', label: 'Department', order: 3 },
          { key: 'date', label: 'Date', order: 4 },
          { key: 'scheduledIn', label: 'Scheduled In', order: 5 },
          { key: 'scheduledOut', label: 'Scheduled Out', order: 6 },
          { key: 'actualIn', label: 'Actual In', order: 7 },
          { key: 'actualOut', label: 'Actual Out', order: 8 },
          { key: 'workingHours', label: 'Working Hours', order: 9 },
          { key: 'overtime', label: 'Overtime', order: 10 },
          { key: 'status', label: 'Status', order: 11 }
        ],
        sheetStructure: 'SUMMARY_DETAIL',
        isDemo: true
      }
    ]);

    // 8. Seed Attendance Regularization requests
    await AttendanceRegularization.deleteMany({});
    await AttendanceRegularization.create([
      {
        employee: seededEmployees[2]._id,
        employeeId: seededEmployees[2].employeeId,
        employeeName: `${seededEmployees[2].firstName} ${seededEmployees[2].lastName}`,
        departmentName: 'Production',
        date: new Date('2026-10-05'),
        dateString: '2026-10-05',
        requestType: 'MISSING_OUT',
        proposedCheckIn: new Date('2026-10-05T21:55:00.000Z'),
        proposedCheckOut: new Date('2026-10-06T06:35:00.000Z'),
        proposedStatus: 'NIGHT_SHIFT',
        reason: 'Cleanroom exit scanner failed to sync during batch release handover',
        status: 'PENDING'
      },
      {
        employee: seededEmployees[1]._id,
        employeeId: seededEmployees[1].employeeId,
        employeeName: `${seededEmployees[1].firstName} ${seededEmployees[1].lastName}`,
        departmentName: 'Quality Control',
        date: new Date('2026-10-03'),
        dateString: '2026-10-03',
        requestType: 'WRONG_STATUS',
        proposedCheckIn: new Date('2026-10-03T06:05:00.000Z'),
        proposedCheckOut: new Date('2026-10-03T14:35:00.000Z'),
        proposedStatus: 'PRESENT',
        reason: 'Punch marked late due to biometric recalibration; supervisor verified physical presence at 06:05',
        status: 'APPROVED',
        reviewedByName: 'HR Admin',
        reviewRemarks: 'Verified against Cleanroom gowning entry log book'
      }
    ]);

    // 9. Seed Report History
    await AttendanceReportHistory.deleteMany({});
    await AttendanceReportHistory.create([
      {
        reportName: 'BJK_Attendance_Production_October_2026.xlsx',
        generatedByName: 'HR Administrator',
        reportType: 'DEPARTMENT',
        format: 'XLSX',
        filtersSummary: 'Branch: Ahmedabad | Dept: Production | Status: Present, Late In, Half Day | Period: Oct 2026',
        dateRange: '01/10/2026 → 31/10/2026',
        recordCount: 155,
        employeeCount: 5,
        columnsIncluded: ['employeeId', 'employeeName', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'lateBy', 'workingHours'],
        status: 'COMPLETED'
      }
    ]);

    console.log('[Attendance Seed]: Completed successfully with realistic BJK Healthcare records!');
    return { success: true, count: recordsToInsert.length };
  } catch (error) {
    console.error('[Attendance Seed Error]:', error.message);
    if (error.errors) {
      for (const [k, v] of Object.entries(error.errors)) {
        console.error(`- Field "${k}": ${v.message}`);
      }
    }
    throw error;
  }
}

if (require.main === module) {
  seedAttendance().then(() => {
    console.log('Seeder finished.');
    process.exit(0);
  }).catch((err) => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}

module.exports = { seedAttendance };
