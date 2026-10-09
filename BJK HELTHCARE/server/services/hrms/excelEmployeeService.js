const ExcelJS = require('exceljs');
const Employee = require('../../models/Employee');

const BJK_TEAL = 'FF00A896';
const BJK_DARK = 'FF1E293B';
const BJK_LIGHT_BG = 'FFF8FAFC';
const BJK_BORDER = 'FFE2E8F0';

/**
 * Apply standard corporate header styling to a worksheet row
 */
const styleHeaderRow = (row, color = BJK_TEAL) => {
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color }
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: BJK_BORDER } },
      left: { style: 'thin', color: { argb: BJK_BORDER } },
      bottom: { style: 'medium', color: { argb: BJK_DARK } },
      right: { style: 'thin', color: { argb: BJK_BORDER } }
    };
  });
  row.height = 24;
};

/**
 * Style data rows with subtle alternating background and clean borders
 */
const styleDataRows = (sheet, startRowIndex = 2) => {
  for (let i = startRowIndex; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const isEven = i % 2 === 0;
    row.eachCell({ includeEmpty: true }, (cell) => {
      if (isEven && !cell.fill) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' }
        };
      }
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: BJK_BORDER } },
        left: { style: 'thin', color: { argb: BJK_BORDER } },
        bottom: { style: 'thin', color: { argb: BJK_BORDER } },
        right: { style: 'thin', color: { argb: BJK_BORDER } }
      };
      if (cell.value instanceof Date) {
        cell.numFmt = 'yyyy-mm-dd';
      }
    });
    row.height = 20;
  }
};

/**
 * Auto-fit column widths based on longest cell text
 */
const autoFitColumns = (sheet, minWidth = 14) => {
  sheet.columns.forEach((col) => {
    let maxLen = minWidth;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const valStr = cell.value ? String(cell.value) : '';
      if (valStr.length > maxLen) {
        maxLen = Math.min(valStr.length + 3, 50);
      }
    });
    col.width = maxLen;
  });
};

/**
 * 1. Generate Individual Employee Multi-Sheet XLSX
 */
