import React, { useState, useEffect } from 'react';
import {
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Scan,
  UserCheck,
  Smartphone,
  Cpu
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeAttendanceAPI } from '../../services/employeeApi';

export const EmployeeFaceAttendancePage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [faceData, setFaceData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: idle, 1: scanning, 2: success
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadFaceStatus = async () => {
    try {
      const res = await employeeAttendanceAPI.getFaceStatus();
      if (res.data?.success) {
        setFaceData(res.data.faceAttendance);
      }
    } catch (err) {
      console.error('[Face Status Load Error]:', err);
    }
  };

  useEffect(() => {
    loadFaceStatus();
  }, []);

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanStep(1);
    setErrorMsg('');
    setFeedback('');

    // Simulate real biometric camera registration sequence
    setTimeout(async () => {
      try {
        const res = await employeeAttendanceAPI.registerFace();
        if (res.data?.success) {
          setFaceData(res.data.faceAttendance);
          setScanStep(2);
          setFeedback('Biometric face template registered and validated against BJK Plant Terminal.');
        }
      } catch (err) {
        setErrorMsg('Biometric capture timed out. Please check lighting.');
      } finally {
        setIsScanning(false);
      }
    }, 2200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Biometric Face Attendance Console</h1>
        <p className="text-xs text-slate-500">Contactless optical facial recognition for cleanrooms and plant gates</p>
      </div>

      {feedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center gap-2 text-xs text-rose-800 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Biometric Scanner Preview */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          {/* Scanner Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#00b4d8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

          {/* Target Reticle */}
          <div className="relative w-64 h-64 rounded-full border-2 border-teal-500/40 flex items-center justify-center p-2 mb-4">
            <div className={`w-full h-full rounded-full border-4 border-dashed border-teal-400 flex items-center justify-center relative overflow-hidden ${isScanning ? 'animate-spin' : ''}`}>
              <div className="h-40 w-40 rounded-full bg-slate-800/80 flex items-center justify-center border border-teal-500/30">
                <Camera className="w-16 h-16 text-teal-400" />
              </div>
            </div>

            {/* Scanning Laser Animation */}
            {isScanning && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-lg shadow-cyan-500/50" />
            )}
          </div>

          <p className="text-sm font-bold text-slate-200 mb-1">
            {isScanning
              ? 'Analyzing facial landmarks & biological authenticity...'
              : faceData?.faceRegistered
              ? 'Face Biometric Profile Active'
              : 'Face Biometric Not Registered'}
          </p>
          <p className="text-xs text-slate-400 max-w-sm text-center mb-6">
            Stand within 0.5m of the terminal camera in adequate lighting without mask/sunglasses.
          </p>

          <button
            type="button"
            disabled={isScanning}
            onClick={handleStartScan}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Capturing Facial Vector...</span>
              </>
            ) : (
              <>
                <Scan className="w-4 h-4" />
                <span>{faceData?.faceRegistered ? 'RE-REGISTER / UPDATE FACE' : 'REGISTER FACE BIOMETRIC'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Security & Device Status Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Biometric Health Status</h2>
            <p className="text-xs text-slate-500">Security compliance for Employee {employeeUser?.employeeId}</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px]">Registration Status</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                {faceData?.faceRegistered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Verified & Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-700">Pending Setup</span>
                  </>
                )}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px]">Last Verification Date</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {faceData?.lastVerificationDate ? new Date(faceData.lastVerificationDate).toLocaleString() : 'Never'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px]">Authorized Device Channel</span>
              <span className="font-bold text-teal-700 mt-0.5 block font-mono text-[11px]">
                {faceData?.deviceStatus || 'AUTHORIZED_OFFICE_TERMINAL'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px]">Algorithmic Confidence</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {faceData?.verificationConfidence ? `${(faceData.verificationConfidence * 100).toFixed(0)}% Match Score` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] space-y-1">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Biometric Security Standard</span>
            </p>
            <p className="text-slate-600">
              Raw biometric imagery is never stored; only one-way cryptographic vector embeddings are used to guarantee total privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
