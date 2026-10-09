import React, { useState } from 'react';
import {
  CreditCard as FiCreditCard,
  Lock as FiLock,
  CheckCircle as FiCheckCircle,
  AlertCircle as FiAlertCircle,
  Eye as FiEye,
  EyeOff as FiEyeOff
} from 'lucide-react';

const POPULAR_BANKS = [
  'HDFC Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'Punjab National Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'IDFC FIRST Bank',
  'Canara Bank',
  'Other'
];

export default function BankDetailsForm({ data = {}, updateData }) {
  const bank = data.bankDetails || {};
  const [confirmAccountNo, setConfirmAccountNo] = useState(bank.accountNumber || '');
  const [showAccountNo, setShowAccountNo] = useState(false);

  const handleChange = (field, value) => {
    updateData({
      bankDetails: {
        ...bank,
        [field]: value
      }
    });
  };

  const isAccountMatch = !confirmAccountNo || !bank.accountNumber || bank.accountNumber === confirmAccountNo;
  const isIfscValid = !bank.ifscCode || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.ifscCode);

  const getMaskedNumber = (num) => {
    if (!num) return '•••• •••• ••••';
    if (num.length < 4) return '•••• ' + num;
    return '•••• •••• •••• ' + num.slice(-4);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiCreditCard className="text-teal-600 dark:text-teal-400" />
            Step 7: Bank & Financial Information
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Provide direct salary disbursement bank details. Financial records are encrypted and protected under strict RBAC.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-full text-amber-700 dark:text-amber-400 text-xs font-semibold">
          <FiLock size={13} /> Masked & Restricted Access
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
            <FiCreditCard size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Salary Credit Account Preview</div>
            <div className="text-sm font-mono font-bold text-white tracking-widest mt-0.5">
              {showAccountNo ? (bank.accountNumber || 'NOT SPECIFIED') : getMaskedNumber(bank.accountNumber)}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAccountNo(!showAccountNo)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          {showAccountNo ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          {showAccountNo ? 'Mask Account' : 'Show Account'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Account Holder Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={bank.accountHolderName || ''}
            onChange={(e) => handleChange('accountHolderName', e.target.value)}
            placeholder="As per bank passbook / cheque"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Must match employee legal name for NEFT/RTGS salary clearance.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Bank Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            list="popular-banks"
            value={bank.bankName || ''}
            onChange={(e) => handleChange('bankName', e.target.value)}
            placeholder="Select or enter bank name"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <datalist id="popular-banks">
            {POPULAR_BANKS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Branch Name & City <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={bank.branchName || ''}
            onChange={(e) => handleChange('branchName', e.target.value)}
            placeholder="e.g. Ahmedabad Main Branch, Gujarat"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Account Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={bank.accountType || 'Salary'}
            onChange={(e) => handleChange('accountType', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="Salary">Salary Account</option>
            <option value="Savings">Savings Account</option>
            <option value="Current">Current Account</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Account Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            value={bank.accountNumber || ''}
            onChange={(e) => handleChange('accountNumber', e.target.value.replace(/\s+/g, ''))}
            placeholder="Enter bank account number"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Confirm Account Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={confirmAccountNo}
            onChange={(e) => setConfirmAccountNo(e.target.value.replace(/\s+/g, ''))}
            placeholder="Re-enter bank account number"
            className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border ${
              !isAccountMatch
                ? 'border-rose-500 ring-1 ring-rose-500'
                : 'border-slate-200 dark:border-slate-700'
            } rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono`}
          />
          {!isAccountMatch && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <FiAlertCircle size={12} /> Account numbers do not match!
            </p>
          )}
          {isAccountMatch && bank.accountNumber && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <FiCheckCircle size={12} /> Account numbers verified matching.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            IFSC Code (11 alphanumeric characters) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            maxLength={11}
            value={bank.ifscCode || ''}
            onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="e.g. HDFC0001234"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono uppercase"
          />
          {!isIfscValid && bank.ifscCode && (
            <p className="text-[11px] text-amber-500 mt-1">Standard IFSC format: 4 letters + '0' + 6 letters/digits.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            UPI ID / VPA (Optional)
          </label>
          <input
            type="text"
            value={bank.upiId || ''}
            onChange={(e) => handleChange('upiId', e.target.value)}
            placeholder="e.g. name@okaxis / name@okhdfcbank"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
