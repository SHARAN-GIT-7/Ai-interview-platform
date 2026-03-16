<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiBook, FiLogOut, FiEdit, FiUser, FiMail, FiHome, FiLayout } from 'react-icons/fi';
import api from '../../services/api';
import axios from 'axios';
import EditProfileModal from './EditProfileModal.jsx';

const profileApi = axios.create({
  baseURL: 'http://localhost:5222/api',
  headers: { 'Content-Type': 'application/json' },
});

export default function UserDashboard() {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    college: "",
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiBook, FiLogOut, FiEdit, FiUser, FiMail, FiHome, FiLayout } from 'react-icons/fi';
import EditProfileModal from './EditProfileModal.jsx';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "Sharan",
    email: "tsharan2006@gmail.com",
    college: "Panimaler Engineering college",
>>>>>>> 2aa1b063be8d19d22a434836590ce99fdb0a73a9
    dob: "",
    age: "",
    address: "",
    phone: "",
<<<<<<< HEAD
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
            // Profile not created yet — that's fine, just show auth data
            if (profileError.response?.status !== 404) {
              console.error("Error fetching profile:", profileError);
            }
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
=======
  });

  const handleLogout = () => {
>>>>>>> 2aa1b063be8d19d22a434836590ce99fdb0a73a9
    navigate('/login');
  };

  const handleSaveProfile = (newData) => {
    setUserData(newData);
    // Here you would typically make an API call to save the data
  };

<<<<<<< HEAD
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

=======
>>>>>>> 2aa1b063be8d19d22a434836590ce99fdb0a73a9
  return (
    <div className="flex h-screen w-full bg-[#EAF0F0] p-4 md:p-6 gap-6 md:gap-8 font-sans overflow-hidden">
      {/* Left Sidebar Profile Section - 40% Width */}
      <div className="w-[40%] min-w-[340px] bg-[#144542] rounded-2xl flex flex-col p-6 lg:p-8 shadow-[0_20px_50px_rgba(20,69,66,0.3)] h-full overflow-hidden relative">
        {/* Subtle Decorative Background Element */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Unified Profile Card - Optimized Horizontal Layout */}
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10 flex items-center gap-6 shadow-inner grow-0">
          {/* Boxed Profile Image - Slightly Downscaled */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-2xl border-2 border-[#1b5b53] flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-105">
<<<<<<< HEAD
               {userData.photoUrl ? (
                 <img src={userData.photoUrl} alt={userData.name} className="w-full h-full object-cover" />
               ) : (
                 <FiUser className="text-5xl text-[#144542]/20" />
               )}
=======
               <FiUser className="text-5xl text-[#144542]/20" />
>>>>>>> 2aa1b063be8d19d22a434836590ce99fdb0a73a9
            </div>
          </div>

          {/* User Info - Optimized Spacing */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="min-w-0 border-l-2 border-[#DAFF0C]/30 pl-3">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] leading-none mb-1">Name</p>
              <p className="text-white  text-sm lg:text-base xl:text-lg truncate tracking-wider">{userData.name}</p>
            </div>

            <div className="min-w-0 border-l-2 border-[#DAFF0C]/30 pl-3">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] leading-none mb-1">Email</p>
              <p className="text-white  text-xs lg:text-base truncate tracking-wider">{userData.email}</p>
            </div>

            <div className="min-w-0 border-l-2 border-[#DAFF0C]/30 pl-3">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] leading-none mb-1">Institution</p>
              <p className="text-white  text-xs lg:text-base truncate tracking-wider">{userData.college}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Compact Distributed */}
        <div className="w-full flex flex-col gap-3 mt-auto mb-2 relative z-10 overflow-y-auto pr-1 custom-scrollbar">
          <button className="w-full flex items-center justify-between px-6 py-4 bg-[#DAFF0C]/5 hover:bg-[#DAFF0C]/10 border border-[#DAFF0C]/10 hover:border-[#DAFF0C]/30 text-white rounded-xl transition-all duration-300 group shadow-lg shrink-0">
            <div className="flex items-center gap-4">
               <FiLayout className="text-2xl text-[#DAFF0C] group-hover:rotate-12 transition-transform" />
               <span className="font-bold text-lg tracking-wide">Mock Test</span>
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
              className="flex items-center justify-center gap-2 bg-[#DAFF0C] hover:bg-[#DAFF0C]/90 text-[#144542] py-4 rounded-xl transition-all duration-300 font-black tracking-widest uppercase text-[10px] shadow-[0_10px_20px_rgba(218,255,12,0.2)] hover:shadow-[0_15px_30px_rgba(218,255,12,0.3)] group"
            >
              <FiEdit className="text-lg  group-hover:scale-110 transition-transform" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

      </div>


      {/* Right Content Area */}
      <div className="flex-1 flex flex-col py-2 max-w-[60%]">
        {/* Top Search Bar */}
        <div className="w-full relative bg-white  rounded-2xl overflow-hidden flex items-center shadow-xl border border-gray-100 group transition-all duration-300 focus-within:ring-2 focus-within:ring-[#144542]/10">
          <input 
            type="text" 
            placeholder="Enter Test code"
            className="w-full bg-transparent p-5 pl-8 text-[#144542] placeholder:text-gray-400 font-semibold text-lg outline-none"
          />
          <div className="px-5 py-3 ml-2 border-l border-gray-100 flex items-center justify-center text-gray-400 group-focus-within:text-[#144542] transition-colors">
            <FiSearch className="text-3xl" />
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
