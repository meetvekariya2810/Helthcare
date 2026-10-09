const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
  User,
  Employee,
  Department,
  Role,
  AuditLog,
  LoginActivity,
  UserSession
} = require('../models');
const { ROLES, PERMISSIONS, ROLE_PERMISSIONS, hasPermission } = require('../config/rbac');
const {
  resolveDataScope,
  getScopeQuery,
  canAccessRecord,
  canAccessDocument,
  getScopeLabel
} = require('../services/hrms/dataScopeService');
const { buildEmployeeChecklist } = require('../services/hrms/documentChecklistService');

// Helper to mask sensitive fields if caller lacks sensitive permission
const sanitizeEmployee = (employee, reqUser) => {
  if (!employee) return null;
  const empObj = employee.toObject ? employee.toObject() : { ...employee };
  const callerRole = (reqUser?.role || '').toUpperCase();
  const isHR = ['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR'].includes(callerRole);
  const isSuperAdmin = ['SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'SYSTEM_ADMINISTRATOR'].includes(callerRole);
  const isDirector = callerRole === 'DIRECTOR';
  const isSelf = (reqUser?.employeeId && reqUser.employeeId === empObj.employeeId) ||
                 (reqUser?.email && reqUser.email === empObj.email);

  if (!isHR && !isSuperAdmin && !isDirector) {
    // Non-HR/Admin callers cannot see private government IDs, bank details, or detailed payroll breakdowns
    if (empObj.sensitiveData) {
      if (!isSelf) {
        empObj.sensitiveData = {
          medicalFitness: empObj.sensitiveData.medicalFitness
        };
        delete empObj.basicSalary;
      } else {
        // Self can see their own info but mask sensitive ID digits for security
        if (empObj.sensitiveData.aadhaarNumber) {
          empObj.sensitiveData.aadhaarNumber = 'XXXX-XXXX-' + empObj.sensitiveData.aadhaarNumber.slice(-4);
        }
        if (empObj.sensitiveData.panNumber) {
          empObj.sensitiveData.panNumber = 'XXXXX' + empObj.sensitiveData.panNumber.slice(-4);
        }
        if (empObj.sensitiveData.bankDetails?.accountNumber) {
          empObj.sensitiveData.bankDetails.accountNumber = 'XXXX' + empObj.sensitiveData.bankDetails.accountNumber.slice(-4);
        }
      }
    }
  }

  // Filter documents array based on canAccessDocument
  if (Array.isArray(empObj.documents)) {
    empObj.documents = empObj.documents.filter(doc => canAccessDocument(reqUser, doc, empObj));
  }

  return empObj;
};

// ==========================================
// 1. EMPLOYEE DIRECTORY & MANAGEMENT
// ==========================================

// GET /api/hr/employees
const getEmployees = async (req, res) => {
  try {
    const {
      search,
      department,
      manager,
      status,
      designation,
      active,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = -1,
      staffCategory,
      isNonTechnical
    } = req.query;

    const baseScopeQuery = getScopeQuery(req.user, 'employee');
    const query = { ...baseScopeQuery };

    if (staffCategory === 'NON_TECHNICAL' || isNonTechnical === 'true') {
      query.$or = [{ isNonTechnical: true }, { staffCategory: 'NON_TECHNICAL' }];
    } else if (staffCategory !== 'ALL') {
      query.isNonTechnical = { $ne: true };
      query.staffCategory = { $ne: 'NON_TECHNICAL' };
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      const searchConditions = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { fullName: searchRegex },
        { employeeId: searchRegex },
        { employeeCode: searchRegex },
        { email: searchRegex },
        { workEmail: searchRegex },
        { designationTitle: searchRegex },
        { departmentName: searchRegex }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    if (department && department !== 'ALL') {
      query.departmentName = new RegExp(String(department).trim(), 'i');
    }

    if (manager) {
      if (mongoose.isValidObjectId(manager)) {
        query.reportingManager = manager;
      } else {
        query.managerName = new RegExp(String(manager).trim(), 'i');
      }
    }

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (designation && designation !== 'ALL') {
      query.designationTitle = new RegExp(String(designation).trim(), 'i');
    }

    if (active !== undefined && active !== 'ALL') {
      const isActiveBool = active === 'true' || active === true;
      query.status = isActiveBool ? { $in: ['ACTIVE', 'ON_PROBATION'] } : { $in: ['INACTIVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED'] };
    }

    if (req.query.location && req.query.location !== 'ALL') {
      query.facility = new RegExp(String(req.query.location).trim(), 'i');
    }

    if (req.query.employmentType && req.query.employmentType !== 'ALL') {
      query.employmentType = String(req.query.employmentType).toUpperCase().trim();
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, rawEmployees] = await Promise.all([
      Employee.countDocuments(query),
      Employee.find(query)
        .populate('reportingManager', 'firstName lastName fullName employeeId designationTitle photo')
        .populate('user', 'role isActive lastLogin isLocked firstLogin mustChangePassword')
        .sort({ [sortBy]: parseInt(sortOrder, 10) })
        .skip(skip)
        .limit(limitNum)
    ]);

    const sanitized = rawEmployees.map(emp => sanitizeEmployee(emp, req.user));

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      employees: sanitized
    });
  } catch (error) {
    console.error('[HR Controller - getEmployees]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee directory.', error: error.message });
  }
};

// GET /api/hr/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = null;
    const cleanId = String(id || '').trim();

    if (mongoose.isValidObjectId(cleanId)) {
      employee = await Employee.findById(cleanId)
        .populate('reportingManager', 'firstName lastName fullName employeeId designationTitle email workEmail phone photo')
        .populate('user', 'role email isActive lastLogin isLocked mustChangePassword firstLogin createdAt');
    }

    if (!employee) {
      const idRegex = new RegExp(`^${cleanId}$`, 'i');
      employee = await Employee.findOne({
        $or: [
          { employeeId: idRegex },
          { employeeCode: idRegex },
          { email: cleanId.toLowerCase() },
          { workEmail: cleanId.toLowerCase() }
        ]
      })
        .populate('reportingManager', 'firstName lastName fullName employeeId designationTitle email workEmail phone photo')
        .populate('user', 'role email isActive lastLogin isLocked mustChangePassword firstLogin createdAt');
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    // Verify Data Scope access
    if (!canAccessRecord(req.user, employee, 'employee')) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not have permission to view this employee profile.' });
    }

    const sanitized = sanitizeEmployee(employee, req.user);
    return res.status(200).json({ success: true, employee: sanitized });
  } catch (error) {
    console.error('[HR Controller - getEmployeeById]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee profile.', error: error.message });
  }
};

