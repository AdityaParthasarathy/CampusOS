import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';

const candidates = [
  {
    id: 1,
    name: "Alex Rivera",
    skills: ["React", "Go", "Figma"],
    interests: ["Fintech", "Web3", "UI Motion"],
    year: "Senior",
    dept: "CS"
  },
  {
    id: 2,
    name: "Samantha Lee",
    skills: ["Python", "PyTorch", "Tableau"],
    interests: ["AI/ML", "DataViz", "Sustainability"],
    year: "Junior",
    dept: "Data Science"
  },
  {
    id: 3,
    name: "Marcus Thorne",
    skills: ["Marketing", "Growth Hacking", "SEO"],
    interests: ["Social Media", "DTC Branding"],
    year: "Sophomore",
    dept: "Business"
  }
];

export default function TeamFinderPage() {
  return (
    <SectionContainer>
      <div className="space-y-10">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Team Finder</h1>
            <p className="text-text-secondary">Explore the campus talent pool and find your dream team.</p>
          </div>
          <button className="glass px-6 py-3 rounded-xl text-white font-medium hover:bg-white/10 transition-all border border-primary-accent/30">Create Profile</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((person) => (
            <GlassCard key={person.id} className="relative group overflow-hidden hover:border-primary-accent/40 duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-accent to-highlight-accent"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-background-secondary to-primary-accent/20 flex items-center justify-center text-2xl border border-white/10 group-hover:rotate-12 transition-transform">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{person.name}</h3>
                  <p className="text-xs text-primary-accent mt-0.5">{person.dept} • {person.year}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Top Skills</p>
                   <div className="flex flex-wrap gap-2">
                      {person.skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-text-primary">
                           {skill}
                        </span>
                      ))}
                   </div>
                </div>

                <div>
                   <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Interests</p>
                   <div className="flex flex-wrap gap-2">
                      {person.interests.map(interest => (
                        <span key={interest} className="text-xs text-highlight-accent italic">
                           #{interest}
                        </span>
                      ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3">
                   <button className="flex-1 glass bg-primary-accent/10 border-primary-accent/30 py-2 rounded-lg text-white text-xs font-bold hover:bg-primary-accent/20 transition-all">
                      Invite to Project
                   </button>
                   <button className="w-10 h-10 glass flex items-center justify-center rounded-lg hover:bg-white/10">
                      ✉️
                   </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
