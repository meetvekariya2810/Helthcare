import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  Square,
  Coffee,
  RotateCcw,
  Loader2,
  LocateFixed,
  Lock
} from 'lucide-react';
import { employeeAttendanceAPI } from '../../services/employeeApi';

/**
 * Helper to obtain single-shot device GPS coordinates with high accuracy
 */
const getBrowserPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject({
        code: 'GEOLOCATION_UNSUPPORTED',
        message: 'Your browser does not support GPS location verification. Please use a modern mobile or desktop browser.'
      });
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let message = 'Location access is required to verify your attendance location.';
        let code = 'PERMISSION_DENIED';

        if (error.code === error.PERMISSION_DENIED) {
          code = 'PERMISSION_DENIED';
          message = 'Location permission is required to verify attendance. Please enable location permissions in your browser.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          code = 'POSITION_UNAVAILABLE';
          message = 'Location services are disabled or unavailable. Please enable device GPS and try again.';
        } else if (error.code === error.TIMEOUT) {
          code = 'TIMEOUT';
          message = 'Location request timed out. Please check device GPS and try again.';
        }

        reject({ code, message, originalError: error });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

export const AttendanceGeofenceWidget = ({
  attendance,
  onAttendanceUpdated,
  currentTime
}) => {
  const [locState, setLocState] = useState({
    status: 'IDLE', // 'IDLE' | 'CHECKING' | 'WITHIN' | 'OUTSIDE' | 'PERMISSION_DENIED' | 'ACCURACY_POOR' | 'ERROR'
    message: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState({ type: '', text: '' });

  const isCheckedIn = Boolean(attendance?.checkIn);
  const isCheckedOut = Boolean(attendance?.checkOut);
  const checkInTime = attendance?.actualIn || (attendance?.checkIn ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--');
  const checkOutTime = attendance?.actualOut || (attendance?.checkOut ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--');
  const workingHours = attendance?.workingHours != null && attendance?.workingHours > 0 ? `${attendance.workingHours} hrs` : (isCheckedIn && !isCheckedOut ? 'In Progress' : '--');

  // Perform single on-demand location area verification
  const handleVerifyLocation = async () => {
    setLocState({ status: 'CHECKING', message: 'Verifying attendance area...' });
    setPunchFeedback({ type: '', text: '' });

    try {
      const coords = await getBrowserPosition();
      const res = await employeeAttendanceAPI.locationCheck(coords);

      if (res.data?.allowed || res.data?.status === 'WITHIN_ATTENDANCE_AREA') {
        setLocState({
          status: 'WITHIN',
          message: 'You are within the authorized BJK Healthcare attendance area.'
        });
      } else {
        setLocState({
          status: 'OUTSIDE',
          message: res.data?.message || 'You are outside the authorized BJK Healthcare attendance area.'
        });
      }
    } catch (err) {
      if (err.code === 'PERMISSION_DENIED') {
        setLocState({
          status: 'PERMISSION_DENIED',
          message: 'Location access is required to verify your attendance location. Please enable location in browser settings.'
        });
      } else if (err.code === 'POSITION_UNAVAILABLE') {
        setLocState({
          status: 'ERROR',
          message: 'Location services disabled. Please enable device GPS and try again.'
        });
      } else {
        const msg = err.response?.data?.message || err.message || 'Unable to verify location. Please try again.';
        const isOutside = err.response?.data?.code === 'OUTSIDE_ATTENDANCE_AREA';
        setLocState({
          status: isOutside ? 'OUTSIDE' : 'ERROR',
          message: msg
        });
      }
    }
  };

  // Perform Geofenced Punch In
  const handlePunchIn = async () => {
    setIsProcessing(true);
    setPunchFeedback({ type: '', text: '' });
    setLocState({ status: 'CHECKING', message: 'Acquiring GPS location for attendance punch...' });

    try {
      const coords = await getBrowserPosition();
      const res = await employeeAttendanceAPI.punchIn(coords);

      if (res.data?.success) {
        setLocState({
          status: 'WITHIN',
          message: 'Attendance area verified.'
        });
        setPunchFeedback({
          type: 'SUCCESS',
          text: res.data?.message || 'Punch In successful. Have a safe and productive shift!'
        });
        if (onAttendanceUpdated) onAttendanceUpdated();
      } else {
        setLocState({
          status: 'OUTSIDE',
          message: res.data?.message || 'Attendance blocked: Outside authorized attendance area.'
        });
        setPunchFeedback({
          type: 'ERROR',
          text: res.data?.message || 'Punch In failed.'
        });
      }
    } catch (err) {
      const resp = err.response?.data;
      if (err.code === 'PERMISSION_DENIED') {
        setLocState({
          status: 'PERMISSION_DENIED',
          message: 'Location Permission Required: Location access is required to verify your attendance location.'
        });
        setPunchFeedback({
          type: 'ERROR',
          text: 'Location permission denied. Please allow location access to punch in.'
        });
      } else if (resp?.code === 'OUTSIDE_ATTENDANCE_AREA' || resp?.status === 'OUTSIDE_ATTENDANCE_AREA') {
        setLocState({
          status: 'OUTSIDE',
          message: 'Outside Attendance Area: Attendance can only be recorded when you are within the authorized BJK Healthcare attendance area.'
        });
        setPunchFeedback({
          type: 'ERROR',
          text: resp.message || 'Punch In blocked: You are outside the authorized attendance area.'
        });
      } else if (resp?.code === 'GPS_ACCURACY_TOO_LOW') {
        setLocState({
          status: 'ACCURACY_POOR',
          message: 'Your location accuracy is too low. Please enable precise location and try again.'
        });
        setPunchFeedback({
          type: 'ERROR',
          text: resp.message || 'GPS accuracy is too low. Please enable high accuracy and try again.'
        });
      } else {
        const errMsg = resp?.message || err.message || 'Failed to record punch in.';
        setLocState({ status: 'ERROR', message: errMsg });
        setPunchFeedback({ type: 'ERROR', text: errMsg });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Perform Geofenced Punch Out
  const handlePunchOut = async () => {
    setIsProcessing(true);
    setPunchFeedback({ type: '', text: '' });
    setLocState({ status: 'CHECKING', message: 'Acquiring GPS location for punch out...' });

    try {
      const coords = await getBrowserPosition();
      const res = await employeeAttendanceAPI.punchOut(coords);

      if (res.data?.success) {
        setLocState({
          status: 'WITHIN',
          message: 'Attendance area verified.'
        });
        setPunchFeedback({
          type: 'SUCCESS',
          text: res.data?.message || 'Punch Out successful. Attendance completed for today!'
        });
        if (onAttendanceUpdated) onAttendanceUpdated();
      } else {
        setLocState({
          status: 'OUTSIDE',
          message: res.data?.message || 'Punch Out blocked: Outside authorized attendance area.'
        });
        setPunchFeedback({
          type: 'ERROR',
          text: res.data?.message || 'Punch Out failed.'
        });
      }
    } catch (err) {
      const resp = err.response?.data;
      if (err.code === 'PERMISSION_DENIED') {
        setLocState({
          status: 'PERMISSION_DENIED',
          message: 'Location Permission Required: Location access is required to verify your attendance location.'
        });
        setPunchFeedback({
          type: 'ERROR',
          text: 'Location permission denied. Please allow location access to punch out.'
        });
      } else if (resp?.code === 'OUTSIDE_ATTENDANCE_AREA' || resp?.status === 'OUTSIDE_ATTENDANCE_AREA') {
        setLocState({
          status: 'OUTSIDE',
          message: 'Outside Attendance Area: Attendance can only be recorded when you are within the authorized BJK Healthcare attendance area.'
        });
        setPunchFeedback({
          type: 'ERROR',
          text: resp.message || 'Punch Out blocked: You are outside the authorized attendance area.'
        });
      } else if (resp?.code === 'GPS_ACCURACY_TOO_LOW') {
        setLocState({
          status: 'ACCURACY_POOR',
          message: 'Your location accuracy is too low. Please enable precise location and try again.'
        });
        setPunchFeedback({
          type: 'ERROR',
          text: resp.message || 'GPS accuracy is too low. Please enable high accuracy and try again.'
        });
      } else {
        const errMsg = resp?.message || err.message || 'Failed to record punch out.';
        setLocState({ status: 'ERROR', message: errMsg });
        setPunchFeedback({ type: 'ERROR', text: errMsg });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Break Toggle Handler
  const handleBreakToggle = async () => {
    setIsProcessing(true);
    setPunchFeedback({ type: '', text: '' });
    try {
      if (attendance?.isOnBreak) {
        const res = await employeeAttendanceAPI.endBreak();
        setPunchFeedback({ type: 'SUCCESS', text: res.data?.message || 'Break ended.' });
      } else {
        const res = await employeeAttendanceAPI.startBreak();
        setPunchFeedback({ type: 'SUCCESS', text: res.data?.message || 'Break started.' });
      }
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err) {
      setPunchFeedback({
        type: 'ERROR',
        text: err.response?.data?.message || 'Failed to update break status.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#00A896]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Factory Attendance Console
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                100m Geofenced
              </span>
            </h3>
            <p className="text-xs text-slate-500">Authorized GPS Plant Verification System</p>
          </div>
        </div>

        {/* Location Verification Status Badge */}
        <div className="flex items-center gap-2">
          {locState.status === 'WITHIN' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>🟢 Attendance Area Verified</span>
            </div>
          )}

          {locState.status === 'OUTSIDE' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>🔴 Outside Attendance Area</span>
            </div>
          )}

          {locState.status === 'PERMISSION_DENIED' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Location Permission Required</span>
            </div>
          )}

          {locState.status === 'CHECKING' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Verifying Area...</span>
            </div>
          )}

          {locState.status === 'IDLE' && (
            <button
              type="button"
              onClick={handleVerifyLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
            >
              <LocateFixed className="w-3.5 h-3.5 text-slate-500" />
              <span>Check Attendance Area</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">
            {isCheckedOut ? 'Punched Out' : isCheckedIn ? (attendance?.isOnBreak ? 'On Break' : 'On Duty') : 'Not Checked In'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Punch In</span>
          <span className="text-xs font-bold text-slate-900 font-mono mt-1 block">
            {checkInTime}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Punch Out</span>
          <span className="text-xs font-bold text-slate-900 font-mono mt-1 block">
            {checkOutTime}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Working Duration</span>
          <span className="text-xs font-bold text-[#00A896] font-mono mt-1 block">
            {workingHours}
          </span>
        </div>
      </div>

      {/* Out of Range Notice Banner */}
      {locState.status === 'OUTSIDE' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Outside Authorized Attendance Area</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Attendance can only be recorded when you are within the authorized BJK Healthcare attendance area.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleVerifyLocation}
            className="px-4 py-2 rounded-xl bg-white hover:bg-rose-100/50 text-rose-800 text-xs font-bold border border-rose-300 transition-all shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Location Permission Notice Banner */}
      {locState.status === 'PERMISSION_DENIED' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Location Permission Required</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Location access is required to verify your attendance location. Please enable location services in your device/browser and try again.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleVerifyLocation}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0"
          >
            Enable Location & Try Again
          </button>
        </div>
      )}

      {/* Accuracy Warning Banner */}
      {locState.status === 'ACCURACY_POOR' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Your location accuracy is too low. Please enable precise location in your device settings and try again.
          </p>
        </div>
      )}

      {/* Feedback Messages */}
      {punchFeedback.text && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            punchFeedback.type === 'SUCCESS'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {punchFeedback.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{punchFeedback.text}</span>
        </div>
      )}

      {/* Punch Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Current System Time:</span>
          <strong className="font-mono text-slate-800 text-sm">{currentTime}</strong>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isCheckedIn ? (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePunchIn}
              className="px-6 py-3 rounded-2xl bg-[#00A896] hover:bg-[#009B8D] disabled:opacity-50 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Location & Punching In...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>PUNCH IN</span>
                </>
              )}
            </button>
          ) : !isCheckedOut ? (
            <>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleBreakToggle}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  attendance?.isOnBreak
                    ? 'bg-amber-400 text-slate-900 border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{attendance?.isOnBreak ? 'End Break' : 'Take Break'}</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePunchOut}
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Location & Punching Out...</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>PUNCH OUT</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Attendance Completed for Today</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
