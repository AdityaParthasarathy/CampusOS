/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, writeBatch, doc, getDocs } from 'firebase/firestore';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { useRouter } from 'next/navigation';
import { showBrowserNotification } from '@/hooks/useNotifications';

interface QuickResult { id: string; title: string; href: string; icon: string; }

export const FloatingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, userData, logout } = useAuth();
  const router = useRouter();

  // Search state
  const [searchVal, setSearchVal] = useState('');
  const [quickResults, setQuickResults] = useState<QuickResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Track which notification IDs we've already seen (to detect new arrivals)
  const isFirstNotifLoad = useRef(true);
  const knownNotifIds    = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced quick search
  useEffect(() => {
    if (!searchVal.trim() || !db) { setQuickResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const term = searchVal.toLowerCase().trim();
      const found: QuickResult[] = [];
      try {
        const cols: Array<{ name: string; titleField: string; href: string; icon: string }> = [
          { name: 'events',      titleField: 'title',   href: '/events',      icon: '📅' },
          { name: 'projects',    titleField: 'title',   href: '/projects',    icon: '🚀' },
          { name: 'marketplace', titleField: 'title',   href: '/marketplace', icon: '🏷️' },
          { name: 'team_posts',  titleField: 'role',    href: '/team-finder', icon: '🫂' },
        ];
        for (const col of cols) {
          if (found.length >= 6) break;
          const snap = await getDocs(query(collection(db!, col.name), limit(50)));
          snap.docs.forEach(d => {
            if (found.length >= 6) return;
            const v = d.data();
            const title = v[col.titleField] || '';
            if (title.toLowerCase().includes(term)) {
              found.push({ id: d.id, title, href: col.href, icon: col.icon });
            }
          });
        }
      } catch { /* silent */ }
      setQuickResults(found);
      setSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchVal]);

  useEffect(() => {
    if (!db || !user) return;

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {/* silent — SW is optional */});
    }

    const q = query(collection(db, `users/${user.uid}/notifications`), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all: any[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(all);

      // On subsequent loads only: fire browser notification for each new unread item
      if (!isFirstNotifLoad.current) {
        all.forEach(n => {
          if (!knownNotifIds.current.has(n.id) && !n.isRead) {
            showBrowserNotification('CampusOS 🔔', n.message || 'You have a new notification', n.id);
          }
        });
      }

      isFirstNotifLoad.current = false;
      knownNotifIds.current = new Set(all.map(n => n.id));
    }, (error) => {
      if (error.code !== 'permission-denied') console.error('Notifications snapshot error:', error);
    });
    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0 && db && user) {
       try {
         const batch = writeBatch(db);
         notifications.filter(n => !n.isRead).forEach(n => {
           batch.update(doc(db!, `users/${user.uid}/notifications`, n.id), { isRead: true });
         });
         await batch.commit();
       } catch (err) {
         console.error("Failed to mark notifications read", err);
       }
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 md:left-32 md:translate-x-0 md:w-[calc(100%-10rem)] z-50 w-[95%]">
      <nav className={`bg-white/80 backdrop-blur-3xl border border-white/50 flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.05)] ${scrolled ? 'py-2 shadow-[0_15px_50px_rgba(0,194,203,0.12)] bg-white/95' : ''}`}>
        <Link href="/" className="text-xl font-black text-text-charcoal tracking-tighter flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-teal to-secondary-coral flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary-teal/20">
            <span className="text-sm text-white font-black">C</span>
          </div>
          <span className="hidden sm:block font-heading italic text-primary-teal">CampusOS</span>
        </Link>

        {/* Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-col relative w-72 focus-within:w-96 transition-all duration-300">
          <form
            onSubmit={e => { e.preventDefault(); if (searchVal.trim()) { router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`); setShowDropdown(false); }}}
            className="flex items-center bg-background-neutral border border-primary-teal/5 rounded-full px-4 py-2 shadow-inner focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(0,194,203,0.1)] focus-within:border-primary-teal/30 hover:bg-white/90 transition-all"
          >
            <Search size={16} className="text-text-gray mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search events, clubs, vibes..."
              value={searchVal}
              onChange={e => { setSearchVal(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              className="bg-transparent border-none outline-none text-xs w-full text-text-charcoal placeholder:text-text-gray font-bold"
            />
            {searchVal && (
              <button type="button" onClick={() => { setSearchVal(''); setQuickResults([]); }} className="text-text-gray hover:text-text-charcoal ml-1">
                <X size={13} />
              </button>
            )}
          </form>

          {/* Dropdown */}
          {showDropdown && searchVal.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-primary-teal/10 overflow-hidden z-50 animate-fade-in">
              {searching ? (
                <div className="p-4 flex items-center gap-3 text-xs text-text-gray font-bold">
                  <div className="w-4 h-4 border-2 border-primary-teal/20 border-t-primary-teal rounded-full animate-spin" />
                  Searching...
                </div>
              ) : quickResults.length > 0 ? (
                <>
                  {quickResults.map(r => (
                    <Link
                      key={r.id}
                      href={r.href}
                      onClick={() => { setShowDropdown(false); setSearchVal(''); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-primary-teal/5 transition-colors group"
                    >
                      <span className="text-base shrink-0">{r.icon}</span>
                      <span className="text-xs font-bold text-text-charcoal group-hover:text-primary-teal transition-colors truncate">{r.title}</span>
                    </Link>
                  ))}
                  <Link
                    href={`/search?q=${encodeURIComponent(searchVal.trim())}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-3 bg-primary-teal/5 border-t border-primary-teal/5 text-[10px] font-black text-primary-teal uppercase tracking-widest hover:bg-primary-teal/10 transition-colors"
                  >
                    <Search size={12} /> See all results for &quot;{searchVal}&quot;
                  </Link>
                </>
              ) : (
                <Link
                  href={`/search?q=${encodeURIComponent(searchVal.trim())}`}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-3 text-[10px] font-black text-primary-teal uppercase tracking-widest hover:bg-primary-teal/5 transition-colors"
                >
                  <Search size={12} /> Search for &quot;{searchVal}&quot;
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-3 md:border-l border-primary-teal/10 ml-1 relative">
              <button 
                onClick={handleOpenNotifications} 
                className="relative p-2 rounded-full hover:bg-primary-teal/5 transition-colors text-text-gray hover:text-primary-teal"
              >
                <Bell size={20} className={unreadCount > 0 ? "animate-pulse text-secondary-coral" : ""} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary-coral text-white flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-80 max-h-[24rem] overflow-y-auto bg-white/95 backdrop-blur-3xl p-4 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.1)] border border-white flex flex-col gap-3 z-50">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-teal border-b border-primary-teal/5 pb-2 font-heading">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-text-gray italic py-4 text-center font-medium">No new notifications.</p>
                  ) : notifications.map(notif => (
                    <Link
                      key={notif.id}
                      href={['accepted', 'request'].includes(notif.type) ? '/team-finder' : '/events'}
                      onClick={() => setShowNotifications(false)}
                      className="flex gap-3 group items-start p-3 hover:bg-background-neutral rounded-2xl transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                        <AvatarDisplay avatar={typeof notif.senderPhotoURL === 'string' ? notif.senderPhotoURL : null} fallbackSeed={notif.senderId || 'user'} className="w-full h-full !rounded-none !border-none" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-text-gray group-hover:text-text-charcoal transition-colors font-bold leading-relaxed">{notif.message}</span>
                        <span className="text-[9px] text-primary-teal mt-1 font-black uppercase tracking-widest">
                          {notif.createdAt ? new Date(notif.createdAt.toDate?.() || notif.createdAt).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/profile" className="group">
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg flex overflow-hidden bg-white group-hover:border-primary-teal transition-all scale-100 group-hover:scale-110 duration-500">
                  <AvatarDisplay avatar={userData?.avatar || user.photoURL} fallbackSeed={user?.uid} className="w-full h-full !rounded-none !border-none" />
                </div>
              </Link>
              <button 
                onClick={() => logout()}
                className="hidden lg:block px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-text-gray hover:text-white hover:bg-secondary-coral transition-all shadow-sm hover:shadow-[0_8px_20px_rgba(255,107,107,0.3)] cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button className="bg-primary-teal text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_8px_20px_rgba(0,194,203,0.3)] hover:-translate-y-0.5 cursor-pointer">
                Join
              </button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};
