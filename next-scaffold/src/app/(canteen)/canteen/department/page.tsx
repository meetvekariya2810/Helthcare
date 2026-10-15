"use client";

import React from "react";
import { Building2, UtensilsCrossed, TrendingUp } from "lucide-react";

interface DeptCanteenCost {
  department: string;
  headcount: number;
  monthlyMeals: number;
  subsidyAllocated: number;
  avgMealsPerStaff: number;
}

const mockDeptCosts: DeptCanteenCost[] = [
  { department: "Production & Manufacturing", headcount: 95, monthlyMeals: 1980, subsidyAllocated: 79200, avgMealsPerStaff: 20.8 },
  { department: "Quality Assurance (QA)", headcount: 28, monthlyMeals: 580, subsidyAllocated: 23200, avgMealsPerStaff: 20.7 },
  { department: "Quality Control (QC)", headcount: 32, monthlyMeals: 660, subsidyAllocated: 26400, avgMealsPerStaff: 20.6 },
  { department: "Warehouse & Logistics", headcount: 24, monthlyMeals: 490, subsidyAllocated: 19600, avgMealsPerStaff: 20.4 },
  { department: "Microbiology Lab", headcount: 18, monthlyMeals: 370, subsidyAllocated: 14800, avgMealsPerStaff: 20.5 },
  { department: "Engineering & Utilities", headcount: 22, monthlyMeals: 450, subsidyAllocated: 18000, avgMealsPerStaff: 20.4 },
  { department: "Regulatory & Compliance", headcount: 12, monthlyMeals: 240, subsidyAllocated: 9600, avgMealsPerStaff: 20.0 },
  { department: "Human Resources & Admin", headcount: 17, monthlyMeals: 350, subsidyAllocated: 14000, avgMealsPerStaff: 20.5 },
];

export default function CanteenDepartmentPage() {
  const totalHeadcount = mockDeptCosts.reduce((acc, d) => acc + d.headcount, 0);
  const totalCost = mockDeptCosts.reduce((acc, d) => acc + d.subsidyAllocated, 0);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Departmental Catering Cost Allocation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cost-center breakdown of canteen allowances across all 12 operational departments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
            Total Plant Allocation: ₹{totalCost.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Department Name</th>
                <th className="py-3 px-6">Staff Headcount</th>
                <th className="py-3 px-6">Meals Logged</th>
                <th className="py-3 px-6">Avg Servings / Staff</th>
                <th className="py-3 px-6 text-right">Cost Center Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {mockDeptCosts.map((d) => (
                <tr key={d.department} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{d.department}</span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 font-medium">{d.headcount} employees</td>
                  <td className="py-3.5 px-6 font-mono text-slate-700">{d.monthlyMeals.toLocaleString()}</td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono">{d.avgMealsPerStaff}</td>
                  <td className="py-3.5 px-6 text-right font-bold text-emerald-700">
                    ₹{d.subsidyAllocated.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
