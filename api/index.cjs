// BJK Healthcare Digital Brain - Vercel Serverless Function Entrypoint (CommonJS)
process.env.VERCEL = '1';

const app = require('../BJK HELTHCARE/server/server.js');

module.exports = app;
