"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Campus Feed', href: '/campus-feed' },
  { name: 'Events', href: '/events' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'Projects', href: '/projects' },
  { name: 'Team Finder', href: '/team-finder' },
  { name: 'Knowledge Hub', href: '/knowledge-hub' },
  { name: 'Profile', href: '/profile' },
];

export const FloatingNavbar: React.FC = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
      <nav className={`glass flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 ${scrolled ? 'bg-white/10 py-2' : ''}`}>
        <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-accent to-highlight-accent flex items-center justify-center group-hover:rotate-12 transition-transform">
            <span className="text-sm">C</span>
          </div>
          <span className="hidden sm:block">CampusOS</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'text-white bg-primary-accent/20 border border-primary-accent/30' 
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <Link href="/dashboard" className="hidden lg:block">
          <button className="glass bg-primary-accent/10 border border-primary-accent/20 px-4 py-1.5 rounded-lg text-sm text-white hover:bg-primary-accent/20 transition-all font-medium">
            Launch
          </button>
        </Link>
      </nav>
    </div>
  );
};
