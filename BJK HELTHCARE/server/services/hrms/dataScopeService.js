/**
 * BJK Healthcare Digital Brain - Data Scope Service
 * Enforces role-based data boundaries at the database query level
 *
 * Scope Hierarchy:
 * - SELF: Employee can only see their own records (employeeId / userId)
 * - DEPARTMENT: Department Manager / QA Manager can only see their department's records
 * - FACILITY: Facility Manager can only see records for their plant/facility
 * - COMPANY: HR Managers / Executives can see all company workforce data
 * - SYSTEM: Super Admin has enterprise-wide, unrestricted data scope
 */

const DATA_SCOPES = {
  SELF: 'SELF',
  TEAM: 'TEAM',
  DEPARTMENT: 'DEPARTMENT',
  FACILITY: 'FACILITY',
  COMPANY: 'COMPANY',
  GLOBAL: 'GLOBAL',
  SYSTEM: 'SYSTEM'
};

const ROLE_DATA_SCOPE_MAP = {
  SUPER_ADMIN: DATA_SCOPES.SYSTEM,
  DIRECTOR: DATA_SCOPES.SYSTEM,
  ADMIN: DATA_SCOPES.SYSTEM,
  SYSTEM_ADMINISTRATOR: DATA_SCOPES.SYSTEM,
  HR_ADMIN: DATA_SCOPES.GLOBAL,
  HR_MANAGER: DATA_SCOPES.GLOBAL,
  HR_EXECUTIVE: DATA_SCOPES.GLOBAL,
  HR: DATA_SCOPES.GLOBAL,
  FINANCE_MANAGER: DATA_SCOPES.COMPANY,
  PAYROLL_ADMIN: DATA_SCOPES.COMPANY,
  RECRUITER: DATA_SCOPES.COMPANY,
  QA_MANAGER: DATA_SCOPES.DEPARTMENT,
  QC_MANAGER: DATA_SCOPES.DEPARTMENT,
  PRODUCTION_MANAGER: DATA_SCOPES.DEPARTMENT,
  DEPARTMENT_MANAGER: DATA_SCOPES.DEPARTMENT,
  WAREHOUSE_MANAGER: DATA_SCOPES.DEPARTMENT,
  SALES_MANAGER: DATA_SCOPES.DEPARTMENT,
  EXPORT_MANAGER: DATA_SCOPES.DEPARTMENT,
  IT_ADMIN: DATA_SCOPES.GLOBAL,
  TEAM_LEAD: DATA_SCOPES.TEAM,
  AUDITOR: DATA_SCOPES.COMPANY,
  EMPLOYEE: DATA_SCOPES.SELF
};

/**
 * Resolve data scope for an authenticated user
 */
