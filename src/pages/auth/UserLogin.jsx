import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import bgImage from "../../assets/images/login_register_BG.png";
import { motion, AnimatePresence } from "framer-motion";

export default function UserLogin() {
  const [view, setView] = useState("login"); // login, forgot, verify, reset
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const shouldAnimate = location.state?.fromLanding;

  // Poll the backend to check if the user clicked the verification link
  useEffect(() => {
    let interval;
    if (view === "verify" && !emailVerified) {
      interval = setInterval(async () => {
        try {
          // Pointing back to Node.js backend port 5000 for email verification
          const response = await fetch(`http://localhost:5000/api/check-verification/${email}`);
          const data = await response.json();
          if (data.verified) {
            setEmailVerified(true);
            setView("reset");
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error polling verification status:", error);
        }
      }, 2000); // Check every 2 seconds
    }
    return () => clearInterval(interval);
  }, [view, email, emailVerified]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5258/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        alert("Login successful!");
        navigate("/user/dashboard");
      } else {
        let errorMsg = "Login failed";
        try {
          const text = await response.text();
          try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.message || "Login failed";
          } catch {
            errorMsg = text || "Login failed";
          }
        } catch (e) {
          // ignore
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(`Error connecting to the login server: ${error.message}. Please check if the .NET backend (port 5258) is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        alert("Reset link sent! Please check your email.");
        setView("verify");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Error connecting to verification server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5258/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          newPassword: password,
          confirmPassword
        })
      });

      if (response.ok) {
        alert("Password updated successfully! Please login.");
        setView("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        alert(typeof errorData === 'string' ? errorData : (errorData.message || "Reset failed"));
      }
    } catch (error) {
      console.error("Reset error:", error);
      alert("Error connecting to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen h-[100dvh] w-full bg-white overflow-hidden">
        
        {/* Left Side - Image Background */}
        <div className="hidden lg:flex w-[45%] p-4 bg-white">
          <div className="w-full h-full relative rounded-[2rem] overflow-hidden flex flex-col justify-between p-8">
            <img 
              src={bgImage} 
              alt="Login Background" 
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0"></div>

            <div className="relative z-10">
              <Link to="/" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-3xl font-bold hover:bg-white/30 transition-all">
                <IoMdArrowRoundBack />
              </Link>
            </div>

            <div className="relative z-10 text-white">
              <motion.p 
                initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-white/90 text-lg mb-4 font-regular italic"
              >
                You can
              </motion.p>
              <motion.h2 
                initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-4xl xl:text-5xl font-black leading-tight tracking-tight drop-shadow-md"
              >
                Start your journey <br />
                towards smarter<br />
                evaluations
              </motion.h2>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form (60% Width) */}
        <div className="w-full lg:w-[55%] p-8 md:p-16 flex flex-col justify-center h-full bg-white relative overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <div className="w-10 h-10 bg-brand-dark rounded-lg flex lg:hidden items-center justify-center text-brand-secondary text-2xl font-bold mb-6 mx-auto">
                ❊
              </div>
              <h1 className="text-4xl font-black text-brand-dark mb-4 tracking-tight">
                {view === "login" && "Login with your account"}
                {view === "forgot" && "Reset Password"}
                {view === "verify" && "Verify Email"}
                {view === "reset" && "Create New Password"}
              </h1>
              <p className="text-brand-gray text-sm leading-relaxed">
                {view === "login" && "Access your tasks, notes, and projects anytime, anywhere - and keep everything flowing in one place."}
                {view === "forgot" && "Enter your email to receive a password reset link."}
                {view === "verify" && "Please click the verification link sent to your email."}
                {view === "reset" && "Set your new password to regain access to your account."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {view === "login" && (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6" 
                  onSubmit={handleLogin}
                >
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                      Your email
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                      Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark transition-colors"
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                    <div className="mt-2 text-right">
                      <button 
                        type="button" 
                        onClick={() => setView("forgot")}
                        className="text-xs font-bold text-brand-dark hover:underline underline-offset-4"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-4 py-4 bg-brand-dark text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-dark/20 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? "Logging in..." : "Login Now"}
                  </button>
                </motion.form>
              )}

              {view === "forgot" && (
                <motion.form 
                  key="forgot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6" 
                  onSubmit={handleForgot}
                >
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                      Your email
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-4 py-4 bg-brand-dark text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-dark/20 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  
                  <p className="text-center text-sm text-brand-gray font-medium">
                    Remember your password? <button type="button" onClick={() => setView("login")} className="text-brand-dark font-black hover:underline">Log in</button>
                  </p>
                </motion.form>
              )}

              {view === "verify" && (
                <motion.div 
                  key="verify"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className="flex justify-center">
                    <span className="w-12 h-12 rounded-full border-4 border-brand-dark border-t-transparent animate-spin"></span>
                  </div>
                  <p className="text-brand-gray font-bold">Waiting for email verification...</p>
                  <button 
                    type="button" 
                    onClick={() => setView("forgot")}
                    className="text-brand-dark font-black hover:underline px-4 py-2"
                  >
                    Change Email
                  </button>
                </motion.div>
              )}

              {view === "reset" && (
                <motion.form 
                  key="reset"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6" 
                  onSubmit={handleReset}
                >
                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                      New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark transition-colors"
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark transition-colors"
                      >
                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-4 py-4 bg-brand-dark text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-dark/20 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase px-4">
                <span className="bg-white px-2 text-brand-gray font-bold tracking-widest">or continue with</span>
              </div>
            </div>

            <p className="text-center text-sm text-brand-gray font-medium">
              Don't have an account? <Link to="/register" className="text-brand-dark font-black hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
    </div>
  );
}