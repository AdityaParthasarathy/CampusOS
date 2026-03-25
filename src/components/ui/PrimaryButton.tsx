/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`relative group px-10 py-4 rounded-full font-black text-white transition-all duration-500 hover:-translate-y-1 active:scale-95 overflow-hidden shadow-[0_10px_25px_rgba(0,194,203,0.3)] hover:shadow-[0_15px_35px_rgba(0,194,203,0.5)] uppercase tracking-widest text-[11px] ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-teal to-secondary-coral opacity-100 transition-opacity"></div>
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
