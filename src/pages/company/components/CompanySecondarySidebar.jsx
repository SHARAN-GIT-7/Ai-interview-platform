import React from "react";
import { FiPlus } from "react-icons/fi";

export default function CompanySecondarySidebar({ onCreateTest }) {
  return (
    <div className="content-anim w-80 bg-white border-r border-gray-100 p-6 flex flex-col gap-8 relative z-5">
      {/* Create Test Button - Lime Green */}
      <button 
        onClick={onCreateTest}
        className="flex items-center gap-3 w-full p-4 bg-[#DAFF0C] text-[#144542] font-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 group"
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#144542] text-xl font-bold border border-[#144542]/10 group-hover:rotate-90 transition-transform">
          <FiPlus />
        </div>
        <span className="tracking-tight text-lg">Create Test</span>
      </button>

      {/* Placeholder for list or navigation items */}
      <div className="space-y-4">
        {/* You can add sub-navigation or test categories here later */}
      </div>
    </div>
  );
}
