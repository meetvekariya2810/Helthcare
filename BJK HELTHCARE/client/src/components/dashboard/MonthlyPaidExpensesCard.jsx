import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';

export const MonthlyPaidExpensesCard = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Monthly Paid Expenses
        </h3>
        <p className="text-[11px] text-slate-400 font-medium">
          Past 7 months disbursal comparison (₹)
        </p>

        <div className="h-44 w-full flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 rounded-full border-2 border-slate-300 border-t-slate-400 flex items-center justify-center mb-2">
            <PieIcon size={20} className="text-slate-400" />
          </div>
          <span className="text-xs font-semibold text-slate-500">No Data Found</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPaidExpensesCard;
