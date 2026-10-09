const mongoose = require('mongoose');

// ==============================================================================
// 1. Safety Incident & Near Miss Model (BJK-HR-POL-011 Health & Safety)
// ==============================================================================
const SafetyIncidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true, uppercase: true }, // e.g. "EHS-2026-001"
  incidentType: {
    type: String,
    enum: ['NEAR_MISS', 'FIRST_AID', 'MEDICAL_TREATMENT', 'LOST_TIME_INJURY_LTIFR', 'FIRE_EMERGENCY', 'CHEMICAL_SPILL', 'UNSAFE_CONDITION'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL_FATAL'],
    required: true
  },
  incidentDateTime: { type: Date, required: true },
  facility: { type: String, default: 'BJK Unit 1 - Formulations Facility' },
  locationExact: { type: String, required: true }, // e.g. "Granulation Area - Cleanroom B"
  
  // No-Blame Culture Reporting
  reportedBy: { type: String, default: 'Operator' },
  reportedDate: { type: Date, default: Date.now },
  description: { type: String, required: true },
  immediateActionsTaken: { type: String, default: '' },
  
  // Injury Details (if any)
  injuredPersonName: { type: String, default: '' },
  injuredPersonType: { type: String, enum: ['EMPLOYEE', 'CONTRACTOR', 'VISITOR', 'NONE'], default: 'NONE' },
  lostTimeDays: { type: Number, default: 0 },
  factoryInspectorNotified: { type: Boolean, default: false },
  factoryInspectorNotificationTime: { type: Date, default: null }, // Required within 4 hours for serious injuries

  // Hierarchy of Controls Applied (1. Elimination, 2. Substitution, 3. Engineering, 4. Administrative, 5. PPE)
  controlHierarchyLevel: {
    type: String,
    enum: ['ELIMINATION', 'SUBSTITUTION', 'ENGINEERING_CONTROLS', 'ADMINISTRATIVE_CONTROLS', 'PPE'],
    default: 'ENGINEERING_CONTROLS'
  },
  rootCauseAnalysis: { type: String, default: '' },
  capaPlan: { type: String, default: '' },
  capaCompleted: { type: Boolean, default: false },
  
  status: {
    type: String,
    enum: ['REPORTED', 'INVESTIGATING', 'CAPA_ASSIGNED', 'VERIFIED_CLOSED'],
    default: 'REPORTED'
  },
  investigatedBy: { type: String, default: 'EHS Safety Officer' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

SafetyIncidentSchema.index({ incidentType: 1 });
SafetyIncidentSchema.index({ severity: 1 });

// ==============================================================================
// 2. Safety Committee Model (>= 50% Worker Representation, Monthly Meetings)
// ==============================================================================
const SafetyCommitteeSchema = new mongoose.Schema({
  title: { type: String, default: 'BJK Healthcare Joint Health & Safety Committee' },
  facility: { type: String, default: 'BJK Unit 1 - Formulations Facility' },
  totalMembers: { type: Number, default: 12 },
  workerRepresentativeCount: { type: Number, default: 7 }, // > 50%
  managementRepresentativeCount: { type: Number, default: 5 },
  meetingFrequency: { type: String, default: 'MONTHLY' },
  lastMeetingDate: { type: Date, default: null },
  nextMeetingDate: { type: Date, default: null },
  meetingMinutesSummary: { type: String, default: '' },
  actionItemsPending: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// ==============================================================================
// 3. Emergency & Fire Drill Model (Quarterly Drills)
// ==============================================================================
const EmergencyDrillSchema = new mongoose.Schema({
  drillCode: { type: String, required: true, unique: true }, // e.g. "DRILL-Q2-2026"
  quarter: { type: String, required: true }, // e.g. "Q1 2026", "Q2 2026"
  dateConducted: { type: Date, required: true },
  drillType: { 
    type: String, 
    enum: ['FIRE_EVACUATION', 'CHEMICAL_SPILL_CONTAINMENT', 'GAS_LEAK_RESPONSE', 'FIRST_AID_MASS_CASUALTY'], 
    default: 'FIRE_EVACUATION' 
  },
  facility: { type: String, default: 'BJK Unit 1 - Formulations Facility' },
  totalParticipants: { type: Number, required: true },
  targetEvacuationTimeMinutes: { type: Number, default: 3.0 },
  actualEvacuationTimeMinutes: { type: Number, required: true },
  performanceRating: { type: String, enum: ['EXCELLENT', 'SATISFACTORY', 'NEEDS_IMPROVEMENT'], default: 'SATISFACTORY' },
  observations: { type: String, default: '' },
  conductedBy: { type: String, default: 'Safety Officer & Fire Wardens' }
}, {
  timestamps: true
});

module.exports = {
  SafetyIncident: mongoose.models.SafetyIncident || mongoose.model('SafetyIncident', SafetyIncidentSchema),
  SafetyCommittee: mongoose.models.SafetyCommittee || mongoose.model('SafetyCommittee', SafetyCommitteeSchema),
  EmergencyDrill: mongoose.models.EmergencyDrill || mongoose.model('EmergencyDrill', EmergencyDrillSchema)
};
