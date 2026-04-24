"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Settings, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';

export const BottomNavbar: React.FC = () => {
  const pathname = usePathname();
  const { user, userData } = useAuth();

  const navItems = [
    { icon: Home,          label: 'Feed',     href: '/campus-feed', badge: 0 },
    { icon: MessageCircle, label: 'Chat',     href: '/chat',        badge: 0 },
    { icon: Search,        label: 'Search',   href: '/search',      badge: 0 },
    { icon: Settings,      label: 'Settings', href: '/settings',    badge: 0 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav h-20 px-6 flex items-center justify-between md:hidden shadow-[0_-10px_20px_rgba(0,194,203,0.05)] border-t border-primary-teal/10">
      {navItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href}
          className={`relative flex flex-col items-center justify-center gap-1 group transition-all duration-300 ${
            isActive(item.href) ? 'text-primary-teal scale-110' : 'text-text-gray hover:text-primary-teal'
          }`}
        >
          <div className="relative">
            <item.icon 
              size={24} 
              strokeWidth={isActive(item.href) ? 2.5 : 2}
              className="transition-transform group-active:scale-90"
            />
            {item.badge && (
               <div className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-secondary-coral text-white text-[8px] font-black flex items-center justify-center px-0.5 border-2 border-background-cream">
                  {item.badge}
               </div>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          {isActive(item.href) && (
            <div className="absolute -top-1 w-1 h-1 rounded-full bg-secondary-coral animate-active-dot" />
          )}
        </Link>
      ))}

      <Link 
        href="/profile"
        className={`flex flex-col items-center justify-center gap-1 group transition-all duration-300 ${
          isActive('/profile') ? 'scale-110' : 'hover:scale-105'
        }`}
      >
        <div className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-colors ${
          isActive('/profile') ? 'border-secondary-coral' : 'border-white/50 group-hover:border-primary-teal'
        } ${userData?.avatar ? 'ring-2 ring-primary-teal/20 ring-offset-1' : ''}`}>
          <AvatarDisplay
            avatar={userData?.avatar || user?.photoURL}
            fallbackSeed={user?.uid || 'default'}
            className="w-full h-full !rounded-none !border-none"
          />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive('/profile') ? 'text-primary-teal' : 'text-text-gray'}`}>Me</span>
      </Link>
    </nav>
  );
};
