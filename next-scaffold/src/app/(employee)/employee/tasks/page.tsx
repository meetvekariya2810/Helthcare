"use client";

import React, { useState } from "react";
import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  priority: "HIGH" | "MEDIUM" | "ROUTINE";
  completed: boolean;
}

const mockTasks: TaskItem[] = [
  { id: "T1", title: "Review BJK Batch Record B-2026-098", category: "Batch Release", dueDate: "Today", priority: "HIGH", completed: false },
  { id: "T2", title: "Complete Monthly Cleanroom Gowning Checklist", category: "GMP Standard", dueDate: "Tomorrow", priority: "MEDIUM", completed: true },
  { id: "T3", title: "Sign Off ISO 9001:2015 Annual Quality Circular", category: "Compliance", dueDate: "24 Oct", priority: "ROUTINE", completed: false },
];

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Assigned Tasks & Cleanroom Checklists
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Operational responsibilities, batch sign-offs, and compliance workflows
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {tasks.map((t) => (
          <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t.id)}
                className="w-5 h-5 rounded text-[#00A896] focus:ring-[#00A896]"
              />
              <div>
                <div className={`text-xs font-bold ${t.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                  {t.title}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{t.category}</span>
                  <span>•</span>
                  <span>Due: {t.dueDate}</span>
                </div>
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                t.priority === "HIGH"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : t.priority === "MEDIUM"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {t.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
