import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiShield, FiCheckCircle, FiAlertCircle, FiLoader, FiEye } from 'react-icons/fi';

// API base URLs — both now served by New-AI-verification-module FastAPI (port 8000)
const PYTHON_API = 'http://localhost:8000';
const DOTNET_API = 'http://localhost:8000';

const UploadDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));

  // State passed from LiveVerification.jsx
  const { uniqueId, testId } = location.state || {};


  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [livenessStep, setLivenessStep] = useState('IDLE'); // IDLE | BLINK | LEFT | RIGHT | CENTER | DONE
  const [stepMessage, setStepMessage] = useState('Ready to start liveness check');

  useEffect(() => {
    if (!uniqueId) {
      navigate('/user/live-verification');
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Unable to access camera. Please allow camera permission.');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [uniqueId, navigate]);

  // Main Liveness Polling Loop
  useEffect(() => {
    let intervalId;
    
    if (isVerifying && !isSuccess && livenessStep !== 'IDLE' && livenessStep !== 'DONE') {
      intervalId = setInterval(async () => {
        await captureAndCheck();
      }, 1000); // Check every 1000ms
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isVerifying, isSuccess, livenessStep]);

  const captureAndCheck = async () => {
    if (!videoRef.current || !uniqueId) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('unique_id', uniqueId);
      formData.append('step', livenessStep);
      formData.append('frame', blob, 'frame.jpg');

      try {
        const response = await fetch(`${PYTHON_API}/liveness/check`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to check liveness');
        const data = await response.json();

        if (data.status === 'SUCCESS') {
          if (livenessStep === 'BLINK') {
              setLivenessStep('LEFT'); 
              setStepMessage('Great! Now look to your LEFT with your eyes');
          } else if (livenessStep === 'LEFT') {
              setLivenessStep('RIGHT'); 
              setStepMessage('Excellent! Now look to your RIGHT with your eyes');
          } else if (livenessStep === 'RIGHT') {
              setLivenessStep('CENTER');
              setStepMessage('Almost done! Now look STRAIGHT at the camera');
          } else if (livenessStep === 'CENTER') {


              await handleFinalSuccess(data.photo_url);
          }
        } else if (data.status === 'FAILED') {
           setError(data.message);
           setIsVerifying(false);
           setLivenessStep('IDLE');
        } else {
           if (data.status === 'WAITING') {
               setStepMessage(data.message);
           } else {
               setStepMessage("Position your face in the center");
           }
        }
      } catch (err) {
        console.error('Liveness Error:', err);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFinalSuccess = async (photoUrl) => {
    setLivenessStep('DONE');
    setStepMessage('Saving verification...');
    
    try {
      const completeRes = await fetch(`${DOTNET_API}/verification/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqueId: uniqueId,
          passportPhotoUrl: photoUrl || '',
        }),
      });

      if (!completeRes.ok) throw new Error('Could not update .NET database.');

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/interview/resume-parser', { state: { verified: true } });
      }, 2500);

    } catch (err) {
      setError(err.message);
      setIsVerifying(false);
    }
  };

  const startLivenessFlow = () => {
    setError('');
    setIsVerifying(true);
    setLivenessStep('BLINK');
    setStepMessage('Please blink your eyes multiple times');
  };

  const getStepIcon = () => {
    if (livenessStep === 'BLINK') return <FiEye className="animate-bounce" />;
    return <FiLoader className="animate-spin" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button onClick={() => navigate('/user/live-verification')} className="flex items-center gap-2 text-slate-500 font-bold text-sm"><FiArrowLeft /> Back</button>
        <h1 className="text-2xl font-black text-[#144542]">Identity Verification</h1>
        <div className="w-20" />
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center border border-slate-100">
        <h2 className="text-2xl font-black text-[#144542] mb-1">Step 2: Liveness Check</h2>
        <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest">Follow the instructions on screen</p>

        <div className="relative mx-auto w-full max-w-3xl aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden shadow-inner mb-8 border-4 border-slate-50">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          
          <AnimatePresence>
            {isVerifying && !isSuccess && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
                  {getStepIcon()}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-0.5">Instruction</p>
                  <p className="text-sm font-black text-[#144542] leading-tight">{stepMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-green-500/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <FiCheckCircle className="text-6xl mb-2" />
                <p className="font-black text-xl uppercase italic tracking-widest">Verified!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <FiAlertCircle /> {error}
            </div>
        )}

        {!isVerifying && !isSuccess && (
            <button onClick={startLivenessFlow} className="w-full bg-[#2563EB] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3">
                <FiShield className="text-lg" /> Start Liveness Check
            </button>
        )}

        {isVerifying && !isSuccess && (
            <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                    {['BLINK', 'LEFT', 'RIGHT', 'CENTER'].map((s) => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${livenessStep === s ? 'w-8 bg-blue-600' : 'w-3 bg-slate-200'}`} />
                    ))}

                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification in progress</p>
            </div>

        )}
      </motion.div>
    </div>
  );
};

export default UploadDetails;
