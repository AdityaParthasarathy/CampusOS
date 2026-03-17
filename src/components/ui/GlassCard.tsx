import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  title?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", hoverGlow = true, title }) => {
  return (
    <div className={`glass-card p-6 ${hoverGlow ? 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' : ''} ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
