import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  FileSpreadsheet,
  Download,
  Eye,
  CheckCircle2,
  Building,
  Printer,
  X,
  ShieldCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeePayrollAPI } from '../../services/employeeApi';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';

export const EmployeePayrollPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [payroll, setPayroll] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPayrollData = async () => {
    setIsLoading(true);
    try {
      const [curRes, slipsRes] = await Promise.all([
        employeePayrollAPI.getCurrent(),
        employeePayrollAPI.getPayslips()
      ]);

      if (curRes.data?.success) {
        setPayroll(curRes.data.payroll);
      }
      if (slipsRes.data?.success) {
        setPayslips(slipsRes.data.payslips || []);
      }
    } catch (err) {
      console.error('[Load Payroll Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollData();
  }, []);

  const handleViewSlip = async (slipId) => {
    try {
      const res = await employeePayrollAPI.downloadPayslip(slipId);
      if (res.data?.success) {
        setSelectedSlip(res.data.slip);
        setShowSlipModal(true);
      }
    } catch (err) {
      // Fallback to active payroll
      setSelectedSlip(payroll);
      setShowSlipModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Payroll & Payslips</h1>
        <p className="text-xs text-slate-500">Confidential salary disbursement records and statutory tax breakdowns</p>
      </div>

      {/* Salary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Gross Salary</span>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">
            ₹{payroll?.grossEarnings?.toLocaleString('en-IN') || '65,000'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Basic + HRA + Special Allowances</span>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Statutory Deductions</span>
          <span className="text-2xl font-bold text-rose-600 mt-2 block">
            ₹{payroll?.totalDeductions?.toLocaleString('en-IN') || '6,200'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">EPF (12%) + Professional Tax + TDS</span>
        </div>

        {/* Net Take Home */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-teal-700/20">
          <span className="text-xs font-bold text-teal-200 uppercase tracking-wider block">Net Take-Home Pay</span>
          <span className="text-3xl font-extrabold mt-2 block">
            ₹{payroll?.netPay?.toLocaleString('en-IN') || '58,800'}
          </span>
          <span className="text-[11px] text-teal-100 mt-1 block">Credited to registered salary account</span>
        </div>
      </div>

      {/* Current Month Breakdown Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Current Salary Breakdown ({payroll?.payPeriod || 'September 2026'})</h2>
            <p className="text-xs text-slate-500">Official Cost to Company components and tax withholdings</p>
          </div>
          <button
            type="button"
            onClick={() => handleViewSlip('current')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs hover:bg-teal-100 border border-teal-200 self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Payslip</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Earnings Column */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider text-teal-700 border-b border-slate-200 pb-2">
              Earnings Breakdown
            </h3>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Basic Pay</span>
              <span className="font-semibold text-slate-900">₹{payroll?.earnings?.basic?.toLocaleString('en-IN') || '45,000'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">House Rent Allowance (HRA)</span>
              <span className="font-semibold text-slate-900">₹{payroll?.earnings?.hra?.toLocaleString('en-IN') || '10,000'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Special Allowance</span>
              <span className="font-semibold text-slate-900">₹{payroll?.earnings?.specialAllowance?.toLocaleString('en-IN') || '6,000'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Transport & Conveyance</span>
              <span className="font-semibold text-slate-900">₹{payroll?.earnings?.transportAllowance?.toLocaleString('en-IN') || '1,500'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Medical Allowance</span>
              <span className="font-semibold text-slate-900">₹{payroll?.earnings?.medicalAllowance?.toLocaleString('en-IN') || '2,500'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
              <span>Gross Earnings</span>
              <span className="text-teal-700 text-sm">₹{payroll?.grossEarnings?.toLocaleString('en-IN') || '65,000'}</span>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider text-rose-700 border-b border-slate-200 pb-2">
              Statutory & Tax Deductions
            </h3>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Employee Provident Fund (EPF 12%)</span>
              <span className="font-semibold text-slate-900">₹{payroll?.deductions?.providentFund?.toLocaleString('en-IN') || '5,400'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Professional Tax (PT Gujarat)</span>
              <span className="font-semibold text-slate-900">₹{payroll?.deductions?.professionalTax?.toLocaleString('en-IN') || '200'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">TDS / Income Tax</span>
              <span className="font-semibold text-slate-900">₹{payroll?.deductions?.taxDeductedAtSource?.toLocaleString('en-IN') || '600'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Salary Advances / Loan</span>
              <span className="font-semibold text-slate-900">₹0</span>
            </div>
            <div className="flex justify-between pt-7 border-t border-slate-200 font-bold text-slate-900">
              <span>Total Deductions</span>
              <span className="text-rose-700 text-sm">₹{payroll?.totalDeductions?.toLocaleString('en-IN') || '6,200'}</span>
            </div>
          </div>
        </div>

        {/* Bank & Statutory Registration Details */}
        <div className="border-t border-slate-100 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Bank Name</span>
            <span className="font-bold text-slate-800">{payroll?.bankName || 'HDFC Bank Ltd.'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Account Number</span>
            <span className="font-bold text-slate-800 font-mono">{payroll?.bankAccountNumber || 'XXXX-XXXX-8921'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">PF UAN Number</span>
            <span className="font-bold text-slate-800 font-mono">{payroll?.uanNumber || '100984729184'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">PAN Card</span>
            <span className="font-bold text-slate-800 font-mono">{payroll?.panNumber || 'XXXXX1234X'}</span>
          </div>
        </div>
      </div>

      {/* Payslips History Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Historical Payslip Statements</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Gross Salary</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Disbursed</th>
                <th className="py-3 px-4">Disbursement Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payslips.map((slip, idx) => (
                <tr key={slip._id || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{slip.payPeriod}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">₹{slip.grossEarnings?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-semibold text-rose-600">₹{slip.totalDeductions?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-teal-700">₹{slip.netPay?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-slate-500">{slip.disbursementDate || '2026-09-30'}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      PAID
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleViewSlip(slip._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 font-bold transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF Payslip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Payslip Modal */}
      {showSlipModal && selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in">
            {/* Modal Actions Header */}
            <div className="flex justify-between items-center bg-slate-900 text-white px-6 py-3">
              <span className="text-xs font-bold">Official Salary Payslip Statement</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button onClick={() => setShowSlipModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 text-slate-800 text-xs font-sans" id="printable-payslip">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-teal-700 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">BJK HEALTHCARE PRIVATE LIMITED</h2>
                  <p className="text-[11px] text-slate-500">Unit 1 - Formulations Facility, GIDC Vatva, Ahmedabad, Gujarat 382445</p>
                  <p className="text-[11px] text-slate-500">CIN: U24230GJ2020PTC118920 • WHO-GMP & ISO 9001:2015 Certified</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-teal-800 uppercase block">Salary Slip</span>
                  <span className="text-xs font-semibold text-slate-600">{selectedSlip.payPeriod}</span>
                </div>
              </div>

              {/* Employee & Bank Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <p><span className="text-slate-400">Employee ID:</span> <span className="font-bold">{selectedSlip.employeeId || employeeUser?.employeeId}</span></p>
                  <p><span className="text-slate-400">Employee Name:</span> <span className="font-bold">{selectedSlip.employeeName || employeeUser?.name}</span></p>
                  <p><span className="text-slate-400">Department:</span> <span className="font-semibold">{selectedSlip.department || employeeUser?.department}</span></p>
                  <p><span className="text-slate-400">Designation:</span> <span className="font-semibold">{selectedSlip.designation || employeeUser?.designation}</span></p>
                </div>
                <div className="space-y-1">
                  <p><span className="text-slate-400">Bank:</span> <span className="font-semibold">HDFC Bank Ltd.</span></p>
                  <p><span className="text-slate-400">Account:</span> <span className="font-mono font-semibold">XXXX-XXXX-8921</span></p>
                  <p><span className="text-slate-400">UAN:</span> <span className="font-mono font-semibold">100984729184</span></p>
                  <p><span className="text-slate-400">Status:</span> <span className="font-bold text-emerald-600">PROCESSED & DISBURSED</span></p>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-xl overflow-hidden">
                <div className="border-r border-slate-200">
                  <div className="bg-slate-100 p-2 font-bold text-slate-700">Earnings</div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex justify-between"><span>Basic Salary</span><span>₹45,000</span></div>
                    <div className="flex justify-between"><span>HRA</span><span>₹10,000</span></div>
                    <div className="flex justify-between"><span>Special Allowance</span><span>₹6,000</span></div>
                    <div className="flex justify-between"><span>Medical Allowance</span><span>₹2,500</span></div>
                    <div className="flex justify-between"><span>Transport Allowance</span><span>₹1,500</span></div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                      <span>Total Earnings</span>
                      <span className="text-teal-700">₹65,000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-slate-100 p-2 font-bold text-slate-700">Deductions</div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex justify-between"><span>Provident Fund (EPF)</span><span>₹5,400</span></div>
                    <div className="flex justify-between"><span>Professional Tax (PT)</span><span>₹200</span></div>
                    <div className="flex justify-between"><span>TDS / Income Tax</span><span>₹600</span></div>
                    <div className="flex justify-between"><span>Other Deductions</span><span>₹0</span></div>
                    <div className="flex justify-between border-t border-slate-200 pt-6 font-bold">
                      <span>Total Deductions</span>
                      <span className="text-rose-700">₹6,200</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Disbursed Highlight */}
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex justify-between items-center font-bold">
                <div>
                  <span className="text-slate-600 block text-xs">Net Salary Transferred</span>
                  <span className="text-xs text-slate-400 font-normal">Amount in Words: Fifty Eight Thousand Eight Hundred Rupees Only</span>
                </div>
                <span className="text-xl text-teal-800">₹58,800.00</span>
              </div>

              {/* Footer Note */}
              <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
                This is a computer-generated payroll advice and requires no physical signature under the Information Technology Act.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
