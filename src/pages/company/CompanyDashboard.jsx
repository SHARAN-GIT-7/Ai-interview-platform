import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Import Modular Components
import CompanySidebar from "./components/CompanySidebar";
import CompanyTopBar from "./components/CompanyTopBar";
import CompanySecondarySidebar from "./components/CompanySecondarySidebar";
import AddHRModal from "./components/AddHRModal";
import HRList from "./components/HRList";
import { FiPlus } from "react-icons/fi";

gsap.registerPlugin(useGSAP);

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [companyData, setCompanyData] = useState({ companyName: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isHRModalOpen, setIsHRModalOpen] = useState(false);
  const [hrRefreshKey, setHrRefreshKey] = useState(0);
  
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      ".sidebar-anim",
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power4.out" }
    )
    .fromTo(
      ".topbar-anim",
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(
      ".content-anim",
      { x: 20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
      "-=0.4"
    );
  }, { scope: containerRef });

  // Fetch Company Profile on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = localStorage.getItem("companyEmail");
        if (!email) {
          navigate("/company/login");
          return;
        }

        const response = await fetch(`/api/company/auth/profile?email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          setCompanyData(data);
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("companyToken");
    localStorage.removeItem("companyEmail");
    localStorage.removeItem("companyId");
    navigate("/company/login");
  };

  const handleCreateTest = () => {
    console.log("Create test clicked");
    // navigate("/company/create-test");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#EAF0F0] items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#144542] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-screen w-full bg-[#EAF0F0]/50 font-sans overflow-hidden">
      
      {/* 2. Top Bar Component (Full Width) */}
      <CompanyTopBar companyName={companyData.companyName} />

      <div className="flex-1 flex overflow-hidden">
        {/* 1. Side Nav Bar Component */}
        <CompanySidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
        />

        <div className="flex-1 flex overflow-hidden">
          {/* 3. Secondary Column Component */}
          {activeTab === "home" && <CompanySecondarySidebar onCreateTest={handleCreateTest} />}

          {/* 4. Main Dashboard Area */}
          <div className="content-anim flex-1 p-8 overflow-y-auto bg-[#EAF0F0]/60 relative">
            {activeTab === "hr" ? (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-10">
                  <button 
                    onClick={() => setIsHRModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-[#DAFF0C] text-[#144542] font-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#144542] text-xl font-bold border border-[#144542]/10 group-hover:rotate-90 transition-transform">
                      <FiPlus />
                    </div>
                    <span className="tracking-tight text-lg">Add HR</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   <HRList refreshTrigger={hrRefreshKey} />
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto h-full border-2 border-dashed border-gray-200/50 rounded-3xl flex items-center justify-center">
                 <p className="text-gray-300 font-bold uppercase tracking-[0.2em] text-sm">Dashboard Workspace</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add HR Modal */}
      <AddHRModal 
        isOpen={isHRModalOpen} 
        onClose={() => {
          setIsHRModalOpen(false);
          setHrRefreshKey(prev => prev + 1);
        }} 
      />
    </div>
  );
}