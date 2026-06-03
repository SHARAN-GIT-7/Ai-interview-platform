import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Backend URLs ─────────────────────────────────────────────────────────────
const FACE_API = '/api/proctor/face';   // Face Identity (faceverification/)
const MONITOR_API = '/api/proctor/live';   // Gaze + Device  (Live_Monitor/)

// ─── Timing ───────────────────────────────────────────────────────────────────
const POLL_MS = 2_000;   // how often to poll each backend
const WARN_COOLDOWN = 15_000;  // ms between the same toast type
const MAX_VIOLATIONS = 15;     // total violations before auto-terminate

// ─────────────────────────────────────────────────────────────────────────────
export default function ProctorOverlay({ uniqueId, onTerminate, paused = false }) {
  const navigate = useNavigate();

  // ── Face Identity state (Port 8004) ───────────────────────────────────────
  const [faceOnline, setFaceOnline] = useState(null);
  const [faceStatus, setFaceStatus] = useState('loading');
  const [faceMsg, setFaceMsg] = useState('');
  const [faceViolations, setFaceViolations] = useState(0);

  // ── Gaze + Device state (Port 8005) ───────────────────────────────────────
  const [monitorOnline, setMonitorOnline] = useState(null);
  const [gazeDirection, setGazeDirection] = useState('CENTER');
  const [gazeFlagged, setGazeFlagged] = useState(false);
  const [deviceDetected, setDeviceDetected] = useState(false);
  const [deviceNames, setDeviceNames] = useState([]);
  const [monitorViolations, setMonitorViolations] = useState(0);

  // ── UI / Toast state ──────────────────────────────────────────────────────
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [totalViolations, setTotalViolations] = useState(0);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const terminatedRef = useRef(false);
  const faceTimerRef = useRef(null);
  const monitorTimerRef = useRef(null);
  const lastWarnTime = useRef({});
  const prevMonitorVio = useRef(0);

  // ─── Toast (with cooldown per key) ────────────────────────────────────────
  const fireToast = useCallback((msg, key) => {
    const now = Date.now();
    if (now - (lastWarnTime.current[key] || 0) < WARN_COOLDOWN) return;
    lastWarnTime.current[key] = now;
    setToast(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 6000);
  }, []);

  // ─── Stop both cameras ────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    fetch(`${FACE_API}/reset`, { method: 'POST' }).catch(() => { });
    fetch(`${MONITOR_API}/stop`, { method: 'POST' }).catch(() => { });
  }, []);

  // ─── Terminate session ────────────────────────────────────────────────────
  const terminate = useCallback(() => {
    if (terminatedRef.current) return;
    terminatedRef.current = true;
    clearInterval(faceTimerRef.current);
    clearInterval(monitorTimerRef.current);
    stopAll();
    setShowTerminate(true);
  }, [stopAll]);

  // ─── Poll Face Identity backend (Port 8004) ────────────────────────────────
  const pollFace = useCallback(async () => {
    if (terminatedRef.current) return;
    try {
      const res = await fetch(`${FACE_API}/status`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error('face api error');
      const data = await res.json();
      setFaceOnline(true);

      switch (data.status) {
        case 'AUTHORISED':
          setFaceStatus('ok');
          setFaceMsg('Identity Verified');
          break;
        case 'NO_FACE':
          setFaceStatus('no_face');
          setFaceMsg('Face Not Visible');
          fireToast('⚠️ Face not visible! Please look at the camera.', 'noface');
          break;
        case 'MULTIPLE_FACES':
          setFaceStatus('multiple');
          setFaceMsg('Multiple People');
          setFaceViolations(v => v + 1);
          setIsFlagged(true);
          fireToast('🚨 Multiple faces detected! Ensure you are alone.', 'multiple');
          break;
        case 'UNAUTHORISED':
          setFaceStatus('mismatch');
          setFaceMsg('Identity Mismatch');
          setFaceViolations(v => v + 1);
          setIsFlagged(true);
          fireToast('🚨 Identity mismatch! Original candidate required.', 'mismatch');
          break;
        case 'NO_REFERENCE':
        case 'REFERENCE_LOAD_ERROR':
          setFaceStatus('no_ref');
          setFaceMsg('No Reference Photo');
          fireToast('⚠️ No Aadhar reference photo found.', 'noref');
          break;
        default:
          setFaceStatus('loading');
          setFaceMsg('Starting...');
      }
    } catch {
      setFaceOnline(false);
    }
  }, [fireToast]);

  // ─── Poll Monitor backend (Port 8005) ─────────────────────────────────────
  const pollMonitor = useCallback(async () => {
    if (terminatedRef.current) return;
    try {
      const res = await fetch(`${MONITOR_API}/status`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error('monitor api error');
      const data = await res.json();
      setMonitorOnline(true);

      setGazeDirection(data.gaze_direction || 'CENTER');
      setGazeFlagged(data.gaze_flagged || false);
      setDeviceDetected(data.device_detected || false);
      setDeviceNames(data.device_names || []);

      // Sync violations from backend (only increment when it increases)
      const newVio = data.violations || 0;
      if (newVio > prevMonitorVio.current) {
        const delta = newVio - prevMonitorVio.current;
        setMonitorViolations(v => v + delta);
        prevMonitorVio.current = newVio;
        setIsFlagged(true);
      }

      // Toasts for gaze
      if (data.gaze_flagged) {
        if (data.gaze_direction === 'LEFT')
          fireToast('👁️ You are looking to the LEFT. Please face the screen.', 'gaze_left');
        else if (data.gaze_direction === 'RIGHT')
          fireToast('👁️ You are looking to the RIGHT. Please face the screen.', 'gaze_right');
      }

      // Toast for device
      if (data.device_detected && data.device_names?.length) {
        fireToast(`📱 ${data.device_names.join(', ')} detected! Remove it from view.`, 'device');
      }

    } catch {
      setMonitorOnline(false);
    }
  }, [fireToast]);

  // ─── Keep totalViolations in sync ─────────────────────────────────────────
  useEffect(() => {
    setTotalViolations(faceViolations + monitorViolations);
  }, [faceViolations, monitorViolations]);

  // ─── Auto-terminate on too many violations ─────────────────────────────────
  useEffect(() => {
    if (totalViolations >= MAX_VIOLATIONS && !terminatedRef.current) {
      terminate();
    }
  }, [totalViolations, terminate]);

  // ─── Main lifecycle effect ────────────────────────────────────────────────
  useEffect(() => {
    if (paused) return;

    // ── Step 1: Start face verification (Port 8004) — it owns the camera ──
    fetch(`${FACE_API}/start`, { method: 'POST' }).catch(() => { });

    // ── Step 2: After 1.5s, Port 8004 has the camera. Now start Port 8005.
    //    Port 8005 reads from Port 8004's MJPEG stream — no hardware conflict.
    const monitorBoot = setTimeout(() => {
      fetch(`${MONITOR_API}/start`, { method: 'POST' }).catch(() => { });
    }, 1500);

    // ── Step 3: Begin polling after both have had time to start ──────────
    const boot = setTimeout(() => {
      pollFace();
      pollMonitor();
      faceTimerRef.current = setInterval(pollFace, POLL_MS);
      monitorTimerRef.current = setInterval(pollMonitor, POLL_MS);
    }, 3500);

    return () => {
      clearTimeout(boot);
      clearTimeout(monitorBoot);
      clearInterval(faceTimerRef.current);
      clearInterval(monitorTimerRef.current);
      if (!terminatedRef.current) stopAll();
    };
  }, [paused, pollFace, pollMonitor, stopAll]);

  // ─── Handle terminate confirm ─────────────────────────────────────────────
  const handleConfirm = () => {
    if (onTerminate) onTerminate();
    navigate('/user/dashboard');
  };

  // ─── UI helpers (Tailwind Classes) ─────────────────────────────────────────
  const faceStyle = paused ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
    : faceStatus === 'ok' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
      : faceStatus === 'loading' ? 'text-slate-500 bg-slate-500/10 border-slate-500/30'
        : 'text-red-600 bg-red-600/10 border-red-600/30';

  const faceLabel = paused ? '⏸ Paused'
    : faceStatus === 'ok' ? '✓ Identity OK'
      : faceStatus === 'no_face' ? '! No Face'
        : faceStatus === 'multiple' ? '!! Multiple'
          : faceStatus === 'mismatch' ? '⚠ Mismatch'
            : faceStatus === 'no_ref' ? '? No Reference'
              : '… Starting';

  const gazeStyle = paused ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
    : !monitorOnline ? 'text-slate-500 bg-slate-500/10 border-slate-500/30'
      : deviceDetected ? 'text-red-600 bg-red-600/10 border-red-600/30'
        : gazeFlagged ? 'text-orange-500 bg-orange-500/10 border-orange-500/30'
          : gazeDirection !== 'CENTER' ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
            : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

  const gazeLabel = paused ? '⏸ Paused'
    : !monitorOnline ? '… Offline'
      : deviceDetected ? `📱 ${deviceNames.join('+')} Detected!`
        : gazeFlagged ? `👁 Looking ${gazeDirection}`
          : gazeDirection !== 'CENTER' ? `👁 ${gazeDirection}`
            : '✓ Gaze OK';

  const badgeFlagged = isFlagged || deviceDetected || gazeFlagged;

  const badgeStyle = paused ? 'bg-[#785000]/85 border-amber-500/30 text-white'
    : badgeFlagged ? 'bg-[#080814]/90 border-red-600/30 text-white'
      : 'bg-[#080814]/90 border-emerald-500/30 text-white';

  const dotStyle = paused ? 'bg-amber-500 shadow-[0_0_7px_#f59e0b] opacity-60'
    : badgeFlagged ? 'bg-red-600 shadow-[0_0_7px_#dc2626] animate-pulse'
      : 'bg-emerald-500 shadow-[0_0_7px_#10b981] animate-pulse';

  const videoBorderStyle = paused ? 'border-amber-500'
    : badgeFlagged ? 'border-red-600 shadow-[0_0_16px_rgba(220,38,38,0.33)]'
      : 'border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.33)]';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Offline banners ─────────────────────────────────────────── */}
      {faceOnline === false && !paused && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#92400e] text-white py-1.5 px-4 text-center font-bold text-xs tracking-wide">
          ⚠️ Face Monitor (Port 8004) offline — run: python api_bridge.py
        </div>
      )}
      {monitorOnline === false && !paused && (
        <div className={`fixed left-0 right-0 z-[9999] bg-[#1e3a5f] text-white py-1.5 px-4 text-center font-bold text-xs tracking-wide ${faceOnline === false ? 'top-10' : 'top-0'}`}>
          ⚠️ Live Monitor (Port 8005) offline — run: python api_bridge_monitor.py
        </div>
      )}

      {/* ── Monitor feed (Port 8005) — contains all overlays ────────── */}
      <div className="fixed bottom-5 left-5 z-[9998]">
        <img
          src={`${MONITOR_API}/video_feed`}
          alt="Proctoring Feed"
          className={`w-[220px] h-[165px] object-cover rounded-2xl block border-[2.5px] bg-slate-900 transition-all duration-300 ${videoBorderStyle}`}
          onError={e => { e.target.className += ' opacity-30'; }}
        />

        {/* Two status pills side-by-side below the video */}
        <div className="flex gap-1.5 mt-2">
          {/* Face ID pill */}
          <div className={`flex-1 text-[11px] px-0.5 py-1 text-center border rounded-full font-extrabold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis max-w-[155px] ${faceStyle}`}>
            {faceLabel}
          </div>
          {/* Gaze+Device pill */}
          <div className={`flex-1 text-[11px] px-0.5 py-1 text-center border rounded-full font-extrabold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis max-w-[155px] ${gazeStyle}`}>
            {gazeLabel}
          </div>
        </div>
      </div>

      {/* ── Status badge — bottom-right ──────────────────────────────── */}
      <div className={`fixed bottom-5 right-5 z-[9998] flex items-center gap-2 backdrop-blur-md rounded-full px-4 py-2 text-[11px] font-extrabold tracking-widest uppercase select-none border transition-colors duration-500 ${badgeStyle}`}>
        <div className={`w-2 h-2 rounded-full ${dotStyle}`} />
        {paused
          ? '⏸ Monitoring Paused'
          : badgeFlagged
            ? `⚠ FLAGGED (${totalViolations})`
            : `🔒 Monitoring (${totalViolations})`}
      </div>

      {/* ── Toast warning ─────────────────────────────────────────────── */}
      {showToast && (
        <div className="fixed bottom-20 right-5 z-[99999] max-w-[360px] bg-gradient-to-br from-red-900 to-red-800 text-white font-semibold text-[13px] py-3.5 px-4 rounded-xl shadow-[0_8px_32px_rgba(220,38,38,0.5)] flex gap-3 items-start animate-[slideIn_0.3s_ease]">
          <span className="text-xl">🚨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* ── Termination modal ─────────────────────────────────────────── */}
      {showTerminate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="bg-white rounded-[24px] p-10 max-w-[460px] w-[90%] text-center shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
            <div className="text-[48px] mb-4">🚫</div>
            <h2 className="text-[22px] text-slate-800 mb-2.5 font-bold">
              Session Terminated
            </h2>
            <p className="text-slate-500 mb-2 text-sm">
              Too many integrity violations were detected.
            </p>
            <div className="flex gap-4 mb-7 justify-center flex-wrap">
              <span className="bg-red-600/10 border border-red-600/30 text-red-600 rounded-full px-3 py-1 text-xs font-bold">Face Violations: {faceViolations}</span>
              <span className="bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full px-3 py-1 text-xs font-bold">Monitor Violations: {monitorViolations}</span>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 bg-gradient-to-br from-slate-800 to-[#144542] text-white font-black text-[15px] rounded-xl tracking-wide hover:opacity-90 transition-opacity"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}
