/**
 * BJK Healthcare - Production Environment Validation
 * Validates essential security and infrastructure environment variables at startup.
 * In production (NODE_ENV=production), the process immediately exits if critical
 * variables are missing or invalid, with zero values logged.
 * In non-production, prints a warning instead of exiting.
 */

function validateRequiredEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];

  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === '') {
    errors.push('MONGODB_URI is missing or empty.');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    errors.push('JWT_SECRET is missing or empty.');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long.');
  }

  if (errors.length > 0) {
    if (isProduction) {
      console.error('========================================================');
      console.error('[FATAL STARTUP ERROR] Missing or invalid production environment configuration:');
      for (const err of errors) {
        console.error(`  - ${err}`);
      }
      console.error('Production startup aborted. Process exiting.');
      console.error('========================================================');
      process.exit(1);
    } else {
      console.warn('========================================================');
      console.warn('[STARTUP WARNING] Missing or invalid non-production environment configuration:');
      for (const err of errors) {
        console.warn(`  - ${err}`);
      }
      console.warn('Development/testing mode active. Set valid values before production deployment.');
      console.warn('========================================================');
    }
  }
}

// Execute startup validation immediately upon module load
validateRequiredEnv();

module.exports = {
  validateRequiredEnv
};
