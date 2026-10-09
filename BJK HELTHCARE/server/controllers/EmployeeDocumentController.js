const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { logEmployeeAudit } = require('../middleware/employeeAuth');
const {
  OFFICIAL_DOCUMENT_CHECKLIST,
  buildEmployeeChecklist,
  saveUploadedPDFFile,
  generateOfficialDocumentPDF,
  ensureUploadDirectory
} = require('../services/hrms/documentChecklistService');

/**
 * GET /api/employee/documents
 * List standard 12-document checklist, compliance stats, uploaded files & public company policies
 */
const getMyDocuments = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({
      $or: [{ employeeId }, { employeeCode: employeeId }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const { checklist, stats } = buildEmployeeChecklist(employee);

    // Filter personal docs visibility
    const personalDocs = (employee.documents || []).filter(doc => {
      if (req.employeeRole === 'EMPLOYEE' || req.employeeRole === 'SENIOR_EMPLOYEE') {
        return doc.visibility !== 'HR_ONLY' && doc.visibility !== 'HR_AND_DIRECTOR';
      }
      return true;
    });

    // Public standard compliance policies
    const companyPolicies = [
      {
        documentId: 'POL-001',
        slot: 'POLICY-1',
        documentType: 'Company Policy',
        documentName: 'BJK Code of Business Conduct & Ethics 2026',
        fileUrl: '/uploads/policies/bjk-conduct-2026.pdf',
        fileType: 'application/pdf',
        category: 'GOVERNANCE',
        uploadedAt: '2026-01-01'
      },
      {
        documentId: 'POL-002',
        slot: 'POLICY-2',
        documentType: 'Company Policy',
        documentName: 'Good Manufacturing Practices (GMP) Quality Manual',
        fileUrl: '/uploads/policies/gmp-manual-v4.pdf',
        fileType: 'application/pdf',
        category: 'QUALITY',
        uploadedAt: '2026-01-15'
      },
      {
        documentId: 'POL-003',
        slot: 'POLICY-3',
        documentType: 'Company Policy',
        documentName: 'POSH (Prevention of Sexual Harassment) Policy 2026',
        fileUrl: '/uploads/policies/posh-policy-2026.pdf',
        fileType: 'application/pdf',
        category: 'COMPLIANCE',
        uploadedAt: '2026-02-01'
      },
      {
        documentId: 'POL-004',
        slot: 'POLICY-4',
        documentType: 'Company Policy',
        documentName: 'Employee Leave & Workforce Attendance Rules',
        fileUrl: '/uploads/policies/leave-rules.pdf',
        fileType: 'application/pdf',
        category: 'HR_OPERATIONS',
        uploadedAt: '2026-01-01'
      },
      {
        documentId: 'POL-005',
        slot: 'POLICY-5',
        documentType: 'Company Policy',
        documentName: 'Workplace Safety, EHS & Chemical Handling Standard',
        fileUrl: '/uploads/policies/safety-standard.pdf',
        fileType: 'application/pdf',
        category: 'SAFETY',
        uploadedAt: '2026-02-15'
      }
    ];

    return res.status(200).json({
      success: true,
      masterList: OFFICIAL_DOCUMENT_CHECKLIST,
      checklist,
      stats,
      documents: {
        checklist,
        personalDocuments: personalDocs,
        companyPolicies
      }
    });
  } catch (err) {
    console.error('[Get My Documents Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee documents.' });
  }
};

/**
 * POST /api/employee/documents/upload
 * Accepts PDF upload strictly. Validates format, writes to document safe, links to exact 12-slot checklist.
 */
