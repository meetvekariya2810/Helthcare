const mongoose = require('mongoose');
const { Policy, PolicyRule, PolicyAcknowledgment } = require('../models/hrms/PolicyMaster');
const { HolidayCalendar } = require('../models/hrms/Leave');
const { DEFAULT_POLICY_RULES } = require('../services/hrms/policyEngine');
const Employee = require('../models/hrms/Employee');
const { DisciplinaryCase, WhistleblowerCase } = require('../models/hrms/DisciplinaryCase');
const { ICCCommittee, POSHCase } = require('../models/hrms/POSHCase');
const { MaternityCase } = require('../models/hrms/MaternityCase');
const { SafetyIncident, SafetyCommittee, EmergencyDrill } = require('../models/hrms/SafetyManagement');
const { SeparationCase } = require('../models/hrms/SeparationCase');
const { DiversityMetric, AccommodationRequest } = require('../models/hrms/DiversityMetric');
const { PrivacyRequest, DataBreach, SecurityIncident } = require('../models/hrms/PrivacySecurity');
const { ShiftHandoverLog, OvertimeRequest, MissedPunch } = require('../models/hrms/AttendanceExtension');

// ==============================================================================
// 13 BJK HEALTHCARE HR POLICIES DEFINITION
// ==============================================================================
const BJK_13_POLICIES = [
  {
    policyId: 'POL-001',
    policyNumber: 'BJK-HR-POL-001',
    title: 'Leave Policy',
    category: 'LEAVE_ATTENDANCE',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 4-7',
    hasSourceConflict: false,
    summary: 'Comprehensive statutory and organizational framework for leave entitlements, accruals, encashment, and GMP staffing compliance for all permanent, confirmed & probationary employees.',
    detailedSections: [
      {
        sectionTitle: 'Leave Types & Annual Quotas',
        content: 'Leave year runs from January 1 to December 31. Annual entitlements include Earned Leave (7 days, 0.58/mo), Casual Leave (7 days), Sick Leave (4 days credited Jan 1), and Compensatory Off (1:1 basis).',
        bulletPoints: [
          'Earned Leave: Accrual 0.58 days/month, min block 3 consecutive days, max continuous 15 days, advance notice 15 days for 5+ days or 7 days for 3-4 days.',
          'EL Accumulation: Maximum 50 days carry-forward. Encashment max 10 days/year in December.',
          'Casual Leave: Short-term unplanned absences, max continuous 2 days, cannot be clubbed with weekly offs/holidays, lapses on Dec 31.',
          'Sick Leave: Credited upfront Jan 1. Medical certificate mandatory for 3+ days. GMP area fitness certificate required after 4+ days.',
          'Compensatory Off: Usable within 90 days on 1:1 basis, non-encashable.'
        ]
      },
      {
        sectionTitle: 'Special Leaves',
        content: 'BJK Healthcare provides paid compassionate and special leaves for significant lifecycle events.',
        bulletPoints: [
          'Bereavement (Immediate family): 2 days paid.',
          'Bereavement (Extended family): 1 day paid.',
          'Marriage Leave: 5 days paid (once during company tenure).',
          'Birthday / Anniversary: 1 day paid.',
          'Election / Jury Duty: Paid as per official summons.'
        ]
      },
      {
        sectionTitle: 'Unauthorized Absence & GMP Compliance',
        content: 'Unauthorized absenteeism impacts pharmaceutical production schedules and incurs strict progressive consequences.',
        bulletPoints: [
          '1 day: LOP + salary deduction.',
          '2-3 days: LOP + written warning.',
          '4-7 days: LOP + suspension pending inquiry.',
          '8+ days: Voluntary abandonment of employment; termination.',
          'GMP Manufacturing / QC / QA: Leave roster mandatory for adequate line staffing. Blackout periods enforce zero-leave during regulatory audits. GMP refresher training mandatory after 30+ days absence.'
        ]
      }
    ],
    acknowledgmentRequired: true,
    acknowledgmentDeadlineDays: 30
  },
  {
    policyId: 'POL-002',
    policyNumber: 'BJK-HR-POL-002',
    title: 'Attendance & Punctuality Policy',
    category: 'LEAVE_ATTENDANCE',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 8-13',
    hasSourceConflict: false,
    summary: 'Defines operating shifts, 48-hour work week, biometric integration, grace periods, progressive lateness discipline, overtime limits, and critical GMP shift handover protocols.',
    detailedSections: [
      {
        sectionTitle: 'Working Hours & Shifts',
        content: 'Standard work week consists of 6 days / 48 hours per week (Factories Act) and 10 gazetted public holidays per year.',
        bulletPoints: [
          'General Shift (Admin/Support): 9:00 AM – 5:30 PM (Mon-Sat, Lunch 1:00 – 2:00 PM).',
          'Shift A (Day): 7:00 AM – 3:30 PM (30 min included break).',
          'Shift B (Evening): 3:00 PM – 11:30 PM (30 min included break).',
          'Shift C (Night): 11:00 PM – 7:30 AM (30 min included break).',
          '30-minute shift overlap between shifts for face-to-face handover.'
        ]
      },
      {
        sectionTitle: 'Biometric System, Grace & Missed Punch Protocol',
        content: 'Real-time entry/exit biometric logging via fingerprint/face recognition at all turnstiles.',
        bulletPoints: [
          'Grace Period: 10 minutes after scheduled shift start.',
          'Habitual Grace: 5 or more times per month is flagged by HR.',
          'Missed Punch: Inform manager + HR immediately; submit request within 24 hours. 3+ missed punches/month = attendance violation.'
        ]
      },
      {
        sectionTitle: 'Late Coming Consequences & Overtime',
        content: 'Progressive lateness deductions and overtime caps.',
        bulletPoints: [
          '11-30 min late: Verbal warning (up to 3x/month with no salary deduction; subsequent = half-day LOP).',
          '31-60 min late: Half-day leave deduction or LOP.',
          '60+ min late: Full-day absence / full-day LOP.',
          'Monthly Frequency: 1-3 noted; 4-5 written warning from manager; 6-7 written warning from HR + counseling; 8+ final warning -> suspension -> termination.',
          'Overtime Cap: Pre-approved by manager, max 12 hours/week or 50 hours/quarter.',
          'GMP Shift Handover: Mandatory face-to-face during 30-min overlap. Both operators sign handover log. Leaving without handover = GMP deviation + disciplinary action.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-003',
    policyNumber: 'BJK-HR-POL-003',
    title: 'Code of Conduct & Ethics Policy',
    category: 'ETHICS_CONDUCT',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 14-18',
    hasSourceConflict: false,
    summary: 'Codifies BJK Healthcare’s 6 core values, professional behavior standards, anti-corruption, conflict of interest disclosures, formulation confidentiality, and whistleblower protections.',
    detailedSections: [
      {
        sectionTitle: 'BJK Healthcare 6 Core Values',
        content: '1. Integrity (honest, ethical conduct) 2. Quality Excellence (patient safety & quality commitment) 3. Accountability (own actions, take corrective action) 4. Respect (dignity & inclusion) 5. Transparency (accurate records) 6. Social Responsibility (sustainability).',
        bulletPoints: [
          'Prohibited: Dishonesty, fraud, record falsification, insubordination, harassment, violence, substance abuse, theft, sleeping on duty, unauthorized absence.',
          'Workplace Relationships: Supervisor-subordinate relationships must be disclosed in writing to HR. Nepotism and favoritism prohibited.',
          'Anti-Bribery: Zero tolerance for bribes, kickbacks, or facilitation payments to commercial or government officials.'
        ]
      },
      {
        sectionTitle: 'Confidentiality & Whistleblower Protection',
        content: 'Strict non-disclosure of formulations, batch records, and manufacturing processes.',
        bulletPoints: [
          'Confidentiality continues indefinitely (minimum 2+ years legally enforceable).',
          'Whistleblower Protection: Confidential reporting via anonymous hotline, HR, or manager.',
          'Zero retaliation for good-faith reporting. Retaliation punished up to termination.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-004',
    policyNumber: 'BJK-HR-POL-004',
    title: 'Disciplinary Action Policy',
    category: 'ETHICS_CONDUCT',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 19-21',
    hasSourceConflict: false,
    summary: 'Enforces natural justice, objective misconduct categorization (Minor, Major, Gross), and a structured 6-step progressive disciplinary framework with step-bypass safeguards.',
    detailedSections: [
      {
        sectionTitle: 'Misconduct Categories',
        content: 'Objective assessment of behavior severity across pharmaceutical operations.',
        bulletPoints: [
          'Minor: Occasional lateness, minor SOP deviation, dress code, phone overuse (Verbal counseling / retraining).',
          'Major: Repeated violations, insubordination, unauthorized absence, negligence (Written warning -> final warning -> suspension).',
          'Gross: Theft, fraud, GMP data falsification, violence, bribery, sexual harassment (Immediate termination, legal action).'
        ]
      },
      {
        sectionTitle: '6-Step Progressive Discipline Framework',
        content: 'Step 1: Verbal Warning (Supervisor/Manager, 30 days validity)\nStep 2: Written Warning (Dept Head/HR, 6 months)\nStep 3: Final Written Warning (Head-HR, 12 months)\nStep 4: Suspension (3-7 days, Head-HR + MD)\nStep 5: Demotion/Transfer (Management + HR, Permanent)\nStep 6: Termination (Managing Director, Final).',
        bulletPoints: [
          'Bypassing Steps Allowed: Gross misconduct, criminal activity, violence, GMP fraud, immediate safety/quality threat.',
          'GMP Specific Violations: Negligence -> retraining + CAPA; falsifying GMP records = gross misconduct -> immediate termination + legal action.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-009',
    policyNumber: 'BJK-HR-POL-009',
    title: 'Employee Onboarding & Induction Policy',
    category: 'EMPLOYMENT',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 22-25',
    hasSourceConflict: false,
    summary: '90-day structured onboarding journey from pre-joining documentation and Day 1 orientation to 30/60/90 day reviews and mandatory 7-module GMP cleanroom qualification.',
    detailedSections: [
      {
        sectionTitle: 'Pre-Joining & Day 1 Schedule',
        content: 'Pre-joining background checks, medical fitness, welcome emails, and full Day 1 structured experience.',
        bulletPoints: [
          'Pre-joining (7-30 days): Offer acceptance, BGV, medical fitness cert, welcome email 7d prior, HR confirmation 2d prior.',
          'Day 1: 9-10 Reception/welcome; 10-11:30 Documentation & biometrics; 11:30-1 Facility tour & safety briefing; 1-2 Lunch with buddy; 2-4 Team meeting; 4-5:30 IT setup & wrap-up.'
        ]
      },
      {
        sectionTitle: '30 / 60 / 90 Day Probation & Regulated Cleanroom Qualification',
        content: 'Progression through milestone reviews.',
        bulletPoints: [
          'Day 30 Review: Training Needs Assessment, SOP read & understood sign-offs, equipment training.',
          'Day 60 Review: Mid-probation assessment, bi-weekly buddy checks, course-correction.',
          'Day 90 Review: Final assessment -> Confirmed / Extended (1-3 months PIP) / Terminated.',
          'GMP Induction (Regulated Areas): 7 Modules (GMP Fundamentals, Hygiene, Gowning, GDP/ALCOA+, Contamination Control, Area Classification, Deviation/CAPA). Pass mark 80%. Employees cannot work independently until GMP qualified.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-010',
    policyNumber: 'BJK-HR-POL-010',
    title: 'Employee Separation & Exit Policy',
    category: 'EMPLOYMENT',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 26-28',
    hasSourceConflict: false,
    summary: 'Governs 7 separation types, resignation SLA timelines, 5-department exit clearances, 45-day Full & Final settlement, and 30-day relieving certificate issuance.',
    detailedSections: [
      {
        sectionTitle: 'Separation Types & Resignation Timelines',
        content: 'Types: Voluntary Resignation, Retirement (age 58), Termination for Cause, Retrenchment, Contract Expiry, Death in Service, Abandonment.',
        bulletPoints: [
          'Resignation: Written letter to manager + HR.',
          'Acknowledgment within 2 working days.',
          'Retention discussion for critical/high performers within 3 days.',
          'Formal acceptance letter issued within 5 days.',
          'Notice period buyout allowed with HR Head approval; withdrawal allowed prior to formal acceptance.',
          'Retirement: Superannuation at age 58 (6 months advance notice); extension up to 60 for critical technical roles.'
        ]
      },
      {
        sectionTitle: '5-Department Clearance & Final Settlement',
        content: 'Department, IT, Finance, HR, and Security clearances before release.',
        bulletPoints: [
          'Full & Final Settlement: Within 45 days (salary proration, EL encashment up to 50 days, gratuity 5+ years, PF, bonus minus dues).',
          'Experience & Relieving Certificate: Issued within 30 days.',
          'Post-Exit: Confidentiality continues indefinitely. Non-compete/non-solicitation enforceable.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-016',
    policyNumber: 'BJK-HR-POL-016',
    title: 'Maternity & Paternity Leave Policy',
    category: 'LEAVE_ATTENDANCE',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 29-31',
    hasSourceConflict: true,
    conflictDetails: {
      sourcePolicyNumberAlternative: 'BJK-HR-POL-011',
      notes: 'The handbook agenda (Slide 2) and section cover (Slide 29) identify this policy as BJK-HR-POL-016. However, detailed sub-pages (Slide 30 and Slide 31 footer) print BJK-HR-POL-011. In accordance with system instructions, both numbers are recorded and flagged for HR verification.',
      hrVerificationStatus: 'PENDING_HR_VERIFICATION',
      flaggedWarning: '⚠️ HR Policy Configuration Review Required: Source Policy Number Discrepancy between BJK-HR-POL-016 (Agenda/Cover) and BJK-HR-POL-011 (Detail Footers).'
    },
    summary: 'Comprehensive parental leave entitlements: 26 weeks paid maternity (1st & 2nd child), 15 days paternity, adoption/surrogacy provisions, GMP hazard reassignment, and nursing breaks.',
    detailedSections: [
      {
        sectionTitle: 'Maternity & Paternity Entitlements',
        content: 'Paid parental leave compliant with Maternity Benefit Act & enhanced company benefits.',
        bulletPoints: [
          '1st & 2nd Child (Natural birth): 26 weeks (182 days) fully paid.',
          '3rd Child onwards: 12 weeks (84 days) paid.',
          'Adoption (<3 months) & Surrogacy: 12 weeks paid from handover.',
          'Miscarriage / Medical Termination: 6 weeks (42 days) paid.',
          'Stillbirth (after 20 weeks): 12 weeks paid + EAP counseling.',
          'Illness from pregnancy: Additional 1 month paid.',
          'Tubectomy: 2 weeks (14 days) paid.',
          'Eligibility: Minimum 80 days employment in preceding 12 months.',
          'Paternity Leave: 15 consecutive calendar days fully paid (max 2 children, within 60 days of birth/adoption, max 2 tranches).'
        ]
      },
      {
        sectionTitle: 'GMP Provisions, Nursing & Protection',
        content: 'Pharmaceutical manufacturing safety accommodations for expectant mothers.',
        bulletPoints: [
          'GMP Reassignment: Immediate risk assessment; reassignment away from hazardous active ingredients / solvents; flexible hours; modified PPE.',
          'Doctor clearance mandatory before resuming GMP cleanroom duties post-maternity.',
          'Nursing Breaks: 2 daily breaks until child reaches 15 months; crèche facility when female workforce >= 50.',
          'Protection: Zero termination during pregnancy/maternity; right to return to same/equivalent role; appraisal ratings protected.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-012',
    policyNumber: 'BJK-HR-POL-012',
    title: 'POSH Policy (Prevention of Sexual Harassment)',
    category: 'ETHICS_CONDUCT',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 32-35',
    hasSourceConflict: false,
    summary: 'Statutory compliance under POSH Act 2013, Internal Complaints Committee (ICC) composition, 90-day inquiry SLAs, interim protections, and strict confidentiality.',
    detailedSections: [
      {
        sectionTitle: 'What Constitutes Sexual Harassment',
        content: 'Section 2(n) of POSH Act: physical contact, advances, demand/request for sexual favors, sexually colored remarks, showing pornography, or any unwelcome conduct.',
        bulletPoints: [
          'Quid Pro Quo: Linking job benefits to sexual compliance; threats for refusal.',
          'Hostile Work Environment: Unwelcome conduct creating intimidating atmosphere.'
        ]
      },
      {
        sectionTitle: 'ICC Composition & 90-Day Inquiry Procedure',
        content: 'Mandatory ICC with senior female Presiding Officer, min 2 internal members, 1 external NGO member, and minimum 50% women representation.',
        bulletPoints: [
          'Filing: Written complaint within 3 months (extendable by 3 months in special cases).',
          'Notice to respondent within 7 days; respondent reply within 10 days.',
          'Inquiry concluded within 90 days; final report submitted to management within 10 days.',
          'Interim Relief: Transfer of respondent, WFH for complainant.',
          'Confidentiality: Strict non-disclosure of party identities; zero retaliation protection.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-013',
    policyNumber: 'BJK-HR-POL-013',
    title: 'Equal Opportunity & Anti-Discrimination Policy',
    category: 'ETHICS_CONDUCT',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 36-38',
    hasSourceConflict: false,
    summary: 'Zero tolerance for discrimination across 12 protected characteristics, affirmative D&I targets, blind resume screening, accessibility, and pay equity.',
    detailedSections: [
      {
        sectionTitle: 'Protected Characteristics',
        content: 'Employment decisions based solely on merit, qualifications, and performance without discrimination.',
        bulletPoints: [
          'Protected: Caste, Religion, Gender, Sexual Orientation, Disability, Age, Marital Status, Pregnancy/Maternity, Place of Birth/Domicile, HIV/AIDS Status, Language, Political Opinion.'
        ]
      },
      {
        sectionTitle: 'Diversity & Inclusion 2030 Targets & Key Initiatives',
        content: 'Measurable organizational equity commitments.',
        bulletPoints: [
          'Women in Workforce: Target 30% by 2030 (current ~18%).',
          'Women in Leadership: Target 25% by 2030.',
          'Persons with Disabilities (RPDA): Target 4% by 2030.',
          'Gender Pay Gap: Target 0% by 2028.',
          'Initiatives: Diverse interview panels, blind resume screening, Employee Resource Groups (Women, Ability, Pride), accessible ramps and elevators, reasonable accommodations.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-014',
    policyNumber: 'BJK-HR-POL-014',
    title: 'Data Privacy & Confidentiality Policy',
    category: 'COMPLIANCE_PRIVACY',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 39-41',
    hasSourceConflict: false,
    summary: 'DPDP Act 2023 compliance, 4-tier data classification, data subject rights (access, correction, erasure), 24h internal breach reporting, and 72h Data Protection Board notification.',
    detailedSections: [
      {
        sectionTitle: 'DPDP Act Principles & 4-Tier Data Classification',
        content: 'Core principles: Lawfulness, Purpose Limitation, Data Minimization, Accuracy, Storage Limitation, Security, Accountability.',
        bulletPoints: [
          'Public: Product information, press releases.',
          'Internal: General policies, office communications.',
          'Confidential: Employee PII, contracts, financial reports.',
          'Restricted: Drug formulations, R&D dossiers, patient trial records, biometric data.'
        ]
      },
      {
        sectionTitle: 'Data Subject Rights & 24h / 72h Breach Response',
        content: 'Statutory rights and rapid incident response.',
        bulletPoints: [
          'Rights: Access, Correction, Erasure, Nomination, Grievance Redressal (contact: dpo@bjkhealthcare.com, +91 9624729729).',
          'Breach Response: Report internally to IT + DPO within 24 hours (databreach@bjkhealthcare.com). Notify Data Protection Board within 72 hours.',
          'DPDP Act non-compliance penalties up to ₹250 crores.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-015',
    policyNumber: 'BJK-HR-POL-015',
    title: 'IT & Information Security Policy',
    category: 'SECURITY',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 42-44',
    hasSourceConflict: false,
    summary: 'CIA triad, Zero Trust access control, 12-char passwords, mandatory MFA, prohibited computing practices, 1h incident reporting, 6h CERT-In notification, and 3-2-1 backup.',
    detailedSections: [
      {
        sectionTitle: 'Access Control, Passwords & MFA',
        content: 'Unique user IDs, least privilege, zero trust verification.',
        bulletPoints: [
          'Password Rules: Min 12 characters (upper, lower, number, special). Rotated every 90 days. Cannot reuse last 12. Account locks after 5 failed attempts.',
          'MFA Mandatory: Remote access (VPN), cloud, privileged admin accounts, GMP MES systems, financial systems, email.',
          'Prohibited: Shadow IT, unlicensed tools, cryptocurrency mining, sharing credentials, unauthorized USBs, auto-forwarding corporate email.'
        ]
      },
      {
        sectionTitle: 'Incident Response & Business Continuity',
        content: 'SLA timelines for cybersecurity containment and restoration.',
        bulletPoints: [
          'Reporting: Within 1 hour to IT Security (security@bjkhealthcare.com, +91 9624729729). CERT-In notification within 6 hours.',
          'Business Continuity: Priority 1 (GMP systems) RTO 4-8 hours; Priority 2 (Email/HR) RTO 24 hours.',
          'Backup Strategy: 3-2-1 (3 copies, 2 media, 1 offsite).'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-011',
    policyNumber: 'BJK-HR-POL-011',
    title: 'Health, Safety & Hygiene Policy',
    category: 'SAFETY_HEALTH',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 45-48',
    hasSourceConflict: false,
    summary: 'Zero Harm philosophy (Safety > Production), EHS PDCA management, Joint Safety Committee with >=50% worker representation, free PPE, cleanroom hygiene, and quarterly fire drills.',
    detailedSections: [
      {
        sectionTitle: 'Philosophy, Safety Committee & Hierarchy of Controls',
        content: 'ZERO HARM: No injuries, no occupational illnesses, no accidents.',
        bulletPoints: [
          'Safety KPIs: LTIFR, TRIR, near-miss rate, PPE compliance, drill participation.',
          'Safety Committee: Min 50% worker representatives, monthly review meetings.',
          'Hazard Hierarchy: 1. Elimination -> 2. Substitution -> 3. Engineering -> 4. Administrative -> 5. PPE.'
        ]
      },
      {
        sectionTitle: 'WHO GMP Hygiene Standards & Emergency Management',
        content: 'Strict cleanroom standards and immediate incident reporting.',
        bulletPoints: [
          'Hygiene: Daily bathing, trimmed nails, no jewelry/watches in production, 20-second hand washing before entry, gowning SOPs.',
          'Fire Safety: Quarterly fire drills for all staff, evacuation maps, fire extinguisher training.',
          'Serious Injuries: Report to Factory Inspector within 4 hours.'
        ]
      }
    ],
    acknowledgmentRequired: true
  },
  {
    policyId: 'POL-007',
    policyNumber: 'BJK-HR-POL-007',
    title: 'Training & Development Policy',
    category: 'DEVELOPMENT',
    currentVersion: '1.0',
    effectiveDate: new Date('2026-04-01'),
    reviewDate: new Date('2028-04-01'),
    status: 'PUBLISHED',
    sourceDocument: 'BJK Healthcare HR Policy Handbook',
    sourcePages: 'Pages 49-52',
    hasSourceConflict: false,
    summary: 'Competency-based learning framework, annual TNA by November, 100% mandatory compliance (GMP, POSH, Safety, Privacy, Security), 80% pass mark, and Kirkpatrick evaluation.',
    detailedSections: [
      {
        sectionTitle: 'Annual TNA & 100% Mandatory Training Categories',
        content: 'TNA submitted by November -> Annual Training Calendar released by December.',
        bulletPoints: [
          '100% Mandatory Completion: GMP Basics (within 1st week), Health & Safety (within 1st week), POSH (annual), Code of Conduct (joining + annual), Data Privacy (annual 2h), IT Security (annual 2h), Fire Safety (joining + annual).',
          'Consequences: Non-completion results in restriction from cleanroom duties and direct negative impact on annual performance appraisal.'
        ]
      },
      {
        sectionTitle: 'GMP Technical Qualifications & Leadership Development',
        content: 'Rigorous assessment for pharmaceutical manufacturing.',
        bulletPoints: [
          'GMP Assessment: Written test (min 80% pass) + practical demonstration. Annual refresher min 8 hours. SOP sign-off before performing any critical manufacturing operation.',
          'Leadership Tiers: First-Time Managers (2 days / 16h), Mid-Level (3 days / 24h), Senior Leadership (5 days / 40h), High-Potential HiPo mentoring.'
        ]
      }
    ],
    acknowledgmentRequired: true
  }
];

// 10 Official Gazetted Public Holidays for 2026-27 (Slide 10)
const PUBLIC_HOLIDAYS_2026_27 = [
  { name: 'Independence Day', dateString: '2026-08-15', date: new Date('2026-08-15'), type: 'NATIONAL_HOLIDAY', description: 'National Independence Day' },
  { name: 'Raksha Bandhan', dateString: '2026-08-28', date: new Date('2026-08-28'), type: 'FESTIVAL', description: 'Raksha Bandhan Festival' },
  { name: 'Janmashtami', dateString: '2026-09-04', date: new Date('2026-09-04'), type: 'FESTIVAL', description: 'Janmashtami Celebration' },
  { name: 'Dusshera', dateString: '2026-10-20', date: new Date('2026-10-20'), type: 'FESTIVAL', description: 'Vijaya Dashami' },
  { name: 'Diwali', dateString: '2026-11-08', date: new Date('2026-11-08'), type: 'FESTIVAL', description: 'Deepavali Festival of Lights' },
  { name: 'Gujarati New Year', dateString: '2026-11-10', date: new Date('2026-11-10'), type: 'FESTIVAL', description: 'Bestu Varas / Gujarati New Year' },
  { name: 'Bhai Bij', dateString: '2026-11-11', date: new Date('2026-11-11'), type: 'FESTIVAL', description: 'Bhai Dooj' },
  { name: 'Makar Sankranti', dateString: '2027-01-15', date: new Date('2027-01-15'), type: 'FESTIVAL', description: 'Uttarayan Festival' },
  { name: 'Republic Day', dateString: '2027-01-26', date: new Date('2027-01-26'), type: 'NATIONAL_HOLIDAY', description: 'National Republic Day' },
  { name: 'Holi', dateString: '2027-03-22', date: new Date('2027-03-22'), type: 'FESTIVAL', description: 'Dhuleti / Festival of Colors' }
];

const seedPoliciesAndRules = async () => {
  console.log('[PolicySeed] Seeding Central Policy Rules...');
  for (const rule of DEFAULT_POLICY_RULES) {
    await PolicyRule.findOneAndUpdate(
      { ruleCode: rule.ruleCode },
      { ...rule, isDemo: true },
      { upsert: true, new: true }
    );
  }

  console.log('[PolicySeed] Seeding 13 BJK Healthcare HR Policies...');
  const createdPolicies = [];
  for (const pol of BJK_13_POLICIES) {
    const p = await Policy.findOneAndUpdate(
      { policyId: pol.policyId },
      { ...pol, isDemo: true },
      { upsert: true, new: true }
    );
    createdPolicies.push(p);
  }

  console.log('[PolicySeed] Seeding Official 2026-27 Public Holidays...');
  for (const hol of PUBLIC_HOLIDAYS_2026_27) {
    await HolidayCalendar.findOneAndUpdate(
      { dateString: hol.dateString },
      { ...hol, year: parseInt(hol.dateString.split('-')[0]), facility: 'ALL', isActive: true },
      { upsert: true, new: true }
    );
  }

  console.log('[PolicySeed] Seeding POSH Internal Complaints Committee (ICC)...');
  await ICCCommittee.deleteMany({});
  await ICCCommittee.create({
    committeeTitle: 'BJK Healthcare Internal Complaints Committee (ICC)',
    facility: 'Corporate & All Manufacturing Facilities',
    members: [
      {
        name: 'Dr. Sunita Patel',
        email: 'sunita.patel@bjkhealthcare.com',
        roleInICC: 'PRESIDING_OFFICER',
        gender: 'Female',
        designation: 'Senior Director Quality Systems & Regulatory',
        tenureStartDate: new Date('2026-04-01'),
        tenureEndDate: new Date('2029-03-31')
      },
      {
        name: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@bjkhealthcare.com',
        roleInICC: 'INTERNAL_MEMBER',
        gender: 'Female',
        designation: 'Head of Legal & Statutory Compliance',
        tenureStartDate: new Date('2026-04-01'),
        tenureEndDate: new Date('2029-03-31')
      },
      {
        name: 'Rajesh Trivedi',
        email: 'rajesh.trivedi@bjkhealthcare.com',
        roleInICC: 'INTERNAL_MEMBER',
        gender: 'Male',
        designation: 'Head of EHS & Plant Administration',
        tenureStartDate: new Date('2026-04-01'),
        tenureEndDate: new Date('2029-03-31')
      },
      {
        name: 'Meenakshi Iyer',
        email: 'meenakshi.iyer@womenrightsngo.org',
        roleInICC: 'EXTERNAL_MEMBER_NGO',
        gender: 'Female',
        designation: 'Executive Trustee, Gujarat Women Welfare Trust',
        organization: 'Gujarat Women Welfare Trust (NGO)',
        tenureStartDate: new Date('2026-04-01'),
        tenureEndDate: new Date('2029-03-31')
      }
    ],
    womenPercentage: 75, // 3 out of 4 members are women (statutory requirement >= 50%)
    tenureYears: 3,
    effectiveDate: new Date('2026-04-01')
  });

  console.log('[PolicySeed] Seeding Joint Health & Safety Committee...');
  await SafetyCommittee.deleteMany({});
  await SafetyCommittee.create({
    title: 'BJK Healthcare Joint Health & Safety Committee',
    facility: 'BJK Unit 1 - Formulations Facility',
    totalMembers: 10,
    workerRepresentativeCount: 6, // 60% worker representation (statutory requirement >= 50%)
    managementRepresentativeCount: 4,
    meetingFrequency: 'MONTHLY',
    lastMeetingDate: new Date('2026-03-15'),
    nextMeetingDate: new Date('2026-04-15'),
    meetingMinutesSummary: 'Reviewed cleanroom gowning compliance, chemical fume scrubber maintenance, and quarterly fire drill plan.',
    actionItemsPending: 2,
    isActive: true
  });

  console.log('[PolicySeed] Seeding Diversity & Inclusion 2026 Snapshot...');
  await DiversityMetric.deleteMany({ isDemo: true });
  await DiversityMetric.create({
    year: 2026,
    quarter: 'Q1',
    womenWorkforcePercentage: 18.4, // Handbook notes current: 18%, Target: 30% by 2030
    womenLeadershipPercentage: 15.2, // Target: 25% by 2030
    personsWithDisabilitiesPercentage: 2.1, // Target: 4% by 2030
    genderPayGapPercentage: 1.8, // Target: 0% by 2028
    totalHeadcount: 420,
    femaleCount: 77,
    maleCount: 341,
    otherGenderCount: 2,
    pwdCount: 9,
    payEquityAuditConducted: true,
    blindResumeScreeningActive: true,
    diverseInterviewPanelsActive: true,
    activeERGs: [
      { groupName: 'Women in Pharma Network', memberCount: 54, leadName: 'Dr. Sunita Patel' },
      { groupName: 'Ability Network (Disabilities)', memberCount: 16, leadName: 'Kunal Joshi' },
      { groupName: 'Pride Alliance', memberCount: 21, leadName: 'Simran Varma' }
    ],
    isDemo: true
  });

  console.log('[PolicySeed] Policy master seed completed successfully.');
};

module.exports = {
  seedPoliciesAndRules,
  BJK_13_POLICIES,
  PUBLIC_HOLIDAYS_2026_27
};
