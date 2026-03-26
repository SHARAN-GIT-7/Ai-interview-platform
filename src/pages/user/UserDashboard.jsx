import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiBook, FiLogOut, FiEdit, FiUser, FiMail, FiHome, FiLayout, FiUserCheck, FiCheckCircle, FiChevronRight } from 'react-icons/fi';

import api from '../../services/api';
import axios from 'axios';
import EditProfileModal from './EditProfileModal.jsx';

// Import Company Logos
import googleLogo from '../../assets/company-logos/google.png';
import amazonLogo from '../../assets/company-logos/amazon.png';
import microsoftLogo from '../../assets/company-logos/microsoft.png';
import ibmLogo from '../../assets/company-logos/ibm.png';
import oracleLogo from '../../assets/company-logos/oracle.png';
import salesforceLogo from '../../assets/company-logos/salesforce.png';


const profileApi = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

const verificationApi = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

const mockTests = [
  { id: 'TXT-2024-AD', company: 'Google', testCode: 'TXT-2024-AD', testModule: 'Technical Interview', logo: googleLogo, bgColor: 'bg-white' },
  { id: 'TXT-2024-TE', company: 'Amazon', testCode: 'TXT-2024-TE', testModule: 'Technical Interview', logo: amazonLogo, bgColor: 'bg-white' },
  { id: 'TXT-2024-HR', company: 'Microsoft', testCode: 'TXT-2024-HR', testModule: 'HR Round', logo: microsoftLogo, bgColor: 'bg-white' },
  { id: 'APTITUDE', company: 'IBM', testCode: 'Aptitude', testModule: 'Aptitude Test', logo: ibmLogo, bgColor: 'bg-white' },
  { id: 'TXT-2024-FM', company: 'Oracle', testCode: 'TXT-2024-FM', testModule: 'Coding Challenge', logo: oracleLogo, bgColor: 'bg-white' },
  { id: 'BEHAVIORAL', company: 'Salesforce', testCode: 'Behavioral', testModule: 'System Design', logo: salesforceLogo, bgColor: 'bg-white' },
];


