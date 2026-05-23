import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiAward, FiWifi, FiCpu, FiInfo, FiArrowLeft, FiCompass } from 'react-icons/fi';
import ProctorOverlay from '../../routes/ProctorOverlay';

export default function ScreeningBegin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { uniqueId } = location.state || {};

  const stats = [
    { icon: <FiCheckCircle className="text-2xl" />, value: '15 Questions', label: 'Questions' },
    { icon: <FiClock className="text-2xl" />, value: '15:00 Minutes', label: 'Minutes' },
    { icon: <FiAward className="text-2xl" />, value: 'Multiple Choice', label: 'Format' },
  ];

  const instructions = [
    {
      icon: <FiWifi className="text-xl text-[#B38D12]" />,
      title: 'Connectivity',
      text: 'Ensure you have a stable internet connection before beginning. Disconnecting may result in lost progress.',
    },
    {
      icon: <FiCompass className="text-xl text-[#B38D12]" />,
      title: 'Navigation',
      text: "Use the provided 'Next' and 'Previous' buttons. Do not use your browser's back button during the assessment.",
    },
    {
      icon: <FiAward className="text-xl text-[#B38D12]" />,
      title: 'Scoring',
      text: 'All questions are weighted equally. There is no penalty for guessing, so attempt to answer every question.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F3F4F6] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <ProctorOverlay uniqueId={uniqueId} paused={true} />
      
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center">
        
        {/* Left Side text and titles */}
        <div className="lg:w-1/2 xs:w-full flex justify-center flex-col relative z-10 px-4">
          <div className="mb-4">
            <span className="text-[#B38D12] text-sm font-bold uppercase tracking-widest leading-none">Assessment Overview</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#1F2937] tracking-tight leading-tight mb-2">
            Screening Module:
          </h1>
          <h1 className="text-5xl md:text-7xl font-black text-[#B38D12] tracking-tight leading-tight mb-6">
            Professional Readiness
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-lg leading-relaxed font-medium">
            Please review the module details and instructions before beginning to ensure a smooth evaluation experience.
          </p>

          <div className="mt-12 flex items-center justify-start gap-4">
             <button
              onClick={() => navigate('/screening/test', { state: { uniqueId } })}
              className="px-8 py-4 bg-gradient-to-r from-[#876602] to-[#D4A30B] text-white font-bold text-base rounded-lg shadow-[0_4px_15px_rgba(212,163,11,0.3)] hover:shadow-[0_6px_20px_rgba(212,163,11,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Assessment →
            </button>
            <button
              onClick={() => navigate('/user/dashboard')}
              className="px-8 py-4 bg-gray-100 text-[#374151] font-bold text-base rounded-lg hover:bg-gray-200 transition-all duration-300 border border-gray-200"
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="lg:w-1/2 w-full flex flex-col gap-6 relative z-10">
            {/* Top row cards */}
            <div className="grid grid-cols-3 gap-4">
               {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-[#B38D12] mb-3">
                       {stat.icon}
                    </div>
                    <div className="text-gray-800 font-extrabold text-lg md:text-xl">{stat.value}</div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
               ))}
            </div>

            {/* Instruction Card area */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden">
               {/* Accent Line */}
               <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-[#B38D12] rounded-r-lg"></div>
               
               <div className="flex items-center gap-3 mb-8 ml-4">
                  <div className="w-6 h-6 bg-[#B38D12] text-white rounded-full flex justify-center items-center font-black">
                     <FiInfo className="text-sm" />
                  </div>
                  <h2 className="text-gray-800 text-xl font-black">Test Instructions</h2>
               </div>

               <div className="space-y-6 ml-4">
                  {instructions.map((inst, idx) => (
                     <div key={idx} className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 border border-gray-100">
                           {inst.icon}
                        </div>
                        <div>
                           <h3 className="text-gray-800 font-bold mb-1">{inst.title}</h3>
                           <p className="text-gray-500 text-sm leading-relaxed">{inst.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}