const resolveDataScope = (user) => {
  if (!user) return DATA_SCOPES.SELF;
  const role = (user.role || '').toUpperCase();
  if (['SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'SYSTEM_ADMINISTRATOR'].includes(role)) {
    return DATA_SCOPES.SYSTEM;
  }
  if (['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR'].includes(role)) {
    return DATA_SCOPES.GLOBAL;
  }
  if (user.dataScope) {
    if (user.dataScope === 'GLOBAL') return DATA_SCOPES.GLOBAL;
    return user.dataScope;
  }
  return ROLE_DATA_SCOPE_MAP[role] || DATA_SCOPES.SELF;
};

/**
 * Get human-readable scope label for UI
 */
const getScopeLabel = (scope, role) => {
  switch (scope) {
    case DATA_SCOPES.SELF:
      return 'Self Service';
    case DATA_SCOPES.TEAM:
      return 'Team Scope';
    case DATA_SCOPES.DEPARTMENT:
      return role === 'QA_MANAGER' ? 'Quality Operations' : `${role.replace('_', ' ')} Scope`;
    case DATA_SCOPES.COMPANY:
    case DATA_SCOPES.GLOBAL:
      return 'Global HR Master';
    case DATA_SCOPES.SYSTEM:
      return 'Executive Command';
    default:
      return 'Authorized Scope';
  }
};

/**
 * Generate Mongoose query filter based on user data scope
 */
const getScopeQuery = (user, entityType = 'employee') => {
  if (!user) return { _id: null }; // Unauthenticated users get no data

  const scope = resolveDataScope(user);

  // SYSTEM, GLOBAL, and COMPANY have broad workforce visibility
  if (scope === DATA_SCOPES.SYSTEM || scope === DATA_SCOPES.GLOBAL || scope === DATA_SCOPES.COMPANY) {
    return {};
  }

  // DEPARTMENT Scope (e.g. QA_MANAGER, QC_MANAGER, PRODUCTION_MANAGER, WAREHOUSE_MANAGER)
  if (scope === DATA_SCOPES.DEPARTMENT) {
    let deptRegex;
    if (user.role === 'QA_MANAGER' || user.role === 'QC_MANAGER') {
      deptRegex = /quality|qa|qc/i;
    } else if (user.role === 'PRODUCTION_MANAGER') {
      deptRegex = /production|manufacturing|formulation|packaging/i;
    } else if (user.role === 'WAREHOUSE_MANAGER') {
      deptRegex = /warehouse|inventory|logistics/i;
    } else if (user.department) {
      deptRegex = new RegExp(user.department, 'i');
    } else {
      deptRegex = /quality/i;
    }

    switch (entityType) {
      case 'employee':
        return {
          $or: [
            { departmentName: { $regex: deptRegex } },
            { department: { $regex: deptRegex } }
          ]
        };
      default:
        return { departmentName: { $regex: deptRegex } };
    }
  }

  // TEAM Scope (TEAM_LEAD)
  if (scope === DATA_SCOPES.TEAM) {
    const userEmpId = user.employeeId;
    const userId = user._id || user.id;
    return {
      $or: [
        { reportingManager: userId },
        { managerName: user.name },
        { employeeId: userEmpId }
      ]
    };
  }

  // SELF Scope (e.g. EMPLOYEE)
  if (scope === DATA_SCOPES.SELF) {
    const employeeId = user.employeeId || 'NON_EXISTENT';
    const userEmail = (user.email || '').toLowerCase().trim();

    switch (entityType) {
      case 'employee':
        return {
          $or: [
            { employeeId },
            { email: userEmail },
            { workEmail: userEmail }
          ]
        };
      case 'asset':
        return { assignedToEmployeeId: employeeId };
      default:
        return { employeeId };
    }
  }

  return {};
};

/**
 * Check if user can access a specific record instance
 */
const canAccessRecord = (user, record, entityType = 'employee') => {
  if (!user || !record) return false;
  const scope = resolveDataScope(user);

  if (scope === DATA_SCOPES.SYSTEM || scope === DATA_SCOPES.GLOBAL || scope === DATA_SCOPES.COMPANY) {
    return true;
  }

  if (scope === DATA_SCOPES.DEPARTMENT) {
    const userDept = (user.department || '').toLowerCase();
    const recordDept = (record.departmentName || record.department || '').toLowerCase();
    if (user.role === 'QA_MANAGER' || user.role === 'QC_MANAGER') {
      return recordDept.includes('quality') || recordDept.includes('qa') || recordDept.includes('qc');
    }
    if (user.role === 'PRODUCTION_MANAGER') {
      return recordDept.includes('production') || recordDept.includes('manufacturing');
    }
    if (user.role === 'WAREHOUSE_MANAGER') {
      return recordDept.includes('warehouse') || recordDept.includes('inventory');
    }
    return userDept && recordDept && (recordDept.includes(userDept) || userDept.includes(recordDept));
  }

  if (scope === DATA_SCOPES.TEAM) {
    const userEmpId = user.employeeId;
    const userId = (user._id || user.id || '').toString();
    const repManager = (record.reportingManager?._id || record.reportingManager || '').toString();
    return repManager === userId || record.employeeId === userEmpId || record.managerName === user.name;
  }

  if (scope === DATA_SCOPES.SELF) {
    const userEmpId = user.employeeId;
    const recordEmpId = record.employeeId || (record.employee && record.employee.employeeId);
    const userEmail = (user.email || '').toLowerCase();
    const recordEmail = (record.email || record.workEmail || '').toLowerCase();
    return Boolean((userEmpId && recordEmpId && userEmpId === recordEmpId) || (userEmail && recordEmail && userEmail === recordEmail));
  }

  return false;
};

/**
 * Verify if authenticated user can view/download a specific document
 */
const canAccessDocument = (user, doc, employee) => {
  if (!user || !doc) return false;

  const userRole = (user.role || '').toUpperCase();
  const isSuperAdmin = ['SUPER_ADMIN', 'DIRECTOR', 'ADMIN', 'SYSTEM_ADMINISTRATOR'].includes(userRole);
  const isHR = ['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR'].includes(userRole);
  const isDirector = userRole === 'DIRECTOR';
  const isSelf = user.employeeId && employee && (user.employeeId === employee.employeeId || user.email === employee.email);
  const isManager = Boolean(
    employee && (
      (employee.reportingManager && (employee.reportingManager.toString() === (user._id || user.id || '').toString())) ||
      (employee.managerName && employee.managerName === user.name)
    )
  );

  if (isSuperAdmin) return true;

  const visibility = doc.visibility || 'HR_ONLY';

  switch (visibility) {
    case 'HR_ONLY':
      return isHR || isSuperAdmin;
    case 'HR_AND_DIRECTOR':
      return isHR || isDirector || isSuperAdmin;
    case 'MANAGER':
      return isHR || isDirector || isManager || isSuperAdmin;
    case 'EMPLOYEE':
      return isHR || isDirector || isManager || isSelf || isSuperAdmin;
    case 'AUTHORIZED_USERS':
      return isHR || isDirector || isManager || isSelf || isSuperAdmin;
    default:
      return isHR || isSuperAdmin;
  }
};

module.exports = {
  DATA_SCOPES,
  ROLE_DATA_SCOPE_MAP,
  resolveDataScope,
  getScopeLabel,
  getScopeQuery,
  canAccessRecord,
  canAccessDocument
};

