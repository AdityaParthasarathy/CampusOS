/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  type: 'event' | 'project' | 'marketplace' | 'team' | 'feed';
  title: string;
  subtitle: string;
  href: string;
  imageUrl?: string;
  badge: string;
  badgeColor: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<SearchResult['type'], { label: string; color: string; bg: string; icon: string }> = {
  event:       { label: 'Event',     color: 'text-secondary-coral', bg: 'bg-secondary-coral/10', icon: '📅' },
  project:     { label: 'Project',   color: 'text-primary-teal',    bg: 'bg-primary-teal/10',    icon: '🚀' },
  marketplace: { label: 'Market',    color: 'text-blue-500',        bg: 'bg-blue-50',            icon: '🏷️' },
  team:        { label: 'Team',      color: 'text-purple-500',      bg: 'bg-purple-50',          icon: '🫂' },
  feed:        { label: 'Post',      color: 'text-orange-500',      bg: 'bg-orange-50',          icon: '📸' },
};

// ─── Search logic ─────────────────────────────────────────────────────────────

async function runSearch(q: string): Promise<SearchResult[]> {
  if (!db || !q.trim()) return [];
  const term = q.toLowerCase().trim();
  const results: SearchResult[] = [];

  const match = (...fields: (string | undefined)[]) =>
    fields.some(f => f?.toLowerCase().includes(term));

  try {
    // ── Events ──────────────────────────────────────────────────────────────
    const evSnap = await getDocs(query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(100)));
    evSnap.docs.forEach(d => {
      const v = d.data();
      if (match(v.title, v.desc, v.category, v.location, v.organizer)) {
        results.push({
          id: d.id, type: 'event',
          title: v.title || 'Untitled Event',
          subtitle: `${v.category || ''} · ${v.date || ''} · ${v.location || ''}`.replace(/^·\s*|·\s*$/g, '').trim(),
          href: '/events',
          imageUrl: v.imageUrl,
          badge: v.category || 'Event',
          badgeColor: 'secondary-coral',
        });
      }
    });

    // ── Projects ─────────────────────────────────────────────────────────────
    const prSnap = await getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(100)));
    prSnap.docs.forEach(d => {
      const v = d.data();
      const stackStr = Array.isArray(v.stack) ? v.stack.join(' ') : '';
      if (match(v.title, v.desc, v.creatorName, stackStr)) {
        results.push({
          id: d.id, type: 'project',
          title: v.title || 'Untitled Project',
          subtitle: `${v.status || 'Active'} · ${Array.isArray(v.stack) ? v.stack.slice(0, 3).join(', ') : ''}`,
          href: '/projects',
          imageUrl: v.imageUrl,
          badge: v.status || 'Active',
          badgeColor: 'primary-teal',
        });
      }
    });

    // ── Marketplace ───────────────────────────────────────────────────────────
    const mkSnap = await getDocs(query(collection(db, 'marketplace'), orderBy('createdAt', 'desc'), limit(100)));
    mkSnap.docs.forEach(d => {
      const v = d.data();
      if (match(v.title, v.desc, v.category, v.seller)) {
        results.push({
          id: d.id, type: 'marketplace',
          title: v.title || 'Untitled Listing',
          subtitle: `₹${v.price || '?'} · ${v.category || ''} · ${v.seller || ''}`,
          href: '/marketplace',
          imageUrl: v.imageUrl,
          badge: v.category || 'Item',
          badgeColor: 'blue-500',
        });
      }
    });

    // ── Team Finder ───────────────────────────────────────────────────────────
    const tmSnap = await getDocs(query(collection(db, 'team_posts'), orderBy('createdAt', 'desc'), limit(100)));
    tmSnap.docs.forEach(d => {
      const v = d.data();
      const skillsStr = Array.isArray(v.skills) ? v.skills.join(' ') : '';
      if (match(v.role, v.desc, v.posterName, skillsStr)) {
        results.push({
          id: d.id, type: 'team',
          title: v.role || 'Team Opening',
          subtitle: `${v.posterName || ''} · ${Array.isArray(v.skills) ? v.skills.slice(0, 3).join(', ') : ''}`,
          href: '/team-finder',
          badge: 'Open',
          badgeColor: 'purple-500',
        });
      }
    });

    // ── Campus Feed ───────────────────────────────────────────────────────────
    const fdSnap = await getDocs(query(collection(db, 'feed'), orderBy('createdAt', 'desc'), limit(100)));
    fdSnap.docs.forEach(d => {
      const v = d.data();
      if (match(v.content, v.author, v.category)) {
        results.push({
          id: d.id, type: 'feed',
          title: v.content?.substring(0, 60) + (v.content?.length > 60 ? '...' : '') || 'Campus Post',
          subtitle: `${v.author || ''} · ${v.category || ''}`,
          href: '/campus-feed',
          imageUrl: v.imageUrl || v.image,
          badge: v.category || 'Post',
          badgeColor: 'orange-500',
        });
      }
    });
  } catch (err) {
    console.error('Search error:', err);
  }

  return results;
}

