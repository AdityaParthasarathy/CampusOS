import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const projects = [
  {
    id: 1,
    title: "CampusOS Core",
    desc: "An all-in-one digital workspace for students. Building the future of campus connectivity.",
    stack: ["Next.js", "TypeScript", "Tailwind", "Prisma"],
    members: ["JD", "AS", "BK"],
    status: "Active"
  },
  {
    id: 2,
    title: "AI Study Buddy",
    desc: "GPT-powered assistant trained on campus curriculum and previous year papers.",
    stack: ["Python", "OpenAI API", "React"],
    members: ["MC", "LK"],
    status: "In Progress"
  },
  {
    id: 3,
    title: "Dorm Delivery",
    desc: "Hyper-local marketplace for late-night snacks and essentials across hostels.",
    stack: ["Flutter", "Firebase", "Node.js"],
    members: ["RJ", "TW", "PF", "ML"],
    status: "Beta"
  }
];

export default function ProjectsPage() {
  return (
    <SectionContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Project Hub</h1>
          <p className="text-text-secondary max-w-xl">Join existing projects or launch your next big idea with the community.</p>
        </div>
        <PrimaryButton className="h-12 px-8">Launch a Project</PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <GlassCard key={project.id} className="group hover:border-primary-accent/30 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                project.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                project.status === 'Beta' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white group-hover:text-primary-accent transition-colors mb-3">
              {project.title}
            </h3>
            
            <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-1">
              {project.desc}
            </p>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {project.stack.map(tech => (
                  <span key={tech} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-text-secondary font-medium lowercase">
                    #{tech}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex -space-x-2">
                  {project.members.map((m, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-background-secondary border-2 border-background-dark flex items-center justify-center text-[10px] font-bold text-text-primary ring-1 ring-white/10">
                      {m}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-background-dark flex items-center justify-center text-[10px] text-text-secondary">
                    +2
                  </div>
                </div>
                <button className="text-xs font-bold text-highlight-accent hover:underline">View Project</button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </SectionContainer>
  );
}