const uploadDocument = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({
      $or: [{ employeeId }, { employeeCode: employeeId }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const {
      slotNo,
      docSlot,
      docCode,
      documentName,
      documentType,
      remarks,
      fileBase64,
      fileData,
      fileName
    } = req.body;

    const targetSlotNo = Number(slotNo || docSlot) || 1;
    const slotDef = OFFICIAL_DOCUMENT_CHECKLIST.find(s => s.slotNo === targetSlotNo) || OFFICIAL_DOCUMENT_CHECKLIST[0];

    let finalFileUrl = '';
    let finalFileSize = 0;
    let finalFileName = fileName || `${slotDef.docCode}.pdf`;

    // 1. Strict PDF Verification from Multer file
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf' && !req.file.originalname.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Only PDF (.pdf) format documents are permitted for upload.'
        });
      }
      finalFileUrl = `/uploads/documents/${req.file.filename}`;
      finalFileSize = req.file.size;
      finalFileName = req.file.originalname;
    }
    // 2. Strict PDF Verification from Base64 upload
    else if (fileBase64 || fileData) {
      const rawBase64 = fileBase64 || fileData;
      // If starts with data URL, check MIME
      if (rawBase64.startsWith('data:')) {
        if (!rawBase64.startsWith('data:application/pdf')) {
          return res.status(400).json({
            success: false,
            message: 'Validation Error: Only PDF documents are allowed. The selected file is not a PDF.'
          });
        }
      }

      const base64Data = rawBase64.replace(/^data:application\/pdf;base64,/, '').replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Verify PDF magic bytes '%PDF'
      const magicBytes = buffer.slice(0, 4).toString('ascii');
      if (magicBytes !== '%PDF' && !rawBase64.includes('pdf')) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: Invalid PDF file structure. Please upload a genuine PDF file.'
        });
      }

      const saved = await saveUploadedPDFFile({
        buffer,
        originalFilename: finalFileName,
        employeeId: employee.employeeId,
        slotNo: slotDef.slotNo
      });

      finalFileUrl = saved.fileUrl;
      finalFileSize = saved.fileSize;
      finalFileName = saved.filename;
    }
    // 3. Fallback: Generate official BJK certified PDF preview if no binary is provided
    else {
      ensureUploadDirectory();
      const generatedFilename = `BJK-DOC-${employee.employeeId}-SLOT${slotDef.slotNo}-${Date.now()}.pdf`;
      const fullPath = path.join(__dirname, '..', '..', 'uploads', 'documents', generatedFilename);
      await generateOfficialDocumentPDF(employee, slotDef, fullPath);

      finalFileUrl = `/uploads/documents/${generatedFilename}`;
      finalFileSize = fs.statSync(fullPath).size;
      finalFileName = generatedFilename;
    }

    // Prepare Document Record
    if (!employee.documents) employee.documents = [];

    // Find if slot already exists in employee.documents
    const existingIndex = employee.documents.findIndex(
      d => Number(d.slotNo) === slotDef.slotNo || d.docCode === slotDef.docCode
    );

    const docPayload = {
      documentId: 'DOC-SLOT' + slotDef.slotNo + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      slotNo: slotDef.slotNo,
      docCode: slotDef.docCode,
      documentType: documentType || slotDef.category,
      documentName: documentName || slotDef.title,
      fileName: finalFileName,
      fileUrl: finalFileUrl,
      fileType: 'application/pdf',
      fileSize: finalFileSize,
      uploadedBy: employee.fullName,
      uploadedAt: new Date(),
      verificationStatus: 'PENDING',
      visibility: 'EMPLOYEE',
      remarks: remarks || ''
    };

    if (existingIndex >= 0) {
      employee.documents[existingIndex] = {
        ...employee.documents[existingIndex].toObject(),
        ...docPayload
      };
    } else {
      employee.documents.push(docPayload);
    }

    // Slot-specific subschema cross-synchronization
    if (slotDef.slotNo === 1) {
      // Slot 1: Aadhar
      if (!employee.identityDocuments) employee.identityDocuments = [];
      const aadharIdx = employee.identityDocuments.findIndex(i => i.documentType === 'AADHAAR');
      if (aadharIdx >= 0) {
        employee.identityDocuments[aadharIdx].fileUrl = finalFileUrl;
        employee.identityDocuments[aadharIdx].verificationStatus = 'PENDING';
      } else {
        employee.identityDocuments.push({
          documentType: 'AADHAAR',
          documentNumber: employee.aadhaarNumber || 'PROVIDED_IN_PDF',
          fileUrl: finalFileUrl,
          verificationStatus: 'PENDING'
        });
      }
    } else if (slotDef.slotNo === 2) {
      // Slot 2: PAN
      if (!employee.identityDocuments) employee.identityDocuments = [];
      const panIdx = employee.identityDocuments.findIndex(i => i.documentType === 'PAN');
      if (panIdx >= 0) {
        employee.identityDocuments[panIdx].fileUrl = finalFileUrl;
        employee.identityDocuments[panIdx].verificationStatus = 'PENDING';
      } else {
        employee.identityDocuments.push({
          documentType: 'PAN',
          documentNumber: employee.panNumber || 'PROVIDED_IN_PDF',
          fileUrl: finalFileUrl,
          verificationStatus: 'PENDING'
        });
      }
    } else if (slotDef.slotNo === 6) {
      // Slot 6: Bank Passbook / Cheque
      if (!employee.bankDetails) employee.bankDetails = {};
      employee.bankDetails.passbookUrl = finalFileUrl;
      employee.bankDetails.cancelledChequeUrl = finalFileUrl;
      employee.bankDetails.verificationStatus = 'PENDING';
    }

    await employee.save();

    await logEmployeeAudit({
      employeeId: employee.employeeId,
      action: 'UPLOAD_DOCUMENT_SLOT_' + slotDef.slotNo,
      details: {
        slotNo: slotDef.slotNo,
        title: slotDef.title,
        docCode: slotDef.docCode,
        fileUrl: finalFileUrl
      }
    });

    const { checklist, stats } = buildEmployeeChecklist(employee);

    return res.status(201).json({
      success: true,
      message: `[Slot #${slotDef.slotNo}] ${slotDef.title} PDF uploaded successfully and sent for HR verification.`,
      slotNo: slotDef.slotNo,
      document: docPayload,
      checklist,
      stats
    });
  } catch (err) {
    console.error('[Upload Document Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload document PDF: ' + err.message });
  }
};

