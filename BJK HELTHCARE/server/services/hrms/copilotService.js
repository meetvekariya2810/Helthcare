const Employee = require('../../models/hrms/Employee');
const Attendance = require('../../models/hrms/Attendance');
const Credential = require('../../models/hrms/Credential');
const { LeaveRequest, LeaveBalance, HolidayCalendar } = require('../../models/hrms/Leave');
const { TrainingEnrollment } = require('../../models/hrms/Training');
const { Payroll } = require('../../models/hrms/Payroll');
const Roster = require('../../models/hrms/Roster');
const { Policy, PolicyRule, PolicyAcknowledgment } = require('../../models/hrms/PolicyMaster');
const { DisciplinaryCase } = require('../../models/hrms/DisciplinaryCase');
const { resolveDataScope } = require('./dataScopeService');

// ==============================================================================
// 13 BJK HR POLICIES KNOWLEDGE BASE (Primary Source of Truth)
// ==============================================================================
const POLICY_KNOWLEDGE = [
  {
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    sourcePage: 'Pages 5-7',
    keywords: ['earned leave', 'el balance', 'casual leave', 'sick leave', 'comp off', 'apply earned leave', 'leave rules', 'unauthorized absence', 'leave encashment'],
    answer: `**BJK Healthcare Leave Policy (BJK-HR-POL-001):**
• **Earned Leave (EL):** 7 days/year (accrual 0.58 days/month). Applied for minimum block of 3 consecutive days; maximum continuous 15 days. Advance notice: 15 days for 5+ days; 7 days for 3-4 days. Maximum accumulation: 50 days. Encashment: Max 10 days/year in December. Up to 50 days encashable on separation.
• **Casual Leave (CL):** 7 days/year (max 2 continuous days at a time). Lapses on Dec 31.
• **Sick Leave (SL):** 4 days/year credited Jan 1. Medical certificate mandatory for 3+ days. In GMP cleanroom areas, fitness certificate required after 4+ days.
• **Compensatory Off:** Earned 1:1 for working on weekly off / holiday; must be used within 90 days (non-encashable).
• **Special Leaves:** Bereavement immediate (2 days paid), Bereavement extended (1 day paid), Marriage (5 days paid once in tenure), Birthday/Anniversary (1 day paid).
• **Unauthorized Absence:** 1 day = LOP + salary deduction; 2-3 days = LOP + written warning; 4-7 days = LOP + suspension pending inquiry; 8+ days = Voluntary abandonment / termination.
• **GMP Rule:** GMP refresher training mandatory after 30+ days absence.

[Source: BJK-HR-POL-001, HR Policy Handbook, Page 5-7]`
  },
  {
    policyNumber: 'BJK-HR-POL-002',
    policyTitle: 'Attendance & Punctuality Policy',
    sourcePage: 'Pages 9-13',
    keywords: ['attendance grace period', 'grace period', 'late marks', 'after 8 late marks', 'lateness', 'missed punch', 'working hours', 'overtime', 'shift handover'],
    answer: `**BJK Healthcare Attendance & Punctuality Policy (BJK-HR-POL-002):**
• **Standard Hours:** 6 days/week, 48 hours/week (Factories Act), 10 public holidays/year. General Shift: 9:00 AM - 5:30 PM (Mon-Sat, Lunch 1:00-2:00 PM). Shift A: 7:00 AM - 3:30 PM; Shift B: 3:00 PM - 11:30 PM; Shift C: 11:00 PM - 7:30 AM (30-min shift overlap).
• **Grace Period:** 10 minutes after scheduled shift start. Habitual grace use (5+ times/month) is flagged by HR.
• **Missed Punch:** Inform manager + HR immediately; submit request within 24 hours. 3+ missed punches/month = attendance violation.
• **Late Coming Penalties:**
  - 11-30 min: Verbal warning (up to 3x/month without deduction; subsequent = half-day LOP).
  - 31-60 min: Half-day leave deduction or LOP.
  - 60+ min: Full-day absence / full-day LOP.
• **Monthly Late Frequency:** 1-3 times: noted; 4-5 times: written warning from manager; 6-7 times: written warning from HR + counseling; **8+ times: final warning -> suspension -> termination**.
• **Overtime:** Pre-approved by manager, documented in OT register. Cap: 12 hours/week or 50 hours/quarter (or Comp-Off within 90 days).
• **GMP Handover:** Mandatory face-to-face 30-min overlap review of batches, deviations & OOS. Both sign log. Leaving without handover = GMP deviation + disciplinary action.

[Source: BJK-HR-POL-002, HR Policy Handbook, Page 9-13]`
  },
  {
    policyNumber: 'BJK-HR-POL-003',
    policyTitle: 'Code of Conduct & Ethics Policy',
    sourcePage: 'Pages 14-18',
    keywords: ['code of conduct', 'ethics', 'core values', 'bribery', 'whistleblower', 'conflict of interest', 'confidentiality', 'gifts'],
    answer: `**BJK Healthcare Code of Conduct & Ethics (BJK-HR-POL-003):**
• **6 Core Values:** Integrity, Quality Excellence, Accountability, Respect, Transparency, Social Responsibility.
• **Prohibited Behaviors:** Dishonesty/fraud, falsification of GMP records, insubordination, harassment, violence, substance abuse, theft, sleeping on duty, unauthorized absence.
• **Workplace Relationships:** Supervisor-subordinate relationships must be disclosed in writing to HR. Nepotism and favoritism strictly prohibited.
• **Bribery & Corruption:** Zero tolerance for bribes, kickbacks, or facilitation payments to commercial or government officials.
• **Formulation Confidentiality:** Manufacturing processes, formulations, batch records, and customer data protected indefinitely (2+ years post-exit).
• **Whistleblower Protection:** Multiple confidential channels (manager, HR, anonymous portal). Zero retaliation for good-faith reporting.

[Source: BJK-HR-POL-003, HR Policy Handbook, Page 14-18]`
  },
  {
    policyNumber: 'BJK-HR-POL-004',
    policyTitle: 'Disciplinary Action Policy',
    sourcePage: 'Pages 19-21',
    keywords: ['disciplinary', 'misconduct', 'progressive discipline', 'verbal warning', 'suspension', 'termination', 'gmp data falsification'],
    answer: `**BJK Healthcare Disciplinary Action Policy (BJK-HR-POL-004):**
• **Misconduct Categories:** Minor (lateness, dress code, phone overuse), Major (repeated violations, insubordination, negligence), Gross (theft/fraud, GMP record falsification, violence, bribery, sexual harassment).
• **6-Step Progressive Discipline:**
  1. Verbal Warning (Counseling) — Supervisor/Manager (30 days validity)
  2. Written Warning (1st) — Dept Head / HR (6 months validity)
  3. Final Written Warning — Head - HR (12 months validity)
  4. Suspension (3-7 days) — Head - HR + MD (per case)
  5. Demotion or Transfer — Management + HR (Permanent)
  6. Termination — Managing Director (Final)
• **Step Bypass:** Allowed for gross misconduct, violence, criminal activity, or GMP data falsification.
• **GMP Specific:** Deviations from negligence = retraining + CAPA; falsifying GMP data = gross misconduct -> immediate termination + legal action.

[Source: BJK-HR-POL-004, HR Policy Handbook, Page 19-21]`
  },
  {
    policyNumber: 'BJK-HR-POL-009',
    policyTitle: 'Employee Onboarding & Induction Policy',
    sourcePage: 'Pages 22-25',
    keywords: ['onboarding', 'probation', 'when is my probation review', 'day 30 review', 'day 60 review', 'day 90 review', 'gmp basics test', 'induction'],
    answer: `**BJK Healthcare Employee Onboarding & Induction Policy (BJK-HR-POL-009):**
• **90-Day Journey:** Pre-joining (7-30 days before), full Day 1 schedule, Week 1 orientation, and 30/60/90-day probation milestones.
• **Week 1 Orientation:** Company overview, HR policies, Safety/EHS (3h), QMS (2h), Intro to GMP (4h) with GMP Basics test (pass mark 80%), IT Security (1.5h), and dept orientation.
• **Probation Milestones:**
  - **Day 30 Review:** Training needs assessment, SOP training (read->explain->observe->practice), OJT, equipment operation.
  - **Day 60 Review:** Mid-probation assessment, course correction, bi-weekly buddy checks.
  - **Day 90 Review:** Final assessment -> Outcomes: Confirmed (permanent employee) OR Extended (1-3 months PIP) OR Terminated (unsatisfactory).
• **Regulated Areas GMP Qualification:** 7 modules (GMP Fundamentals, Hygiene, Gowning, Documentation/ALCOA+, Contamination Control, Area Classification, Deviation/CAPA). Pass mark: 80%. Cannot work independently in cleanrooms until qualified.

[Source: BJK-HR-POL-009, HR Policy Handbook, Page 22-25]`
  },
  {
    policyNumber: 'BJK-HR-POL-010',
    policyTitle: 'Employee Separation & Exit Policy',
    sourcePage: 'Pages 26-28',
    keywords: ['resignation', 'resignation process', 'separation', 'retirement age', 'superannuation', 'exit clearance', 'full and final', 'relieving certificate'],
    answer: `**BJK Healthcare Employee Separation & Exit Policy (BJK-HR-POL-010):**
• **7 Separation Types:** Voluntary Resignation, Retirement (age 58), Termination for Cause, Retrenchment, Contract Expiry, Death, Abandonment.
• **Resignation SLAs:**
  - Written submission to manager + HR.
  - Acknowledgment within 2 working days.
  - Retention discussion for high performers within 3 days.
  - Formal acceptance letter issued within 5 days.
  - Notice buyout allowed with HR Head approval; withdrawal allowed prior to formal acceptance.
• **Retirement:** Superannuation at age 58 (HR notice 6 months prior; extension up to 60 for critical roles). Full PF, gratuity, and EL encashment up to 45 days.
• **5-Department Exit Clearance:** Department, IT, Finance, HR, Security.
• **Settlement & Documents:** Full & Final settlement disbursed within 45 days. Experience & Relieving certificate issued within 30 days.

[Source: BJK-HR-POL-010, HR Policy Handbook, Page 26-28]`
  },
  {
    policyNumber: 'BJK-HR-POL-016',
    policyTitle: 'Maternity & Paternity Leave Policy',
    sourcePage: 'Pages 29-31',
    keywords: ['maternity', 'how many days of maternity leave', 'paternity', 'paternity leave', 'parental leave', 'surrogacy', 'miscarriage', 'nursing breaks'],
    answer: `**BJK Healthcare Maternity & Paternity Leave Policy (BJK-HR-POL-016 / conflict ref: POL-011):**
• **Maternity Entitlements (Maternity Benefit Act):**
  - 1st & 2nd child (natural birth): 26 weeks (182 days) fully paid.
  - 3rd child onwards: 12 weeks (84 days) paid.
  - Adoption (<3 months) & Surrogacy: 12 weeks from handover.
  - Miscarriage / Medical Termination: 6 weeks (42 days) paid.
  - Stillbirth (after 20 weeks): 12 weeks paid + EAP counseling.
  - Illness from pregnancy: Additional 1 month paid.
  - Tubectomy: 2 weeks (14 days) paid.
  - Eligibility: Minimum 80 days employment in preceding 12 months.
• **Paternity Leave:** 15 consecutive calendar days fully paid (max 2 children, within 60 days of birth/adoption, max 2 tranches, non-encashable).
• **GMP Provisions:** Immediate risk assessment, reassignment from hazardous substances, flexible hours, modified PPE, and doctor clearance before cleanroom return.
• **Nursing Breaks:** 2 nursing breaks/day until child is 15 months; crèche facility when female staff >= 50.
• **Legal Protection:** No termination during maternity; right to same/equivalent role; appraisal increments protected.
*(Note: Source document conflict flagged for HR verification between title POL-016 and page footer POL-011).*

[Source: BJK-HR-POL-016, HR Policy Handbook, Page 29-31]`
  },
  {
    policyNumber: 'BJK-HR-POL-012',
    policyTitle: 'POSH Policy (Prevention of Sexual Harassment)',
    sourcePage: 'Pages 32-35',
    keywords: ['posh', 'posh complaint process', 'sexual harassment', 'icc', 'internal complaints committee', 'quid pro quo', 'hostile work environment'],
    answer: `**BJK Healthcare POSH Policy (BJK-HR-POL-012):**
• **Legal Basis:** Sexual Harassment of Women at Workplace Act, 2013.
• **5 Categories (Sec 2(n)):** Physical contact & advances, demanding sexual favors, sexually colored remarks, showing pornography, or unwelcome conduct of a sexual nature. Covers Quid Pro Quo and Hostile Work Environment.
• **ICC Composition:** Presiding Officer (senior woman employee), min 2 internal members, 1 external NGO member, and minimum 50% women representation (3-year tenure).
• **Filing & Inquiry SLAs:**
  - Written complaint filed within 3 months (extendable by 3 months).
  - Copy served to respondent within 7 days; respondent reply within 10 days.
  - **Inquiry completed within 90 days.** Report submitted to management within 10 days.
• **Key Protections:** Complete confidentiality of identities, zero retaliation, interim relief (transfer/WFH), and non-compliance fines up to ₹50,000 / license cancellation.

[Source: BJK-HR-POL-012, HR Policy Handbook, Page 32-35]`
  },
  {
    policyNumber: 'BJK-HR-POL-013',
    policyTitle: 'Equal Opportunity & Anti-Discrimination Policy',
    sourcePage: 'Pages 36-38',
    keywords: ['equal opportunity', 'diversity', 'd&i', 'anti-discrimination', 'gender pay gap', 'women leadership', 'disability'],
    answer: `**BJK Healthcare Equal Opportunity & Anti-Discrimination Policy (BJK-HR-POL-013):**
• **Protected Characteristics:** Caste, Religion, Gender, Sexual Orientation, Disability, Age, Marital Status, Pregnancy & Maternity, Domicile, HIV/AIDS Status, Language, Political Opinion.
• **Diversity & Inclusion 2030 Targets:**
  - Women in Workforce: 30% by 2030 (current ~18%).
  - Women in Leadership: 25% by 2030.
  - Persons with Disabilities (RPDA): 4% by 2030.
  - Gender Pay Gap: 0% by 2028.
• **Key Initiatives:** Diverse interview panels, blind resume screening, Employee Resource Groups (Women, Ability, Pride Alliance), gender-neutral parental leave, accessible infrastructure (ramps/elevators), annual pay equity audits, and reasonable accommodations.

[Source: BJK-HR-POL-013, HR Policy Handbook, Page 36-38]`
  },
  {
    policyNumber: 'BJK-HR-POL-014',
    policyTitle: 'Data Privacy & Confidentiality Policy',
    sourcePage: 'Pages 39-41',
    keywords: ['data privacy', 'dpdp', 'confidentiality', 'data breach', 'privacy rights', 'dpo', 'data protection officer'],
    answer: `**BJK Healthcare Data Privacy & Confidentiality Policy (BJK-HR-POL-014):**
• **Legal Basis:** Digital Personal Data Protection Act (DPDP), 2023.
• **Data Classifications:** Public (product info), Internal (policies/memos), Confidential (employee PII, financial reports), Restricted (drug formulations, R&D, patient records, biometric data).
• **Data Subject Rights:** Right to Access, Right to Correction, Right to Erasure, Right to Nominate, Right to Grievance Redressal.
• **Data Breach Protocol:** Report to IT + DPO within 24 hours (databreach@bjkhealthcare.com, +91 9624729729). Data Protection Board notified within 72 hours.
• **Penalties:** Penalties under DPDP Act reach up to ₹250 crores.

[Source: BJK-HR-POL-014, HR Policy Handbook, Page 39-41]`
  },
  {
    policyNumber: 'BJK-HR-POL-015',
    policyTitle: 'IT & Information Security Policy',
    sourcePage: 'Pages 42-44',
    keywords: ['it security', 'password policy', 'mfa', 'security incident', 'cert-in', 'cia triad', 'shadow it'],
    answer: `**BJK Healthcare IT & Information Security Policy (BJK-HR-POL-015):**
• **CIA Triad & Access:** Confidentiality, Integrity, Availability. Unique user IDs, least privilege, Zero Trust.
• **Password Policy:** Minimum 12 characters (uppercase, lowercase, number, special). Rotated every 90 days; last 12 cannot be reused. Account locks automatically after 5 failed attempts.
• **Mandatory MFA:** Remote access (VPN, cloud), privileged admin accounts, GMP systems, financial systems, email.
• **Prohibited:** Shadow IT, unauthorized software, crypto mining, sharing credentials, unauthorized USBs, auto-forwarding email.
• **Incident Response:** Report within 1 hour to IT Security (security@bjkhealthcare.com, +91 9624729729). CERT-In notification within 6 hours.
• **Business Continuity:** Priority 1 (GMP systems) RTO 4-8 hours; Priority 2 (Email/HR) RTO 24 hours. 3-2-1 backup strategy.

[Source: BJK-HR-POL-015, HR Policy Handbook, Page 42-44]`
  },
  {
    policyNumber: 'BJK-HR-POL-011',
    policyTitle: 'Health, Safety & Hygiene Policy',
    sourcePage: 'Pages 45-48',
    keywords: ['health and safety', 'safety', 'zero harm', 'ppe', 'hygiene', 'safety committee', 'fire drill', 'factory inspector'],
    answer: `**BJK Healthcare Health, Safety & Hygiene Policy (BJK-HR-POL-011):**
• **Philosophy:** ZERO HARM (Safety > Production). No injuries, no occupational illnesses, no accidents.
• **EHS PDCA:** Plan, Do, Check, Act. Safety KPIs: LTIFR, TRIR, Near miss reporting, PPE compliance, Fire drill participation.
• **Safety Committee:** Management + worker representatives (minimum 50% workers), meets monthly.
• **Hazard Hierarchy:** 1. Elimination -> 2. Substitution -> 3. Engineering Controls -> 4. Administrative Controls -> 5. PPE (last defense).
• **WHO GMP Hygiene:** Daily bathing, clean clothes, trimmed nails, no jewelry/watches in production, 20-second hand washing before cleanroom entry, cleanroom gowning SOPs.
• **Emergency & Incidents:** Quarterly fire drills for all staff. All incidents/near misses reported immediately under no-blame culture. Serious injuries reported to Factory Inspector within 4 hours.

[Source: BJK-HR-POL-011, HR Policy Handbook, Page 45-48]`
  },
  {
    policyNumber: 'BJK-HR-POL-007',
    policyTitle: 'Training & Development Policy',
    sourcePage: 'Pages 49-52',
    keywords: ['training', 'mandatory training', 'which training is mandatory', 'tna', 'gmp training', 'kirkpatrick', 'leadership development'],
    answer: `**BJK Healthcare Training & Development Policy (BJK-HR-POL-007):**
• **Annual TNA:** Submitted by November -> Annual Training Calendar released by December.
• **100% Mandatory Completion Requirements:**
  - GMP Basics — within 1st week
  - Health & Safety — within 1st week
  - POSH — Annual
  - Code of Conduct — Joining + Annual
  - Data Privacy — Annual (2 hours)
  - IT Security — Annual (2 hours)
  - Fire Safety — Joining + Annual
  - *Non-completion leads to duty restriction and negative appraisal rating.*
• **GMP Regulated Training:** GMP principles, hygiene, gowning, GDP/ALCOA+, contamination control, deviation/CAPA. Written test (min 80% pass) + practical demonstration. Refresher: Annual min 8 hours. SOP sign-off before performing critical tasks.
• **Kirkpatrick Model:** 1. Reaction 2. Learning 3. Behavior 4. Results.
• **Leadership Programs:** First-time managers (2 days/16h), Mid-level (3 days/24h), Senior leadership (5 days/40h), HiPo mentoring.

[Source: BJK-HR-POL-007, HR Policy Handbook, Page 49-52]`
  }
];

