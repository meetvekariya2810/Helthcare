const mongoose = require('mongoose');
const Employee = require('../../models/Employee');
const Attendance = require('../../models/hrms/Attendance');
const Department = require('../../models/hrms/Department');
const Designation = require('../../models/hrms/Designation');
const { LeaveRequest } = require('../../models/hrms/Leave');
const AuditLog = require('../../models/AuditLog');
const { getScopeQuery } = require('../../services/hrms/dataScopeService');

// Helper to get formatted date string (YYYY-MM-DD)
const getDateString = (dateObj) => {
  const d = dateObj ? new Date(dateObj) : new Date();
  return d.toISOString().split('T')[0];
};

// Reference 10 Non-Technical Staff Data across non-technical departments
const REFERENCE_NON_TECH_STAFF = [
  {
    employeeId: 'BJK-NT-001',
    employeeCode: 'BJK-NT-001',
    firstName: 'Ramesh',
    middleName: 'K',
    lastName: 'Patel',
    fullName: 'Ramesh Patel',
    gender: 'Male',
    department: 'Administration',
    departmentName: 'Administration',
    designation: 'Senior Office Assistant',
    employmentType: 'Full Time',
    mobile: '9825011223',
    phone: '9825011223',
    email: 'ramesh.p@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-03-15'),
    address: { addressLine1: 'B-104, Shrinand Nagar', city: 'Ahmedabad', state: 'Gujarat', pinCode: '382443' }
  },
  {
    employeeId: 'BJK-NT-002',
    employeeCode: 'BJK-NT-002',
    firstName: 'Priya',
    middleName: 'M',
    lastName: 'Sharma',
    fullName: 'Priya Sharma',
    gender: 'Female',
    department: 'Reception',
    departmentName: 'Reception',
    designation: 'Front Desk Receptionist',
    employmentType: 'Full Time',
    mobile: '9879022334',
    phone: '9879022334',
    email: 'priya.s@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-06-01'),
    address: { addressLine1: '12, Sarjan Society', city: 'Ahmedabad', state: 'Gujarat', pinCode: '380015' }
  },
  {
    employeeId: 'BJK-NT-003',
    employeeCode: 'BJK-NT-003',
    firstName: 'Jagdish',
    middleName: 'B',
    lastName: 'Vaghela',
    fullName: 'Jagdish Vaghela',
    gender: 'Male',
    department: 'Security',
    departmentName: 'Security',
    designation: 'Security Supervisor',
    employmentType: 'Full Time',
    mobile: '9426033445',
    phone: '9426033445',
    email: 'jagdish.v@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2023-11-10'),
    address: { addressLine1: '45, Shivam Tenements', city: 'Ahmedabad', state: 'Gujarat', pinCode: '382481' }
  },
  {
    employeeId: 'BJK-NT-004',
    employeeCode: 'BJK-NT-004',
    firstName: 'Mukesh',
    middleName: 'H',
    lastName: 'Solanki',
    fullName: 'Mukesh Solanki',
    gender: 'Male',
    department: 'Security',
    departmentName: 'Security',
    designation: 'Security Guard',
    employmentType: 'Full Time',
    mobile: '9898044556',
    phone: '9898044556',
    email: 'mukesh.s@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-01-20'),
    address: { addressLine1: 'C-22, Maruti Complex', city: 'Ahmedabad', state: 'Gujarat', pinCode: '382480' }
  },
  {
    employeeId: 'BJK-NT-005',
    employeeCode: 'BJK-NT-005',
    firstName: 'Kantaben',
    middleName: 'D',
    lastName: 'Parmar',
    fullName: 'Kantaben Parmar',
    gender: 'Female',
    department: 'Housekeeping',
    departmentName: 'Housekeeping',
    designation: 'Housekeeping Lead',
    employmentType: 'Full Time',
    mobile: '9727055667',
    phone: '9727055667',
    email: 'kantaben.p@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2023-08-15'),
    address: { addressLine1: 'Block 4, Vasant Nagar', city: 'Ahmedabad', state: 'Gujarat', pinCode: '380061' }
  },
  {
    employeeId: 'BJK-NT-006',
    employeeCode: 'BJK-NT-006',
    firstName: 'Rekhaben',
    middleName: 'S',
    lastName: 'Chavda',
    fullName: 'Rekhaben Chavda',
    gender: 'Female',
    department: 'Housekeeping',
    departmentName: 'Housekeeping',
    designation: 'Housekeeping Staff',
    employmentType: 'Full Time',
    mobile: '9909066778',
    phone: '9909066778',
    email: 'rekhaben.c@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-04-10'),
    address: { addressLine1: '18, Umiya Park', city: 'Ahmedabad', state: 'Gujarat', pinCode: '382440' }
  },
  {
    employeeId: 'BJK-NT-007',
    employeeCode: 'BJK-NT-007',
    firstName: 'Bharat',
    middleName: 'N',
    lastName: 'Prajapati',
    fullName: 'Bharat Prajapati',
    gender: 'Male',
    department: 'Maintenance',
    departmentName: 'Maintenance',
    designation: 'Facility Maintenance Electrician',
    employmentType: 'Full Time',
    mobile: '9824077889',
    phone: '9824077889',
    email: 'bharat.p@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2023-05-12'),
    address: { addressLine1: '56, Radhe Krishna Row House', city: 'Ahmedabad', state: 'Gujarat', pinCode: '382350' }
  },
  {
    employeeId: 'BJK-NT-008',
    employeeCode: 'BJK-NT-008',
    firstName: 'Suresh',
    middleName: 'L',
    lastName: 'Rathod',
    fullName: 'Suresh Rathod',
    gender: 'Male',
    department: 'Maintenance',
    departmentName: 'Maintenance',
    designation: 'Plumber & Support Worker',
    employmentType: 'Full Time',
    mobile: '9876088990',
    phone: '9876088990',
    email: 'suresh.r@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-02-01'),
    address: { addressLine1: 'Plot 31, Sharda Nagar', city: 'Ahmedabad', state: 'Gujarat', pinCode: '380007' }
  },
  {
    employeeId: 'BJK-NT-009',
    employeeCode: 'BJK-NT-009',
    firstName: 'Dinesh',
    middleName: 'R',
    lastName: 'Makwana',
    fullName: 'Dinesh Makwana',
    gender: 'Male',
    department: 'Logistics',
    departmentName: 'Logistics',
    designation: 'Senior Driver & Vehicle In-Charge',
    employmentType: 'Full Time',
    mobile: '9428099001',
    phone: '9428099001',
    email: 'dinesh.m@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2022-09-20'),
    address: { addressLine1: '7, Jai Ambe Society', city: 'Ahmedabad', state: 'Gujarat', pinCode: '382445' }
  },
  {
    employeeId: 'BJK-NT-010',
    employeeCode: 'BJK-NT-010',
    firstName: 'Hasmukh',
    middleName: 'P',
    lastName: 'Dabhi',
    fullName: 'Hasmukh Dabhi',
    gender: 'Male',
    department: 'Dispatch',
    departmentName: 'Dispatch',
    designation: 'Dispatch & Store Helper',
    employmentType: 'Full Time',
    mobile: '9825100112',
    phone: '9825100112',
    email: 'hasmukh.d@bjkhealthcare.com',
    status: 'ACTIVE',
    employmentStatus: 'Active',
    isNonTechnical: true,
    staffCategory: 'NON_TECHNICAL',
    joiningDate: new Date('2024-05-18'),
    address: { addressLine1: 'A-302, Gokul Heights', city: 'Ahmedabad', state: 'Gujarat', pinCode: '382424' }
  }
];

