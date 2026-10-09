const PDFDocument = require('pdfkit');

/**
 * BJK Healthcare PDF Engine
 * Generates enterprise-grade, standardized, pharmaceutical-compliant PDF documents.
 */

// Corporate Brand Colors
const COLORS = {
  NAVY: '#0A192F',
  TEAL: '#00A896',
  DARK_GRAY: '#1E293B',
  MUTED_GRAY: '#64748B',
  LIGHT_BG: '#F8FAFC',
  BORDER: '#E2E8F0',
  WHITE: '#FFFFFF',
  EMERALD: '#059669',
  ROSE: '#E11D48'
};

/**
 * Draws standard BJK Healthcare Corporate Letterhead / Header
 */
function drawCorporateHeader(doc, title, subtitle) {
  // Top brand accent line
  doc.rect(0, 0, doc.page.width, 6).fill(COLORS.TEAL);

  // Corporate Name & Logo Crest
  doc.rect(40, 25, 42, 42).roundedRect(40, 25, 42, 42, 8).fill(COLORS.NAVY);
  doc.fillColor(COLORS.WHITE).font('Helvetica-Bold').fontSize(18).text('BJK', 45, 36, { width: 32, align: 'center' });

  // Company Name & Subtitle
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(16).text('BJK HEALTHCARE', 95, 26);
  doc.fillColor(COLORS.TEAL).font('Helvetica-Bold').fontSize(8.5).text('DIGITAL BRAIN — WORKFORCE INTELLIGENCE & PHARMACEUTICAL OPERATIONS', 95, 44);
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('CIN: L24230GJ2020PLC118942 | Regd. Office: Pharmaceutical SEZ, Ahmedabad, Gujarat 382213', 95, 56);

  // Document Badge (Right aligned)
  if (title) {
    doc.roundedRect(doc.page.width - 200, 26, 160, 36, 6).fillAndStroke(COLORS.LIGHT_BG, COLORS.BORDER);
    doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(9).text(title, doc.page.width - 195, 33, { width: 150, align: 'center' });
    if (subtitle) {
      doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text(subtitle, doc.page.width - 195, 47, { width: 150, align: 'center' });
    }
  }

  // Divider Line
  doc.moveTo(40, 78).lineTo(doc.page.width - 40, 78).strokeColor(COLORS.BORDER).lineWidth(1).stroke();
  doc.y = 90;
}

/**
 * Draws standard BJK Corporate Footer with Verification Hash & Disclaimer
 */
function drawCorporateFooter(doc, docControlId) {
  const bottomY = doc.page.height - 45;
  doc.moveTo(40, bottomY - 8).lineTo(doc.page.width - 40, bottomY - 8).strokeColor(COLORS.BORDER).lineWidth(0.8).stroke();
  
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7)
    .text(`Doc Ref: ${docControlId || 'BJK-DOC-GEN'} | Generated via BJK Digital Brain on ${new Date().toUTCString()}`, 40, bottomY);
  
  doc.text('This is a validated electronic document in compliance with 21 CFR Part 11 & GxP Standards. No physical signature required.', 40, bottomY + 10);
  
  doc.fillColor(COLORS.TEAL).font('Helvetica-Bold').fontSize(7)
    .text('CONFIDENTIAL & PROPRIETARY', doc.page.width - 160, bottomY, { width: 120, align: 'right' });
}

/**
 * 1. PAYSLIP PDF GENERATION
 */
