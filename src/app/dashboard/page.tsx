import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <SectionContainer>
      <div className="space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight">System Dashboard</h1>
            <p className="text-text-secondary mt-2">Welcome back. Here's a pulse on your campus.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 px-4 py-2 glass bg-green-500/5 border-green-500/20 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-green-400">SERVER ONLINE</span>
             </div>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStat label="New in Feed" value="+12" icon="📢" trend="up" />
          <DashboardStat label="Events Today" value="3" icon="📅" />
          <DashboardStat label="Market Listings" value="84" icon="🏷️" trend="up" />
          <DashboardStat label="Open Roles" value="26" icon="🤝" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Activity Feed */}
           <GlassCard className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                 <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                 <Link href="/campus-feed" className="text-xs text-primary-accent hover:underline font-bold">VIEW ALL</Link>
              </div>
              <div className="space-y-6">
                 <ActivityItem title="Hackathon Registration Started" time="15m ago" icon="🔥" />
                 <ActivityItem title="New Project: AI Course Helper" time="1h ago" icon="🚀" />
                 <ActivityItem title="Marketplace: Physics 101 Notes Uploaded" time="3h ago" icon="📄" />
                 <ActivityItem title="Club Meeting: Robotics Tomorrow" time="5h ago" icon="🤖" />
              </div>
           </GlassCard>

           {/* Quick Actions */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold text-white px-2">Quick Access</h2>
              <div className="grid grid-cols-1 gap-4">
                 <QuickLink href="/campus-feed" label="Campus Feed" desc="See latest updates" />
                 <QuickLink href="/marketplace" label="Marketplace" desc="Buy/Sell items" />
                 <QuickLink href="/projects" label="Project Hub" desc="Manage your builds" />
                 <QuickLink href="/knowledge-hub" label="Knowledge Hub" desc="Study resources" />
              </div>
           </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function DashboardStat({ label, value, icon, trend }: { label: string, value: string, icon: string, trend?: string }) {
  return (
    <GlassCard className="p-6 relative overflow-hidden group hover:border-primary-accent/30 transition-all">
       <div className="absolute top-0 right-0 p-4 text-3xl opacity-20 group-hover:opacity-100 group-hover:scale-125 transition-all grayscale group-hover:grayscale-0">
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{label}</p>
          <h3 className="text-4xl font-black text-white flex items-baseline gap-2">
             {value}
             {trend && <span className="text-xs text-green-400">↑</span>}
          </h3>
       </div>
    </GlassCard>
  );
}

async function ActivityItem({ title, time, icon }: { title: string, time: string, icon: string }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all cursor-default border border-transparent hover:border-white/10 group">
       <div className="w-10 h-10 rounded-lg bg-background-secondary border border-white/10 flex items-center justify-center text-lg group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          {icon}
       </div>
       <div className="flex-1">
          <h4 className="text-sm font-semibold text-white group-hover:text-primary-accent transition-colors">{title}</h4>
          <p className="text-xs text-text-secondary mt-1 tracking-tight">{time}</p>
       </div>
    </div>
  );
}

function QuickLink({ href, label, desc }: { href: string, label: string, desc: string }) {
  return (
    <Link href={href}>
       <GlassCard className="p-4 hover:border-highlight-accent/30 transition-all border border-white/10 group">
          <div className="flex justify-between items-center">
             <div className="space-y-0.5">
                <h4 className="font-bold text-white group-hover:text-highlight-accent transition-colors">{label}</h4>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">{desc}</p>
             </div>
             <span className="text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
       </GlassCard>
    </Link>
  );
}
