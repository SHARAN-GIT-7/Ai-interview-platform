import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiPlay, FiSend, FiClock, FiChevronDown, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiLoader, FiCode, FiZap,
  FiUser, FiFlag, FiMaximize2, FiMinimize2, FiRefreshCw,
  FiTerminal, FiList, FiAward,
} from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import ProctorOverlay from '../../routes/ProctorOverlay';

// ── API Base ──────────────────────────────────────────────────────────────────
const API = 'https://supermagnificent-overoptimistically-misty.ngrok-free.dev';

const NGROK_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

// ── Supported languages (from backend languages.py) ───────────────────────────
const LANGUAGES = [
  { key: 'python', display: 'Python 3', monaco: 'python' },
  { key: 'javascript', display: 'JavaScript (Node.js)', monaco: 'javascript' },
  { key: 'java', display: 'Java', monaco: 'java' },
  { key: 'cpp', display: 'C++', monaco: 'cpp' },
  { key: 'c', display: 'C', monaco: 'c' },
  { key: 'typescript', display: 'TypeScript', monaco: 'typescript' },
  { key: 'go', display: 'Go', monaco: 'go' },
  { key: 'rust', display: 'Rust', monaco: 'rust' },
];

// ── Default stubs ─────────────────────────────────────────────────────────────
const DEFAULT_CODE = {
  python: '# Write your solution here\ndef solution():\n    pass\n',
  javascript: '// Write your solution here\nfunction solution() {\n    \n}\n',
  java: '// Write your solution here\nclass Solution {\n    public void solve() {\n        \n    }\n}\n',
  cpp: '// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  c: '// Write your solution here\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}\n',
  typescript: '// Write your solution here\nfunction solution(): void {\n    \n}\n',
  go: '// Write your solution here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello")\n}\n',
  rust: '// Write your solution here\nfn main() {\n    println!("Hello, world!");\n}\n',
};

// ── Difficulty badge colours ──────────────────────────────────────────────────
const DIFF_STYLE = {
  Easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Medium: 'bg-amber-500/10   text-amber-500   border-amber-500/20',
  Hard: 'bg-red-500/10     text-red-500     border-red-500/20',
};

// ── Helper: api call ──────────────────────────────────────────────────────────
async function apiCall(path, options = {}) {
  const token = sessionStorage.getItem('coding_token');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...NGROK_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
  return json;
}

// ── Auth: register or login in the coding platform ───────────────────────────
async function ensureCodingAuth(email, name) {
  // Try cached token first
  const cached = sessionStorage.getItem('coding_token');
  if (cached) {
    try {
      const me = await apiCall('/auth/me');
      sessionStorage.setItem('coding_user_id', me.data?.user_id || '');
      return me.data?.user_id;
    } catch { /* token stale, re-auth */ }
  }

  const password = `AIIP_${email}_secure`;

  // Try login first (user may already exist)
  try {
    const login = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    sessionStorage.setItem('coding_token', login.data.access_token);
    sessionStorage.setItem('coding_user_id', login.data.user_id);
    return login.data.user_id;
  } catch {/* fall through to register */ }

  // Register the user
  const reg = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: name || email.split('@')[0] }),
  });
  sessionStorage.setItem('coding_token', reg.data.access_token);
  sessionStorage.setItem('coding_user_id', reg.data.user_id);
  return reg.data.user_id;
}

