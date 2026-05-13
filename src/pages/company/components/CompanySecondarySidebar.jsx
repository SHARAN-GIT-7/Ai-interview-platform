import React, { useState, useEffect } from "react";
import { FiPlus, FiCalendar, FiUser, FiUsers } from "react-icons/fi";

export default function CompanySecondarySidebar({ onCreateTest, isCreatingTest }) {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("companyToken");
        const response = await fetch("/api/company/test/list", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched tests:", data);
          setTests(data);
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="content-anim w-80 bg-white border-r border-gray-100 flex flex-col h-full relative z-5">
      {/* Fixed Header with Create Button */}
      <div className="p-6 pb-2">
        <button 
          onClick={onCreateTest}
          className="flex items-center gap-3 w-full p-4 bg-[#DAFF0C] text-[#144542] font-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#144542] text-xl font-bold border border-[#144542]/10 group-hover:rotate-90 transition-transform">
            <FiPlus />
          </div>
          <span className="tracking-tight text-lg">Create Test</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#144542] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm font-medium">
            No tests created yet.
          </div>
        ) : (
          tests.map((test, idx) => (
            <div key={idx} className="bg-white border text-[13px] border-gray-200 rounded-xl p-5 space-y-3 font-bold text-gray-500 shadow-sm hover:border-gray-300 transition-colors">
              <div className="space-y-1">
                <span className="text-gray-400 block text-[11px] uppercase tracking-wider">Test Name</span>
                <span className="text-gray-900 text-base font-black truncate block">{test.testId}</span>
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-gray-400 w-16">Test ID:</span>
                  <span className="truncate">{test.testId}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-gray-400 w-16">Created:</span>
                  <span>{formatDate(test.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-gray-400 w-16">HR Name:</span>
                  <span className="truncate">{test.hrName}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-gray-400 w-16 whitespace-nowrap">Attended:</span>
                  <div className="flex items-center gap-1">
                    <FiUsers className="text-teal-600" />
                    <span>{test.attendedCount} students</span>
                  </div>
                </div>
              </div>

              {/* Module Indicators */}
              <div className="flex justify-end pt-2">
                <div className="flex items-center -space-x-2">
                  {test.interviewModule && (
                    <div className="w-7 h-7 rounded-full bg-[#00d1c1] ring-2 ring-white" title="AI-Interview"></div>
                  )}
                  {test.verbalModule && (
                    <div className="w-7 h-7 rounded-full bg-[#a855f7] ring-2 ring-white" title="Communication"></div>
                  )}
                  {test.codingModule && (
                    <div className="w-7 h-7 rounded-full bg-[#db830f] ring-2 ring-white" title="Coding"></div>
                  )}
                  {test.aptitudeModule && (
                    <div className="w-7 h-7 rounded-full bg-[#facc15] ring-2 ring-white" title="Aptitude"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
