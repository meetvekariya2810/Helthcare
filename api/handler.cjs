// BJK Healthcare Digital Brain - CommonJS Backend Handler for Vercel Serverless
process.env.VERCEL = '1';

let app;
let initError = null;

try {
  app = require('../BJK HELTHCARE/server/server.js');
} catch (err) {
  initError = err;
  console.error('[Vercel Serverless Handler Init Error]:', err);
}

module.exports = function serverlessHandler(req, res) {
  if (initError || !app) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: 'Backend Initialization Error',
      message: initError ? initError.message : 'Server application failed to load.'
    }));
  }

  return app(req, res);
};

