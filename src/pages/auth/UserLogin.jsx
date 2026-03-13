import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function UserLogin() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen h-[100dvh] w-full bg-white overflow-hidden">
        
        {/* Left Side - Visual Gradient (40% Width) */}
        <div className="hidden lg:flex w-[45%] relative p-12 flex-col justify-between overflow-hidden bg-brand-dark">
          {/* Decorative Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-[#1a5a56] to-brand-secondary opacity-90 animate-gradient"></div>
          
          {/* Soft blur circles for mockup feel */}
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_20%_20%,#E5FD5F33_0,transparent_40%),radial-gradient(circle_at_80%_80%,#ffffff11_0,transparent_50%)] "></div>

          <div className="relative z-10">
            <Link to="/" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-3xl font-bold hover:bg-white/30 transition-all">
              <IoMdArrowRoundBack />
            </Link>
          </div>

          <div className="relative z-10 text-white">
            <p className="text-white/70 text-lg mb-4 font-regular italic">You can easily</p>
            <h2 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight">
              Get access your personal <br />
              hub for clarity and <br />
              productivity
            </h2>
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
                Login with your account
              </h1>
              <p className="text-brand-gray text-sm leading-relaxed">
                Access your tasks, notes, and projects anytime, anywhere - and keep everything flowing in one place.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-brand-dark mb-1 pl-3">
                  Your email
                </label>
                <input 
                  type="email" 
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

              <button type="submit" className="w-full mt-4 py-4 bg-brand-dark text-white font-black rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-dark/20 active:scale-[0.98]">
                Get Started
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase px-4">
                <span className="bg-white px-2 text-brand-gray font-bold tracking-widest">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              {['Bē', 'G', 'f'].map((social) => (
                <button key={social} className="py-3 px-4 mb-0 border border-gray-100 bg-gray-50 rounded-xl hover:bg-white hover:border-brand-dark/20 transition-all font-bold text-brand-dark">
                  {social}
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-brand-gray font-medium">
              Don't have an account? <Link to="/register" className="text-brand-dark font-black hover:underline">Sign up</Link>
            </p>
          </div>
        </div>

    </div>
  );
}