const mongoose = require('mongoose');
const EmployeeBankDetails = require('../../models/EmployeeBankDetails');
const Employee = require('../../models/Employee');
const AuditLog = require('../../models/AuditLog');

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/**
 * Mask account number helper
 */
const maskAccountNumber = (acc) => {
  if (!acc) return '';
  const str = String(acc).trim();
  if (str.length <= 4) return 'XXXX ' + str;
  return 'XXXX XXXX ' + str.slice(-4);
};

/**
 * Mask PAN helper
 */
const maskPAN = (pan) => {
  if (!pan) return '';
  const str = String(pan).trim();
  if (str.length <= 5) return '*****';
  return str.slice(0, 5) + '****' + str.slice(-1);
};

/**
 * Safe, idempotent migration helper:
 * Syncs any existing bank records in employees collection into employee_bank_details
 * without deleting or modifying existing collections.
 */
const syncExistingEmployeeBankDetailsToCollection = async () => {
  try {
    const employees = await Employee.find({
      $or: [
        { bankName: { $exists: true, $ne: '' } },
        { bankAccountNumber: { $exists: true, $ne: '' } },
        { 'bankDetails.accountNumber': { $exists: true, $ne: '' } },
        { 'sensitiveData.bankDetails.accountNumber': { $exists: true, $ne: '' } }
      ]
    }).lean();

    let syncedCount = 0;
    for (const emp of employees) {
      const existing = await EmployeeBankDetails.findOne({ employeeId: emp._id });
      if (!existing) {
        const bankName = emp.bankDetails?.bankName || emp.bankName || emp.sensitiveData?.bankDetails?.bankName || '';
        const accountNumber = emp.bankDetails?.accountNumber || emp.bankAccountNumber || emp.sensitiveData?.bankDetails?.accountNumber || '';
        const ifscCode = emp.bankDetails?.ifscCode || emp.ifscCode || emp.sensitiveData?.bankDetails?.ifscCode || '';
        const branchName = emp.bankDetails?.branchName || emp.sensitiveData?.bankDetails?.branch || '';
        const accountHolderName = emp.bankDetails?.accountHolderName || emp.fullName || '';
        
        let accountType = 'Salary';
        if (emp.bankDetails?.accountType) {
          const at = emp.bankDetails.accountType.toUpperCase();
          if (at === 'SAVINGS') accountType = 'Savings';
          else if (at === 'CURRENT') accountType = 'Current';
          else if (at === 'SALARY') accountType = 'Salary';
          else accountType = 'Other';
        }

        const isVerified = emp.bankDetails?.verificationStatus === 'VERIFIED';

        await EmployeeBankDetails.create({
          employeeId: emp._id,
          employeeCode: (emp.employeeId || emp.employeeCode || '').toUpperCase(),
          accountHolderName,
          accountNumber,
          accountType,
          accountStatus: 'Active',
          bankName,
          branchName,
          ifscCode: ifscCode.toUpperCase(),
          pan: (emp.panNumber || emp.sensitiveData?.panNumber || '').toUpperCase(),
          uanNumber: emp.uanNumber || emp.sensitiveData?.uanNumber || '',
          pfNumber: emp.pfNumber || '',
          esicNumber: emp.esicNumber || '',
          insuranceNumber: emp.insuranceNumber || '',
          verificationStatus: isVerified ? 'Verified' : 'Submitted',
          verificationDate: isVerified ? (emp.bankDetails?.verificationDate || new Date()) : null,
          verifiedByName: isVerified ? (emp.bankDetails?.verifiedBy || 'Dr. Vikram Mehta') : '',
          documentType: emp.bankDetails?.passbookUrl ? 'Bank Passbook' : (emp.bankDetails?.cancelledChequeUrl ? 'Cancelled Cheque' : 'Salary Account Proof'),
          bankProofReference: emp.bankDetails?.passbookUrl || emp.bankDetails?.cancelledChequeUrl || '',
          remarks: 'Preserved from official employee master records'
        });
        syncedCount++;
      }
    }
    if (syncedCount > 0) {
      console.log(`[BJK Bank Master] Non-destructively synced ${syncedCount} existing bank profiles to employee_bank_details.`);
    }
    return syncedCount;
  } catch (err) {
    console.warn('[BJK Bank Master] Existing bank sync note:', err.message);
    return 0;
  }
};

