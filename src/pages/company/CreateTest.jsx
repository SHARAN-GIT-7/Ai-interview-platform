import React, { useState, useRef, useEffect } from "react";
import { 
  FiClock, FiPlus, FiX, FiCalendar, FiUsers, FiCheckCircle, 
  FiAlertCircle, FiLoader, FiMessageSquare, FiCode, FiActivity,
  FiUser, FiHash, FiTrendingUp
} from "react-icons/fi";

const modules = [
  { name: "AI-interview", cost: 50, time: 20, icon: FiActivity, bgClass: "bg-[#e5f5f6]", textClass: "text-[#1d8989]", key: "interviewModule" },
  { name: "Communication", cost: 50, time: 30, icon: FiMessageSquare, bgClass: "bg-[#e9daff]", textClass: "text-[#6b4ab9]", key: "verbalModule" },
  { name: "Coding Challenge", cost: 50, time: 60, icon: FiCode, bgClass: "bg-[#fdf0d9]", textClass: "text-[#db830f]", key: "codingModule" },
  { name: "Aptitude", cost: 50, time: 30, icon: FiTrendingUp, bgClass: "bg-[#fcdcb6]", textClass: "text-[#c26804]", key: "aptitudeModule" },
];

export default function CreateTest({ onCancel }) {
  const [selectedModules, setSelectedModules] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    testId: "",
    testName: "",
    hrId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    approxStudentCount: "",
    aptitudeTopic: ""
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

    setTestIdStatus("checking");

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
          console.warn("Test ID check endpoint failed, defaulting to available");
          setTestIdStatus("available");
        }
      } catch (error) {
        console.error("Error checking test ID:", error);
        setTestIdStatus("available");
      }
    }, 600);

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

  const availableModules = modules.filter(m => !selectedModules.some(sm => sm.key === m.key));

  const addModule = (mod) => {
    setSelectedModules([...selectedModules, mod]);
    setIsDropdownOpen(false);
  };

  const removeModule = (modKey) => {
    setSelectedModules(selectedModules.filter(m => m.key !== modKey));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    const hrId = formData.hrId || localStorage.getItem("hrId") || localStorage.getItem("companyId");

    const moduleFlags = {
      aptitudeModule: selectedModules.some(m => m.key === "aptitudeModule"),
      verbalModule: selectedModules.some(m => m.key === "verbalModule"),
      interviewModule: selectedModules.some(m => m.key === "interviewModule"),
      codingModule: selectedModules.some(m => m.key === "codingModule"),
    };

    const payload = {
      testId: formData.testId,
      testName: formData.testName,
      hrId: hrId,
      ...moduleFlags,
      aptitudeTopic: formData.aptitudeTopic,
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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmissionStatus({ type: "success", message: "Test created successfully! Redirecting..." });
        setTimeout(() => window.location.href = "/company/dashboard", 1500);
      } else {
        const errorData = await response.json();
        setSubmissionStatus({ type: "error", message: errorData.message || "Failed to create test" });
      }
    } catch (error) {
      setSubmissionStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white custom-scrollbar rounded-xl flex justify-center py-12 px-6">
      <div className="w-full max-w-[850px]">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configure New Test</h1>
          <p className="text-gray-500 mt-2 font-medium">Design your assessment by selecting modules and scheduling details.</p>
        </div>

        {/* Assessment Modules Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Assessment Modules</h2>
              <p className="text-sm text-gray-500 mt-0.5">Select the skills you want to evaluate</p>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={availableModules.length === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <FiPlus size={16} /> Add Module
              </button>

              {isDropdownOpen && availableModules.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-[240px] bg-white border border-gray-100 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1">
                  {availableModules.map((mod) => (
                    <button
                      key={mod.key}
                      onClick={() => addModule(mod)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <mod.icon size={14} className="text-gray-500" />
                        <span className="font-bold text-sm text-gray-800">{mod.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400">+{mod.time}m</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Module Grid */}
          {selectedModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedModules.map((mod) => (
                <div key={mod.key} className="relative border border-[#e5e7eb] rounded-xl p-5 bg-white shadow-sm flex flex-col">
                  <button 
                    onClick={() => removeModule(mod.key)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${mod.bgClass}`}>
                    <mod.icon size={18} className={mod.textClass} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4">{mod.name}</h3>
                  <div className="flex items-center gap-6 mt-auto">
                    <div className="flex items-center gap-2 text-gray-500">
                      <img src="/Point.svg" className="w-4 h-4 opacity-60 grayscale" alt="credits" />
                      <span className="text-xs font-bold">{mod.cost} Credits</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <FiClock size={14} className="opacity-70" />
                      <span className="text-xs font-bold">{mod.time} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <FiPlus size={24} />
              </div>
              <p className="text-sm font-bold text-gray-700">No modules selected</p>
              <p className="text-xs text-gray-500 mt-1">Click 'Add Module' to build your assessment.</p>
            </div>
          )}

          {/* Totals Summary */}
          <div className="mt-6 flex bg-[#fafafa] rounded-xl p-6 border border-gray-100">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Duration</span>
              <div className="flex items-center gap-2 text-[#144542]">
                <FiClock size={16} strokeWidth={2.5} />
                <span className="text-xl font-black">{totalTime > 0 ? `${totalTime} min` : "0 min"}</span>
              </div>
            </div>
            <div className="w-px bg-gray-200 mx-6"></div>
            <div className="flex-1 flex flex-col justify-center items-end text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Credits</span>
              <div className="flex items-center gap-2 text-[#144542]">
                <img src="/Point.svg" className="w-5 h-5 object-contain" alt="credits" style={{ filter: "brightness(0) saturate(100%) invert(20%) sepia(16%) saturate(2371%) hue-rotate(124deg) brightness(97%) contrast(93%)" }} />
                <span className="text-xl font-black">{totalCredits > 0 ? totalCredits : "0"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics & Scheduling */}
        <div className="mb-10">
          <div className="mb-6">
            <h2 className="text-[17px] font-bold text-gray-900">Logistics & Scheduling</h2>
            <p className="text-sm text-gray-500 mt-0.5">Assign responsibility and set the timeline</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Test ID */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Test ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiHash size={15} />
                </div>
                <input 
                  type="text" 
                  name="testId"
                  value={formData.testId}
                  onChange={handleInputChange}
                  placeholder="e.g. SUMMER-2026" 
                  className={`w-full pl-10 pr-10 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 transition-all ${
                    testIdStatus === "taken" ? "ring-2 ring-red-400 bg-red-50/50" : 
                    testIdStatus === "available" ? "ring-2 ring-green-400 bg-green-50/50" : 
                    "focus:ring-[#144542]"
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  {testIdStatus === "checking" && <FiLoader className="animate-spin text-gray-400" />}
                  {testIdStatus === "available" && <FiCheckCircle className="text-green-500" />}
                  {testIdStatus === "taken" && <FiAlertCircle className="text-red-500" />}
                </div>
              </div>
              {testIdStatus === "taken" && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">Test ID already exists.</p>}
            </div>

            {/* Test Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Test Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiHash size={15} />
                </div>
                <input 
                  type="text" 
                  name="testName"
                  value={formData.testName}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineer Intern" 
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#144542] transition-all"
                />
              </div>
            </div>

            {/* Aptitude Topic (Conditional) */}
            {selectedModules.some(m => m.key === "aptitudeModule") && (
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Aptitude Topic</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FiTrendingUp size={15} />
                  </div>
                  <select 
                    name="aptitudeTopic"
                    value={formData.aptitudeTopic}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#144542] transition-all"
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Logical Reasoning">Logical Reasoning</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                    <option value="Data Interpretation">Data Interpretation</option>
                    <option value="Mixed Assessment">Mixed Assessment</option>
                  </select>
                </div>
              </div>
            )}

            {/* Assigned HR */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Assigned HR</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiUser size={15} />
                </div>
                <select 
                  name="hrId"
                  value={formData.hrId}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-[#144542] transition-all"
                >
                  <option value="" disabled>Select an HR person</option>
                  {hrList.map((hr) => (
                    <option key={hr.hrId} value={hr.hrId}>
                      {hr.name} ({hr.designation || "HR"})
                    </option>
                  ))}
                  {hrList.length === 0 && <option value="">No HRs found</option>}
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiCalendar size={15} />
                </div>
                <input 
                  type="date" 
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium focus:ring-2 focus:ring-[#144542] transition-all"
                />
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Start Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiClock size={15} />
                </div>
                <input 
                  type="time" 
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium focus:ring-2 focus:ring-[#144542] transition-all"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiCalendar size={15} />
                </div>
                <input 
                  type="date" 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium focus:ring-2 focus:ring-[#144542] transition-all"
                />
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">End Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiClock size={15} />
                </div>
                <input 
                  type="time" 
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium focus:ring-2 focus:ring-[#144542] transition-all"
                />
              </div>
            </div>

            {/* Approx Student Count */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Approx Student Count</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiUsers size={15} />
                </div>
                <input 
                  type="number" 
                  name="approxStudentCount"
                  value={formData.approxStudentCount}
                  onChange={handleInputChange}
                  placeholder="e.g. 50"
                  min="0"
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#144542] transition-all"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-6 mt-2">
              <button 
                onClick={onCancel}
                className="px-10 py-4 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-4"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTest}
                disabled={isSubmitting || testIdStatus === "taken" || selectedModules.length === 0}
                className="flex-1 max-w-[250px] py-3.5 bg-[#144542] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#144542]/90 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><FiLoader className="animate-spin" /> Creating...</>
                ) : (
                  "Create Assessment"
                )}
              </button>
            </div>
          </div>
          
          {submissionStatus.message && (
            <div className={`mt-4 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
              submissionStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {submissionStatus.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
              {submissionStatus.message}
            </div>
          )}
        </div>
      </div> </div>
  );
}