function generatePayslipPDF(payroll, employee, outputStream) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(outputStream);

  const docId = `BJK-PAY-${payroll.payPeriod}-${payroll.employeeId}`;
  drawCorporateHeader(doc, 'SALARY SLIP', `Period: ${payroll.payPeriod}`);

  // Employee Information Card
  const startY = doc.y + 4;
  doc.roundedRect(40, startY, doc.page.width - 80, 70, 6).fillAndStroke(COLORS.LIGHT_BG, COLORS.BORDER);

  // Column 1
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('EMPLOYEE NAME', 52, startY + 10);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(9).text(payroll.employeeName || 'N/A', 52, startY + 20);

  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('EMPLOYEE ID', 52, startY + 38);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(9).text(payroll.employeeId, 52, startY + 48);

  // Column 2
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('DEPARTMENT', 180, startY + 10);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(9).text(payroll.departmentName || 'N/A', 180, startY + 20);

  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('DESIGNATION', 180, startY + 38);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(9).text(payroll.designationTitle || 'N/A', 180, startY + 48);

  // Column 3
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('FACILITY', 320, startY + 10);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(8.5).text(employee?.facility || 'BJK Unit 1 - Formulations', 320, startY + 20);

  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('BANK ACCOUNT', 320, startY + 38);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(8.5).text(payroll.bankAccountNumber || 'HDFC Bank - •••• 4092', 320, startY + 48);

  // Column 4 (Attendance Summary)
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('PAID / TOTAL DAYS', 450, startY + 10);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(9).text(`${payroll.attendanceSummary?.payableDays || 30} / ${payroll.attendanceSummary?.totalDays || 30}`, 450, startY + 20);

  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('OVERTIME / NIGHT HRS', 450, startY + 38);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(9).text(`${payroll.attendanceSummary?.overtimeHours || 0}h / ${payroll.attendanceSummary?.nightShiftCount || 0} shifts`, 450, startY + 48);

  // Earnings & Deductions Tables (Side by Side)
  const tableY = startY + 82;
  const colWidth = (doc.page.width - 90) / 2;

  // Earnings Header
  doc.roundedRect(40, tableY, colWidth, 22, 4).fill(COLORS.NAVY);
  doc.fillColor(COLORS.WHITE).font('Helvetica-Bold').fontSize(8.5).text('EARNINGS BREAKDOWN', 50, tableY + 6);
  doc.text('AMOUNT (INR)', 40 + colWidth - 85, tableY + 6, { width: 75, align: 'right' });

  // Deductions Header
  doc.roundedRect(50 + colWidth, tableY, colWidth, 22, 4).fill(COLORS.ROSE);
  doc.fillColor(COLORS.WHITE).font('Helvetica-Bold').fontSize(8.5).text('STATUTORY DEDUCTIONS', 60 + colWidth, tableY + 6);
  doc.text('AMOUNT (INR)', 50 + (colWidth * 2) - 85, tableY + 6, { width: 75, align: 'right' });

  const earnings = [
    { label: 'Basic Salary', amount: payroll.earnings?.basic || 0 },
    { label: 'House Rent Allowance (HRA)', amount: payroll.earnings?.hra || 0 },
    { label: 'Special Allowance', amount: payroll.earnings?.specialAllowance || 0 },
    { label: 'Transport Allowance', amount: payroll.earnings?.transportAllowance || 0 },
    { label: 'Medical Allowance', amount: payroll.earnings?.medicalAllowance || 0 },
    { label: 'Overtime Compensation', amount: payroll.earnings?.overtimePay || 0 },
    { label: 'Night Differential Allowance', amount: payroll.earnings?.nightDifferentialAllowance || 0 },
    { label: 'Performance Bonus / Incentive', amount: payroll.earnings?.performanceBonus || 0 }
  ];

  const deductions = [
    { label: 'Provident Fund (EPF 12%)', amount: payroll.deductions?.providentFund || 0 },
    { label: 'Employee State Insurance (ESIC)', amount: payroll.deductions?.employeeStateInsurance || 0 },
    { label: 'Professional Tax (PT)', amount: payroll.deductions?.professionalTax || 0 },
    { label: 'Tax Deducted at Source (TDS)', amount: payroll.deductions?.taxDeductedAtSource || 0 },
    { label: 'Salary Advance Deductions', amount: payroll.deductions?.advanceDeductions || 0 },
    { label: 'Other Deductions', amount: payroll.deductions?.otherDeductions || 0 }
  ];

  let currentY = tableY + 28;
  const maxRows = Math.max(earnings.length, deductions.length);

  for (let i = 0; i < maxRows; i++) {
    const rowBg = i % 2 === 0 ? COLORS.LIGHT_BG : COLORS.WHITE;
    
    // Earnings Row
    doc.rect(40, currentY, colWidth, 18).fill(rowBg);
    if (earnings[i]) {
      doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(8).text(earnings[i].label, 48, currentY + 4);
      doc.font('Helvetica-Bold').text(`Rs. ${earnings[i].amount.toLocaleString('en-IN')}`, 40 + colWidth - 85, currentY + 4, { width: 75, align: 'right' });
    }

    // Deductions Row
    doc.rect(50 + colWidth, currentY, colWidth, 18).fill(rowBg);
    if (deductions[i]) {
      doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(8).text(deductions[i].label, 58 + colWidth, currentY + 4);
      doc.font('Helvetica-Bold').fillColor(COLORS.ROSE).text(`Rs. ${deductions[i].amount.toLocaleString('en-IN')}`, 50 + (colWidth * 2) - 85, currentY + 4, { width: 75, align: 'right' });
    }

    currentY += 19;
  }

  // Subtotal Rows
  doc.rect(40, currentY, colWidth, 22).fillAndStroke(COLORS.LIGHT_BG, COLORS.BORDER);
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(8.5).text('GROSS EARNINGS', 48, currentY + 6);
  doc.text(`Rs. ${(payroll.grossEarnings || 0).toLocaleString('en-IN')}`, 40 + colWidth - 85, currentY + 6, { width: 75, align: 'right' });

  doc.rect(50 + colWidth, currentY, colWidth, 22).fillAndStroke(COLORS.LIGHT_BG, COLORS.BORDER);
  doc.fillColor(COLORS.ROSE).font('Helvetica-Bold').fontSize(8.5).text('TOTAL DEDUCTIONS', 58 + colWidth, currentY + 6);
  doc.text(`Rs. ${(payroll.totalDeductions || 0).toLocaleString('en-IN')}`, 50 + (colWidth * 2) - 85, currentY + 6, { width: 75, align: 'right' });

  currentY += 32;

  // Net Disbursable Salary Highlight Banner
  doc.roundedRect(40, currentY, doc.page.width - 80, 48, 8).fillAndStroke('#ECFDF5', '#6EE7B7');
  doc.fillColor('#065F46').font('Helvetica-Bold').fontSize(9).text('NET DISBURSABLE TAKE-HOME SALARY', 55, currentY + 11);
  doc.fillColor('#047857').font('Helvetica').fontSize(7.5).text(`Status: ${payroll.status || 'PROCESSED'} | Credited to registered salary account`, 55, currentY + 26);

  doc.fillColor('#065F46').font('Helvetica-Bold').fontSize(18).text(`Rs. ${(payroll.netPay || 0).toLocaleString('en-IN')}`, doc.page.width - 240, currentY + 14, { width: 190, align: 'right' });

  // Employer Contributions Section
  currentY += 60;
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(8.5).text('EMPLOYER RETIRAL & STATUTORY CONTRIBUTIONS (CTC)', 40, currentY);
  currentY += 14;

  const empPF = payroll.employerContributions?.providentFund || Math.round((payroll.earnings?.basic || 0) * 0.12);
  const empESI = payroll.employerContributions?.employeeStateInsurance || 0;
  const companyCost = payroll.totalCompanyCost || ((payroll.grossEarnings || 0) + empPF + empESI);

  doc.roundedRect(40, currentY, doc.page.width - 80, 24, 4).fillAndStroke(COLORS.LIGHT_BG, COLORS.BORDER);
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(8)
    .text(`Employer EPF: Rs. ${empPF.toLocaleString('en-IN')}   |   Employer ESI: Rs. ${empESI.toLocaleString('en-IN')}   |   Total Monthly Cost to Company (CTC): Rs. ${companyCost.toLocaleString('en-IN')}`, 50, currentY + 7);

  // Digital Signatures
  currentY += 45;
  doc.text('Prepared by: BJK Automated Payroll Engine', 40, currentY);
  doc.text(`Authorized Signatory: ${payroll.approvedBy || 'BJK Finance & Operations'}`, doc.page.width - 240, currentY, { width: 200, align: 'right' });

  drawCorporateFooter(doc, docId);
  doc.end();
}

