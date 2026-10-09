const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testEmployeeAuth() {
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

  console.log('Testing Employee Login via /auth/login with employee@bjkhealthcare.com...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' }
  });
  console.log('Login Status:', loginRes.status);
  console.log('Login Result:', JSON.stringify(loginRes.data, null, 2));

  if (!loginRes.data?.token) {
    console.error('No token returned!');
    return;
  }

  const token = loginRes.data.token;

  console.log('\nTesting /auth/me with token...');
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Auth Me Status:', meRes.status);
  console.log('Auth Me Result:', JSON.stringify(meRes.data, null, 2));

  console.log('\nTesting /employee/auth/me with the same token...');
  const empMeRes = await request('/employee/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Employee Auth Me Status:', empMeRes.status);
  console.log('Employee Auth Me Result:', JSON.stringify(empMeRes.data, null, 2));

  console.log('\nTesting Login with BH1046...');
  const bhLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { identifier: 'BH1046', password: 'Password123!' }
  });
  console.log('BH1046 Login Status:', bhLoginRes.status);
  console.log('BH1046 Login Result:', JSON.stringify(bhLoginRes.data, null, 2));

  if (bhLoginRes.data?.token) {
    console.log('\nTesting /employee/auth/me with BH1046 token...');
    const bhEmpMeRes = await request('/employee/auth/me', {
      headers: { Authorization: `Bearer ${bhLoginRes.data.token}` }
    });
    console.log('BH1046 Employee Auth Me Status:', bhEmpMeRes.status);
    console.log('BH1046 Employee Auth Me Result:', JSON.stringify(bhEmpMeRes.data, null, 2));
  }
}

testEmployeeAuth().catch(console.error);
