const Employee = require('../../models/Employee');
const { isDBConnected } = require('../../config/db');
const { recordAudit } = require('../../middleware/audit');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

// GET /api/employees & /api/hrms/employees
const getEmployees = async (req, res) => {
  try {
    const {
      search,
      department,
      designation,
      facility,
      employmentType,
      status,
      page = 1,
      limit = 15,
      sortBy = 'createdAt',
      sortOrder = -1,
      staffCategory,
      isNonTechnical
    } = req.query;

    const query = {};

    if (staffCategory === 'NON_TECHNICAL' || isNonTechnical === 'true') {
      query.$or = [{ isNonTechnical: true }, { staffCategory: 'NON_TECHNICAL' }];
    } else if (staffCategory !== 'ALL') {
      query.isNonTechnical = { $ne: true };
      query.staffCategory = { $ne: 'NON_TECHNICAL' };
    }

    if (search) {
      const searchConditions = [
        { fullName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designationTitle: { $regex: search, $options: 'i' } },
        { departmentName: { $regex: search, $options: 'i' } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    if (department && department !== 'ALL') {
      query.$or = [{ department }, { departmentName: department }];
    }
    if (designation && designation !== 'ALL') {
      query.$or = [{ designation }, { designationTitle: designation }];
    }
    if (facility && facility !== 'ALL') query.facility = facility;
    if (employmentType && employmentType !== 'ALL') query.employmentType = employmentType;
    if (status && status !== 'ALL') query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort({ [sortBy]: parseInt(sortOrder, 10) })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: employees,
      employees, // backward-compat with HRMS table
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

// GET /api/employees/:id
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

    res.json({
      success: true,
      data: employee,
      employee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/employees
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
      email,
      phone,
      department,
      departmentName,
      designation,
      designationTitle,
      facility,
      basicSalary,
      basicPay,
      employeeCode,
      status,
      joiningDate
    } = req.body;

    // 1. Validation
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ success: false, message: 'First name is required.' });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ success: false, message: 'Last name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    const cleanPhone = phone.trim();
    if (!phoneRegex.test(cleanPhone)) {
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
    if (!facility) {
      return res.status(400).json({ success: false, message: 'Facility is required.' });
    }

    const salaryVal = basicSalary !== undefined ? Number(basicSalary) : (basicPay !== undefined ? Number(basicPay) : 0);
    if (isNaN(salaryVal) || salaryVal < 0) {
      return res.status(400).json({ success: false, message: 'Basic salary must be a positive number.' });
    }

    // 2. Check Duplicate Email
    const existing = await Employee.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email already exists.'
      });
    }

    // 3. Generate Employee Code if required
    let finalCode = employeeCode || req.body.employeeId;
    if (!finalCode) {
      const count = await Employee.countDocuments({});
      finalCode = `BJK-${String(count + 101).padStart(5, '0')}`;
    }

    // 4. Construct payload
    const newEmployeeData = {
      ...req.body,
      employeeCode: finalCode,
      employeeId: finalCode,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      email: cleanEmail,
      phone: cleanPhone,
      department: deptVal,
      departmentName: typeof deptVal === 'string' ? deptVal : (departmentName || 'Production Operations'),
      designation: desigVal,
      designationTitle: typeof desigVal === 'string' ? desigVal : (designationTitle || 'Production Line Operator'),
      facility: facility || 'BJK Unit 1 - Formulations Facility',
      basicSalary: salaryVal,
      status: status || 'ACTIVE',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      sensitiveData: {
        ...(req.body.sensitiveData || {}),
        salaryDetails: {
          basicPay: salaryVal,
          hra: Math.round(salaryVal * 0.4),
          specialAllowance: 5000,
          grossSalary: Number(salaryVal) * 1.4 + 5000,
          ctc: (Number(salaryVal) * 1.4 + 5000) * 12
        }
      },
      createdBy: req.user?.name || req.user?.email || 'BJK System Administrator',
      updatedBy: req.user?.name || req.user?.email || 'BJK System Administrator'
    };

    // 5. Save to MongoDB
    const createdEmployee = await Employee.create(newEmployeeData);

    // 6. Record Audit Log
    try {
      await recordAudit({
        req,
        action: 'CREATE_EMPLOYEE',
        module: 'HRMS',
        recordId: createdEmployee._id,
        after: {
          employeeCode: createdEmployee.employeeCode,
          fullName: createdEmployee.fullName,
          email: createdEmployee.email,
          department: createdEmployee.departmentName,
          facility: createdEmployee.facility
        },
        details: `Created new employee ${createdEmployee.employeeCode} - ${createdEmployee.fullName}`
      });
    } catch (auditErr) {
      console.warn('[Audit Log Warning]:', auditErr.message);
    }

    // 7. Return created record
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: createdEmployee,
      employee: createdEmployee
    });
  } catch (error) {
    console.error('[Employee Controller - createEmployee Error]:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email already exists.'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Employee could not be saved. Please try again.'
    });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await Employee.findById(id);
    if (!before) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updateData = { ...req.body, updatedBy: req.user?.name || 'System' };
    if (updateData.firstName || updateData.lastName) {
      const fn = updateData.firstName || before.firstName;
      const ln = updateData.lastName || before.lastName;
      updateData.fullName = `${fn} ${ln}`.trim();
    }
    if (updateData.basicSalary !== undefined) {
      updateData.basicSalary = Number(updateData.basicSalary);
    }

    const updated = await Employee.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    try {
      await recordAudit({
        req,
        action: 'UPDATE_EMPLOYEE',
        module: 'HRMS',
        recordId: updated._id,
        before: { status: before.status, department: before.departmentName, designation: before.designationTitle },
        after: { status: updated.status, department: updated.departmentName, designation: updated.designationTitle },
        details: `Updated employee profile ${updated.employeeCode || updated.employeeId} - ${updated.fullName}`
      });
    } catch (auditErr) {
      console.warn('[Audit Log Warning]:', auditErr.message);
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updated,
      employee: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/employees/:id/status
const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RESIGNED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const before = await Employee.findById(id);
    if (!before) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    before.status = status;
    before.updatedBy = req.user?.name || 'System';
    await before.save();

    try {
      await recordAudit({
        req,
        action: status === 'ARCHIVED' ? 'ARCHIVE_EMPLOYEE' : 'UPDATE_EMPLOYEE_STATUS',
        module: 'HRMS',
        recordId: before._id,
        before: { status: before.status },
        after: { status },
        details: `Changed employee ${before.employeeCode} status to ${status}`
      });
    } catch (auditErr) {
      console.warn('[Audit Log Warning]:', auditErr.message);
    }

    res.json({
      success: true,
      message: `Employee status changed to ${status}`,
      data: before,
      employee: before
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/employees/test
const testSaveEmployee = async (req, res) => {
  try {
    const testPayload = {
      firstName: 'Test',
      lastName: 'Verification',
      email: `test.verification.${Date.now()}@bjkhealthcare.com`,
      phone: '9999988888',
      department: 'Quality Assurance',
      designation: 'QA Executive',
      facility: 'BJK Unit 1 - Formulations Facility',
      basicSalary: 35000,
      status: 'ACTIVE'
    };

    const doc = await Employee.create(testPayload);
    const verifiedDoc = await Employee.findById(doc._id);

    res.status(201).json({
      success: true,
      message: 'MongoDB Atlas write test passed successfully',
      data: verifiedDoc,
      verifiedInDB: !!verifiedDoc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database write test failed: ' + error.message
    });
  }
};


// DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    employee.status = 'ARCHIVED';
    employee.updatedBy = req.user?.name || 'System';
    await employee.save();
    res.json({ success: true, message: 'Employee archived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const downloadExperienceCertificatePDF = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    const { generateExperienceCertificatePDF } = require('../../services/hrms/pdfService');
    const pdfBuffer = await generateExperienceCertificatePDF(employee);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Experience_${employee.employeeId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  testSaveEmployee,
  deleteEmployee,
  downloadExperienceCertificatePDF
};
