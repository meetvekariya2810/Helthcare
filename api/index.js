// BJK Healthcare Digital Brain - Vercel Serverless Function Entrypoint
const handler = require('./handler.cjs');

function serverlessEntry(req, res) {
  return handler(req, res);
}

module.exports = serverlessEntry;
module.exports.default = serverlessEntry;