// POST /api/hr/employees (Employee Creation + Account Provisioning)
const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      middleName = '',
      lastName,
      personalEmail = '',
      workEmail,
      email,
      phone,
      workPhone = '',
      personalPhone = '',
      department,
      subDepartment = '',
      designation,
      reportingManager,
      managerName = '',
      role = 'EMPLOYEE',
      facility = 'BJK Unit 1 - Formulations Facility',
      location = 'Ahmedabad',
      grade = 'L1',
      level = 'Associate',
      employeeCategory = 'Full Time Core',
      employmentType = 'FULL_TIME',
      employmentStatus = 'ACTIVE',
      basicSalary = 0,
      joiningDate = new Date(),
      probationEndDate = null,
      dateOfBirth = null,
      gender = 'Male',
      bloodGroup = 'O+',
      maritalStatus = 'Single',
      nationality = 'Indian',
      currentAddress = '',
      permanentAddress = '',
      city = 'Ahmedabad',
      state = 'Gujarat',
      country = 'India',
      postalCode = '382330',
      emergencyContactName = '',
      emergencyContactRelation = '',
      emergencyContactPhone = '',
      temporaryPassword = null,
      customEmployeeId = null,
      sensitiveData = {}
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'First name and Last name are required.' });
    }

    const primaryEmail = (workEmail || email || personalEmail || '').toLowerCase().trim();
    if (!primaryEmail) {
      return res.status(400).json({ success: false, message: 'A valid email address is required for employee onboarding.' });
    }

    // Check duplicate email
    const existingEmployee = await Employee.findOne({
      $or: [{ email: primaryEmail }, { workEmail: primaryEmail }]
    });
    if (existingEmployee) {
      return res.status(409).json({ success: false, message: `An employee with email [${primaryEmail}] already exists.` });
    }

    const existingUser = await User.findOne({ email: primaryEmail });
    if (existingUser && existingUser.employeeId) {
      return res.status(409).json({ success: false, message: `A user account with email [${primaryEmail}] is already assigned to employee ID [${existingUser.employeeId}].` });
    }

    // Generate unique employee ID if not provided
    let empId = customEmployeeId ? String(customEmployeeId).toUpperCase().trim() : null;
    if (!empId) {
      const count = await Employee.countDocuments({});
      empId = `BJK-EMP-${String(count + 101).padStart(4, '0')}`;
      let exists = await Employee.findOne({ employeeId: empId });
      while (exists) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        empId = `BJK-EMP-${rand}`;
        exists = await Employee.findOne({ employeeId: empId });
      }
    }

    // Generate temporary password if not provided
    const rawTempPassword = temporaryPassword || `BJK@${crypto.randomBytes(3).toString('hex')}!`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawTempPassword, salt);

    // Resolve default dataScope based on role
    let assignedScope = 'SELF';
    if (['SUPER_ADMIN', 'DIRECTOR'].includes(role)) assignedScope = 'SYSTEM';
    else if (['HR_ADMIN', 'HR_MANAGER', 'IT_ADMIN'].includes(role)) assignedScope = 'GLOBAL';
    else if (['HR_EXECUTIVE', 'FINANCE_MANAGER', 'PAYROLL_ADMIN', 'AUDITOR'].includes(role)) assignedScope = 'COMPANY';
    else if (['QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_MANAGER', 'EXPORT_MANAGER'].includes(role)) assignedScope = 'DEPARTMENT';
    else if (role === 'TEAM_LEAD') assignedScope = 'TEAM';

    // 1. Create or Update User account
    let userRecord = existingUser;
    if (!userRecord) {
      userRecord = new User({
        name: `${firstName} ${lastName}`.trim(),
        email: primaryEmail,
        workEmail: primaryEmail,
        personalEmail: personalEmail || '',
        password: passwordHash,
        passwordHash: passwordHash,
        role: role || 'EMPLOYEE',
        department: typeof department === 'string' ? department : 'General',
        employeeId: empId,
        dataScope: assignedScope,
        firstLogin: true,
        mustChangePassword: true,
        temporaryPassword: true,
        isActive: employmentStatus === 'ACTIVE' || employmentStatus === 'ON_PROBATION',
        status: 'ACTIVE'
      });
      await userRecord.save();
    } else {
      userRecord.name = `${firstName} ${lastName}`.trim();
      userRecord.password = passwordHash;
      userRecord.passwordHash = passwordHash;
      userRecord.role = role || 'EMPLOYEE';
      userRecord.department = typeof department === 'string' ? department : 'General';
      userRecord.employeeId = empId;
      userRecord.dataScope = assignedScope;
      userRecord.firstLogin = true;
      userRecord.mustChangePassword = true;
      userRecord.temporaryPassword = true;
      userRecord.isActive = true;
      await userRecord.save();
    }

    // 2. Create Employee record
    const employeeDoc = new Employee({
      employeeId: empId,
      employeeCode: empId,
      firstName: String(firstName || '').trim(),
      middleName: String(middleName || '').trim(),
      lastName: String(lastName || '').trim(),
      fullName: `${String(firstName || '').trim()} ${middleName ? String(middleName).trim() + ' ' : ''}${String(lastName || '').trim()}`.trim(),
      email: primaryEmail,
      workEmail: primaryEmail,
      personalEmail: String(personalEmail || '').trim(),
      phone: String(phone || personalPhone || workPhone || '').trim(),
      workPhone: String(workPhone || '').trim(),
      personalPhone: String(personalPhone || phone || '').trim(),
      department: department || 'Operations',
      departmentName: typeof department === 'string' ? department : 'Operations',
      subDepartment: String(subDepartment || '').trim(),
      designation: designation || 'Executive',
      designationTitle: typeof designation === 'string' ? designation : 'Executive',
      reportingManager: mongoose.isValidObjectId(reportingManager) ? reportingManager : null,
      managerName: String(managerName || '').trim(),
      facility: facility || 'BJK Unit 1 - Formulations Facility',
      location: String(location || 'Ahmedabad').trim(),
      grade: String(grade || 'L2').trim(),
      level: String(level || 'Executive').trim(),
      employeeCategory: String(employeeCategory || 'Core Staff').trim(),
      employmentType: employmentType || 'FULL_TIME',
      employmentStatus: employmentStatus || 'ACTIVE',
      status: (employmentStatus === 'ACTIVE' || employmentStatus === 'ON_PROBATION') ? 'ACTIVE' : 'INACTIVE',
      basicSalary: Number(basicSalary) || 0,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      probationEndDate: probationEndDate ? new Date(probationEndDate) : null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      bloodGroup,
      maritalStatus,
      nationality,
      currentAddress,
      permanentAddress,
      city,
      state,
      country,
      postalCode,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      emergencyContact: {
        name: emergencyContactName,
        relation: emergencyContactRelation,
        phone: emergencyContactPhone,
        address: currentAddress
      },
      user: userRecord._id,
      sensitiveData: sensitiveData || {},
      createdBy: req.user?.name || 'HR Master'
    });

    await employeeDoc.save();

    // Auto-initialize Statutory Leave Balances
    try {
      const { initLeaveMaster, getOrInitLeaveBalance } = require('../services/hrms/leaveService');
      await initLeaveMaster();
      await getOrInitLeaveBalance(employeeDoc._id);
    } catch (leaveInitErr) {
      console.warn('[HR Controller - createEmployee]: Leave init warning:', leaveInitErr.message);
    }

    // 3. Create AuditLog
    await AuditLog.logAction({
      user: req.user,
      action: 'EMPLOYEE_CREATE',
      module: 'HRMS',
      resource: 'Employee',
      resourceId: employeeDoc._id,
      newData: {
        employeeId: empId,
        name: employeeDoc.fullName,
        email: primaryEmail,
        department: employeeDoc.departmentName,
        role: role
      },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'BJK-HRMS',
      details: `HR Administrator created employee [${empId}] and provisioned account [${primaryEmail}] with role [${role}].`
    });

    return res.status(201).json({
      success: true,
      message: `Employee [${employeeDoc.fullName}] created and provisioned successfully.`,
      employee: sanitizeEmployee(employeeDoc, req.user),
      credentialsSetup: {
        employeeId: empId,
        email: primaryEmail,
        temporaryPassword: rawTempPassword, // Returned ONLY during initial creation so HR can provide it to the employee
        mustChangePassword: true,
        firstLogin: true,
        role,
        department: employeeDoc.departmentName
      }
    });
  } catch (error) {
    console.error('[HR Controller - createEmployee]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create employee.', error: error.message });
  }
};

