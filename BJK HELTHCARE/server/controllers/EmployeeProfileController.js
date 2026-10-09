const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * GET /api/employee/profile
 * Returns the currently authenticated employee's full profile
 */
const getMyProfile = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    let employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found.'
      });
    }

    // Filter out confidential HR Notes or Admin-only salary data of others
    const profile = employee.toObject();

    // Remove confidential HR notes that regular employees shouldn't see
    if (req.employeeRole === 'EMPLOYEE' || req.employeeRole === 'SENIOR_EMPLOYEE') {
      profile.hrNotes = (profile.hrNotes || []).filter(n => !n.isConfidential && n.noteType !== 'Disciplinary');
    }

    // Audit view
    await logEmployeeAudit({
      employeeId,
      action: 'VIEW_PROFILE',
      details: 'Viewed own profile'
    });

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (err) {
    console.error('[Get My Profile Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee profile.'
    });
  }
};

/**
 * PUT /api/employee/profile/personal
 * Updates permitted personal and contact details
 */
const updatePersonal = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const {
      personalEmail,
      personalMobile,
      alternateMobile,
      bloodGroup,
      maritalStatus,
      currentAddressDetails,
      permanentAddressDetails,
      profilePhotoUrl,
      photo,
      profilePhoto,
      avatar
    } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (personalEmail !== undefined) employee.personalEmail = personalEmail;
    if (personalMobile !== undefined) employee.personalMobile = personalMobile;
    if (alternateMobile !== undefined) employee.alternateMobile = alternateMobile;
    if (bloodGroup !== undefined) employee.bloodGroup = bloodGroup;
    if (maritalStatus !== undefined) employee.maritalStatus = maritalStatus;
    
    const photoToSet = photo !== undefined ? photo : profilePhoto !== undefined ? profilePhoto : profilePhotoUrl !== undefined ? profilePhotoUrl : avatar;
    if (photoToSet !== undefined) {
      employee.photo = photoToSet;
      employee.profilePhoto = photoToSet;
      employee.profilePhotoUrl = photoToSet;
      employee.avatar = photoToSet;

      try {
        const User = require('../models/User');
        await User.findOneAndUpdate(
          {
            $or: [
              { employeeId: employeeId },
              { employeeCode: employeeId },
              { email: employee.email },
              { workEmail: employee.email }
            ]
          },
          { $set: { avatar: photoToSet } }
        );
      } catch (uErr) {
        console.warn('[Sync Photo to User Warning]:', uErr.message);
      }
    }

    if (currentAddressDetails) {
      employee.currentAddressDetails = {
        ...employee.currentAddressDetails,
        ...currentAddressDetails
      };
      employee.currentAddress = `${employee.currentAddressDetails.line1 || ''}, ${employee.currentAddressDetails.city || ''}, ${employee.currentAddressDetails.state || ''} ${employee.currentAddressDetails.pinCode || ''}`.trim();
    }

    if (permanentAddressDetails) {
      employee.permanentAddressDetails = {
        ...employee.permanentAddressDetails,
        ...permanentAddressDetails
      };
      employee.permanentAddress = `${employee.permanentAddressDetails.line1 || ''}, ${employee.permanentAddressDetails.city || ''}, ${employee.permanentAddressDetails.state || ''} ${employee.permanentAddressDetails.pinCode || ''}`.trim();
    }

    await employee.save();

    await logEmployeeAudit({
      employeeId,
      action: 'UPDATE_PERSONAL_PROFILE',
      details: { updatedFields: Object.keys(req.body) }
    });

    return res.status(200).json({
      success: true,
      message: 'Personal details updated successfully.',
      profile: employee
    });
  } catch (err) {
    console.error('[Update Personal Profile Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update personal details.' });
  }
};

/**
 * PUT /api/employee/profile/photo
 * Direct upload/update for passport size profile photo & standard avatar
 */
const updatePhoto = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { photo, profilePhoto, profilePhotoUrl, avatar } = req.body;
    const newPhoto = photo || profilePhoto || profilePhotoUrl || avatar;

    if (!newPhoto) {
      return res.status(400).json({ success: false, message: 'Photo image or avatar data is required.' });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    employee.photo = newPhoto;
    employee.profilePhoto = newPhoto;
    employee.profilePhotoUrl = newPhoto;
    employee.avatar = newPhoto;
    await employee.save();

    // Sync to User model across all Digital Brain enterprise views
    try {
      const User = require('../models/User');
      await User.findOneAndUpdate(
        {
          $or: [
            { employeeId: employeeId },
            { employeeCode: employeeId },
            { email: employee.email },
            { workEmail: employee.email }
          ]
        },
        { $set: { avatar: newPhoto } }
      );
    } catch (uErr) {
      console.warn('[Sync Photo to User Warning]:', uErr.message);
    }

    await logEmployeeAudit({
      employeeId,
      action: 'UPDATE_PROFILE_PHOTO',
      details: 'Updated passport size profile photo'
    });

    return res.status(200).json({
      success: true,
      message: 'Profile photo saved successfully.',
      photo: newPhoto,
      profile: employee
    });
  } catch (err) {
    console.error('[Update Photo Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile photo.' });
  }
};

/**
 * PUT /api/employee/profile/emergency
 * Add or update emergency contacts
 */
