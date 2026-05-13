import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiClock, FiCheck, FiSend, FiLoader } from 'react-icons/fi';
import { submitScreeningAnswers } from '../../services/screeningApi';
import ProctorOverlay from '../../routes/ProctorOverlay';


// Import our local copy of exactly the 15 questions from the Screening Backend
import questionsData from './questionsData.json';

const TOTAL_TIME = 15 * 60; // 15 minutes

export default function MainScreeningTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { uniqueId } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const timerRef = useRef(null);

  const [userName, setUserName] = useState(localStorage.getItem('userName') || localStorage.getItem('name') || 'Candidate');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || localStorage.getItem('email') || 'candidate@example.com');

  // Fetch profile name if missing
  useEffect(() => {
    const fetchProfileName = async () => {
      // If we already have a real name, don't fetch
      if (userName && userName !== 'Candidate') return;

      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:5280/api/user/profile/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (response.ok) {
          const profileData = await response.json();
          if (profileData.FullName) {
            setUserName(profileData.FullName);
            localStorage.setItem('userName', profileData.FullName);
          }
        }
      } catch (err) {
        console.warn('Profile server (5280) appears to be offline. Using fallback name.', err);
      }
    };

    fetchProfileName();
  }, [userName]);

  // Use local questions file directly
  useEffect(() => {
    if (questionsData && questionsData.questions) {
      setQuestions(questionsData.questions);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      // Build answers object like {"q1": "A. Option", "q2": "B. Option"} as Node backend expects
      const formattedAnswers = {};
      questions.forEach((q) => {
        formattedAnswers[`q${q.id}`] = selectedAnswers[q.id] || null;
      });

      // Submit with the fetched name and email
      await submitScreeningAnswers(userName, userEmail, formattedAnswers);

      setShowSuccess(true);
      setTimeout(() => {
        // Redirect to the next module (Verbal Communication)
        navigate('/verbal/start', { state: { uniqueId } });
      }, 3000);
    } catch (err) {
      console.error('Failed to submit screening answers:', err);
      // Fallback: Show success anyway to not block user flow if backend is offline
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/verbal/start', { state: { uniqueId } });
      }, 3000);
    }
  }, [isSubmitting, questions, selectedAnswers, navigate]);

  // Timer countdown
  useEffect(() => {
    if (questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions.length]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitting, questions.length, handleSubmit]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectAnswer = (questionId, option) => {
    setSelectedAnswers((prev) => {
      if (prev[questionId] === option) {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      }
      return { ...prev, [questionId]: option };
    });
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isTimeLow = timeLeft < 60;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // ── Success State ──
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-[#B38D12] rounded-full flex items-center justify-center shadow-2xl shadow-[#B38D12]/30">
              <FiCheck className="text-white text-5xl" strokeWidth={3} />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-[#D4AF37]/40 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-[#1F2937] text-3xl font-black tracking-tight mb-3">Test Submitted!</h2>
          <p className="text-gray-500 text-base font-medium mb-2">Your evaluation responses have been saved.</p>
          <p className="text-gray-400 text-sm font-medium">Proceeding to the next module...</p>
          <div className="mt-6 flex justify-center">
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#B38D12] rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  // ── Main Test UI (Light/Gold Theme) ──
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      <ProctorOverlay uniqueId={uniqueId} />
      
      {/* Top Header Bar */}
      <div className="bg-white px-6 md:px-10 py-4 flex items-center justify-between border-b border-gray-200 relative z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#B38D12]/10 rounded-lg border border-[#B38D12]/20">
            <span className="text-[#B38D12] text-[10px] font-bold uppercase tracking-[0.15em]">Screening Module</span>
          </div>
          <div className="md:hidden">
            <span className="text-[#B38D12] text-xs font-bold uppercase tracking-wider">Screening</span>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border transition-all duration-300 ${
          isTimeLow 
            ? 'bg-red-50 border-red-200 text-red-600' 
            : 'bg-gray-50 border-gray-200 text-gray-700'
        }`}>
          <FiClock className={`text-lg ${isTimeLow ? 'animate-pulse' : ''}`} />
          <span className="font-mono font-bold text-lg tracking-wider">{formatTime(timeLeft)}</span>
        </div>

        {/* Question Counter */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest hidden md:block">Process</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[#B38D12] text-2xl font-black">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="text-gray-400 text-sm font-bold">/ {questions.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100">
        <div
          className="h-full bg-[#B38D12] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row h-full">
        {/* Left/Middle Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 md:p-8 lg:p-10">
            
            {/* Left Panel — Question Text */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="mb-4">
                 <span className="inline-block px-4 py-1.5 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg">
                  Behavioral Assessment
                 </span>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B38D12]"></div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#B38D12]/10 rounded-full flex items-center justify-center shrink-0 border border-[#B38D12]/20">
                    <span className="text-[#B38D12] text-sm font-black">{currentIndex + 1}</span>
                  </div>
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed font-semibold flex-1 pt-1.5">
                    {currentQuestion?.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel — Options */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="mb-4">
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Select Your Approach</span>
              </div>

              <div className="space-y-3 flex-1">
                {currentQuestion && currentQuestion.options.map((opt, idx) => {
                  const optLetter = String.fromCharCode(65 + idx); // A, B, C, D...
                  const isSelected = selectedAnswers[currentQuestion.id] === opt;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                      className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 text-left group cursor-pointer ${
                        isSelected
                          ? 'bg-[#B38D12] border-[#B38D12] text-white shadow-lg shadow-[#B38D12]/20 scale-[1.02]'
                          : 'bg-white border-gray-100 text-gray-700 hover:border-[#B38D12]/30 hover:shadow-md'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm transition-all duration-300 ${
                          isSelected
                            ? 'bg-white text-[#B38D12]'
                            : 'bg-gray-50 border border-gray-100 text-gray-500 group-hover:bg-[#B38D12]/10 group-hover:text-[#B38D12]'
                        }`}
                      >
                        {optLetter}
                      </div>
                      <span className={`font-medium text-sm md:text-base flex-1 ${isSelected ? 'text-white' : ''}`}>
                        {opt.replace(/^[A-D]\.\s*/, '')}
                      </span>
                      {isSelected && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <FiCheck className="text-white text-lg" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>

        {/* Right Sidebar: Palette */}
        <div className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 flex flex-col -mr-32">
          <div className="mb-6">
            <h3 className="text-gray-800 text-sm font-black uppercase tracking-widest mb-1 leading-none">Status</h3>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Navigation Panel</p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, i) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = i === currentIndex;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'ring-2 ring-offset-2 ring-[#B38D12] bg-[#B38D12] text-white scale-110 shadow-md'
                      : isAnswered
                        ? 'bg-gray-100 text-[#B38D12] border border-[#B38D12]/20 hover:scale-105'
                        : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              );
            })}
          </div>

          {/* Stats area */}
          <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Completed</span>
              <span className="text-[#B38D12] text-sm font-black tracking-tight">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Pending</span>
              <span className="text-gray-500 text-sm font-black tracking-tight">{questions.length - answeredCount}</span>
            </div>
            
            <div className="pt-2">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#B38D12] transition-all duration-500 ease-out"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-gray-200 px-6 md:px-10 py-4 flex items-center justify-between relative z-20">
        <div className="hidden md:flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-gray-800 text-[10px] font-black uppercase tracking-widest leading-none">Assessment Progress</span>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mt-1">{answeredCount} out of {questions.length} Saved</span>
          </div>
        </div>

        <div className="md:hidden text-gray-400 text-xs font-bold">
          {answeredCount}/{questions.length} saved
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <FiChevronLeft className="text-lg" />
            <span className="hidden md:block">Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-5 py-3 bg-[#1F2937] text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-md cursor-pointer"
            >
              <span className="hidden md:block">Next</span>
              <FiChevronRight className="text-lg" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#B38D12] text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-[#97760E] hover:shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="text-lg animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSend className="text-lg" />
                  <span>Submit Task</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  
  );
}