// PATCH /api/hr/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let employee = null;
    const cleanId = String(id || '').trim();

    if (mongoose.isValidObjectId(cleanId)) {
      employee = await Employee.findById(cleanId);
    }
    if (!employee) {
      const idRegex = new RegExp(`^${cleanId}$`, 'i');
      employee = await Employee.findOne({
        $or: [
          { employeeId: idRegex },
          { employeeCode: idRegex },
          { email: cleanId.toLowerCase() },
          { workEmail: cleanId.toLowerCase() }
        ]
      });
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const oldData = employee.toObject();

    // Apply allowed fields
    const directFields = [
      'firstName', 'middleName', 'lastName', 'personalEmail', 'phone', 'workPhone', 'personalPhone',
      'subDepartment', 'managerName', 'facility', 'location', 'grade', 'level', 'employeeCategory',
      'employmentType', 'employmentStatus', 'status', 'basicSalary', 'grossSalary', 'probationStartDate',
      'probationEndDate', 'confirmationDate', 'resignationDate', 'lastWorkingDate', 'employmentRemarks',
      'dateOfBirth', 'gender', 'bloodGroup', 'maritalStatus', 'nationality', 'currentAddress',
      'permanentAddress', 'city', 'state', 'country', 'postalCode', 'emergencyContactName',
      'emergencyContactRelation', 'emergencyContactPhone', 'aadhaarNumber', 'panNumber', 'uanNumber'
    ];

    directFields.forEach(f => {
      if (updates[f] !== undefined) {
        employee[f] = updates[f];
      }
    });

    if (updates.firstName || updates.lastName || updates.middleName) {
      const fn = updates.firstName || employee.firstName || '';
      const mn = updates.middleName !== undefined ? updates.middleName : (employee.middleName || '');
      const ln = updates.lastName || employee.lastName || '';
      employee.fullName = `${fn} ${mn ? mn + ' ' : ''}${ln}`.trim();
    }

    if (updates.department) {
      employee.department = updates.department;
      employee.departmentName = typeof updates.department === 'string' ? updates.department : employee.departmentName;
    }

    if (updates.designation) {
      employee.designation = updates.designation;
      employee.designationTitle = typeof updates.designation === 'string' ? updates.designation : employee.designationTitle;
    }

    if (updates.reportingManager !== undefined) {
      employee.reportingManager = mongoose.isValidObjectId(updates.reportingManager) ? updates.reportingManager : null;
    }

    if (updates.sensitiveData && typeof updates.sensitiveData === 'object') {
      employee.sensitiveData = {
        ...employee.sensitiveData,
        ...updates.sensitiveData
      };
    }

    employee.updatedBy = req.user?.name || 'HR Master';
    await employee.save();

    // Sync linked User account if applicable
    if (employee.user || employee.email) {
      const userToSync = employee.user
        ? await User.findById(employee.user)
        : await User.findOne({ email: employee.email });

      if (userToSync) {
        userToSync.name = employee.fullName;
        if (updates.department) userToSync.department = employee.departmentName;
        if (updates.role) {
          userToSync.role = updates.role;
        }
        await userToSync.save({ validateBeforeSave: false });
      }
    }

    // Audit log
    await AuditLog.logAction({
      user: req.user,
      action: 'EMPLOYEE_UPDATE',
      module: 'HRMS',
      resource: 'Employee',
      resourceId: employee._id,
      oldData: { name: oldData.fullName, department: oldData.departmentName, status: oldData.status },
      newData: { name: employee.fullName, department: employee.departmentName, status: employee.status },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR updated profile for employee [${employee.employeeId} - ${employee.fullName}].`
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      employee: sanitizeEmployee(employee, req.user)
    });
  } catch (error) {
    console.error('[HR Controller - updateEmployee]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update employee.', error: error.message });
  }
};

// PATCH /api/hr/employees/:id/status (Account & Employment Lifecycle status change)
const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, employmentStatus, remarks, lastWorkingDate } = req.body;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const newStatus = (status || employmentStatus || 'ACTIVE').toUpperCase();
    const oldStatus = employee.status;

    employee.status = newStatus;
    employee.employmentStatus = newStatus;
    if (remarks) employee.employmentRemarks = remarks;
    if (lastWorkingDate) employee.lastWorkingDate = new Date(lastWorkingDate);
    if (newStatus === 'RESIGNED' || newStatus === 'TERMINATED') {
      employee.resignationDate = employee.resignationDate || new Date();
    }

    await employee.save();

    // Sync linked User
    const userToSync = employee.user
      ? await User.findById(employee.user)
      : await User.findOne({ email: employee.email });

    const isAccountActive = ['ACTIVE', 'ON_PROBATION'].includes(newStatus);
    if (userToSync) {
      userToSync.isActive = isAccountActive;
      userToSync.status = isAccountActive ? 'ACTIVE' : (newStatus === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE');
      await userToSync.save({ validateBeforeSave: false });

      // If inactive / resigned / terminated, terminate all active sessions
      if (!isAccountActive) {
        await UserSession.updateMany(
          { userId: userToSync._id, status: 'ACTIVE' },
          { status: 'TERMINATED', terminatedAt: new Date(), terminatedBy: req.user?.email || 'HR Master' }
        );
      }
    }

    await AuditLog.logAction({
      user: req.user,
      action: 'EMPLOYEE_STATUS_CHANGE',
      module: 'HRMS',
      resource: 'Employee',
      resourceId: employee._id,
      oldData: { status: oldStatus },
      newData: { status: newStatus, isActive: isAccountActive, remarks },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR changed status of employee [${employee.employeeId}] to [${newStatus}]. Account active: ${isAccountActive}.`
    });

    return res.status(200).json({
      success: true,
      message: `Employee status updated to [${newStatus}].`,
      employee: sanitizeEmployee(employee, req.user)
    });
  } catch (error) {
    console.error('[HR Controller - updateEmployeeStatus]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update employee status.', error: error.message });
  }
};

