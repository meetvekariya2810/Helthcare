// ==============================================================================
// BJK HEALTHCARE DIGITAL BRAIN - MONGOOSE MODELS BARREL EXPORT
// ==============================================================================

// Core Organization & Security
const Company = require('./Company');
const Facility = require('./Facility');
const Department = require('./Department');
const User = require('./User');
const Role = require('./Role');
const AuditLog = require('./AuditLog');

// Product Portfolio (111 Brochure Products)
const Product = require('./Product');
const ProductCategory = require('./ProductCategory');

// Manufacturing & Plant Execution
const ManufacturingCapability = require('./ManufacturingCapability');
const ProductionLine = require('./ProductionLine');
const Machine = require('./Machine');
const ProductionOrder = require('./ProductionOrder');
const Batch = require('./Batch');

// Warehouse & Inventory Management
const Warehouse = require('./Warehouse');
const InventoryItem = require('./InventoryItem');
const InventoryTransaction = require('./InventoryTransaction');

// Quality Control (QC / LIMS)
const QCSample = require('./QCSample');
const QCTest = require('./QCTest');
const QCResult = require('./QCResult');

// Quality Assurance (QA / QMS)
const Deviation = require('./Deviation');
const CAPA = require('./CAPA');
const ChangeControl = require('./ChangeControl');
const SOP = require('./SOP');
const Audit = require('./Audit');

// Regulatory Affairs
const RegulatoryRecord = require('./RegulatoryRecord');
const DossierSubmission = require('./DossierSubmission');
const CountryCompliance = require('./CountryCompliance');

// Commercial & CRM
const Enquiry = require('./Enquiry');
const Lead = require('./Lead');
const Customer = require('./Customer');
const SalesOrder = require('./SalesOrder');
const ExportShipment = require('./ExportShipment');

// Finance & Costing
const { Invoice, ProductCost, OperationalExpense } = require('./Finance');

// Documents & Vault
const Document = require('./Document');

// Knowledge Brain & AI
const KnowledgeEntity = require('./KnowledgeEntity');
const KnowledgeChunk = require('./KnowledgeChunk');
const AIConversation = require('./AIConversation');
const AIMessage = require('./AIMessage');

// Operations Alerts & Workflow Tasks
const Alert = require('./Alert');
const Task = require('./Task');

// HRMS & Security Access Models
const Employee = require('./Employee');
const LoginActivity = require('./LoginActivity');
const UserSession = require('./UserSession');

module.exports = {
  // Core & Auth
  Company,
  Facility,
  Department,
  User,
  Role,
  AuditLog,
  LoginActivity,
  UserSession,

  // Products
  Product,
  ProductCategory,

  // Manufacturing & Operations
  ManufacturingCapability,
  ProductionLine,
  Machine,
  ProductionOrder,
  Batch,

  // Warehouse & Inventory
  Warehouse,
  InventoryItem,
  InventoryTransaction,

  // QC & QA
  QCSample,
  QCTest,
  QCResult,
  Deviation,
  CAPA,
  ChangeControl,
  SOP,
  Audit,

  // Regulatory
  RegulatoryRecord,
  DossierSubmission,
  CountryCompliance,

  // CRM
  Enquiry,
  Lead,
  Customer,
  SalesOrder,
  ExportShipment,

  // Finance
  Invoice,
  ProductCost,
  OperationalExpense,

  // Document & Knowledge
  Document,
  KnowledgeEntity,
  KnowledgeChunk,
  AIConversation,
  AIMessage,

  // Alerts & Tasks
  Alert,
  Task,

  // HRMS & Leave
  Employee,
  LeaveType: require('./hrms/Leave').LeaveType,
  LeavePolicy: require('./hrms/Leave').LeavePolicy,
  HolidayCalendar: require('./hrms/Leave').HolidayCalendar,
  LeaveBalance: require('./hrms/Leave').LeaveBalance,
  LeaveRequest: require('./hrms/Leave').LeaveRequest,
  LeaveActivity: require('./hrms/Leave').LeaveActivity,

  // BJK Policy Compliance Center Models
  Policy: require('./hrms/PolicyMaster').Policy,
  PolicyRule: require('./hrms/PolicyMaster').PolicyRule,
  PolicyAcknowledgment: require('./hrms/PolicyMaster').PolicyAcknowledgment,
  DisciplinaryCase: require('./hrms/DisciplinaryCase').DisciplinaryCase,
  WhistleblowerCase: require('./hrms/DisciplinaryCase').WhistleblowerCase,
  ICCCommittee: require('./hrms/POSHCase').ICCCommittee,
  POSHCase: require('./hrms/POSHCase').POSHCase,
  MaternityCase: require('./hrms/MaternityCase').MaternityCase,
  SafetyIncident: require('./hrms/SafetyManagement').SafetyIncident,
  SafetyCommittee: require('./hrms/SafetyManagement').SafetyCommittee,
  EmergencyDrill: require('./hrms/SafetyManagement').EmergencyDrill,
  SeparationCase: require('./hrms/SeparationCase').SeparationCase,
  DiversityMetric: require('./hrms/DiversityMetric').DiversityMetric,
  AccommodationRequest: require('./hrms/DiversityMetric').AccommodationRequest,
  PrivacyRequest: require('./hrms/PrivacySecurity').PrivacyRequest,
  DataBreach: require('./hrms/PrivacySecurity').DataBreach,
  SecurityIncident: require('./hrms/PrivacySecurity').SecurityIncident,
  ShiftHandoverLog: require('./hrms/AttendanceExtension').ShiftHandoverLog,
  OvertimeRequest: require('./hrms/AttendanceExtension').OvertimeRequest,
  MissedPunch: require('./hrms/AttendanceExtension').MissedPunch,
  RemoteWorkRequest: require('./hrms/AttendanceExtension').RemoteWorkRequest,
  ProbationReview: require('./hrms/AttendanceExtension').ProbationReview,
  Attendance: require('./hrms/Attendance'),
  AttendanceMonthlySummary: require('./hrms/AttendanceMonthlySummary'),
  AttendanceImportBatch: require('./hrms/AttendanceImportBatch'),
  AttendanceImportSnapshot: require('./hrms/AttendanceImportSnapshot'),
  CanteenLunchRecord: require('./hrms/CanteenLunchRecord'),
  
  // Workforce Calendar Models
  WorkSchedule: require('./hrms/WorkSchedule'),
  WorkforceHoliday: require('./hrms/WorkforceHoliday'),
  CalendarSpecialDay: require('./hrms/CalendarSpecialDay'),
  CompanyCalendarEvent: require('./hrms/CompanyCalendarEvent'),
  CalendarException: require('./hrms/CalendarException'),
  WorkforceRoster: require('./hrms/WorkforceRoster'),

  // Employee Bank Details Model
  EmployeeBankDetails: require('./EmployeeBankDetails'),

  // Factory Geofence & Attendance Policy Models
  AttendancePolicy: require('./AttendancePolicy'),
  AttendanceAuditLog: require('./AttendanceAuditLog')
};


