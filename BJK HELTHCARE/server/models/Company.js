const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: true, 
    default: 'BJK Healthcare Pvt. Ltd.', 
    trim: true 
  },
  legalName: { 
    type: String, 
    required: true, 
    default: 'BJK Healthcare Private Limited', 
    trim: true 
  },
  CIN: { 
    type: String, 
    required: true, 
    default: 'U46497GJ2023PTC1393308', 
    trim: true 
  },
  corporateOffice: {
    address: { type: String, default: '410-4th Floor, Syphon Gardenia, on S.P. Ring Road, Opp. Lubi Pumps, Nana Chiloda' },
    city: { type: String, default: 'Ahmedabad' },
    state: { type: String, default: 'Gujarat' },
    country: { type: String, default: 'India' },
    pincode: { type: String, default: '382330' }
  },
  manufacturingUnits: [{
    title: { type: String, default: 'Survey No. 1248 Lavad Plant' },
    address: { type: String, default: 'Survey No. 1248 Rashtriya Raksha University Road, Village-Lavad, Taluka - Dehgam' },
    city: { type: String, default: 'Gandhinagar' },
    state: { type: String, default: 'Gujarat' },
    country: { type: String, default: 'India' },
    pincode: { type: String, default: '382305' }
  }],
  registrationDetails: {
    incorporationDate: { type: String, default: 'March 2024' },
    pan: { type: String, default: '' },
    gstin: { type: String, default: '' },
    drugLicenseNo: { type: String, default: 'G/25/XXXX' }
  },
  mission: { 
    type: String, 
    default: 'Increasing access to high-quality medicine and improving patient health is our mission.' 
  },
  vision: { 
    type: String, 
    default: 'To improve health and enhance quality of life by delivering safe, effective, and affordable pharmaceutical formulations. We are committed to excellence in manufacturing and innovation, ensuring every product meets the highest standards of quality and regulatory compliance.' 
  },
  contactInformation: {
    email: { type: String, default: 'contactus@bjkhealthcare.com' },
    phone: { type: String, default: '+91 99744 86967' },
    website: { type: String, default: 'https://www.bjkhealthcare.com' }
  },
  publicStatistics: {
    tabletsAnnualCapacity: { type: String, default: '17B+ Tablets' },
    dpsBottlesCapacity: { type: String, default: '21M+ D.P.S. Bottles' },
    dpiCapsulesCapacity: { type: String, default: '3.5B D.P.I. Capsules' },
    capsulesCapacity: { type: String, default: '11B+ Capsules' },
    sachetsCapacity: { type: String, default: '32M+ Sachets' },
    verificationNote: { type: String, default: 'Publicly stated company information from official brochure' }
  },
  capabilities: [{ 
    type: String 
  }],
  certifications: [{ 
    type: String 
  }]
}, {
  timestamps: true
});

module.exports = mongoose.models.Company || mongoose.model('Company', CompanySchema);
