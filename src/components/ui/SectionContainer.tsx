import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({ children, className = "", id }) => {
  return (
    <div id={id} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      {children}
    </div>
  );
};