// POST /api/hr/employees/:id/reset-password
const resetEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, forcePasswordChange = true } = req.body;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const userToReset = employee.user
      ? await User.findById(employee.user)
      : await User.findOne({ email: employee.email });

    if (!userToReset) {
      return res.status(404).json({ success: false, message: 'Linked user login account not found for this employee.' });
    }

    const rawTempPassword = newPassword || `BJK@${crypto.randomBytes(3).toString('hex')}!`;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawTempPassword, salt);

    userToReset.password = hash;
    userToReset.passwordHash = hash;
    userToReset.mustChangePassword = Boolean(forcePasswordChange);
    userToReset.temporaryPassword = true;
    userToReset.isLocked = false;
    userToReset.lockedReason = '';
    userToReset.passwordChangedAt = new Date();
    await userToReset.save({ validateBeforeSave: false });

    // Invalidate all existing sessions
    await UserSession.updateMany(
      { userId: userToReset._id, status: 'ACTIVE' },
      { status: 'REVOKED', terminatedAt: new Date(), terminatedBy: req.user?.email || 'HR Reset' }
    );

    await AuditLog.logAction({
      user: req.user,
      action: 'USER_RESET_PASSWORD',
      module: 'SECURITY',
      resource: 'User',
      resourceId: userToReset._id,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR Administrator reset password and revoked all sessions for employee [${employee.employeeId} - ${userToReset.email}].`
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Active sessions revoked.',
      credentialInfo: {
        employeeId: employee.employeeId,
        email: userToReset.email,
        temporaryPassword: rawTempPassword, // Securely returned to HR to convey to user
        mustChangePassword: userToReset.mustChangePassword
      }
    });
  } catch (error) {
    console.error('[HR Controller - resetEmployeePassword]:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.', error: error.message });
  }
};

// POST /api/hr/employees/:id/force-logout
const forceLogoutEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const userId = employee.user || (await User.findOne({ email: employee.email }))?._id;

    if (userId) {
      await UserSession.updateMany(
        { userId, status: 'ACTIVE' },
        { status: 'TERMINATED', terminatedAt: new Date(), terminatedBy: req.user?.email || 'HR Force Logout' }
      );
    }

    await AuditLog.logAction({
      user: req.user,
      action: 'FORCE_LOGOUT',
      module: 'SECURITY',
      resource: 'UserSession',
      resourceId: userId,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR force terminated all active sessions for employee [${employee.employeeId}].`
    });

    return res.status(200).json({ success: true, message: `Terminated all active sessions for employee [${employee.employeeId}].` });
  } catch (error) {
    console.error('[HR Controller - forceLogoutEmployee]:', error);
    return res.status(500).json({ success: false, message: 'Failed to force logout employee.', error: error.message });
  }
};

