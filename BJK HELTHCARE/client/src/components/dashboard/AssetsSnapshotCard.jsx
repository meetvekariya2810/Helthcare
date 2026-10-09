import React from 'react';
import { Boxes } from 'lucide-react';

export const AssetsSnapshotCard = ({ data }) => {
  const totalAssets = data?.totalAssets ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Assets
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 font-mono">
            {totalAssets} Total Assets
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          IT Hardware & Facilities Equipment Tracking
        </p>

        <div className="h-44 w-full flex flex-col items-center justify-center text-slate-400">
          <Boxes size={32} className="stroke-[1.5] text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-500">No Data Found</span>
        </div>
      </div>
    </div>
  );
};

export default AssetsSnapshotCard;
