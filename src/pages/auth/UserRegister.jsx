import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import bgImage from "../../assets/images/login_register_BG.png";

export default function UserRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen h-[100dvh] w-full  bg-white overflow-hidden">
        
        {/* Left Side - Image Background */}
        <div className="hidden lg:flex w-[45%] p-4 bg-white">
          <div className="w-full h-full relative rounded-[2rem] overflow-hidden flex flex-col justify-between p-8">
            <img 
              src={bgImage} 
              alt="Register Background" 
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0"></div>

            <div className="relative z-10">
              <Link to="/login" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-3xl font-bold hover:bg-white/30 transition-all">
                <IoMdArrowRoundBack />
              </Link>
            </div>

            <div className="relative z-10 text-white">
              <p className="text-white/90 text-lg mb-4 font-regular italic">Join us today</p>
              <h2 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
                Start your journey <br />
                towards smarter <br />
                evaluations
              </h2>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form (60% Width) */}
        <div className="w-full lg:w-[55%] p-8 md:p-16 flex justify-center h-full bg-white relative overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 text-center lg:text-left">
              <div className="w-10 h-10 bg-brand-dark rounded-lg flex lg:hidden items-center justify-center text-brand-secondary text-2xl font-bold mb-6 mx-auto">
                ❊
              </div>
              <h1 className="text-4xl font-black text-brand-dark mb-4 tracking-tight">
                Create an account
              </h1>
              <p className="text-brand-gray text-sm leading-relaxed">
                Sign up to unlock your personal workspace, track your progress, and excel in every evaluation.
              </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                  Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••••••" 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
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
                  Confirm Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••••••" 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/5 focus:border-brand-dark transition-all text-sm"
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

              <button type="submit" className="w-full mt-6 py-4 bg-brand-dark text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-dark/20 active:scale-[0.98]">
                Create Account
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase px-2">
                <span className="bg-white px-2 text-brand-gray font-bold tracking-widest">or sign up with</span>
              </div>
            </div>

            {/* <div className="grid grid-cols-3 gap-4 mb-5">
              {['Bē', 'G', 'f'].map((social) => (
                <button key={social} className="py-3 px-4 mb-0 border border-gray-100 bg-gray-50 rounded-xl hover:bg-white hover:border-brand-dark/20 transition-all font-bold text-brand-dark">
                  {social}
                </button>
              ))}
            </div> */}

            <p className="text-center text-sm text-brand-gray font-medium">
              Already have an account? <Link to="/login" className="text-brand-dark font-black hover:underline">Log in</Link>
            </p>
          </div>
        </div>

    </div>
  );
}