// POST /api/hr/employees/:id/lock
const toggleLockEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { lock = true, reason = 'Administrative Lock by HR' } = req.body;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const userToLock = employee.user
      ? await User.findById(employee.user)
      : await User.findOne({ email: employee.email });

    if (!userToLock) {
      return res.status(404).json({ success: false, message: 'Linked user account not found.' });
    }

    userToLock.isLocked = Boolean(lock);
    userToLock.lockedReason = lock ? reason : '';
    if (lock) {
      userToLock.isActive = false;
      userToLock.status = 'LOCKED';
      await UserSession.updateMany(
        { userId: userToLock._id, status: 'ACTIVE' },
        { status: 'REVOKED', terminatedAt: new Date(), terminatedBy: req.user?.email || 'HR Lock' }
      );
    } else {
      userToLock.isActive = true;
      userToLock.status = 'ACTIVE';
    }

    await userToLock.save({ validateBeforeSave: false });

    await AuditLog.logAction({
      user: req.user,
      action: lock ? 'ACCOUNT_LOCK' : 'ACCOUNT_UNLOCK',
      module: 'SECURITY',
      resource: 'User',
      resourceId: userToLock._id,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR ${lock ? 'LOCKED' : 'UNLOCKED'} account for employee [${employee.employeeId}]. Reason: ${reason}`
    });

    return res.status(200).json({
      success: true,
      message: `Employee account ${lock ? 'locked' : 'unlocked'} successfully.`,
      isLocked: userToLock.isLocked
    });
  } catch (error) {
    console.error('[HR Controller - toggleLockEmployee]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update account lock state.', error: error.message });
  }
};

// GET /api/hr/employees/:id/activity
const getEmployeeActivity = async (req, res) => {
  try {
    const { id } = req.params;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (!canAccessRecord(req.user, employee, 'employee')) {
      return res.status(403).json({ success: false, message: 'Access denied to employee activity.' });
    }

    const userEmail = employee.email;
    const empId = employee.employeeId;
    const userId = employee.user;

    const [auditLogs, logins] = await Promise.all([
      AuditLog.find({
        $or: [
          { 'user.email': userEmail },
          { resourceId: String(employee._id) },
          { resourceId: empId },
          { recordId: empId }
        ]
      }).sort({ timestamp: -1 }).limit(50),
      LoginActivity.find({
        $or: [
          { email: userEmail },
          { employeeId: empId },
          { userId: userId || null }
        ]
      }).sort({ loginTime: -1 }).limit(30)
    ]);

    return res.status(200).json({
      success: true,
      employeeId: empId,
      activity: auditLogs,
      logins: logins
    });
  } catch (error) {
    console.error('[HR Controller - getEmployeeActivity]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee activity.', error: error.message });
  }
};

// GET /api/hr/employees/:id/login-history
const getEmployeeLoginHistory = async (req, res) => {
  try {
    const { id } = req.params;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (!canAccessRecord(req.user, employee, 'employee')) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const logins = await LoginActivity.find({
      $or: [
        { email: employee.email },
        { employeeId: employee.employeeId },
        { userId: employee.user || null }
      ]
    }).sort({ loginTime: -1 }).limit(50);

    return res.status(200).json({ success: true, logins });
  } catch (error) {
    console.error('[HR Controller - getEmployeeLoginHistory]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve login history.', error: error.message });
  }
};

// ==========================================
// 2. DOCUMENT MANAGEMENT & VERIFICATION
// ==========================================

// GET /api/hr/employees/:id/documents
const getEmployeeDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (!canAccessRecord(req.user, employee, 'employee')) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const allDocs = employee.documents || [];
    const authorizedDocs = allDocs.filter(doc => canAccessDocument(req.user, doc, employee));
    const { checklist, stats } = buildEmployeeChecklist(employee);

    return res.status(200).json({
      success: true,
      documents: authorizedDocs,
      checklist,
      stats
    });
  } catch (error) {
    console.error('[HR Controller - getEmployeeDocuments]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve documents.', error: error.message });
  }
};

// POST /api/hr/employees/:id/documents
const uploadEmployeeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      documentType,
      documentName,
      fileUrl,
      fileType = 'application/pdf',
      fileSize = 0,
      visibility = 'HR_ONLY',
      expiryDate = null,
      remarks = ''
    } = req.body;

    if (!documentType || !documentName) {
      return res.status(400).json({ success: false, message: 'Document type and name are required.' });
    }

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const newDoc = {
      documentId: 'DOC-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      documentType,
      documentName,
      fileUrl: fileUrl || `/uploads/docs/${employee.employeeId}-${Date.now()}.pdf`,
      fileType,
      fileSize: Number(fileSize) || 0,
      uploadedBy: req.user?.name || 'HR Master',
      uploadedAt: new Date(),
      verificationStatus: 'PENDING',
      visibility: visibility || 'HR_ONLY',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      version: 1,
      remarks
    };

    employee.documents.push(newDoc);
    await employee.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'DOCUMENT_UPLOAD',
      module: 'HRMS',
      resource: 'EmployeeDocument',
      resourceId: newDoc.documentId,
      newData: { employeeId: employee.employeeId, documentType, documentName, visibility },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR uploaded document [${documentName}] (${documentType}) for employee [${employee.employeeId}]. Visibility: ${visibility}.`
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: newDoc
    });
  } catch (error) {
    console.error('[HR Controller - uploadEmployeeDocument]:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload document.', error: error.message });
  }
};

// PATCH /api/hr/employees/:id/documents/:documentId
const updateEmployeeDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const { verificationStatus, visibility, expiryDate, remarks } = req.body;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const docIndex = employee.documents.findIndex(d => d.documentId === documentId || d._id.toString() === documentId);
    if (docIndex === -1) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const doc = employee.documents[docIndex];
    if (verificationStatus) {
      doc.verificationStatus = verificationStatus;
      if (verificationStatus === 'VERIFIED') {
        doc.verifiedBy = req.user?.name || 'HR Master';
        doc.verifiedAt = new Date();
      }
    }
    if (visibility) doc.visibility = visibility;
    if (expiryDate) doc.expiryDate = new Date(expiryDate);
    if (remarks !== undefined) doc.remarks = remarks;

    await employee.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'DOCUMENT_VERIFY',
      module: 'HRMS',
      resource: 'EmployeeDocument',
      resourceId: doc.documentId,
      newData: { verificationStatus: doc.verificationStatus, visibility: doc.visibility, verifiedBy: doc.verifiedBy },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR updated verification status of document [${doc.documentName}] for employee [${employee.employeeId}] to [${doc.verificationStatus}].`
    });

    return res.status(200).json({ success: true, message: 'Document updated successfully.', document: doc });
  } catch (error) {
    console.error('[HR Controller - updateEmployeeDocument]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update document.', error: error.message });
  }
};

// DELETE /api/hr/employees/:id/documents/:documentId
const deleteEmployeeDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    let employee = null;
    if (mongoose.isValidObjectId(id)) employee = await Employee.findById(id);
    if (!employee) employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const docIndex = employee.documents.findIndex(d => d.documentId === documentId || d._id.toString() === documentId);
    if (docIndex === -1) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const deletedDoc = employee.documents[docIndex];
    employee.documents.splice(docIndex, 1);
    await employee.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'DOCUMENT_DELETE',
      module: 'HRMS',
      resource: 'EmployeeDocument',
      resourceId: documentId,
      oldData: { name: deletedDoc.documentName, type: deletedDoc.documentType },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR removed document [${deletedDoc.documentName}] for employee [${employee.employeeId}].`
    });

    return res.status(200).json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('[HR Controller - deleteEmployeeDocument]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete document.', error: error.message });
  }
};

// ==========================================
// 3. DEPARTMENT MASTER APIs
// ==========================================

// GET /api/hr/departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({})
      .populate('headOfDepartment', 'firstName lastName fullName employeeId designationTitle photo email')
      .populate('managers', 'firstName lastName fullName employeeId designationTitle photo email')
      .sort({ name: 1 });

    // Aggregate employee and manager counts per department
    const employeeCounts = await Employee.aggregate([
      {
        $group: {
          _id: '$departmentName',
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: {
              $cond: [{ $in: ['$status', ['ACTIVE', 'ON_PROBATION']] }, 1, 0]
            }
          }
        }
      }
    ]);

    const countMap = {};
    employeeCounts.forEach(c => {
      if (c._id) countMap[c._id.toLowerCase()] = c;
    });

    const enriched = departments.map(d => {
      const dObj = d.toObject();
      const stats = countMap[d.name.toLowerCase()] || { totalEmployees: 0, activeEmployees: 0 };
      dObj.totalEmployees = stats.totalEmployees;
      dObj.activeEmployees = stats.activeEmployees;
      return dObj;
    });

    return res.status(200).json({ success: true, count: enriched.length, departments: enriched });
  } catch (error) {
    console.error('[HR Controller - getDepartments]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve departments.', error: error.message });
  }
};