/**
 * Get bank details for an employee
 */
const getEmployeeBankDetails = async (employeeIdentifier) => {
  let employee = null;

  if (mongoose.isValidObjectId(employeeIdentifier)) {
    employee = await Employee.findById(employeeIdentifier);
  }
  if (!employee) {
    employee = await Employee.findOne({
      $or: [
        { employeeId: String(employeeIdentifier).toUpperCase().trim() },
        { employeeCode: String(employeeIdentifier).toUpperCase().trim() }
      ]
    });
  }

  if (!employee) {
    throw new Error(`Employee record not found for identifier: ${employeeIdentifier}`);
  }

  let bankDetails = await EmployeeBankDetails.findOne({ employeeId: employee._id });

  // If no bank record yet, check if employee master has bank data to initialize from
  if (!bankDetails) {
    const hasMasterBank = employee.bankName || employee.bankAccountNumber || employee.bankDetails?.accountNumber;
    if (hasMasterBank) {
      bankDetails = await EmployeeBankDetails.create({
        employeeId: employee._id,
        employeeCode: (employee.employeeId || employee.employeeCode || '').toUpperCase(),
        accountHolderName: employee.bankDetails?.accountHolderName || employee.fullName || '',
        accountNumber: employee.bankDetails?.accountNumber || employee.bankAccountNumber || '',
        accountType: 'Salary',
        accountStatus: 'Active',
        bankName: employee.bankDetails?.bankName || employee.bankName || '',
        branchName: employee.bankDetails?.branchName || '',
        ifscCode: (employee.bankDetails?.ifscCode || employee.ifscCode || '').toUpperCase(),
        pan: (employee.panNumber || employee.sensitiveData?.panNumber || '').toUpperCase(),
        uanNumber: employee.uanNumber || employee.sensitiveData?.uanNumber || '',
        pfNumber: employee.pfNumber || '',
        esicNumber: employee.esicNumber || '',
        insuranceNumber: employee.insuranceNumber || '',
        verificationStatus: employee.bankDetails?.verificationStatus === 'VERIFIED' ? 'Verified' : 'Submitted',
        verificationDate: employee.bankDetails?.verificationDate || (employee.bankDetails?.verificationStatus === 'VERIFIED' ? new Date() : null),
        verifiedByName: employee.bankDetails?.verifiedBy || '',
        remarks: 'Auto-populated from employee master'
      });
    } else {
      // Return a transient virtual default object
      return {
        isNew: true,
        employeeId: employee._id,
        employeeCode: employee.employeeId || employee.employeeCode,
        accountHolderName: employee.fullName || '',
        accountNumber: '',
        accountType: 'Salary',
        accountStatus: 'Pending Verification',
        bankName: '',
        branchName: '',
        branchAddress: '',
        city: employee.city || 'Ahmedabad',
        state: employee.state || 'Gujarat',
        ifscCode: '',
        micrCode: '',
        bankCode: '',
        branchCode: '',
        pan: (employee.panNumber || employee.sensitiveData?.panNumber || '').toUpperCase(),
        uanNumber: employee.uanNumber || employee.sensitiveData?.uanNumber || '',
        pfNumber: employee.pfNumber || '',
        esicNumber: employee.esicNumber || '',
        insuranceNumber: employee.insuranceNumber || '',
        customerId: '',
        crnNumber: '',
        bankCustomerId: '',
        verificationStatus: 'Not Submitted',
        verificationDate: null,
        verifiedBy: null,
        verifiedByName: '',
        documentType: 'Cancelled Cheque',
        documentNumber: '',
        bankProofReference: '',
        remarks: '',
        maskedAccountNumber: '',
        maskedPAN: maskPAN(employee.panNumber || employee.sensitiveData?.panNumber || '')
      };
    }
  }

  return bankDetails;
};

