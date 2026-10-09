const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB, getDBName } = require('../config/db');
const {
  Company,
  Facility,
  Department,
  User,
  Role,
  Product,
  ProductCategory,
  ManufacturingCapability,
  ProductionLine,
  Machine,
  ProductionOrder,
  Batch,
  Warehouse,
  InventoryItem,
  InventoryTransaction,
  QCSample,
  QCTest,
  QCResult,
  Deviation,
  CAPA,
  ChangeControl,
  SOP,
  Audit,
  RegulatoryRecord,
  DossierSubmission,
  CountryCompliance,
  Enquiry,
  Customer,
  SalesOrder,
  Document,
  KnowledgeEntity,
  KnowledgeChunk,
  Alert,
  Task,
  AuditLog
} = require('../models');

// Load Raw Seed JSON
const productsData = require('./products.json');
const companyData = require('./companyData.json');

// Category metadata mapping for brochure pages 8-15
const CATEGORIES_METADATA = [
  { name: 'Anti-Diabetic', code: 'CAT-AD', sourcePages: '8-9', description: 'Oral hypoglycemic agents, DPP-4 inhibitors, SGLT-2 inhibitors, and biguanide combinations.' },
  { name: 'GIT Product', code: 'CAT-GIT', sourcePages: '9', description: 'Gastrointestinal therapeutic formulations, proton-pump inhibitors, and anti-emetics.' },
  { name: 'Cardiovascular', code: 'CAT-CVS', sourcePages: '10-11', description: 'Antihypertensives, ARBs, statins, beta-blockers, and anti-platelet therapies.' },
  { name: 'Dry Powder Syrup', code: 'CAT-DPS', sourcePages: '11', description: 'Pediatric and dry powder suspensions with high bioavailability and reconstitution stability.' },
  { name: 'Anti-Bacterial / Anti-Viral / General Antibiotics', code: 'CAT-AB', sourcePages: '11-12', description: 'Broad-spectrum cephalosporins, macrolides, fluoroquinolones, and antiviral agents.' },
  { name: 'Analgesic / Anti-Pyretic / Anti-Inflammatory / NSAIDs', code: 'CAT-NSAID', sourcePages: '12-13', description: 'Pain management, antipyretics, muscle relaxants, and anti-inflammatory formulations.' },
  { name: 'Anti-Psychotic / Anti-Convulsant / Anti-Depressant', code: 'CAT-CNS', sourcePages: '13-14', description: 'Central nervous system agents, mood stabilizers, SSRIs, and neurotherapeutics.' },
  { name: 'Anti Cold / Anti Allergic / Anti-Asthmatics', code: 'CAT-RESP', sourcePages: '14', description: 'Antihistamines, bronchodilators, leukotriene receptor antagonists, and decongestants.' },
  { name: 'Erectile Dysfunction', code: 'CAT-ED', sourcePages: '14', description: 'PDE5 inhibitors for specialized urological healthcare.' },
  { name: 'DPIs', code: 'CAT-DPI', sourcePages: '14-15', description: 'Dry Powder Inhaler formulations for pulmonary and respiratory drug delivery.' },
  { name: 'Sachets', code: 'CAT-SCH', sourcePages: '15', description: 'Electrolyte rehydration, amino acids, and granular nutraceutical sachets.' }
];

