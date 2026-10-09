const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * BJK HEALTHCARE OFFICIAL 12-DOCUMENT MASTER CHECKLIST
 * Standardized across Employee Self-Service, HRMS Document Vault & HR/Admin Control Portal.
 */
const OFFICIAL_DOCUMENT_CHECKLIST = [
  {
    slotNo: 1,
    docCode: 'AADHAR_CARD',
    title: 'Aadhar Card',
    category: 'IDENTITY',
    isMandatory: true,
    description: 'Government issued 12-digit UIDAI Unique Identification Card (Front & Back merged into one PDF)',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'ShieldCheck'
  },
  {
    slotNo: 2,
    docCode: 'PAN_CARD',
    title: 'PAN Card',
    category: 'IDENTITY',
    isMandatory: true,
    description: 'Permanent Account Number Card issued by Income Tax Department, Govt of India',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'CreditCard'
  },
  {
    slotNo: 3,
    docCode: 'ADDRESS_PROOF',
    title: 'Address Proof',
    category: 'ADDRESS',
    isMandatory: false,
    description: 'Electricity Bill, Rental Agreement, Landline/Broadband Bill, or Domicile Certificate',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'Home'
  },
  {
    slotNo: 4,
    docCode: 'VOTER_ID',
    title: 'Voter ID',
    category: 'IDENTITY',
    isMandatory: false,
    description: 'Election Commission of India Voter Identity Card (EPIC)',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'Vote'
  },
  {
    slotNo: 5,
    docCode: 'DRIVING_LICENSE',
    title: 'Driving License',
    category: 'IDENTITY',
    isMandatory: false,
    description: 'Valid Regional Transport Authority (RTO) Driving Permit License',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'Car'
  },
  {
    slotNo: 6,
    docCode: 'BANK_PASSBOOK_CHEQUE',
    title: 'Bank Passbook / Cheque',
    category: 'FINANCIAL',
    isMandatory: true,
    description: 'Nationalized / Scheduled Bank Passbook front page (with Name, A/C & IFSC) or Cancelled Cheque',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'Building2'
  },
  {
    slotNo: 7,
    docCode: 'SSC_HSC_QUALIFICATION',
    title: 'Educational Qualification : SSC, HSC',
    category: 'EDUCATION',
    isMandatory: false,
    description: 'Secondary School Certificate (10th SSC) & Higher Secondary (12th HSC) Marksheets & Passing Certificates',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'GraduationCap'
  },
  {
    slotNo: 8,
    docCode: 'SCHOOL_LEAVING_CERTIFICATE',
    title: 'School Leaving Certificate',
    category: 'EDUCATION',
    isMandatory: false,
    description: 'Official School / College Transfer & Leaving Certificate (LC)',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'ScrollText'
  },
  {
    slotNo: 9,
    docCode: 'BACHELORS_DEGREE',
    title: 'Bachelors Degree all sem marksheet and Degree Certificate',
    category: 'EDUCATION',
    isMandatory: false,
    description: 'All semester marksheets and Convocation Degree Certificate (e.g., B.Pharm, B.Sc, B.E., B.Com, BBA)',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'Award'
  },
  {
    slotNo: 10,
    docCode: 'MASTERS_DEGREE',
    title: 'Master Degree all sem marksheet and Degree Certificate (if any)',
    category: 'EDUCATION',
    isMandatory: false,
    description: 'Postgraduate / Master Degree marksheets and Convocation Certificate (e.g., M.Pharm, M.Sc, MBA, MS) if applicable',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'Sparkles'
  },
  {
    slotNo: 11,
    docCode: 'EXPERIENCE_RELIEVING_LETTERS',
    title: 'Reliving Letters / Experience Letter from all previous organisation',
    category: 'EXPERIENCE',
    isMandatory: false,
    description: 'Service / Experience Certificates, Relieving Letters, and Resignation Acceptance from all prior employers',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'Briefcase'
  },
  {
    slotNo: 12,
    docCode: 'OTHER_CERTIFICATE',
    title: 'Any other Certificate',
    category: 'CERTIFICATIONS',
    isMandatory: false,
    description: 'Additional professional licenses, GMP/GLP certifications, medical fitness, or technical certificates',
    allowedFormat: 'PDF (.pdf only)',
    icon: 'FileCheck2'
  }
];

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'documents');

/**
 * Ensure the documents directory exists on disk
 */
function ensureUploadDirectory() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (_) {}
}

/**
 * Builds the merged 12-Document checklist for an employee.
 * Strictly checks actual uploaded documents on record. If not uploaded, sets NOT_UPLOADED.
 */