/**
 * Save or submit employee bank details
 */
const saveOrUpdateEmployeeBankDetails = async (employeeIdentifier, data, user, isSubmit = false) => {
  let employee = null;

  if (mongoose.isValidObjectId(employeeIdentifier)) {
    employee = await Employee.findById(employeeIdentifier);
  }
  if (!employee) {
    employee = await Employee.findOne({
      $or: [
        { employeeId: String(employeeIdentifier).toUpperCase().trim() },
        { employeeCode: String(employeeIdentifier).toUpperCase().trim() }
      ]
    });
  }

  if (!employee) {
    throw new Error(`Employee record not found for identifier: ${employeeIdentifier}`);
  }

  // Basic Validation if Submitting
  if (isSubmit || data.action === 'SUBMIT') {
    if (!data.accountHolderName || !data.accountHolderName.trim()) {
      throw new Error('Account Holder Name is required for submission.');
    }
    if (!data.accountNumber || !data.accountNumber.trim()) {
      throw new Error('Account Number is required for submission.');
    }
    if (!data.bankName || !data.bankName.trim()) {
      throw new Error('Bank Name is required for submission.');
    }
    if (!data.branchName || !data.branchName.trim()) {
      throw new Error('Branch Name is required for submission.');
    }
    if (!data.ifscCode || !data.ifscCode.trim()) {
      throw new Error('IFSC Code is required for submission.');
    }
    if (!IFSC_REGEX.test(data.ifscCode.trim().toUpperCase())) {
      throw new Error('Invalid IFSC format. Expected standard 11-character format (e.g., SBIN0003044).');
    }
  } else if (data.ifscCode && data.ifscCode.trim()) {
    // If entered in draft, validate format
    if (!IFSC_REGEX.test(data.ifscCode.trim().toUpperCase())) {
      throw new Error('Invalid IFSC Code format. Expected format like SBIN0003044.');
    }
  }

  let bankDetails = await EmployeeBankDetails.findOne({ employeeId: employee._id });
  const isCreate = !bankDetails;

  let oldDataMasked = null;
  let newStatus = 'Draft';

  if (isCreate) {
    newStatus = (isSubmit || data.action === 'SUBMIT') ? 'Submitted' : 'Draft';
    bankDetails = new EmployeeBankDetails({
      employeeId: employee._id,
      employeeCode: (employee.employeeId || employee.employeeCode).toUpperCase(),
      createdBy: user?._id || null
    });
  } else {
    oldDataMasked = {
      accountHolderName: bankDetails.accountHolderName,
      accountNumber: maskAccountNumber(bankDetails.accountNumber),
      bankName: bankDetails.bankName,
      ifscCode: bankDetails.ifscCode,
      verificationStatus: bankDetails.verificationStatus
    };

    // Change Detection (Section 39)
    // If previously Verified, and material fields change -> trigger Needs Re-Verification
    const previousStatus = bankDetails.verificationStatus;
    const materialChanged =
      (data.accountNumber && data.accountNumber.trim() !== bankDetails.accountNumber) ||
      (data.bankName && data.bankName.trim() !== bankDetails.bankName) ||
      (data.ifscCode && data.ifscCode.trim().toUpperCase() !== bankDetails.ifscCode) ||
      (data.branchName && data.branchName.trim() !== bankDetails.branchName) ||
      (data.accountType && data.accountType !== bankDetails.accountType);

    if (previousStatus === 'Verified' && materialChanged) {
      newStatus = 'Needs Re-Verification';
    } else if (isSubmit || data.action === 'SUBMIT') {
      newStatus = 'Submitted';
    } else {
      newStatus = previousStatus === 'Verified' ? 'Verified' : 'Draft';
    }
  }

  // Update fields
  if (data.accountHolderName !== undefined) bankDetails.accountHolderName = data.accountHolderName.trim();
  if (data.accountNumber !== undefined && data.accountNumber.trim()) bankDetails.accountNumber = data.accountNumber.trim();
  if (data.accountType !== undefined) bankDetails.accountType = data.accountType;
  if (data.accountStatus !== undefined) bankDetails.accountStatus = data.accountStatus;

  if (data.bankName !== undefined) bankDetails.bankName = data.bankName.trim();
  if (data.branchName !== undefined) bankDetails.branchName = data.branchName.trim();
  if (data.branchAddress !== undefined) bankDetails.branchAddress = data.branchAddress.trim();
  if (data.city !== undefined) bankDetails.city = data.city.trim();
  if (data.state !== undefined) bankDetails.state = data.state.trim();
  if (data.ifscCode !== undefined) bankDetails.ifscCode = data.ifscCode.trim().toUpperCase();
  if (data.micrCode !== undefined) bankDetails.micrCode = data.micrCode.trim();
  if (data.bankCode !== undefined) bankDetails.bankCode = data.bankCode.trim();
  if (data.branchCode !== undefined) bankDetails.branchCode = data.branchCode.trim();

  // Government & Statutory References
  if (data.pan !== undefined) bankDetails.pan = data.pan.trim().toUpperCase();
  if (data.uanNumber !== undefined) bankDetails.uanNumber = data.uanNumber.trim();
  if (data.pfNumber !== undefined) bankDetails.pfNumber = data.pfNumber.trim();
  if (data.esicNumber !== undefined) bankDetails.esicNumber = data.esicNumber.trim();
  if (data.insuranceNumber !== undefined) bankDetails.insuranceNumber = data.insuranceNumber.trim();

  // Customer References
  if (data.customerId !== undefined) bankDetails.customerId = data.customerId.trim();
  if (data.crnNumber !== undefined) bankDetails.crnNumber = data.crnNumber.trim();
  if (data.bankCustomerId !== undefined) bankDetails.bankCustomerId = data.bankCustomerId.trim();

  // Bank Proof
  if (data.documentType !== undefined) bankDetails.documentType = data.documentType.trim();
  if (data.documentNumber !== undefined) bankDetails.documentNumber = data.documentNumber.trim();
  if (data.bankProofReference !== undefined) bankDetails.bankProofReference = data.bankProofReference.trim();

  // Status & audit meta
  bankDetails.verificationStatus = newStatus;
  bankDetails.updatedBy = user?._id || null;

  await bankDetails.save();

  // Audit Logging (Section 15, 40) - Do NOT log full account numbers
  const auditAction = isCreate
    ? 'BANK_DETAILS_CREATED'
    : (isSubmit || data.action === 'SUBMIT')
      ? 'BANK_DETAILS_SUBMITTED'
      : 'BANK_DETAILS_UPDATED';

  try {
    await AuditLog.create({
      user: {
        id: user?._id || null,
        name: user?.name || employee.fullName || 'Employee Self-Service',
        email: user?.email || employee.email || 'employee@bjkhealthcare.com',
        role: user?.role || 'EMPLOYEE'
      },
      action: auditAction,
      module: 'HRMS',
      resource: 'EmployeeBankDetails',
      resourceId: bankDetails._id.toString(),
      recordId: employee.employeeId || employee.employeeCode,
      targetUser: {
        id: employee.user || null,
        name: employee.fullName,
        employeeId: employee.employeeId || employee.employeeCode,
        email: employee.email
      },
      oldData: oldDataMasked,
      newData: {
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: maskAccountNumber(bankDetails.accountNumber),
        bankName: bankDetails.bankName,
        ifscCode: bankDetails.ifscCode,
        verificationStatus: bankDetails.verificationStatus
      },
      status: 'SUCCESS',
      details: `Employee bank details ${auditAction.toLowerCase().replace(/_/g, ' ')} for ${employee.fullName} (${employee.employeeId}).`
    });
  } catch (auditErr) {
    console.warn('[Audit Log Warning]:', auditErr.message);
  }

  return bankDetails;
};

