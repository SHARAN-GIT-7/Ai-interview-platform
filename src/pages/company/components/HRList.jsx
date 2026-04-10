import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiBriefcase, FiLayers, FiMoreVertical } from "react-icons/fi";

export default function HRList({ refreshTrigger }) {
  const [hrList, setHrList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHRList = async () => {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5001/api/hr/list/${companyId}`);
        if (response.ok) {
          const data = await response.json();
          setHrList(data);
        } else {
          const errorMsg = await response.text();
          console.error("Failed to fetch HR list:", errorMsg);
          setError("Failed to load HR data");
        }
      } catch (err) {
        console.error("Error connecting to mail server proxy:", err);
        setError("Network error. Is the mail server running?");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHRList();
  }, [refreshTrigger]);

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/40 animate-pulse rounded-2xl border border-[#144542]/5" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-12 text-center bg-red-50 rounded-3xl border border-red-100">
        <p className="text-red-700 font-bold">{error}</p>
        <p className="text-red-500 text-sm mt-2">Make sure your backend and mail server are running.</p>
      </div>
    );
  }

  if (hrList.length === 0) {
    return (
      <div className="mt-8 p-16 text-center bg-white/50 rounded-3xl border-2 border-dashed border-[#144542]/10">
        <p className="text-[#144542]/40 font-black uppercase tracking-widest text-sm">No HR personnel found</p>
        <p className="text-[#144542]/30 text-[10px] mt-2">Click "Add HR" to register your team members.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Header Row */}
      <div className="px-8 py-3 flex items-center text-[11px] font-black text-[#144542]/40 uppercase tracking-widest border-b border-[#144542]/5 mb-2">
        <div className="w-12" /> {/* Spacer for avatar */}
        <div className="flex-1 ml-4">Name</div>
        <div className="flex-1"> email</div>
        <div className="flex-1"> Phone no.</div>
        <div className="flex-1"> Departement</div>
        <div className="w-24 text-right pr-4"> Role</div>
      </div>

      <AnimatePresence>
        {hrList.map((hr, index) => (
          <motion.div
            key={hr.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white p-5 rounded-2xl flex items-center shadow-sm  transition-all duration-300 border border-transparent"
          >
            {/* Avatar Circle */}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#144542] font-black text-sm border-2 border-white shadow-sm shrink-0">
              {getInitials(hr.name)}
            </div>

            {/* Name Column */}
            <div className="flex-1 ml-4">
              <p className="text-[#144542] font-black text-base">{hr.name}</p>
            </div>

            {/* Email Column */}
            <div className="flex-1 truncate">
              <p className="text-[#144542]/60 font-medium text-sm flex items-center gap-2">
                <FiMail className="text-[#144542]/20" />
                {hr.email}
              </p>
            </div>

            {/* Phone Column */}
            <div className="flex-1">
              <p className="text-[#144542]/60 font-medium text-sm flex items-center gap-2">
                <FiPhone className="text-[#144542]/20" />
                {hr.phoneNumber}
              </p>
            </div>

            {/* Department Column */}
            <div className="flex-1">
              <p className="text-[#144542]/60 font-bold text-sm flex items-center gap-2">
                <FiLayers className="text-[#144542]/20" />
                {hr.department || "General"}
              </p>
            </div>

            {/* Role/Designation Column */}
            <div className="w-24 text-right pr-4">
              <p className="text-[#144542] font-black text-xs uppercase tracking-tight bg-[#EAF0F0]/50 py-1 px-3 rounded-lg inline-block">
                {hr.designation || "HR"}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
