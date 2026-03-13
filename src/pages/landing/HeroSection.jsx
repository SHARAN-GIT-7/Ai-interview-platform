import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="container mx-auto px-4 pt-50 pb-40 text-center relative overflow-hidden"
    >
      {/* <span className="inline-block px-4 py-1.5 mb-8 text-sm font-bold tracking-widest uppercase text-brand-dark bg-brand-dark/5 border border-brand-dark/10 rounded-full animate-fade-in">
        AI-Powered Evaluation
      </span> */}

      <h1 className="text-5xl md:text-7xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.1] text-brand-dark">
        AI-Powered Interview Platform for
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-dark via-brand-dark/90 to-brand-dark/100 animate-gradient">
          Smart Candidate Evaluation
        </span>
      </h1>

      <p className="text-lg md:text-xl text-brand-gray max-w-3xl mx-auto mb-12 leading-relaxed">
        Assess skills, verify identity, and conduct AI-driven technical
        interviews — all in one secure hiring platform.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/login" className="px-10 py-5 text-lg font-bold text-white bg-brand-dark rounded-xl transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-dark/10">
          Take the Test
        </Link>
        <button className="px-10 py-5 text-lg font-bold text-brand-dark bg-brand-secondary rounded-xl transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]">
          Learn More
        </button>
      </div>
    </section>
  );
}