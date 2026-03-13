import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-light/80 backdrop-blur-md border-b border-brand-dark/5">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-black tracking-tighter text-brand-dark">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-dark to-brand-dark/60">AI</span>-INTERVIEW
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors">Features</a>
          <a href="#workflow" className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors">How It Works</a>
           
          <a href="#collaboration" className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors">Collaboration</a>
          <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-brand-dark bg-brand-secondary rounded-lg transition-all duration-300 hover:opacity-90 active:scale-95">
            Take Test
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;