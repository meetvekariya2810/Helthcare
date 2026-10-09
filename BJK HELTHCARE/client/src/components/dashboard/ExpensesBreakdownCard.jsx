import React from 'react';
import { Receipt } from 'lucide-react';

export const ExpensesBreakdownCard = ({ data }) => {
  const month = data?.month || 'October-2026';
  const totalSpend = data?.totalSpend ?? 0;
  const currency = data?.currency || '₹';
  const categoryCount = data?.categoryCount ?? 0;
  const categories = data?.categories || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Expenses Breakdown
          </h3>
          <span className="text-sm font-extrabold text-slate-900 font-mono">
            {currency} {totalSpend}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {month} total spend
        </p>

        {/* Center content: Empty state matching Screenshot 4 */}
        <div className="h-44 w-full flex flex-col items-center justify-center text-slate-400">
          <Receipt size={32} className="stroke-[1.5] text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-500">No Data Found</span>
        </div>
      </div>

      {/* Bottom Category count matching Screenshot 4 */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">{categoryCount} Expense Categories</span>
      </div>
    </div>
  );
};

export default ExpensesBreakdownCard;