const processCopilotQuery = async (queryText, user = {}) => {
  const q = (queryText || '').toLowerCase().trim();
  const timestamp = new Date().toISOString();
  const userRole = user.role || 'EMPLOYEE';
  const scope = resolveDataScope(user);
  const employeeId = user.employeeId || 'BJK-EMP-003';

  // ========================================================
  // 1. RBAC SECURITY & CONFIDENTIALITY GUARDS
  // ========================================================
  if (q.includes('posh') && (q.includes('case details') || q.includes('who complained') || q.includes('respondent') || q.includes('investigation'))) {
    const isICC = ['SUPER_ADMIN', 'DIRECTOR', 'POSH_ICP_MEMBER', 'POSH_ICC_MEMBER', 'DPO', 'HR_HEAD'].includes(userRole) || user.isICCMember;
    if (!isICC) {
      return {
        answer: `🔒 **Strict Confidentiality Restraint (POSH Act 2013 & BJK-HR-POL-012):**\nIndividual POSH complaint details, identities, and inquiry proceedings are strictly restricted to the Internal Complaints Committee (ICC). Normal HRMS users cannot access case records.\n\n[Source: BJK-HR-POL-012, HR Policy Handbook, Page 35]`,
        category: 'SECURITY_RESTRICTION',
        dataSource: 'BJK POSH Confidentiality Engine',
        timestamp,
        data: null
      };
    }
  }

  if (q.includes('salary') || q.includes('payroll') || q.includes('ctc') || q.includes('compensation') || q.includes('bank')) {
    if (userRole === 'EMPLOYEE') {
      if (q.includes('my salary') || q.includes('my payslip') || q.includes('my pay')) {
        const myPayroll = await Payroll.findOne({ employeeId }).sort({ createdAt: -1 });
        if (!myPayroll) {
          return {
            answer: `No processed payslips found for your employee ID (${employeeId}).`,
            category: 'PAYROLL_SELF',
            dataSource: 'MongoDB Collection: `payrolls`',
            timestamp,
            data: null
          };
        }
        return {
          answer: `Your latest payslip for **${myPayroll.payPeriod}**: Net Pay is **₹${myPayroll.netPay?.toLocaleString('en-IN')}** (Gross: ₹${myPayroll.grossEarnings?.toLocaleString('en-IN')}, Deductions: ₹${myPayroll.totalDeductions?.toLocaleString('en-IN')}).`,
          category: 'PAYROLL_SELF',
          dataSource: 'MongoDB Collection: `payrolls`',
          timestamp,
          data: myPayroll
        };
      }
      return {
        answer: `🔒 **Access Denied (RBAC Policy Enforcement):** As an EMPLOYEE, your data scope is restricted to **SELF**. Company-wide remuneration and salary data cannot be disclosed.`,
        category: 'SECURITY_RESTRICTION',
        dataSource: 'BJK RBAC Engine',
        timestamp,
        data: null
      };
    }
  }

  // ========================================================
  // 2. PUBLIC HOLIDAYS QUERY
  // ========================================================
  if (q.includes('holiday') || q.includes('public holiday') || q.includes('gazetted') || q.includes('festivals')) {
    const holidays = await HolidayCalendar.find({ year: { $in: [2026, 2027] } }).sort({ dateString: 1 });
    if (holidays && holidays.length > 0) {
      const hList = holidays.map((h, i) => `${i + 1}. **${h.name}** — ${h.dateString} (${h.type === 'NATIONAL_HOLIDAY' ? 'National Holiday' : 'Festival'})`).join('\n');
      return {
        answer: `**BJK Healthcare Official Public Holidays (2026-27):**\n\n${hList}\n\n*Note: Standard 10 public holidays per year under Factories Act. Manufacturing operations on holidays receive Compensatory Off or Overtime.* \n\n[Source: BJK-HR-POL-002, HR Policy Handbook, Page 10]`,
        category: 'HOLIDAYS',
        dataSource: 'MongoDB Collection: `holidaycalendars`',
        timestamp,
        data: holidays
      };
    }
  }

  // ========================================================
  // 3. PENDING POLICY ACKNOWLEDGMENT QUERY
  // ========================================================
  if (q.includes('policy acknowledgment') || q.includes('pending acknowledgment') || q.includes('acknowledge')) {
    const totalPolicies = await Policy.countDocuments({ status: 'PUBLISHED' });
    const myAcks = await PolicyAcknowledgment.find({ employeeId });
    const ackedNumbers = new Set(myAcks.map(a => a.policyNumber));
    const allPolicies = await Policy.find({ status: 'PUBLISHED' });
    const pendingList = allPolicies.filter(p => !ackedNumbers.has(p.policyNumber));

    return {
      answer: pendingList.length > 0
        ? `You have **${pendingList.length} pending policy acknowledgments** out of ${totalPolicies} total policies:\n\n${pendingList.map(p => `• **${p.policyNumber}**: ${p.title}`).join('\n')}\n\nPlease visit the **Policy Center** to review and submit your digital declaration.\n\n[Source: BJK Healthcare HR Policy Handbook, Page 55]`
        : `✅ **All Policies Acknowledged:** You have completed digital read-and-understood declarations for all ${totalPolicies} BJK Healthcare HR Policies. Thank you for your compliance!`,
      category: 'POLICY_ACKNOWLEDGMENT',
      dataSource: 'MongoDB Collection: `policyacknowledgments`',
      timestamp,
      data: pendingList
    };
  }

  // ========================================================
  // 4. OVERDUE GMP TRAINING QUERY
  // ========================================================
  if (q.includes('overdue gmp') || q.includes('which employees have overdue gmp') || q.includes('gmp training compliance')) {
    const overdue = await TrainingEnrollment.find({
      $or: [{ programTitle: /gmp/i }, { category: 'MANDATORY_REGULATORY' }],
      status: { $in: ['ENROLLED', 'OVERDUE'] }
    }).limit(10);

    return {
      answer: overdue.length > 0
        ? `Found **${overdue.length} employees with pending or overdue mandatory GMP training**:\n\n${overdue.map(t => `• **${t.employeeName}** (${t.employeeId}) — ${t.programTitle} [Status: ${t.status}]`).join('\n')}\n\n*Action required: Per Policy BJK-HR-POL-007, uncertified operators cannot work independently in Grade A/B cleanroom suites.* \n\n[Source: BJK-HR-POL-007, HR Policy Handbook, Page 51-52]`
        : `✅ All active pharmaceutical manufacturing and QC personnel are **100% compliant** with mandatory cGMP training standards.`,
      category: 'GMP_COMPLIANCE',
      dataSource: 'MongoDB Collection: `trainingenrollments`',
      timestamp,
      data: overdue
    };
  }

  // ========================================================
  // 5. EMPLOYEE SELF-SCOPED LEAVE BALANCE & ATTENDANCE
  // ========================================================
  if (q.includes('my el') || q.includes('my balance') || q.includes('leave balance') || (userRole === 'EMPLOYEE' && q.includes('balance'))) {
    const balanceDoc = await LeaveBalance.findOne({ employeeId, year: 2026 });
    if (balanceDoc && balanceDoc.balances) {
      const bText = balanceDoc.balances.map(b => `• **${b.leaveTypeName || b.leaveType}**: Available **${b.available || b.remaining || 0} days** (Allocated: ${b.allocated || b.opening || 0}, Used: ${b.used || 0})`).join('\n');
      return {
        answer: `**Your Current Leave Balance [${user.name || 'Employee'} (${employeeId})]:**\n\n${bText}\n\n*Reminder: Earned Leave requires minimum block of 3 days. Advance notice: 15 days for 5+ days.* \n\n[Source: BJK-HR-POL-001, HR Policy Handbook, Page 5-6]`,
        category: 'LEAVE_SELF',
        dataSource: 'MongoDB Collection: `leavebalances`',
        timestamp,
        data: balanceDoc
      };
    }
  }

  // ========================================================
  // 6. EXACT POLICY KNOWLEDGE MATCHING (13 BJK HR POLICIES)
  // ========================================================
  for (const pol of POLICY_KNOWLEDGE) {
    const match = pol.keywords.some(k => q.includes(k));
    if (match) {
      return {
        answer: pol.answer,
        category: 'POLICY_KNOWLEDGE',
        dataSource: `BJK HR Policy Handbook (${pol.policyNumber}, ${pol.sourcePage})`,
        timestamp,
        data: { policyNumber: pol.policyNumber, title: pol.policyTitle, sourcePage: pol.sourcePage }
      };
    }
  }

  // ========================================================
  // 7. STRICT ANTI-FABRICATION PRINCIPLE (SECTION 38)
  // ========================================================
  // If the query asks for HR policies but is not covered
  if (q.includes('policy') || q.includes('rule') || q.includes('allowed') || q.includes('entitled') || q.includes('process') || q.includes('hr')) {
    return {
      answer: `This information is not defined in the current BJK Healthcare HR Policy configuration. Please contact HR at **hr@bjkhealthcare.com** or submit an inquiry to the HR Department.`,
      category: 'UNDEFINED_POLICY',
      dataSource: 'BJK HR Policy Configuration Guard',
      timestamp,
      data: null
    };
  }

  // General executive briefing default
  const totalEmployees = await Employee.countDocuments({});
  const activeCount = await Employee.countDocuments({ status: { $in: ['ACTIVE', 'ON_PROBATION', 'CONFIRMED'] } });
  const pendingLeavesCount = await LeaveRequest.countDocuments({ status: 'PENDING' });

  return {
    answer: `**BJK Healthcare Digital Brain — HR Copilot [Role: ${userRole}]:**\n\n• **Active Personnel:** ${activeCount} / ${totalEmployees}\n• **Pending Approvals:** ${pendingLeavesCount} leave requests\n• **HR Handbook:** 13 Policies effective 01 April 2026\n• **Data Truth:** Real-time state synchronized with MongoDB \`bjk_healthcare\`.\n\nYou can ask questions such as:\n- *"What is my EL balance?"*\n- *"What is the attendance grace period?"*\n- *"What happens after 8 late marks?"*\n- *"How many days of maternity leave are provided?"*\n- *"Which employees have overdue GMP training?"*\n- *"What are the current public holidays?"*\n- *"What is the POSH complaint process?"*\n- *"What is the resignation process?"*`,
    category: 'EXECUTIVE_BRIEFING',
    dataSource: 'BJK Digital Brain Aggregated Knowledge Graph',
    timestamp,
    data: { totalEmployees, activeCount, pendingLeavesCount }
  };
};

module.exports = { processCopilotQuery };