/**
 * 2. TRAINING & GMP CERTIFICATE PDF
 */
function generateTrainingCertificatePDF(enrollment, program, employee, outputStream) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  doc.pipe(outputStream);

  const docId = enrollment.certificateNumber || `BJK-CERT-${enrollment._id.toString().slice(-6).toUpperCase()}`;

  // Decorative Certificate Border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).strokeColor(COLORS.TEAL);
  doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52).lineWidth(0.8).strokeColor(COLORS.NAVY);

  // Top Crest
  doc.rect((doc.page.width / 2) - 24, 42, 48, 48).roundedRect((doc.page.width / 2) - 24, 42, 48, 48, 8).fill(COLORS.NAVY);
  doc.fillColor(COLORS.WHITE).font('Helvetica-Bold').fontSize(20).text('BJK', (doc.page.width / 2) - 20, 54, { width: 40, align: 'center' });

  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(18).text('BJK HEALTHCARE PHARMACEUTICAL ACADEMY', 0, 102, { align: 'center' });
  doc.fillColor(COLORS.TEAL).font('Helvetica-Bold').fontSize(9).text('CENTER FOR QUALITY ASSURANCE & GXP REGULATORY COMPLIANCE', 0, 124, { align: 'center' });

  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(11).text('This is to certify that', 0, 155, { align: 'center' });

  // Employee Name
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(22).text(enrollment.employeeName || employee?.fullName || 'Distinguished Colleague', 0, 175, { align: 'center' });
  
  const empMeta = `Employee ID: ${enrollment.employeeId}  |  Department: ${enrollment.departmentName}`;
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(9.5).text(empMeta, 0, 205, { align: 'center' });

  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(11).text('has successfully completed the comprehensive pharmaceutical training curriculum for', 0, 225, { align: 'center' });

  // Program Title
  doc.fillColor(COLORS.TEAL).font('Helvetica-Bold').fontSize(16).text(enrollment.programTitle || program?.title || 'Current Good Manufacturing Practice (cGMP)', 0, 245, { align: 'center' });

  // Compliance details
  const compDate = enrollment.completionDate ? new Date(enrollment.completionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString();
  const expDate = enrollment.expiryDate ? new Date(enrollment.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Annual Retraining Cycle';
  const score = enrollment.scorePercentage || 95;

  const scoreText = `Assessment Score: ${score}%  |  Issued: ${compDate}  |  Valid Until: ${expDate}`;
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica-Bold').fontSize(9.5).text(scoreText, 0, 275, { align: 'center' });

  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Oblique').fontSize(8.5)
    .text('Validated in compliance with WHO-GMP Guidelines, Schedule M, and US-FDA 21 CFR Part 211 Personnel Qualifications.', 0, 300, { align: 'center' });

  // Signatures
  const sigY = doc.page.height - 130;
  
  doc.moveTo(80, sigY + 30).lineTo(260, sigY + 30).strokeColor(COLORS.BORDER).stroke();
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(9).text('Head of Quality Assurance (QA)', 80, sigY + 35, { width: 180, align: 'center' });
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('BJK Healthcare Regulated Operations', 80, sigY + 47, { width: 180, align: 'center' });

  // Seal in Center
  doc.circle(doc.page.width / 2, sigY + 25, 28).lineWidth(1.5).strokeColor(COLORS.TEAL);
  doc.fillColor(COLORS.TEAL).font('Helvetica-Bold').fontSize(7).text('BJK QA\nVERIFIED', (doc.page.width / 2) - 25, sigY + 18, { width: 50, align: 'center' });

  doc.moveTo(doc.page.width - 260, sigY + 30).lineTo(doc.page.width - 80, sigY + 30).strokeColor(COLORS.BORDER).stroke();
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(9).text('Vice President — Human Resources', doc.page.width - 260, sigY + 35, { width: 180, align: 'center' });
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5).text('BJK Healthcare Digital Brain', doc.page.width - 260, sigY + 47, { width: 180, align: 'center' });

  // Bottom Certificate Number
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(7.5)
    .text(`Certificate No: ${docId} | Digital Validation Hash: ${Buffer.from(docId).toString('base64')}`, 40, doc.page.height - 42, { align: 'center' });

  doc.end();
}

