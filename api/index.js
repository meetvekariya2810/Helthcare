// BJK Healthcare Digital Brain - Vercel Serverless Function Entrypoint (ESM)
import handler from './handler.cjs';

export default async function (req, res) {
  return handler(req, res);
}

