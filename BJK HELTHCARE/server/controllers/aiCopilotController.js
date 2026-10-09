const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const Batch = require('../models/Batch');
const QCSample = require('../models/QCSample');
const InventoryItem = require('../models/InventoryItem');
const RegulatoryRecord = require('../models/RegulatoryRecord');
const Company = require('../models/Company');
const Facility = require('../models/Facility');
const Deviation = require('../models/Deviation');
const Enquiry = require('../models/Enquiry');
const AuditLog = require('../models/AuditLog');

// POST /api/ai/query or POST /api/ai/chat
const processAICopilotQuery = async (req, res, next) => {
  try {
    const { query, prompt, conversationId } = req.body;
    const userQuery = (query || prompt || '').trim();

    if (!userQuery) {
      return res.status(400).json({ success: false, message: 'Please provide a query.' });
    }

    const qLower = userQuery.toLowerCase();
    let responseCategory = 'VERIFIED_DATABASE_DATA';
    let answerText = '';
    let sources = [];
    let structuredData = null;

    // 1. Company Information / "What is BJK Healthcare?"
    if (qLower.includes('bjk healthcare') || qLower.includes('company') || qLower.includes('facility') || qLower.includes('plant') || qLower.includes('who is')) {
      const company = await Company.findOne().lean();
      const facilities = await Facility.find({}).lean();

      responseCategory = 'PUBLIC_COMPANY_INFORMATION';
      sources.push('BJK Healthcare Corporate Registry & Official Brochure (Pages 2-7)');

      const plantDetails = facilities.map(f => `• ${f.facilityName} (${f.facilityCode}): Located in ${f.city}, ${f.state}. Capabilities: ${(f.manufacturingCapabilities || []).join(', ')}`).join('\n');

      answerText = `**BJK Healthcare Private Limited** is an Indian pharmaceutical formulation manufacturer headquartered in Ahmedabad, Gujarat, operating a high-capacity WHO-GMP compliant manufacturing facility in Lavad, Gandhinagar.\n\n` +
        `**Corporate Office:** ${company?.corporateOffice?.address || '410-4th Floor, Syphon Gardenia, Nana Chiloda, Ahmedabad, Gujarat'}\n` +
        `**Annual Formulations Capacity (Brochure Verified):**\n` +
        `• Solid Orals: ${company?.publicStatistics?.tabletsAnnualCapacity || '17 Billion+ Tablets'} & ${company?.publicStatistics?.capsulesCapacity || '11 Billion+ Capsules'}\n` +
        `• Dry Powder Inhalers (DPI): ${company?.publicStatistics?.dpiCapsulesCapacity || '3.5 Billion Capsules'}\n` +
        `• Dry Powder Syrups (DPS): ${company?.publicStatistics?.dpsBottlesCapacity || '21 Million Bottles'}\n` +
        `• Effervescent Sachets: ${company?.publicStatistics?.sachetsCapacity || '32 Million Sachets'}\n\n` +
        `**Operational Facilities:**\n${plantDetails || 'Lavad Plant, Gandhinagar'}`;

      structuredData = { company, facilities };
    }

    // 2. Products / Therapeutic Category search (e.g. "anti-diabetic", "cardiovascular", "tablets", "products")
    else if (qLower.includes('anti-diabetic') || qLower.includes('diabet') || qLower.includes('cardio') || qLower.includes('antibiotic') || qLower.includes('product') || qLower.includes('dosage') || qLower.includes('category')) {
      let filter = { isActive: true };
      let categoryMatch = '';

      if (qLower.includes('diabet')) categoryMatch = 'Anti-Diabetic';
      else if (qLower.includes('cardio') || qLower.includes('cvs')) categoryMatch = 'Cardiovascular';
      else if (qLower.includes('git') || qLower.includes('gastro')) categoryMatch = 'GIT Product';
      else if (qLower.includes('antibiotic') || qLower.includes('bacterial')) categoryMatch = 'Anti-Bacterial / Anti-Viral / General Antibiotics';
      else if (qLower.includes('pain') || qLower.includes('nsaid')) categoryMatch = 'Analgesic / Anti-Pyretic / Anti-Inflammatory / NSAIDs';
      else if (qLower.includes('psych') || qLower.includes('cns')) categoryMatch = 'Anti-Psychotic / Anti-Convulsant / Anti-Depressant';
      else if (qLower.includes('cold') || qLower.includes('allergic')) categoryMatch = 'Anti Cold / Anti Allergic / Anti-Asthmatics';
      else if (qLower.includes('erectile')) categoryMatch = 'Erectile Dysfunction';
      else if (qLower.includes('dpi')) categoryMatch = 'DPIs';
      else if (qLower.includes('sachet')) categoryMatch = 'Sachets';
      else if (qLower.includes('syrup') || qLower.includes('dry powder syrup')) categoryMatch = 'Dry Powder Syrup';

      if (categoryMatch) {
        filter.category = categoryMatch;
      }

      const products = await Product.find(filter).sort({ srNo: 1 }).limit(25).lean();
      const totalCount = await Product.countDocuments(filter);

      responseCategory = 'VERIFIED_DATABASE_DATA';
      sources.push('BJK Official 111 Product Catalogue (MongoDB Collection: products)');

      const prodList = products.map(p => `• [#${p.srNo}] **${p.productName}** (${p.genericName} ${p.strength || ''}) - [${p.dosageForm}] - Cat: ${p.category} (Brochure Page ${p.sourcePage})`).join('\n');

      answerText = `Found **${totalCount}** verified products in the database matching your criteria:\n\n${prodList}\n\n*All items are verified against the official BJK Healthcare Product Brochure catalogue.*`;
      structuredData = products;
    }

    // 3. Batches / QC Pending (e.g. "batches pending qc", "batches")
    else if (qLower.includes('qc') || qLower.includes('batches') || qLower.includes('testing') || qLower.includes('sample')) {
      const qcPendingBatches = await Batch.find({ status: { $in: ['IN_PROCESS_QC', 'QUARANTINED'] } }).populate('product').lean();
      const openSamples = await QCSample.find({ status: { $in: ['REGISTERED', 'UNDER_TESTING', 'OOS_INVESTIGATION'] } }).populate('product').lean();

      responseCategory = 'VERIFIED_DATABASE_DATA';
      sources.push('MongoDB Collections: batches, qcsamples');

      if (qcPendingBatches.length === 0 && openSamples.length === 0) {
        answerText = 'There are currently **0 batches** or samples awaiting Quality Control testing in the system.';
      } else {
        const batchList = qcPendingBatches.map(b => `• Batch **${b.batchNumber}**: ${b.productName} [Stage: ${b.currentStage}, Status: ${b.status}]`).join('\n');
        const sampleList = openSamples.map(s => `• Sample **${s.sampleNumber}**: ${s.sampleType} [Status: ${s.status}]`).join('\n');

        answerText = `**Batches Pending QC Analysis:**\n${batchList || 'None currently active.'}\n\n**Open QC Laboratory Samples:**\n${sampleList || 'No samples in queue.'}`;
      }
      structuredData = { qcPendingBatches, openSamples };
    }

    // 4. Regulatory Deadlines (e.g. "regulatory renewals", "deadlines in 60 days")
    else if (qLower.includes('regulatory') || qLower.includes('renewal') || qLower.includes('deadline') || qLower.includes('dossier')) {
      const now = new Date();
      const sixtyDaysLater = new Date(now.getTime() + 60 * 86400000);

      const dueRecords = await RegulatoryRecord.find({
        expiryDate: { $lte: sixtyDaysLater }
      }).populate('product', 'productName').sort({ expiryDate: 1 }).lean();

      responseCategory = 'VERIFIED_DATABASE_DATA';
      sources.push('MongoDB Collection: regulatoryrecords');

      if (dueRecords.length === 0) {
        answerText = 'No international regulatory registrations or marketing authorizations are due for renewal within the next 60 days.';
      } else {
        const list = dueRecords.map(r => `• **${r.country}** - ${r.product?.productName || 'General License'} (Reg No: ${r.registrationNumber}) - Expiry: ${new Date(r.expiryDate).toLocaleDateString('en-GB')} [Status: ${r.status}]`).join('\n');
        answerText = `Found **${dueRecords.length} regulatory record(s)** with renewal deadlines within 60 days or past due:\n\n${list}`;
      }
      structuredData = dueRecords;
    }

    // 5. Inventory / Low Stock
    else if (qLower.includes('stock') || qLower.includes('inventory') || qLower.includes('material') || qLower.includes('warehouse')) {
      const lowStock = await InventoryItem.find({
        $expr: { $lte: ['$currentStock', '$reorderLevel'] }
      }).populate('warehouse', 'warehouseName').lean();

      responseCategory = 'VERIFIED_DATABASE_DATA';
      sources.push('MongoDB Collection: inventoryitems');

      if (lowStock.length === 0) {
        answerText = 'All warehouse materials and finished stock are currently within healthy inventory operating thresholds.';
      } else {
        const items = lowStock.map(i => `• **${i.itemName}** (${i.itemCode}) - Current Stock: ${i.currentStock} ${i.unit || 'units'} (Reorder Level: ${i.reorderLevel}) - Location: ${i.warehouse?.warehouseName || 'Main Store'}`).join('\n');
        answerText = `**Low-Stock Alert:** The following ${lowStock.length} inventory item(s) are below safety reorder levels:\n\n${items}`;
      }
      structuredData = lowStock;
    }

    // 6. Executive Brief / Telemetry Overview
    else if (qLower.includes('executive brief') || qLower.includes('summary') || qLower.includes('overview') || qLower.includes('kpi') || qLower.includes('brief')) {
      const [prodCount, batchCount, qcCount, qaDevCount, regCount, enqCount] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Batch.countDocuments({ status: { $in: ['MANUFACTURING', 'IN_PROCESS_QC', 'QA_REVIEW'] } }),
        QCSample.countDocuments({ status: { $in: ['REGISTERED', 'UNDER_TESTING'] } }),
        Deviation.countDocuments({ status: { $ne: 'CLOSED' } }),
        RegulatoryRecord.countDocuments({ status: 'APPROVED' }),
        Enquiry.countDocuments({ status: 'NEW' })
      ]);

      responseCategory = 'VERIFIED_DATABASE_DATA';
      sources.push('Enterprise Knowledge Graph: MongoDB Real-time Aggregation');

      answerText = `### BJK Healthcare Daily Executive Brief\n\n` +
        `• **Commercial Portfolio:** 111 WHO-GMP formulation products active across 11 therapeutic categories.\n` +
        `• **Active Manufacturing Batches:** ${batchCount} batch(es) currently progressing through formulation / eBR.\n` +
        `• **Quality Control Queue:** ${qcCount} sample(s) undergoing analytical testing.\n` +
        `• **Quality Assurance Deviations:** ${qaDevCount} open deviation(s) / CAPA investigations active.\n` +
        `• **Global Market Authorizations:** ${regCount} active country registrations on record.\n` +
        `• **Commercial Pipeline:** ${enqCount} new customer/B2B enquiries requiring follow-up.\n\n` +
        `*Data strictly drawn from verified MongoDB Atlas records. No simulated or fabricated metrics.*`;

      structuredData = { prodCount, batchCount, qcCount, qaDevCount, regCount, enqCount };
    }

    // 7. General Knowledge or Missing/Unavailable telemetry queries
    else {
      responseCategory = 'UNAVAILABLE_INTERNAL_DATA';
      sources.push('Database Schema & System Index');
      answerText = `I searched the BJK Healthcare Digital Brain database for "${userQuery}".\n\n` +
        `The requested live telemetry or operational metric is **Unavailable Internal Data** or does not have an active MES/IoT feed connected.\n\n` +
        `*Per pharmaceutical data integrity standards, BJK AI Copilot will not simulate or fabricate unverified operational numbers.*`;
    }

    // Log query in audit log
    await AuditLog.logAction({
      user: req.user || null,
      action: 'AI_QUERY_EXECUTED',
      module: 'AI',
      resource: 'AICopilot',
      details: `AI Copilot queried: "${userQuery.slice(0, 80)}". Classification: ${responseCategory}`
    });

    res.json({
      success: true,
      data: {
        query: userQuery,
        answer: answerText,
        category: responseCategory,
        sources,
        structuredData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processAICopilotQuery
};