/**
 * HR Verify Bank Details (Section 14)
 */
const hrVerifyBankDetails = async (employeeIdentifier, hrUser, remarks = 'Verified by HR') => {
  const bankDetails = await getEmployeeBankDetails(employeeIdentifier);
  if (!bankDetails || bankDetails.isNew) {
    throw new Error('Bank details record not found to verify.');
  }

  const previousStatus = bankDetails.verificationStatus;
  bankDetails.verificationStatus = 'Verified';
  bankDetails.verificationDate = new Date();
  bankDetails.verifiedBy = hrUser?._id || null;
  bankDetails.verifiedByName = hrUser?.name || 'HR Administrator';
  bankDetails.remarks = remarks || 'Verified by HR';
  bankDetails.accountStatus = 'Active';

  await bankDetails.save();

  // Audit Log
  try {
    await AuditLog.create({
      user: {
        id: hrUser?._id || null,
        name: hrUser?.name || 'HR Admin',
        email: hrUser?.email || 'hr@bjkhealthcare.com',
        role: hrUser?.role || 'HR_ADMIN'
      },
      action: 'BANK_DETAILS_VERIFIED',
      module: 'HRMS',
      resource: 'EmployeeBankDetails',
      resourceId: bankDetails._id.toString(),
      recordId: bankDetails.employeeCode,
      oldData: { verificationStatus: previousStatus },
      newData: { verificationStatus: 'Verified', verifiedBy: hrUser?.name, verifiedDate: bankDetails.verificationDate },
      status: 'SUCCESS',
      details: `Bank details verified by ${hrUser?.name}. Remarks: ${remarks}`
    });
  } catch (auditErr) {
    console.warn('[Audit Log Warning]:', auditErr.message);
  }

  return bankDetails;
};