// ─── Inner page (needs useSearchParams) ───────────────────────────────────────

function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Run search whenever URL query changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setInputVal(q);
    if (!q.trim()) { setResults([]); setSearched(false); return; }

    setLoading(true);
    setSearched(true);
    runSearch(q).then(r => {
      setResults(r);
      setLoading(false);
    });
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
  };

  const clearSearch = () => {
    setInputVal('');
    setResults([]);
    setSearched(false);
    router.push('/search');
    inputRef.current?.focus();
  };

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const typeOrder: SearchResult['type'][] = ['event', 'project', 'marketplace', 'team', 'feed'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-text-charcoal tracking-tighter font-heading italic">Search</h1>
        <p className="text-text-gray font-bold text-[10px] uppercase tracking-widest">
          Find events, projects, listings, teams & posts
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3 bg-white border border-primary-teal/15 rounded-3xl px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] focus-within:border-primary-teal/40 focus-within:shadow-[0_8px_30px_rgba(0,194,203,0.12)] transition-all">
          <Search size={20} className="text-text-gray shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search events, projects, listings, teams..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-base font-medium text-text-charcoal outline-none placeholder:text-text-gray"
          />
          {inputVal && (
            <button type="button" onClick={clearSearch} className="text-text-gray hover:text-text-charcoal transition-colors">
              <X size={18} />
            </button>
          )}
          <button
            type="submit"
            className="bg-primary-teal text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full hover:brightness-110 transition-all shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-teal/10 border-t-primary-teal rounded-full animate-spin" />
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h3 className="text-xl font-black text-text-charcoal font-heading italic">No results found</h3>
          <p className="text-text-gray font-medium text-sm">
            Try different keywords or check your spelling.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !searched && (
        <div className="py-16 text-center space-y-4 opacity-60">
          <div className="text-6xl">✨</div>
          <p className="font-bold text-text-gray text-sm">Start typing to search across the campus</p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['Hackathon', 'React', 'Study Notes', 'Textbooks', 'Flutter Dev'].map(s => (
              <button
                key={s}
                onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
                className="px-4 py-1.5 bg-white border border-primary-teal/10 rounded-full text-xs font-bold text-text-gray hover:text-primary-teal hover:border-primary-teal/30 transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-10">
          <p className="text-[10px] font-black text-text-gray uppercase tracking-widest">
            {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{searchParams.get('q')}&quot;
          </p>

          {typeOrder.filter(t => grouped[t]?.length).map(type => {
            const meta = TYPE_META[type];
            const items = grouped[type];

            return (
              <div key={type} className="space-y-4">
                {/* Section header */}
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meta.icon}</span>
                  <h2 className={`text-[10px] font-black uppercase tracking-[0.25em] ${meta.color}`}>
                    {meta.label}s
                  </h2>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                    {items.length}
                  </span>
                  <div className="flex-1 h-px bg-primary-teal/5" />
                  <Link
                    href={items[0].href}
                    className={`text-[9px] font-black uppercase tracking-widest ${meta.color} hover:opacity-70 transition-opacity`}
                  >
                    View all →
                  </Link>
                </div>

                {/* Result cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map(result => (
                    <Link
                      key={result.id}
                      href={result.href}
                      className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-primary-teal/5 hover:border-primary-teal/20 hover:shadow-[0_8px_25px_rgba(0,194,203,0.08)] transition-all group"
                    >
                      {/* Thumbnail or icon */}
                      <div className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 ${meta.bg} flex items-center justify-center`}>
                        {result.imageUrl ? (
                          <img src={result.imageUrl} alt={result.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{meta.icon}</span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-text-charcoal group-hover:text-primary-teal transition-colors truncate leading-tight">
                          {result.title}
                        </p>
                        <p className="text-[10px] text-text-gray font-medium truncate mt-0.5">
                          {result.subtitle}
                        </p>
                      </div>

                      {/* Arrow */}
                      <span className={`text-[10px] font-black ${meta.color} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page wrapper (Suspense required for useSearchParams) ─────────────────────

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-primary-teal/10 border-t-primary-teal rounded-full animate-spin" />
      </div>
    }>
      <SearchInner />
    </Suspense>
  );
}
