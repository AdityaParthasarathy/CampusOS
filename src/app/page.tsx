import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SectionContainer } from '@/components/ui/SectionContainer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <SectionContainer className="relative overflow-hidden pt-10 text-center">
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-accent/10 border border-primary-accent/20 text-xs font-bold text-highlight-accent animate-fade-in tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-highlight-accent"></span>
            </span>
            CAMPUS BETA IS LIVE
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] text-glow">
            The Digital Hub <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-accent via-highlight-accent to-primary-accent bg-[length:200%_auto] animate-gradient-flow">
              For Your Campus
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-medium">
            Connect with peers, discover events, trade in the marketplace, and build the next big thing. 
            All in one premium workspace built for the next generation of campus leaders.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link href="/dashboard">
              <PrimaryButton className="w-full sm:w-auto h-14 text-xl px-12 rounded-2xl shadow-xl shadow-primary-accent/20">
                Join CampusOS
              </PrimaryButton>
            </Link>
            <Link href="/campus-feed">
              <button className="w-full sm:w-auto glass hover:bg-white/10 px-10 h-14 rounded-2xl text-white font-bold transition-all border-white/20">
                Explore Feed
              </button>
            </Link>
          </div>
        </div>

        {/* Hero Visual mockup */}
        <div className="mt-20 w-full max-w-6xl mx-auto relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-accent to-highlight-accent rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <GlassCard className="relative overflow-hidden border border-white/20 h-80 md:h-[32rem] flex items-center justify-center bg-background-dark/30 backdrop-blur-xl rounded-[2.5rem]">
             <div className="grid grid-cols-12 gap-6 w-full h-full p-8 opacity-40">
                <div className="col-span-3 glass rounded-3xl p-6 flex flex-col gap-6 shadow-2xl scale-95 border-white/10">
                   <div className="w-2/3 h-4 bg-white/20 rounded-full"></div>
                   <div className="w-full h-40 bg-white/10 rounded-2xl border border-white/10 animate-pulse"></div>
                   <div className="space-y-3">
                      <div className="w-full h-3 bg-white/10 rounded-full"></div>
                      <div className="w-2/3 h-3 bg-white/10 rounded-full"></div>
                   </div>
                </div>
                <div className="col-span-6 glass rounded-[2.5rem] p-8 flex flex-col gap-8 scale-105 z-10 bg-white/15 border-primary-accent/30 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                   <div className="flex justify-between items-center">
                      <div className="w-1/3 h-5 bg-primary-accent/40 rounded-full"></div>
                      <div className="w-8 h-8 rounded-xl bg-highlight-accent/30"></div>
                   </div>
                   <div className="w-full h-64 bg-background-dark/40 rounded-3xl border border-white/10 flex flex-col p-6 gap-4">
                      <div className="flex gap-4 items-center">
                         <div className="w-12 h-12 rounded-2xl bg-primary-accent/20"></div>
                         <div className="space-y-2 flex-1">
                            <div className="w-1/2 h-3 bg-white/20 rounded-full"></div>
                            <div className="w-1/4 h-3 bg-white/10 rounded-full"></div>
                         </div>
                      </div>
                      <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                         {[1,2,3].map(i => <div key={i} className="w-full h-2 bg-white/10 rounded-full"></div>)}
                      </div>
                   </div>
                </div>
                <div className="col-span-3 glass rounded-3xl p-6 flex flex-col gap-6 shadow-2xl scale-95 border-white/10">
                   <div className="w-3/4 h-4 bg-white/20 rounded-full"></div>
                   <div className="flex-1 flex flex-col gap-4">
                      {[1,2,3,4].map(i => (
                         <div key={i} className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-full bg-highlight-accent/20"></div>
                            <div className="w-2/3 h-3 bg-white/10 rounded-full"></div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-dark/20 backdrop-blur-[1px] space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-primary-accent flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(99,102,241,0.5)] border border-white/30">C</div>
                <p className="text-3xl font-black text-white tracking-widest uppercase">Experience CampusOS</p>
                <p className="text-text-secondary font-medium italic">Building the future of student collaboration</p>
             </div>
          </GlassCard>
        </div>
      </SectionContainer>

      {/* Feature Section Expansion */}
      <SectionContainer id="explore">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Everything You Need.</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-medium">Built by students, for students. A complete ecosystem for your campus life.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard 
            title="Campus Feed" 
            desc="The heartbeat of your campus. Announcements, achievements, and club updates in real-time."
            icon="📢"
            color="primary-accent"
          />
          <FeatureCard 
            title="Events Hub" 
            desc="Never miss a hackathon or workshop again. Filter by interest and discover your next challenge."
            icon="📅"
            color="highlight-accent"
          />
          <FeatureCard 
            title="Student Marketplace" 
            desc="Buy and sell textbooks, gadgets, and services within your secure campus network."
            icon="🏷️"
            color="white"
          />
          <FeatureCard 
            title="Project Hub" 
            desc="Showcase your builds, find contributors, and manage your startup projects with ease."
            icon="🚀"
            color="primary-accent"
          />
          <FeatureCard 
            title="Team Finder" 
            desc="Match with talented developers, designers, and marketers who share your vision."
            icon="🤝"
            color="highlight-accent"
          />
          <FeatureCard 
            title="Knowledge Repo" 
            desc="A massive repository of curated study notes, lab guides, and previous year papers."
            icon="🧠"
            color="white"
          />
        </div>
      </SectionContainer>

      {/* Final CTA Expansion */}
      <SectionContainer>
        <div className="glass rounded-[4rem] p-12 md:p-32 text-center relative overflow-hidden border-primary-accent/30 shadow-2xl shadow-primary-accent/10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-accent/10 to-transparent -z-10"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-accent/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
          
          <div className="relative z-10 space-y-12 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
              Ready to build <br /> your future?
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary font-medium">
              Join thousands of campus builders already using CampusOS.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
               <PrimaryButton className="h-16 px-14 text-xl rounded-2xl">
                  Get Started Now
               </PrimaryButton>
               <button className="h-16 px-12 glass hover:bg-white/10 text-white font-bold rounded-2xl transition-all border-white/20">
                  Contact Support
               </button>
            </div>
          </div>
        </div>
      </SectionContainer>

      <footer className="border-t border-white/5 py-12 text-center">
        <div className="flex justify-center gap-8 mb-6">
           {['Terms', 'Privacy', 'Security', 'FAQ'].map(f => (
              <span key={f} className="text-xs font-bold text-text-secondary hover:text-white cursor-pointer transition-colors uppercase tracking-widest">{f}</span>
           ))}
        </div>
        <p className="text-text-secondary text-sm font-medium">© 2026 CampusOS. Built by builders, for builders.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon, color }: { title: string, desc: string, icon: string, color: string }) {
  return (
    <GlassCard className="flex flex-col gap-6 group hover:scale-[1.05] hover:shadow-2xl duration-500 hover:border-white/30 border-white/5 h-full p-10 bg-white/[0.02]">
      <div className={`w-16 h-16 rounded-[1.5rem] bg-${color}/10 flex items-center justify-center text-4xl border border-${color}/20 group-hover:bg-primary-accent/20 group-hover:border-primary-accent/40 transition-all shadow-inner`}>
        {icon}
      </div>
      <div className="space-y-3">
         <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-highlight-accent transition-colors">{title}</h3>
         <p className="text-text-secondary leading-relaxed font-medium">{desc}</p>
      </div>
    </GlassCard>
  );
}
