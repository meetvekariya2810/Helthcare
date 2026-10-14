/**
 * BJK Healthcare - File Serving & Upload Security Middleware
 * 
 * Enforces strict access control and defense-in-depth over /uploads directory:
 * 1. Path Canonicalization & Traversal Mitigation (400 Bad Request):
 *    Decodes URI, strips null bytes, normalizes path, and verifies target remains strictly inside uploads directory.
 * 2. Explicit Extension Allowlists & Blacklist Defense (403 Forbidden):
 *    Never relies on blacklists alone. Applies partitioned route allowlists:
 *    - /uploads/documents/* : Strict allowlist: .pdf, .jpg, .jpeg, .png
 *    - /uploads/policies/*  : Strict allowlist: .pdf
 *    - /uploads/public/*    : Strict allowlist: .png, .jpg, .jpeg, .svg, .webp, .ico
 *    - Root /uploads/* unpartitioned files: Blocked (403 Forbidden)
 * 3. Token Extraction & Cryptographic Verification:
 *    Supports Authorization Bearer header (primary) or legacy query parameter (?token= / ?auth=)
 *    for browser iframe previews. Enforces signature and expiry verification.
 * 4. Secure Response Headers:
 *    Applies X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer, and Cache-Control: private, no-store.
 * 5. Role-Based Authorization & Ownership:
 *    - Company Policies: Accessible to all authenticated personnel.
 *    - Employee Documents: Full access for HR and Admin roles; standard employees can ONLY access
 *      documents containing their exact employeeId (with word boundary regex).
 *    - Cross-employee snooping or unauthorized roles strictly return 403 Forbidden.
 */

const path = require('path');
const jwt = require('jsonwebtoken');

// Strict extension allowlists per partitioned folder
const ALLOWED_EXTENSIONS_BY_FOLDER = {
  documents: new Set(['.pdf', '.jpg', '.jpeg', '.png']),
  policies: new Set(['.pdf']),
  public: new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico']),
  assets: new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'])
};

// Global dangerous extensions blacklist (secondary defense)
const FORBIDDEN_EXTENSIONS = new Set([
  '.xlsx', '.xls', '.csv', '.tsv',
  '.env', '.key', '.pem', '.cert',
  '.json', '.sql', '.bak', '.dump',
  '.zip', '.tar', '.gz', '.7z',
  '.exe', '.sh', '.bat', '.cmd', '.js', '.ts'
]);

const HR_ADMIN_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'DIRECTOR',
  'HR_ADMIN',
  'HR_MANAGER',
  'HR_EXECUTIVE',
  'SYSTEM_ADMINISTRATOR',
  'IT_ADMIN'
]);

const uploadsRoot = path.resolve(__dirname, '../uploads');

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== 'production') {
    return 'bjk_healthcare_dev_secret_fallback_for_local_testing_only_32_chars';
  }
  return null;
}

const secureUploads = (req, res, next) => {
  let rawPath = req.path || '';

  // 1. Safe URL Decoding
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch (_) {
    return res.status(400).json({
      success: false,
      message: 'Malformed or illegally encoded document request path.'
    });
  }

  // 2. Traversal and null byte mitigation
  if (decodedPath.includes('\0') || rawPath.includes('%00')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document path: null-byte injection attempt rejected.'
    });
  }

  // 3. Path Canonicalization
  const normalized = path.posix.normalize('/' + decodedPath.replace(/\\/g, '/'));
  if (normalized.includes('..') || decodedPath.includes('..') || rawPath.includes('..')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document path: directory traversal attempt rejected.'
    });
  }

  // Verify resolved absolute path stays strictly inside uploads directory
  const resolvedTarget = path.resolve(uploadsRoot, '.' + normalized);
  if (!resolvedTarget.startsWith(uploadsRoot)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document path: path escapes uploads storage root.'
    });
  }

  // 4. Determine Partitioned Folder & Validate Extension Allowlist
  const ext = path.extname(normalized).toLowerCase();

  // Global blacklist rejection
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Direct static download of spreadsheets, credentials, and data dumps via uploads is strictly forbidden.'
    });
  }

  const parts = normalized.split('/').filter(Boolean);
  const folder = parts.length > 1 ? parts[0].toLowerCase() : null;

  // Root-level file upload downloads are forbidden (all uploads must be partitioned into documents, policies, or public)
  if (!folder || !ALLOWED_EXTENSIONS_BY_FOLDER[folder]) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Direct download of root-level upload files is prohibited. Files must reside in designated partitioned vaults.'
    });
  }

  const allowedExts = ALLOWED_EXTENSIONS_BY_FOLDER[folder];
  if (!allowedExts.has(ext)) {
    return res.status(403).json({
      success: false,
      message: `Access denied: File extension '${ext}' is not permitted in vault folder '${folder}'.`
    });
  }

  // 5. Apply Security Headers to Prevent Leaks & Content-Sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

  // 6. Legitimate Public Asset Boundaries (/uploads/public/* or /uploads/assets/*)
  if (folder === 'public' || folder === 'assets') {
    return next();
  }

  // 7. Token Extraction: Authorization Bearer header (preferred) or Query parameter (?token= or ?auth=)
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1].trim();
  } else if (req.query && (req.query.token || req.query.auth)) {
    token = String(req.query.token || req.query.auth).trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required: You must be logged in with a valid session token to view uploaded documents.'
    });
  }

  // 8. Verify JWT Signature and Expiration
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: JWT secret is unconfigured.'
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (jwtErr) {
    if (jwtErr.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or forged authentication token.'
    });
  }

  req.user = decoded;
  const role = String(decoded.role || '').toUpperCase().replace(/\s+/g, '_');

  // 9. Company Policies: Accessible to all authenticated personnel
  if (folder === 'policies') {
    return next();
  }

  // 10. HR & Administrator Authorization for Employee Dossiers
  if (HR_ADMIN_ROLES.has(role)) {
    return next();
  }

  // 11. Authenticated Employee Ownership Check
  const userEmpId = decoded.employeeId || decoded.empId;
  if (userEmpId) {
    const cleanEmpId = String(userEmpId).toUpperCase().trim();
    const baseName = path.basename(normalized).toUpperCase();
    const empRegex = new RegExp(`(^|[^A-Z0-9])${cleanEmpId}([^A-Z0-9]|$)`, 'i');
    if (empRegex.test(baseName)) {
      return next();
    }
  }

  // If role is unauthorized or employee does not own the document
  return res.status(403).json({
    success: false,
    message: 'Access denied: You do not have permission to view documents belonging to another employee.'
  });
};

module.exports = {
  secureUploads,
  ALLOWED_EXTENSIONS_BY_FOLDER,
  FORBIDDEN_EXTENSIONS,
  HR_ADMIN_ROLES
};
