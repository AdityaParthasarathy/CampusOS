import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function ProfilePage() {
  return (
    <SectionContainer>
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Profile Header */}
        <GlassCard className="flex flex-col md:flex-row items-center gap-10 py-12 px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-primary-accent/30 p-1.5 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <div className="w-full h-full rounded-[1.6rem] bg-background-secondary border border-white/10 flex items-center justify-center text-6xl shadow-inner">
                   👨‍💻
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-5 relative z-10 text-center md:text-left">
             <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">John Sterling</h1>
                <p className="text-primary-accent font-bold text-lg mt-1 tracking-wide">Computer Science • Senior Year</p>
             </div>
             
             <p className="text-text-secondary leading-relaxed max-w-2xl mx-auto md:mx-0">
                Full-stack developer focused on building scalable campus ecosystems. Passionate about AI, open-source software, and mentoring junior builders.
             </p>

             <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <PrimaryButton className="h-11 px-8 rounded-xl font-bold">Follow Profile</PrimaryButton>
                <button className="glass px-8 h-11 rounded-xl text-white font-bold border-white/20 hover:bg-white/10 transition-all">Message</button>
             </div>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <StatCard label="Followers" value="1.2k" color="primary-accent" />
           <StatCard label="Following" value="482" color="white" />
           <StatCard label="Projects" value="14" color="highlight-accent" />
           <StatCard label="Karma" value="8.4k" color="primary-accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Sidebar Info */}
           <div className="space-y-10">
              <GlassCard className="space-y-4">
                 <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Core Skills</h3>
                 <div className="flex flex-wrap gap-2">
                    {['Next.js', 'Go', 'AWS', 'PostgreSQL', 'Docker', 'Figma'].map(skill => (
                      <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary font-medium hover:border-primary-accent/50 transition-all cursor-default">
                         {skill}
                      </span>
                    ))}
                 </div>
              </GlassCard>

              <GlassCard className="space-y-4">
                 <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Connect</h3>
                 <div className="space-y-3">
                    <LinkItem label="GitHub" value="github.com/sterling" icon="🔗" />
                    <LinkItem label="Twitter" value="@sterling_dev" icon="🐦" />
                    <LinkItem label="LinkedIn" value="Sterling.JS" icon="💼" />
                 </div>
              </GlassCard>
           </div>

           {/* Main Content */}
           <div className="lg:col-span-2 space-y-10">
              <h2 className="text-3xl font-bold text-white tracking-tight">Active Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[1, 2].map(i => (
                    <GlassCard key={i} className="hover:border-primary-accent/30 transition-all border border-white/10">
                       <h4 className="text-xl font-bold text-white mb-2">CampusOS v2.0</h4>
                       <p className="text-text-secondary text-sm leading-relaxed mb-6">Leading the backend architecture for the new student hub.</p>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-primary-accent font-bold">Open Source</span>
                          <span className="text-text-secondary italic">Updated 2 days ago</span>
                       </div>
                    </GlassCard>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <GlassCard className="text-center group hover:bg-primary-accent/5 transition-all">
       <div className={`text-3xl font-black text-${color} text-gradient group-hover:scale-110 transition-transform duration-500`}>{value}</div>
       <div className="text-[10px] uppercase font-bold text-text-secondary tracking-[0.2em] mt-2 group-hover:text-white transition-colors">{label}</div>
    </GlassCard>
  );
}

function LinkItem({ label, value, icon }: { label: string, value: string, icon: string }) {
  return (
    <div className="flex items-center justify-between text-sm group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
       <div className="flex items-center gap-3">
          <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
          <span className="text-text-secondary group-hover:text-white transition-colors">{label}</span>
       </div>
       <span className="text-xs text-primary-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">Visit →</span>
    </div>
  );
}
