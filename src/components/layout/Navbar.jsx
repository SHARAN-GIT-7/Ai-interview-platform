import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="relative group text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors py-1"
  >
    {children}
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-dark transition-all duration-300 ease-out group-hover:w-full"></span>
  </a>
);

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-brand-light/80 backdrop-blur-[8px] shadow-sm"
          : "bg-transparent"
        }`}
    >
      <div
        className={`container mx-auto px-6 flex items-center justify-between transition-all duration-500 ${scrolled ? "py-5" : "py-6"
          }`}
      >
        <div className="text-2xl font-black tracking-tighter text-brand-dark">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-dark to-brand-dark/80">
            AI
          </span>
          -INTERVIEW
        </div>

        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#workflow">How It Works</NavLink>
          <NavLink href="#collaboration">Collaboration</NavLink>
          <Link
            to="/login"
            className="relative px-6 shadow-2xl py-2.5 text-sm tracking-wider text-brand-secondary bg-black rounded-lg transition-all duration-300 active:scale-95 overflow-hidden group border border-black"
          >
            <span className="absolute inset-y-0 left-0 w-0 bg-brand-light/98 backdrop-blur-[8px] shadow-sm transition-all duration-500 ease-out group-hover:w-full z-0"></span>
            <span className="relative z-10 transition-colors duration-500 group-hover:text-black">Take Test</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;