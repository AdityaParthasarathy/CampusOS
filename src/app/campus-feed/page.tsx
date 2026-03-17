import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const posts = [
  {
    id: 1,
    title: "Annual Tech Symposium 2026 Announced!",
    description: "Get ready for the biggest tech event on campus. Speaker lineup includes founders from top Silicon Valley startups.",
    author: "Campus Tech Club",
    date: "2 hours ago",
    category: "Announcement",
    avatar: "🚀"
  },
  {
    id: 2,
    title: "Physics Dept wins National Research Award",
    description: "Congratulations to Dr. Aris and his team for their breakthrough in quantum computing architecture.",
    author: "Campus News Hub",
    date: "5 hours ago",
    category: "Achievement",
    avatar: "🔬"
  },
  {
    id: 3,
    title: "Looking for Flutter Developers for 'EcoTrack' app",
    description: "Building an app to track campus carbon footprint. Join the green revolution!",
    author: "Sarah Jenkins",
    date: "Yesterday",
    category: "Opportunity",
    avatar: "🌱"
  }
];

export default function CampusFeedPage() {
  return (
    <SectionContainer>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Campus Feed</h1>
            <p className="text-text-secondary mt-1">What's happening around your campus today.</p>
          </div>
          <PrimaryButton>Create Post</PrimaryButton>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <GlassCard key={post.id} className="flex gap-6 p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:bg-primary-accent/10 group-hover:border-primary-accent/30 transition-all flex-shrink-0">
                {post.avatar}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold tracking-widest text-highlight-accent uppercase bg-highlight-accent/10 px-2 py-0.5 rounded-md border border-highlight-accent/20">
                    {post.category}
                  </span>
                  <span className="text-xs text-text-secondary">{post.date}</span>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-primary-accent transition-colors">
                  {post.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {post.description}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-6 h-6 rounded-full bg-primary-accent/20 flex items-center justify-center text-[10px]">👤</div>
                  <span className="text-sm font-medium text-white/80">{post.author}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
