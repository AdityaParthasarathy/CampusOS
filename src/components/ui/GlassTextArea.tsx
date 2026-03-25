/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';

interface GlassTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const GlassTextArea: React.FC<GlassTextAreaProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="text-[10px] font-black text-text-gray ml-2 uppercase tracking-[0.2em]">{label}</label>}
      <textarea
        className={`w-full bg-white/80 backdrop-blur-xl border border-primary-teal/10 rounded-[1.5rem] px-6 py-4 text-text-charcoal font-bold placeholder:text-text-gray/50 focus:outline-none focus:ring-4 focus:ring-primary-teal/10 focus:border-primary-teal/30 focus:bg-white transition-all min-h-[140px] resize-none shadow-sm ${className}`}
        {...props}
      />
    </div>
  );
};