// POST /api/hr/departments
const createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      facility = 'BJK Unit 1 - Formulations Facility',
      division = 'Operations',
      headOfDepartment,
      headOfDepartmentName = '',
      managers = [],
      description = '',
      budget = 0,
      complianceRequirements = [],
      permissions = []
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required.' });
    }

    const existing = await Department.findOne({
      $or: [{ name: name.trim() }, { code: code.toUpperCase().trim() }]
    });

    if (existing) {
      return res.status(409).json({ success: false, message: `Department with name [${name}] or code [${code}] already exists.` });
    }

    const department = new Department({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      facility,
      division,
      headOfDepartment: mongoose.isValidObjectId(headOfDepartment) ? headOfDepartment : null,
      headOfDepartmentName,
      managers: Array.isArray(managers) ? managers.filter(m => mongoose.isValidObjectId(m)) : [],
      description,
      budget: Number(budget) || 0,
      complianceRequirements,
      permissions,
      isActive: true
    });

    await department.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'DEPARTMENT_CREATE',
      module: 'HRMS',
      resource: 'Department',
      resourceId: department._id,
      newData: { name: department.name, code: department.code, facility: department.facility },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR created new department [${department.name}] (${department.code}).`
    });

    return res.status(201).json({ success: true, message: 'Department created successfully.', department });
  } catch (error) {
    console.error('[HR Controller - createDepartment]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create department.', error: error.message });
  }
};

// PATCH /api/hr/departments/:id
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const oldData = department.toObject();

    if (updates.name) department.name = updates.name.trim();
    if (updates.code) department.code = updates.code.toUpperCase().trim();
    if (updates.facility) department.facility = updates.facility;
    if (updates.division) department.division = updates.division;
    if (updates.headOfDepartment !== undefined) {
      department.headOfDepartment = mongoose.isValidObjectId(updates.headOfDepartment) ? updates.headOfDepartment : null;
    }
    if (updates.headOfDepartmentName !== undefined) department.headOfDepartmentName = updates.headOfDepartmentName;
    if (Array.isArray(updates.managers)) {
      department.managers = updates.managers.filter(m => mongoose.isValidObjectId(m));
    }
    if (updates.description !== undefined) department.description = updates.description;
    if (updates.budget !== undefined) department.budget = Number(updates.budget) || 0;
    if (Array.isArray(updates.complianceRequirements)) department.complianceRequirements = updates.complianceRequirements;
    if (Array.isArray(updates.permissions)) department.permissions = updates.permissions;
    if (updates.isActive !== undefined) department.isActive = Boolean(updates.isActive);

    await department.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'DEPARTMENT_UPDATE',
      module: 'HRMS',
      resource: 'Department',
      resourceId: department._id,
      oldData: { name: oldData.name, code: oldData.code, head: oldData.headOfDepartmentName },
      newData: { name: department.name, code: department.code, head: department.headOfDepartmentName },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR updated department [${department.name}].`
    });

    return res.status(200).json({ success: true, message: 'Department updated successfully.', department });
  } catch (error) {
    console.error('[HR Controller - updateDepartment]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update department.', error: error.message });
  }
};

