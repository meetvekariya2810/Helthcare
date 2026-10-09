# MyCO HRMS Reference System — Operational Workflow Map

**Scope:** Business workflows, state transitions, validation checks, and multi-tier approval processes.  
**Reference Source:** MyCO runtime audit and standard pharmaceutical HR lifecycle specifications.

---

## 1. Authentication & Security Access Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as HR Admin / Employee
    participant UI as BJK / MyCO Login View
    participant CF as Cloudflare Turnstile
    participant Auth as Auth Controller
    participant DB as MongoDB Atlas / MyCO DB
    participant Audit as 21 CFR Part 11 Audit Log

    User->>UI: Enter Mobile or Email
    alt Password Mode
        User->>UI: Enter Password + Request Login
        UI->>CF: Verify Turnstile Token
        CF-->>UI: Verified
        UI->>Auth: POST /login (Credentials + Captcha)
        Auth->>DB: Lookup User & Compare Hash (bcrypt)
        alt 2FA Passcode Required
            Auth-->>UI: Require 6-digit Passcode
            User->>UI: Enter Passcode
            UI->>Auth: POST /verify-2fa
        end
    else OTP Mode
        User->>UI: Click "Get OTP"
        UI->>Auth: Request OTP
        Auth-->>User: Dispatch SMS / Email OTP
        User->>UI: Fill 6-Box OTP (.otp-input)
        UI->>Auth: POST /verify-otp
    end
    Auth->>DB: Create User Session
    Auth->>Audit: Record Login Activity (IP, UserAgent, Timestamp)
    Auth-->>UI: Issue JWT Access Token + User Profile
    UI-->>User: Redirect to Permitted Route (/hr or /hrms/me)
```

---

## 2. Employee Onboarding & Lifecycle Workflow

```mermaid
flowchart TD
    Start([Candidate Selected / New Hire]) --> Step1[Step 1: Basic Information<br/>Name, Personal Email, Mobile, Blood Group]
    Step1 --> Step2[Step 2: Employment Details<br/>Plant/Facility, Dept, Grade, Reporting Manager]
    Step2 --> Step3[Step 3: Previous Experience<br/>Past Companies, Relieving Letters, Experience Certs]
    Step3 --> Step4[Step 4: Personal & Family<br/>Parents, Spouse, Dependents, Nominee Details]
    Step4 --> Step5[Step 5: Residential Details<br/>Permanent & Current Address with Proof]
    Step5 --> Step6[Step 6: Education & Qualifications<br/>10th/12th, B.Pharm, M.Pharm, Degree Certs]
    Step6 --> Step7[Step 7: Bank & Financial<br/>Account No, IFSC, Cheque Copy - Masked in Normal UI]
    Step7 --> Step8[Step 8: Identity & Government IDs<br/>Aadhaar, PAN, Voter ID, Passport - Masked]
    Step8 --> Step9[Step 9: Occupational Health & Fitness<br/>Medical Fitness Certificate, Cleanroom Restrictions]
    Step9 --> Step10[Step 10: Pharma Training & Compliance<br/>cGMP, GLP, Fire Safety, PPE Induction]
    Step10 --> Step11[Step 11: Company Documents & Review<br/>Appointment Acceptance, NDA, Code of Conduct]
    
    Step11 --> SubmitReview{Ready for Submission?}
    SubmitReview -- Draft Saved --> Resume[Resume Anytime from Draft Queue]
    Resume --> Step11
    SubmitReview -- Submit --> Verif[HR Verification Review]
    
    Verif --> DeptApprove[Department Head Approval]
    DeptApprove --> HRAdminApprove[HR Admin Final Approval]
    
    HRAdminApprove --> Active[Status: ACTIVE EMPLOYEE<br/>Generate Employee ID, Issue ID Card, Notify IT]
```

---

## 3. Leave Application & Approval Workflow

```mermaid
flowchart LR
    A[Employee Submits Leave Request] --> B{Leave Balance Check}
    B -- Insufficient Quota --> C[Reject: Insufficient Balance]
    B -- Balance Available --> D[Notify Reporting Manager]
    D --> E{Manager Review}
    E -- Rejected --> F[Update Status: REJECTED<br/>Log Reason & Notify Employee]
    E -- Approved --> G{Requires HR Sign-off?}
    G -- Yes (Privilege / Medical) --> H[HR Admin Approval]
    G -- No (Casual 1 day) --> I[Direct Auto-Approval]
    H -- Approved --> J[Update Status: APPROVED<br/>Deduct Quota, Sync Attendance Roster]
    I --> J
    H -- Rejected --> F
```

---

## 4. Attendance Regularization & Overtime Workflow

```mermaid
flowchart TD
    P1[Biometric / Web / Mobile Punch Recorded] --> P2{Check In Time vs Shift Schedule}
    P2 -- Within Grace Period (e.g. 15m) --> P3[Mark Status: PRESENT]
    P2 -- After Grace Period --> P4[Mark Status: LATE IN]
    P2 -- Zero Punch Logged --> P5[Mark Status: ABSENT]
    
    P4 --> RegRequest[Employee Applies for Regularization / On-Duty]
    P5 --> RegRequest
    
    RegRequest --> MgrCheck{Manager Approves?}
    MgrCheck -- Approved --> P6[Regularized: PRESENT<br/>21 CFR Part 11 Audit Trail Recorded]
    MgrCheck -- Rejected --> P7[Status Remains LATE / ABSENT]
    
    P3 --> OTCheck{Shift Working Hours > 8.5h?}
    OTCheck -- Yes --> OTCalc[Calculate Overtime Hours<br/>Route to Department Head for OT Authorization]
    OTCheck -- No --> Standard[Standard Day Logged]
```

---

## 5. Document & Letter Generation Workflow (`pdfService.js`)

```mermaid
flowchart TD
    Req[HR Requests Letter Generation: Offer / Appointment / Experience] --> TokenEngine[Inject Dynamic Employee Tokens]
    TokenEngine --> Template[Select Priority Template from letterSetting]
    Template --> PDFKit[PDFKit Streaming Engine in Node.js]
    PDFKit --> Seal[Embed BJK Healthcare Corporate Seal & SHA-256 Hash]
    Seal --> Part11[Record 21 CFR Part 11 Audit Trail<br/>User, Target Employee, Document Type, Timestamp]
    Part11 --> Stream[Stream Binary PDF Attachment directly to Client]
```