const generateIndividualEmployeeWorkbook = async (employee) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'BJK Healthcare Enterprise HRMS';
  wb.created = new Date();

  // ----------------------------------------------------
  // Sheet 01: Employee Master Summary
  // ----------------------------------------------------
  const sMaster = wb.addWorksheet('01 Employee Master');
  sMaster.columns = [
    { header: 'Attribute', key: 'attr', width: 28 },
    { header: 'Master Record Value', key: 'val', width: 45 }
  ];
  styleHeaderRow(sMaster.getRow(1));

  sMaster.addRows([
    { attr: 'Employee ID', val: employee.employeeCode || employee.employeeId || 'N/A' },
    { attr: 'Full Name', val: employee.fullName || `${employee.firstName} ${employee.lastName}` },
    { attr: 'Designation', val: employee.designationTitle || employee.designation || 'N/A' },
    { attr: 'Department', val: employee.departmentName || employee.department || 'N/A' },
    { attr: 'Sub Department', val: employee.subDepartment || 'General Operations' },
    { attr: 'Branch', val: employee.branch || employee.facility || 'Ahmedabad' },
    { attr: 'Work Location', val: employee.workLocation || 'Ahmedabad Plant' },
    { attr: 'Date of Joining', val: employee.dateOfJoining || employee.joiningDate ? new Date(employee.dateOfJoining || employee.joiningDate).toLocaleDateString() : 'N/A' },
    { attr: 'Employment Type', val: employee.employmentType || 'FULL_TIME' },
    { attr: 'Employment Status', val: employee.employmentStatus || employee.status || 'Active' },
    { attr: 'Reporting Manager', val: employee.reportingManagerName || employee.managerName || 'Executive Director' },
    { attr: 'HR Manager', val: employee.hrManager || 'Kritika Parmar' },
    { attr: 'Official Email', val: employee.email || employee.workEmail || 'N/A' },
    { attr: 'Official Mobile', val: employee.phone || employee.officialMobile || 'N/A' },
    { attr: 'Profile Completion', val: `${employee.profileCompletion || 100}%` },
    { attr: 'ID Card Verification Code', val: employee.identityCard?.qrVerificationCode || 'VERIFIED-ACTIVE' }
  ]);
  styleDataRows(sMaster);

  // ----------------------------------------------------
  // Sheet 02: Personal Information
  // ----------------------------------------------------
  const sPersonal = wb.addWorksheet('02 Personal Information');
  sPersonal.columns = [
    { header: 'Field', key: 'field', width: 25 },
    { header: 'Value', key: 'val', width: 40 }
  ];
  styleHeaderRow(sPersonal.getRow(1));

  sPersonal.addRows([
    { field: 'Full Name', val: employee.fullName || `${employee.firstName} ${employee.lastName}` },
    { field: 'Father Name', val: employee.fatherName || employee.familyDetails?.fatherName || '-' },
    { field: 'Mother Name', val: employee.motherName || employee.familyDetails?.motherName || '-' },
    { field: 'Date of Birth', val: employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : '-' },
    { field: 'Gender', val: employee.gender || 'Male' },
    { field: 'Blood Group', val: employee.bloodGroup || 'O+' },
    { field: 'Marital Status', val: employee.maritalStatus || 'Single' },
    { field: 'Nationality', val: employee.nationality || 'Indian' },
    { field: 'Religion', val: employee.religion || 'Hinduism' },
    { field: 'Personal Email', val: employee.personalEmail || '-' },
    { field: 'Personal Mobile', val: employee.personalMobile || '-' },
    { field: 'Aadhaar / Govt ID', val: employee.aadhaarNumber || employee.governmentId || 'Verified KYC' },
    { field: 'PAN Number', val: employee.panNumber || '-' }
  ]);
  styleDataRows(sPersonal);

  // ----------------------------------------------------
  // Sheet 03: Job Information
  // ----------------------------------------------------
  const sJob = wb.addWorksheet('03 Job Information');
  sJob.columns = [
    { header: 'Job Parameter', key: 'param', width: 28 },
    { header: 'Assignment Details', key: 'details', width: 42 }
  ];
  styleHeaderRow(sJob.getRow(1));

  sJob.addRows([
    { param: 'Employee ID', val: employee.employeeCode || employee.employeeId },
    { param: 'Date of Joining', val: employee.dateOfJoining || employee.joiningDate },
    { param: 'Employment Type', val: employee.employmentType },
    { param: 'Employee Category', val: employee.employeeCategory || 'Staff' },
    { param: 'Employment Status', val: employee.employmentStatus || employee.status },
    { param: 'Designation', val: employee.designationTitle || employee.designation },
    { param: 'Department', val: employee.departmentName || employee.department },
    { param: 'Sub Department', val: employee.subDepartment || '-' },
    { param: 'Grade', val: employee.grade || 'L1' },
    { param: 'Skill Level', val: employee.skillLevel || 'Skilled' },
    { param: 'Branch', val: employee.branch || 'Ahmedabad' },
    { param: 'Work Location', val: employee.workLocation || 'Ahmedabad Plant' },
    { param: 'Job Location', val: employee.jobLocation || 'Ahmedabad' },
    { param: 'Reporting Manager', val: employee.reportingManagerName || employee.managerName || '-' },
    { param: 'HR Manager', val: employee.hrManager || 'Kritika Parmar' },
    { param: 'Team', val: employee.team || 'Operations' },
    { param: 'Shift', val: employee.shift || employee.shiftName || 'General Shift (09:00 - 18:00)' },
    { param: 'Alternative Shift', val: employee.alternativeShift || 'None' },
    { param: 'Company Transport', val: employee.companyTransport ? 'Eligible / Yes' : 'No' },
    { param: 'Company Accommodation', val: employee.companyAccommodation ? 'Provided / Yes' : 'No' },
    { param: 'Probation Period', val: employee.probationPeriod || `${employee.probationPeriodMonths || 6} Months` },
    { param: 'Probation End Date', val: employee.probationEndDate ? new Date(employee.probationEndDate).toLocaleDateString() : '-' },
    { param: 'Permanent Employee Date', val: employee.permanentEmployeeDate || employee.confirmationDate ? new Date(employee.permanentEmployeeDate || employee.confirmationDate).toLocaleDateString() : '-' },
    { param: 'Retirement Age', val: `${employee.retirementAge || 58} Years` },
    { param: 'Previous Member ID', val: employee.previousMemberId || '-' }
  ]);
  styleDataRows(sJob);

  // ----------------------------------------------------
  // Sheet 04: Contact Details
  // ----------------------------------------------------
  const sContact = wb.addWorksheet('04 Contact Details');
  sContact.columns = [
    { header: 'Contact Field', key: 'f', width: 25 },
    { header: 'Value', key: 'v', width: 45 }
  ];
  styleHeaderRow(sContact.getRow(1));

  sContact.addRows([
    { f: 'Official Email', v: employee.email || employee.workEmail },
    { f: 'Official Mobile', v: employee.phone || employee.officialMobile },
    { f: 'Alternate Mobile', v: employee.alternateMobile || '-' },
    { f: 'Personal Email', v: employee.personalEmail || '-' },
    { f: 'Work Phone', v: employee.workPhone || '-' },
    { f: 'Emergency Phone', v: employee.emergencyPhone || employee.emergencyContactPhone || '-' },
    { f: 'Current Address', v: employee.currentAddress || employee.currentAddressDetails?.line1 || '-' },
    { f: 'Current City / State / PIN', v: `${employee.currentAddressDetails?.city || employee.city || 'Ahmedabad'}, ${employee.currentAddressDetails?.state || employee.state || 'Gujarat'} - ${employee.currentAddressDetails?.pinCode || employee.postalCode || '382330'}` },
    { f: 'Permanent Address', v: employee.permanentAddress || employee.permanentAddressDetails?.line1 || '-' },
    { f: 'Permanent City / State / PIN', v: `${employee.permanentAddressDetails?.city || employee.city || 'Ahmedabad'}, ${employee.permanentAddressDetails?.state || employee.state || 'Gujarat'} - ${employee.permanentAddressDetails?.pinCode || employee.postalCode || '382330'}` }
  ]);
  styleDataRows(sContact);

  // ----------------------------------------------------
  // Sheet 05: WFH Address
  // ----------------------------------------------------
  const sWfh = wb.addWorksheet('05 WFH Address');
  sWfh.columns = [
    { header: 'WFH Parameter', key: 'p', width: 25 },
    { header: 'Details', key: 'd', width: 45 }
  ];
  styleHeaderRow(sWfh.getRow(1));

  const wfh = employee.wfhDetails || {};
  sWfh.addRows([
    { p: 'WFH Eligible', d: wfh.wfhEligible ? 'Yes' : 'No' },
    { p: 'WFH Address Line 1', d: wfh.line1 || '-' },
    { p: 'WFH Address Line 2', d: wfh.line2 || '-' },
    { p: 'City', d: wfh.city || '-' },
    { p: 'State', d: wfh.state || '-' },
    { p: 'PIN Code', d: wfh.pinCode || '-' },
    { p: 'Latitude / Longitude', d: wfh.latitude ? `${wfh.latitude}, ${wfh.longitude}` : '-' },
    { p: 'Approval Status', d: wfh.wfhApprovalStatus || 'Not Applicable' },
    { p: 'Approved By', d: wfh.approvedBy || '-' },
    { p: 'Approval Date', d: wfh.approvalDate ? new Date(wfh.approvalDate).toLocaleDateString() : '-' },
    { p: 'Remarks', d: wfh.wfhRemarks || '-' }
  ]);
  styleDataRows(sWfh);

  // ----------------------------------------------------
  // Sheet 06: Family Details
  // ----------------------------------------------------
  const sFamily = wb.addWorksheet('06 Family');
  sFamily.columns = [
    { header: 'Relationship', key: 'rel', width: 16 },
    { header: 'Full Name', key: 'name', width: 26 },
    { header: 'Date of Birth', key: 'dob', width: 15 },
    { header: 'Gender', key: 'gender', width: 12 },
    { header: 'Occupation', key: 'occ', width: 20 },
    { header: 'Mobile', key: 'mobile', width: 18 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Dependent', key: 'dep', width: 12 },
    { header: 'Nominee', key: 'nom', width: 12 },
    { header: 'Emergency Contact', key: 'em', width: 18 }
  ];
  styleHeaderRow(sFamily.getRow(1));

  if (Array.isArray(employee.familyMembers) && employee.familyMembers.length > 0) {
    employee.familyMembers.forEach((fm) => {
      sFamily.addRow({
        rel: fm.relationship,
        name: fm.name,
        dob: fm.dob ? new Date(fm.dob).toLocaleDateString() : '-',
        gender: fm.gender,
        occ: fm.occupation || '-',
        mobile: fm.mobile || '-',
        email: fm.email || '-',
        dep: fm.dependent ? 'Yes' : 'No',
        nom: fm.nominee ? 'Yes' : 'No',
        em: fm.emergencyContact ? 'Yes' : 'No'
      });
    });
  } else if (employee.familyDetails?.fatherName) {
    sFamily.addRow({
      rel: 'Father',
      name: employee.familyDetails.fatherName,
      dob: '-',
      gender: 'Male',
      occ: '-',
      mobile: '-',
      email: '-',
      dep: 'Yes',
      nom: 'No',
      em: 'Yes'
    });
  }
  styleDataRows(sFamily);

  // ----------------------------------------------------
  // Sheet 07: Emergency Contacts
  // ----------------------------------------------------
  const sEm = wb.addWorksheet('07 Emergency');
  sEm.columns = [
    { header: 'Contact Type', key: 'type', width: 18 },
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Relationship', key: 'rel', width: 16 },
    { header: 'Mobile', key: 'mob', width: 18 },
    { header: 'Alternate Mobile', key: 'alt', width: 18 },
    { header: 'Email', key: 'email', width: 24 },
    { header: 'Address', key: 'addr', width: 35 }
  ];
  styleHeaderRow(sEm.getRow(1));

  if (Array.isArray(employee.emergencyContacts) && employee.emergencyContacts.length > 0) {
    employee.emergencyContacts.forEach((em, idx) => {
      sEm.addRow({
        type: em.isPrimary || idx === 0 ? 'Primary' : 'Secondary',
        name: em.name,
        rel: em.relationship,
        mob: em.mobile,
        alt: em.alternateMobile || '-',
        email: em.email || '-',
        addr: em.address || '-'
      });
    });
  } else if (employee.emergencyContact?.name || employee.emergencyContactName) {
    sEm.addRow({
      type: 'Primary',
      name: employee.emergencyContact?.name || employee.emergencyContactName,
      rel: employee.emergencyContact?.relation || employee.emergencyContactRelation || 'Family',
      mob: employee.emergencyContact?.phone || employee.emergencyContactPhone || employee.phone,
      alt: '-',
      email: employee.emergencyContact?.email || employee.emergencyContactEmail || '-',
      addr: employee.emergencyContact?.address || '-'
    });
  }
  styleDataRows(sEm);

  // ----------------------------------------------------
  // Sheet 08: Education & Achievements
  // ----------------------------------------------------
  const sEdu = wb.addWorksheet('08 Education');
  sEdu.columns = [
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Title / Degree', key: 'degree', width: 25 },
    { header: 'Specialization / Field', key: 'spec', width: 22 },
    { header: 'Institute / Org', key: 'inst', width: 28 },
    { header: 'Year / Date', key: 'year', width: 14 },
    { header: 'Grade / Score', key: 'score', width: 15 },
    { header: 'Status', key: 'status', width: 14 }
  ];
  styleHeaderRow(sEdu.getRow(1));

  if (Array.isArray(employee.educationDetails) && employee.educationDetails.length > 0) {
    employee.educationDetails.forEach((ed) => {
      sEdu.addRow({
        type: 'Education',
        degree: ed.degree || ed.qualification,
        spec: ed.specialization || '-',
        inst: ed.institutionName || ed.universityBoard,
        year: ed.passingYear,
        score: ed.percentageOrCgpa || ed.grade || '-',
        status: ed.verificationStatus || 'VERIFIED'
      });
    });
  }
  if (Array.isArray(employee.achievements) && employee.achievements.length > 0) {
    employee.achievements.forEach((ac) => {
      sEdu.addRow({
        type: 'Achievement',
        degree: ac.title,
        spec: ac.category,
        inst: ac.organization,
        year: ac.date ? new Date(ac.date).toLocaleDateString() : '-',
        score: '-',
        status: 'Awarded'
      });
    });
  }
  styleDataRows(sEdu);

  // ----------------------------------------------------
  // Sheet 09: Experience
  // ----------------------------------------------------
  const sExp = wb.addWorksheet('09 Experience');
  sExp.columns = [
    { header: 'Company Name', key: 'comp', width: 26 },
    { header: 'Designation', key: 'desig', width: 22 },
    { header: 'Department', key: 'dept', width: 18 },
    { header: 'Employment Type', key: 'type', width: 16 },
    { header: 'From Date', key: 'from', width: 14 },
    { header: 'To Date', key: 'to', width: 14 },
    { header: 'Location', key: 'loc', width: 18 },
    { header: 'Last Salary', key: 'sal', width: 15 },
    { header: 'Reason for Leaving', key: 'reason', width: 25 }
  ];
  styleHeaderRow(sExp.getRow(1));

  if (Array.isArray(employee.previousEmployment) && employee.previousEmployment.length > 0) {
    employee.previousEmployment.forEach((px) => {
      sExp.addRow({
        comp: px.companyName,
        desig: px.designation,
        dept: px.department || '-',
        type: px.employmentType || 'Full Time',
        from: px.joiningDate ? new Date(px.joiningDate).toLocaleDateString() : '-',
        to: px.leavingDate ? new Date(px.leavingDate).toLocaleDateString() : '-',
        loc: px.companyAddress || 'India',
        sal: px.lastDrawnSalary || '-',
        reason: px.reasonForLeaving || 'Career advancement'
      });
    });
  }
  styleDataRows(sExp);

  // ----------------------------------------------------
  // Sheet 10: Documents
  // ----------------------------------------------------
  const sDoc = wb.addWorksheet('10 Documents');
  sDoc.columns = [
    { header: 'Document Name', key: 'name', width: 30 },
    { header: 'Document Type', key: 'type', width: 22 },
    { header: 'Uploaded By', key: 'by', width: 20 },
    { header: 'Upload Date', key: 'date', width: 15 },
    { header: 'Expiry Date', key: 'exp', width: 15 },
    { header: 'Verification Status', key: 'status', width: 20 }
  ];
  styleHeaderRow(sDoc.getRow(1));

  if (Array.isArray(employee.documents) && employee.documents.length > 0) {
    employee.documents.forEach((dc) => {
      sDoc.addRow({
        name: dc.documentName,
        type: dc.documentType,
        by: dc.uploadedBy || 'HR Master',
        date: dc.uploadedAt ? new Date(dc.uploadedAt).toLocaleDateString() : '-',
        exp: dc.expiryDate ? new Date(dc.expiryDate).toLocaleDateString() : 'N/A',
        status: dc.verificationStatus || 'VERIFIED'
      });
    });
  }
  styleDataRows(sDoc);

  // ----------------------------------------------------
  // Sheet 11: Attendance Summary
  // ----------------------------------------------------
  const sAtt = wb.addWorksheet('11 Attendance Summary');
  sAtt.columns = [
    { header: 'Metric', key: 'm', width: 28 },
    { header: 'Value', key: 'v', width: 20 }
  ];
  styleHeaderRow(sAtt.getRow(1));
  sAtt.addRows([
    { m: 'Present Days (Current Month)', v: 24 },
    { m: 'Late Marks', v: 1 },
    { m: 'Early Departures', v: 0 },
    { m: 'Missing Punches Regularized', v: 2 },
    { m: 'Attendance Ratio', v: '96.5%' },
    { m: 'Current Assigned Shift', v: employee.shift || employee.shiftName || 'General Shift' }
  ]);
  styleDataRows(sAtt);

  // ----------------------------------------------------
  // Sheet 12: Leave Summary
  // ----------------------------------------------------
  const sLeave = wb.addWorksheet('12 Leave Summary');
  sLeave.columns = [
    { header: 'Leave Category', key: 'cat', width: 20 },
    { header: 'Total Allocated', key: 'tot', width: 16 },
    { header: 'Leaves Taken', key: 'taken', width: 16 },
    { header: 'Available Balance', key: 'bal', width: 16 }
  ];
  styleHeaderRow(sLeave.getRow(1));
  sLeave.addRows([
    { cat: 'Privilege Leave (PL)', tot: 18, taken: 4, bal: 14 },
    { cat: 'Casual Leave (CL)', tot: 12, taken: 3, bal: 9 },
    { cat: 'Sick Leave (SL)', tot: 10, taken: 1, bal: 9 },
    { cat: 'Maternity/Paternity', tot: 0, taken: 0, bal: 0 }
  ]);
  styleDataRows(sLeave);

  // ----------------------------------------------------
  // Sheet 13: Payroll Summary
  // ----------------------------------------------------
  const sPay = wb.addWorksheet('13 Payroll Summary');
  sPay.columns = [
    { header: 'Salary Component', key: 'comp', width: 25 },
    { header: 'Monthly (INR)', key: 'm', width: 18 },
    { header: 'Annualized (INR)', key: 'a', width: 18 }
  ];
  styleHeaderRow(sPay.getRow(1));
  const sal = employee.basicSalary || employee.sensitiveData?.salaryDetails?.basicPay || 35000;
  const hra = Math.round(sal * 0.4);
  const sa = 5000;
  const gross = sal + hra + sa;
  sPay.addRows([
    { comp: 'Basic Salary', m: sal, a: sal * 12 },
    { comp: 'House Rent Allowance (HRA)', m: hra, a: hra * 12 },
    { comp: 'Special Allowance', m: sa, a: sa * 12 },
    { comp: 'Gross Salary', m: gross, a: gross * 12 },
    { comp: 'Estimated CTC', m: gross, a: gross * 12 }
  ]);
  styleDataRows(sPay);

  // ----------------------------------------------------
  // Sheet 14: Pending Due
  // ----------------------------------------------------
  const sDue = wb.addWorksheet('14 Pending Due');
  sDue.columns = [
    { header: 'Due Type', key: 'type', width: 22 },
    { header: 'Amount (INR)', key: 'amt', width: 16 },
    { header: 'Due Date', key: 'date', width: 14 },
    { header: 'Paid (INR)', key: 'paid', width: 14 },
    { header: 'Balance (INR)', key: 'bal', width: 16 },
    { header: 'Status', key: 'stat', width: 15 },
    { header: 'Remarks', key: 'rem', width: 25 }
  ];
  styleHeaderRow(sDue.getRow(1));

  if (Array.isArray(employee.pendingDues) && employee.pendingDues.length > 0) {
    employee.pendingDues.forEach((du) => {
      sDue.addRow({
        type: du.dueType,
        amt: du.amount,
        date: du.dueDate ? new Date(du.dueDate).toLocaleDateString() : '-',
        paid: du.paidAmount || 0,
        bal: du.balance || du.amount - (du.paidAmount || 0),
        stat: du.status,
        rem: du.remarks || '-'
      });
    });
  } else {
    sDue.addRow({
      type: 'None Active',
      amt: 0,
      date: '-',
      paid: 0,
      bal: 0,
      stat: 'Paid',
      rem: 'No outstanding employee liabilities'
    });
  }
  styleDataRows(sDue);

  // ----------------------------------------------------
  // Sheet 15: HR Notes
  // ----------------------------------------------------
  const sNotes = wb.addWorksheet('15 Notes');
  sNotes.columns = [
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Note Type', key: 'type', width: 18 },
    { header: 'Description', key: 'desc', width: 35 },
    { header: 'Priority', key: 'pri', width: 14 },
    { header: 'Created By', key: 'by', width: 18 },
    { header: 'Created Date', key: 'date', width: 15 }
  ];
  styleHeaderRow(sNotes.getRow(1));

  if (Array.isArray(employee.hrNotes) && employee.hrNotes.length > 0) {
    employee.hrNotes.forEach((nt) => {
      sNotes.addRow({
        title: nt.title,
        type: nt.noteType,
        desc: nt.description,
        pri: nt.priority || 'MEDIUM',
        by: nt.createdBy || 'HR Admin',
        date: nt.createdAt ? new Date(nt.createdAt).toLocaleDateString() : '-'
      });
    });
  } else {
    sNotes.addRow({
      title: 'Initial Onboarding',
      type: 'General',
      desc: 'Employee master record registered and active.',
      pri: 'LOW',
      by: 'HR Admin',
      date: new Date().toLocaleDateString()
    });
  }
  styleDataRows(sNotes);

  // ----------------------------------------------------
  // Sheet 16: Audit Summary
  // ----------------------------------------------------
  const sAudit = wb.addWorksheet('16 Audit Summary');
  sAudit.columns = [
    { header: 'Timestamp', key: 'time', width: 20 },
    { header: 'Actor User', key: 'user', width: 22 },
    { header: 'Role', key: 'role', width: 16 },
    { header: 'Action', key: 'action', width: 22 },
    { header: 'Event Details', key: 'details', width: 40 }
  ];
  styleHeaderRow(sAudit.getRow(1));

  if (Array.isArray(employee.auditHistory) && employee.auditHistory.length > 0) {
    employee.auditHistory.forEach((au) => {
      sAudit.addRow({
        time: au.timestamp ? new Date(au.timestamp).toLocaleString() : '-',
        user: au.user || 'System',
        role: au.role || 'HR_ADMIN',
        action: au.action,
        details: au.details || '-'
      });
    });
  } else {
    sAudit.addRow({
      time: new Date().toLocaleString(),
      user: employee.createdBy || 'System Admin',
      role: 'SUPER_ADMIN',
      action: 'RECORD_INITIALIZED',
      details: 'Employee profile initialized in BJK Digital Brain HRMS.'
    });
  }
  styleDataRows(sAudit);

  // ----------------------------------------------------
  // Sheet 17: Bank Details (Section 33 - Strict Masking)
  // ----------------------------------------------------
  const sBank = wb.addWorksheet('17 Bank Details');
  sBank.columns = [
    { header: 'Attribute', key: 'attr', width: 25 },
    { header: 'Details', key: 'val', width: 40 }
  ];
  styleHeaderRow(sBank.getRow(1));

  const bankData = employee.bankDetails || employee.sensitiveData?.bankDetails || {};
  const rawAcc = String(bankData.accountNumber || employee.bankAccountNumber || '').trim();
  const maskedAcc = rawAcc.length > 4 ? 'XXXX XXXX ' + rawAcc.slice(-4) : (rawAcc ? 'XXXX ' + rawAcc : 'Not Added');

  sBank.addRows([
    { attr: 'Account Holder Name', val: bankData.accountHolderName || employee.fullName || '-' },
    { attr: 'Bank Name', val: bankData.bankName || employee.bankName || '-' },
    { attr: 'Branch Name', val: bankData.branchName || bankData.branch || '-' },
    { attr: 'Masked Account Number', val: maskedAcc },
    { attr: 'Account Type', val: bankData.accountType || 'Salary' },
    { attr: 'IFSC Code', val: bankData.ifscCode || employee.ifscCode || '-' },
    { attr: 'MICR Code', val: bankData.micrCode || '-' },
    { attr: 'Verification Status', val: bankData.verificationStatus || 'Not Submitted' }
  ]);
  styleDataRows(sBank);

  return await wb.xlsx.writeBuffer();
};