// PATCH /api/hr/departments/:id/status
const updateDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    department.isActive = Boolean(isActive);
    await department.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'DEPARTMENT_STATUS_CHANGE',
      module: 'HRMS',
      resource: 'Department',
      resourceId: department._id,
      newData: { isActive: department.isActive },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR changed department [${department.name}] status to active = ${department.isActive}.`
    });

    return res.status(200).json({ success: true, message: `Department status updated to ${department.isActive ? 'Active' : 'Inactive'}.`, department });
  } catch (error) {
    console.error('[HR Controller - updateDepartmentStatus]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update department status.', error: error.message });
  }
};

// GET /api/hr/departments/:id/employees
const getDepartmentEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    let department = null;
    if (mongoose.isValidObjectId(id)) department = await Department.findById(id);
    if (!department) department = await Department.findOne({ code: id.toUpperCase() });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const employees = await Employee.find({
      $or: [
        { departmentName: new RegExp(`^${department.name}$`, 'i') },
        { department: department._id }
      ]
    }).select('firstName lastName fullName employeeId designationTitle status joiningDate photo workEmail email phone');

    return res.status(200).json({ success: true, department: department.name, count: employees.length, employees });
  } catch (error) {
    console.error('[HR Controller - getDepartmentEmployees]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve department employees.', error: error.message });
  }
};

// GET /api/hr/departments/:id/managers
const getDepartmentManagers = async (req, res) => {
  try {
    const { id } = req.params;
    let department = null;
    if (mongoose.isValidObjectId(id)) department = await Department.findById(id);
    if (!department) department = await Department.findOne({ code: id.toUpperCase() });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const managers = await Employee.find({
      $or: [
        { departmentName: new RegExp(`^${department.name}$`, 'i') },
        { department: department._id }
      ],
      designationTitle: { $regex: /manager|lead|head|director|supervisor/i }
    }).select('firstName lastName fullName employeeId designationTitle status photo workEmail email phone');

    return res.status(200).json({ success: true, department: department.name, count: managers.length, managers });
  } catch (error) {
    console.error('[HR Controller - getDepartmentManagers]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve department managers.', error: error.message });
  }
};

// ==========================================
// 4. ROLE & PERMISSION MANAGEMENT APIs
// ==========================================

// GET /api/hr/roles
const getRoles = async (req, res) => {
  try {
    const roleList = Object.entries(ROLE_PERMISSIONS).map(([roleKey, permissions]) => {
      return {
        role: roleKey,
        name: roleKey.replace(/_/g, ' '),
        description: getRoleDescription(roleKey),
        permissions,
        permissionCount: permissions.length
      };
    });

    return res.status(200).json({ success: true, roles: roleList });
  } catch (error) {
    console.error('[HR Controller - getRoles]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve roles.', error: error.message });
  }
};

const getRoleDescription = (role) => {
  switch (role) {
    case 'SUPER_ADMIN': return 'Full enterprise platform administration and audit authority';
    case 'DIRECTOR': return 'Executive oversight and high-level corporate intelligence';
    case 'HR_ADMIN': return 'Comprehensive HR workforce, credential, document, and access administration';
    case 'HR_MANAGER': return 'Human resources operations, employee lifecycle, and onboarding management';
    case 'HR_EXECUTIVE': return 'HR operations support, documentation, and attendance tracking';
    case 'DEPARTMENT_MANAGER': return 'Departmental operations, team management, and leave approvals';
    case 'QA_MANAGER': return 'Quality Assurance GMP compliance, deviation control, and audit oversight';
    case 'QC_MANAGER': return 'Quality Control laboratory analytics, assays, and sample approval';
    case 'PRODUCTION_MANAGER': return 'Plant execution, tablet/syrup manufacturing lines, and shift supervision';
    case 'WAREHOUSE_MANAGER': return 'Central warehouse storage, inventory movements, and cold chain';
    case 'REGULATORY_MANAGER': return 'Global market dossier authorizations and CDSCO compliance';
    case 'FINANCE_MANAGER': return 'Enterprise financial oversight, budgeting, and commercial claims';
    case 'PAYROLL_ADMIN': return 'Payroll processing, statutory tax compliance, and compensation';
    case 'EMPLOYEE': return 'Self-service workspace, punch attendance, tasks, and own profile';
    default: return 'Specialized pharmaceutical operations role';
  }
};

// GET /api/hr/permissions
const getPermissions = async (req, res) => {
  try {
    const permissionsByModule = {
      EMPLOYEE_HR: [
        { key: PERMISSIONS.EMPLOYEE_VIEW, label: 'View Employees Directory' },
        { key: PERMISSIONS.EMPLOYEE_CREATE, label: 'Create & Onboard Employee' },
        { key: PERMISSIONS.EMPLOYEE_UPDATE, label: 'Update Employee Information' },
        { key: PERMISSIONS.EMPLOYEE_DELETE, label: 'Delete / Archive Employee' },
        { key: PERMISSIONS.EMPLOYEE_VIEW_SENSITIVE, label: 'View Sensitive Personal & Bank Data' },
        { key: PERMISSIONS.EMPLOYEE_PERSONAL_VIEW, label: 'View Detailed Personal Records' },
        { key: PERMISSIONS.EMPLOYEE_PERSONAL_UPDATE, label: 'Edit Personal & Contact Records' },
        { key: PERMISSIONS.EMPLOYEE_DOCUMENT_VIEW, label: 'View Employee Documents' },
        { key: PERMISSIONS.EMPLOYEE_DOCUMENT_UPLOAD, label: 'Upload Employee Documents' },
        { key: PERMISSIONS.EMPLOYEE_DOCUMENT_DELETE, label: 'Delete Employee Documents' },
        { key: PERMISSIONS.EMPLOYEE_LOGIN_VIEW, label: 'View Login Activity & Sessions' },
        { key: PERMISSIONS.EMPLOYEE_ACTIVITY_VIEW, label: 'View Business Activity Timeline' }
      ],
      DEPARTMENT_MANAGER: [
        { key: PERMISSIONS.DEPARTMENT_VIEW, label: 'View Departments' },
        { key: PERMISSIONS.DEPARTMENT_CREATE, label: 'Create Department' },
        { key: PERMISSIONS.DEPARTMENT_UPDATE, label: 'Update Department Details' },
        { key: PERMISSIONS.MANAGER_VIEW, label: 'View Department Managers' },
        { key: PERMISSIONS.MANAGER_CREATE, label: 'Assign / Promote Managers' },
        { key: PERMISSIONS.MANAGER_UPDATE, label: 'Update Manager Scope' }
      ],
      SECURITY_ACCOUNTS: [
        { key: PERMISSIONS.USER_CREATE, label: 'Create Login Account' },
        { key: PERMISSIONS.USER_UPDATE, label: 'Update Account Attributes' },
        { key: PERMISSIONS.USER_DISABLE, label: 'Deactivate / Lock Account' },
        { key: PERMISSIONS.USER_RESET_PASSWORD, label: 'Reset Employee Password' },
        { key: PERMISSIONS.SESSION_MANAGE, label: 'Manage & Terminate Active Sessions' },
        { key: PERMISSIONS.SECURITY_VIEW, label: 'View Security Alerts & Logs' }
      ],
      OPERATIONS: [
        { key: PERMISSIONS.ATTENDANCE_VIEW, label: 'View Attendance Records' },
        { key: PERMISSIONS.ATTENDANCE_APPROVE, label: 'Approve Attendance & Regularization' },
        { key: PERMISSIONS.SHIFT_VIEW, label: 'View Shifts & Rosters' },
        { key: PERMISSIONS.SHIFT_MANAGE, label: 'Manage Shifts & Line Rosters' },
        { key: PERMISSIONS.LEAVE_VIEW, label: 'View Leave Applications' },
        { key: PERMISSIONS.LEAVE_APPROVE, label: 'Approve / Reject Leave' },
        { key: PERMISSIONS.PAYROLL_VIEW_ALL, label: 'View Company Payroll' },
        { key: PERMISSIONS.PAYROLL_PROCESS, label: 'Execute Monthly Payroll Run' },
        { key: PERMISSIONS.AUDIT_VIEW, label: 'View Immutable Audit Logs' }
      ]
    };

    return res.status(200).json({ success: true, permissions: permissionsByModule });
  } catch (error) {
    console.error('[HR Controller - getPermissions]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve permissions.', error: error.message });
  }
};

// PATCH /api/hr/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !ROLES[role]) {
      return res.status(400).json({ success: false, message: `Invalid role [${role}]. Valid roles: ${Object.keys(ROLES).join(', ')}` });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldRole = user.role;
    user.role = role;

    // Recalculate default dataScope
    if (['SUPER_ADMIN', 'DIRECTOR'].includes(role)) user.dataScope = 'SYSTEM';
    else if (['HR_ADMIN', 'HR_MANAGER', 'IT_ADMIN'].includes(role)) user.dataScope = 'GLOBAL';
    else if (['HR_EXECUTIVE', 'FINANCE_MANAGER', 'PAYROLL_ADMIN', 'AUDITOR'].includes(role)) user.dataScope = 'COMPANY';
    else if (['QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_MANAGER', 'EXPORT_MANAGER'].includes(role)) user.dataScope = 'DEPARTMENT';
    else if (role === 'TEAM_LEAD') user.dataScope = 'TEAM';
    else user.dataScope = 'SELF';

    await user.save({ validateBeforeSave: false });

    await AuditLog.logAction({
      user: req.user,
      action: 'USER_ROLE_CHANGE',
      module: 'SECURITY',
      resource: 'User',
      resourceId: user._id,
      oldData: { role: oldRole },
      newData: { role: user.role, dataScope: user.dataScope },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR changed role of user [${user.email}] from [${oldRole}] to [${role}]. Scope updated to [${user.dataScope}].`
    });

    return res.status(200).json({
      success: true,
      message: `User role updated to [${role}].`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        dataScope: user.dataScope
      }
    });
  } catch (error) {
    console.error('[HR Controller - updateUserRole]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user role.', error: error.message });
  }
};