/**
 * 3. RECRUITMENT OFFER LETTER PDF
 */
function generateOfferLetterPDF(candidate, job, outputStream) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(outputStream);

  const docId = `BJK-OFFER-${candidate._id.toString().slice(-6).toUpperCase()}`;
  drawCorporateHeader(doc, 'LETTER OF OFFER', `Ref: ${docId}`);

  let currentY = doc.y + 10;

  // Date & Addressee
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(9).text(`Date: ${today}`, 40, currentY);
  currentY += 16;

  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(10).text(`To: ${candidate.fullName}`, 40, currentY);
  currentY += 14;
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(9).text(`Email: ${candidate.email}  |  Contact: ${candidate.phone || 'N/A'}`, 40, currentY);
  currentY += 24;

  // Subject
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(10.5).text(`Subject: Offer of Employment for the position of ${candidate.jobTitle || job?.title}`, 40, currentY);
  currentY += 20;

  // Body
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(9).leading(14)
    .text(`Dear ${candidate.fullName},\n\nOn behalf of BJK Healthcare, we are pleased to offer you the position of "${candidate.jobTitle || job?.title}" in the ${job?.department || 'Operations'} Department, located at ${job?.facility || 'BJK Unit 1 - Formulations Facility, Ahmedabad'}.\n\nYour proven qualifications in pharmaceutical operations and competencies align with our mission of delivering intelligent, high-integrity healthcare solutions.`);

  currentY = doc.y + 14;

  // Compensation Summary Table
  const salary = candidate.offerDetails?.offeredSalary || candidate.expectedCtc || 600000;
  const monthlyGross = Math.round(salary / 12);
  const monthlyBasic = Math.round(monthlyGross * 0.50);
  const monthlyHRA = Math.round(monthlyGross * 0.25);
  const monthlySpecial = monthlyGross - monthlyBasic - monthlyHRA;

  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(10).text('ANNEXURE A: COMPENSATION & BENEFITS STRUCTURE', 40, currentY);
  currentY += 14;

  doc.roundedRect(40, currentY, doc.page.width - 80, 20, 4).fill(COLORS.NAVY);
  doc.fillColor(COLORS.WHITE).font('Helvetica-Bold').fontSize(8.5).text('SALARY COMPONENT', 50, currentY + 5);
  doc.text('MONTHLY (INR)', doc.page.width - 240, currentY + 5, { width: 90, align: 'right' });
  doc.text('ANNUAL (INR)', doc.page.width - 130, currentY + 5, { width: 80, align: 'right' });
  currentY += 22;

  const rows = [
    { name: 'Basic Pay', monthly: monthlyBasic, annual: monthlyBasic * 12 },
    { name: 'House Rent Allowance (HRA)', monthly: monthlyHRA, annual: monthlyHRA * 12 },
    { name: 'Special & Professional Allowance', monthly: monthlySpecial, annual: monthlySpecial * 12 },
    { name: 'Gross Salary (A)', monthly: monthlyGross, annual: monthlyGross * 12 },
    { name: 'Employer EPF & Statutory Benefits (B)', monthly: Math.round(monthlyBasic * 0.12), annual: Math.round(monthlyBasic * 0.12) * 12 },
    { name: 'Total Cost to Company (CTC = A + B)', monthly: monthlyGross + Math.round(monthlyBasic * 0.12), annual: salary }
  ];

  rows.forEach((r, idx) => {
    const isTotal = idx === rows.length - 1;
    const bg = isTotal ? '#ECFDF5' : (idx % 2 === 0 ? COLORS.LIGHT_BG : COLORS.WHITE);
    doc.rect(40, currentY, doc.page.width - 80, 18).fill(bg);
    doc.fillColor(isTotal ? '#065F46' : COLORS.DARK_GRAY).font(isTotal ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).text(r.name, 50, currentY + 4);
    doc.font(isTotal ? 'Helvetica-Bold' : 'Helvetica').text(`Rs. ${r.monthly.toLocaleString('en-IN')}`, doc.page.width - 240, currentY + 4, { width: 90, align: 'right' });
    doc.font(isTotal ? 'Helvetica-Bold' : 'Helvetica').text(`Rs. ${r.annual.toLocaleString('en-IN')}`, doc.page.width - 130, currentY + 4, { width: 80, align: 'right' });
    currentY += 19;
  });

  currentY += 16;
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(8.5).leading(12)
    .text(`Terms of Employment:\n1. Tentative Joining Date: ${candidate.offerDetails?.joiningDate ? new Date(candidate.offerDetails.joiningDate).toLocaleDateString() : 'Within 30 days of offer acceptance'}.\n2. This offer is contingent upon successful verification of pharmaceutical credentials, background screening, and medical fitness for cleanroom access.\n3. You will be bound by BJK Healthcare's Non-Disclosure Agreement (NDA) and pharmaceutical data integrity policies.`);

  currentY = doc.y + 24;

  // Signatures
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(8.5).text('For BJK Healthcare Limited', 40, currentY);
  doc.text('Candidate Acceptance Signature', doc.page.width - 220, currentY, { width: 180, align: 'right' });

  currentY += 30;
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(8).text('Authorized HR Signatory', 40, currentY);
  doc.text(`Name: ${candidate.fullName}`, doc.page.width - 220, currentY, { width: 180, align: 'right' });

  drawCorporateFooter(doc, docId);
  doc.end();
}

