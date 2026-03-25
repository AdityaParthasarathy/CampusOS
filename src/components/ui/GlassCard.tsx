/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  title?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", hoverGlow = true, title, onClick }) => {
  return (
    <div 
      className={`bg-white/95 backdrop-blur-2xl border border-white p-10 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-500 ${hoverGlow ? 'hover:shadow-[0_20px_50px_rgba(0,194,203,0.12)] hover:-translate-y-1.5' : ''} ${className} ${onClick ? 'cursor-pointer hover:border-primary-teal/20' : ''}`}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-2xl font-black text-text-charcoal mb-6 border-b border-primary-teal/5 pb-4 tracking-tighter font-heading italic">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
