import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NavLink = ({ href, children, isDarkText }) => (
  <a
    href={href}
    className={`relative group text-sm font-bold ${isDarkText ? "text-brand-dark/70 hover:text-brand-dark" : "text-white/90 hover:text-white"} transition-colors py-1`}
  >
    {children}
    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] ${isDarkText ? "bg-brand-dark" : "bg-white"} transition-all duration-300 ease-out group-hover:w-full`}></span>
  </a>
);

function Navbar({ theme = "dark" }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDarkText = scrolled || theme === "dark";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-brand-light/80 backdrop-blur-[8px] shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div
        className={`container mx-10 px-2 flex items-center  justify-between transition-all duration-500 ${scrolled ? "py-5" : "py-6"
          }`}
      >
        <Link to="/" className=" flex items-center gap-2 group">
          <div className=" h-12 w-40 mr-3 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 group-active:scale-95">
            <img src="/intervista full logo 4.svg" alt="Knitnet Logo" className="w-full h-full object-cover" />
          </div>
        
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/about" className={`relative group text-sm font-bold ${isDarkText ? "text-brand-dark/70 hover:text-brand-dark" : "text-white/90 hover:text-white"} transition-colors py-1`}>
            About Us
            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] ${isDarkText ? "bg-brand-dark" : "bg-white"} transition-all duration-300 ease-out group-hover:w-full`}></span>
          </Link>
          <Link to="/features" className={`relative group text-sm font-bold ${isDarkText ? "text-brand-dark/70 hover:text-brand-dark" : "text-white/90 hover:text-white"} transition-colors py-1`}>
            Features
            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] ${isDarkText ? "bg-brand-dark" : "bg-white"} transition-all duration-300 ease-out group-hover:w-full`}></span>
          </Link>
          <Link to="/how-it-works" className={`relative group text-sm font-bold ${isDarkText ? "text-brand-dark/70 hover:text-brand-dark" : "text-white/90 hover:text-white"} transition-colors py-1`}>
            How It Works
            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] ${isDarkText ? "bg-brand-dark" : "bg-white"} transition-all duration-300 ease-out group-hover:w-full`}></span>
          </Link>
          <Link to="/privacy-policy" className={`relative group text-sm font-bold ${isDarkText ? "text-brand-dark/70 hover:text-brand-dark" : "text-white/90 hover:text-white"} transition-colors py-1`}>
            Privacy Policy
            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] ${isDarkText ? "bg-brand-dark" : "bg-white"} transition-all duration-300 ease-out group-hover:w-full`}></span>
          </Link>
          <Link to="/pricing" className={`relative group text-sm font-bold ${isDarkText ? "text-brand-dark/70 hover:text-brand-dark" : "text-white/90 hover:text-white"} transition-colors py-1`}>
            Pricing
            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] ${isDarkText ? "bg-brand-dark" : "bg-white"} transition-all duration-300 ease-out group-hover:w-full`}></span>
          </Link>
          <Link
            to="/login"
            className={`relative px-6 shadow-2xl py-2.5 text-sm tracking-wider ${isDarkText ? "text-brand-secondary bg-black border-black" : "text-brand-dark bg-white border-white"} rounded-lg transition-all duration-300 active:scale-95 overflow-hidden group border`}
          >
            <span className="absolute inset-y-0 left-0 w-0 bg-brand-light/98 backdrop-blur-[8px] shadow-sm transition-all duration-500 ease-out group-hover:w-full z-0"></span>
            <span className={`relative z-10 transition-colors duration-500 group-hover:text-black`}>Take Test</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;