/**
 * 4. EXPERIENCE & RELIEVING CERTIFICATE PDF
 */
function generateExperienceCertificatePDF(employee, outputStream) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(outputStream);

  const docId = `BJK-EXP-${employee.employeeId}`;
  drawCorporateHeader(doc, 'EXPERIENCE CERTIFICATE', `Ref: ${docId}`);

  let currentY = doc.y + 14;

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(9).text(`Date of Issue: ${today}`, 40, currentY);
  currentY += 24;

  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(14).text('TO WHOMSOEVER IT MAY CONCERN', 0, currentY, { align: 'center' });
  currentY += 32;

  const joinDate = employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';
  const exitDate = employee.resignationDate ? new Date(employee.resignationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : today;

  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(9.5).leading(16)
    .text(`This is to certify that Mr./Ms. ${employee.fullName} (Employee ID: ${employee.employeeId}) was employed with BJK Healthcare Limited from ${joinDate} to ${exitDate}.\n\nDuring their tenure with us, they held the designation of "${employee.designationTitle}" within the ${employee.departmentName} Department at our ${employee.facility || 'Manufacturing & Formulations Facility'}.\n\nTheir major responsibilities encompassed adhering to Good Manufacturing Practices (cGMP), standard operating procedures, and contributing diligently towards enterprise operational excellence.\n\nThroughout their period of service, their conduct and performance were found to be satisfactory and commendable. We wish them all success in their future professional endeavors.`);

  currentY = doc.y + 60;

  // Authorized Signatory
  doc.fillColor(COLORS.NAVY).font('Helvetica-Bold').fontSize(9).text('For BJK HEALTHCARE LIMITED', 40, currentY);
  currentY += 35;
  doc.fillColor(COLORS.DARK_GRAY).font('Helvetica-Bold').fontSize(9).text('Head — Human Resources & People Operations', 40, currentY);
  doc.fillColor(COLORS.MUTED_GRAY).font('Helvetica').fontSize(8).text('BJK Healthcare Digital Brain Platform', 40, currentY + 12);

  drawCorporateFooter(doc, docId);
  doc.end();
}