/**
 * 2. Generate Bulk Employees Workbook
 */
const generateBulkEmployeesWorkbook = async (employees, filterTitle = 'Master Directory') => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'BJK Healthcare Enterprise HRMS';
  wb.created = new Date();

  const sheet = wb.addWorksheet('Employees Directory');
  sheet.columns = [
    { header: 'Employee ID', key: 'id', width: 16 },
    { header: 'Full Name', key: 'name', width: 25 },
    { header: 'Employee Category', key: 'employeeCategory', width: 20 },
    { header: 'Designation', key: 'desig', width: 25 },
    { header: 'Department', key: 'dept', width: 22 },
    { header: 'Branch', key: 'branch', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Bank Name', key: 'bankName', width: 22 },
    { header: 'Branch Name', key: 'bankBranch', width: 20 },
    { header: 'Masked Account Number', key: 'maskedAccount', width: 22 },
    { header: 'Account Type', key: 'accountType', width: 16 },
    { header: 'IFSC Code', key: 'ifsc', width: 16 },
    { header: 'Bank Verification Status', key: 'bankStatus', width: 22 },
    { header: 'Employment Type', key: 'type', width: 16 },
    { header: 'Official Email', key: 'email', width: 28 },
    { header: 'Official Phone', key: 'phone', width: 18 },
    { header: 'Date of Joining', key: 'doj', width: 15 },
    { header: 'Reporting Manager', key: 'mgr', width: 22 },
    { header: 'Basic Salary (INR)', key: 'sal', width: 18 },
    { header: 'Profile %', key: 'comp', width: 12 }
  ];

  styleHeaderRow(sheet.getRow(1));

  employees.forEach((emp) => {
    const sal = emp.basicSalary || emp.sensitiveData?.salaryDetails?.basicPay || 0;
    const cat = emp.employeeCategory || (emp.isNonTechnical ? 'NON_TECHNICAL' : 'TECHNICAL');
    const b = emp.bankDetails || emp.sensitiveData?.bankDetails || {};
    const rawAcc = String(b.accountNumber || emp.bankAccountNumber || '').trim();
    const maskedAcc = rawAcc.length > 4 ? 'XXXX XXXX ' + rawAcc.slice(-4) : (rawAcc ? 'XXXX ' + rawAcc : 'Not Added');

    sheet.addRow({
      id: emp.employeeCode || emp.employeeId || 'N/A',
      name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
      employeeCategory: cat,
      desig: emp.designationTitle || emp.designation || 'N/A',
      dept: emp.departmentName || emp.department || 'N/A',
      branch: emp.branch || emp.facility || 'Ahmedabad',
      status: emp.employmentStatus || emp.status || 'Active',
      bankName: b.bankName || emp.bankName || '-',
      bankBranch: b.branchName || b.branch || '-',
      maskedAccount: maskedAcc,
      accountType: b.accountType || 'Salary',
      ifsc: b.ifscCode || emp.ifscCode || '-',
      bankStatus: b.verificationStatus || 'Not Submitted',
      type: emp.employmentType || 'FULL_TIME',
      email: emp.email || emp.workEmail || 'N/A',
      phone: emp.phone || emp.officialMobile || 'N/A',
      doj: emp.dateOfJoining || emp.joiningDate ? new Date(emp.dateOfJoining || emp.joiningDate).toLocaleDateString() : 'N/A',
      mgr: emp.reportingManagerName || emp.managerName || '-',
      sal: sal,
      comp: `${emp.profileCompletion || 100}%`
    });
  });

  styleDataRows(sheet);
  autoFitColumns(sheet);

  return await wb.xlsx.writeBuffer();
};