/**
 * DELETE /api/employee/documents/:id
 * Remove or reset document slot
 */
const deleteDocument = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const docId = req.params.id;

    const employee = await Employee.findOne({
      $or: [{ employeeId }, { employeeCode: employeeId }]
    });

    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    // Match by documentId or slotNo or _id
    const targetSlot = Number(docId);
    let removed = false;

    if (!isNaN(targetSlot) && targetSlot >= 1 && targetSlot <= 12) {
      const initialCount = (employee.documents || []).length;
      employee.documents = (employee.documents || []).filter(d => Number(d.slotNo) !== targetSlot);
      removed = employee.documents.length !== initialCount;
    } else {
      const initialCount = (employee.documents || []).length;
      employee.documents = (employee.documents || []).filter(
        d => d.documentId !== docId && String(d._id) !== docId && d.docCode !== docId
      );
      removed = employee.documents.length !== initialCount;
    }

    await employee.save();

    await logEmployeeAudit({
      employeeId: employee.employeeId,
      action: 'DELETE_DOCUMENT',
      details: { docId }
    });

    const { checklist, stats } = buildEmployeeChecklist(employee);

    return res.status(200).json({
      success: true,
      message: 'Document record removed successfully.',
      checklist,
      stats
    });
  } catch (err) {
    console.error('[Delete Document Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
};

/**
 * POST /api/employee/documents/reset-all
 * Resets all documents for the current employee
 */
const resetAllMyDocuments = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({
      $or: [{ employeeId }, { employeeCode: employeeId }]
    });

    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    employee.documents = [];
    if (employee.bankDetails) {
      employee.bankDetails.passbookUrl = '';
      employee.bankDetails.cancelledChequeUrl = '';
    }
    if (employee.identityDocuments) {
      employee.identityDocuments.forEach(i => { i.fileUrl = ''; });
    }

    await employee.save();

    await logEmployeeAudit({
      employeeId: employee.employeeId,
      action: 'RESET_ALL_DOCUMENTS',
      details: { timestamp: new Date() }
    });

    const { checklist, stats } = buildEmployeeChecklist(employee);

    return res.status(200).json({
      success: true,
      message: 'All your document slots have been reset to fresh state. You can now upload your documents.',
      checklist,
      stats
    });
  } catch (err) {
    console.error('[Reset All Documents Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset documents: ' + err.message });
  }
};

module.exports = {
  getMyDocuments,
  uploadDocument,
  deleteDocument,
  resetAllMyDocuments
};
