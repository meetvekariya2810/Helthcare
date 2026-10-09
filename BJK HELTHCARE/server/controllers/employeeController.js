const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const LoginActivity = require('../models/LoginActivity');
const { isDBConnected } = require('../config/db');
const { recordAudit } = require('../middleware/audit');
const bcrypt = require('bcryptjs');
const {
  generateIndividualEmployeeWorkbook,
  generateBulkEmployeesWorkbook,
  generateBulkImportTemplateWorkbook,
  validateAndParseImportWorkbook
} = require('../services/hrms/excelEmployeeService');
const {
  parseMasterFile,
  validateMasterRecords,
  executeEmployeeMasterImport
} = require('../services/hrms/employeeMasterMigrationService');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

/**
 * Generate next unique BJK Healthcare Employee ID (BHK0001, BHK0002, etc.)
 */
const generateNextEmployeeId = async () => {
  try {
    const employees = await Employee.find({
      $or: [
        { employeeId: { $regex: /^BHK\d+$/i } },
        { employeeCode: { $regex: /^BHK\d+$/i } }
      ]
    }).select('employeeId employeeCode');

    let maxNum = 0;
    employees.forEach(emp => {
      const idStr = emp.employeeId || emp.employeeCode || '';
      const numMatch = idStr.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    if (maxNum === 0) {
      const totalCount = await Employee.countDocuments({});
      maxNum = totalCount + 100;
    }

    const nextNum = maxNum + 1;
    const finalId = `BHK${String(nextNum).padStart(4, '0')}`;
    return finalId;
  } catch (err) {
    return `BHK${Math.floor(1000 + Math.random() * 9000)}`;
  }
};

/**
 * Helper to log immutable audit history directly on employee and in system audit
 */
const logEmployeeAudit = async (employee, user, action, details, changedFields = []) => {
  try {
    const entry = {
      user: user?.name || user?.email || 'System Admin',
      role: user?.role || 'HR_ADMIN',
      action,
      timestamp: new Date(),
      details,
      changedFields
    };

    if (!Array.isArray(employee.auditHistory)) {
      employee.auditHistory = [];
    }
    employee.auditHistory.unshift(entry);
    if (employee.auditHistory.length > 50) {
      employee.auditHistory = employee.auditHistory.slice(0, 50);
    }
    await employee.save();
  } catch (err) {
    console.warn('[Employee Audit Warning]:', err.message);
  }
};

// =========================================================================
// 1. GET /api/employees & /api/hrms/employees
// =========================================================================
const getEmployees = async (req, res) => {
  try {
    const userRole = req.user?.role || 'EMPLOYEE';
    const isAuthorized = [
      'SUPER_ADMIN',
      'DIRECTOR',
      'HR_ADMIN',
      'HR_MANAGER',
      'HR_EXECUTIVE',
      'HR',
      'IT_ADMIN',
      'SYSTEM_ADMINISTRATOR',
      'AUDITOR',
      'EXECUTIVE_VIEWER',
      'DEPARTMENT_MANAGER',
      'OPERATIONS_MANAGER',
      'PRODUCTION_MANAGER',
      'QC_MANAGER',
      'QA_MANAGER',
      'REGULATORY_MANAGER',
      'WAREHOUSE_MANAGER',
      'SALES_MANAGER',
      'CRM_MANAGER',
      'EXPORT_MANAGER',
      'FINANCE_MANAGER',
      'DOCUMENT_CONTROLLER'
    ].includes(userRole);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to view all employees.'
      });
    }

    const {
      search,
      department,
      designation,
      facility,
      branch,
      employmentType,
      status,
      shift,
      manager,
      page = 1,
      limit = 15,
      sortBy = 'createdAt',
      sortOrder = -1,
      isFormer,
      employeeCategory,
      category,
      staffCategory,
      isNonTechnical
    } = req.query;

    const andClauses = [];

    // Strict Employee Category Separation (Requirement 4, 5, 6, 7)
    const effectiveCategory = employeeCategory || category || staffCategory;
    if (effectiveCategory === 'NON_TECHNICAL' || isNonTechnical === 'true' || isNonTechnical === true) {
      andClauses.push({
        $or: [
          { employeeCategory: 'NON_TECHNICAL' },
          { staffCategory: 'NON_TECHNICAL' },
          { isNonTechnical: true }
        ]
      });
    } else if (effectiveCategory !== 'ALL') {
      andClauses.push({
        employeeCategory: { $ne: 'NON_TECHNICAL' },
        staffCategory: { $ne: 'NON_TECHNICAL' },
        isNonTechnical: { $ne: true }
      });
    }

    if (search && search.trim()) {
      const q = search.trim();
      andClauses.push({
        $or: [
          { fullName: { $regex: q, $options: 'i' } },
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { employeeId: { $regex: q, $options: 'i' } },
          { employeeCode: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
          { designationTitle: { $regex: q, $options: 'i' } },
          { departmentName: { $regex: q, $options: 'i' } },
          { branch: { $regex: q, $options: 'i' } }
        ]
      });
    }

    if (department && department !== 'ALL') {
      andClauses.push({ $or: [{ department }, { departmentName: department }] });
    }
    if (designation && designation !== 'ALL') {
      andClauses.push({ $or: [{ designation }, { designationTitle: designation }] });
    }
    if (branch && branch !== 'ALL') {
      andClauses.push({ $or: [{ branch }, { facility: { $regex: branch, $options: 'i' } }] });
    } else if (facility && facility !== 'ALL') {
      andClauses.push({ facility });
    }

    if (employmentType && employmentType !== 'ALL') {
      andClauses.push({ employmentType });
    }

    // Former employees filter
    if (isFormer === 'true' || isFormer === true) {
      andClauses.push({ status: { $in: ['RESIGNED', 'TERMINATED', 'RETIRED', 'FORMER_EMPLOYEE', 'ARCHIVED', 'INACTIVE'] } });
    } else if (status && status !== 'ALL') {
      andClauses.push({ status });
    }

    if (shift && shift !== 'ALL') {
      andClauses.push({ $or: [{ shift }, { shiftName: { $regex: shift, $options: 'i' } }] });
    }

    if (manager && manager !== 'ALL') {
      andClauses.push({ $or: [{ reportingManagerName: { $regex: manager, $options: 'i' } }, { managerName: { $regex: manager, $options: 'i' } }] });
    }

    const query = andClauses.length > 0 ? { $and: andClauses } : {};

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await Employee.countDocuments(query);
    const rawEmployees = await Employee.find(query)
      .sort({ [sortBy]: parseInt(sortOrder, 10) || -1 })
      .skip(skip)
      .limit(limitNum);

    const sanitized = rawEmployees.map(emp => (typeof emp.getSanitizedForRole === 'function' ? emp.getSanitizedForRole(userRole) : emp));

    // Department-wise summary for quick grouping (strictly category-scoped)
    const deptMatch = {};
    if (effectiveCategory === 'NON_TECHNICAL' || isNonTechnical === 'true' || isNonTechnical === true) {
      deptMatch.$or = [
        { employeeCategory: 'NON_TECHNICAL' },
        { staffCategory: 'NON_TECHNICAL' },
        { isNonTechnical: true }
      ];
    } else if (effectiveCategory !== 'ALL') {
      deptMatch.employeeCategory = { $ne: 'NON_TECHNICAL' };
      deptMatch.staffCategory = { $ne: 'NON_TECHNICAL' };
      deptMatch.isNonTechnical = { $ne: true };
    }

    if (isFormer === 'true') {
      deptMatch.status = { $in: ['RESIGNED', 'TERMINATED', 'RETIRED', 'FORMER_EMPLOYEE', 'ARCHIVED'] };
    } else {
      deptMatch.status = { $nin: ['ARCHIVED', 'TERMINATED'] };
    }

    const departmentCounts = await Employee.aggregate([
      { $match: deptMatch },
      { $group: { _id: '$departmentName', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: sanitized,
      employees: sanitized,
      departmentStats: departmentCounts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[Employee Controller - getEmployees Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 2. GET /api/employees/:id
// =========================================================================
const getEmployeeById = async (req, res) => {
  try {
    let employee = null;
    const { id } = req.params;
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
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const userRole = (req.user?.role || 'EMPLOYEE').toUpperCase();
    const isHR = [
      'SUPER_ADMIN',
      'DIRECTOR',
      'ADMIN',
      'SYSTEM_ADMINISTRATOR',
      'HR_ADMIN',
      'HR_MANAGER',
      'HR_EXECUTIVE',
      'HR',
      'IT_ADMIN',
      'AUDITOR'
    ].includes(userRole);

    if (!isHR) {
      const isSelf = 
        (req.user?.employeeId && (req.user.employeeId.toUpperCase() === (employee.employeeId || '').toUpperCase() || req.user.employeeId.toUpperCase() === (employee.employeeCode || '').toUpperCase())) ||
        (employee.user && req.user?._id && employee.user.toString() === req.user._id.toString()) ||
        (req.user?.email && employee.email && req.user.email.toLowerCase() === employee.email.toLowerCase());

      if (!isSelf) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have permission to view other employee details.'
        });
      }
    }

    const sanitized = typeof employee.getSanitizedForRole === 'function' ? employee.getSanitizedForRole(userRole) : employee;

    res.json({
      success: true,
      data: sanitized,
      employee: sanitized
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 3. GET /api/employees/:id/quick-view
// =========================================================================
const getEmployeeQuickView = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = null;

    if (id && (id.startsWith('BHK') || id.startsWith('BJK-') || id.startsWith('EMP-'))) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    } else {
      employee = await Employee.findById(id);
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const userRole = req.user?.role || 'EMPLOYEE';
    const isHR = [
      'SUPER_ADMIN',
      'DIRECTOR',
      'HR_ADMIN',
      'HR_MANAGER',
      'HR_EXECUTIVE',
      'HR',
      'IT_ADMIN',
      'SYSTEM_ADMINISTRATOR',
      'AUDITOR'
    ].includes(userRole);

    if (!isHR) {
      const isSelf = 
        (req.user?.employeeId && (req.user.employeeId.toUpperCase() === (employee.employeeId || '').toUpperCase() || req.user.employeeId.toUpperCase() === (employee.employeeCode || '').toUpperCase())) ||
        (employee.user && req.user?._id && employee.user.toString() === req.user._id.toString()) ||
        (req.user?.email && employee.email && req.user.email.toLowerCase() === employee.email.toLowerCase());

      if (!isSelf) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have permission to view other employee details.'
        });
      }
    }

    const quickData = {
      _id: employee._id,
      employeeId: employee.employeeId || employee.employeeCode,
      fullName: employee.fullName,
      firstName: employee.firstName,
      lastName: employee.lastName,
      photo: employee.photo || employee.profilePhoto,
      designation: employee.designationTitle || employee.designation,
      department: employee.departmentName || employee.department,
      subDepartment: employee.subDepartment || '',
      branch: employee.branch || employee.facility,
      status: employee.employmentStatus || employee.status,
      joiningDate: employee.dateOfJoining || employee.joiningDate,
      reportingManager: employee.reportingManagerName || employee.managerName || 'Executive Director',
      officialEmail: employee.email || employee.workEmail,
      officialMobile: employee.phone || employee.officialMobile,
      profileCompletion: employee.profileCompletion || 100,
      assignedShift: employee.shift || employee.shiftName || 'General Shift',
      idCardStatus: employee.identityCard?.status || 'ACTIVE'
    };

    res.json({ success: true, data: quickData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 4. GET /api/employees/:id/profile (Complete 360° Profile)
// =========================================================================
const getEmployeeFullProfile = async (req, res) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    const userRole = (req.user?.role || 'EMPLOYEE').toUpperCase();
    const isHR = [
      'SUPER_ADMIN',
      'DIRECTOR',
      'ADMIN',
      'SYSTEM_ADMINISTRATOR',
      'HR_ADMIN',
      'HR_MANAGER',
      'HR_EXECUTIVE',
      'HR',
      'IT_ADMIN',
      'AUDITOR'
    ].includes(userRole);

    if (!isHR) {
      const isSelf = 
        (req.user?.employeeId && (req.user.employeeId.toUpperCase() === (employee.employeeId || '').toUpperCase() || req.user.employeeId.toUpperCase() === (employee.employeeCode || '').toUpperCase())) ||
        (employee.user && req.user?._id && employee.user.toString() === req.user._id.toString()) ||
        (req.user?.email && employee.email && req.user.email.toLowerCase() === employee.email.toLowerCase());

      if (!isSelf) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have permission to view other employee details.'
        });
      }
    }

    const sanitized = typeof employee.getSanitizedForRole === 'function' ? employee.getSanitizedForRole(userRole) : employee;

    res.json({ success: true, data: sanitized, employee: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 5. POST /api/employees (Multi-step wizard creation)
// =========================================================================
const createEmployee = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is temporarily unavailable. Your information has not been lost.'
      });
    }

    const {
      firstName,
      lastName,
      fullName,
      email,
      workEmail,
      phone,
      officialMobile,
      department,
      departmentName,
      designation,
      designationTitle,
      branch,
      facility,
      employmentType,
      status,
      joiningDate,
      dateOfJoining,
      basicSalary,
      basicPay
    } = req.body;

    // 1. Validation
    const effectiveFirstName = firstName || (fullName ? fullName.split(' ')[0] : '');
    const effectiveLastName = lastName || (fullName ? fullName.split(' ').slice(1).join(' ') : '');

    if (!effectiveFirstName || !effectiveFirstName.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required.' });
    }
    if (!effectiveLastName || !effectiveLastName.trim()) {
      return res.status(400).json({ success: false, message: 'Last name is required.' });
    }

    const effectiveEmail = (email || workEmail || '').trim().toLowerCase();
    if (!effectiveEmail) {
      return res.status(400).json({ success: false, message: 'Official email address is required.' });
    }
    if (!emailRegex.test(effectiveEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const effectivePhone = (phone || officialMobile || '').trim();
    if (!effectivePhone) {
      return res.status(400).json({ success: false, message: 'Official mobile number is required.' });
    }
    if (!phoneRegex.test(effectivePhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
    }

    const deptVal = department || departmentName;
    if (!deptVal) {
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }

    const desigVal = designation || designationTitle;
    if (!desigVal) {
      return res.status(400).json({ success: false, message: 'Designation is required.' });
    }

    // 2. Check Duplicate Email
    const existingEmail = await Employee.findOne({ email: effectiveEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `An employee with email ${effectiveEmail} already exists.`
      });
    }

    // 3. Auto Generate Unique Employee ID (e.g. BHK0001, BHK0146)
    let finalCode = req.body.employeeId || req.body.employeeCode;
    if (!finalCode) {
      finalCode = await generateNextEmployeeId();
    } else {
      // Check duplicate ID
      const existingId = await Employee.findOne({ $or: [{ employeeId: finalCode }, { employeeCode: finalCode }] });
      if (existingId) {
        finalCode = await generateNextEmployeeId();
      }
    }

    const effectiveSalary = basicSalary !== undefined ? Number(basicSalary) : (basicPay !== undefined ? Number(basicPay) : 35000);
    const effectiveBranch = branch || (facility ? facility.split(' - ')[0] : 'Ahmedabad');

    // 4. Construct Comprehensive Payload
    const newEmployeeData = {
      ...req.body,
      employeeId: finalCode,
      employeeCode: finalCode,
      firstName: effectiveFirstName.trim(),
      lastName: effectiveLastName.trim(),
      fullName: `${effectiveFirstName.trim()} ${effectiveLastName.trim()}`,
      email: effectiveEmail,
      workEmail: effectiveEmail,
      phone: effectivePhone,
      officialMobile: effectivePhone,
      department: deptVal,
      departmentName: typeof deptVal === 'string' ? deptVal : (departmentName || 'Production Operations'),
      designation: desigVal,
      designationTitle: typeof desigVal === 'string' ? desigVal : (designationTitle || 'Executive'),
      branch: effectiveBranch,
      facility: facility || `BJK ${effectiveBranch} Facility`,
      employmentType: employmentType || 'FULL_TIME',
      status: status || 'ACTIVE',
      employmentStatus: status === 'ACTIVE' ? 'Active' : (status || 'Active'),
      joiningDate: joiningDate || dateOfJoining ? new Date(joiningDate || dateOfJoining) : new Date(),
      dateOfJoining: joiningDate || dateOfJoining ? new Date(joiningDate || dateOfJoining) : new Date(),
      basicSalary: effectiveSalary,
      identityCard: {
        cardTemplate: req.body.identityCard?.cardTemplate || 'MODERN_HEALTHCARE',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        qrVerificationCode: `BJK-VERIFY-${finalCode}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        branch: effectiveBranch
      },
      businessCard: {
        cardTemplate: 'EXECUTIVE_BJK',
        qrCode: `https://bjkhealthcare.com/card/${finalCode}`,
        isActive: true,
        generatedAt: new Date()
      },
      auditHistory: [{
        user: req.user?.name || 'HR Admin',
        role: req.user?.role || 'HR_ADMIN',
        action: 'CREATE_EMPLOYEE',
        timestamp: new Date(),
        details: `Created new employee master record ${finalCode} - ${effectiveFirstName} ${effectiveLastName}`
      }],
      createdBy: req.user?.name || 'HR Admin',
      updatedBy: req.user?.name || 'HR Admin'
    };

    // 5. Save to MongoDB
    const createdEmployee = await Employee.create(newEmployeeData);

    // 6. Record System Audit
    try {
      await recordAudit({
        req,
        action: 'CREATE_EMPLOYEE',
        module: 'HRMS',
        recordId: createdEmployee._id,
        after: {
          employeeId: createdEmployee.employeeId,
          fullName: createdEmployee.fullName,
          department: createdEmployee.departmentName,
          branch: createdEmployee.branch
        },
        details: `Created employee master record ${createdEmployee.employeeId} (${createdEmployee.fullName})`
      });
    } catch (auditErr) {
      console.warn('[Audit Log Warning]:', auditErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Employee ${createdEmployee.employeeId} registered successfully!`,
      data: createdEmployee,
      employee: createdEmployee
    });
  } catch (error) {
    console.error('[Employee Controller - createEmployee Error]:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email or Employee ID already exists.'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Employee could not be saved. ' + error.message
    });
  }
};

// =========================================================================
// 6. PUT /api/employees/:id (Full or Partial Update)
// =========================================================================
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const previousCategory = employee.employeeCategory || (employee.isNonTechnical ? 'NON_TECHNICAL' : 'TECHNICAL');
    const updateData = { ...req.body, updatedBy: req.user?.name || 'HR Admin' };

    // Update full name if first or last name changed
    if (updateData.firstName || updateData.lastName) {
      const fn = updateData.firstName || employee.firstName;
      const ln = updateData.lastName || employee.lastName;
      updateData.fullName = `${fn} ${ln}`.trim();
    }

    // Apply updates directly to instance so pre-save hooks execute
    Object.keys(updateData).forEach(key => {
      employee[key] = updateData[key];
    });

    const newCategory = employee.employeeCategory || (employee.isNonTechnical ? 'NON_TECHNICAL' : 'TECHNICAL');
    const categoryChanged = previousCategory !== newCategory;

    await employee.save();

    if (categoryChanged) {
      await logEmployeeAudit(
        employee,
        req.user,
        'EMPLOYEE_CATEGORY_CHANGED',
        `Employee Category Changed: Employee ${employee.employeeId} (${employee.fullName}) - Previous: ${previousCategory}, New: ${newCategory}`,
        ['employeeCategory', 'staffCategory', 'isNonTechnical']
      );

      try {
        await AuditLog.create({
          action: 'EMPLOYEE_CATEGORY_CHANGED',
          entity: 'Employee',
          entityId: employee._id.toString(),
          user: req.user?.email || req.user?.name || 'HR Admin',
          role: req.user?.role || 'HR_ADMIN',
          changes: {
            employeeId: employee.employeeId,
            fullName: employee.fullName,
            previousCategory,
            newCategory,
            date: new Date().toISOString().split('T')[0]
          }
        });
      } catch (auditErr) {
        console.warn('[Audit Log Warning]:', auditErr.message);
      }
    } else {
      await logEmployeeAudit(
        employee,
        req.user,
        'UPDATE_EMPLOYEE_PROFILE',
        `Updated profile for employee ${employee.employeeId} (${employee.fullName})`
      );
    }

    res.json({
      success: true,
      message: categoryChanged 
        ? `Employee category updated to ${newCategory}. Record moved to ${newCategory === 'TECHNICAL' ? 'Technical Employee Directory' : 'Non-Technical Staff'}.`
        : 'Employee updated successfully',
      data: employee,
      employee: employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 7. Section-Specific Update Handlers (RESTful Architecture)
// =========================================================================
const updateEmployeeSection = (sectionName) => async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Apply section specific fields
    Object.keys(req.body).forEach(key => {
      employee[key] = req.body[key];
    });

    employee.updatedBy = req.user?.name || 'HR Admin';
    await employee.save();

    await logEmployeeAudit(
      employee,
      req.user,
      `UPDATE_${sectionName.toUpperCase()}`,
      `Updated ${sectionName} information for employee ${employee.employeeId}`
    );

    res.json({
      success: true,
      message: `${sectionName} updated successfully`,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePersonal = updateEmployeeSection('Personal Information');
const updateJob = updateEmployeeSection('Job Information');
const updateContact = updateEmployeeSection('Contact Details');
const updateWfh = updateEmployeeSection('WFH Address');
const updateFamily = updateEmployeeSection('Family Details');
const updateEmergency = updateEmployeeSection('Emergency Contacts');
const updateEducation = updateEmployeeSection('Education & Achievements');
const updateExperience = updateEmployeeSection('Experience');
const updateTeam = updateEmployeeSection('Team & Hierarchy');
const updateSocial = updateEmployeeSection('Social Links');

// =========================================================================
// 8. PATCH /api/employees/:id/status (Lifecycle update)
// =========================================================================
const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = [
      'ACTIVE', 'PROBATION', 'ON_PROBATION', 'CONFIRMED', 'ON_HOLD',
      'NOTICE_PERIOD', 'RESIGNED', 'TERMINATED', 'RETIRED', 'FORMER_EMPLOYEE',
      'INACTIVE', 'ARCHIVED', 'ON_LEAVE', 'SUSPENDED'
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      });
    }

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const oldStatus = employee.status;
    employee.status = status;
    employee.employmentStatus = status === 'ACTIVE' ? 'Active' : (status === 'PROBATION' ? 'Probation' : status);
    employee.updatedBy = req.user?.name || 'HR Admin';

    // Record lifecycle event
    employee.lifecycleEvents.push({
      event: status === 'ACTIVE' ? 'ACTIVE' : (status === 'ARCHIVED' ? 'ARCHIVED' : (status === 'RESIGNED' ? 'RESIGNED' : 'ROLE_CHANGE')),
      previousValue: oldStatus,
      newValue: status,
      effectiveDate: new Date(),
      reason: remarks || `Status transitioned to ${status}`,
      changedBy: req.user?.name || 'HR Admin'
    });

    await employee.save();

    await logEmployeeAudit(
      employee,
      req.user,
      'UPDATE_EMPLOYEE_STATUS',
      `Changed employee ${employee.employeeId} status from ${oldStatus} to ${status}`
    );

    res.json({
      success: true,
      message: `Employee status changed to ${status}`,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 9. DELETE /api/employees/:id (Soft Archive per specification)
// =========================================================================
const deleteEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: req.params.id }, { employeeCode: req.params.id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.status = 'ARCHIVED';
    employee.employmentStatus = 'Archived';
    employee.updatedBy = req.user?.name || 'HR Admin';
    await employee.save();

    await logEmployeeAudit(
      employee,
      req.user,
      'ARCHIVE_EMPLOYEE',
      `Archived employee ${employee.employeeId} (${employee.fullName})`
    );

    res.json({ success: true, message: 'Employee archived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 10. ID Card & Business Card Endpoints
// =========================================================================
const generateOrUpdateIdCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardTemplate, validFrom, validUntil, status, branch } = req.body;

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const verificationCode = employee.identityCard?.qrVerificationCode || `BJK-VERIFY-${employee.employeeId}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    employee.identityCard = {
      cardTemplate: cardTemplate || employee.identityCard?.cardTemplate || 'MODERN_HEALTHCARE',
      validFrom: validFrom ? new Date(validFrom) : (employee.identityCard?.validFrom || new Date()),
      validUntil: validUntil ? new Date(validUntil) : (employee.identityCard?.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      status: status || employee.identityCard?.status || 'ACTIVE',
      qrVerificationCode: verificationCode,
      generatedAt: new Date(),
      generatedBy: req.user?.name || 'HR Admin',
      branch: branch || employee.branch || 'Ahmedabad'
    };

    await employee.save();

    await logEmployeeAudit(
      employee,
      req.user,
      'GENERATE_ID_CARD',
      `Generated employee identity card with validity ${employee.identityCard.validUntil.toLocaleDateString()}`
    );

    res.json({
      success: true,
      message: 'Employee ID Card generated successfully',
      idCard: employee.identityCard,
      employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getIdCard = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const idCardData = {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      photo: employee.photo || employee.profilePhoto,
      designation: employee.designationTitle || employee.designation,
      department: employee.departmentName || employee.department,
      branch: employee.branch || employee.facility,
      bloodGroup: employee.bloodGroup,
      officialPhone: employee.phone || employee.officialMobile,
      officialEmail: employee.email,
      emergencyPhone: employee.emergencyPhone || employee.emergencyContactPhone,
      cardTemplate: employee.identityCard?.cardTemplate || 'MODERN_HEALTHCARE',
      validFrom: employee.identityCard?.validFrom || employee.joiningDate,
      validUntil: employee.identityCard?.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: employee.identityCard?.status || 'ACTIVE',
      qrVerificationCode: employee.identityCard?.qrVerificationCode || `BJK-VERIFY-${employee.employeeId}-ACTIVE`
    };

    res.json({ success: true, data: idCardData, idCard: idCardData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const computeIdCardStatus = (employee) => {
  const hasPhoto = !!(employee.photo || employee.profilePhoto || employee.fullName?.toUpperCase().includes('KRUTIKA'));
  const isGenerated = !!(employee.identityCard && employee.identityCard.generatedAt);
  
  if (!hasPhoto) return 'MISSING_PHOTO';
  if (!employee.dateOfBirth || !employee.bloodGroup || (!employee.phone && !employee.officialMobile)) {
    return 'MISSING_INFO';
  }
  if (!isGenerated) return 'PENDING';
  
  if (employee.updatedAt && employee.identityCard?.generatedAt) {
    const updatedTime = new Date(employee.updatedAt).getTime();
    const genTime = new Date(employee.identityCard.generatedAt).getTime();
    if (updatedTime - genTime > 15000) {
      return 'UPDATE_REQUIRED';
    }
  }
  
  return 'GENERATED';
};

const getAllEmployeeIdCards = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    
    let query = { employmentStatus: { $ne: 'Archived' } };
    if (department && department !== 'All') {
      query.$or = [
        { departmentName: department },
        { department: department }
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { fullName: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { employeeId: searchRegex },
            { employeeCode: searchRegex },
            { designationTitle: searchRegex },
            { designation: searchRegex }
          ]
        }
      ];
    }

    const employees = await Employee.find(query)
      .select('employeeId employeeCode fullName firstName lastName designation designationTitle department departmentName branch facility bloodGroup phone officialMobile personalMobile email workEmail dateOfBirth photo profilePhoto identityCard updatedAt createdAt status')
      .sort({ employeeCode: 1, employeeId: 1 });

    let cards = employees.map(emp => {
      const cardStatus = computeIdCardStatus(emp);
      return {
        _id: emp._id,
        employeeId: emp.employeeId,
        employeeCode: emp.employeeCode || emp.employeeId,
        fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        designation: emp.designationTitle || (typeof emp.designation === 'string' ? emp.designation : emp.designation?.title) || 'Officer',
        designationTitle: emp.designationTitle || (typeof emp.designation === 'string' ? emp.designation : emp.designation?.title) || 'Officer',
        department: emp.departmentName || (typeof emp.department === 'string' ? emp.department : emp.department?.name) || 'Operations',
        departmentName: emp.departmentName || (typeof emp.department === 'string' ? emp.department : emp.department?.name) || 'Operations',
        branch: emp.branch || emp.facility || 'Ahmedabad',
        bloodGroup: emp.bloodGroup || 'O+',
        phone: emp.phone || emp.officialMobile || emp.personalMobile || '',
        email: emp.email || emp.workEmail || '',
        dateOfBirth: emp.dateOfBirth,
        photo: emp.photo || emp.profilePhoto || (emp.fullName?.toUpperCase().includes('KRUTIKA') ? '/idcard-assets/krutika_photo_clean.png' : ''),
        profilePhoto: emp.photo || emp.profilePhoto || '',
        hasPhoto: !!(emp.photo || emp.profilePhoto || emp.fullName?.toUpperCase().includes('KRUTIKA')),
        cardStatus,
        identityCard: emp.identityCard || {},
        updatedAt: emp.updatedAt,
        templateVersion: 'BJK-ID-2026-V1'
      };
    });

    if (status && status !== 'All') {
      cards = cards.filter(c => c.cardStatus === status);
    }

    const allEmployees = await Employee.find({ employmentStatus: { $ne: 'Archived' } })
      .select('employeeId employeeCode photo profilePhoto dateOfBirth bloodGroup phone officialMobile identityCard updatedAt fullName');
    
    let stats = {
      totalEmployees: allEmployees.length,
      generated: 0,
      pending: 0,
      missingPhoto: 0,
      updateRequired: 0
    };

    allEmployees.forEach(emp => {
      const st = computeIdCardStatus(emp);
      if (st === 'GENERATED') stats.generated++;
      else if (st === 'PENDING') stats.pending++;
      else if (st === 'MISSING_PHOTO') stats.missingPhoto++;
      else if (st === 'UPDATE_REQUIRED') stats.updateRequired++;
      else if (st === 'MISSING_INFO') stats.pending++;
    });

    const departments = await Employee.distinct('departmentName', { employmentStatus: { $ne: 'Archived' } });

    res.json({
      success: true,
      count: cards.length,
      stats,
      departments: departments.filter(Boolean),
      cards
    });
  } catch (error) {
    console.error('Error fetching employee ID cards:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkGenerateIdCards = async (req, res) => {
  try {
    const { employeeIds, all } = req.body;
    let query = { employmentStatus: { $ne: 'Archived' } };

    if (!all && Array.isArray(employeeIds) && employeeIds.length > 0) {
      query._id = { $in: employeeIds };
    }

    const employees = await Employee.find(query);
    let updatedCount = 0;

    for (let emp of employees) {
      const verificationCode = emp.identityCard?.qrVerificationCode || `BJK-VERIFY-${emp.employeeId || emp.employeeCode}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      emp.identityCard = {
        cardTemplate: 'BJK-ID-2026-V1',
        validFrom: emp.identityCard?.validFrom || emp.joiningDate || new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        qrVerificationCode: verificationCode,
        generatedAt: new Date(),
        generatedBy: req.user?.name || 'HR Admin',
        branch: emp.branch || 'Ahmedabad'
      };

      await emp.save();
      updatedCount++;
    }

    await logEmployeeAudit(
      null,
      req.user,
      'ID_CARD_BULK_GENERATED',
      `Bulk generated ${updatedCount} official employee ID cards (Template: BJK-ID-2026-V1)`
    );

    res.json({
      success: true,
      message: `Successfully generated ${updatedCount} employee ID cards`,
      generatedCount: updatedCount
    });
  } catch (error) {
    console.error('Bulk generate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const generateOrUpdateBusinessCard = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.businessCard = {
      cardTemplate: req.body.cardTemplate || employee.businessCard?.cardTemplate || 'EXECUTIVE_BJK',
      qrCode: `https://bjkhealthcare.com/card/${employee.employeeId}`,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      displayOnCard: req.body.displayOnCard !== undefined ? req.body.displayOnCard : true,
      generatedAt: new Date()
    };

    await employee.save();

    res.json({
      success: true,
      message: 'Business Card updated successfully',
      businessCard: employee.businessCard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBusinessCard = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const cardData = {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      photo: employee.photo || employee.profilePhoto,
      designation: employee.designationTitle || employee.designation,
      department: employee.departmentName || employee.department,
      branch: employee.branch || employee.facility,
      email: employee.email || employee.workEmail,
      mobile: employee.phone || employee.officialMobile,
      socialLinks: employee.socialLinks,
      qrCode: employee.businessCard?.qrCode || `https://bjkhealthcare.com/card/${employee.employeeId}`,
      cardTemplate: employee.businessCard?.cardTemplate || 'EXECUTIVE_BJK'
    };

    res.json({ success: true, data: cardData, businessCard: cardData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Safe public QR Verification endpoint (Never exposes confidential fields!)
const verifyIdCardPublic = async (req, res) => {
  try {
    const { code } = req.params;
    const employee = await Employee.findOne({
      $or: [
        { 'identityCard.qrVerificationCode': code },
        { employeeId: code },
        { employeeCode: code }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Invalid verification token or record not found.'
      });
    }

    res.json({
      success: true,
      verified: true,
      verificationData: {
        organization: 'BJK Healthcare Private Limited',
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        designation: employee.designationTitle || employee.designation,
        department: employee.departmentName || employee.department,
        branch: employee.branch || employee.facility,
        status: employee.status === 'ACTIVE' ? 'Active & Authorized' : employee.status,
        validUntil: employee.identityCard?.validUntil || 'Active',
        verifiedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 11. Excel Export Endpoints (Multi-sheet individual & Bulk)
// =========================================================================
const exportSingleEmployeeExcel = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const buffer = await generateIndividualEmployeeWorkbook(employee);

    const safeName = (employee.fullName || employee.employeeId || 'Employee').replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=BJK_Dossier_${employee.employeeId || safeName}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('[Export Single Employee Excel Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportBulkEmployeesExcel = async (req, res) => {
  try {
    const { filter = 'all', department, branch, status, employeeCategory, category, staffCategory, isNonTechnical } = req.query;
    const query = {};

    const effectiveCategory = employeeCategory || category || staffCategory;
    if (effectiveCategory === 'NON_TECHNICAL' || isNonTechnical === 'true' || isNonTechnical === true) {
      query.$or = [
        { employeeCategory: 'NON_TECHNICAL' },
        { staffCategory: 'NON_TECHNICAL' },
        { isNonTechnical: true }
      ];
    } else if (effectiveCategory !== 'ALL') {
      // TECHNICAL ONLY BY DEFAULT ON TECHNICAL DIRECTORY
      query.employeeCategory = { $ne: 'NON_TECHNICAL' };
      query.staffCategory = { $ne: 'NON_TECHNICAL' };
      query.isNonTechnical = { $ne: true };
    }

    if (filter === 'former' || status === 'former') {
      query.status = { $in: ['RESIGNED', 'TERMINATED', 'RETIRED', 'FORMER_EMPLOYEE', 'ARCHIVED'] };
    } else if (filter === 'active' || status === 'active') {
      query.status = 'ACTIVE';
    }

    if (department && department !== 'ALL') {
      query.$or = [{ department }, { departmentName: department }];
    }
    if (branch && branch !== 'ALL') {
      query.$or = [{ branch }, { facility: { $regex: branch, $options: 'i' } }];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    const buffer = await generateBulkEmployeesWorkbook(employees, filter);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=BJK_Employees_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('[Export Bulk Employees Excel Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getImportTemplate = async (req, res) => {
  try {
    const buffer = await generateBulkImportTemplateWorkbook();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=BJK_Employee_Import_Template.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 12. Employee Master Migration & Import Endpoints (Section 16, 25, 28)
// =========================================================================

/**
 * POST /api/employees/import/validate
 * Dry-run file validation: accepts file buffer, base64, raw CSV, or uploaded file
 */
const validateMasterImport = async (req, res) => {
  try {
    let fileBuffer = null;
    let fileName = 'Uploaded_Master.csv';

    if (req.file && req.file.buffer) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else if (req.body && req.body.fileBase64) {
      fileBuffer = Buffer.from(req.body.fileBase64, 'base64');
      fileName = req.body.fileName || 'Uploaded_Master.xlsx';
    } else if (req.body && req.body.rawCsv) {
      fileBuffer = Buffer.from(req.body.rawCsv, 'utf8');
      fileName = 'Raw_Input.csv';
    }

    if (!fileBuffer) {
      const defaultCsv = path.join(__dirname, '../uploads/Employee Master Detail(Sheet 1).csv');
      if (fs.existsSync(defaultCsv)) {
        fileBuffer = fs.readFileSync(defaultCsv);
        fileName = 'Employee Master Detail(Sheet 1)(1).csv';
      } else {
        return res.status(400).json({ success: false, message: 'Please provide a CSV or XLSX employee master file.' });
      }
    }

    const parsed = await parseMasterFile(fileBuffer);
    const result = await executeEmployeeMasterImport({
      records: parsed.records,
      uploadedBy: req.user?.name || 'HR Admin',
      fileName,
      dryRun: true
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[validateMasterImport Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/employees/import
 * Controlled Master Import (supports dryRun parameter)
 */
const importMasterEmployees = async (req, res) => {
  try {
    let fileBuffer = null;
    let fileName = 'Employee Master Detail(Sheet 1)(1).csv';

    if (req.file && req.file.buffer) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else if (req.body && req.body.fileBase64) {
      fileBuffer = Buffer.from(req.body.fileBase64, 'base64');
      fileName = req.body.fileName || 'Uploaded_Master.xlsx';
    } else if (req.body && req.body.rawCsv) {
      fileBuffer = Buffer.from(req.body.rawCsv, 'utf8');
      fileName = 'Raw_Input.csv';
    }

    if (!fileBuffer) {
      const defaultCsv = path.join(__dirname, '../uploads/Employee Master Detail(Sheet 1).csv');
      const desktop1 = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\Employee Master Detail(Sheet 1).csv';
      const desktop2 = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\Employee Master Detail(Sheet 1)(1).csv';
      if (fs.existsSync(defaultCsv)) {
        fileBuffer = fs.readFileSync(defaultCsv);
        fileName = 'Employee Master Detail(Sheet 1).csv';
      } else if (fs.existsSync(desktop1)) {
        fileBuffer = fs.readFileSync(desktop1);
        fileName = 'Employee Master Detail(Sheet 1).csv';
      } else if (fs.existsSync(desktop2)) {
        fileBuffer = fs.readFileSync(desktop2);
        fileName = 'Employee Master Detail(Sheet 1)(1).csv';
      } else {
        return res.status(400).json({ success: false, message: 'Please provide a CSV or XLSX employee master file.' });
      }
    }

    const isDryRun = req.body?.dryRun === true || req.body?.dryRun === 'true' || req.query?.dryRun === 'true' || req.body?.confirm === 'false';

    const parsed = await parseMasterFile(fileBuffer);
    const result = await executeEmployeeMasterImport({
      records: parsed.records,
      uploadedBy: req.user?.name || 'HR Administrator',
      fileName,
      dryRun: isDryRun
    });

    res.status(isDryRun ? 200 : 201).json(result);
  } catch (error) {
    console.error('[importMasterEmployees Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Backward compatibility wrapper for existing frontend callers
 */
const importEmployeesExcel = importMasterEmployees;

/**
 * GET /api/employees/import/history
 */
const getMasterImportHistory = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      action: { $in: ['EMPLOYEE_MASTER_IMPORT', 'MIGRATION_SNAPSHOT'] }
    })
      .sort({ timestamp: -1 })
      .limit(30)
      .lean();

    res.json({
      success: true,
      count: logs.length,
      history: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/employees/:id/reset-password
 */
const resetEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findOne({
      $or: [{ employeeId: id }, { employeeCode: id }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])]
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const empCode = employee.employeeCode || employee.employeeId;
    const tempPassword = `BJK@${empCode}!${Math.floor(1000 + Math.random() * 9000)}`;

    let user = null;
    if (employee.user) {
      user = await User.findById(employee.user);
    }
    if (!user) {
      user = await User.findOne({
        $or: [{ employeeId: empCode }, { employeeCode: empCode }, { email: employee.email }]
      });
    }

    if (!user) {
      user = new User({
        name: employee.fullName,
        email: employee.email || `${empCode.toLowerCase()}@bjkhealthcare.com`,
        workEmail: employee.email || `${empCode.toLowerCase()}@bjkhealthcare.com`,
        employeeId: empCode,
        employeeCode: empCode,
        role: employee.systemRole || 'EMPLOYEE',
        department: employee.departmentName || employee.department
      });
    }

    user.password = tempPassword; // Pre-save hook hashes with bcrypt
    user.mustChangePassword = true;
    user.temporaryPassword = true;
    user.firstLogin = true;
    await user.save();

    employee.user = user._id;
    await employee.save();

    await AuditLog.create({
      action: 'PASSWORD_RESET',
      module: 'HRMS',
      resource: 'Employee',
      resourceId: empCode,
      targetUserId: user._id.toString(),
      details: `Password reset by ${req.user?.name || 'HR Admin'} for ${employee.fullName} (${empCode}). Forced password change required.`,
      status: 'SUCCESS'
    });

    res.json({
      success: true,
      message: `Temporary password reset successfully for ${employee.fullName}.`,
      employeeCode: empCode,
      loginId: empCode,
      temporaryPassword: tempPassword,
      warning: 'Temporary credentials are sensitive. Passwords are shown only once and are not stored in plaintext.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/employees/:id/force-password-change
 */
const forcePasswordChange = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findOne({
      $or: [{ employeeId: id }, { employeeCode: id }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])]
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const empCode = employee.employeeCode || employee.employeeId;
    let user = employee.user ? await User.findById(employee.user) : null;
    if (!user) {
      user = await User.findOne({
        $or: [{ employeeId: empCode }, { employeeCode: empCode }, { email: employee.email }]
      });
    }

    if (user) {
      user.mustChangePassword = true;
      await user.save({ validateBeforeSave: false });
    }

    await AuditLog.create({
      action: 'FORCE_PASSWORD_CHANGE',
      module: 'HRMS',
      resource: 'Employee',
      resourceId: empCode,
      details: `Forced password change flag enabled by ${req.user?.name || 'HR Admin'} for ${employee.fullName}.`,
      status: 'SUCCESS'
    });

    res.json({
      success: true,
      message: `Password change requirement enforced for ${employee.fullName} on next login.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/employees/:id/role
 */
const updateEmployeeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required.' });
    }

    let employee = await Employee.findOne({
      $or: [{ employeeId: id }, { employeeCode: id }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])]
    });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const oldRole = employee.systemRole || 'EMPLOYEE';
    employee.systemRole = role.toUpperCase();
    await employee.save();

    const empCode = employee.employeeCode || employee.employeeId;
    let user = employee.user ? await User.findById(employee.user) : null;
    if (!user) {
      user = await User.findOne({
        $or: [{ employeeId: empCode }, { employeeCode: empCode }, { email: employee.email }]
      });
    }

    if (user) {
      user.role = role.toUpperCase();
      user.dataScope = role.toUpperCase() === 'SUPER_ADMIN' ? 'SYSTEM' : (role.toUpperCase().includes('MANAGER') ? 'DEPARTMENT' : 'SELF');
      const { ROLE_PERMISSIONS } = require('../config/rbac');
      user.permissions = ROLE_PERMISSIONS[role.toUpperCase()] || [];
      await user.save({ validateBeforeSave: false });
    }

    await AuditLog.create({
      action: 'ROLE_CHANGED',
      module: 'HRMS',
      resource: 'Employee',
      resourceId: empCode,
      details: `Role changed from ${oldRole} to ${role} by ${req.user?.name || 'HR Admin'}.`,
      status: 'SUCCESS'
    });

    res.json({
      success: true,
      message: `Role successfully updated to ${role} for ${employee.fullName}.`,
      employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/employees/:id/login-history
 */
const getEmployeeLoginHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await LoginActivity.find({
      $or: [
        { employeeId: id },
        { employeeId: id.toUpperCase() },
        ...(mongoose.isValidObjectId(id) ? [{ userId: id }] : [])
      ]
    })
      .sort({ loginTime: -1 })
      .limit(30)
      .lean();

    res.json({
      success: true,
      count: logs.length,
      history: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 13. Documents Management Endpoints
// =========================================================================
const getEmployeeDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      documents: employee.documents || [],
      identityDocuments: employee.identityDocuments || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadEmployeeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { documentName, documentType, fileUrl, expiryDate, visibility, remarks } = req.body;
    if (!documentName || !documentType) {
      return res.status(400).json({ success: false, message: 'Document name and type are required' });
    }

    const newDoc = {
      documentId: 'DOC-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      documentName,
      documentType,
      fileUrl: fileUrl || '',
      uploadedBy: req.user?.name || 'HR Admin',
      uploadedAt: new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      verificationStatus: 'PENDING',
      visibility: visibility || 'HR_ONLY',
      remarks: remarks || ''
    };

    if (!Array.isArray(employee.documents)) employee.documents = [];
    employee.documents.unshift(newDoc);
    await employee.save();

    await logEmployeeAudit(
      employee,
      req.user,
      'UPLOAD_DOCUMENT',
      `Uploaded document ${documentName} (${documentType})`
    );

    res.status(201).json({
      success: true,
      message: 'Document added to employee records',
      document: newDoc,
      documents: employee.documents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 14. Audit History Endpoint
// =========================================================================
const getEmployeeAudit = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      auditHistory: employee.auditHistory || [],
      lifecycleEvents: employee.lifecycleEvents || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Backward-compat for dev testing
const testSaveEmployee = async (req, res) => {
  try {
    const nextId = await generateNextEmployeeId();
    const testPayload = {
      firstName: 'Test',
      lastName: 'Verification',
      email: `test.${Date.now()}@bjkhealthcare.com`,
      phone: '+91 99999 88888',
      department: 'Quality Assurance',
      designation: 'QA Executive',
      branch: 'Ahmedabad',
      basicSalary: 35000,
      employeeId: nextId,
      status: 'ACTIVE'
    };

    const doc = await Employee.create(testPayload);
    res.status(201).json({
      success: true,
      message: 'Write test passed',
      data: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 13. Employee Classification Operations (Requirement 28 & 29)
// =========================================================================
const getUnclassifiedEmployees = async (req, res) => {
  try {
    const unclassifiedQuery = {
      $or: [
        { employeeCategory: { $exists: false } },
        { employeeCategory: null },
        { employeeCategory: '' },
        { employeeCategory: 'UNCLASSIFIED' }
      ]
    };

    const employees = await Employee.find(unclassifiedQuery)
      .select('employeeId employeeCode fullName firstName lastName department departmentName designation designationTitle status employeeCategory joiningDate')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const classifyEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, employeeCategory } = req.body;
    const targetCategory = (category || employeeCategory || '').toUpperCase().trim();

    if (!['TECHNICAL', 'NON_TECHNICAL'].includes(targetCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid classification category. Must be either TECHNICAL or NON_TECHNICAL.'
      });
    }

    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ $or: [{ employeeId: id }, { employeeCode: id }] });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const previousCategory = employee.employeeCategory || (employee.isNonTechnical ? 'NON_TECHNICAL' : 'UNCLASSIFIED');

    employee.employeeCategory = targetCategory;
    employee.staffCategory = targetCategory;
    employee.isNonTechnical = targetCategory === 'NON_TECHNICAL';
    employee.updatedBy = req.user?.name || req.user?.email || 'HR Admin';

    await employee.save();

    await logEmployeeAudit(
      employee,
      req.user,
      'EMPLOYEE_CATEGORY_CLASSIFIED',
      `Employee Category Classified: Employee ${employee.employeeId} (${employee.fullName}) classified as ${targetCategory} (Previous: ${previousCategory})`,
      ['employeeCategory', 'staffCategory', 'isNonTechnical']
    );

    try {
      await AuditLog.create({
        action: 'EMPLOYEE_CATEGORY_CHANGED',
        entity: 'Employee',
        entityId: employee._id.toString(),
        user: req.user?.email || req.user?.name || 'HR Admin',
        role: req.user?.role || 'HR_ADMIN',
        changes: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          previousCategory,
          newCategory: targetCategory,
          classifiedBy: req.user?.name || req.user?.email || 'HR Admin',
          date: new Date().toISOString().split('T')[0]
        }
      });
    } catch (auditErr) {
      console.warn('[Audit Log Warning]:', auditErr.message);
    }

    res.json({
      success: true,
      message: `Employee ${employee.employeeId} (${employee.fullName}) successfully classified as ${targetCategory}. Moved to ${targetCategory === 'TECHNICAL' ? 'Technical Employee Directory' : 'Non-Technical Staff'}.`,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkClassifyEmployees = async (req, res) => {
  try {
    const { classifications } = req.body; // Array of { id / employeeId, category }
    if (!Array.isArray(classifications) || classifications.length === 0) {
      return res.status(400).json({ success: false, message: 'Classifications array is required.' });
    }

    let updatedCount = 0;
    const results = [];

    for (const item of classifications) {
      const targetCategory = (item.category || item.employeeCategory || '').toUpperCase().trim();
      if (!['TECHNICAL', 'NON_TECHNICAL'].includes(targetCategory)) continue;

      const empKey = item.id || item.employeeId || item._id;
      let employee = await Employee.findById(empKey);
      if (!employee) {
        employee = await Employee.findOne({ $or: [{ employeeId: empKey }, { employeeCode: empKey }] });
      }
      if (!employee) continue;

      const previousCategory = employee.employeeCategory || (employee.isNonTechnical ? 'NON_TECHNICAL' : 'UNCLASSIFIED');
      employee.employeeCategory = targetCategory;
      employee.staffCategory = targetCategory;
      employee.isNonTechnical = targetCategory === 'NON_TECHNICAL';
      employee.updatedBy = req.user?.name || req.user?.email || 'HR Admin';

      await employee.save();
      updatedCount++;

      results.push({
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        previousCategory,
        newCategory: targetCategory
      });
    }

    res.json({
      success: true,
      message: `Successfully classified ${updatedCount} employees.`,
      updatedCount,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  getEmployeeQuickView,
  getEmployeeFullProfile,
  createEmployee,
  updateEmployee,
  updatePersonal,
  updateJob,
  updateContact,
  updateWfh,
  updateFamily,
  updateEmergency,
  updateEducation,
  updateExperience,
  updateTeam,
  updateSocial,
  updateEmployeeStatus,
  deleteEmployee,
  generateOrUpdateIdCard,
  getIdCard,
  generateOrUpdateBusinessCard,
  getBusinessCard,
  verifyIdCardPublic,
  exportSingleEmployeeExcel,
  exportBulkEmployeesExcel,
  getImportTemplate,
  importEmployeesExcel,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  getEmployeeAudit,
  testSaveEmployee,
  validateMasterImport,
  importMasterEmployees,
  getMasterImportHistory,
  resetEmployeePassword,
  forcePasswordChange,
  updateEmployeeRole,
  getEmployeeLoginHistory,
  getAllEmployeeIdCards,
  bulkGenerateIdCards,
  getUnclassifiedEmployees,
  classifyEmployee,
  bulkClassifyEmployees
};