function buildEmployeeChecklist(employee) {
  if (!employee) return { checklist: [], stats: {} };

  const rawDocs = employee.documents || [];

  const checklist = OFFICIAL_DOCUMENT_CHECKLIST.map((slotDef) => {
    // 1. Check exact slot match in employee.documents
    let matchedDoc = rawDocs.find(
      (d) => Number(d.slotNo) === slotDef.slotNo || d.docCode === slotDef.docCode
    );

    // 2. If not found by slot/code, match by title heuristics only if doc has a real fileUrl
    if (!matchedDoc) {
      matchedDoc = rawDocs.find((d) => {
        if (!d.fileUrl) return false;
        const dName = (d.documentName || d.documentType || '').toLowerCase();
        if (slotDef.slotNo === 1 && (dName.includes('aadhar') || dName.includes('aadhaar'))) return true;
        if (slotDef.slotNo === 2 && dName.includes('pan')) return true;
        if (slotDef.slotNo === 3 && (dName.includes('address') || dName.includes('electricity') || dName.includes('rent'))) return true;
        if (slotDef.slotNo === 4 && dName.includes('voter')) return true;
        if (slotDef.slotNo === 5 && (dName.includes('driving') || dName.includes('license') || dName.includes('dl'))) return true;
        if (slotDef.slotNo === 6 && (dName.includes('bank') || dName.includes('passbook') || dName.includes('cheque'))) return true;
        if (slotDef.slotNo === 7 && (dName.includes('ssc') || dName.includes('hsc') || dName.includes('10th') || dName.includes('12th'))) return true;
        if (slotDef.slotNo === 8 && (dName.includes('leaving') || dName.includes('school') || dName.includes('transfer'))) return true;
        if (slotDef.slotNo === 9 && (dName.includes('bachelor') || dName.includes('b.pharm') || dName.includes('b.sc') || dName.includes('degree'))) return true;
        if (slotDef.slotNo === 10 && (dName.includes('master') || dName.includes('m.pharm') || dName.includes('m.sc') || dName.includes('mba'))) return true;
        if (slotDef.slotNo === 11 && (dName.includes('relieving') || dName.includes('experience') || dName.includes('service letter'))) return true;
        if (slotDef.slotNo === 12 && (dName.includes('certificate') || dName.includes('other'))) return true;
        return false;
      });
    }

    const isUploaded = Boolean(matchedDoc && matchedDoc.fileUrl);
    const fileUrl = isUploaded ? matchedDoc.fileUrl : '';
    const verificationStatus = isUploaded ? (matchedDoc.verificationStatus || 'PENDING') : 'NOT_UPLOADED';

    return {
      slotNo: slotDef.slotNo,
      docCode: slotDef.docCode,
      title: slotDef.title,
      category: slotDef.category,
      isMandatory: slotDef.isMandatory,
      description: slotDef.description,
      allowedFormat: slotDef.allowedFormat,
      icon: slotDef.icon,
      isUploaded,
      documentId: matchedDoc ? (matchedDoc.documentId || matchedDoc._id?.toString()) : null,
      documentName: matchedDoc ? matchedDoc.documentName : slotDef.title,
      fileName: matchedDoc?.fileName || (isUploaded ? `${slotDef.docCode}.pdf` : ''),
      fileUrl,
      fileType: 'application/pdf',
      fileSize: matchedDoc?.fileSize || 0,
      verificationStatus,
      uploadedAt: matchedDoc?.uploadedAt || null,
      uploadedBy: matchedDoc?.uploadedBy || '',
      verifiedBy: matchedDoc?.verifiedBy || '',
      verifiedAt: matchedDoc?.verifiedAt || null,
      remarks: matchedDoc?.remarks || ''
    };
  });

  // Calculate statistics
  const totalSlots = 12;
  const uploadedCount = checklist.filter((item) => item.isUploaded).length;
  const verifiedCount = checklist.filter((item) => item.verificationStatus === 'VERIFIED').length;
  const pendingCount = checklist.filter((item) => item.isUploaded && item.verificationStatus === 'PENDING').length;
  const rejectedCount = checklist.filter((item) => item.verificationStatus === 'REJECTED').length;

  const mandatorySlots = checklist.filter((item) => item.isMandatory);
  const mandatoryTotal = mandatorySlots.length; // 3 (Aadhar, PAN, Bank)
  const mandatoryUploadedCount = mandatorySlots.filter((item) => item.isUploaded).length;
  const mandatoryVerifiedCount = mandatorySlots.filter((item) => item.verificationStatus === 'VERIFIED').length;
  const mandatoryCompleted = mandatoryUploadedCount === mandatoryTotal;

  const completionPercentage = Math.round((uploadedCount / totalSlots) * 100);

  let overallComplianceStatus = 'MANDATORY_INCOMPLETE';
  if (mandatoryCompleted && verifiedCount === totalSlots) {
    overallComplianceStatus = 'FULLY_VERIFIED';
  } else if (mandatoryCompleted && mandatoryVerifiedCount === mandatoryTotal) {
    overallComplianceStatus = 'MANDATORY_VERIFIED';
  } else if (mandatoryCompleted) {
    overallComplianceStatus = 'MANDATORY_COMPLETE_PENDING_HR';
  } else if (rejectedCount > 0) {
    overallComplianceStatus = 'ACTION_REQUIRED';
  } else {
    overallComplianceStatus = 'MANDATORY_INCOMPLETE';
  }

  const stats = {
    totalSlots,
    uploadedCount,
    verifiedCount,
    pendingCount,
    rejectedCount,
    mandatoryTotal,
    mandatoryUploadedCount,
    mandatoryVerifiedCount,
    mandatoryCompleted,
    completionPercentage,
    overallComplianceStatus
  };

  return { checklist, stats };
}

/**
 * Saves a base64 or buffer PDF directly to server uploads folder
 */
async function saveUploadedPDFFile({ buffer, originalFilename, employeeId, slotNo }) {
  ensureUploadDirectory();
  const safeEmpId = (employeeId || 'EMP').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `BJK-DOC-${safeEmpId}-SLOT${slotNo}-${Date.now()}.pdf`;
  const targetPath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(targetPath, buffer);
  return {
    filename,
    fileUrl: `/uploads/documents/${filename}`,
    fileSize: buffer.length
  };
}

module.exports = {
  OFFICIAL_DOCUMENT_CHECKLIST,
  buildEmployeeChecklist,
  saveUploadedPDFFile,
  ensureUploadDirectory
};
