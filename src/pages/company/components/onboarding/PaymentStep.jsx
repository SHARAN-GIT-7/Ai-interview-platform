import React from "react";
import { motion } from "framer-motion";
import { IoMdInformationCircleOutline } from "react-icons/io";

const CoinIcon = ({ width = "22", height = "22" }) => (
  <img src="/Point.svg" alt="Credit Coin" width={width} height={height} className="inline-block object-contain" />
);

const creditCategories = [
    { name: "AI-interview", cost: 50, bgClass: "bg-[#e5f5f6]", textClass: "text-[#1d8989]" },
    { name: "Communication", cost: 60, bgClass: "bg-[#e9daff]", textClass: "text-[#6b4ab9]" },
    { name: "Coding", cost: 50, bgClass: "bg-[#fdf0d9]", textClass: "text-[#db830f]" },
    { name: "Aptitude", cost: 40, bgClass: "bg-[#fcdcb6]", textClass: "text-[#c26804]" },
];

const PaymentStep = ({ formData }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-brand-dark/5 p-6 rounded-2xl border border-brand-dark/10">
        <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
          <IoMdInformationCircleOutline size={20}/>
          Review your application (Payment)
        </h3>
        <div className="space-y-4 text-sm text-brand-dark/70">
          <div className="flex justify-between border-b border-brand-dark/5 pb-2">
            <span className="font-medium">Company URL</span>
            <span className="font-bold">{formData.website || "Not set"}</span>
          </div>
          <div className="flex justify-between border-b border-brand-dark/5 pb-2">
            <span className="font-medium">Industry</span>
            <span className="font-bold">{formData.industry || "Not set"}</span>
          </div>
          <div className="flex justify-between border-b border-brand-dark/5 pb-2">
            <span className="font-medium">Size</span>
            <span className="font-bold">{formData.companySize || "Not set"}</span>
          </div>
          <div className="flex justify-between border-b border-brand-dark/5 pb-2">
            <span className="font-medium">GSTIN</span>
            <span className="font-bold">{formData.gstin || (formData.isGstRegistered ? "Not set" : "Not Registered")}</span>
          </div>
          <div className="flex justify-between border-b border-brand-dark/5 pb-2">
            <span className="font-medium">Billing Email</span>
            <span className="font-bold">{formData.billingEmail || "Not set"}</span>
          </div>
          <div className="flex justify-between border-b border-brand-dark/5 pb-2">
            <span className="font-medium">Billing Location</span>
            <span className="font-bold">{formData.city ? `${formData.city}, ${formData.state}` : "Not set"}</span>
          </div>
        </div>
      </div>

      {/* Credit Details Info Card */}
      <div className="bg-[#eff1f4] rounded-2xl p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 w-full mt-6">
        <div className="flex flex-col gap-3 w-full lg:w-2/5 flex-shrink-0">
          {creditCategories.map((cat, idx) => (
            <div key={idx} className={`flex items-center justify-between px-5 py-3.5 rounded-lg w-full ${cat.bgClass}`}>
              <span className={`font-bold text-[15px] ${cat.textClass}`}>{cat.name}</span>
              <div className="flex items-center gap-4">
                <div className="w-px h-6 bg-black/20"></div>
                <div className="flex items-center gap-2 w-14 justify-end">
                  <CoinIcon />
                  <span className="font-bold text-[15px] text-gray-900">{cat.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#fffdf2] rounded-xl p-6 lg:p-8 w-full flex flex-col justify-center space-y-5">
          <p className="text-sm font-semibold text-[#4a2e10] leading-relaxed">
            <span className="font-bold text-[#2a1300]">Easy Credit Wallet</span> – Keep all your test credits safely in one wallet for simple management.
          </p>
          <p className="text-sm font-semibold text-[#4a2e10] leading-relaxed">
            <span className="font-bold text-[#2a1300]">Test Access</span> – Use credits to run multiple tests quickly and efficiently anytime.
          </p>
          <p className="text-[15px] font-semibold text-[#4a2e10] flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#2a1300]">Clear Pricing</span> – <CoinIcon /> <span className="font-bold text-[#2a1300]">1 Credit = ₹1</span>
          </p>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-xs font-medium border border-yellow-100 italic">
        By submitting, you agree that the information provided is accurate and represents your legal business entity.
      </div>
    </motion.div>
  );
};

export default PaymentStep;