const updateEmergency = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { emergencyContacts } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    if (Array.isArray(emergencyContacts)) {
      employee.emergencyContacts = emergencyContacts;
      if (emergencyContacts.length > 0) {
        const primary = emergencyContacts.find(c => c.isPrimary) || emergencyContacts[0];
        employee.emergencyContact = {
          name: primary.name,
          relation: primary.relationship,
          phone: primary.mobile,
          email: primary.email || '',
          address: primary.address || ''
        };
      }
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Emergency contacts updated successfully.',
      emergencyContacts: employee.emergencyContacts
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update emergency contacts.' });
  }
};

/**
 * PUT /api/employee/profile/family
 * Add or update family members
 */
const updateFamily = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { familyMembers } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    if (Array.isArray(familyMembers)) {
      employee.familyMembers = familyMembers;
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Family details updated successfully.',
      familyMembers: employee.familyMembers
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update family details.' });
  }
};

/**
 * PUT /api/employee/profile/education
 * Add or update education / achievements
 */
const updateEducation = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { educationDetails, achievements } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    if (Array.isArray(educationDetails)) {
      employee.educationDetails = educationDetails;
    }
    if (Array.isArray(achievements)) {
      employee.achievements = achievements;
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Education and achievements updated successfully.',
      educationDetails: employee.educationDetails,
      achievements: employee.achievements
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update education details.' });
  }
};

/**
 * PUT /api/employee/profile/experience
 * Add or update previous employment experience
 */
const updateExperience = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { previousEmployment } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    if (Array.isArray(previousEmployment)) {
      employee.previousEmployment = previousEmployment;
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Experience history updated successfully.',
      previousEmployment: employee.previousEmployment
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update experience details.' });
  }
};

/**
 * PUT /api/employee/profile/nominees
 */
const updateNominees = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { nominees } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    if (Array.isArray(nominees)) {
      employee.familyDetails = {
        ...employee.familyDetails,
        nomineeName: nominees[0]?.name || '',
        nomineeRelationship: nominees[0]?.relationship || '',
        nomineeDateOfBirth: nominees[0]?.dob || null,
        nomineeContact: nominees[0]?.contact || '',
        nomineeAddress: nominees[0]?.address || ''
      };
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Nominees updated successfully.',
      familyDetails: employee.familyDetails
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update nominees.' });
  }
};

/**
 * GET /api/employee/profile/business-card
 */
const getBusinessCard = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found.' });

    const card = {
      employeeId: employee.employeeId,
      name: employee.fullName,
      designation: employee.designationTitle,
      department: employee.departmentName,
      email: employee.email,
      mobile: employee.phone || employee.officialMobile,
      company: 'BJK Healthcare Private Limited',
      address: employee.workLocation || 'Ahmedabad, Gujarat, India',
      qrCodeData: `https://bjkhealthcare.com/verify-id/${employee.identityCard?.qrVerificationCode || employee.employeeId}`,
      avatar: employee.profilePhotoUrl || ''
    };

    return res.status(200).json({ success: true, card });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving digital business card.' });
  }
};

/**
 * GET /api/employee/profile/id-card
 * Strictly returns only the authenticated employee's ID card data (Security enforced at backend)
 */
const getMyIdCard = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    let employee = await Employee.findOne({ $or: [{ employeeId }, { employeeCode: employeeId }] });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const cardData = {
      _id: employee._id,
      employeeId: employee.employeeId,
      employeeCode: employee.employeeCode || employee.employeeId,
      fullName: employee.fullName,
      firstName: employee.firstName,
      lastName: employee.lastName,
      designationTitle: employee.designationTitle || (typeof employee.designation === 'string' ? employee.designation : employee.designation?.title) || 'Officer',
      designation: employee.designationTitle || (typeof employee.designation === 'string' ? employee.designation : employee.designation?.title) || 'Officer',
      departmentName: employee.departmentName || (typeof employee.department === 'string' ? employee.department : employee.department?.name) || 'Operations',
      department: employee.departmentName || (typeof employee.department === 'string' ? employee.department : employee.department?.name) || 'Operations',
      branch: employee.branch || employee.facility || 'Ahmedabad',
      bloodGroup: employee.bloodGroup || 'O+',
      phone: employee.phone || employee.officialMobile || employee.personalMobile || '',
      email: employee.email || employee.workEmail || '',
      dateOfBirth: employee.dateOfBirth,
      photo: employee.photo || employee.profilePhoto || '',
      profilePhoto: employee.photo || employee.profilePhoto || '',
      templateVersion: 'BJK-ID-2026-V1',
      identityCard: employee.identityCard || {
        cardTemplate: 'BJK-ID-2026-V1',
        status: 'ACTIVE'
      }
    };

    // Audit view
    try {
      await logEmployeeAudit({
        employeeId,
        action: 'VIEW_ID_CARD',
        details: 'Viewed own employee ID card (BJK-ID-2026-V1)'
      });
    } catch (e) {
      // Non-blocking audit
    }

    return res.status(200).json({ success: true, employee: cardData, idCard: cardData });
  } catch (err) {
    console.error('[Get My ID Card Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee ID card.' });
  }
};

module.exports = {
  getMyProfile,
  updatePersonal,
  updatePhoto,
  updateEmergency,
  updateFamily,
  updateEducation,
  updateExperience,
  updateNominees,
  getBusinessCard,
  getMyIdCard
};

