import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`relative group px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 active:scale-95 overflow-hidden ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-accent to-highlight-accent opacity-90 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute inset-0 blur-xl bg-primary-accent opacity-0 group-hover:opacity-40 transition-opacity"></div>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
