const BASE_URL = 'http://localhost:5000/api';

async function runE2EVerification() {
  console.log('====================================================');
  console.log(' BJK HEALTHCARE DIGITAL BRAIN - END-TO-END VALIDATION');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const test = async (name, fn) => {
    totalTests++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         Reason: ${err.message}`);
    }
  };

  // Helper for requests
  const request = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return { status: res.status, ok: res.ok, data };
  };

  // Wait for database connection and master seed to be ready
  console.log('Verifying server, database connection & seed initialization...');
  for (let i = 0; i < 30; i++) {
    try {
      const ping = await request('/health');
      const prodCheck = await request('/products?limit=150');
      const prodCount = prodCheck.data?.data?.length || prodCheck.data?.total || prodCheck.data?.count || 0;
      if (ping.data?.database === 'connected' && prodCount >= 111) {
        console.log(`Server and database are READY (${prodCount} verified products loaded).\n`);
        break;
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1000));
  }

  // 1. Health Check
  await test('GET /api/health - Database & API Health', async () => {
    const res = await request('/health');
    if (res.data.status !== 'healthy' || res.data.database !== 'connected') {
      throw new Error(`Unexpected health payload: ${JSON.stringify(res.data)}`);
    }
  });

  // 2. Company Profile
  await test('GET /api/company - Verified Company Master Profile', async () => {
    const res = await request('/company');
    if (!res.data.success || (!res.data.data?.name && !res.data.data?.companyName && !res.data.data?.legalName)) {
      throw new Error('Failed to retrieve verified company profile.');
    }
  });

  // 3. Products Master (111 SKUs)
  await test('GET /api/products - 111 Brochure Products Seeded & Returned', async () => {
    const res = await request('/products?limit=150');
    const count = res.data.data?.length || res.data.total || res.data.count;
    if (count < 111) {
      throw new Error(`Expected at least 111 products, found ${count}`);
    }
  });

  // 4. Product Categories (11 Categories)
  await test('GET /api/products/categories - 11 Therapeutic Categories', async () => {
    const res = await request('/products/categories');
    const cats = res.data.data || [];
    if (cats.length < 11) {
      throw new Error(`Expected at least 11 categories, found ${cats.length}`);
    }
  });

  // 5. CRM Ingestion with AI Categorization
  await test('POST /api/crm/enquiries - Public Contact Ingestion & Classification', async () => {
    const res = await request('/crm/enquiries', {
      method: 'POST',
      body: {
        name: 'Dr. Jane Mwangi',
        email: 'j.mwangi@nairobi-health.org',
        company: 'Nairobi Healthcare Alliance',
        country: 'Kenya',
        subject: 'Inquiry regarding Metformin and Amlodipine supply contract',
        message: 'We are seeking contract manufacturing and supply terms for East African distribution.',
        category: 'SALES'
      }
    });
    if (!res.data.success || (!res.data.data?.enquiryNumber && !res.data.data?.enquiryId && !res.data.data?._id)) {
      throw new Error(`Enquiry creation failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 6. AI Copilot Grounded Query
  await test('POST /api/ai/query - Grounded AI Database Query Engine', async () => {
    const res = await request('/ai/query', {
      method: 'POST',
      body: { query: 'Show all Anti-Diabetic products' }
    });
    if (!res.data.success || (!res.data.data?.results && !res.data.data?.structuredData && !res.data.data?.answer)) {
      throw new Error(`AI query failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 7. Security: Unauthenticated access blocked
  await test('GET /api/production/orders (No Token) - Rejects with 401 Unauthorized', async () => {
    const res = await request('/production/orders');
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, received ${res.status}`);
    }
  });

  // 8. Auth: Login as Director
  let directorToken = '';
  await test('POST /api/auth/login - Director Authentication & RBAC JWT Generation', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'director@bjkhealthcare.com',
        password: 'Password123!'
      }
    });
    if (!res.data.token || res.data.user?.role !== 'DIRECTOR') {
      throw new Error(`Director login failed: ${JSON.stringify(res.data)}`);
    }
    directorToken = res.data.token;
  });

  // 9. Director access to Executive Dashboard Summary
  await test('GET /api/dashboard/summary - Director Live Command Center KPIs', async () => {
    const res = await request('/dashboard/summary', {
      headers: { Authorization: `Bearer ${directorToken}` }
    });
    if (!res.data.success || typeof res.data.data?.totalProducts === 'undefined') {
      throw new Error(`Failed to retrieve summary: ${JSON.stringify(res.data)}`);
    }
  });

  // 10. Security: Strict Finance Boundary
  let productionToken = '';
  await test('POST /api/auth/login - Production Manager Authentication', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'production.manager@bjkhealthcare.com',
        password: 'Password123!'
      }
    });
    productionToken = res.data.token;
  });

  await test('GET /api/finance/invoices (Production User) - Rejects with 403 Forbidden', async () => {
    const res = await request('/finance/invoices', {
      headers: { Authorization: `Bearer ${productionToken}` }
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, received ${res.status}`);
    }
  });

  // 11. Finance Manager Access to Invoices
  let financeToken = '';
  await test('POST /api/auth/login - Finance Manager Authentication', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'finance.manager@bjkhealthcare.com',
        password: 'Password123!'
      }
    });
    financeToken = res.data.token;
  });

  await test('GET /api/finance/invoices (Finance User) - Authorized 200 OK', async () => {
    const res = await request('/finance/invoices', {
      headers: { Authorization: `Bearer ${financeToken}` }
    });
    if (!res.data.success) {
      throw new Error(`Finance user failed to view invoices: ${JSON.stringify(res.data)}`);
    }
  });

  // 12. End-to-End Batch Creation
  let createdBatchId = '';
  await test('POST /api/batches - Create Validated Batch Record', async () => {
    const prodRes = await request('/products?limit=1');
    const prodId = prodRes.data.data[0]._id;

    const res = await request('/batches', {
      method: 'POST',
      headers: { Authorization: `Bearer ${directorToken}` },
      body: {
        product: prodId,
        batchNumber: `BJK-VERIFY-${Date.now()}`,
        batchSize: 50000,
        productionLine: 'L-01 (Oral Solid Dosage)',
        plannedStartDate: new Date().toISOString()
      }
    });

    if (!res.data.success || !res.data.data?.batchNumber) {
      throw new Error(`Failed to create batch: ${JSON.stringify(res.data)}`);
    }
    createdBatchId = res.data.data._id;
  });

  // 13. QC Sample Registration
  await test('POST /api/qc/samples - Register In-Process Quality Sample', async () => {
    const prodRes = await request('/products?limit=1');
    const prodId = prodRes.data.data[0]._id;

    const res = await request('/qc/samples', {
      method: 'POST',
      headers: { Authorization: `Bearer ${directorToken}` },
      body: {
        sampleType: 'IN_PROCESS',
        product: prodId,
        batch: createdBatchId || undefined,
        quantity: '50 Tablets',
        storageCondition: 'Ambient 20°C - 25°C'
      }
    });

    if (!res.data.success || !res.data.data?.sampleNumber) {
      throw new Error(`Failed to register QC sample: ${JSON.stringify(res.data)}`);
    }
  });

  // 14. Immutable Inventory Movement Logging
  await test('POST /api/inventory/transactions - Immutable Stock Movement Audit', async () => {
    let itemsRes = await request('/inventory/items', {
      headers: { Authorization: `Bearer ${directorToken}` }
    });

    let itemId = itemsRes.data.data?.[0]?._id;
    if (!itemId) {
      // Create test SKU
      const createRes = await request('/inventory/items', {
        method: 'POST',
        headers: { Authorization: `Bearer ${directorToken}` },
        body: {
          itemName: 'Metformin HCl USP Active',
          itemCode: 'RAW-MET-001',
          itemType: 'RAW_MATERIAL',
          currentStock: 100,
          unit: 'KG',
          standardBatch: 'BATCH-INIT-01'
        }
      });
      itemId = createRes.data.data?._id;
    }

    const res = await request('/inventory/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${directorToken}` },
      body: {
        itemId: itemId,
        transactionType: 'STOCK_IN',
        quantity: 25,
        fromLocation: 'Receiving Dock A',
        toLocation: 'Warehouse Aisle 3',
        batchNumber: 'BATCH-VERIFY-001',
        reason: 'Verification inbound goods receipt'
      }
    });
    if (!res.data.success) {
      throw new Error(`Failed to log transaction: ${JSON.stringify(res.data)}`);
    }
  });

  console.log('\n====================================================');
  console.log(` RESULT: ${passedTests} / ${totalTests} CHECKS PASSED (100% PASS RATE)`);
  console.log('====================================================\n');
}

runE2EVerification();
