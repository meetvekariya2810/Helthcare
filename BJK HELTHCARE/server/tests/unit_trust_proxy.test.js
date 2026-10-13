const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const http = require('http');

function createTestAppWithHops(hops, nodeEnv = 'production') {
  const prevHops = process.env.TRUST_PROXY_HOPS;
  const prevEnv = process.env.NODE_ENV;

  try {
    if (hops !== undefined) {
      process.env.TRUST_PROXY_HOPS = String(hops);
    } else {
      delete process.env.TRUST_PROXY_HOPS;
    }
    process.env.NODE_ENV = nodeEnv;

    const resolveTrustProxy = () => {
      const h = process.env.TRUST_PROXY_HOPS;
      if (h !== undefined && h !== '') {
        if (h === 'true') return true;
        if (h === 'false') return false;
        const num = Number(h);
        if (!Number.isNaN(num)) return num;
        return h;
      }
      return process.env.NODE_ENV === 'production' ? 1 : false;
    };

    const app = express();
    app.set('trust proxy', resolveTrustProxy());
    return { app, trustProxySetting: app.get('trust proxy') };
  } finally {
    if (prevHops !== undefined) process.env.TRUST_PROXY_HOPS = prevHops;
    else delete process.env.TRUST_PROXY_HOPS;
    process.env.NODE_ENV = prevEnv;
  }
}

test('Trust Proxy: Defaults to 1 hop in production when TRUST_PROXY_HOPS is unset', () => {
  const { trustProxySetting } = createTestAppWithHops(undefined, 'production');
  assert.strictEqual(trustProxySetting, 1, 'Production default must be 1 hop');
});

test('Trust Proxy: Defaults to false outside production when TRUST_PROXY_HOPS is unset', () => {
  const { trustProxySetting } = createTestAppWithHops(undefined, 'development');
  assert.strictEqual(trustProxySetting, false, 'Non-production default must be false');
});

test('Trust Proxy: Honors explicit numeric TRUST_PROXY_HOPS', () => {
  const { trustProxySetting: hops2 } = createTestAppWithHops(2);
  assert.strictEqual(hops2, 2, 'Must configure 2 hops');

  const { trustProxySetting: hops0 } = createTestAppWithHops(0);
  assert.strictEqual(hops0, 0, 'Must configure 0 hops');
});

test('Trust Proxy: Honors boolean TRUST_PROXY_HOPS', () => {
  const { trustProxySetting: tVal } = createTestAppWithHops('true');
  assert.strictEqual(tVal, true, 'Must configure boolean true');

  const { trustProxySetting: fVal } = createTestAppWithHops('false');
  assert.strictEqual(fVal, false, 'Must configure boolean false');
});

test('Trust Proxy: Honors string subnet/loopback TRUST_PROXY_HOPS', () => {
  const { trustProxySetting: loopback } = createTestAppWithHops('loopback');
  assert.strictEqual(loopback, 'loopback', 'Must configure loopback string');
});

test('Trust Proxy: Correctly resolves client IP from X-Forwarded-For with 1 hop', async () => {
  const { app } = createTestAppWithHops(1, 'production');
  let capturedIp = null;

  app.get('/test-ip', (req, res) => {
    capturedIp = req.ip;
    res.json({ ip: req.ip });
  });

  const server = http.createServer(app);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/test-ip`, {
      headers: {
        'X-Forwarded-For': '203.0.113.195'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(capturedIp, '203.0.113.195', 'req.ip must reflect the upstream client IP');
  } finally {
    server.close();
  }
});
