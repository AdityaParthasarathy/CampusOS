/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect } from 'react';
import { GlassCard } from './GlassCard';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const GlassModal: React.FC<GlassModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <GlassCard className="relative w-full max-w-2xl bg-white/98 border-white shadow-[0_45px_100px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in duration-500 overflow-hidden p-0 rounded-[2.5rem]">
        <div className="px-8 py-6 border-b border-primary-teal/5 flex justify-between items-center bg-background-neutral/50">
          <h2 className="text-2xl font-black text-text-charcoal font-heading italic tracking-tighter">{title}</h2>
          <button 
            onClick={onClose}
            className="text-text-gray hover:text-secondary-coral transition-all p-2.5 bg-primary-teal/5 hover:bg-secondary-coral/10 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </GlassCard>
    </div>
  );
};
