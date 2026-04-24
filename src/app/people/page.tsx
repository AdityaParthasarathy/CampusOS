/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useFollow } from '@/hooks/useFollow';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import Link from 'next/link';
import { Search, Users } from 'lucide-react';

// ─── Single user card with follow button ──────────────────────────────────────

const PersonCard: React.FC<{ person: any }> = ({ person }) => {
  const { user } = useAuth();
  const { isFollowing, followersCount, toggleFollow, loading } = useFollow(person.id);
  const isSelf = user?.uid === person.id;

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#161B2E] rounded-[1.5rem] border border-primary-teal/5 dark:border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-primary-teal/20 transition-all group">
      {/* Avatar */}
      <Link href={isSelf ? '/profile' : `/profile/${person.id}`} className="shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-white/10 shadow-md group-hover:ring-2 group-hover:ring-primary-teal/30 transition-all">
          <AvatarDisplay
            avatar={person.avatar}
            fallbackSeed={person.id}
            className="w-full h-full !rounded-none !border-none"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={isSelf ? '/profile' : `/profile/${person.id}`}>
          <p className="font-black text-sm text-text-charcoal dark:text-[#E2E8F0] truncate group-hover:text-primary-teal transition-colors">
            {person.name || 'RIT Student'}
          </p>
        </Link>
        <p className="text-[10px] text-text-gray font-bold uppercase tracking-wider truncate mt-0.5">
          {person.role || 'Student'}
        </p>
        <p className="text-[10px] text-text-gray font-medium mt-0.5">
          {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
        </p>
      </div>

      {/* Follow button */}
      {!isSelf && user && (
        <button
          onClick={toggleFollow}
          disabled={loading}
          className={`shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
            isFollowing
              ? 'bg-background-neutral dark:bg-[#1E2540] text-text-charcoal dark:text-[#E2E8F0] border border-primary-teal/20 hover:bg-secondary-coral/10 hover:text-secondary-coral hover:border-secondary-coral/20'
              : 'bg-primary-teal text-white shadow-[0_6px_20px_rgba(0,194,203,0.3)] hover:brightness-110'
          }`}
        >
          {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) { setLoading(false); return; }

    const q = query(collection(db!, 'users'), orderBy('name'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      if (err.code !== 'permission-denied') console.error('People snapshot error:', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = allUsers.filter(p => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.role || '').toLowerCase().includes(term)
    );
  });

  // Separate: show self first, then others
  const sorted = [
    ...filtered.filter(p => p.id === user?.uid),
    ...filtered.filter(p => p.id !== user?.uid),
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-2 space-y-6">

      {/* Header */}
      <div className="space-y-1 pt-4">
        <h1 className="text-5xl font-black text-text-charcoal dark:text-[#E2E8F0] tracking-tighter font-heading italic">
          People
        </h1>
        <p className="text-[10px] text-text-gray font-bold uppercase tracking-widest">
          Discover & follow RIT students
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#161B2E] rounded-full px-5 py-3 border border-primary-teal/10 dark:border-white/[0.06] shadow-sm focus-within:border-primary-teal/30 transition-all">
        <Search size={16} className="text-text-gray shrink-0" />
        <input
          type="text"
          placeholder="Search by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-text-charcoal dark:text-[#E2E8F0] placeholder:text-text-gray font-bold"
        />
      </div>

      {/* Count */}
      {!loading && (
        <div className="flex items-center gap-2 px-1">
          <Users size={13} className="text-primary-teal" />
          <span className="text-[10px] font-black uppercase tracking-widest text-text-gray">
            {sorted.length} {sorted.length === 1 ? 'student' : 'students'} on CampusOS
          </span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-[82px] bg-white dark:bg-[#161B2E] rounded-[1.5rem] animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="text-6xl">👥</div>
          <p className="font-black text-text-charcoal dark:text-[#E2E8F0] text-lg">No students found</p>
          <p className="text-text-gray text-sm font-medium">
            {search ? 'Try a different search' : 'Be the first to join CampusOS!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