// PATCH /api/hr/users/:id/permissions
const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'Permissions must be an array of strings.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldPermissions = user.permissions;
    user.permissions = permissions;
    await user.save({ validateBeforeSave: false });

    await AuditLog.logAction({
      user: req.user,
      action: 'USER_PERMISSIONS_CHANGE',
      module: 'SECURITY',
      resource: 'User',
      resourceId: user._id,
      oldData: { permissions: oldPermissions },
      newData: { permissions: user.permissions },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR updated custom permissions for user [${user.email}]. Total permissions: ${permissions.length}.`
    });

    return res.status(200).json({ success: true, message: 'User permissions updated successfully.', permissions: user.permissions });
  } catch (error) {
    console.error('[HR Controller - updateUserPermissions]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user permissions.', error: error.message });
  }
};

// ==========================================
// 5. SESSIONS, ACTIVITY & SECURITY MONITORING
// ==========================================

// GET /api/hr/sessions
const getSessions = async (req, res) => {
  try {
    const { status = 'ACTIVE', limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;

    const sessions = await UserSession.find(query)
      .populate('userId', 'name email role department employeeId')
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    console.error('[HR Controller - getSessions]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve active sessions.', error: error.message });
  }
};

// DELETE /api/hr/sessions/:sessionId
const terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await UserSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = 'TERMINATED';
    session.terminatedAt = new Date();
    session.terminatedBy = req.user?.email || 'HR Administrator';
    await session.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'SESSION_TERMINATE',
      module: 'SECURITY',
      resource: 'UserSession',
      resourceId: sessionId,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      details: `HR terminated active session [${sessionId}] for user ID [${session.userId}].`
    });

    return res.status(200).json({ success: true, message: 'Session terminated successfully.' });
  } catch (error) {
    console.error('[HR Controller - terminateSession]:', error);
    return res.status(500).json({ success: false, message: 'Failed to terminate session.', error: error.message });
  }
};

// GET /api/hr/login-activity
const getLoginActivity = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;

    const logs = await LoginActivity.find(query)
      .populate('userId', 'name email role department')
      .sort({ loginTime: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({ success: true, count: logs.length, logins: logs });
  } catch (error) {
    console.error('[HR Controller - getLoginActivity]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve login activity.', error: error.message });
  }
};

// GET /api/hr/manager-activity
const getManagerActivity = async (req, res) => {
  try {
    const managerRoles = [
      'HR_MANAGER', 'HR_ADMIN', 'DEPARTMENT_MANAGER', 'PRODUCTION_MANAGER',
      'QC_MANAGER', 'QA_MANAGER', 'WAREHOUSE_MANAGER', 'REGULATORY_MANAGER', 'FINANCE_MANAGER'
    ];

    const logs = await AuditLog.find({
      'user.role': { $in: managerRoles }
    }).sort({ timestamp: -1 }).limit(100);

    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error('[HR Controller - getManagerActivity]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve manager activity.', error: error.message });
  }
};

// GET /api/hr/audit-logs
const getHRAuditLogs = async (req, res) => {
  try {
    const { module, action, limit = 50 } = req.query;
    const query = {};
    if (module && module !== 'ALL') query.module = module.toUpperCase();
    if (action && action !== 'ALL') query.action = action.toUpperCase();

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(parseInt(limit, 10));
    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error('[HR Controller - getHRAuditLogs]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.', error: error.message });
  }
};

// GET /api/hr/stats (Live KPI cards directly from MongoDB)
const getHRStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onProbationEmployees,
      departmentsCount,
      newJoinersCount,
      managersCount,
      lockedAccountsCount,
      recentLoginsCount,
      activeSessionsCount,
      pendingDocumentsCount,
      securityAlertsCount
    ] = await Promise.all([
      Employee.countDocuments({}),
      Employee.countDocuments({ status: { $in: ['ACTIVE', 'ON_PROBATION'] } }),
      Employee.countDocuments({ status: { $in: ['INACTIVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED'] } }),
      Employee.countDocuments({ status: 'ON_PROBATION' }),
      Department.countDocuments({ isActive: true }),
      Employee.countDocuments({ joiningDate: { $gte: thirtyDaysAgo } }),
      Employee.countDocuments({ designationTitle: { $regex: /manager|lead|head|director/i } }),
      User.countDocuments({ isLocked: true }),
      LoginActivity.countDocuments({ loginTime: { $gte: oneDayAgo }, status: 'SUCCESS' }),
      UserSession.countDocuments({ status: 'ACTIVE' }),
      Employee.aggregate([
        { $unwind: '$documents' },
        { $match: { 'documents.verificationStatus': 'PENDING' } },
        { $count: 'pending' }
      ]),
      AuditLog.countDocuments({ action: { $in: ['FAILED_LOGIN', 'ACCOUNT_LOCK', 'UNAUTHORIZED_ACCESS'] } })
    ]);

    const pendingDocs = pendingDocumentsCount[0]?.pending || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        onProbationEmployees,
        departmentsCount,
        newJoinersCount,
        managersCount,
        lockedAccountsCount,
        recentLoginsCount,
        activeSessionsCount,
        pendingDocumentsCount: pendingDocs,
        securityAlertsCount
      }
    });
  } catch (error) {
    console.error('[HR Controller - getHRStats]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve HR statistics.', error: error.message });
  }
};

module.exports = {
  // Employee Directory & Lifecycle
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  resetEmployeePassword,
  forceLogoutEmployee,
  toggleLockEmployee,
  getEmployeeActivity,
  getEmployeeLoginHistory,

  // Documents
  getEmployeeDocuments,
  uploadEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument,

  // Departments
  getDepartments,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  getDepartmentEmployees,
  getDepartmentManagers,

  // Roles & Permissions
  getRoles,
  getPermissions,
  updateUserRole,
  updateUserPermissions,

  // Security, Sessions & Audit
  getSessions,
  terminateSession,
  getLoginActivity,
  getManagerActivity,
  getHRAuditLogs,
  getHRStats
};
