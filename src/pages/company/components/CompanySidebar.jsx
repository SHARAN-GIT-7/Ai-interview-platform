import React from "react";
import { FiHome, FiCreditCard, FiLogOut, FiUsers } from "react-icons/fi";

export default function CompanySidebar({ activeTab, setActiveTab, onLogout }) {
  const navItems = [
    { id: "home", icon: <FiHome />, label: "Home" },
    { id: "billing", icon: <FiCreditCard />, label: "Billing" },
    { id: "hr", icon: <FiUsers />, label: "HR" },
  ];

  return (
    <div className="sidebar-anim w-24 bg-white flex flex-col py-8 pt-6 items-center justify-between border-r border-gray-200 relative z-20">
      <div className="flex flex-col items-center gap-10 w-full mt-0">
        {/* Navigation Items */}
        <div className="flex flex-col gap-6 w-full items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="group flex flex-col items-center gap-1 transition-all"
            >
              <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                activeTab === item.id 
                  ? "bg-[#144542] text-white shadow-lg" 
                  : "text-[#144542]/60 hover:text-[#144542] hover:bg-gray-50"
              }`}>
                <span className="text-2xl">{item.icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${
                  activeTab === item.id ? "text-white" : "text-[#144542]/60"
                }`}>
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Logout at Bottom */}
      <button 
        onClick={onLogout}
        className="group flex flex-col items-center gap-1 transition-all"
      >
        <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[#144542]/60 hover:text-red-500 hover:bg-red-50 transition-all duration-300">
          <span className="text-2xl"><FiLogOut /></span>
          <span className="text-[10px] font-bold uppercase tracking-tight mt-1">
            logout
          </span>
        </div>
      </button>
    </div>
  );
}
