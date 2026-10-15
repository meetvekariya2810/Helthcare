"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Calendar,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface EmployeeCanteenRecord {
  id: string;
  code: string;
  name: string;
  department: string;
  dietPreference: string;
  monthlyMeals: number;
  subsidyTier: string;
  lastMealDate: string;
}

const mockEmployees: EmployeeCanteenRecord[] = [
  { id: "1", code: "BJK-EMP-001", name: "Dr. Rajesh Sharma", department: "Quality Assurance", dietPreference: "Vegetarian", monthlyMeals: 22, subsidyTier: "Standard 100%", lastMealDate: "2026-10-15" },
  { id: "2", code: "BJK-EMP-002", name: "Vikram Malhotra", department: "Production", dietPreference: "Vegetarian", monthlyMeals: 20, subsidyTier: "Standard 100%", lastMealDate: "2026-10-14" },
  { id: "3", code: "BJK-EMP-003", name: "Ananya Desai", department: "Human Resources", dietPreference: "Jain Meal", monthlyMeals: 19, subsidyTier: "Standard 100%", lastMealDate: "2026-10-15" },
  { id: "4", code: "BJK-EMP-004", name: "Rohan Kulkarni", department: "Engineering", dietPreference: "Vegetarian", monthlyMeals: 23, subsidyTier: "Standard 100%", lastMealDate: "2026-10-14" },
  { id: "5", code: "BJK-EMP-005", name: "Pooja Mehta", department: "Regulatory Affairs", dietPreference: "Special Diet", monthlyMeals: 21, subsidyTier: "Standard 100%", lastMealDate: "2026-10-15" },
];

export default function CanteenEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeCanteenRecord | null>(null);

  const filtered = mockEmployees.filter(
    (e) =>
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Employee Catering Profiles & Dietary Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search employee meal quotas, dietary preferences, and monthly serving records
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code or name..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Verified Plant Workforce ({filtered.length})
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`p-4 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors ${
                  selectedEmployee?.id === emp.id ? "bg-teal-50/60 border-l-4 border-[#00A896]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{emp.name}</div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                      <span>{emp.code}</span>
                      <span>•</span>
                      <span>{emp.department}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                    {emp.dietPreference}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {emp.monthlyMeals} meals this month
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Employee Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Catering Profile Details
          </h3>

          {selectedEmployee ? (
            <div className="space-y-4 text-xs">
              <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 text-[#00A896] font-black text-base flex items-center justify-center mx-auto mb-2">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div className="font-bold text-slate-900 text-sm">{selectedEmployee.name}</div>
                <div className="text-slate-400 font-mono text-[11px]">{selectedEmployee.code}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Department</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.department}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Dietary Style</span>
                  <span className="font-semibold text-orange-600">{selectedEmployee.dietPreference}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Monthly Meal Count</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.monthlyMeals} Servings</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Subsidy Rate</span>
                  <span className="font-semibold text-emerald-600">₹40 Plant Contribution</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Last Meal Served</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedEmployee.lastMealDate}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an employee from the roster to view meal allowances and logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