/**
 * HR Reject Bank Details (Section 14)
 */
const hrRejectBankDetails = async (employeeIdentifier, hrUser, remarks) => {
  if (!remarks || !remarks.trim()) {
    throw new Error('Remarks are mandatory when rejecting bank details.');
  }

  const bankDetails = await getEmployeeBankDetails(employeeIdentifier);
  if (!bankDetails || bankDetails.isNew) {
    throw new Error('Bank details record not found to reject.');
  }

  const previousStatus = bankDetails.verificationStatus;
  bankDetails.verificationStatus = 'Rejected';
  bankDetails.remarks = remarks.trim();
  bankDetails.verifiedBy = hrUser?._id || null;
  bankDetails.verifiedByName = hrUser?.name || 'HR Administrator';
  bankDetails.verificationDate = new Date();

  await bankDetails.save();

  try {
    await AuditLog.create({
      user: {
        id: hrUser?._id || null,
        name: hrUser?.name || 'HR Admin',
        email: hrUser?.email || 'hr@bjkhealthcare.com',
        role: hrUser?.role || 'HR_ADMIN'
      },
      action: 'BANK_DETAILS_REJECTED',
      module: 'HRMS',
      resource: 'EmployeeBankDetails',
      resourceId: bankDetails._id.toString(),
      recordId: bankDetails.employeeCode,
      oldData: { verificationStatus: previousStatus },
      newData: { verificationStatus: 'Rejected', remarks: remarks.trim() },
      status: 'SUCCESS',
      details: `Bank details rejected by ${hrUser?.name}. Reason: ${remarks.trim()}`
    });
  } catch (auditErr) {
    console.warn('[Audit Log Warning]:', auditErr.message);
  }

  return bankDetails;
};

/**
 * HR Request Correction (Section 14)
 */
