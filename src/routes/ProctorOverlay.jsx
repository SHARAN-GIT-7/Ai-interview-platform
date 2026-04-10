import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Backend URL ──────────────────────────────────────────────────────────────
const PROCTOR_API = 'http://localhost:8001';

// ─── Timing Constants ─────────────────────────────────────────────────────────
const LIVENESS_MS   = 2_000;   // ⚡ fast Haar face‑presence check (every 2s)
const IDENTITY_MS   = 15_000;  // 🔒 ArcFace identity verification (every 15s)
const STATUS_MS     = 5_000;   // 📊 /status poll (every 5s)
const FLUSH_MS      = 10_000;  // 📤 flush browser violations (every 10s)
const WARN_COOLDOWN = 20_000;  // ms between same toast type

// ─────────────────────────────────────────────────────────────────────────────
export default function ProctorOverlay({ uniqueId, onTerminate }) {
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [serverOnline,       setServerOnline]       = useState(null);
  const [violations,         setViolations]         = useState(0);
  const [isFlagged,          setIsFlagged]          = useState(false);
  const [faceStatus,         setFaceStatus]         = useState('loading'); // 'ok'|'no_face'|'multiple'|'mismatch'|'loading'
  const [warningMsg,         setWarningMsg]         = useState('');
  const [showWarning,        setShowWarning]        = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const videoRef           = useRef(null);
  const streamRef          = useRef(null);
  const canvasRef          = useRef(document.createElement('canvas'));
  const terminatedRef      = useRef(false);
  const livenessLockRef    = useRef(false);   // prevent overlapping liveness calls
  const identityLockRef    = useRef(false);   // prevent overlapping identity calls
  const pendingViolations  = useRef([]);
  const lastWarnTime       = useRef({});
  const livenessTimerRef   = useRef(null);
  const identityTimerRef   = useRef(null);
  const statusTimerRef     = useRef(null);
  const flushTimerRef      = useRef(null);

  // ── Toast (with per-key cooldown) ────────────────────────────────────────
  const showToast = useCallback((msg, key) => {
    const now = Date.now();
    if (now - (lastWarnTime.current[key] || 0) < WARN_COOLDOWN) return;
    lastWarnTime.current[key] = now;
    setWarningMsg(msg);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 6000);
  }, []);

  // ── Terminate session ─────────────────────────────────────────────────────
  const terminate = useCallback(() => {
    if (terminatedRef.current) return;
    terminatedRef.current = true;
    clearInterval(livenessTimerRef.current);
    clearInterval(identityTimerRef.current);
    clearInterval(statusTimerRef.current);
    clearInterval(flushTimerRef.current);
    setShowTerminateModal(true);
  }, []);

  // ── Capture webcam frame → Blob ───────────────────────────────────────────
  const captureBlob = useCallback((quality = 0.90) => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || !streamRef.current || !video.videoWidth || video.readyState < 2) {
        resolve(null); return;
      }
      const canvas = canvasRef.current;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 1 — LIVENESS CHECK (/liveness every 2s)
  // Ultra-fast OpenCV Haar cascade: detects face count in ~50ms
  // Catches: face missing, multiple people in frame
  // Does NOT verify identity (that's Tier 2's job)
  // ──────────────────────────────────────────────────────────────────────────
  const runLiveness = useCallback(async () => {
    if (livenessLockRef.current || terminatedRef.current) return;
    livenessLockRef.current = true;

    try {
      const blob = await captureBlob(0.80);   // lower quality OK for Haar
      if (!blob) return;

      const form = new FormData();
      form.append('file', blob, 'liveness.jpg');

      const res = await fetch(`${PROCTOR_API}/liveness`, {
        method: 'POST', body: form,
        signal: AbortSignal.timeout(4_000),
      });
      if (!res.ok) return;

      const data = await res.json();
      setFaceStatus(data.status === 'ok' ? 'ok' : data.status);

      if (data.status === 'no_face') {
        showToast(
          '📷 Your face is not visible. Please sit directly in front of the camera.',
          'face_missing'
        );
      } else if (data.status === 'multiple') {
        showToast(
          `🚨 ${data.face_count} people detected! Only the registered candidate may be present.`,
          'multiple_faces'
        );
        setViolations(v => v + 1);
      }
      // status === 'ok' → silent, face is visible
    } catch {
      // network or timeout — server might be starting up, stay silent
    } finally {
      livenessLockRef.current = false;
    }
  }, [captureBlob, showToast]);

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 2 — IDENTITY CHECK (/quickcheck every 15s)
  // Full ArcFace verification: confirms the SAME person is still there
  // Catches: person swaps (different person substituted)
  // Higher quality image for accurate feature extraction
  // ──────────────────────────────────────────────────────────────────────────
  const runIdentityCheck = useCallback(async () => {
    if (identityLockRef.current || terminatedRef.current) return;
    identityLockRef.current = true;

    try {
      const blob = await captureBlob(0.95);   // high quality for ArcFace accuracy
      if (!blob) return;

      const form = new FormData();
      form.append('file', blob, 'identity.jpg');

      const res = await fetch(`${PROCTOR_API}/quickcheck`, {
        method: 'POST', body: form,
        signal: AbortSignal.timeout(20_000),   // ArcFace can take up to ~1.5s
      });
      if (!res.ok) return;

      const data = await res.json();

      if (data.match_status === 'failed') {
        setFaceStatus('mismatch');
        const pct = data.match_score != null ? ` (${data.match_score}% similarity)` : '';
        showToast(
          `🚨 Identity verification failed${pct}. Please ensure you are the registered candidate.`,
          'identity_mismatch'
        );
        setViolations(v => v + 1);
      } else if (data.match_status === 'matched') {
        // Identity confirmed — keep face status as 'ok' (liveness already set this)
        setFaceStatus(prev => prev === 'mismatch' ? 'ok' : prev);
      }
      // 'skipped' → no reference loaded, silent
    } catch {
      // network timeout on slow ArcFace — not a violation
    } finally {
      identityLockRef.current = false;
    }
  }, [captureBlob, showToast]);

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 3 — FULL SNAPSHOT (/snapshot every 60–120s via status poll)
  // YOLO device detection + RetinaFace + ArcFace highest accuracy pass
  // ──────────────────────────────────────────────────────────────────────────
  const runFullSnapshot = useCallback(async () => {
    try {
      const blob = await captureBlob(0.95);
      if (!blob) return;
      const form = new FormData();
      form.append('file', blob, 'snapshot.jpg');
      const res = await fetch(`${PROCTOR_API}/snapshot`, { method: 'POST', body: form });
      if (!res.ok) return;
      const data = await res.json();

      if (data.match_status === 'failed') {
        showToast('🚨 Identity mismatch in deep security scan. Session flagged for review.', 'snapshot_mismatch');
        setViolations(v => v + 1);
      } else if (data.match_status === 'multiple_faces') {
        showToast('🚨 Multiple people detected in security scan!', 'multiple_faces');
        setViolations(v => v + 1);
      }
      if (data.devices_found?.length > 0) {
        const list = data.devices_found.map(d => d.device).join(', ');
        showToast(`🚨 Unauthorized item detected: ${list}. Remove from view immediately.`, 'device_found');
        setViolations(v => v + 1);
      }
    } catch { /* silent */ }
  }, [captureBlob, showToast]);

  // ── Poll /status every 5s ─────────────────────────────────────────────────
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`${PROCTOR_API}/status`, {
        signal: AbortSignal.timeout(6_000),
      });
      if (!res.ok) throw new Error('non-ok');
      const data = await res.json();

      setServerOnline(true);
      setViolations(data.stats?.total_violations ?? 0);

      const flagged = data.stats?.is_flagged ?? false;
      setIsFlagged(flagged);
      if (flagged && !terminatedRef.current) terminate();

      if (data.snapshot_due) runFullSnapshot();

    } catch {
      setServerOnline(false);
    }
  }, [runFullSnapshot, terminate]);

  // ── Flush browser violations ──────────────────────────────────────────────
  const flushViolations = useCallback(async () => {
    if (!pendingViolations.current.length) return;
    const batch = [...pendingViolations.current];
    pendingViolations.current = [];
    try {
      await fetch(`${PROCTOR_API}/violations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: uniqueId || 'unknown', events: batch }),
      });
    } catch {
      pendingViolations.current = [...batch, ...pendingViolations.current];
    }
  }, [uniqueId]);

  // ── Tab-switch detection ──────────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        pendingViolations.current.push({
          violation_type: 'tab_switch',
          severity:       'high',
          detected_at:    new Date().toISOString(),
          metadata:       { reason: 'tab_hidden' },
        });
        showToast('⚠️ Tab switch detected! Do not leave this page during the exam.', 'tab_switch');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [showToast]);

  // ── Webcam init ───────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
    }).then(stream => {
      if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    }).catch(() => { /* camera denied */ });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Start all monitoring timers ───────────────────────────────────────────
  useEffect(() => {
    // Initial status check
    pollStatus();

    // Give webcam 3s to warm up before first check
    const warmup = setTimeout(() => {
      // Tier 1: liveness — starts immediately after warmup, runs every 2s
      runLiveness();
      livenessTimerRef.current = setInterval(runLiveness, LIVENESS_MS);

      // Tier 2: identity — first check 5s after warmup, then every 15s
      const firstIdentity = setTimeout(() => {
        runIdentityCheck();
        identityTimerRef.current = setInterval(runIdentityCheck, IDENTITY_MS);
      }, 5_000);

      return () => clearTimeout(firstIdentity);
    }, 3_000);

    statusTimerRef.current = setInterval(pollStatus,       STATUS_MS);
    flushTimerRef.current  = setInterval(flushViolations,  FLUSH_MS);

    return () => {
      clearTimeout(warmup);
      clearInterval(livenessTimerRef.current);
      clearInterval(identityTimerRef.current);
      clearInterval(statusTimerRef.current);
      clearInterval(flushTimerRef.current);
      flushViolations();
    };
  }, [pollStatus, runLiveness, runIdentityCheck, flushViolations]);

  // ── Termination confirm ───────────────────────────────────────────────────
  const handleConfirm = () => {
    if (onTerminate) onTerminate();
    navigate('/user/dashboard');
  };

  // ── Face indicator config ─────────────────────────────────────────────────
  const faceIndicator = {
    ok:        { color: '#10b981', icon: '✓', label: 'Face OK' },
    no_face:   { color: '#f59e0b', icon: '!', label: 'Face Not Visible' },
    multiple:  { color: '#dc2626', icon: '!!', label: 'Multiple People' },
    mismatch:  { color: '#dc2626', icon: '⚠', label: 'Identity Check Failed' },
    loading:   { color: '#6b7280', icon: '…', label: 'Starting...' },
  }[faceStatus] || { color: '#6b7280', icon: '?', label: 'Unknown' };

  const badgeColor = serverOnline === false
    ? '#f59e0b'
    : isFlagged
      ? '#dc2626'
      : faceStatus === 'ok'
        ? '#10b981'
        : '#f59e0b';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Live webcam preview — bottom-left */}
      <div style={{
        position: 'fixed', bottom: 20, left: 20, zIndex: 9998,
      }}>
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{
            width: 160, height: 112, objectFit: 'cover',
            borderRadius: 14, display: 'block',
            border: `3px solid ${faceIndicator.color}`,
            boxShadow: `0 0 16px ${faceIndicator.color}55`,
            transform: 'scaleX(-1)',
            background: '#0f172a',
            transition: 'border-color 0.4s, box-shadow 0.4s',
          }}
        />
        {/* Face status pill under the camera */}
        <div style={{
          marginTop: 6, textAlign: 'center',
          background: `${faceIndicator.color}22`,
          border: `1px solid ${faceIndicator.color}55`,
          borderRadius: 99, padding: '2px 10px',
          fontSize: 11, fontWeight: 700,
          color: faceIndicator.color,
          letterSpacing: 0.5,
        }}>
          {faceIndicator.icon} {faceIndicator.label}
        </div>
      </div>

      {/* Server offline banner */}
      {serverOnline === false && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#b45309', color: '#fff',
          padding: '8px 16px', textAlign: 'center',
          fontWeight: 700, fontSize: 13, letterSpacing: 0.8,
        }}>
          ⚠️ Proctoring server offline — contact support if this persists.
        </div>
      )}

      {/* Status badge — bottom-right */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9998,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(10px)',
        color: '#fff', borderRadius: 99,
        padding: '8px 16px', fontSize: 12,
        fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
        userSelect: 'none',
        border: `1px solid ${badgeColor}44`,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: badgeColor,
          boxShadow: `0 0 8px ${badgeColor}`,
          animation: 'pulse 2s infinite',
        }} />
        {isFlagged
          ? `⚠ FLAGGED (${violations} violations)`
          : `🔒 Monitoring • ${violations} flags`}
      </div>

      {/* Warning toast — bottom-right above badge */}
      {showWarning && (
        <div style={{
          position: 'fixed', bottom: 76, right: 20, zIndex: 9999,
          maxWidth: 350,
          background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
          color: '#fff', fontWeight: 600, fontSize: 13,
          padding: '14px 18px', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(220,38,38,0.5)',
          lineHeight: 1.5,
          display: 'flex', gap: 12, alignItems: 'flex-start',
          animation: 'slideIn 0.3s ease',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🚨</span>
          <span>{warningMsg}</span>
        </div>
      )}

      {/* Termination modal */}
      {showTerminateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 24,
            padding: '48px 40px', maxWidth: 460, width: '90%',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px', fontSize: 40,
            }}>🚫</div>
            <h2 style={{ fontWeight: 900, fontSize: 24, color: '#1e293b', margin: '0 0 12px' }}>
              Session Terminated
            </h2>
            <p style={{ color: '#475569', marginBottom: 8, fontWeight: 500, lineHeight: 1.6 }}>
              Multiple integrity violations were detected during your session.
            </p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>
              This may include identity mismatches, multiple people detected, unauthorized
              devices, or repeated tab switching. Your session data has been flagged.
            </p>
            <button
              onClick={handleConfirm}
              style={{
                width: '100%', padding: '16px 0',
                background: 'linear-gradient(135deg, #144542, #1a5c58)',
                color: '#fff', fontWeight: 900, fontSize: 13,
                textTransform: 'uppercase', letterSpacing: 2,
                border: 'none', borderRadius: 12, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(20,69,66,0.4)',
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
