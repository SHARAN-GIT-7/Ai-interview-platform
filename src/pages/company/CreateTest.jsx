import React, { useState, useRef, useEffect } from "react";
import { FiClock, FiPlus, FiX, FiCalendar, FiUsers, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";

const modules = [
  { name: "AI-interview", cost: 50, time: 20, bgClass: "bg-[#e5f5f6]", textClass: "text-[#1d8989]", key: "interviewModule" },
  { name: "Communication", cost: 50, time: 30, bgClass: "bg-[#e9daff]", textClass: "text-[#6b4ab9]", key: "verbalModule" },
  { name: "Coding", cost: 50, time: 60, bgClass: "bg-[#fdf0d9]", textClass: "text-[#db830f]", key: "codingModule" },
  { name: "Aptitude", cost: 50, time: 30, bgClass: "bg-[#fcdcb6]", textClass: "text-[#c26804]", key: "aptitudeModule" },
];

export default function CreateTest() {
  const [selectedModules, setSelectedModules] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    testId: "",
    hrId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    approxStudentCount: ""
  });
  const [hrList, setHrList] = useState([]);

  const [testIdStatus, setTestIdStatus] = useState("idle"); // idle, checking, available, taken
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time Test ID check
  useEffect(() => {
    if (!formData.testId) {
      setTestIdStatus("idle");
      return;
    }

    setTestIdStatus("checking"); // Set to checking immediately

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("companyToken");
        const response = await fetch(`/api/company/test/exists/${encodeURIComponent(formData.testId)}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTestIdStatus(data.registered ? "taken" : "available");
        } else {
          // If the backend doesn't have the endpoint yet, don't block the user
          // but log the error for developers
          console.warn("Test ID check endpoint failed, defaulting to available");
          setTestIdStatus("available");
        }
      } catch (error) {
        console.error("Error checking test ID:", error);
        setTestIdStatus("available");
      }
    }, 600); // Slightly longer debounce for smoother experience

    return () => clearTimeout(timer);
  }, [formData.testId]);

  // Fetch HR List
  useEffect(() => {
    const fetchHRs = async () => {
      try {
        const token = localStorage.getItem("companyToken");
        const response = await fetch("/api/company/hr/list", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setHrList(data);
          // Set first HR as default if available
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, hrId: data[0].hrId }));
          }
        }
      } catch (error) {
        console.error("Error fetching HRs:", error);
      }
    };
    fetchHRs();
  }, []);

  const totalCredits = selectedModules.reduce((sum, mod) => sum + mod.cost, 0);
  const totalTime = selectedModules.reduce((sum, mod) => sum + mod.time, 0);

  const availableModules = modules.filter(m => !selectedModules.some(sm => sm.name === m.name));

  const addModule = (mod) => {
    setSelectedModules([...selectedModules, mod]);
    setIsDropdownOpen(false);
  };

  const removeModule = (modName) => {
    setSelectedModules(selectedModules.filter(m => m.name !== modName));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "approxStudentCount" ? value : value
    }));
  };

  const handleCreateTest = async () => {
    if (testIdStatus === "taken") {
      setSubmissionStatus({ type: "error", message: "Please enter a unique Test ID" });
      return;
    }

    const isMissingFields = !formData.testId || 
                            !formData.startDate || 
                            !formData.endDate || 
                            !formData.startTime || 
                            !formData.endTime || 
                            !formData.approxStudentCount ||
                            parseInt(formData.approxStudentCount) <= 0;

    if (isMissingFields) {
      setSubmissionStatus({ type: "error", message: "Please fill all required fields, including dates, times, and student count." });
      return;
    }

    if (selectedModules.length === 0) {
      setSubmissionStatus({ type: "error", message: "Please add at least one module to the test." });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus({ type: "", message: "" });

    const companyId = localStorage.getItem("companyId") || "3fa85f64-5717-4562-b3fc-2c963f66afa6";
    const hrId = localStorage.getItem("hrId") || companyId;

    const moduleFlags = {
      aptitudeModule: selectedModules.some(m => m.key === "aptitudeModule"),
      verbalModule: selectedModules.some(m => m.key === "verbalModule"),
      interviewModule: selectedModules.some(m => m.key === "interviewModule"),
      codingModule: selectedModules.some(m => m.key === "codingModule"),
    };

    const payload = {
      testId: formData.testId,
      hrId: formData.hrId,
      ...moduleFlags,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      startTime: formData.startTime ? formData.startTime + ":00" : "00:00:00",
      endTime: formData.endTime ? formData.endTime + ":00" : "00:00:00",
      approxStudentCount: parseInt(formData.approxStudentCount) || 0
    };

    try {
      const token = localStorage.getItem("companyToken");
      const response = await fetch("/api/company/test/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmissionStatus({ type: "success", message: "Test created successfully! Redirecting..." });
        setTimeout(() => {
          window.location.href = "/company/dashboard";
        }, 1500);
      } else {
        const errorData = await response.json();
        setSubmissionStatus({ type: "error", message: errorData.message || "Failed to create test" });
      }
    } catch (error) {
      console.error("Error creating test:", error);
      setSubmissionStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-sm rounded-r-sm p-8 flex flex-col shadow-sm min-h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">You are creating the Test</h2>
      
      <div className="bg-[#f6f7f9] rounded-2xl p-6 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
               <button 
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 disabled={availableModules.length === 0}
                 className="flex items-center w-max gap-1.5 px-3 py-1.5 bg-black text-white text-[13px] font-bold rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
               >
                 <FiPlus size={16} /> Add Module
               </button>

               {isDropdownOpen && availableModules.length > 0 && (
                 <div className="absolute top-full left-0 mt-2 w-[220px] bg-white border border-gray-100 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1">
                   {availableModules.map((mod, idx) => (
                     <button
                       key={idx}
                       onClick={() => addModule(mod)}
                       className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors"
                     >
                       <span className="font-bold text-[14px] text-gray-800">{mod.name}</span>
                       <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${mod.bgClass} ${mod.textClass}`}>+ {mod.time}m</span>
                     </button>
                   ))}
                 </div>
               )}
             </div>
             <span className="text-gray-500 font-bold text-[15px]">Select the module to be conducted in the test.</span>
           </div>
           <div className="flex items-center gap-6">
               <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-3 font-bold shadow-sm border border-gray-100">
                 <span className="text-gray-600 text-[15px]">Total credits for conducting one Test:</span>
                 <div className="flex items-center gap-2">
                   <img src="/Point.svg" className="w-7 h-7 object-contain" alt="coin" />
                   <span className="text-black text-2xl font-black">{totalCredits > 0 ? totalCredits : "0"}</span>
                 </div>
               </div>
           </div>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
           {selectedModules.map((mod, idx) => (
             <div key={idx} className={`${mod.bgClass} relative rounded-xl p-4 flex flex-col justify-center items-center gap-4 border border-black/5`}>
                <button 
                  onClick={() => removeModule(mod.name)}
                  className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/5 hover:bg-black/10 text-gray-600 transition-colors"
                  title="Remove Module"
                >
                  <FiX size={14} />
                </button>
                <span className={`font-bold text-[15px] ${mod.textClass} mt-1`}>{mod.name}</span>
                <div className="flex items-center justify-center gap-3.5 bg-white/50 px-2 py-2 rounded-lg w-full mt-auto">
                   <div className="flex items-center gap-1.5">
                     <img src="/Point.svg" className="w-[15px] h-[15px] object-contain opacity-90" alt="coin" />
                     <span className="font-bold text-[13px] leading-none">{mod.cost}</span>
                   </div>
                   <div className="w-[1px] h-3.5 bg-black/15"></div>
                   <div className="flex items-center gap-1.5 text-gray-700">
                     <FiClock size={15} className={`${mod.textClass}`} strokeWidth={2.5} />
                     <span className="font-bold text-[13px] leading-none whitespace-nowrap">{mod.time} min</span>
                   </div>
                </div>
             </div>
           ))}

           <div className="bg-white rounded-xl p-4 flex flex-col justify-center items-center gap-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-gray-800">
                <FiClock size={16} />
                <span className="font-bold text-sm">Total time</span>
              </div>
              <div className="bg-[#f4f6f8] px-6 py-2 rounded-lg w-full text-center mt-auto">
                 <span className="font-black text-gray-900 text-[15px]">{totalTime > 0 ? `${totalTime} min` : "0 min"}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-8 border-t border-gray-100 pt-10 px-2">
        <div className="grid grid-cols-2 gap-12">
           <div className="flex flex-col gap-3">
              <span className="font-black text-gray-900 whitespace-nowrap text-sm uppercase tracking-wider">Test ID / Name</span>
              <div className="relative">
                <input 
                  type="text" 
                  name="testId"
                  value={formData.testId}
                  onChange={handleInputChange}
                  placeholder="Enter a unique test ID or Name Eg: (SUMMER-INTERN-2026)" 
                  className={`px-5 py-3.5 bg-[#fcfcfc] border rounded-xl text-sm w-full focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300 font-bold ${
                    testIdStatus === "taken" ? "border-red-400 focus:ring-red-100" : 
                    testIdStatus === "available" ? "border-green-400 focus:ring-green-100" : 
                    "border-gray-200 focus:ring-brand-light"
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                  {testIdStatus === "checking" && <FiLoader className="animate-spin text-gray-400" />}
                  {testIdStatus === "available" && <FiCheckCircle className="text-green-500" />}
                  {testIdStatus === "taken" && <FiAlertCircle className="text-red-500" />}
                </div>
              </div>
              {testIdStatus === "taken" && <span className="text-red-500 text-[11px] font-bold ml-1">Test ID already exists. Enter a unique ID.</span>}
              {testIdStatus === "available" && <span className="text-green-600 text-[11px] font-bold ml-1">Unique ID confirmed!</span>}
           </div>

           <div className="flex flex-col gap-3">
              <span className="font-black text-gray-900 whitespace-nowrap text-sm uppercase tracking-wider">Select HR for conducting</span>
              <select 
                name="hrId"
                value={formData.hrId}
                onChange={handleInputChange}
                className="px-5 py-3.5 bg-[#fcfcfc] border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-light transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="" disabled>Select an HR person</option>
                {hrList.map((hr) => (
                  <option key={hr.hrId} value={hr.hrId}>
                    {hr.name} ({hr.designation || "HR"})
                  </option>
                ))}
                {hrList.length === 0 && <option value="">No HRs found - please add some first</option>}
              </select>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
           <div className="flex flex-col gap-3">
              <span className="font-black text-gray-900 whitespace-nowrap text-sm uppercase tracking-wider">
                Start Date
              </span>
              <input 
                type="date" 
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="px-5 py-3.5 bg-[#fcfcfc] border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-light transition-all font-bold"
              />
           </div>
           <div className="flex flex-col gap-3">
              <span className="font-black text-gray-900 whitespace-nowrap text-sm uppercase tracking-wider">
                Start Time
              </span>
              <input 
                type="time" 
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="px-5 py-3.5 bg-[#fcfcfc] border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-light transition-all font-bold"
              />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
           <div className="flex flex-col gap-3">
              <span className="font-black text-gray-900 whitespace-nowrap text-sm uppercase tracking-wider">
                End Date
              </span>
              <input 
                type="date" 
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="px-5 py-3.5 bg-[#fcfcfc] border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-light transition-all font-bold"
              />
           </div>
           <div className="flex flex-col gap-3">
              <span className="font-black text-gray-900 whitespace-nowrap text-sm uppercase tracking-wider">
                End Time
              </span>
              <input 
                type="time" 
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="px-5 py-3.5 bg-[#fcfcfc] border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-light transition-all font-bold"
              />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12 items-end">
           <div className="flex flex-col gap-3">
              <span className="font-black text-gray-900 whitespace-nowrap text-sm uppercase tracking-wider">
                Approx Student Count
              </span>
              <input 
                type="number" 
                name="approxStudentCount"
                value={formData.approxStudentCount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="px-5 py-3.5 bg-[#fcfcfc] border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-light transition-all font-bold"
              />
           </div>
           
           <div className="flex flex-col gap-4">
              {submissionStatus.message && (
                <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  submissionStatus.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {submissionStatus.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                  {submissionStatus.message}
                </div>
              )}
              <button 
                onClick={handleCreateTest}
                disabled={isSubmitting || testIdStatus === "taken" || selectedModules.length === 0}
                className="w-full py-4 bg-black text-white font-black rounded-xl shadow-lg hover:bg-gray-900 transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Test
                  </>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