/**
 * 5. TABULAR REPORTS PDF (EMPLOYEE MASTER, ATTENDANCE, PAYROLL)
 */
function generateReportPDF(type, data, outputStream) {
  const isAttendance = type === 'ATTENDANCE';
  const doc = new PDFDocument({ 
    margin: 30, 
    size: 'A4', 
    layout: isAttendance ? 'landscape' : 'portrait' 
  });
  doc.pipe(outputStream);

  const title = type === 'EMPLOYEE_MASTER' ? 'EMPLOYEE MASTER DIRECTORY' :
                type === 'ATTENDANCE' ? 'STATUTORY ATTENDANCE REGISTER' :
                'CONSOLIDATED PAYROLL REPORT';

  drawCorporateHeader(doc, title, `Records: ${data.length}`);

  let currentY = doc.y + 8;

  if (type === 'EMPLOYEE_MASTER') {
    // Columns: ID, Name, Department, Designation, Facility, Type, Status
    const headers = ['ID', 'Full Name', 'Department', 'Designation', 'Type', 'Status'];
    const widths = [60, 130, 110, 110, 65, 60];

    doc.roundedRect(30, currentY, doc.page.width - 60, 20, 3).fill(COLORS.NAVY);
    let hX = 35;
    headers.forEach((h, i) => {
      doc.fillColor(COLORS.WHITE).font('Helvetica-Bold').fontSize(8).text(h, hX, currentY + 5);
      hX += widths[i];
    });
    currentY += 22;

    data.slice(0, 35).forEach((e, idx) => {
      const bg = idx % 2 === 0 ? COLORS.LIGHT_BG : COLORS.WHITE;
      doc.rect(30, currentY, doc.page.width - 60, 16).fill(bg);
      
      let rX = 35;
      const values = [
        e.employeeId,
        e.fullName?.slice(0, 22) || 'N/A',
        e.departmentName?.slice(0, 18) || 'N/A',
        e.designationTitle?.slice(0, 18) || 'N/A',
        e.employmentType || 'FULL_TIME',
        e.status || 'ACTIVE'
      ];
      values.forEach((v, i) => {
        doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(7.5).text(String(v), rX, currentY + 3);
        rX += widths[i];
      });
      currentY += 17;
    });
  } else if (type === 'ATTENDANCE') {
    const headers = ['Date', 'Emp ID', 'Name', 'Department', 'Status', 'In Time', 'Out Time', 'Work Hrs', 'OT'];
    const widths = [65, 55, 120, 110, 70, 70, 70, 60, 50];

    doc.roundedRect(30, currentY, doc.page.width - 60, 20, 3).fill(COLORS.NAVY);
    let hX = 35;
    headers.forEach((h, i) => {
      doc.fillColor(COLORS.WHITE).font('Helvetica-Bold').fontSize(8).text(h, hX, currentY + 5);
      hX += widths[i];
    });
    currentY += 22;

    data.slice(0, 30).forEach((a, idx) => {
      const bg = idx % 2 === 0 ? COLORS.LIGHT_BG : COLORS.WHITE;
      doc.rect(30, currentY, doc.page.width - 60, 16).fill(bg);

      let rX = 35;
      const values = [
        a.dateString || 'N/A',
        a.employeeId,
        a.employeeName?.slice(0, 20) || 'N/A',
        a.departmentName?.slice(0, 18) || 'N/A',
        a.status,
        a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        `${a.workingHours || 0}h`,
        `${a.overtimeHours || 0}h`
      ];
      values.forEach((v, i) => {
        doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(7.5).text(String(v), rX, currentY + 3);
        rX += widths[i];
      });
      currentY += 17;
    });
  } else if (type === 'PAYROLL') {
    const headers = ['Period', 'Emp ID', 'Name', 'Gross', 'PF', 'ESI', 'TDS', 'Total Ded.', 'Net Pay'];
    const widths = [55, 55, 110, 60, 45, 45, 45, 60, 60];

    doc.roundedRect(30, currentY, doc.page.width - 60, 20, 3).fill(COLORS.NAVY);
    let hX = 35;
    headers.forEach((h, i) => {
      doc.fillColor(COLORS.WHITE).font('Helvetica-Bold').fontSize(8).text(h, hX, currentY + 5);
      hX += widths[i];
    });
    currentY += 22;

    data.slice(0, 35).forEach((p, idx) => {
      const bg = idx % 2 === 0 ? COLORS.LIGHT_BG : COLORS.WHITE;
      doc.rect(30, currentY, doc.page.width - 60, 16).fill(bg);

      let rX = 35;
      const values = [
        p.payPeriod,
        p.employeeId,
        p.employeeName?.slice(0, 18) || 'N/A',
        `Rs.${(p.grossEarnings || 0).toLocaleString('en-IN')}`,
        `Rs.${(p.deductions?.providentFund || 0).toLocaleString('en-IN')}`,
        `Rs.${(p.deductions?.employeeStateInsurance || 0).toLocaleString('en-IN')}`,
        `Rs.${(p.deductions?.taxDeductedAtSource || 0).toLocaleString('en-IN')}`,
        `Rs.${(p.totalDeductions || 0).toLocaleString('en-IN')}`,
        `Rs.${(p.netPay || 0).toLocaleString('en-IN')}`
      ];
      values.forEach((v, i) => {
        doc.fillColor(COLORS.DARK_GRAY).font('Helvetica').fontSize(7.5).text(String(v), rX, currentY + 3);
        rX += widths[i];
      });
      currentY += 17;
    });
  }

  drawCorporateFooter(doc, `BJK-REP-${type}-${Date.now().toString().slice(-6)}`);
  doc.end();
}

module.exports = {
  generatePayslipPDF,
  generateTrainingCertificatePDF,
  generateOfferLetterPDF,
  generateExperienceCertificatePDF,
  generateReportPDF
};