// Automatically ensure 10 reference non-technical staff exist
const ensureReferenceNonTechStaff = async () => {
  try {
    const existingCount = await Employee.countDocuments({
      $or: [
        { isNonTechnical: true },
        { staffCategory: 'NON_TECHNICAL' }
      ]
    });

    if (existingCount < 10) {
      const todayStr = getDateString(new Date());
      const initialStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'ABSENT', 'LEAVE'];

      for (let i = 0; i < REFERENCE_NON_TECH_STAFF.length; i++) {
        const staffData = REFERENCE_NON_TECH_STAFF[i];
        const status = initialStatuses[i];

        let emp = await Employee.findOne({ employeeId: staffData.employeeId });
        if (!emp) {
          emp = new Employee(staffData);
          await emp.save();
        } else if (!emp.isNonTechnical) {
          emp.isNonTechnical = true;
          emp.staffCategory = 'NON_TECHNICAL';
          await emp.save();
        }

        // Ensure attendance record exists for today
        let att = await Attendance.findOne({
          $or: [
            { employeeId: emp.employeeId, dateString: todayStr },
            { employeeCode: emp.employeeId, attendanceDate: todayStr }
          ]
        });
        if (!att) {
          att = new Attendance({
            employee: emp._id,
            employeeId: emp.employeeId,
            employeeCode: emp.employeeId,
            attendanceDate: todayStr,
            employeeName: emp.fullName,
            departmentName: emp.departmentName,
            branchName: 'Ahmedabad Branch',
            date: new Date(todayStr),
            dateString: todayStr,
            status: status,
            source: 'MANUAL',
            workingHours: status === 'PRESENT' ? 8 : 0,
            remarks: `Initial seed: ${status}`
          });
          await att.save();
        }
      }
    }
  } catch (err) {
    console.error('[ensureReferenceNonTechStaff] Auto-seed non-blocking warning:', err.message);
  }
};

