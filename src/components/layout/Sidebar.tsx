/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Lightbulb, Calendar, Users, ShoppingBag, MapPin } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Feed', href: '/campus-feed', icon: Home },
    { name: 'Map', href: '/map', icon: MapPin },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Projects', href: '/projects', icon: Lightbulb },
    { name: 'Clubs', href: '/team-finder', icon: Users },
    { name: 'Market', href: '/marketplace', icon: ShoppingBag },
  ];

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 h-auto w-20 flex-col items-center py-8 bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] z-40 hidden md:flex shadow-[0_15px_50px_rgba(0,0,0,0.06)]">
       <div className="flex flex-col gap-6 w-full px-2">
         {navLinks.map(link => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className="group relative flex flex-col items-center gap-1.5 w-full p-3 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 ${
                  isActive 
                    ? 'sidebar-item-active' 
                    : 'sidebar-item-inactive bg-white/50 border border-black/5'
                }`}>
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                  isActive ? 'text-primary-teal' : 'text-text-gray'
                }`}>{link.name}</span>
              </Link>
            )
         })}
       </div>
    </aside>
  );
};
