/**
 * BJK Healthcare Statutory India Payroll Engine
 * Accurately calculates PF, ESI, Professional Tax, TDS, and Overtime
 */

const calculateEmployeePayroll = ({
  basicSalary = 0,
  hra = 0,
  specialAllowance = 0,
  transportAllowance = 0,
  medicalAllowance = 0,
  overtimeHours = 0,
  nightShiftCount = 0,
  overtimeHourlyRateMultiplier = 1.5,
  nightDifferentialPerShift = 250,
  payableDays = 30,
  totalDaysInMonth = 30,
  ptState = 'Gujarat',
  tdsDeclaredAmount = 0
}) => {
  // Proration factor based on attendance
  const prorationFactor = totalDaysInMonth > 0 ? (payableDays / totalDaysInMonth) : 1;

  // Prorated standard earnings
  const earnedBasic = Math.round(basicSalary * prorationFactor);
  const earnedHra = Math.round(hra * prorationFactor);
  const earnedSpecial = Math.round(specialAllowance * prorationFactor);
  const earnedTransport = Math.round(transportAllowance * prorationFactor);
  const earnedMedical = Math.round(medicalAllowance * prorationFactor);

  // Overtime computation (Hourly rate based on standard 26 days * 8h = 208 hours)
  const hourlyBaseRate = basicSalary > 0 ? (basicSalary / 208) : 0;
  const overtimePay = Math.round(overtimeHours * hourlyBaseRate * overtimeHourlyRateMultiplier);

  // Night shift differential
  const nightAllowance = Math.round(nightShiftCount * nightDifferentialPerShift);

  // Total Gross Earnings
  const grossEarnings = earnedBasic + earnedHra + earnedSpecial + earnedTransport + earnedMedical + overtimePay + nightAllowance;

  // Statutory Deductions:
  // 1. Employee Provident Fund (EPF): 12% of Basic (capped at Rs. 15,000 or actual basic)
  const pfEligibleWages = Math.min(earnedBasic, 15000);
  const pfEmployee = Math.round(pfEligibleWages * 0.12);
  const pfEmployer = Math.round(pfEligibleWages * 0.12); // Split into 3.67% PF + 8.33% EPS

  // 2. Employee State Insurance (ESI): 0.75% for employee, 3.25% for employer (Eligible if gross <= 21,000)
  let esiEmployee = 0;
  let esiEmployer = 0;
  if (grossEarnings <= 21000 && grossEarnings > 0) {
    esiEmployee = Math.round(grossEarnings * 0.0075);
    esiEmployer = Math.round(grossEarnings * 0.0325);
  }

  // 3. Professional Tax (Standard State Slabs e.g. Gujarat / Maharashtra)
  let professionalTax = 0;
  if (grossEarnings > 12000) {
    professionalTax = 200;
  } else if (grossEarnings > 9000) {
    professionalTax = 150;
  } else if (grossEarnings > 6000) {
    professionalTax = 80;
  }

  // 4. Tax Deducted at Source (TDS estimate based on monthly slice)
  const annualGrossProjected = grossEarnings * 12;
  let estimatedMonthlyTds = 0;
  if (tdsDeclaredAmount > 0) {
    estimatedMonthlyTds = tdsDeclaredAmount;
  } else if (annualGrossProjected > 1200000) {
    estimatedMonthlyTds = Math.round((annualGrossProjected * 0.15) / 12);
  } else if (annualGrossProjected > 700000) {
    estimatedMonthlyTds = Math.round((annualGrossProjected * 0.08) / 12);
  }

  const totalDeductions = pfEmployee + esiEmployee + professionalTax + estimatedMonthlyTds;
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  // Total Company Cost (CTC)
  const gratuityAccrual = Math.round((earnedBasic * 15) / (26 * 12)); // 4.81% gratuity provision
  const totalCompanyCost = grossEarnings + pfEmployer + esiEmployer + gratuityAccrual;

  return {
    earnings: {
      basic: earnedBasic,
      hra: earnedHra,
      specialAllowance: earnedSpecial,
      transportAllowance: earnedTransport,
      medicalAllowance: earnedMedical,
      overtimePay,
      nightDifferentialAllowance: nightAllowance,
      performanceBonus: 0
    },
    grossEarnings,
    deductions: {
      providentFund: pfEmployee,
      employeeStateInsurance: esiEmployee,
      professionalTax,
      taxDeductedAtSource: estimatedMonthlyTds,
      advanceDeductions: 0,
      otherDeductions: 0
    },
    totalDeductions,
    netPay,
    employerContributions: {
      providentFund: pfEmployer,
      employeeStateInsurance: esiEmployer,
      gratuityAccrual
    },
    totalCompanyCost
  };
};

module.exports = { calculateEmployeePayroll };