// Strict category filter (Technical vs Non-Technical Staff)
const getCategoryFilter = (category, scopeFilter = {}) => {
  if (category === 'NON_TECHNICAL') {
    return {
      ...scopeFilter,
      $or: [
        { isNonTechnical: true },
        { staffCategory: 'NON_TECHNICAL' },
        { employeeCategory: 'NON_TECHNICAL' }
      ]
    };
  }
  // Default: STRICT TECHNICAL WORKFORCE ONLY
  return {
    ...scopeFilter,
    $or: [
      { employeeCategory: 'TECHNICAL' },
      { staffCategory: 'TECHNICAL' },
      {
        $and: [
          { employeeCategory: { $ne: 'NON_TECHNICAL' } },
          { isNonTechnical: { $ne: true } }
        ]
      }
    ]
  };
};

/**
 * 1. GET /api/hrms/core/dashboard and /api/hrms/attendance/today
 * Master Attendance Dashboard KPIs & Real Attendance List
 * Supports strict separation between TECHNICAL and NON_TECHNICAL
 */
const getCoreHRMSDashboard = async (req, res) => {
  try {
    const isExplicitNonTech = req.originalUrl.includes('/core/') || req.query.employeeCategory === 'NON_TECHNICAL' || req.query.category === 'NON_TECHNICAL';
    if (isExplicitNonTech) {
      await ensureReferenceNonTechStaff();
    }

    const todayStr = req.query.date || getDateString(new Date());
    const todayDate = new Date(todayStr);
    const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

    const scopeFilter = getScopeQuery(req.user, 'employee');
    const targetCategory = isExplicitNonTech ? 'NON_TECHNICAL' : (req.query.employeeCategory || req.query.category || 'TECHNICAL');
    const categoryFilter = getCategoryFilter(targetCategory, scopeFilter);

    // 1. Total Active & Inactive Personnel
    const [totalEmployees, activeEmployees, inactiveEmployees, newJoinersThisMonth] = await Promise.all([
      Employee.countDocuments({ ...categoryFilter }),
      Employee.countDocuments({ ...categoryFilter, status: { $in: ['ACTIVE', 'Active', 'PROBATION', 'CONFIRMED'] } }),
      Employee.countDocuments({ ...categoryFilter, status: { $in: ['INACTIVE', 'Inactive', 'RESIGNED', 'TERMINATED'] } }),
      Employee.countDocuments({ ...categoryFilter, joiningDate: { $gte: startOfMonth } })
    ]);

    // 2. Department Count
    const totalDepartments = await Department.countDocuments({ isActive: { $ne: false } });

    // 3. Today's Workforce Staff List (Filtered by Category)
    const activeEmpList = await Employee.find({ ...categoryFilter, status: { $in: ['ACTIVE', 'Active', 'PROBATION', 'CONFIRMED'] } })
      .select('employeeId fullName firstName lastName department departmentName designation designationTitle status profilePicture photo mobile phone joiningDate')
      .sort({ employeeId: 1 })
      .lean();

    const categoryEmpIds = activeEmpList.map(e => e.employeeId).filter(Boolean);
    const categoryObjectIds = activeEmpList.map(e => e._id);

    // 4. Today's Attendance Counts for Target Category
    const attendanceScope = getScopeQuery(req.user, 'attendance');
    const [todayRecords, todayLeaves] = await Promise.all([
      Attendance.find({
        dateString: todayStr,
        $or: [
          { employeeId: { $in: categoryEmpIds } },
          { employeeCode: { $in: categoryEmpIds } },
          { employee: { $in: categoryObjectIds } }
        ],
        ...attendanceScope
      }).lean(),
      LeaveRequest.find({
        status: 'APPROVED',
        $or: [
          { employeeId: { $in: categoryEmpIds } },
          { employee: { $in: categoryObjectIds } }
        ],
        startDate: { $lte: new Date(todayStr + 'T23:59:59.999Z') },
        endDate: { $gte: new Date(todayStr + 'T00:00:00.000Z') }
      }).lean()
    ]);

    const presentCount = todayRecords.filter(r => ['PRESENT', 'P', 'LATE', 'HALF_DAY'].includes(String(r.status || '').toUpperCase())).length;
    const absentCount = todayRecords.filter(r => ['ABSENT', 'A', 'AB'].includes(String(r.status || '').toUpperCase())).length;
    const leaveCount = todayLeaves.length || todayRecords.filter(r => ['LEAVE', 'ON_LEAVE', 'CL', 'SL'].includes(String(r.status || '').toUpperCase())).length;
    const weeklyOffCount = todayRecords.filter(r => ['WEEKLY_OFF', 'WO'].includes(String(r.status || '').toUpperCase())).length;
    const holidayCount = todayRecords.filter(r => ['HOLIDAY', 'H'].includes(String(r.status || '').toUpperCase())).length;

    const effectiveTotal = activeEmployees || totalEmployees || 0;
    const attendancePercentage = effectiveTotal > 0 ? Math.round((presentCount / effectiveTotal) * 100) : 0;

    const attendanceMap = {};
    todayRecords.forEach(r => {
      if (r.employeeId) attendanceMap[r.employeeId] = r;
      if (r.employeeCode) attendanceMap[r.employeeCode] = r;
      if (r.employee) attendanceMap[String(r.employee)] = r;
    });

    const leaveEmpIds = new Set(todayLeaves.map(l => String(l.employeeId || l.employee)));

    const todayAttendanceList = activeEmpList.map(emp => {
      const att = attendanceMap[emp.employeeId] || attendanceMap[String(emp._id)] || null;
      let status = 'UNMARKED';
      let markedBy = '--';
      let markedAt = '--';

      if (att) {
        status = att.status || 'PRESENT';
        markedBy = att.regularizedBy || att.source || 'HR Admin';
        markedAt = att.createdAt ? new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
      } else if (leaveEmpIds.has(emp.employeeId) || leaveEmpIds.has(String(emp._id))) {
        status = 'LEAVE';
        markedBy = 'Leave Approved';
      }

      return {
        _id: emp._id,
        employeeId: emp.employeeId,
        fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        department: emp.departmentName || emp.department || 'General',
        designation: emp.designationTitle || emp.designation || 'Staff',
        status,
        markedBy,
        markedAt,
        mobile: emp.mobile || emp.phone || '--',
        joiningDate: emp.joiningDate ? getDateString(emp.joiningDate) : '--'
      };
    });

    // 5. HR Analytics
    const deptAttendanceMap = {};
    activeEmpList.forEach(emp => {
      const d = emp.departmentName || emp.department || 'General';
      if (!deptAttendanceMap[d]) deptAttendanceMap[d] = { total: 0, present: 0 };
      deptAttendanceMap[d].total += 1;
      const att = attendanceMap[emp.employeeId] || attendanceMap[String(emp._id)];
      if (att && ['PRESENT', 'P', 'LATE'].includes(String(att.status || '').toUpperCase())) {
        deptAttendanceMap[d].present += 1;
      }
    });

    const departmentPerformance = Object.keys(deptAttendanceMap).map(d => ({
      department: d,
      total: deptAttendanceMap[d].total,
      present: deptAttendanceMap[d].present,
      percentage: Math.round((deptAttendanceMap[d].present / deptAttendanceMap[d].total) * 100)
    }));

    const workforceByDept = {};
    activeEmpList.forEach(emp => {
      const d = emp.departmentName || emp.department || 'General';
      workforceByDept[d] = (workforceByDept[d] || 0) + 1;
    });

    const empTypeBreakdown = await Employee.aggregate([
      { $match: { ...categoryFilter } },
      { $group: { _id: '$employmentType', count: { $sum: 1 } } }
    ]);

    const empStatusBreakdown = await Employee.aggregate([
      { $match: { ...categoryFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          newJoinersThisMonth,
          totalDepartments,
          presentToday: presentCount,
          absentToday: absentCount,
          leaveToday: leaveCount,
          weeklyOffToday: weeklyOffCount,
          holidayToday: holidayCount,
          attendancePercentage: isNaN(attendancePercentage) ? 0 : Math.min(100, attendancePercentage)
        },
        todayAttendance: todayAttendanceList,
        analytics: {
          departmentPerformance,
          workforceByDept,
          employmentTypeDistribution: empTypeBreakdown.map(i => ({ type: i._id || 'Full Time', count: i.count })),
          employeeStatusDistribution: empStatusBreakdown.map(i => ({ status: i._id || 'ACTIVE', count: i.count }))
        }
      }
    });
  } catch (error) {
    console.error('[Core HRMS Dashboard Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. GET /api/hrms/core/employees
 * List only Non-Technical Staff
 */
const getNonTechnicalStaffList = async (req, res) => {
  try {
    await ensureReferenceNonTechStaff();
    const scopeFilter = getScopeQuery(req.user, 'employee');
    const nonTechFilter = getNonTechFilter(scopeFilter);
    const { search, department, status } = req.query;

    const query = { ...nonTechFilter };
    if (department && department !== 'ALL') query.departmentName = department;
    if (status && status !== 'ALL') query.status = status;
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
        { mobile: searchRegex }
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. POST /api/hrms/core/employees
 * Create a new Non-Technical Staff record (explicitly tagged as non-technical)
 */
const createNonTechnicalEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      mobile,
      email,
      department,
      designation,
      employmentType,
      joiningDate,
      address,
      city,
      state,
      pinCode
    } = req.body;

    if (!employeeId || !firstName) {
      return res.status(400).json({ success: false, message: 'Employee ID and First Name are required' });
    }

    const existing = await Employee.findOne({ employeeId: employeeId.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Employee ID ${employeeId} already exists.` });
    }

    const newEmp = new Employee({
      employeeId: employeeId.trim().toUpperCase(),
      employeeCode: employeeId.trim().toUpperCase(),
      firstName: firstName.trim(),
      middleName: (middleName || '').trim(),
      lastName: (lastName || '').trim(),
      fullName: `${firstName} ${lastName || ''}`.trim(),
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      mobile: mobile || '',
      phone: mobile || '9999999999',
      email: email || `${employeeId.toLowerCase()}@bjkhealthcare.com`,
      department: department || 'Administration',
      departmentName: department || 'Administration',
      designation: designation || 'Office Assistant',
      employmentType: employmentType || 'Full Time',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      status: 'ACTIVE',
      employmentStatus: 'Active',
      isNonTechnical: true,
      staffCategory: 'NON_TECHNICAL',
      address: {
        addressLine1: address || '',
        city: city || 'Ahmedabad',
        state: state || 'Gujarat',
        pinCode: pinCode || ''
      }
    });

    await newEmp.save();

    await AuditLog.create({
      action: 'NON_TECHNICAL_STAFF_CREATED',
      entity: 'Employee',
      entityId: newEmp._id.toString(),
      user: req.user?.email || 'HR Admin',
      role: req.user?.role || 'HR_ADMIN',
      changes: {
        employeeId: newEmp.employeeId,
        fullName: newEmp.fullName,
        department: newEmp.departmentName
      }
    }).catch(err => console.warn('Audit error:', err.message));

    res.status(201).json({ success: true, message: 'Non-Technical Staff created successfully', data: newEmp });
  } catch (error) {
    console.error('[Create Non-Technical Staff Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. DELETE /api/hrms/core/employees/:id
 * Delete / remove a non-technical staff record
 */
const deleteNonTechnicalEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { employeeId: id }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Staff record not found' });
    }

    // Delete attendance associated with this non-technical staff
    await Attendance.deleteMany({ employeeId: employee.employeeId });
    await Employee.findByIdAndDelete(employee._id);

    await AuditLog.create({
      action: 'NON_TECHNICAL_STAFF_DELETED',
      entity: 'Employee',
      entityId: employee._id.toString(),
      user: req.user?.email || 'HR Admin',
      role: req.user?.role || 'HR_ADMIN',
      changes: {
        employeeId: employee.employeeId,
        fullName: employee.fullName
      }
    }).catch(err => console.warn('Audit error:', err.message));

    res.json({ success: true, message: `Staff record ${employee.employeeId} removed successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. POST /api/hrms/core/attendance/mark
 * Mark or update individual non-technical employee attendance for a specific date
 */
const markAttendanceIndividual = async (req, res) => {
  try {
    const { employeeId, date, status, remarks } = req.body;
    if (!employeeId || !status) {
      return res.status(400).json({ success: false, message: 'Employee ID and Status are required' });
    }

    const dateString = date ? getDateString(date) : getDateString(new Date());
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const validStatuses = ['PRESENT', 'ABSENT', 'LEAVE', 'WEEKLY_OFF', 'HOLIDAY', 'HALF_DAY', 'LATE'];
    const cleanStatus = status.toUpperCase();
    if (!validStatuses.includes(cleanStatus)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    let record = await Attendance.findOne({
      $or: [
        { employee: employee._id, dateString },
        { employeeCode: employee.employeeId, attendanceDate: dateString },
        { employeeId: employee.employeeId, dateString }
      ]
    });
    const isNew = !record;
    const oldStatus = record ? record.status : null;

    if (!record) {
      record = new Attendance({
        employee: employee._id,
        employeeId: employee.employeeId,
        employeeCode: employee.employeeId,
        attendanceDate: dateString,
        employeeName: employee.fullName,
        departmentName: employee.departmentName,
        branchName: employee.branchName || 'Ahmedabad Branch',
        date: new Date(dateString),
        dateString,
        source: 'MANUAL'
      });
    } else {
      record.employeeCode = employee.employeeId;
      record.attendanceDate = dateString;
      record.employeeName = employee.fullName;
      record.departmentName = employee.departmentName;
    }

    record.status = cleanStatus;
    record.remarks = remarks || `Manually marked ${cleanStatus} by HR`;
    record.updatedBy = req.user?._id;
    record.updatedAt = new Date();

    if (cleanStatus === 'PRESENT') {
      record.workingHours = 8;
    } else if (cleanStatus === 'HALF_DAY') {
      record.workingHours = 4;
    } else {
      record.workingHours = 0;
    }

    await record.save();

    await AuditLog.create({
      action: isNew ? 'ATTENDANCE_MARKED' : 'ATTENDANCE_UPDATED',
      entity: 'Attendance',
      entityId: record._id.toString(),
      user: req.user?.email || req.user?.name || 'HR Admin',
      role: req.user?.role || 'HR_ADMIN',
      changes: {
        employeeId: employee.employeeId,
        employeeName: employee.fullName,
        date: dateString,
        previousStatus: oldStatus,
        newStatus: cleanStatus
      }
    }).catch(err => console.warn('AuditLog Error:', err.message));

    res.json({
      success: true,
      message: `Attendance marked as ${cleanStatus} for ${employee.fullName}`,
      record
    });
  } catch (error) {
    console.error('[Mark Attendance Individual Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. POST /api/hrms/core/attendance/bulk
 * Bulk mark attendance for non-technical employees
 */
const bulkMarkAttendance = async (req, res) => {
  try {
    const { employeeIds, date, status, remarks } = req.body;
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ success: false, message: 'List of Employee IDs is required' });
    }
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const dateString = date ? getDateString(date) : getDateString(new Date());
    const cleanStatus = status.toUpperCase();

    const employees = await Employee.find({ employeeId: { $in: employeeIds } });
    if (!employees || employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No matching employees found' });
    }

    let updatedCount = 0;
    const auditChanges = [];

    for (const emp of employees) {
      let record = await Attendance.findOne({
        $or: [
          { employee: emp._id, dateString },
          { employeeCode: emp.employeeId, attendanceDate: dateString },
          { employeeId: emp.employeeId, dateString }
        ]
      });
      const oldStatus = record ? record.status : null;

      if (!record) {
        record = new Attendance({
          employee: emp._id,
          employeeId: emp.employeeId,
          employeeCode: emp.employeeId,
          attendanceDate: dateString,
          employeeName: emp.fullName,
          departmentName: emp.departmentName,
          branchName: emp.branchName || 'Ahmedabad Branch',
          date: new Date(dateString),
          dateString,
          source: 'MANUAL'
        });
      } else {
        record.employeeCode = emp.employeeId;
        record.attendanceDate = dateString;
        record.employeeName = emp.fullName;
        record.departmentName = emp.departmentName;
      }

      record.status = cleanStatus;
      record.remarks = remarks || `Bulk marked ${cleanStatus} by HR`;
      record.updatedBy = req.user?._id;
      record.updatedAt = new Date();

      if (cleanStatus === 'PRESENT') {
        record.workingHours = 8;
      } else if (cleanStatus === 'HALF_DAY') {
        record.workingHours = 4;
      } else {
        record.workingHours = 0;
      }

      await record.save();
      updatedCount++;

      auditChanges.push({
        employeeId: emp.employeeId,
        employeeName: emp.fullName,
        previousStatus: oldStatus,
        newStatus: cleanStatus
      });
    }

    await AuditLog.create({
      action: 'BULK_ATTENDANCE_MARKED',
      entity: 'Attendance',
      user: req.user?.email || req.user?.name || 'HR Admin',
      role: req.user?.role || 'HR_ADMIN',
      changes: {
        date: dateString,
        targetStatus: cleanStatus,
        totalUpdated: updatedCount,
        records: auditChanges.slice(0, 50)
      }
    }).catch(err => console.warn('AuditLog Error:', err.message));

    res.json({
      success: true,
      message: `Successfully marked ${updatedCount} employees as ${cleanStatus} for ${dateString}`,
      updatedCount
    });
  } catch (error) {
    console.error('[Bulk Mark Attendance Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. GET /api/hrms/core/attendance/history
 * Attendance history for Non-Technical Staff
 */
const getAttendanceHistory = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      department,
      designation,
      status,
      employeeSearch,
      page = 1,
      limit = 50
    } = req.query;

    const scopeFilter = getScopeQuery(req.user, 'employee');
    const isExplicitNonTech = req.originalUrl.includes('/core/') || req.query.employeeCategory === 'NON_TECHNICAL' || req.query.category === 'NON_TECHNICAL';
    const targetCategory = isExplicitNonTech ? 'NON_TECHNICAL' : (req.query.employeeCategory || req.query.category || 'TECHNICAL');
    const categoryFilter = getCategoryFilter(targetCategory, scopeFilter);
    const targetEmployees = await Employee.find(categoryFilter).select('employeeId').lean();
    const targetEmpIds = targetEmployees.map(e => e.employeeId).filter(Boolean);
    const targetObjectIds = targetEmployees.map(e => e._id);

    const query = {
      $or: [
        { employeeId: { $in: targetEmpIds } },
        { employeeCode: { $in: targetEmpIds } },
        { employee: { $in: targetObjectIds } }
      ]
    };

    if (dateFrom && dateTo) {
      query.dateString = { $gte: dateFrom, $lte: dateTo };
    } else if (dateFrom) {
      query.dateString = { $gte: dateFrom };
    } else if (dateTo) {
      query.dateString = { $lte: dateTo };
    }

    if (department && department !== 'ALL') {
      query.departmentName = department;
    }

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (employeeSearch && employeeSearch.trim()) {
      const searchRegex = new RegExp(employeeSearch.trim(), 'i');
      query.$or = [
        { employeeName: searchRegex },
        { employeeId: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [total, records] = await Promise.all([
      Attendance.countDocuments(query),
      Attendance.find(query)
        .sort({ dateString: -1, employeeId: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[Attendance History Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. GET /api/hrms/core/my-attendance
 * Non-Technical Staff Self Service: Month Calendar & Statistics
 */
const getMyAttendance = async (req, res) => {
  try {
    const targetEmployeeId = req.user?.employeeId || req.query.employeeId;
    if (!targetEmployeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID required' });
    }

    const employee = await Employee.findOne({ employeeId: targetEmployeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);

    const monthPadded = month < 10 ? `0${month}` : `${month}`;
    const startStr = `${year}-${monthPadded}-01`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endStr = `${year}-${monthPadded}-${lastDayOfMonth}`;

    const records = await Attendance.find({
      employeeId: targetEmployeeId,
      dateString: { $gte: startStr, $lte: endStr }
    }).lean();

    const todayStr = getDateString(now);
    const todayRecord = records.find(r => r.dateString === todayStr);

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let weeklyOffCount = 0;

    const calendarMap = {};
    records.forEach(r => {
      calendarMap[r.dateString] = r.status;
      if (['PRESENT', 'P', 'LATE', 'HALF_DAY'].includes(r.status)) presentCount++;
      else if (['ABSENT', 'A'].includes(r.status)) absentCount++;
      else if (['LEAVE', 'ON_LEAVE'].includes(r.status)) leaveCount++;
      else if (['WEEKLY_OFF', 'WO'].includes(r.status)) weeklyOffCount++;
    });

    const totalTrackedDays = presentCount + absentCount + leaveCount;
    const attendancePercentage = totalTrackedDays > 0 ? Math.round((presentCount / totalTrackedDays) * 100) : 100;

    res.json({
      success: true,
      data: {
        employee: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          department: employee.departmentName,
          designation: employee.designation,
          status: employee.status
        },
        todayStatus: todayRecord ? todayRecord.status : 'UNMARKED',
        monthStats: {
          month: monthPadded,
          year,
          presentDays: presentCount,
          absentDays: absentCount,
          leaveDays: leaveCount,
          weeklyOffDays: weeklyOffCount,
          attendancePercentage
        },
        calendar: calendarMap
      }
    });
  } catch (error) {
    console.error('[Get My Attendance Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCoreHRMSDashboard,
  getNonTechnicalStaffList,
  createNonTechnicalEmployee,
  deleteNonTechnicalEmployee,
  markAttendanceIndividual,
  bulkMarkAttendance,
  getAttendanceHistory,
  getMyAttendance
};
