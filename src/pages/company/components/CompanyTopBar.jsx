import React from "react";
import { FiUser } from "react-icons/fi";

export default function CompanyTopBar({ companyName }) {
  return (
    <div className="topbar-anim h-20 bg-white shadow-sm border-b border-gray-100 flex flex-shrink-0 items-center justify-between px-12 relative z-10 w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {companyName || "Loading profile..."}
        </h1>
      </div>
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#144542] text-xl hover:bg-gray-200 transition-all cursor-pointer">
        <FiUser />
      </div>
    </div>
  );
}