const hrRequestCorrection = async (employeeIdentifier, hrUser, remarks) => {
  if (!remarks || !remarks.trim()) {
    throw new Error('Remarks are mandatory when requesting correction.');
  }

  const bankDetails = await getEmployeeBankDetails(employeeIdentifier);
  if (!bankDetails || bankDetails.isNew) {
    throw new Error('Bank details record not found.');
  }

  const previousStatus = bankDetails.verificationStatus;
  bankDetails.verificationStatus = 'Needs Correction';
  bankDetails.remarks = remarks.trim();
  bankDetails.verifiedBy = hrUser?._id || null;
  bankDetails.verifiedByName = hrUser?.name || 'HR Administrator';
  bankDetails.verificationDate = new Date();

  await bankDetails.save();

  try {
    await AuditLog.create({
      user: {
        id: hrUser?._id || null,
        name: hrUser?.name || 'HR Admin',
        email: hrUser?.email || 'hr@bjkhealthcare.com',
        role: hrUser?.role || 'HR_ADMIN'
      },
      action: 'BANK_DETAILS_CORRECTION_REQUESTED',
      module: 'HRMS',
      resource: 'EmployeeBankDetails',
      resourceId: bankDetails._id.toString(),
      recordId: bankDetails.employeeCode,
      oldData: { verificationStatus: previousStatus },
      newData: { verificationStatus: 'Needs Correction', remarks: remarks.trim() },
      status: 'SUCCESS',
      details: `Correction requested by ${hrUser?.name}. Remarks: ${remarks.trim()}`
    });
  } catch (auditErr) {
    console.warn('[Audit Log Warning]:', auditErr.message);
  }

  return bankDetails;
};

/**
 * HR Bank Details Directory List & Status Statistics (Section 29, 30, 31, 32)
 */
const getHRBankDetailsList = async (query = {}) => {
  const {
    search = '',
    department = 'ALL',
    subDepartment = 'ALL',
    designation = 'ALL',
    bankName = 'ALL',
    accountType = 'ALL',
    accountStatus = 'ALL',
    verificationStatus = 'ALL',
    page = 1,
    limit = 50
  } = query;

  // Build employee filter
  const empMatch = {};
  if (department && department !== 'ALL') {
    empMatch['department'] = new RegExp('^' + department + '$', 'i');
  }
  if (subDepartment && subDepartment !== 'ALL') {
    empMatch['subDepartment'] = new RegExp('^' + subDepartment + '$', 'i');
  }
  if (designation && designation !== 'ALL') {
    empMatch['designation'] = new RegExp('^' + designation + '$', 'i');
  }

  const allEmployees = await Employee.find(empMatch)
    .select('_id employeeId employeeCode fullName firstName lastName department departmentName designation designationTitle photo profilePhoto')
    .lean();

  const empMap = new Map();
  allEmployees.forEach(e => {
    empMap.set(e._id.toString(), e);
  });

  const empIds = Array.from(empMap.keys()).map(id => new mongoose.Types.ObjectId(id));

  // Build bank details query
  const bankQuery = { employeeId: { $in: empIds } };

  if (bankName && bankName !== 'ALL') {
    bankQuery['bankName'] = new RegExp('^' + bankName + '$', 'i');
  }
  if (accountType && accountType !== 'ALL') {
    bankQuery['accountType'] = accountType;
  }
  if (accountStatus && accountStatus !== 'ALL') {
    bankQuery['accountStatus'] = accountStatus;
  }
  if (verificationStatus && verificationStatus !== 'ALL') {
    bankQuery['verificationStatus'] = verificationStatus;
  }

  const bankRecords = await EmployeeBankDetails.find(bankQuery).lean();
  const bankRecordMap = new Map();
  bankRecords.forEach(b => {
    bankRecordMap.set(b.employeeId.toString(), b);
  });

  // Combine results
  let combined = allEmployees.map(emp => {
    const bank = bankRecordMap.get(emp._id.toString());
    const vStatus = bank ? bank.verificationStatus : 'Not Submitted';

    let deptName = 'Operations';
    if (emp.departmentName) {
      deptName = String(emp.departmentName);
    } else if (typeof emp.department === 'string') {
      deptName = emp.department;
    } else if (emp.department && typeof emp.department === 'object') {
      deptName = emp.department.name || String(emp.department._id || emp.department);
    }

    let desigName = 'Staff';
    if (emp.designationTitle) {
      desigName = String(emp.designationTitle);
    } else if (typeof emp.designation === 'string') {
      desigName = emp.designation;
    } else if (emp.designation && typeof emp.designation === 'object') {
      desigName = emp.designation.title || emp.designation.name || String(emp.designation._id || emp.designation);
    }

    return {
      employeeId: emp._id,
      employeeCode: emp.employeeId || emp.employeeCode,
      employeeName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      department: deptName,
      designation: desigName,
      photo: emp.photo || emp.profilePhoto || null,
      bankName: bank?.bankName || '',
      branchName: bank?.branchName || '',
      accountType: bank?.accountType || 'Salary',
      accountStatus: bank?.accountStatus || 'Pending Verification',
      maskedAccountNumber: maskAccountNumber(bank?.accountNumber || ''),
      ifscCode: bank?.ifscCode || '',
      verificationStatus: vStatus,
      verificationDate: bank?.verificationDate || null,
      verifiedByName: bank?.verifiedByName || '',
      remarks: bank?.remarks || '',
      hasBankRecord: Boolean(bank)
    };
  });

  // Search filtering
  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    combined = combined.filter(item =>
      String(item.employeeName || '').toLowerCase().includes(term) ||
      String(item.employeeCode || '').toLowerCase().includes(term) ||
      String(item.department || '').toLowerCase().includes(term) ||
      String(item.bankName || '').toLowerCase().includes(term) ||
      String(item.verificationStatus || '').toLowerCase().includes(term)
    );
  }

  // Filter verificationStatus if requested and not covered
  if (verificationStatus && verificationStatus !== 'ALL') {
    combined = combined.filter(item => String(item.verificationStatus || '').toLowerCase() === verificationStatus.toLowerCase());
  }

  // Compute statistics across all employees
  let verifiedCount = 0;
  let pendingReviewCount = 0;
  let needsCorrectionCount = 0;
  let notSubmittedCount = 0;

  allEmployees.forEach(emp => {
    const b = bankRecordMap.get(emp._id.toString());
    const st = b ? b.verificationStatus : 'Not Submitted';
    if (st === 'Verified') verifiedCount++;
    else if (st === 'Submitted' || st === 'Under Review' || st === 'Needs Re-Verification') pendingReviewCount++;
    else if (st === 'Needs Correction' || st === 'Rejected') needsCorrectionCount++;
    else notSubmittedCount++;
  });

  const total = combined.length;
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.max(1, parseInt(limit, 10));
  const pagedData = combined.slice((p - 1) * l, p * l);

  return {
    items: pagedData,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1
    },
    statistics: {
      totalEmployees: allEmployees.length,
      verified: verifiedCount,
      pendingReview: pendingReviewCount,
      needsCorrection: needsCorrectionCount,
      notSubmitted: notSubmittedCount
    }
  };
};