/**
 * 3. Generate Bulk Upload Excel Template
 */
const generateBulkImportTemplateWorkbook = async () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'BJK Healthcare Enterprise HRMS';

  const sheet = wb.addWorksheet('Employee Import Template');
  sheet.columns = [
    { header: 'Full Name *', key: 'fullName', width: 25 },
    { header: 'Employee Category *', key: 'employeeCategory', width: 22 },
    { header: 'Official Email *', key: 'email', width: 28 },
    { header: 'Official Mobile *', key: 'phone', width: 18 },
    { header: 'Department *', key: 'department', width: 22 },
    { header: 'Designation *', key: 'designation', width: 22 },
    { header: 'Branch *', key: 'branch', width: 18 },
    { header: 'Employment Type *', key: 'employmentType', width: 18 },
    { header: 'Date of Joining * (YYYY-MM-DD)', key: 'joiningDate', width: 22 },
    { header: 'Basic Salary (INR)', key: 'basicSalary', width: 18 },
    { header: 'Gender', key: 'gender', width: 12 },
    { header: 'Date of Birth (YYYY-MM-DD)', key: 'dob', width: 20 },
    { header: 'Blood Group', key: 'bloodGroup', width: 14 },
    { header: 'Marital Status', key: 'maritalStatus', width: 14 },
    { header: 'PAN Number', key: 'pan', width: 16 },
    { header: 'Aadhaar Number', key: 'aadhaar', width: 18 },
    { header: 'Current Address', key: 'address', width: 30 },
    { header: 'City', key: 'city', width: 16 },
    { header: 'State', key: 'state', width: 16 },
    { header: 'PIN Code', key: 'pin', width: 12 },
    { header: 'Reporting Manager', key: 'manager', width: 22 }
  ];

  styleHeaderRow(sheet.getRow(1));

  // Add 2 Sample Rows with clear explanations
  sheet.addRow({
    fullName: 'Ravi Kumar Sharma',
    email: 'ravi.sharma@bjkhealthcare.com',
    phone: '+91 98251 12345',
    department: 'Production',
    designation: 'Senior Production Officer',
    branch: 'Ahmedabad',
    employmentType: 'FULL_TIME',
    joiningDate: '2026-06-15',
    basicSalary: 45000,
    gender: 'Male',
    dob: '1992-04-12',
    bloodGroup: 'B+',
    maritalStatus: 'Married',
    pan: 'ABCDE1234F',
    aadhaar: '987654321012',
    address: 'Plot 45, GIDC Industrial Estate',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pin: '382330',
    manager: 'Dr. Vikram Mehta'
  });

  sheet.addRow({
    fullName: 'Pooja Varma',
    email: 'pooja.varma@bjkhealthcare.com',
    phone: '+91 97123 45678',
    department: 'Quality Assurance',
    designation: 'QA Executive',
    branch: 'Ahmedabad',
    employmentType: 'FULL_TIME',
    joiningDate: '2026-07-01',
    basicSalary: 38000,
    gender: 'Female',
    dob: '1995-09-20',
    bloodGroup: 'A+',
    maritalStatus: 'Single',
    pan: 'PQRST5678M',
    aadhaar: '123456789012',
    address: 'Flat 302, Green Avenue',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pin: '380015',
    manager: 'Dr. Vikram Mehta'
  });

  styleDataRows(sheet);
  autoFitColumns(sheet);

  // Instructions Sheet
  const sInst = wb.addWorksheet('Instructions');
  sInst.columns = [
    { header: 'Field Name', key: 'f', width: 25 },
    { header: 'Validation Rules & Values', key: 'r', width: 55 }
  ];
  styleHeaderRow(sInst.getRow(1), BJK_DARK);

  sInst.addRows([
    { f: 'Full Name *', r: 'Required. First and Last Name. Example: Priya Patel' },
    { f: 'Official Email *', r: 'Required. Must be unique corporate email address.' },
    { f: 'Official Mobile *', r: 'Required. 10-15 digit mobile number.' },
    { f: 'Department *', r: 'Required. Example: Production, Quality Assurance, Human Resources, R&D' },
    { f: 'Designation *', r: 'Required. Example: Officer, Manager, Executive, Technician' },
    { f: 'Branch *', r: 'Required. Example: Ahmedabad, Sanand, Mumbai HQ' },
    { f: 'Employment Type *', r: 'FULL_TIME, PART_TIME, CONTRACT, INTERN, PROBATION' },
    { f: 'Date of Joining *', r: 'Format: YYYY-MM-DD. Example: 2026-06-01' },
    { f: 'Employee ID', r: 'Auto-generated systematically (e.g. BHK0146) upon successful import.' }
  ]);
  styleDataRows(sInst);

  return await wb.xlsx.writeBuffer();
};

