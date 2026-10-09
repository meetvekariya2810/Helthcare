const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, local DNS resolvers often refuse SRV records for Atlas clusters.
// Pre-configure public DNS resolvers to ensure reliable Atlas connection.
try {
  const currentServers = dns.getServers();
  if (!currentServers || currentServers.length === 0 || currentServers.some(s => s.startsWith('127.') || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
} catch (_) {}

let isConnected = false;
let memoryServerInstance = null;

const maskUri = (uri) => {
  if (!uri) return 'undefined';
  try {
    const atIndex = uri.lastIndexOf('@');
    const slashIndex = uri.indexOf('://');
    if (slashIndex !== -1 && atIndex !== -1 && atIndex > slashIndex + 3) {
      const creds = uri.substring(slashIndex + 3, atIndex);
      const colonIndex = creds.indexOf(':');
      if (colonIndex !== -1) {
        const user = creds.substring(0, colonIndex);
        return uri.substring(0, slashIndex + 3) + user + ':****' + uri.substring(atIndex);
      }
      return uri.substring(0, slashIndex + 3) + '****' + uri.substring(atIndex);
    }
    return uri;
  } catch (_) {
    return 'mongodb+srv://[masked]';
  }
};

const connectDB = async (retryCount = 0, maxRetries = 3, allowFallback = false) => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  const configuredUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bjk_healthcare';
  const isAtlas = configuredUri.includes('mongodb+srv') || configuredUri.includes('.mongodb.net');
  const dbName = process.env.DATABASE_NAME || 'bjk_healthcare';

  // Configure Mongoose global options
  mongoose.set('strictQuery', false);

  // Connection options for production stability
  const mongooseOptions = {
    dbName: dbName,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 12000,
    socketTimeoutMS: 45000,
    autoIndex: true,
  };

  // Setup connection event listeners once
  if (!mongoose.connection.listenerCount('error')) {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log(`[BJK Digital Brain] MongoDB state: CONNECTED [DB: ${mongoose.connection.name}]`);
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      console.error('[BJK Digital Brain] MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[BJK Digital Brain] MongoDB state: DISCONNECTED');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[BJK Digital Brain] MongoDB state: RECONNECTED');
    });
  }

  // 1. Attempt primary MongoDB connection (Atlas cluster or configured URI)
  try {
    const masked = maskUri(configuredUri);
    console.log(`[BJK Digital Brain] Connecting to MongoDB (${isAtlas ? 'MongoDB Atlas [Cluster28]' : 'Local/Direct'})...`);

    const conn = await mongoose.connect(configuredUri, mongooseOptions);
    isConnected = true;

    if (isAtlas) {
      console.log(`[BJK Digital Brain] MongoDB Atlas connected successfully to cluster! Database: ${conn.connection.name}`);
    } else {
      console.log(`[BJK Digital Brain] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    }

    return conn;
  } catch (primaryError) {
    console.error(`[BJK Digital Brain] MongoDB connection attempt ${retryCount + 1} failed:`, primaryError.message);

    // If querySrv failed, configure public DNS and retry
    if (primaryError.message.includes('querySrv') && retryCount < 2) {
      console.log('[BJK Digital Brain] Retrying connection using public DNS resolvers (8.8.8.8, 1.1.1.1)...');
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch (_) {}
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return connectDB(retryCount + 1, maxRetries, allowFallback);
    }

    // If Atlas was explicitly configured, retry or fail cleanly
    if (isAtlas) {
      if (retryCount < 1) {
        console.log(`[BJK Digital Brain] Retrying Atlas connection in 1 second... (${retryCount + 1}/1)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return connectDB(retryCount + 1, 1, allowFallback);
      }
      
      // Do NOT silently fall back to MongoMemoryServer when Atlas is configured unless explicitly enabled
      const permitFallback = allowFallback || process.env.ALLOW_MEMORY_FALLBACK === 'true';
      if (!permitFallback) {
        console.error('[BJK Digital Brain] Critical: MongoDB Atlas connection failed and offline memory fallback is disabled.');
        console.error('[BJK Digital Brain] Please verify:');
        console.error('  1. Atlas Cluster Host and Database Name in server/.env');
        console.error('  2. Network Access: Ensure your IP is whitelisted in Atlas Network Access');
        console.error('  3. Database User credentials and special character URL-encoding');
        throw primaryError;
      }
      console.warn('[BJK Digital Brain] Unable to reach MongoDB Atlas cluster. Explicit fallback to MongoMemoryServer...');
    }

    // Fallback to MongoMemoryServer for offline development ONLY if permitted
    if (process.env.NODE_ENV !== 'production' && (allowFallback || process.env.ALLOW_MEMORY_FALLBACK === 'true')) {
      try {
        console.log('[BJK Digital Brain] Local MongoDB daemon not reachable. Initializing Embedded MongoMemoryServer for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        if (memoryServerInstance) {
          try { await memoryServerInstance.stop(); } catch (_) {}
          memoryServerInstance = null;
        }
        const os = require('os');
        const path = require('path');
        const fs = require('fs');

        let baseTempDir = os.tmpdir();
        if (fs.existsSync('E:\\')) {
          baseTempDir = 'E:\\bjk-temp';
        } else if (fs.existsSync('D:\\')) {
          baseTempDir = 'D:\\bjk-temp';
        }
        const tmpDbPath = path.join(baseTempDir, 'bjk-mongo-' + Date.now());
        fs.mkdirSync(tmpDbPath, { recursive: true });

        memoryServerInstance = await MongoMemoryServer.create({
          instance: {
            dbName: dbName,
            dbPath: tmpDbPath
          }
        });
        const memoryUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memoryUri, {
          dbName: dbName,
          autoIndex: true
        });
        isConnected = true;
        console.log(`[BJK Digital Brain] Embedded MongoDB Connected at: ${memoryUri} [DB: ${conn.connection.name}]`);
        return conn;
      } catch (memErr) {
        try {
          console.warn('[BJK Digital Brain] Retrying MongoMemoryServer with default ephemeral path...');
          const { MongoMemoryServer } = require('mongodb-memory-server');
          memoryServerInstance = await MongoMemoryServer.create({
            instance: { dbName: dbName }
          });
          const memoryUri = memoryServerInstance.getUri();
          const conn = await mongoose.connect(memoryUri, {
            dbName: dbName,
            autoIndex: true
          });
          isConnected = true;
          console.log(`[BJK Digital Brain] Embedded MongoDB Connected at: ${memoryUri} [DB: ${conn.connection.name}]`);
          return conn;
        } catch (retryErr) {
          memoryServerInstance = null;
          console.error('[BJK Digital Brain] Failed to start embedded MongoDB:', retryErr.message);
        }
      }
    }
  }

  isConnected = false;
  return null;
};

const getDBStatus = () => {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
};

const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

const getDBName = () => {
  return mongoose.connection.name || process.env.DATABASE_NAME || 'bjk_healthcare';
};

const closeDB = async () => {
  try {
    if (memoryServerInstance) {
      await memoryServerInstance.stop({ doCleanup: true, force: true });
      memoryServerInstance = null;
    }
    await mongoose.disconnect();
    isConnected = false;
    console.log('[BJK Digital Brain] MongoDB connection cleanly closed.');
  } catch (err) {
    memoryServerInstance = null;
    console.error('[BJK Digital Brain] Error during database shutdown:', err.message);
  }
};

// Graceful process termination handlers
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  getDBStatus,
  isDBConnected,
  getDBName,
  closeDB
};