/**
 * Live IFSC format validation and branch lookup (Section 6)
 */
const lookupIFSC = async (code) => {
  const cleanCode = String(code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'IFSC Code is required.' };
  }

  if (!IFSC_REGEX.test(cleanCode)) {
    return {
      valid: false,
      ifsc: cleanCode,
      message: 'Invalid IFSC format. Expected standard 11-character format (e.g. SBIN0003044).'
    };
  }

  // Attempt live lookup with graceful offline fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`https://ifsc.razorpay.com/${cleanCode}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        valid: true,
        ifsc: cleanCode,
        bankName: data.BANK || '',
        branchName: data.BRANCH || '',
        branchAddress: data.ADDRESS || '',
        city: data.CITY || '',
        state: data.STATE || '',
        micrCode: data.MICR || '',
        bankCode: data.BANKCODE || '',
        status: 'Retrieved from Banking Registry'
      };
    }
  } catch (_) {}

  // Graceful fallback per Section 6:
  // "IFSC Format Valid, Bank Verification Pending"
  return {
    valid: true,
    ifsc: cleanCode,
    bankName: '',
    branchName: '',
    status: 'IFSC Format Valid',
    note: 'Verification Pending'
  };
};

module.exports = {
  maskAccountNumber,
  maskPAN,
  getEmployeeBankDetails,
  saveOrUpdateEmployeeBankDetails,
  hrVerifyBankDetails,
  hrRejectBankDetails,
  hrRequestCorrection,
  getHRBankDetailsList,
  lookupIFSC,
  syncExistingEmployeeBankDetailsToCollection
};
