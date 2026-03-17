import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="text-sm font-medium text-text-secondary ml-1">{label}</label>}
      <input
        className={`w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-accent/50 focus:border-primary-accent/50 transition-all ${className}`}
        {...props}
      />
    </div>
  );
};
