import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Mail,
  Phone,
  Building,
  Shield,
  Briefcase,
  Clock
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeTeamAPI } from '../../services/employeeApi';

export const EmployeeTeamPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [teamData, setTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const res = await employeeTeamAPI.getTeam();
        if (res.data?.success) {
          setTeamData(res.data.team);
        }
      } catch (err) {
        console.error('[Load Team Error]:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTeam();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Team & Leadership Hierarchy</h1>
        <p className="text-xs text-slate-500">Supervisory reporting lines and authorized plant colleagues</p>
      </div>

      {/* Leadership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reporting Manager */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
            {teamData?.reportingManager?.name?.charAt(0) || 'M'}
          </div>
          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Reporting Manager
            </span>
            <h3 className="font-bold text-sm text-slate-900 mt-1">{teamData?.reportingManager?.name || 'Dr. Sunita Rao'}</h3>
            <p className="text-slate-600 font-medium">{teamData?.reportingManager?.designation || 'General Manager - Operations'}</p>
            <div className="flex flex-col gap-0.5 pt-2 text-slate-500">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-600" /> {teamData?.reportingManager?.email || 'sunita.rao@bjkhealthcare.com'}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-600" /> {teamData?.reportingManager?.phone || '+91 98250 11442'}</span>
            </div>
          </div>
        </div>

        {/* Team Leader */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg shrink-0">
            {teamData?.teamLead?.name?.charAt(0) || 'T'}
          </div>
          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-bold text-cyan-700 uppercase bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              Shift Team Leader
            </span>
            <h3 className="font-bold text-sm text-slate-900 mt-1">{teamData?.teamLead?.name || 'Karan Verma'}</h3>
            <p className="text-slate-600 font-medium">{teamData?.teamLead?.designation || 'Team Lead - Production & Generics'}</p>
            <div className="flex flex-col gap-0.5 pt-2 text-slate-500">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teal-600" /> {teamData?.teamLead?.email || 'karan.verma@bjkhealthcare.com'}</span>
              <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-teal-600" /> {employeeUser?.department || 'Operations'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            {teamData?.isManagerOrLead ? 'Direct Team Members & Reports' : 'Department Colleagues'}
          </h2>
          <p className="text-xs text-slate-500">Work contacts and active plant shift assignments</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamData?.teamMembers && teamData.teamMembers.length > 0 ? (
            teamData.teamMembers.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{m.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{m.employeeId}</span>
                </div>
                <p className="text-[11px] text-teal-700 font-medium">{m.designation}</p>
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60 mt-1">
                  <p className="truncate">Email: {m.email}</p>
                  <p>Shift: {m.shift}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-6 text-center text-xs text-slate-400">
              You are assigned to the Formulations & Generics Operations Team.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
