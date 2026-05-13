import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiCheckCircle, FiInfo, FiTrendingUp,
  FiActivity, FiMessageSquare, FiHeadphones, FiAlertTriangle
} from 'react-icons/fi';

// ─── Score Card ───────────────────────────────────────────────────────────────
const ScoreCard = ({ title, score, total = 10, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-[#dce5e5] shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#9B9B9B] uppercase tracking-widest">{title}</h4>
        <p className="text-2xl font-bold">
          {score} <span className="text-sm font-normal text-[#9B9B9B]">/ {total}</span>
        </p>
      </div>
    </div>
    <div className="w-20 h-2 bg-gray-100 rounded-full relative overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(score / total) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-0 left-0 h-full rounded-full bg-[#144542]"
      />
    </div>
  </div>
);

// ─── Parameter Row ────────────────────────────────────────────────────────────
const ParameterRow = ({ name, value, unavailable = false }) => {
  const numericValue = typeof value === 'number' ? value : 0;

  if (unavailable) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
        <span className="text-sm font-medium text-[#144542]">{name}</span>
        <div className="flex items-center gap-2 text-amber-500">
          <FiAlertTriangle size={12} />
          <span className="text-xs font-bold">Unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm font-medium text-[#144542]">{name}</span>
      <div className="flex items-center gap-3 w-32">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${numericValue * 10}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-[#144542]"
          />
        </div>
        <span className="text-xs font-bold w-4">{numericValue}</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Read real backend results from navigation state ─────────────────────────
  const listening = location.state?.listeningResults;
  const speaking  = location.state?.speakingResults;

  // ── Speaking: use _continuous_scores (0–1) × 10 for display ────────────────
  const speakingContinuous = speaking?._continuous_scores || {};
  const toneNote = speaking?.details?.tone?.note || '';
  const toneUnavailable = toneNote.toLowerCase().includes('could not evaluate');

  const speakingParams = {
    ...(speakingContinuous.pronunciation !== undefined && {
      Pronunciation: Math.round(speakingContinuous.pronunciation * 10),
    }),
    ...(speakingContinuous.fluency !== undefined && {
      Fluency: Math.round(speakingContinuous.fluency * 10),
    }),
    // Tone: show "Unavailable" if backend failed, real value otherwise
    Tone: toneUnavailable ? '__unavailable__'
      : (speakingContinuous.tone !== undefined ? Math.round(speakingContinuous.tone * 10) : '__unavailable__'),
    ...(speakingContinuous.grammar !== undefined && {
      Grammar: Math.round(speakingContinuous.grammar * 10),
    }),
    ...(speakingContinuous.comprehension !== undefined && {
      Comprehension: Math.round(speakingContinuous.comprehension * 10),
    }),
  };

  // ── Listening: use avg_score_01 (0–1) × 10 for display ─────────────────────
  const listeningParams = {};
  Object.entries(listening?.parameters || {}).forEach(([key, val]) => {
    const score01 = typeof val === 'object' ? val?.avg_score_01 : null;
    if (score01 !== undefined && score01 !== null) {
      // Capitalise key nicely
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      listeningParams[label] = Math.round(score01 * 10);
    }
  });

  // ── Final scores ─────────────────────────────────────────────────────────────
  const speakingScore  = speaking?.final_score_10  ?? 0;
  const listeningScore = listening?.listening_score_10 ?? 0;

  // ── Verdict / Strengths / Improvements (combine both, prefer listening) ──────
  const verdict      = listening?.summary?.verdict || speaking?.summary?.verdict || 'Assessment complete';
  const strengths    = [...(listening?.summary?.strengths   || []), ...(speaking?.summary?.strengths   || [])].filter(Boolean).slice(0, 5);
  const improvements = [...(listening?.summary?.improvements || []), ...(speaking?.summary?.improvements || [])].filter(Boolean).slice(0, 5);

  // ── No real data yet (navigated directly to page) ────────────────────────────
  const hasRealData = !!(listening || speaking);

  return (
    <div className="min-h-screen bg-[#EAF0F0] text-[#144542] p-8 font-primary">
      <div className="max-w-5xl mx-auto">

        {/* Navigation */}
        <button
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center gap-2 text-[#9B9B9B] hover:text-[#144542] font-semibold mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-[#144542] text-white rounded-[40px] p-12 mb-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4">Assessment Complete</h1>
            <p className="text-white/60 text-lg max-w-xl">
              {hasRealData
                ? 'Your real scores from AI evaluation are shown below.'
                : 'Complete the assessment to see your personalised scores.'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#DAFF0C] rounded-full blur-[120px] opacity-20 -mr-20 -mt-20" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: Scores + Verdict ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Score Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <ScoreCard
                title="Speaking Skills"
                score={speakingScore}
                icon={<FiMessageSquare />}
                color="bg-blue-50 text-blue-600"
              />
              <ScoreCard
                title="Listening Skills"
                score={listeningScore}
                icon={<FiHeadphones />}
                color="bg-lime-50 text-lime-600"
              />
            </div>

            {/* Verdict Card */}
            <div className="bg-white p-10 rounded-[32px] border border-[#dce5e5] shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <FiActivity className="text-blue-500" />
                Performance Verdict
              </h3>
              <p className="text-lg leading-relaxed text-[#144542] opacity-80 mb-8 italic">
                "{verdict}"
              </p>

              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#9B9B9B] mb-4">Key Strengths</h4>
                  <div className="space-y-3">
                    {strengths.length > 0
                      ? strengths.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
                            <FiCheckCircle />
                            <span className="text-sm font-semibold">{s}</span>
                          </div>
                        ))
                      : <p className="text-sm text-[#9B9B9B]">Complete the test to see your strengths.</p>
                    }
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#9B9B9B] mb-4">Areas to Improve</h4>
                  <div className="space-y-3">
                    {improvements.length > 0
                      ? improvements.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl border border-orange-100">
                            <FiInfo />
                            <span className="text-sm font-semibold">{s}</span>
                          </div>
                        ))
                      : <p className="text-sm text-[#9B9B9B]">Complete the test to see areas for improvement.</p>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Parameters Sidebar ──────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-[#dce5e5] shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <FiTrendingUp className="text-lime-600" />
                Metrics Breakdown
              </h3>

              {/* Speaking Parameters */}
              {Object.keys(speakingParams).length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9B9B] mb-2">Speaking</p>
                  <div className="space-y-0 mb-4">
                    {Object.entries(speakingParams).map(([key, val]) => (
                      <ParameterRow
                        key={key}
                        name={key}
                        value={val === '__unavailable__' ? 0 : val}
                        unavailable={val === '__unavailable__'}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Listening Parameters */}
              {Object.keys(listeningParams).length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9B9B] mb-2 mt-4">Listening</p>
                  <div className="space-y-0">
                    {Object.entries(listeningParams).map(([key, val]) => (
                      <ParameterRow key={key} name={key} value={val} />
                    ))}
                  </div>
                </>
              )}

              {/* No data yet */}
              {Object.keys(speakingParams).length === 0 && Object.keys(listeningParams).length === 0 && (
                <p className="text-sm text-[#9B9B9B]">No evaluation data available yet.</p>
              )}

              <p className="mt-6 text-[11px] text-[#9B9B9B] leading-relaxed">
                Scores are based on comparison with benchmark data and native speech models.
                {toneUnavailable && ' Tone could not be evaluated — ffmpeg is not installed on the server.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/coding/instructions', { state: { uniqueId: location.state?.uniqueId } })}
              className="w-full bg-[#DAFF0C] text-[#144542] py-5 rounded-3xl font-bold shadow-lg shadow-[#DAFF0C33] hover:scale-[1.02] transition-all"
            >
              Continue to Coding Module
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Results;
