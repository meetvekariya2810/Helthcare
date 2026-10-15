"use client";

import React, { useState } from "react";
import {
  UtensilsCrossed,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Check,
} from "lucide-react";

interface TodayRosterItem {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  gateInTime: string;
  lunchStatus: "SERVED" | "PENDING";
  servingTime?: string;
  mealType?: string;
}

const mockRoster: TodayRosterItem[] = [
  { id: "1", employeeCode: "BJK-EMP-001", name: "Dr. Rajesh Sharma", department: "Quality Assurance", gateInTime: "08:55 AM", lunchStatus: "SERVED", servingTime: "12:42 PM", mealType: "Veg Thali" },
  { id: "2", employeeCode: "BJK-EMP-002", name: "Vikram Malhotra", department: "Production", gateInTime: "09:02 AM", lunchStatus: "PENDING" },
  { id: "3", employeeCode: "BJK-EMP-003", name: "Ananya Desai", department: "Human Resources", gateInTime: "08:50 AM", lunchStatus: "SERVED", servingTime: "01:10 PM", mealType: "Veg Thali" },
  { id: "4", employeeCode: "BJK-EMP-004", name: "Rohan Kulkarni", department: "Engineering", gateInTime: "09:15 AM", lunchStatus: "PENDING" },
  { id: "5", employeeCode: "BJK-EMP-005", name: "Pooja Mehta", department: "Regulatory Affairs", gateInTime: "09:05 AM", lunchStatus: "SERVED", servingTime: "01:05 PM", mealType: "Special Diet" },
  { id: "6", employeeCode: "BJK-EMP-006", name: "Suresh Patel", department: "Warehouse", gateInTime: "08:45 AM", lunchStatus: "PENDING" },
  { id: "7", employeeCode: "BJK-EMP-007", name: "Kavita Shah", department: "Microbiology", gateInTime: "08:58 AM", lunchStatus: "SERVED", servingTime: "12:55 PM", mealType: "Veg Thali" },
];

export default function CanteenTodayPage() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roster, setRoster] = useState<TodayRosterItem[]>(mockRoster);

  const handleMarkServed = (id: string) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              lunchStatus: "SERVED",
              servingTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              mealType: "Standard Veg Thali",
            }
          : item
      )
    );
  };

  const departments = ["ALL", "Quality Assurance", "Production", "Human Resources", "Engineering", "Regulatory Affairs", "Warehouse", "Microbiology"];

  const filtered = roster.filter((item) => {
    const matchesSearch =
      item.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "ALL" || item.department === selectedDept;
    const matchesStatus = statusFilter === "ALL" || item.lunchStatus === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Today's Plant Lunch Headcount
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking catering status for employees clocked into the plant today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700">
            {roster.filter((r) => r.lunchStatus === "SERVED").length} of {roster.length} Served
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or employee name..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === "ALL" ? "All Departments" : d}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
        >
          <option value="ALL">All Meal Statuses</option>
          <option value="SERVED">Served</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Gate In Time</th>
                <th className="py-3 px-6">Lunch Status</th>
                <th className="py-3 px-6">Serving Detail</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.employeeCode}</div>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 font-medium">{item.department}</td>
                  <td className="py-3.5 px-6 text-slate-600 font-mono">{item.gateInTime}</td>
                  <td className="py-3.5 px-6">
                    {item.lunchStatus === "SERVED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Served</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {item.servingTime ? (
                      <div className="space-y-0.5">
                        <div className="font-mono text-[11px]">{item.servingTime}</div>
                        <div className="text-[10px] text-slate-400">{item.mealType}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    {item.lunchStatus === "PENDING" && (
                      <button
                        onClick={() => handleMarkServed(item.id)}
                        className="px-3 py-1.5 rounded-xl font-semibold text-xs text-white bg-[#00A896] hover:bg-[#009B8D] shadow-sm transition-all"
                      >
                        Mark Served
                      </button>
                    )}
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
