"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Factory,
  FlaskConical,
  ShieldCheck,
  Boxes,
  Wrench,
  CreditCard,
  ShoppingCart,
  Globe,
  TrendingUp,
  Activity,
  Building2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Command,
} from "lucide-react";

const departmentWorkspaces = [
  {
    code: "HR",
    name: "Human Resources & Workforce",
    path: "/dashboard/hr",
    icon: Users,
    color: "from-teal-500 to-emerald-600",
    roles: ["SUPER_ADMIN", "DIRECTOR", "HR_ADMIN", "HR_MANAGER", "HR_EXECUTIVE", "RECRUITER", "PAYROLL_ADMIN"],
    count: "91 Active Staff",
    description: "Workforce command center, attendance muster, shift rostering & statutory payroll.",
  },
  {
    code: "PRD",
    name: "Production & Manufacturing",
    path: "/dashboard/production",
    icon: Factory,
    color: "from-indigo-500 to-blue-600",
    roles: ["PRODUCTION_MANAGER", "OPERATIONS_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "4 Active Batches",
    description: "Batch manufacturing execution (eBR), compounding, formulation lines & cleanroom telemetry.",
  },
  {
    code: "QC",
    name: "Quality Control Analytical Lab",
    path: "/dashboard/quality-control",
    icon: FlaskConical,
    color: "from-amber-500 to-orange-600",
    roles: ["QC_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "6 Samples Queue",
    description: "HPLC assays, dissolution, pharmacopoeial testing (IP/USP), sample queues & COA generation.",
  },
  {
    code: "QA",
    name: "Quality Assurance QMS",
    path: "/dashboard/quality-assurance",
    icon: ShieldCheck,
    color: "from-rose-500 to-red-600",
    roles: ["QA_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "3 Batch Releases",
    description: "Batch release sign-off, deviation investigations, CAPA, change control & WHO-GMP audit readiness.",
  },
  {
    code: "WH",
    name: "Warehouse & Inventory",
    path: "/dashboard/warehouse",
    icon: Boxes,
    color: "from-teal-600 to-cyan-700",
    roles: ["WAREHOUSE_MANAGER", "SUPPLY_CHAIN_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "111 Products",
    description: "111-product catalog, raw material lot quarantine, inward GRN receipt & cycle counts.",
  },
  {
    code: "ENG",
    name: "Plant Engineering & Utilities",
    path: "/dashboard/engineering",
    icon: Wrench,
    color: "from-slate-600 to-zinc-800",
    roles: ["OPERATIONS_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "16 Machines Uptime",
    description: "Preventive maintenance, HVAC cleanroom differential pressure, purified water loops & calibration.",
  },
  {
    code: "FIN",
    name: "Finance & Corporate Accounts",
    path: "/dashboard/finance",
    icon: CreditCard,
    color: "from-emerald-600 to-teal-700",
    roles: ["FINANCE_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "₹ 1.84 Cr AR",
    description: "Commercial invoicing, supplier payables (AP), bank reconciliations & cost center budgets.",
  },
  {
    code: "PUR",
    name: "Purchase & Procurement",
    path: "/dashboard/procurement",
    icon: ShoppingCart,
    color: "from-teal-500 to-cyan-600",
    roles: ["SUPER_ADMIN", "DIRECTOR"],
    count: "11 Active POs",
    description: "Approved Supplier List (ASL), raw material purchase orders, vendor qualification & RFQ bids.",
  },
  {
    code: "RA",
    name: "Regulatory Affairs & Dossiers",
    path: "/dashboard/regulatory",
    icon: Globe,
    color: "from-cyan-600 to-blue-700",
    roles: ["REGULATORY_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "50 Export Mkts",
    description: "CTD/eCTD dossier submissions, CDSCO drug manufacturing licenses & international registrations.",
  },
  {
    code: "SLS",
    name: "Commercial, CRM & Sales",
    path: "/dashboard/sales",
    icon: TrendingUp,
    color: "from-indigo-600 to-purple-700",
    roles: ["SALES_MANAGER", "CRM_MANAGER", "EXPORT_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "₹ 4.80 Cr Pipeline",
    description: "B2B client contracts, hospital institutional sales, export inquiries & commercial proposals.",
  },
  {
    code: "MIC",
    name: "QC Microbiology Lab",
    path: "/dashboard/microbiology",
    icon: Activity,
    color: "from-teal-600 to-emerald-700",
    roles: ["QC_MANAGER", "SUPER_ADMIN", "DIRECTOR"],
    count: "24 EM Points",
    description: "Environmental monitoring (EM), settle plates, bioburden & water endotoxin (LAL) testing.",
  },
  {
    code: "FAC",
    name: "Facilities, Security & ETP",
    path: "/dashboard/facilities",
    icon: Building2,
    color: "from-slate-700 to-slate-900",
    roles: ["ADMIN", "SUPER_ADMIN", "DIRECTOR"],
    count: "248 Meals/Day",
    description: "Lavad facility infrastructure, canteen cafeteria logistics, visitor passes & ETP operations.",
  },
];

export default function DashboardDispatcherPage() {
  const router = useRouter();
  const [role, setRole] = useState("SUPER_ADMIN");
  const [userName, setUserName] = useState("Enterprise Administrator");
  const [redirecting, setRedirecting] = useState(false);
  const [targetDept, setTargetDept] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role) setRole(u.role);
        if (u.name) setUserName(u.name);

        const r = (u.role || "").toUpperCase().trim();
        const d = (u.department || "").toLowerCase().trim();

        // Standard Employee / Senior Employee
        if (r === "EMPLOYEE" || r === "SENIOR_EMPLOYEE") {
          setRedirecting(true);
          router.replace("/employee/dashboard");
          return;
        }

        // Canteen operator
        if (r === "CANTEEN_OPERATOR" || d.includes("canteen")) {
          setRedirecting(true);
          router.replace("/canteen/dashboard");
          return;
        }

        // Automatic dispatch based on role or department
        if (r === "PRODUCTION_MANAGER" || d.includes("production")) {
          setTargetDept("/dashboard/production");
        } else if (d.includes("micro") || d.includes("microbiology")) {
          setTargetDept("/dashboard/microbiology");
        } else if (r === "QC_MANAGER" || d.includes("quality control") || d === "qc") {
          setTargetDept("/dashboard/quality-control");
        } else if (r === "QA_MANAGER" || d.includes("quality assurance") || d === "qa") {
          setTargetDept("/dashboard/quality-assurance");
        } else if (r === "WAREHOUSE_MANAGER" || d.includes("warehouse") || d.includes("inventory")) {
          setTargetDept("/dashboard/warehouse");
        } else if (d.includes("engineering") || d.includes("maintenance")) {
          setTargetDept("/dashboard/engineering");
        } else if (r === "FINANCE_MANAGER" || d.includes("finance") || d.includes("account")) {
          setTargetDept("/dashboard/finance");
        } else if (d.includes("purchase") || d.includes("procurement")) {
          setTargetDept("/dashboard/procurement");
        } else if (r === "REGULATORY_MANAGER" || d.includes("regulatory")) {
          setTargetDept("/dashboard/regulatory");
        } else if (r === "SALES_MANAGER" || d.includes("sales")) {
          setTargetDept("/dashboard/sales");
        } else if (d.includes("facility") || d.includes("admin")) {
          setTargetDept("/dashboard/facilities");
        } else if (
          ["SUPER_ADMIN", "DIRECTOR", "HR_ADMIN", "HR_MANAGER"].includes(r) ||
          d.includes("human") ||
          d.includes("executive")
        ) {
          setTargetDept("/dashboard/hr");
        }
      }
    } catch {
      // Ignored
    }
  }, [router]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F172A] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#00A896]/20 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00A896]/20 text-[#02C39A] border border-[#00A896]/30">
              Operations Dispatcher &bull; 21 CFR Part 11
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/80">
              {role}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {userName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Select an authorized department workspace to review live production eBR telemetry, QC laboratory assay queues, batch release authorizations, or workforce muster rolls.
          </p>

          {targetDept && (
            <div className="pt-2">
              <Link
                href={targetDept}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold shadow-md shadow-[#00A896]/30 transition-all"
              >
                <span>Jump to Primary Department Workspace</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 12 Department Workspace Switcher Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Enterprise Department Workspaces (12 Divisions)
            </h2>
            <p className="text-xs text-slate-500">
              Lavad Formulation Plant, Corporate Headquarters & Analytical Labs
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">12 Connected</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departmentWorkspaces.map((dept) => {
            const DeptIcon = dept.icon;
            return (
              <Link
                key={dept.code}
                href={dept.path}
                className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#00A896] hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}>
                      <DeptIcon size={18} />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00A896] transition-colors line-clamp-1">
                    {dept.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-600">
                    {dept.count}
                  </span>
                  <span className="text-[#00A896] group-hover:translate-x-0.5 transition-transform flex items-center space-x-1 font-bold text-[11px]">
                    <span>Open</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
