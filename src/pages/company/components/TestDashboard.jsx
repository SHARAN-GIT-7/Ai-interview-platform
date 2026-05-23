import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiAward, FiCode, FiClock, FiActivity, 
  FiCheckCircle, FiVolume2, FiAlertCircle, FiX, 
  FiUser, FiMail, FiCalendar, FiChevronRight, FiGrid
} from "react-icons/fi";

export default function TestDashboard({ test }) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'completed', 'progress'
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Deep-dive scorecard tab
  const [activeScorecardTab, setActiveScorecardTab] = useState("overview");

  // Fetch all results for the company
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("companyToken");
        const response = await fetch("/api/company/results", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Filter results matching this specific testId
          const filtered = data.filter(r => r.testId === test.testId);
          setResults(filtered);
        }
      } catch (error) {
        console.error("Error fetching test results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (test?.testId) {
      fetchResults();
    }
  }, [test]);

  // Helper: check if student completed ALL enabled modules
  const checkCompletionStatus = (studentResult) => {
    const needed = {
      aptitude: test.aptitudeModule,
      coding: test.codingModule,
      aiInterview: test.interviewModule,
      verbal: test.verbalModule
    };

    const done = {
      aptitude: !!studentResult.aptitude,
      coding: !!studentResult.coding,
      aiInterview: !!studentResult.aiInterview,
      verbal: !!studentResult.verbal
    };

    // If a module is enabled but not complete, then the status is in progress
    let missingEnabledModule = false;
    Object.keys(needed).forEach(key => {
      if (needed[key] && !done[key]) {
        missingEnabledModule = true;
      }
    });

    return missingEnabledModule ? "In progress" : "Completed";
  };

  // Helper: calculate module score percentages
  const getPercentage = (secured, total) => {
    if (!total || total <= 0) return 0;
    return Math.round((secured / total) * 100);
  };

  // ── FILTER & SEARCH LOGIC ──────────────────────────────────────
  const filteredResults = results.filter(r => {
    const status = checkCompletionStatus(r);
    const matchesSearch = 
      (r.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.studentEmail || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "completed") return matchesSearch && status === "Completed";
    if (statusFilter === "progress") return matchesSearch && status === "In progress";
    return matchesSearch;
  });

  // ── ANALYTICAL METRICS ──────────────────────────────────────────
  const totalAttended = results.length;
  const fullyCompleted = results.filter(r => checkCompletionStatus(r) === "Completed").length;
  const inProgress = totalAttended - fullyCompleted;
  const averageScoreSecured = totalAttended > 0
    ? Math.round(results.reduce((acc, r) => acc + getPercentage(r.scoreSecured, r.totalScore), 0) / totalAttended)
    : 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-96 w-full items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#144542] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase">Loading test dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col font-sans">
      
      {/* ── HEADER CONTAINER ──────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-full bg-[#DAFF0C]/10 skew-x-12 transform translate-x-12 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3.5 py-1 bg-[#144542]/5 border border-[#144542]/10 text-[#144542] text-[10px] font-bold tracking-widest uppercase rounded-full">
                Active Test
              </span>
              <span className="text-[11px] font-bold text-gray-400">ID: {test.testId}</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {test.testName || test.testId}
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Created on {new Date(test.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} • Owner: <span className="font-bold text-gray-700">{test.hrName || "Recruiter"}</span>
            </p>
          </div>

          {/* Module checklist indicators */}
          <div className="flex flex-wrap gap-2.5">
            {test.aptitudeModule && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#facc15]/10 border border-[#facc15]/20 text-yellow-800 text-xs font-black rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#facc15]" /> Aptitude
              </span>
            )}
            {test.codingModule && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#db830f]/10 border border-[#db830f]/20 text-[#db830f] text-xs font-black rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#db830f]" /> Coding
              </span>
            )}
            {test.interviewModule && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d1c1]/10 border border-[#00d1c1]/20 text-[#00a89a] text-xs font-black rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#00d1c1]" /> AI Interview
              </span>
            )}
            {test.verbalModule && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#a855f7]/10 border border-[#a855f7]/20 text-purple-800 text-xs font-black rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#a855f7]" /> Verbal/Speech
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── METRICS DASHBOARD (Styled like UI Reference 2) ────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Attended */}
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:shadow hover:border-gray-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Candidates Attended</span>
            <div className="w-9 h-9 rounded-full bg-[#144542]/5 flex items-center justify-center text-[#144542] group-hover:bg-[#144542] group-hover:text-white transition-colors duration-300">
              <FiUser size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight mt-4">{totalAttended}</h3>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">Total active participants</p>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:shadow hover:border-gray-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Fully Completed</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <FiCheckCircle size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-black text-emerald-600 tracking-tight mt-4">{fullyCompleted}</h3>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">Cleared all enabled modules</p>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:shadow hover:border-gray-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">In Progress</span>
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <FiActivity size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-black text-amber-600 tracking-tight mt-4">{inProgress}</h3>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">Partially completed sessions</p>
          </div>
        </div>

        {/* Card 4: Average Score */}
        <div className="bg-[#144542] rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px] text-white">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 blur-lg pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-white/50 uppercase tracking-widest">Average Score</span>
            <div className="w-9 h-9 rounded-full bg-[#DAFF0C] flex items-center justify-center text-[#144542]">
              <FiAward size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-black text-[#DAFF0C] tracking-tight mt-4">{averageScoreSecured}%</h3>
            <p className="text-[10px] font-semibold text-white/60 mt-1">Mean scorecard secured</p>
          </div>
        </div>
      </div>

      {/* ── CANDIDATES TABLE & FILTERS (Styled like UI Reference 1) ── */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden flex-1">
        
        {/* Table Filters Top Bar */}
        <div className="p-6 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Pills / Status Tabs */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "All Candidates", count: totalAttended },
              { id: "completed", label: "Completed", count: fullyCompleted },
              { id: "progress", label: "In Progress", count: inProgress }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? "bg-[#144542] text-white shadow-md shadow-[#144542]/10"
                    : "bg-[#EAF0F0]/50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  statusFilter === tab.id ? "bg-[#DAFF0C] text-[#144542]" : "bg-gray-200 text-gray-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#144542] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Results List Table */}
        <div className="overflow-x-auto">
          {filteredResults.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <FiUser className="text-4xl mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm">No candidate submissions found matching the criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#144542]/[0.02] border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attempt Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Modules Cleared</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((cand, idx) => {
                  const status = checkCompletionStatus(cand);
                  const scorePct = getPercentage(cand.scoreSecured, cand.totalScore);
                  
                  // Generate initials
                  const initials = (cand.studentName || "S")
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2);

                  return (
                    <tr 
                      key={idx} 
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setActiveScorecardTab("overview");
                      }}
                      className="border-b border-gray-50 hover:bg-[#144542]/[0.01] transition-colors cursor-pointer group"
                    >
                      {/* Name & Email with initials avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#144542] text-[#DAFF0C] font-black text-xs flex items-center justify-center shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-[#144542] transition-colors">{cand.studentName}</p>
                            <p className="text-[11px] font-semibold text-gray-400">{cand.studentEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                        {formatDate(cand.createdAt)}
                      </td>

                      {/* Checkmarks checklist for Modules */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {test.aptitudeModule && (
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                cand.aptitude ? "bg-[#facc15] text-white" : "border-2 border-dashed border-gray-200 text-gray-300"
                              }`}
                              title="Aptitude Module"
                            >
                              {cand.aptitude ? "✓" : "A"}
                            </div>
                          )}
                          {test.codingModule && (
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                cand.coding ? "bg-[#db830f] text-white" : "border-2 border-dashed border-gray-200 text-gray-300"
                              }`}
                              title="Coding Module"
                            >
                              {cand.coding ? "✓" : "C"}
                            </div>
                          )}
                          {test.interviewModule && (
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                cand.aiInterview ? "bg-[#00d1c1] text-white" : "border-2 border-dashed border-gray-200 text-gray-300"
                              }`}
                              title="AI Interview Module"
                            >
                              {cand.aiInterview ? "✓" : "I"}
                            </div>
                          )}
                          {test.verbalModule && (
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                cand.verbal ? "bg-[#a855f7] text-white" : "border-2 border-dashed border-gray-200 text-gray-300"
                              }`}
                              title="Verbal Communication"
                            >
                              {cand.verbal ? "✓" : "V"}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Secure Score fraction & percent badge */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-gray-800">
                            {cand.scoreSecured} <span className="text-gray-300 font-medium">/ {cand.totalScore}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            scorePct >= 75 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            scorePct >= 50 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            "bg-red-50 text-red-500 border border-red-100"
                          }`}>
                            {scorePct}%
                          </span>
                        </div>
                      </td>

                      {/* Status Pill */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                          status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${status === "Completed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {status}
                        </span>
                      </td>

                      {/* Chevron Link */}
                      <td className="px-6 py-4 text-right">
                        <FiChevronRight className="text-gray-400 group-hover:text-[#144542] group-hover:translate-x-1 transition-all" size={18} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── CANDIDATE SCORECARD DETAILS DRAWER (Full Evaluation Report) ── */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Sliding scorecard drawer content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-3xl h-full bg-[#EAF0F0] border-l border-gray-200 shadow-2xl flex flex-col z-10"
            >
              {/* Scorecard Drawer Header */}
              <div className="bg-[#144542] text-white p-8 pb-6 flex justify-between items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12 pointer-events-none" />
                <div>
                  <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold tracking-widest uppercase mb-1">
                    <FiAward className="text-[#DAFF0C]" /> Candidate Scorecard Report
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedCandidate.studentName}</h2>
                  <p className="text-xs font-semibold text-white/60 mt-1 flex items-center gap-1">
                    <FiMail /> {selectedCandidate.studentEmail} • ID: {selectedCandidate.studentId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="w-10 h-10 rounded-full border-none bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white cursor-pointer active:scale-95"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Scorecard Drawer tab buttons */}
              <div className="bg-white px-8 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto shrink-0 custom-scrollbar">
                {[
                  { id: "overview", label: "Overview", icon: <FiGrid /> },
                  test.aptitudeModule && { id: "aptitude", label: "Aptitude", icon: <FiCheckCircle /> },
                  test.codingModule && { id: "coding", label: "Coding Submit", icon: <FiCode /> },
                  test.interviewModule && { id: "interview", label: "AI Interview", icon: <FiAward /> },
                  test.verbalModule && { id: "verbal", label: "Speech & Verbal", icon: <FiVolume2 /> }
                ]
                  .filter(Boolean)
                  .map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveScorecardTab(t.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        activeScorecardTab === t.id
                          ? "bg-[#144542] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
              </div>

              {/* Scorecard Tab Views (Scrollable area) */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* ── OVERVIEW TAB ────────────────────────────────────────── */}
                {activeScorecardTab === "overview" && (
                  <div className="space-y-6">
                    {/* Circle chart and key stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Circular Gauge Card */}
                      <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#144542" strokeOpacity="0.08" strokeWidth="8" />
                            <circle 
                              cx="50" cy="50" r="40" fill="none" stroke="#144542" strokeWidth="8" strokeLinecap="round"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 - (251.2 * getPercentage(selectedCandidate.scoreSecured, selectedCandidate.totalScore)) / 100}
                              style={{ transition: "stroke-dashoffset 1s ease-out" }}
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black text-gray-900 leading-none">
                              {getPercentage(selectedCandidate.scoreSecured, selectedCandidate.totalScore)}%
                            </span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Grade Score</span>
                          </div>
                        </div>
                        <h4 className="text-base font-black text-gray-900 mt-4">
                          {getPercentage(selectedCandidate.scoreSecured, selectedCandidate.totalScore) >= 75 ? "Outstanding Cleared" :
                           getPercentage(selectedCandidate.scoreSecured, selectedCandidate.totalScore) >= 50 ? "Qualified" :
                           "Disqualified / Needs Review"}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Performance Evaluation</p>
                      </div>

                      {/* General metadata scorecard details */}
                      <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3">Session Metadata</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-gray-400 font-semibold block uppercase">Total Score secured</span>
                            <span className="text-lg font-black text-gray-900">{selectedCandidate.scoreSecured} / {selectedCandidate.totalScore}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-semibold block uppercase">Completion status</span>
                            <span className="text-sm font-black text-gray-900">{checkCompletionStatus(selectedCandidate)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-semibold block uppercase">Attempted Time</span>
                            <span className="text-[11px] font-bold text-gray-800">{new Date(selectedCandidate.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-semibold block uppercase">Session ID Code</span>
                            <span className="text-xs font-mono font-bold text-gray-800">{selectedCandidate.testCode || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proctored violations checklist */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">Proctor Integrity Report</h3>
                      <div className="flex gap-4 items-start bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800">
                        <FiCheckCircle className="text-lg mt-0.5" />
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider">No Suspicious Behavior Flagged</p>
                          <p className="text-[11px] font-medium text-emerald-700/80 mt-1">
                            The candidate successfully validated their live Haar face‑presence checks and continuous ArcFace identity evaluations throughout the exam with zero critical violations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── APTITUDE MODULE TAB ──────────────────────────────────── */}
                {activeScorecardTab === "aptitude" && selectedCandidate.aptitude && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-gray-150 text-center">
                        <span className="text-xs font-bold text-gray-400 block uppercase">Score Secured</span>
                        <span className="text-2xl font-black text-gray-900">{selectedCandidate.aptitude.moduleScoreSecured} / {selectedCandidate.aptitude.moduleTotalScore}</span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-150 text-center">
                        <span className="text-xs font-bold text-gray-400 block uppercase">Correct Answers</span>
                        <span className="text-2xl font-black text-emerald-600">{selectedCandidate.aptitude.correct}</span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-150 text-center">
                        <span className="text-xs font-bold text-gray-400 block uppercase">Wrong Answers</span>
                        <span className="text-2xl font-black text-red-500">{selectedCandidate.aptitude.incorrect}</span>
                      </div>
                    </div>

                    {/* Question breakdown lists */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3">Questions & Choices Analysis</h3>
                      
                      <div className="space-y-4">
                        {(selectedCandidate.aptitude.questions || []).map((q, idx) => {
                          const userAns = selectedCandidate.aptitude.userAnswers?.[idx];
                          const correctAns = selectedCandidate.aptitude.correctAnswers?.[idx];
                          const isCorrect = userAns === correctAns;
                          const topic = selectedCandidate.aptitude.topics?.[idx] || "Logical Assessment";

                          return (
                            <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[9px] font-black rounded uppercase">{topic}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </span>
                              </div>
                              <p className="text-xs font-black text-gray-900 leading-tight">Q{idx + 1}: {q}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 bg-white border rounded-lg">
                                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Candidate choice</span>
                                  <span className={`font-bold ${isCorrect ? "text-emerald-600" : "text-red-500"}`}>{userAns || "(skipped)"}</span>
                                </div>
                                <div className="p-2.5 bg-white border rounded-lg">
                                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Correct solution</span>
                                  <span className="font-bold text-gray-800">{correctAns}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CODING MODULE SUBMISSION TAB ─────────────────────────── */}
                {activeScorecardTab === "coding" && selectedCandidate.coding && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-400 block uppercase">Coding Module Score</span>
                        <span className="text-2xl font-black text-gray-900">{selectedCandidate.coding.moduleScoreSecured} / {selectedCandidate.coding.moduleTotalScore}</span>
                      </div>
                      <span className="px-3 py-1.5 bg-[#db830f]/10 border border-[#db830f]/20 text-[#db830f] text-xs font-black rounded-lg font-mono">
                        Language: JavaScript/C#
                      </span>
                    </div>

                    {/* Candidate Source Code submitted rendered in a mockup editor */}
                    {(selectedCandidate.coding.answers || []).map((code, idx) => {
                      const passed = selectedCandidate.coding.testcasePassed?.[idx] ?? 0;
                      const total = selectedCandidate.coding.testcaseTotals?.[idx] ?? 0;

                      return (
                        <div key={idx} className="bg-[#144542] rounded-3xl border border-white/10 shadow-lg overflow-hidden">
                          
                          {/* Code editor top chrome header */}
                          <div className="bg-black/25 px-6 py-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                              </div>
                              <span className="text-white/60 font-mono text-[11px] font-bold ml-2">Problem {idx + 1} Code Submission</span>
                            </div>
                            <span className="px-3 py-1 bg-white/10 text-[#DAFF0C] text-[10px] font-black uppercase rounded-md tracking-wider">
                              Testcases: {passed} / {total} passed
                            </span>
                          </div>

                          {/* Code viewport container */}
                          <pre className="p-6 overflow-x-auto text-[11px] font-mono text-emerald-400/90 leading-relaxed bg-[#0c2f2d] max-h-[300px] custom-scrollbar">
                            <code>{code || "// No answer submitted."}</code>
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── AI CONVERSATIONAL INTERVIEW TAB ───────────────────────── */}
                {activeScorecardTab === "interview" && selectedCandidate.aiInterview && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-gray-150 text-center">
                        <span className="text-xs font-bold text-gray-400 block uppercase">Technical Depth Score</span>
                        <span className="text-2xl font-black text-gray-900">{selectedCandidate.aiInterview.moduleScoreSecured} / {selectedCandidate.aiInterview.moduleTotalScore}</span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-150 text-center">
                        <span className="text-xs font-bold text-gray-400 block uppercase">Dialogue Accuracy</span>
                        <span className="text-2xl font-black text-[#00a89a]">{selectedCandidate.aiInterview.correct} / {(selectedCandidate.aiInterview.questions || []).length} match</span>
                      </div>
                    </div>

                    {/* Chat dialog transcription flow */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">Dialogue Flow Timeline</h3>
                      
                      <div className="space-y-6">
                        {(selectedCandidate.aiInterview.questions || []).map((q, idx) => {
                          const ans = selectedCandidate.aiInterview.answers?.[idx] || "(No reply received)";
                          const correct = selectedCandidate.aiInterview.correctAnswers?.[idx];

                          return (
                            <div key={idx} className="space-y-3 relative">
                              {idx > 0 && <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-100 -mt-6 -z-10" />}

                              {/* AI interviewer question row */}
                              <div className="flex gap-3 items-start">
                                <div className="w-8 h-8 rounded-full bg-[#144542] text-[#DAFF0C] font-black text-xs flex items-center justify-center shrink-0 shadow-sm border border-white/10">
                                  AI
                                </div>
                                <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl rounded-tl-none text-xs text-gray-800 leading-relaxed font-semibold max-w-[85%]">
                                  <span className="text-[10px] font-black text-[#144542] block uppercase mb-1 tracking-wider">Question {idx + 1}</span>
                                  {q}
                                </div>
                              </div>

                              {/* Candidate Transcription answer row */}
                              <div className="flex gap-3 items-start justify-end">
                                <div className="p-4 bg-[#DAFF0C]/10 border border-[#DAFF0C]/35 rounded-2xl rounded-tr-none text-xs text-gray-900 leading-relaxed italic max-w-[85%]">
                                  <span className="text-[10px] font-black text-gray-500 block uppercase mb-1 tracking-wider">Candidate response</span>
                                  "{ans}"
                                  {correct && (
                                    <div className="mt-2 pt-2 border-t border-gray-200/40 text-[10px] text-gray-500 font-medium">
                                      <span className="font-bold text-[#144542]">Reference Match:</span> {correct}
                                    </div>
                                  )}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#DAFF0C] text-[#144542] font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                                  C
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SPEECH & VERBAL COMMUNICATION TAB ─────────────────────── */}
                {activeScorecardTab === "verbal" && selectedCandidate.verbal && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-gray-400 block uppercase">Verbal Module Score</span>
                        <span className="text-2xl font-black text-gray-900">{selectedCandidate.verbal.moduleScoreSecured} / {selectedCandidate.verbal.moduleTotalScore}</span>
                      </div>
                      <span className="px-3 py-1.5 bg-[#a855f7]/10 border border-[#a855f7]/20 text-purple-700 text-xs font-black rounded-lg">
                        Metrics Verified
                      </span>
                    </div>

                    {/* Gauges of Speech metrics (Pronunciation, Fluency etc.) */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.keys(selectedCandidate.verbal.metrics || {}).map((m, keyIdx) => {
                        const score = selectedCandidate.verbal.metrics[m];
                        return (
                          <div key={keyIdx} className="bg-white rounded-2xl p-5 border border-gray-150 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-500 uppercase">{m}</span>
                              <span className="text-sm font-black text-[#144542]">{score}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div style={{ width: `${score}%` }} className="h-full bg-purple-500 rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Speech listening vs speaking logs */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3">Speaking Audits</h3>
                      
                      <div className="space-y-4">
                        {(selectedCandidate.verbal.speaking || []).map((speak, idx) => (
                          <div key={idx} className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
                            <span className="text-[9px] font-black text-purple-700 block uppercase tracking-widest">Speech Sample {idx + 1}</span>
                            <p className="text-xs font-semibold text-gray-800 leading-relaxed italic">"{speak}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
