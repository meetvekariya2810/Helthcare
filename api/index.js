import { createRequire } from 'node:module';

// Ensure serverless mode is explicitly active when invoked from Vercel function handler
if (!process.env.VERCEL) {
  process.env.VERCEL = '1';
}

// Resolve require from server directory to guarantee all server dependencies resolve properly
const serverRequire = createRequire(new URL('../BJK HELTHCARE/server/server.js', import.meta.url));

const app = serverRequire('./server.js');

export default app;