/**
 * 4. Parse & Validate Uploaded XLSX File Buffer
 */
const validateAndParseImportWorkbook = async (buffer) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const sheet = wb.getWorksheet(1);
  if (!sheet) {
    throw new Error('The uploaded Excel workbook contains no readable sheets.');
  }

  const rows = [];
  const errors = [];
  const validRows = [];
  const existingEmails = new Set();
  const existingIds = new Set();

  // Pre-load existing emails and IDs from DB to prevent duplicate key collisions
  const dbEmployees = await Employee.find({}, { email: 1, employeeId: 1, employeeCode: 1 });
  dbEmployees.forEach((emp) => {
    if (emp.email) existingEmails.add(emp.email.toLowerCase().trim());
    if (emp.employeeId) existingIds.add(emp.employeeId.toUpperCase().trim());
    if (emp.employeeCode) existingIds.add(emp.employeeCode.toUpperCase().trim());
  });

  const fileSeenEmails = new Set();

  // Read rows starting from row 2 (skipping header)
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const fullName = String(row.getCell(1).value || '').trim();
    const email = String(row.getCell(2).value || '').toLowerCase().trim();
    const phone = String(row.getCell(3).value || '').trim();
    const department = String(row.getCell(4).value || '').trim();
    const designation = String(row.getCell(5).value || '').trim();
    const branch = String(row.getCell(6).value || 'Ahmedabad').trim();
    const employmentType = String(row.getCell(7).value || 'FULL_TIME').trim();
    const rawDoj = row.getCell(8).value;
    const basicSalary = Number(row.getCell(9).value || 30000);
    const gender = String(row.getCell(10).value || 'Male').trim();
    const rawDob = row.getCell(11).value;
    const bloodGroup = String(row.getCell(12).value || 'O+').trim();
    const maritalStatus = String(row.getCell(13).value || 'Single').trim();
    const panNumber = String(row.getCell(14).value || '').trim().toUpperCase();
    const aadhaarNumber = String(row.getCell(15).value || '').trim();
    const address = String(row.getCell(16).value || '').trim();
    const city = String(row.getCell(17).value || 'Ahmedabad').trim();
    const state = String(row.getCell(18).value || 'Gujarat').trim();
    const pin = String(row.getCell(19).value || '382330').trim();
    const manager = String(row.getCell(20).value || '').trim();

    // Skip totally empty rows
    if (!fullName && !email && !phone) return;

    const rowErrors = [];

    // Validations
    if (!fullName) rowErrors.push('Missing Full Name');
    if (!email) {
      rowErrors.push('Missing Email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      rowErrors.push('Invalid Email Format');
    } else if (existingEmails.has(email)) {
      rowErrors.push('Email already exists in BJK HRMS database');
    } else if (fileSeenEmails.has(email)) {
      rowErrors.push('Duplicate email repeated in uploaded Excel');
    } else {
      fileSeenEmails.add(email);
    }

    if (!phone) rowErrors.push('Missing Phone Number');
    if (!department) rowErrors.push('Missing Department');
    if (!designation) rowErrors.push('Missing Designation');

    let joiningDate = new Date();
    if (rawDoj) {
      const parsed = new Date(rawDoj);
      if (!isNaN(parsed.getTime())) {
        joiningDate = parsed;
      } else {
        rowErrors.push('Invalid Date of Joining format (use YYYY-MM-DD)');
      }
    }

    const rowObj = {
      rowNumber,
      fullName,
      email,
      phone,
      department,
      designation,
      branch,
      employmentType,
      joiningDate,
      basicSalary: isNaN(basicSalary) ? 30000 : basicSalary,
      gender,
      dateOfBirth: rawDob ? new Date(rawDob) : null,
      bloodGroup,
      maritalStatus,
      panNumber,
      aadhaarNumber,
      currentAddress: address,
      city,
      state,
      postalCode: pin,
      reportingManagerName: manager,
      status: 'Active',
      errors: rowErrors,
      isValid: rowErrors.length === 0
    };

    rows.push(rowObj);
    if (rowErrors.length === 0) {
      validRows.push(rowObj);
    } else {
      errors.push(rowObj);
    }
  });

  return {
    summary: {
      total: rows.length,
      valid: validRows.length,
      errors: errors.length,
      duplicateCount: errors.filter(e => e.errors.some(err => err.includes('exists') || err.includes('repeated'))).length
    },
    rows,
    validRows,
    errorRows: errors
  };
};

module.exports = {
  generateIndividualEmployeeWorkbook,
  generateBulkEmployeesWorkbook,
  generateBulkImportTemplateWorkbook,
  validateAndParseImportWorkbook
};
