/**
 * BJK Healthcare - Central Safety Guard System
 * Protects production databases and environments from destructive operations,
 * seed scripts, automated syncs, and manual migrations.
 */

function parseDatabaseName(uri) {
  if (!uri || typeof uri !== 'string') return null;
  const cleanUri = uri.trim();
  if (!cleanUri) return null;

  try {
    const parsed = new URL(cleanUri);
    const pathname = (parsed.pathname || '').replace(/^\/+/, '');
    const dbName = pathname.split('/')[0];
    return dbName ? decodeURIComponent(dbName) : null;
  } catch (e) {
    const match = cleanUri.match(/^mongodb(?:\+srv)?:\/\/[^\/]+\/([^?&#/]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

function getEffectiveDatabaseName() {
  return (process.env.DATABASE_NAME || 'bjk_healthcare').trim();
}

function assertNonProduction() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SAFETY ERROR: Seed and destructive operations are strictly forbidden when NODE_ENV=production.');
  }

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri || rawUri.trim() === '') {
    throw new Error('FATAL SAFETY ERROR: MONGODB_URI environment variable is missing or empty.');
  }

  const effectiveDb = getEffectiveDatabaseName();

  // If effective database evaluates to 'bjk_healthcare' (which DATABASE_NAME defaults to if unset,
  // overriding whatever database name is present in the URI path), reject immediately.
  if (effectiveDb.toLowerCase() === 'bjk_healthcare') {
    throw new Error("FATAL SAFETY ERROR: Effective database is 'bjk_healthcare' (production default). DATABASE_NAME defaults to 'bjk_healthcare' and overrides the URI path. Destructive operations cannot target production.");
  }

  const allowedDb = (process.env.SEED_ALLOWED_DB || '').trim();
  if (!allowedDb) {
    throw new Error('FATAL SAFETY ERROR: SEED_ALLOWED_DB environment variable is not configured.');
  }

  if (effectiveDb !== allowedDb) {
    throw new Error(`FATAL SAFETY ERROR: Effective database '${effectiveDb}' does not exactly match SEED_ALLOWED_DB '${allowedDb}'.`);
  }
}

function assertConnectedDbAllowed(conn) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SAFETY ERROR: Destructive operations on connected database are strictly forbidden when NODE_ENV=production.');
  }

  let activeDbName = null;
  if (conn && typeof conn.name === 'string') {
    activeDbName = conn.name;
  } else if (conn && conn.connection && typeof conn.connection.name === 'string') {
    activeDbName = conn.connection.name;
  } else {
    try {
      const mongoose = require('mongoose');
      activeDbName = mongoose.connection ? mongoose.connection.name : null;
    } catch (_) {}
  }

  if (!activeDbName || typeof activeDbName !== 'string' || !activeDbName.trim()) {
    throw new Error('FATAL SAFETY ERROR: No active database connection name found to verify.');
  }

  const cleanDbName = activeDbName.trim();
  const prodDbName = (process.env.DATABASE_NAME || 'bjk_healthcare').trim();

  if (cleanDbName.toLowerCase() === 'bjk_healthcare' || cleanDbName.toLowerCase() === prodDbName.toLowerCase()) {
    throw new Error(`FATAL SAFETY ERROR: Connected database '${cleanDbName}' targets the production database name.`);
  }

  const allowedDb = (process.env.SEED_ALLOWED_DB || '').trim();
  if (!allowedDb) {
    throw new Error('FATAL SAFETY ERROR: SEED_ALLOWED_DB environment variable is not configured.');
  }

  if (cleanDbName !== allowedDb) {
    throw new Error(`FATAL SAFETY ERROR: Connected database '${cleanDbName}' does not exactly match SEED_ALLOWED_DB '${allowedDb}'.`);
  }
}

module.exports = {
  parseDatabaseName,
  getEffectiveDatabaseName,
  assertNonProduction,
  assertConnectedDbAllowed
};
