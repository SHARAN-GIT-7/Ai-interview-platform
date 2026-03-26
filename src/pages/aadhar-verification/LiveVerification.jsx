import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiImage, FiCheckCircle, FiArrowLeft, FiAlertCircle, FiLoader, FiFileText } from 'react-icons/fi';

const PYTHON_API = 'http://localhost:8000';
const DOTNET_API = 'http://localhost:8000';       // Now served by Python FastAPI
const DOTNET_PROFILE_API = 'http://localhost:8000'; // Profile fallback (userName from localStorage)

const LiveVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { testId } = location.state || {}; // testId from dashboard


  const [aadhaarDigits, setAadhaarDigits] = useState('');
  const [aadhaarZip, setAadhaarZip] = useState(null);
  const [shareCode, setShareCode] = useState('');
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleZipChange = (e) => {
    if (e.target.files?.[0]) setAadhaarZip(e.target.files[0]);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files?.[0]) setPassportPhoto(e.target.files[0]);
  };

  const handleVerify = async () => {
    setError('');

    if (aadhaarDigits.length !== 4) {
      setError('Please enter the last 4 digits of your Aadhaar.');
      return;
    }
    if (!aadhaarZip) {
      setError('Please upload your Aadhaar Offline eKYC ZIP file.');
      return;
    }
    if (shareCode.length !== 4) {
      setError('Please enter the 4-digit Share Code.');
      return;
    }
    if (!passportPhoto) {
      setError('Please upload your passport size photo.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Upload ZIP + share code to Python FastAPI
      const aadhaarForm = new FormData();
      aadhaarForm.append('file', aadhaarZip);
      aadhaarForm.append('share_code', shareCode);
      aadhaarForm.append('last4', aadhaarDigits);

      const aadhaarRes = await fetch(`${PYTHON_API}/aadhaar/upload`, {
        method: 'POST',
        body: aadhaarForm,
      });

      if (!aadhaarRes.ok) {
        const err = await aadhaarRes.json();
        throw new Error(err.detail || 'Aadhaar processing failed.');
      }

      const aadhaarData = await aadhaarRes.json();
      const { unique_id, aadhaar_details } = aadhaarData;

      // Step 2: Face Verification (Compare Aadhaar photo with Passport photo)
      // This step also stores the face embedding for liveness check
      const faceForm = new FormData();
      faceForm.append('unique_id', unique_id);
      faceForm.append('masked_aadhaar', aadhaar_details.masked_aadhaar || '');
      faceForm.append('photo', passportPhoto);

      const faceRes = await fetch(`${PYTHON_API}/face/verify`, {
        method: 'POST',
        body: faceForm,
      });

      if (!faceRes.ok) {
        const faceErr = await faceRes.json();
        throw new Error(faceErr.detail || 'Face verification failed.');
      }

      const faceData = await faceRes.json();
      if (faceData.status === 'Face mismatch') {
        throw new Error(`Face verification failed: Similarity score ${faceData.similarity.toFixed(2)}. Passport size is not matching with Aadhaar photo.`);
      }

      // Step 3: Fetch user name from Profile API (needed for verification record)
      const userId = localStorage.getItem('userId') || '1'; // Fallback for testing
      const profileRes = await fetch(`${DOTNET_PROFILE_API}/profile/${userId}`);
      let userName = 'User';
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        userName = profileData.fullName || 'User';
      }

      // Step 4: Create "pending" record in .NET Backend / PostgreSQL
      const createRes = await fetch(`${DOTNET_API}/verification/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          userName: userName,
          aadhaarLast4: aadhaarDigits,
          aadhaarZipUrl: aadhaar_details.zip_url || 'Manual Upload',
          passportPhotoUrl: '',
          uniqueId: unique_id,
          shareCode: shareCode,
        }),
      });

      if (!createRes.ok) {
        const dbError = await createRes.json();
        console.error('DATABASE ERROR DETAIL:', dbError.detail);
        throw new Error(`Database Error: ${dbError.detail || 'Could not create record.'}`);
      }

      // Step 5: Navigate to face verification with all state
      navigate('/user/upload-details', {
        state: {
          uniqueId: unique_id,
          aadhaarDetails: aadhaar_details,
          aadhaarLast4: aadhaarDigits,
          passportPhoto: passportPhoto,
          userName: userName,
          testId: testId // Passing testId forward
        },
      });

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isReady = aadhaarDigits.length === 4 && aadhaarZip && shareCode.length === 4 && passportPhoto;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center py-10 px-4 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex items-center justify-between mb-10"
      >
        <button
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#144542] transition-colors font-semibold text-sm"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-black text-[#144542] tracking-tight">Interview Identity System</h1>
        <div className="w-32" />
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-4xl flex items-center gap-3 mb-8"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#144542] text-white text-xs font-black flex items-center justify-center">1</div>
          <span className="text-xs font-bold text-[#144542]">Verify Details</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 rounded-full" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-400 text-xs font-black flex items-center justify-center">2</div>
          <span className="text-xs font-bold text-slate-400">Live Verification</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-slate-200/80 overflow-hidden border border-slate-100"
      >
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-black text-[#144542] mb-2">Identity Verification</h2>
          <p className="text-sm text-slate-400 font-medium mb-10">Please provide your Aadhaar details for KYC verification</p>

          {/* Aadhaar ZIP Download Instructions */}
          <div className="bg-[#144542]/5 rounded-2xl p-6 border border-[#144542]/10 mb-10">
            <h4 className="text-sm font-black text-[#144542] mb-4 flex items-center gap-2">
              <FiFileText className="text-lg" />
              Steps to download Aadhaar Offline eKYC ZIP
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#144542] text-[#DAFF0C] flex items-center justify-center text-[10px] font-bold">1</span>
                <div>
                  <p className="text-xs text-gray-700 font-bold mb-0.5">Visit UIDAI Portal</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    Go to <a href="https://myaadhaar.uidai.gov.in/" target="_blank" rel="noopener noreferrer" className="text-[#144542] underline hover:opacity-80">myaadhaar.uidai.gov.in</a>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#144542] text-[#DAFF0C] flex items-center justify-center text-[10px] font-bold">2</span>
                <div>
                  <p className="text-xs text-gray-700 font-bold mb-0.5">Login to Account</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Enter 12-digit Aadhaar & OTP</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#144542] text-[#DAFF0C] flex items-center justify-center text-[10px] font-bold">3</span>
                <div>
                  <p className="text-xs text-gray-700 font-bold mb-0.5">Navigate to Service</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Select 'Offline eKYC'</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#144542] text-[#DAFF0C] flex items-center justify-center text-[10px] font-bold">4</span>
                <div>
                  <p className="text-xs text-gray-700 font-bold mb-0.5">Create & Download</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Set Share Code & Get ZIP</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Left Column: Aadhaar Details */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700">Last 4 Aadhaar Digits</label>
                <input
                  type="text"
                  maxLength="4"
                  value={aadhaarDigits}
                  onChange={(e) => setAadhaarDigits(e.target.value.replace(/\D/g, ''))}
                  placeholder="xxxx"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-[#144542]/30 transition-all text-2xl font-bold placeholder:text-slate-300 tracking-[0.4em] text-center"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700">Aadhaar Offline ZIP File</label>
                <div
                  className={`relative group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 ${
                    aadhaarZip ? 'border-[#144542] bg-[#144542]/5' : 'border-slate-200 hover:border-[#144542]/30 hover:bg-slate-50'
                  }`}
                >
                  <input type="file" accept=".zip" onChange={handleZipChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                      aadhaarZip ? 'bg-[#144542] text-[#DAFF0C]' : 'bg-white text-gray-400 border border-gray-100'
                    }`}
                  >
                    {aadhaarZip ? <FiCheckCircle className="text-xl" /> : <FiUpload className="text-xl" />}
                  </div>
                  <p className="text-xs font-bold text-[#144542]">{aadhaarZip ? aadhaarZip.name : 'Click to upload Aadhaar ZIP'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700">Share Code</label>
                <input
                  type="password"
                  maxLength="4"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  placeholder="4-digit share code"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-[#144542]/30 transition-all text-sm font-bold placeholder:text-slate-300 tracking-[0.4em] text-center"
                />
                <p className="text-[11px] text-[#144542] font-bold bg-[#DAFF0C]/10 p-2 rounded-lg text-center">Use the same code you set on the UIDAI portal.</p>
              </div>
            </div>

            {/* Right Column: Passport Photo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700">Upload Passport Size Photo</label>
              <div
                className={`relative group border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 min-h-[300px] ${
                  passportPhoto ? 'border-green-500 bg-green-50/30' : 'border-slate-200 hover:border-[#144542]/30 hover:bg-slate-50'
                }`}
              >
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                {passportPhoto ? (
                  <img
                    src={URL.createObjectURL(passportPhoto)}
                    alt="Passport Preview"
                    className="w-36 h-36 object-cover rounded-2xl shadow-xl mb-4 border-4 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-slate-100 text-slate-400 group-hover:bg-[#144542]/5 group-hover:text-[#144542] transition-all">
                    <FiImage className="text-4xl" />
                  </div>
                )}
                <h3 className="text-sm font-black text-[#144542] mb-1">
                  {passportPhoto ? 'Photo Ready ✓' : 'Upload Passport Size Photo'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-4 text-center">
                  Drag & drop or click to browse<br/>(Supported: JPG, PNG | Max: 5MB)
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 text-sm font-semibold"
              >
                <FiAlertCircle className="text-lg flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex justify-center">
            <button
              onClick={handleVerify}
              disabled={!isReady || isLoading}
              className="w-full max-w-md py-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <FiLoader className="text-lg" />
                  </motion.div>
                  Processing Aadhaar...
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-lg" />
                  Verify Face
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveVerification;