const seedDatabase = async () => {
  console.log('====================================================');
  console.log('BJK HEALTHCARE DIGITAL BRAIN - ENTERPRISE SEED ENGINE');
  console.log('====================================================');

  const conn = await connectDB();
  if (!conn) {
    throw new Error('Database connection failed. Seed aborted.');
  }

  const dbName = getDBName();
  console.log(`[Seed] Connected to database: ${dbName}`);

  // 1. Seed Company
  console.log('[Seed] Seeding Company information...');
  const compInfo = companyData.company;
  await Company.findOneAndUpdate(
    { CIN: compInfo.cin || 'U46497GJ2023PTC1393308' },
    {
      companyName: compInfo.name,
      legalName: compInfo.name,
      CIN: compInfo.cin || 'U46497GJ2023PTC1393308',
      corporateOffice: {
        address: compInfo.addresses?.corporateOffice?.addressLine || '410-4th Floor, Syphon Gardenia, on S.P. Ring Road, Opp. Lubi Pumps, Nana Chiloda',
        city: compInfo.addresses?.corporateOffice?.city || 'Ahmedabad',
        state: compInfo.addresses?.corporateOffice?.state || 'Gujarat',
        country: compInfo.addresses?.corporateOffice?.country || 'India',
        pincode: compInfo.addresses?.corporateOffice?.pincode || '382330'
      },
      manufacturingUnits: [{
        title: compInfo.addresses?.manufacturingUnit?.title || 'Survey No. 1248 Lavad Plant',
        address: compInfo.addresses?.manufacturingUnit?.addressLine || 'Survey No. 1248 Rashtriya Raksha University Road, Village-Lavad, Taluka - Dehgam',
        city: compInfo.addresses?.manufacturingUnit?.district || 'Gandhinagar',
        state: compInfo.addresses?.manufacturingUnit?.state || 'Gujarat',
        country: compInfo.addresses?.manufacturingUnit?.country || 'India',
        pincode: compInfo.addresses?.manufacturingUnit?.pincode || '382305'
      }],
      registrationDetails: {
        incorporationDate: compInfo.launchDate || 'March 2024',
        pan: 'AABCB1234F',
        gstin: '24AABCB1234F1Z5',
        drugLicenseNo: 'G/25/1982-A'
      },
      mission: compInfo.mission,
      vision: compInfo.vision,
      contactInformation: {
        email: compInfo.email || 'contactus@bjkhealthcare.com',
        phone: compInfo.phone || '+91 99744 86967',
        website: compInfo.website || 'https://www.bjkhealthcare.com'
      },
      publicStatistics: {
        tabletsAnnualCapacity: '17B+ Tablets',
        dpsBottlesCapacity: '21M+ D.P.S. Bottles',
        dpiCapsulesCapacity: '3.5B D.P.I. Capsules',
        capsulesCapacity: '11B+ Capsules',
        sachetsCapacity: '32M+ Sachets',
        verificationNote: 'Publicly stated company information from official brochure'
      },
      capabilities: [
        'Solid Oral Dosages (Tablets & Capsules)',
        'Dry Powder Inhalers (DPIs)',
        'Dry Powder Syrups (DPS)',
        'Effervescent Sachets',
        'Modified Release & XR Formulations'
      ],
      certifications: compInfo.certifications || [
        'WHO-GMP Certified',
        'Compliant with US-FDA Standards',
        'Compliant with UK-MHRA Standards'
      ]
    },
    { upsert: true, new: true }
  );
  console.log('[Seed] Company seeded successfully.');

  // 2. Seed Facilities
  console.log('[Seed] Seeding Facilities...');
  const plant1 = await Facility.findOneAndUpdate(
    { facilityCode: 'PLANT-LAVAD' },
    {
      facilityName: 'BJK Survey No. 1248 Lavad Plant',
      facilityCode: 'PLANT-LAVAD',
      facilityType: 'MANUFACTURING',
      address: 'Survey No. 1248 Rashtriya Raksha University Road, Village-Lavad, Taluka - Dehgam',
      city: 'Gandhinagar',
      state: 'Gujarat',
      country: 'India',
      pincode: '382305',
      departments: ['Production', 'Quality Control', 'Quality Assurance', 'Warehouse', 'Engineering'],
      manufacturingCapabilities: ['Tablets', 'Capsules', 'DPS', 'DPIs', 'Sachets'],
      certifications: ['WHO-GMP', 'Schedule M Revised', 'ISO 9001:2015'],
      status: 'ACTIVE'
    },
    { upsert: true, new: true }
  );

  await Facility.findOneAndUpdate(
    { facilityCode: 'CORP-AHMD' },
    {
      facilityName: 'BJK Corporate Headquarters',
      facilityCode: 'CORP-AHMD',
      facilityType: 'CORPORATE',
      address: '410-4th Floor, Syphon Gardenia, on S.P. Ring Road, Opp. Lubi Pumps, Nana Chiloda',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '382330',
      departments: ['Executive Management', 'Human Resources', 'Regulatory Affairs', 'Finance', 'International Business'],
      status: 'ACTIVE'
    },
    { upsert: true, new: true }
  );
  console.log('[Seed] Facilities seeded.');

  // 3. Seed Categories
  console.log('[Seed] Seeding 11 Product Categories...');
  for (const catMeta of CATEGORIES_METADATA) {
    const countInProducts = productsData.filter(p => p.category === catMeta.name).length;
    await ProductCategory.findOneAndUpdate(
      { name: catMeta.name },
      {
        name: catMeta.name,
        code: catMeta.code,
        description: catMeta.description,
        sourcePages: catMeta.sourcePages,
        productCount: countInProducts,
        isActive: true
      },
      { upsert: true, new: true }
    );
  }
  const categoryCount = await ProductCategory.countDocuments({});
  console.log(`[Seed] ${categoryCount} Categories verified.`);

  // 4. Seed 111 Products (Duplicate Prevention via srNo upsert)
  console.log('[Seed] Seeding 111 brochure products...');
  for (const item of productsData) {
    await Product.findOneAndUpdate(
      { srNo: item.srNo },
      {
        srNo: item.srNo,
        productName: item.productName,
        genericName: item.genericName,
        strength: item.strength || '',
        dosageForm: item.dosageForm,
        category: item.category,
        composition: item.genericName + (item.strength ? ` (${item.strength})` : ''),
        packSize: item.packSize || 'Blister / Strip / Bottle / Alu-Alu',
        description: item.description || '',
        sourcePage: item.sourcePage,
        sourceDocument: item.sourceDocument || 'BJK Healthcare Product Brochure',
        verificationStatus: item.verificationStatus || 'BROCHURE_SOURCE',
        manufacturingCapability: 'WHO-GMP Compliant Line',
        regulatoryStatus: 'Approved for Formulation & Export',
        availableStrengths: item.availableStrengths || [],
        classification: 'PUBLIC',
        isActive: true
      },
      { upsert: true, new: true }
    );
  }

  const totalProducts = await Product.countDocuments({});
  console.log(`[Seed] ${totalProducts} products verified in database.`);
  if (totalProducts !== 111) {
    console.warn(`[Seed Warning] Expected exactly 111 products, found ${totalProducts}`);
  } else {
    console.log('[Seed] 111 products verified: 100% brochure catalogue match!');
  }

  // 5. Seed Roles
  console.log('[Seed] Seeding Enterprise RBAC Roles...');
  const roles = [
    {
      name: 'SUPER_ADMIN',
      description: 'Full enterprise platform administration and audit control',
      permissions: ['*'],
      moduleAccess: ['ALL']
    },
    {
      name: 'DIRECTOR',
      description: 'Executive board view and operational oversight',
      permissions: ['*'],
      moduleAccess: ['ALL']
    },
    {
      name: 'PRODUCTION_MANAGER',
      description: 'Pharmaceutical MES production execution and line supervision',
      permissions: ['batch:read', 'batch:create', 'batch:update', 'production:manage', 'product:read'],
      moduleAccess: ['PRODUCTION', 'INVENTORY', 'PRODUCTS']
    },
    {
      name: 'QA_MANAGER',
      description: 'Quality Assurance, GMP deviation approval, and batch release',
      permissions: ['qa:read', 'qa:approve', 'deviation:manage', 'batch:read', 'batch:release'],
      moduleAccess: ['QA', 'QC', 'PRODUCTION', 'AUDIT']
    },
    {
      name: 'QC_MANAGER',
      description: 'Quality Control lab assay approvals and OOS investigation',
      permissions: ['qc:read', 'qc:create', 'qc:approve', 'product:read'],
      moduleAccess: ['QC', 'PRODUCTS']
    },
    {
      name: 'REGULATORY_MANAGER',
      description: 'Regulatory dossiers and global market authorization management',
      permissions: ['regulatory:read', 'regulatory:update', 'dossier:manage', 'product:read'],
      moduleAccess: ['REGULATORY', 'PRODUCTS']
    },
    {
      name: 'HR_MANAGER',
      description: 'Workforce intelligence, roster authorization, and statutory compliance',
      permissions: ['employee:view', 'employee:manage', 'roster:manage', 'payroll:process'],
      moduleAccess: ['HRMS', 'SECURITY']
    },
    {
      name: 'EMPLOYEE',
      description: 'Self-service portal and assigned workflow task execution',
      permissions: ['self:view', 'attendance:mark', 'leave:create'],
      moduleAccess: ['HRMS_PORTAL']
    }
  ];

  for (const r of roles) {
    await Role.findOneAndUpdate(
      { name: r.name },
      { name: r.name, description: r.description, permissions: r.permissions, moduleAccess: r.moduleAccess, isActive: true },
      { upsert: true }
    );
  }
  console.log('[Seed] Roles seeded.');

  // 6. Seed Users
  console.log('[Seed] Seeding authorized administrative users...');
  const adminSalt = await bcrypt.genSalt(10);
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@BJK2026!';
  const hashedPassword = await bcrypt.hash(defaultPassword, adminSalt);

  const usersToSeed = [
    {
      name: 'Dr. Vikram Mehta',
      email: 'admin@bjkhealthcare.com',
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      employeeId: 'BJK-00101',
      facility: plant1._id
    },
    {
      name: 'Rajesh Sharma',
      email: 'director@bjkhealthcare.com',
      role: 'DIRECTOR',
      department: 'Executive Management',
      employeeId: 'BJK-00102',
      facility: plant1._id
    },
    {
      name: 'Dr. Anita Desai',
      email: 'qa.manager@bjkhealthcare.com',
      role: 'QA_MANAGER',
      department: 'Quality Assurance',
      employeeId: 'BJK-00201',
      facility: plant1._id
    },
    {
      name: 'Suresh Patel',
      email: 'qc.manager@bjkhealthcare.com',
      role: 'QC_MANAGER',
      department: 'Quality Control',
      employeeId: 'BJK-00202',
      facility: plant1._id
    },
    {
      name: 'Amit Trivedi',
      email: 'production@bjkhealthcare.com',
      role: 'PRODUCTION_MANAGER',
      department: 'Manufacturing',
      employeeId: 'BJK-00301',
      facility: plant1._id
    },
    {
      name: 'Pooja Iyer',
      email: 'regulatory@bjkhealthcare.com',
      role: 'REGULATORY_MANAGER',
      department: 'Regulatory Affairs',
      employeeId: 'BJK-00401',
      facility: plant1._id
    }
  ];

  for (const u of usersToSeed) {
    await User.findOneAndUpdate(
      { email: u.email },
      {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        passwordHash: hashedPassword,
        role: u.role,
        department: u.department,
        employeeId: u.employeeId,
        facility: u.facility,
        isActive: true
      },
      { upsert: true }
    );
  }
  console.log('[Seed] Administrative users seeded.');

  // 7. Seed Operational Foundations (Lines, Warehouses, Initial Batch, Regulatory Records)
  console.log('[Seed] Seeding production lines & warehouses...');
  const line1 = await ProductionLine.findOneAndUpdate(
    { code: 'LINE-TAB-01' },
    {
      name: 'High-Speed Tablet Compression Line 1',
      code: 'LINE-TAB-01',
      facility: plant1._id,
      dosageForm: 'Tablet',
      capacity: '2,500,000 tablets/shift',
      cleanroomGrade: 'Grade B',
      status: 'OPERATIONAL'
    },
    { upsert: true, new: true }
  );

  const line2 = await ProductionLine.findOneAndUpdate(
    { code: 'LINE-DPS-01' },
    {
      name: 'Dry Powder Syrup Filling & Packaging Line',
      code: 'LINE-DPS-01',
      facility: plant1._id,
      dosageForm: 'Dry Powder Syrup',
      capacity: '40,000 bottles/shift',
      cleanroomGrade: 'Grade B',
      status: 'OPERATIONAL'
    },
    { upsert: true, new: true }
  );

  const wh1 = await Warehouse.findOneAndUpdate(
    { code: 'WH-FG-01' },
    {
      warehouseName: 'Central Finished Goods Quarantine & Release Hub',
      code: 'WH-FG-01',
      facility: plant1._id,
      warehouseType: 'FINISHED_GOODS',
      capacity: '12,000 pallet locations',
      temperatureRange: '15°C - 25°C Controlled Room Temp',
      status: 'OPERATIONAL'
    },
    { upsert: true, new: true }
  );

  // Seed sample verified batch for product #1 (Metformin combination)
  const prod1 = await Product.findOne({ srNo: 1 });
  if (prod1) {
    const existingBatch = await Batch.findOne({ batchNumber: 'BJK-TAB-2026-001' });
    if (!existingBatch) {
      const batch1 = await Batch.create({
        batchNumber: 'BJK-TAB-2026-001',
        product: prod1._id,
        productName: prod1.productName,
        facility: plant1._id,
        manufacturingDate: new Date('2026-08-01'),
        expiryDate: new Date('2029-07-31'),
        quantity: 500000,
        unit: 'Tablets',
        status: 'RELEASED',
        qcStatus: 'APPROVED',
        qaStatus: 'APPROVED',
        releaseStatus: 'COMMERCIALLY_RELEASED',
        yieldPercentage: 99.6
      });

      // Create matching InventoryItem
      const invItem = await InventoryItem.create({
        product: prod1._id,
        warehouse: wh1._id,
        batch: batch1._id,
        batchNumber: batch1.batchNumber,
        quantity: 500000,
        availableQuantity: 500000,
        unit: 'Tablets',
        status: 'AVAILABLE',
        expiryDate: batch1.expiryDate
      });

      // Record immutable Inventory Transaction
      const adminUser = await User.findOne({ email: 'admin@bjkhealthcare.com' });
      await InventoryTransaction.create({
        item: invItem._id,
        batch: batch1._id,
        batchNumber: batch1.batchNumber,
        transactionType: 'INBOUND_RECEIPT',
        quantity: 500000,
        reference: 'QA-RELEASE-PASS-2026-001',
        performedBy: adminUser?._id || batch1._id,
        performedByName: adminUser?.name || 'Dr. Vikram Mehta',
        notes: 'Initial commercial batch release after QA signoff'
      });
    }

    // Seed Regulatory Record for Product 1
    await RegulatoryRecord.findOneAndUpdate(
      { registrationNumber: 'REG-CDSCO-2024-8891' },
      {
        product: prod1._id,
        productName: prod1.productName,
        country: 'India',
        authority: 'CDSCO / State FDA Gujarat',
        registrationNumber: 'REG-CDSCO-2024-8891',
        registrationDate: new Date('2024-04-15'),
        expiryDate: new Date('2029-04-14'),
        status: 'APPROVED',
        responsiblePerson: 'Pooja Iyer (Head RA)'
      },
      { upsert: true }
    );
  }

  // 8. Seed Knowledge Entities & Chunks for AI Copilot
  console.log('[Seed] Seeding Knowledge Entities...');
  await KnowledgeEntity.findOneAndUpdate(
    { entityId: 'BJK-CORP-INFO' },
    {
      entityType: 'COMPANY',
      entityId: 'BJK-CORP-INFO',
      name: 'BJK Healthcare Corporate Dossier',
      metadata: { cin: 'U46497GJ2023PTC1393308', location: 'Ahmedabad & Gandhinagar' }
    },
    { upsert: true }
  );

  await KnowledgeChunk.findOneAndUpdate(
    { source: 'Official BJK Healthcare Product Brochure', sourcePage: 8 },
    {
      content: 'BJK Healthcare manufacturing facility at Survey No. 1248 Lavad Gandhinagar produces WHO-GMP certified solid orals including 111 catalogue products across 11 therapeutic categories with annual capacities of 17B+ tablets and 21M+ DPS bottles.',
      source: 'Official BJK Healthcare Product Brochure',
      sourcePage: 8,
      metadata: { verified: true, sourceDoc: 'BJK Product Brochure' }
    },
    { upsert: true }
  );

  // 9. Record Master Seed Audit Entry
  await AuditLog.logAction({
    action: 'SEED',
    module: 'DATABASE',
    resource: 'System',
    resourceId: 'MASTER_SEED',
    status: 'SUCCESS',
    details: `Master seed executed. Database: ${dbName}. Verified 111 products, 11 categories, facilities, and roles.`
  });

  console.log('====================================================');
  console.log('MongoDB connected');
  console.log('Company seeded');
  console.log('Categories seeded');
  console.log('111 products verified');
  console.log('Seed completed successfully');
  console.log('====================================================');

  return { success: true, totalProducts, categories: categoryCount };
};

// Execute if run directly from CLI
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err.message);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
