import React from "react";
import { motion } from "framer-motion";
import { IoMdInformationCircleOutline } from "react-icons/io";

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
      
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-xs font-medium border border-yellow-100 italic">
        By submitting, you agree that the information provided is accurate and represents your legal business entity.
      </div>
    </motion.div>
  );
};

export default PaymentStep;