function ErrorDisplay({ status, output }) {
  if (!output) return null;
  const lines = output.trim().split('\n');
  const summary = lines[lines.length - 1]; // e.g. "SyntaxError: invalid syntax"
  const lineMatch = output.match(/line (\d+)/i);
  const lineInfo = lineMatch ? `Line ${lineMatch[1]}` : '';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 text-red-400">
        <FiAlertCircle className="shrink-0 text-lg" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{status || 'Error'}</span>
      </div>
      <div className="bg-[#0d1117] border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-red-500/10 px-5 py-4 border-b border-red-500/10">
          <h3 className="text-red-400 font-black text-sm mb-1">{summary}</h3>
          {lineInfo && (
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-red-500/10 rounded text-[9px] font-black text-red-400/60 uppercase border border-red-500/5">{lineInfo}</span>
            </div>
          )}
        </div>
        <div className="p-5 bg-black/20">
          <p className="text-white/20 text-[9px] font-black uppercase mb-3 tracking-[0.3em]">Full Stack Trace</p>
          <pre className="text-white/40 font-mono text-[10px] sm:text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed no-scrollbar select-text">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

function RunResultsViewer({ data, activeQuestion, customStdin }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const results = data?.results || [];
  const current = results[selectedIdx] || null;

  if (!current && results.length === 0) return null;

  const isError = current?.status !== 'Accepted';
  const getFallbackInput = () => {
    if (data?.type === 'custom') return customStdin;
    if (data?.type === 'samples') return activeQuestion?.sample_test_cases?.[selectedIdx]?.input;
    return null;
  };
  const displayInput = current?.input || getFallbackInput() || '(None)';

  return (
    <div className="flex flex-col h-full bg-[#161b22]/30">
      {/* 1. Case Switcher + Status */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-[#161b22]/50">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[70%]">
          {results.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${selectedIdx === i
                ? 'bg-[#DAFF0C] text-[#0d1117] border-[#DAFF0C]'
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                }`}
            >
              Case {i + 1}
            </button>
          ))}
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isError ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
          {current?.status || 'Executed'}
        </div>
      </div>

      {/* 2. Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

        {/* Compilation / Runtime Error specific override */}
        {(current?.compile_output || current?.stderr) && (
          <ErrorDisplay
            status={current.status || (current.compile_output ? 'Compilation Error' : 'Runtime Error')}
            output={current.compile_output || current.stderr}
          />
        )}

        {/* Comparison section */}
        <div className="space-y-5">
          {/* Input */}
          <div className="space-y-2">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Input</p>
            <div className="bg-[#0d1117] border border-white/5 rounded-xl px-3 py-2.5 text-white/80 font-mono text-xs shadow-inner whitespace-nowrap overflow-x-auto custom-scrollbar">
              {displayInput.replace(/\n/g, ' ')}
            </div>
          </div>

          {/* Output Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Output</p>
              <pre className={`bg-[#0d1117] border border-white/8 rounded-xl p-3 font-mono text-xs min-h-[50px] ${isError ? 'text-red-400/70 border-red-500/10' : 'text-emerald-400'}`}>
                {current?.stdout || '(No Output)'}
              </pre>
            </div>
            <div className="space-y-2">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Expected</p>
              <pre className="bg-[#0d1117] border border-white/8 rounded-xl p-3 font-mono text-xs min-h-[50px] text-emerald-400">
                {current?.expected_output || '(N/A)'}
              </pre>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-50">
          <span className="text-[10px] text-white/20 uppercase font-black">Performance Metrics</span>
          <span className="text-[10px] text-white/40 font-mono tracking-wider">EXEC_TIME: {current?.execution_time || 0}s</span>
        </div>
      </div>
    </div>
  );
}

function SubmitResultsViewer({ data }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const tcResults = data?.test_case_results || [];
  const current = tcResults[selectedIdx] || null;
  const isAllPassed = data.status === 'Accepted';

  return (
    <div className="flex flex-col h-full bg-[#161b22]/30">
      {/* 1. Global Performance Banner */}
      <div className={`px-6 py-5 border-b border-white/10 ${isAllPassed ? 'bg-emerald-500/10' : 'bg-red-500/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${isAllPassed ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 border-red-400/30 text-red-400'
              }`}>
              {isAllPassed ? <FiCheckCircle /> : <FiAlertCircle />}
            </div>
            <div>
              <h2 className={`text-xl font-black ${isAllPassed ? 'text-emerald-400' : 'text-red-400'}`}>{data.status}</h2>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mt-1">
                Score: {data.score}% · {data.passed_test_cases}/{data.total_test_cases} Passed
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/20 text-[9px] font-black uppercase mb-1">Time Elapsed</p>
            <p className="text-[#DAFF0C] font-mono font-black">{data.execution_time || 0}ms</p>
          </div>
        </div>
      </div>

      {/* 2. Test Case Selection Grid */}
      <div className="px-5 py-3 bg-[#1c2128] border-b border-white/5 flex items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {tcResults.map((tc, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`w-8 h-8 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center ${selectedIdx === i
                ? 'border-[#DAFF0C] bg-[#DAFF0C]/10 text-[#DAFF0C] shadow-lg'
                : 'border-white/5 bg-white/5 text-white/20 hover:border-white/20'
                }`}
            >
              {tc.status === 'Accepted' ? <FiCheckCircle className="text-xs" /> : <FiXCircle className="text-xs" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Selected Case Detail */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {current && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-white/30 text-[10px] font-black uppercase">Case {selectedIdx + 1} Detail</span>
              {current.is_hidden && <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] font-black uppercase text-white/30 italic tracking-widest border border-white/10">Private Case</span>}
            </div>

            {current.is_hidden ? (
              <div className="bg-[#0d1117] border border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                <FiFlag className="text-white/10 text-3xl mb-3" />
                <p className="text-white/30 text-xs font-medium max-w-[300px]">Hidden test case details are restricted to prevent answer leaking. All outputs are encrypted by the judge engine.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(current.compile_output || current.stderr) && (
                  <ErrorDisplay
                    status={current.status}
                    output={current.compile_output || current.stderr}
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Output</p>
                    <pre className="bg-[#0d1117] border border-white/5 rounded-xl p-3 text-white/60 font-mono text-xs min-h-[40px]">{current.stdout || '(No Output)'}</pre>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Status</p>
                    <div className={`bg-[#0d1117] border border-white/5 rounded-xl p-3 font-mono font-black text-xs min-h-[40px] flex items-center ${current.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {current.status}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export default function MainAssessment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { uniqueId } = location.state || {};
  const editorRef = useRef(null);
  const pollRef = useRef(null);

  // Auth / session
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [authError, setAuthError] = useState('');

  // Questions
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Editor
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [langOpen, setLangOpen] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(null); // seconds from session end_time
  const timerRef = useRef(null);

  // Execution
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('testcase'); // testcase | result
  const [stdin, setStdin] = useState('');
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // UI
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showLangPanel, setShowLangPanel] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [initPhase, setInitPhase] = useState('auth'); // auth | questions | ready | error
  const [initError, setInitError] = useState('');

  // Resizing state
  const [descriptionWidth, setDescriptionWidth] = useState(400);
  const [consoleHeight, setConsoleHeight] = useState(350);
  const isResizingDesc = useRef(false);
  const isResizingConsole = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingDesc.current) {
        // Calculate new width for description panel
        // 48px is the width of the left-most problem list icon bar
        const newWidth = Math.max(250, Math.min(e.clientX - 48, window.innerWidth * 0.6));
        setDescriptionWidth(newWidth);
      }
      if (isResizingConsole.current) {
        // Calculate new height for console panel
        const newHeight = Math.max(150, Math.min(window.innerHeight - e.clientY, window.innerHeight * 0.8));
        setConsoleHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      isResizingDesc.current = false;
      isResizingConsole.current = false;
      document.body.style.cursor = 'default';
      // Remove visual indicators
      document.body.classList.remove('resizing-active');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // ── Initialization ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Auth
        setInitPhase('auth');
        const email = localStorage.getItem('userEmail') || 'candidate@example.com';
        const name = localStorage.getItem('userName') || email.split('@')[0];
        const uid = await ensureCodingAuth(email, name);
        setUserId(uid);

        // 2. Fetch questions
        setInitPhase('questions');
        const qRes = await apiCall('/question/');
        const qs = qRes.data || [];
        setQuestions(qs);

        if (qs.length > 0) {
          await selectQuestion(qs[0], 'python', uid);
        }

        // 3. Start a single assessment session for the entire module (60 mins)
        try {
          const candidateId = uid || email || 'anonymous';
          const sRes = await apiCall('/assessment/start', {
            method: 'POST',
            body: JSON.stringify({ candidate_id: candidateId, duration_minutes: 60 }),
          });
          const sid = sRes.data?.session_id || sRes.data?.id;
          setSessionId(sid);

          // Start countdown once
          const endTime = new Date(sRes.data?.end_time).getTime();
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) clearInterval(timerRef.current);
          }, 1000);
        } catch {
          // If session creation fails, show a local 60-min countdown
          setTimeLeft(60 * 60);
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) { clearInterval(timerRef.current); return 0; }
              return prev - 1;
            });
          }, 1000);
        }

        setInitPhase('ready');
      } catch (err) {
        setInitPhase('error');
        setInitError(err.message || 'Failed to connect to the coding module.');
      } finally {
        setQuestionsLoading(false);
      }
    };
    init();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []); // eslint-disable-line

  // ── Select / switch question ─────────────────────────────────────────────────
  const selectQuestion = async (q, lang, uid) => {
    setActiveQuestion(q);
    setRunResult(null);
    setSubmitResult(null);
    setSubmitError('');
    setActiveTab('testcase');

    // Try to get boilerplate from backend, fall back to defaults
    try {
      const bp = await apiCall(`/question/${q.id}/boilerplate?language=${lang}`);
      setCode(bp.data?.code || DEFAULT_CODE[lang] || '');
    } catch {
      setCode(
        q.boilerplates?.[lang]?.source_code ||
        DEFAULT_CODE[lang] ||
        `# ${q.title}\n`
      );
    }
  };

  // ── Language switch ──────────────────────────────────────────────────────────
  const handleLangChange = async (langKey) => {
    setLangOpen(false);
    setLanguage(langKey);
    if (!activeQuestion) { setCode(DEFAULT_CODE[langKey] || ''); return; }
    try {
      const bp = await apiCall(`/question/${activeQuestion.id}/boilerplate?language=${langKey}`);
      setCode(bp.data?.code || DEFAULT_CODE[langKey] || '');
    } catch {
      setCode(
        activeQuestion.boilerplates?.[langKey]?.source_code ||
        DEFAULT_CODE[langKey] ||
        ''
      );
    }
  };

  // ── Run code ─────────────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (running || submitting || !activeQuestion) return;
    setRunning(true);
    setActiveTab('result');
    setRunResult(null);
    setSubmitResult(null);
    setSubmitError('');
    try {
      const res = await apiCall('/submit/run', {
        method: 'POST',
        body: JSON.stringify({
          question_id: activeQuestion.id,
          language,
          source_code: code,
          stdin,
          candidate_id: userId || 'anonymous',
        }),
      });
      setRunResult(res.data);
    } catch (err) {
      setRunResult({ error: err.message });
    } finally {
      setRunning(false);
    }
  };

  // ── Submit code ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (running || submitting || !activeQuestion) return;
    setSubmitting(true);
    setActiveTab('result');
    setRunResult(null);
    setSubmitResult(null);
    setSubmitError('');

    try {
      const res = await apiCall('/submit/', {
        method: 'POST',
        body: JSON.stringify({
          question_id: activeQuestion.id,
          language,
          source_code: code,
          candidate_id: userId || 'anonymous',
          session_id: sessionId || undefined,
        }),
      });

      const submissionId = res.data?.submission_id || res.data?.id;
      // Poll for status
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await apiCall(`/submit/${submissionId}/status`);
          const data = statusRes.data;
          if (data.job_status === 'completed' || data.job_status === 'failed') {
            clearInterval(pollRef.current);
            setSubmitResult(data);
            setSubmitting(false);
          }
        } catch {
          clearInterval(pollRef.current);
          setSubmitting(false);
          setSubmitError('Lost connection while polling for results.');
        }
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  // ── Finish assessment ────────────────────────────────────────────────────────
  const handleFinishConfirm = async () => {
    if (sessionId) {
      try { await apiCall(`/assessment/${sessionId}/complete`, { method: 'POST' }); } catch {/* ok */ }
    }
    navigate('/coding/results', { state: { uniqueId } });
  };

  // ── Time format ──────────────────────────────────────────────────────────────
  const formatTime = (s) => {
    if (s === null) return '--:--';
    const h = Math.floor(s / 3600);
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
  };

  const isTimeLow = timeLeft !== null && timeLeft < 300;

  // ── Fullscreen toggle ────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  // ── Loading / Error states ───────────────────────────────────────────────────
  if (initPhase !== 'ready' && initPhase !== 'error') {
    const labels = { auth: 'Authenticating...', questions: 'Loading questions...' };
    return (
      <div className="h-screen bg-[#0d1117] flex flex-col items-center justify-center font-sans gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-[#144542]/20" />
          <div className="w-16 h-16 rounded-full border-4 border-[#DAFF0C] border-t-transparent animate-spin absolute inset-0" />
        </div>
        <div className="text-center">
          <p className="text-white font-black text-lg tracking-wide">{labels[initPhase] || 'Initializing...'}</p>
          <p className="text-white/30 text-sm font-medium mt-1">Connecting to coding assessment engine</p>
        </div>
      </div>
    );
  }

  if (initPhase === 'error') {
    return (
      <div className="h-screen bg-[#0d1117] flex items-center justify-center font-sans p-4">
        <div className="bg-[#161b22] border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-white text-xl font-black mb-2">Connection Failed</h2>
          <p className="text-white/50 text-sm mb-6">{initError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-3 bg-[#DAFF0C] text-[#0d1117] font-black text-sm rounded-xl cursor-pointer"
            >
              <FiRefreshCw /> Retry
            </button>
            <button
              onClick={() => navigate('/user/dashboard')}
              className="px-5 py-3 bg-white/5 text-white/70 font-bold text-sm rounded-xl cursor-pointer border border-white/10 hover:bg-white/10"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Allowed languages for this question ─────────────────────────────────────
  const allowedLangs = activeQuestion?.allowed_languages?.length
    ? LANGUAGES.filter(l => activeQuestion.allowed_languages.includes(l.key))
    : LANGUAGES;

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] font-sans overflow-hidden text-white select-none">
      <ProctorOverlay uniqueId={uniqueId} />

      {/* ── TOP NAV BAR ── */}
      <nav className="flex items-center justify-between border-b border-white/8 bg-[#161b22] px-4 py-2.5 z-30 shrink-0">

        {/* Left: Logo + Question selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#DAFF0C]/10 border border-[#DAFF0C]/20 rounded-lg shrink-0">
            <FiZap className="text-[#DAFF0C] text-sm" />
            <span className="text-[#DAFF0C] text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">
              Coding Assessment
            </span>
          </div>

          {/* Question title breadcrumb */}
          {activeQuestion && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/30">Problems /</span>
              <span className="text-white font-semibold truncate max-w-[160px]">{activeQuestion.title}</span>
              <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black border ${DIFF_STYLE[activeQuestion.difficulty] || DIFF_STYLE.Medium}`}>
                {activeQuestion.difficulty}
              </span>
            </div>
          )}
        </div>

        {/* Center: Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${isTimeLow ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-white'
          }`}>
          <FiClock className="text-base" />
          <span className="font-mono font-black text-base tracking-wider">{formatTime(timeLeft)}</span>
        </div>

        {/* Right: User + controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/8">
            <FiUser className="text-white/40 text-xs" />
            <span className="text-white/50 text-xs font-medium truncate max-w-[120px]">
              {localStorage.getItem('userEmail')?.split('@')[0] || 'Candidate'}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            {isFullscreen ? <FiMinimize2 className="text-sm" /> : <FiMaximize2 className="text-sm" />}
          </button>

          <button
            onClick={() => setShowFinishModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#DAFF0C] text-[#0d1117] font-black text-xs uppercase tracking-[0.15em] rounded-xl hover:shadow-lg hover:shadow-[#DAFF0C]/20 transition-all duration-200 cursor-pointer"
          >
            <FiFlag className="text-sm" />
            <span className="hidden sm:block">Finish</span>
          </button>
        </div>
      </nav>

      {/* ── BODY: 3-column layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Question list sidebar ── */}
        <div className="w-12 lg:w-56 bg-[#161b22] border-r border-white/8 flex flex-col overflow-hidden shrink-0 transition-all duration-300">
          <div className="px-3 py-3 border-b border-white/8 hidden lg:flex items-center gap-2">
            <FiList className="text-[#DAFF0C] text-sm" />
            <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Problems</span>
            <span className="ml-auto bg-white/10 text-white/50 text-[9px] font-black px-1.5 py-0.5 rounded-full">{questions.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {questions.map((q, i) => {
              const isActive = activeQuestion?.id === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => selectQuestion(q, language, userId)}
                  className={`w-full text-left transition-all duration-200 cursor-pointer group ${isActive ? 'bg-[#DAFF0C]/10 border-r-2 border-[#DAFF0C]' : 'hover:bg-white/5 border-r-2 border-transparent'
                    }`}
                >
                  {/* Collapsed (icon only) */}
                  <div className="lg:hidden flex items-center justify-center py-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-[#DAFF0C] text-[#0d1117]' : 'bg-white/5 text-white/40'
                      }`}>{i + 1}</span>
                  </div>
                  {/* Expanded */}
                  <div className="hidden lg:block px-3 py-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black mt-0.5 ${isActive ? 'bg-[#DAFF0C] text-[#0d1117]' : 'bg-white/5 text-white/30'
                        }`}>{i + 1}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                          {q.title}
                        </p>
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[8px] font-black border ${DIFF_STYLE[q.difficulty] || DIFF_STYLE.Medium}`}>
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MIDDLE: Problem description ── */}
        <div
          className={`bg-[#161b22] border-r border-white/8 flex flex-col overflow-hidden shrink-0 transition-[width] ${isResizingDesc.current ? 'duration-0' : 'duration-300'} ${panelCollapsed ? 'w-0 border-none' : ''}`}
          style={{ width: panelCollapsed ? 0 : descriptionWidth }}
        >
          {!panelCollapsed && activeQuestion && (
            <>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8">
                <FiCode className="text-[#DAFF0C] text-sm" />
                <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Description</span>
                <button
                  onClick={() => setPanelCollapsed(true)}
                  className="ml-auto text-white/20 hover:text-white/50 text-xs cursor-pointer p-1 rounded"
                  title="Collapse panel"
                >
                  ‹‹
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 space-y-5">
                {/* Title */}
                <div>
                  <h1 className="text-white text-xl font-black leading-snug mb-2">{activeQuestion.title}</h1>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black border ${DIFF_STYLE[activeQuestion.difficulty] || DIFF_STYLE.Medium}`}>
                    {activeQuestion.difficulty}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{activeQuestion.description}</p>
                </div>

                {/* Examples */}
                {activeQuestion.examples?.length > 0 && (
                  <div>
                    {activeQuestion.examples.map((ex, i) => (
                      <div key={i} className="mb-4 bg-[#0d1117] rounded-xl p-4 border border-white/8">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Example {i + 1}</p>
                        {ex.input !== undefined && (
                          <div className="mb-2">
                            <span className="text-white/30 text-xs font-bold">Input: </span>
                            <code className="text-[#DAFF0C] text-xs font-mono">{ex.input}</code>
                          </div>
                        )}
                        {ex.output !== undefined && (
                          <div className="mb-2">
                            <span className="text-white/30 text-xs font-bold">Output: </span>
                            <code className="text-emerald-400 text-xs font-mono">{ex.output}</code>
                          </div>
                        )}
                        {ex.explanation && (
                          <div className="mt-2 pt-2 border-t border-white/8">
                            <span className="text-white/30 text-xs font-bold">Explanation: </span>
                            <span className="text-white/50 text-xs">{ex.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {activeQuestion.constraints?.length > 0 && (
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Constraints</p>
                    <ul className="space-y-1.5">
                      {activeQuestion.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/50 text-xs">
                          <span className="text-[#DAFF0C]/50 mt-0.5">•</span>
                          <code className="font-mono">{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sample test cases */}
                {activeQuestion.sample_test_cases?.length > 0 && (
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Sample Test Cases</p>
                    {activeQuestion.sample_test_cases.map((tc, i) => (
                      <div key={i} className="mb-3 bg-[#0d1117] rounded-xl p-4 border border-white/8">
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-2">Case {i + 1}</p>
                        <div className="text-xs font-mono">
                          <p><span className="text-white/30">Input:  </span><span className="text-[#DAFF0C]">{tc.input}</span></p>
                          <p><span className="text-white/30">Output: </span><span className="text-emerald-400">{tc.expected_output}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* No question selected */}
          {!panelCollapsed && !activeQuestion && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/20 text-sm">No question selected</p>
            </div>
          )}
        </div>

        {/* Panel expand button when collapsed */}
        {panelCollapsed && (
          <button
            onClick={() => setPanelCollapsed(false)}
            style={{ left: 48 }}
            className="absolute top-1/2 -translate-y-1/2 z-20 bg-[#161b22] border border-white/10 text-white/30 hover:text-white/60 text-xs px-1.5 py-3 rounded-r-lg cursor-pointer"
            title="Expand description"
          >
            ››
          </button>
        )}

        {/* Vertical Resizer Handle */}
        {!panelCollapsed && (
          <div
            onMouseDown={(e) => {
              isResizingDesc.current = true;
              document.body.style.cursor = 'col-resize';
            }}
            className="w-1.5 hover:w-1.5 bg-transparent hover:bg-[#DAFF0C]/30 cursor-col-resize z-20 transition-colors group flex items-center justify-center"
            title="Drag to resize description"
          >
            <div className="w-[1px] h-10 bg-white/10 group-hover:bg-[#DAFF0C]/50 rounded-full" />
          </div>
        )}

        {/* ── RIGHT: Editor + Console ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-white/8 shrink-0">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border border-white/10 rounded-lg text-sm font-bold text-white hover:border-[#DAFF0C]/30 transition-all cursor-pointer"
              >
                <FiCode className="text-[#DAFF0C] text-xs" />
                {LANGUAGES.find(l => l.key === language)?.display || language}
                <FiChevronDown className={`text-white/40 text-xs transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-[#1c2128] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {allowedLangs.map(lang => (
                    <button
                      key={lang.key}
                      onClick={() => handleLangChange(lang.key)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all cursor-pointer ${language === lang.key
                        ? 'bg-[#DAFF0C]/10 text-[#DAFF0C] font-bold'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      {lang.display}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Run / Submit */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={running || submitting || !activeQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-white/10 text-white font-bold text-sm rounded-xl hover:border-white/20 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {running ? <FiLoader className="animate-spin text-sm" /> : <FiPlay className="text-sm" fill="currentColor" />}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitting || !activeQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-[#DAFF0C] text-[#0d1117] font-black text-sm rounded-xl hover:shadow-lg hover:shadow-[#DAFF0C]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
              >
                {submitting ? <FiLoader className="animate-spin text-sm" /> : <FiSend className="text-sm" />}
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden" onClick={() => { if (langOpen) setLangOpen(false); }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={LANGUAGES.find(l => l.key === language)?.monaco || 'python'}
              value={code}
              onChange={val => setCode(val || '')}
              onMount={ref => { editorRef.current = ref; }}
              options={{
                fontSize: 14,
                fontFamily: 'Fira Code, Cascadia Code, monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                padding: { top: 16, bottom: 16 },
                cursorStyle: 'line',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                // ── Enhanced IntelliSense ──
                quickSuggestions: {
                  other: false,
                  comments: false,
                  strings: false
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                tabCompletion: 'on',
                wordBasedSuggestions: true,
                parameterHints: {
                  enabled: true
                },
                suggest: {
                  showMethods: true,
                  showFunctions: true,
                  showVariables: true,
                  showConstants: true,
                  showModules: true,
                }
              }}
            />
          </div>

          {/* Horizontal Resizer Handle */}
          <div
            onMouseDown={(e) => {
              isResizingConsole.current = true;
              document.body.style.cursor = 'row-resize';
            }}
            className="h-1.5 hover:h-1.5 bg-transparent hover:bg-[#DAFF0C]/30 cursor-row-resize z-20 transition-colors group flex flex-col items-center justify-center shrink-0"
            title="Drag to resize console"
          >
            <div className="w-10 h-[1px] bg-white/10 group-hover:bg-[#DAFF0C]/50 rounded-full" />
          </div>

          {/* ── Console / Results panel ── */}
          <div
            className="bg-[#161b22] border-t border-white/8 flex flex-col shrink-0 overflow-hidden"
            style={{ height: consoleHeight }}
          >
            {/* Console tabs */}
            <div className="flex items-center justify-between px-4 pt-3 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setActiveTab('testcase')}
                  className={`pb-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-b-2 ${activeTab === 'testcase' ? 'border-[#DAFF0C] text-[#DAFF0C]' : 'border-transparent text-white/30 hover:text-white/60'
                    }`}
                >
                  <span className="flex items-center gap-1.5"><FiTerminal className="text-sm" /> Console</span>
                </button>
                <button
                  onClick={() => setActiveTab('result')}
                  className={`pb-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-b-2 ${activeTab === 'result' ? 'border-[#DAFF0C] text-[#DAFF0C]' : 'border-transparent text-white/30 hover:text-white/60'
                    }`}
                >
                  <span className="flex items-center gap-1.5"><FiAward className="text-sm" /> Testcase Results</span>
                </button>
              </div>
              {(runResult || submitResult) && activeTab === 'result' && (
                <button
                  onClick={() => { setRunResult(null); setSubmitResult(null); }}
                  className="mb-2 text-[10px] font-black uppercase text-white/20 hover:text-white/50 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <FiRefreshCw className="text-[9px]" /> Clear
                </button>
              )}
            </div>

            {/* Console body */}
            <div className="flex-1 overflow-hidden">
              {/* Testcase tab */}
              {activeTab === 'testcase' && (
                <div className="p-4 space-y-3 h-full overflow-y-auto custom-scrollbar">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Custom Input (stdin)</p>
                  <textarea
                    value={stdin}
                    onChange={e => setStdin(e.target.value)}
                    placeholder="Enter custom input here..."
                    rows={4}
                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl p-3 text-white/80 font-mono text-sm resize-none outline-none focus:border-[#DAFF0C]/30 placeholder:text-white/20 transition-all"
                  />
                  <p className="text-white/20 text-[10px]">This input will be passed to stdin when you click <span className="text-white/40 font-bold">Run</span>.</p>
                </div>
              )}

              {/* Result tab */}
              {activeTab === 'result' && (
                <div className="h-full flex flex-col">
                  {/* Running states */}
                  {(running || submitting) && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-[#DAFF0C]/10" />
                        <div className="w-10 h-10 rounded-full border-2 border-[#DAFF0C] border-t-transparent animate-spin absolute inset-0" />
                      </div>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        {submitting ? 'Judging Submission...' : 'Executing Code...'}
                      </p>
                    </div>
                  )}

                  {/* Run result Viewer */}
                  {!running && !submitting && runResult && !submitResult && (
                    <div className="flex-1 overflow-hidden">
                      {runResult.error ? (
                        <div className="p-5">
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center gap-3 text-center">
                            <FiAlertCircle className="text-red-400 text-2xl" />
                            <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap">{runResult.error}</pre>
                          </div>
                        </div>
                      ) : (
                        <RunResultsViewer data={runResult} activeQuestion={activeQuestion} customStdin={stdin} />
                      )}
                    </div>
                  )}

                  {/* Submit result Viewer */}
                  {!running && !submitting && submitResult && (
                    <div className="flex-1 overflow-hidden">
                      <SubmitResultsViewer data={submitResult} />
                    </div>
                  )}

                  {/* Submit error */}
                  {!running && !submitting && submitError && (
                    <div className="p-5">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                        <FiAlertCircle className="text-red-400 text-lg flex-shrink-0" />
                        <p className="text-red-400 text-xs font-bold leading-tight">{submitError}</p>
                      </div>
                    </div>
                  )}

                  {/* Idle state */}
                  {!running && !submitting && !runResult && !submitResult && !submitError && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 gap-2">
                      <FiZap className="text-3xl" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ready to Execute</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FINISH CONFIRMATION MODAL ── */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 bg-[#DAFF0C]/10 rounded-full flex items-center justify-center">
                <FiFlag className="text-3xl text-[#DAFF0C]" />
              </div>
            </div>
            <h2 className="text-white text-2xl font-black text-center mb-2 tracking-tight">Finish Assessment?</h2>
            <p className="text-white/40 text-sm text-center font-medium mb-8 leading-relaxed">
              Make sure you have submitted your solutions before finishing.
              You won't be able to return to the editor after this.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white/70 font-black text-sm uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                Continue
              </button>
              <button
                onClick={handleFinishConfirm}
                className="flex-1 py-3.5 bg-[#DAFF0C] text-[#0d1117] font-black text-sm uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#DAFF0C]/20 transition-all cursor-pointer"
              >
                Yes, Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
