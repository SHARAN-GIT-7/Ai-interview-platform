import { motion } from "framer-motion";

export default function FooterSection() {
  return (
    <footer className="bg-black text-white py-16 border-t border-white/10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" alt="Knitnet Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-brand-secondary">KNIT</span>NET
            </h3>
            <p className="text-brand-gray text-sm leading-relaxed">
              AI-powered interview platform for smart candidate evaluation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              {["Features", "How It Works","Pricing"].map(
                (link, i) => (
                  <li key={i}>
                    <a
                      href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-brand-gray text-sm hover:text-brand-secondary transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2">
              {["About", "Careers","Contact"].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-brand-gray text-sm hover:text-brand-secondary transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-brand-gray text-sm hover:text-brand-secondary transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-brand-gray text-sm">
            © 2026 AI Interview Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((social, i) => (
              <a
                key={i}
                href="#"
                className="text-brand-gray text-sm hover:text-brand-secondary transition-colors duration-300"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </footer>
  );
}