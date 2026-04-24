/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    updates: 0,
    events: 0,
    market: 0,
    projects: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const DEMO_ACTIVITIES = [
    { id: 'd-act-1', type: 'projects', title: 'AI Study Companion', createdAt: new Date().toISOString(), label: 'New Project' },
    { id: 'd-act-2', type: 'events', title: 'DevOps Workshop', createdAt: new Date().toISOString(), label: 'Upcoming Event' },
    { id: 'd-act-3', type: 'marketplace', title: 'Deep Learning Textbook', createdAt: new Date().toISOString(), label: 'Market Listing' },
    { id: 'd-act-4', type: 'campus_updates', content: 'RIT Annual Fest dates announced!', createdAt: new Date().toISOString(), label: 'Campus Update' }
  ];

  useEffect(() => {
    // 1. Fetch Counts (Merged with demo counts)
    const collections = ['campus_updates', 'events', 'marketplace', 'projects'];
    const demoCounts: any = { campus_updates: 1, events: 4, marketplace: 5, projects: 4 };

    if (!db) {
       // Safe Mode: Only use demo counts
       setStats({
          updates: demoCounts.campus_updates,
          events: demoCounts.events,
          market: demoCounts.marketplace,
          projects: demoCounts.projects
       });
       setActivities(DEMO_ACTIVITIES);
       setLoading(false);
       return;
    }

    const onErr = (err: any) => { if (err.code !== 'permission-denied') console.error('Dashboard snapshot error:', err); };
    const unsubscribes = collections.map(col => {
      console.log(`🔍 [Firestore] Subscribing to dashboard count: ${col}. DB instance:`, db);
      return onSnapshot(collection(db!, col), (snapshot) => {
        setStats(prev => ({
          ...prev,
          [col === 'campus_updates' ? 'updates' : col === 'marketplace' ? 'market' : col]: snapshot.size + (demoCounts[col] || 0)
        }));
      }, onErr);
    });

    // 2. Fetch Aggregated Recent Activity
    const fetchActivities = async () => {
      console.log("🔍 [Firestore] Fetching aggregated recent activities. DB instance:", db);
      try {
        const activityQueries = collections.map(col => 
          query(collection(db!, col), orderBy("createdAt", "desc"), limit(3))
        );

        const unsubscribesActivities = activityQueries.map((q, idx) =>
          onSnapshot(q, (snapshot) => {
             const colName = collections[idx];
             const items = snapshot.docs.map(doc => ({
               id: doc.id,
               type: colName,
               ...doc.data()
             }));

             setActivities(prev => {
                const otherActivities = prev.filter(a => !a.id.startsWith('d-act-') && a.type !== colName);
                const newActivities = [...otherActivities, ...items, ...DEMO_ACTIVITIES]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 6);
                return newActivities;
             });
             setLoading(false);
          }, (err) => {
            if (err.code !== 'permission-denied') console.error('Activity snapshot error:', err);
            setLoading(false);
          })
        );
        return () => unsubscribesActivities.forEach(un => un());
      } catch (error) {
        console.error("Activity fetch error:", error);
        setLoading(false);
      }
    };

    fetchActivities();
    return () => unsubscribes.forEach(un => un());
  }, []);

  const formatActivity = (item: any) => {
     switch(item.type) {
       case 'projects': return { title: item.title, icon: '🚀', href: '/projects', label: 'New Project' };
       case 'events': return { title: item.title, icon: '📅', href: '/events', label: 'Upcoming Event' };
       case 'marketplace': return { title: item.title, icon: '🏷️', href: '/marketplace', label: 'Market Listing' };
       case 'campus_updates': return { title: item.content, icon: '📢', href: '/campus-feed', label: 'Campus Update' };
       default: return { title: item.title || 'Update', icon: '🔥', href: '#', label: 'Activity' };
     }
  };

  return (
    <SectionContainer>
      <div className="space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-accent/10 border border-primary-accent/20 text-[10px] font-black text-highlight-accent tracking-widest uppercase">
              RIT Digital Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Your Campus Pulse</h1>
            <p className="text-xl text-text-secondary max-w-xl font-medium">Welcome back to Rajalakshmi Institute of Technology's digital ecosystem.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 px-6 py-3 glass bg-green-500/5 border-green-500/20 rounded-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                <span className="text-xs font-black text-green-400 tracking-widest uppercase">Campus Node Active</span>
             </div>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <DashboardStat label="Live Updates" value={stats.updates.toString()} icon="📢" trend="up" href="/campus-feed" />
          <DashboardStat label="Upcoming Events" value={stats.events.toString()} icon="📅" href="/events" />
          <DashboardStat label="Market Listings" value={stats.market.toString()} icon="🏷️" trend="up" href="/marketplace" />
          <DashboardStat label="Active Projects" value={stats.projects.toString()} icon="🚀" href="/projects" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Recent Activity Feed */}
           <GlassCard className="lg:col-span-2 p-10 bg-white/[0.02] border-white/5 space-y-10">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                 <h2 className="text-2xl font-black text-white tracking-tight">Recent Activity</h2>
                 <Link href="/campus-feed" className="text-xs text-primary-accent hover:text-highlight-accent transition-colors font-black tracking-widest uppercase">VIEW ALL</Link>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[1,2,3,4].map(i => <div key={i} className="h-20 glass animate-pulse rounded-2xl" />)}
                </div>
              ) : activities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {activities.map(item => {
                      const meta = formatActivity(item);
                      return <ActivityItem key={item.id} title={meta.title} time={meta.label} icon={meta.icon} href={meta.href} />;
                   })}
                </div>
              ) : (
                <div className="text-center py-10 opacity-40 italic text-white font-medium">No recent activity detected.</div>
              )}
           </GlassCard>

           {/* Quick Actions */}
           <div className="space-y-8">
              <h2 className="text-2xl font-black text-white tracking-tight px-2">Quick Access</h2>
              <div className="grid grid-cols-1 gap-5">
                 <QuickLink href="/campus-feed" label="Campus Feed" desc="See RIT updates" />
                 <QuickLink href="/events" label="Events Hub" desc="Discover RIT events" />
                 <QuickLink href="/marketplace" label="Marketplace" desc="Trade with students" />
                 <QuickLink href="/projects" label="Project Hub" desc="Manage RIT builds" />
                 <QuickLink href="/team-finder" label="Team Finder" desc="Find your RIT squad" />
              </div>
           </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function DashboardStat({ label, value, icon, trend, href }: { label: string, value: string, icon: string, trend?: string, href?: string }) {
  const content = (
    <GlassCard className="p-8 relative overflow-hidden group hover:border-primary-accent/30 bg-white/[0.02] border-white/5 transition-all duration-500 h-full">
       <div className="absolute top-0 right-0 p-6 text-4xl opacity-10 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 grayscale group-hover:grayscale-0">
          {icon}
       </div>
       <div className="space-y-2 relative z-10">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{label}</p>
          <h3 className="text-4xl font-black text-white flex items-baseline gap-2">
             {value}
             {trend && <span className="text-xs text-green-400 font-bold animate-bounce">↑</span>}
          </h3>
       </div>
    </GlassCard>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function ActivityItem({ title, time, icon, href }: { title: string, time: string, icon: string, href?: string }) {
  const content = (
    <div className="flex items-center gap-5 p-5 rounded-[1.5rem] hover:bg-white/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10 group">
       <div className="w-14 h-14 rounded-2xl bg-background-secondary border border-white/10 flex items-center justify-center text-2xl group-hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] group-hover:border-primary-accent/40 transition-all duration-500">
          {icon}
       </div>
       <div className="flex-1 space-y-1">
          <h4 className="text-base font-bold text-white group-hover:text-highlight-accent transition-colors leading-tight line-clamp-1">{title}</h4>
          <p className="text-xs font-bold text-text-secondary tracking-wide uppercase text-[9px]">{time}</p>
       </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function QuickLink({ href, label, desc }: { href: string, label: string, desc: string }) {
  return (
    <Link href={href}>
       <GlassCard className="p-6 hover:border-primary-accent/40 bg-white/[0.02] transition-all duration-500 border border-white/5 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-primary-accent/5 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-center relative z-10">
             <div className="space-y-1">
                <h4 className="text-lg font-black text-white group-hover:text-highlight-accent transition-colors tracking-tight">{label}</h4>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{desc}</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-accent group-hover:border-primary-accent transition-all duration-500">
                <span className="text-white text-lg group-hover:scale-110 transition-transform">→</span>
             </div>
          </div>
       </GlassCard>
    </Link>
  );
}