const TestCard = ({ test, onClick }) => (
  <button 
    onClick={() => onClick(test.testCode)}
    className="w-full flex items-center gap-6 p-5 bg-white border border-gray-100 hover:border-[#144542]/20 rounded-2xl transition-all duration-300 group hover:shadow-[0_15px_40px_rgba(20,69,66,0.06)] text-left relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#144542]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#144542]/10 transition-colors"></div>
    
    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg border border-gray-100 ${test.bgColor}`}>
      <img src={test.logo} alt={test.company} className="w-full h-full object-contain p-2" />
    </div>


    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 items-center">
      <div className="flex flex-col">
        <span className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Company Name</span>
        <span className="text-[#144542] font-extrabold text-base md:text-lg tracking-tight">{test.company}</span>
      </div>
      
      <div className="flex flex-col">
        <span className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Test Code</span>
        <span className="text-[#144542]/80 font-mono text-xs md:text-sm bg-[#144542]/5 px-2.5 py-1 rounded-lg border border-[#144542]/5 w-fit font-bold">{test.testCode}</span>
      </div>

      <div className="hidden md:flex flex-col">
        <span className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Test Module</span>
        <span className="text-[#144542]/60 font-semibold text-sm truncate">{test.testModule}</span>
      </div>
    </div>

    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center transition-all duration-300 group-hover:bg-[#144542] group-hover:scale-110 shadow-sm border border-gray-100 hover:border-transparent">
      <FiChevronRight className="text-xl text-[#144542] group-hover:text-white transition-colors" />
    </div>
  </button>
);


export default function UserDashboard() {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState({

    name: "",
    email: "",
    college: "",
    dob: "",
    age: "",
    address: "",
    phone: "",
    gender: "",
    photoUrl: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const email = localStorage.getItem("userEmail");
        const userId = localStorage.getItem("userId");

        if (!token || !email) {
          navigate('/login');
          return;
        }

        // Step 1: Fetch auth data (name + email)
        const authResponse = await api.get(`/auth/profile/${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let profileData = {
          name: authResponse.data.name || "",
          email: authResponse.data.email || "",
        };

        // Step 2: Fetch profile data (college, dob, age, etc.)
        if (userId) {
          try {
            const profileResponse = await profileApi.get(`/profile/${userId}`);
            if (profileResponse.data) {
              profileData = {
                ...profileData,
                name: profileResponse.data.fullName || profileData.name,
                college: profileResponse.data.college || "",
                dob: profileResponse.data.dob || "",
                age: profileResponse.data.age || "",
                address: profileResponse.data.address || "",
                phone: profileResponse.data.phone || "",
                gender: profileResponse.data.gender || "",
                photoUrl: profileResponse.data.photoUrl || "",
              };
            }
          } catch (profileError) {
            if (profileError.response?.status !== 404) {
              console.error("Error fetching profile:", profileError);
            }
          }

          // Step 3: Fetch verification status
          try {
            const verifyRes = await verificationApi.get(`/verification/status/${userId}`);
            if (verifyRes.data && verifyRes.data.verified) {
              setIsVerified(true);
            }
          } catch (verifyError) {
            console.error("Error fetching verification status:", verifyError);
          }
        }

        setUserData((prev) => ({ ...prev, ...profileData }));
      } catch (error) {
        console.error("Error fetching user details:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userId");
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate('/login');
  };

  const handleSaveProfile = (newData) => {
    setUserData(newData);
  };

  const handleTestClick = (testId) => {
    navigate('/user/live-verification', { state: { testId } });
  };

  const filteredTests = mockTests.filter(test => 
    test.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.testCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.testModule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      const match = mockTests.find(test => test.testCode.toLowerCase() === searchQuery.toLowerCase());
      if (match) {
        handleTestClick(match.testCode);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#EAF0F0] items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#144542] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#144542] font-bold tracking-wide">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#EAF0F0] p-4 md:p-6 gap-6 md:gap-8 font-sans overflow-hidden">
      {/* Left Sidebar Profile Section - 40% Width */}
      <div className="w-[40%] min-w-[340px] bg-[#144542] rounded-2xl flex flex-col p-6 lg:p-8 shadow-[0_20px_50px_rgba(20,69,66,0.3)] h-full overflow-hidden relative">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Unified Profile Card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10 flex items-center gap-6 shadow-inner grow-0">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-2xl border-2 border-[#1b5b53] flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-105">
               {userData.photoUrl ? (
                 <img src={userData.photoUrl} alt={userData.name} className="w-full h-full object-cover" />
               ) : (
                 <FiUser className="text-5xl text-[#144542]/20" />
               )}
            </div>
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            <div className="min-w-0 border-l-2 border-[#DAFF0C]/30 pl-3">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] leading-none mb-1">Name</p>
              <p className="text-white text-sm lg:text-base xl:text-lg truncate tracking-wider">{userData.name}</p>
            </div>

            <div className="min-w-0 border-l-2 border-[#DAFF0C]/30 pl-3">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] leading-none mb-1">Email</p>
              <p className="text-white text-xs lg:text-base truncate tracking-wider">{userData.email}</p>
            </div>

            <div className="min-w-0 border-l-2 border-[#DAFF0C]/30 pl-3">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] leading-none mb-1">Institution</p>
              <p className="text-white text-xs lg:text-base truncate tracking-wider">{userData.college}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 mt-auto mb-2 relative z-10 overflow-y-auto pr-1 custom-scrollbar">
          <button onClick={() => navigate('/aptitude/start')} className="w-full flex items-center justify-between px-6 py-4 bg-[#DAFF0C]/5 hover:bg-[#DAFF0C]/10 border border-[#DAFF0C]/10 hover:border-[#DAFF0C]/30 text-white rounded-xl transition-all duration-300 group shadow-lg shrink-0">
            <div className="flex items-center gap-4">
               <FiLayout className="text-2xl text-[#DAFF0C] group-hover:rotate-12 transition-transform" />
               <span className="font-bold text-lg tracking-wide">Aptitude Test</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#DAFF0C] transition-all duration-300">
              <div className="w-2 h-2 border-t-2 border-r-2 border-white group-hover:border-[#144542] rotate-45 ml-[-2px]"></div>
            </div>
          </button>

          <button className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-[#DAFF0C]/10 border border-white/5 hover:border-[#DAFF0C]/20 text-white rounded-xl transition-all duration-300 group shadow-lg shrink-0">
            <div className="flex items-center gap-4">
               <FiClock className="text-2xl text-[#DAFF0C] group-hover:rotate-12 transition-transform" />
               <span className="font-bold text-lg tracking-wide">Completed test</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#DAFF0C] transition-all duration-300">
              <div className="w-2 h-2 border-t-2 border-r-2 border-white group-hover:border-[#144542] rotate-45 ml-[-2px]"></div>
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-[#DAFF0C]/10 border border-white/5 hover:border-[#DAFF0C]/20 text-white rounded-xl transition-all duration-300 group shadow-lg shrink-0">
            <div className="flex items-center gap-4">
               <FiBook className="text-2xl text-[#DAFF0C] group-hover:rotate-12 transition-transform" />
               <span className="font-bold text-lg tracking-wide">Guide for the test</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#DAFF0C] transition-all duration-300">
              <div className="w-2 h-2 border-t-2 border-r-2 border-white group-hover:border-[#144542] rotate-45 ml-[-2px]"></div>
            </div>
          </button>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-2 shrink-0">
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white py-4 rounded-xl transition-all duration-300 font-black tracking-widest uppercase text-[10px] group shadow-lg"
            >
              <FiLogOut className="text-lg group-hover:-translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex cursor-pointer items-center justify-center gap-2 bg-[#DAFF0C] hover:bg-[#DAFF0C]/90 text-[#144542] py-4 rounded-xl transition-all duration-300 font-black tracking-widest uppercase text-[10px] shadow-[0_10px_20px_rgba(218,255,12,0.2)] hover:shadow-[0_15px_30px_rgba(218,255,12,0.3)] group"
            >
              <FiEdit className="text-lg " />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col py-2 max-w-[60%]">
        <div className="w-full relative bg-white rounded-2xl overflow-hidden flex items-center shadow-xl border border-gray-100 group transition-all duration-300 focus-within:ring-2 focus-within:ring-[#144542]/10 shrink-0">
          <input 
            type="text" 
            placeholder="Enter Test code or Company name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full bg-transparent p-5 pl-8 text-[#144542] placeholder:text-gray-400 font-semibold text-lg outline-none"
          />
          <div className="px-5 py-3 ml-2 border-l border-gray-100 flex items-center justify-center text-gray-400 group-focus-within:text-[#144542] transition-colors">
            <FiSearch className="text-3xl" />
          </div>
        </div>

        {/* Test Sections List */}
        <div className="mt-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-[#144542] text-2xl font-black tracking-tight uppercase">Interview Identity System</h2>
              <p className="text-gray-500 font-medium">Candidate Dashboard • {filteredTests.length} Tests Available</p>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-sm font-bold text-[#144542]/60 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <div key={test.id} className="animate-fade-in">
                  <TestCard test={test} onClick={handleTestClick} />
                </div>
              ))
            ) : (
              <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiSearch className="text-4xl text-gray-300" />
                </div>
                <h3 className="text-[#144542] text-xl font-bold mb-1">No tests found</h3>
                <p className="text-gray-500 max-w-xs">We couldn't find any test matching "{searchQuery}". Please check the test code and try again.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        userData={userData}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

