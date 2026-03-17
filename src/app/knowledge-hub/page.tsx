import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';

const resources = [
  {
    id: 1,
    title: "Operating Systems - Final Notes",
    category: "Notes",
    dept: "CS",
    author: "Prof. Emily Watson",
    fileSize: "4.2 MB",
    type: "PDF"
  },
  {
    id: 2,
    title: "Quantum Mechanics Lab Guide",
    category: "Tutorial",
    dept: "Physics",
    author: "Research Society",
    fileSize: "1.8 MB",
    type: "DOCX"
  },
  {
    id: 3,
    title: "Discrete Math PYP (2020-2025)",
    category: "Previous Papers",
    dept: "Mathematics",
    author: "Library Archives",
    fileSize: "12.5 MB",
    type: "PDF"
  }
];

export default function KnowledgeHubPage() {
  return (
    <SectionContainer>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Knowledge Repo</h1>
            <p className="text-text-secondary max-w-xl">Access curated academic resources shared by the campus community.</p>
          </div>
          <div className="flex gap-3">
             <button className="glass px-6 py-3 rounded-xl text-white font-medium hover:bg-white/10 transition-all">Search Repo</button>
             <button className="glass bg-primary-accent/10 border-primary-accent/30 px-6 py-3 rounded-xl text-white font-medium hover:bg-primary-accent/20 transition-all">Upload File</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {['Tech Stack', 'Product', 'Design', 'Marketing'].map(cat => (
             <GlassCard key={cat} className="flex items-center gap-4 py-8 hover:bg-white/10 group cursor-pointer border-dashed border-white/20">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary-accent/20 transition-all">📂</div>
                <div>
                   <h3 className="font-bold text-white">{cat}</h3>
                   <p className="text-xs text-text-secondary">24 resources available</p>
                </div>
             </GlassCard>
           ))}
        </div>

        <div className="space-y-6 pt-10">
           <h2 className="text-2xl font-bold text-white">Recent Resources</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map(res => (
                <GlassCard key={res.id} className="relative group hover:border-highlight-accent/30 transition-all p-6">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 rounded-lg bg-background-secondary border border-white/10 flex items-center justify-center text-lg shadow-lg group-hover:shadow-primary-accent/20 transition-all">
                         {res.type === 'PDF' ? '📕' : '📘'}
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary bg-white/5 border border-white/10 px-2 py-1 rounded lowercase">
                        {res.category}
                      </span>
                   </div>

                   <h3 className="text-lg font-bold text-white group-hover:text-highlight-accent transition-colors mb-2 line-clamp-1">
                      {res.title}
                   </h3>

                   <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                         <span className="text-text-secondary italic">By {res.author}</span>
                         <span className="text-primary-accent font-bold">{res.dept}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                         <span className="text-[10px] font-medium text-text-secondary">{res.fileSize} • {res.type}</span>
                         <button className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-primary-accent hover:text-white transition-all">
                            DOWNLOAD
                         </button>
                      </div>
                   </div>
                </GlassCard>
              ))}
           </div>
        </div>
      </div>
    </SectionContainer>
  );
}
