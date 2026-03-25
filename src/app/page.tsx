/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SectionContainer } from '@/components/ui/SectionContainer';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const [stats, setStats] = useState({
    projects: 0,
    resources: 0,
    posts: 0
  });

  useEffect(() => {
    if (!db) return;

    console.log("🔍 [Firestore] Subscribing to landing page stats. DB instance:", db);
    const unsubProjects = onSnapshot(collection(db!, "projects"), (snap) => {
      setStats(prev => ({ ...prev, projects: snap.size }));
    });
    const unsubResources = onSnapshot(collection(db!, "resources"), (snap) => {
      setStats(prev => ({ ...prev, resources: snap.size }));
    });
    const unsubPosts = onSnapshot(collection(db!, "team_posts"), (snap) => {
      setStats(prev => ({ ...prev, posts: snap.size }));
    });

    return () => {
      unsubProjects();
      unsubResources();
      unsubPosts();
    };
  }, []);

  return (
    <div className="flex flex-col gap-24 pb-24 bg-background-neutral overflow-x-hidden">
      {/* Hero Section */}
      <SectionContainer className="relative pt-16 text-center">
        <div className="space-y-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-teal/5 border border-primary-teal/10 text-[10px] font-black text-secondary-coral animate-fade-in tracking-[0.2em] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-coral opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-coral"></span>
            </span>
            CAMPUS BETA IS LIVE
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-text-charcoal leading-[0.85] font-heading italic">
            CampusOS – <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-teal via-secondary-coral to-primary-teal bg-[length:200%_auto] animate-gradient-flow">
              Modern Campus Life.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-gray max-w-3xl mx-auto leading-relaxed font-bold">
            The hyper-social platform for Rajalakshmi Institute of Technology. 
            Connect, collaborate, and conquer your campus journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
            <Link href="/campus-feed">
              <PrimaryButton className="w-full sm:w-auto h-16 text-2xl px-14 rounded-full shadow-[0_15px_40px_rgba(0,194,203,0.35)]">
                Launch Feed
              </PrimaryButton>
            </Link>
            <Link href="/projects">
              <button className="w-full sm:w-auto bg-white/80 hover:bg-white px-12 h-16 rounded-full text-text-charcoal font-black uppercase tracking-widest text-[11px] transition-all border border-primary-teal/10 shadow-sm hover:shadow-xl hover:-translate-y-1.5 backdrop-blur-xl">
                Explore Hubs
              </button>
            </Link>
          </div>
        </div>

        {/* Hero Visual mockup */}
        <div className="mt-24 w-full max-w-6xl mx-auto relative group">
          <div className="absolute -inset-10 bg-gradient-to-r from-primary-teal/10 via-secondary-coral/10 to-primary-teal/10 rounded-[4rem] blur-[100px] opacity-40 group-hover:opacity-60 transition duration-1000"></div>
          <GlassCard className="relative overflow-hidden border-white shadow-[0_30px_100px_rgba(0,0,0,0.08)] h-96 md:h-[36rem] flex items-center justify-center bg-white/90 backdrop-blur-3xl rounded-[4rem] p-0">
             <div className="grid grid-cols-12 gap-8 w-full h-full p-12 opacity-80 select-none pointer-events-none">
                <div className="col-span-3 bg-white/50 rounded-[2rem] p-6 flex flex-col gap-6 shadow-xl scale-95 border border-white/50">
                   <div className="w-2/3 h-5 bg-primary-teal/20 rounded-full"></div>
                   <div className="w-full h-44 bg-primary-teal/5 rounded-[1.5rem] border border-primary-teal/10 animate-pulse"></div>
                   <div className="space-y-4">
                      <div className="w-full h-3 bg-primary-teal/5 rounded-full"></div>
                      <div className="w-2/3 h-3 bg-primary-teal/5 rounded-full"></div>
                   </div>
                </div>
                <div className="col-span-6 bg-white rounded-[3rem] p-8 flex flex-col gap-8 shadow-[0_20px_50px_rgba(0,194,203,0.1)] border border-primary-teal/10 scale-105 z-10 transition-transform group-hover:scale-[1.07] duration-700">
                   <div className="flex justify-between items-center">
                      <div className="w-1/3 h-6 bg-primary-teal/30 rounded-full"></div>
                      <div className="w-10 h-10 rounded-2xl bg-secondary-coral/20"></div>
                   </div>
                   <div className="w-full h-72 bg-background-neutral rounded-[2rem] border border-primary-teal/5 flex flex-col p-8 gap-6">
                      <div className="flex gap-4 items-center">
                         <div className="w-14 h-14 rounded-full bg-primary-teal/20"></div>
                         <div className="space-y-3 flex-1">
                            <div className="w-1/2 h-4 bg-primary-teal/10 rounded-full"></div>
                            <div className="w-1/4 h-3 bg-primary-teal/5 rounded-full"></div>
                         </div>
                      </div>
                      <div className="flex-1 bg-white/80 rounded-2xl border border-primary-teal/5 p-6 flex flex-col gap-4">
                         {[1,2].map(i => <div key={i} className="w-full h-2.5 bg-primary-teal/5 rounded-full"></div>)}
                      </div>
                   </div>
                </div>
                <div className="col-span-3 bg-white/50 rounded-[2rem] p-6 flex flex-col gap-6 shadow-xl scale-95 border border-white/50">
                   <div className="w-3/4 h-5 bg-primary-teal/20 rounded-full"></div>
                   <div className="flex-1 flex flex-col gap-5 mt-4">
                      {[1,2,3,4,5].map(i => (
                         <div key={i} className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-full bg-secondary-coral/20"></div>
                            <div className="w-2/3 h-2.5 bg-primary-teal/5 rounded-full"></div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-0 duration-500">
                <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-primary-teal to-secondary-coral flex items-center justify-center text-5xl shadow-[0_20px_40px_rgba(0,194,203,0.3)] border-4 border-white text-white font-black animate-float-card leading-none">C</div>
                <div className="mt-8 text-center space-y-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                  <p className="text-4xl font-black text-text-charcoal tracking-tighter uppercase font-heading italic">Experience CampusOS</p>
                  <p className="text-text-gray font-bold tracking-widest uppercase text-xs">Vibrant • Modern • RIT Powered</p>
                </div>
             </div>
          </GlassCard>
        </div>
      </SectionContainer>

      {/* Feature Section Expansion */}
      <SectionContainer id="explore" className="py-32">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-5xl md:text-7xl font-black text-text-charcoal tracking-tighter font-heading italic">The Student Files.</h2>
          <p className="text-xl text-text-gray max-w-2xl mx-auto font-bold uppercase tracking-widest text-[11px] leading-relaxed">Curated experiences built specifically for Rajalakshmi Institute of Technology.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <Link href="/campus-feed">
            <FeatureCard 
              title="Campus Feed" 
              desc="Real-time pulse of your campus. Club updates, achievements, and major vibes."
              icon="📸"
              color="primary-teal"
            />
          </Link>
          <Link href="/events">
            <FeatureCard 
              title="Events Hub" 
              desc="Never miss a hackathon or tech-fest again. Discover your next challenge today."
              icon="⚡"
              color="secondary-coral"
            />
          </Link>
          <Link href="/marketplace">
            <FeatureCard 
              title="Marketplace" 
              desc="Eco-friendly campus commerce. Buy and sell textbooks, gadgets, and projects."
              icon="💎"
              color="primary-teal"
            />
          </Link>
          <Link href="/projects">
            <FeatureCard 
              title="Project Hub" 
              desc="Showcase your builds, find elite builders, and scale your startup ideas."
              icon="🚀"
              color="secondary-coral"
            />
          </Link>
          <Link href="/team-finder" className="lg:scale-110 lg:z-10 shadow-2xl rounded-[3rem]">
            <FeatureCard 
              title="Team Finder" 
              desc="Match with talented devs and designers. Build the next big thing together."
              icon="🫂"
              color="primary-teal"
            />
          </Link>
          <Link href="/knowledge-hub">
            <FeatureCard 
              title="Knowledge Hub" 
              desc="Curated study notes, lab guides, and previous year papers at your fingertips."
              icon="🔮"
              color="secondary-coral"
            />
          </Link>
        </div>
       </SectionContainer>

      {/* Built for RIT Section */}
      <SectionContainer className="relative overflow-hidden py-32">
        <GlassCard className="max-w-6xl mx-auto p-12 md:p-24 text-center bg-white shadow-[0_40px_100px_rgba(0,0,0,0.06)] scale-100 border-none rounded-[4rem]">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-secondary-coral/10 border border-secondary-coral/20 text-[10px] font-black text-secondary-coral tracking-[0.3em] uppercase mb-10">
            Exclusive RIT Platform
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-text-charcoal tracking-tighter mb-10 leading-[0.85] font-heading italic">Built for the <br /> Next Generation.</h2>
          <p className="text-xl md:text-2xl text-text-gray leading-relaxed font-bold max-w-3xl mx-auto mb-16 italic">
            &quot;CampusOS is the heartbeat of RIT. From CSE labs to cross-departmental innovation, we provide the tools to build your identity.&quot;
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: "Active Projects", value: stats.projects, color: "primary-teal" },
              { label: "RIT Verified", value: "ELITE", color: "secondary-coral" },
              { label: "Curated Notes", value: stats.resources, color: "primary-teal" },
              { label: "Daily Vibes", value: stats.posts, color: "secondary-coral" }
            ].map(stat => (
              <div key={stat.label} className="space-y-4">
                <div className={`text-5xl font-black text-${stat.color}`}>{stat.value}{typeof stat.value === 'number' ? '+' : ''}</div>
                <div className="text-[10px] font-black text-text-gray uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </SectionContainer>

      {/* Final CTA Expansion */}
      <SectionContainer className="pb-32">
        <div className="bg-white/95 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden shadow-[0_45px_120px_rgba(0,194,203,0.1)] border border-white">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-teal/5 via-transparent to-secondary-coral/5 -z-10"></div>
          
          <div className="relative z-10 space-y-16 max-w-5xl mx-auto">
            <h2 className="text-7xl md:text-[10rem] font-black text-text-charcoal tracking-tighter leading-[0.8] font-heading italic">
              Ready to <br /> Define You?
            </h2>
            <p className="text-2xl md:text-3xl text-text-gray font-bold max-w-3xl mx-auto leading-relaxed">
              Stop surviving campus life. Start leading it. <br className="hidden md:block" />
              Your legacy at RIT starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center pt-6">
               <Link href="/login">
                <PrimaryButton className="h-20 px-16 text-3xl rounded-full w-full sm:w-auto shadow-2xl shadow-primary-teal/30">
                    Join Now
                </PrimaryButton>
               </Link>
            </div>
          </div>
        </div>
      </SectionContainer>

      <footer className="border-t border-primary-teal/5 py-16 text-center bg-white/30 backdrop-blur-xl">
        <div className="flex flex-wrap justify-center gap-10 mb-10">
           {['Terms', 'Privacy', 'Safety', 'Vibes'].map(f => (
              <span key={f} className="text-[10px] font-black text-text-gray hover:text-primary-teal cursor-pointer transition-all uppercase tracking-[0.3em]">{f}</span>
           ))}
        </div>
        <p className="text-text-secondary text-xs font-black uppercase tracking-widest leading-none">© 2026 CampusOS. Built by RIT Builders.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon, color }: { title: string, desc: string, icon: string, color: string }) {
  return (
    <GlassCard className="flex flex-col gap-8 group hover:scale-[1.05] hover:shadow-[0_30px_60px_rgba(0,194,203,0.15)] duration-500 hover:border-primary-teal/30 border-primary-teal/5 h-full p-12 bg-white/80 backdrop-blur-xl">
      <div className={`w-20 h-20 rounded-[2rem] bg-background-neutral flex items-center justify-center text-5xl border border-primary-teal/5 group-hover:bg-primary-teal/10 group-hover:border-primary-teal/20 transition-all shadow-inner`}>
        {icon}
      </div>
      <div className="space-y-4">
         <h3 className="text-3xl font-black text-text-charcoal tracking-tighter group-hover:text-primary-teal transition-colors font-heading italic">{title}</h3>
         <p className="text-text-gray leading-relaxed font-bold text-sm">{desc}</p>
      </div>
    </GlassCard>
  );
}
