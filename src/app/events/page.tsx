"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';

const categories = ['All', 'Hackathon', 'Workshop', 'Competition', 'Club Meeting', 'Social'];

const events = [
  {
    id: 1,
    title: "Campus Hack 2026",
    date: "March 24, 9:00 AM",
    location: "Main Auditorium",
    organizer: "Campus Tech Club",
    category: "Hackathon",
    desc: "48 hours of intense building, networking, and innovation."
  },
  {
    id: 2,
    title: "UI/UX Masterclass",
    date: "March 26, 2:00 PM",
    location: "Design Studio (B4)",
    organizer: "Creative Arts Society",
    category: "Workshop",
    desc: "Learn from industry experts about modern design systems."
  },
  {
    id: 3,
    title: "Eco-Logic Case Study",
    date: "April 2, 10:00 AM",
    location: "Science Block Seminar Hall",
    organizer: "Green Earth Initiative",
    category: "Competition",
    desc: "Present your sustainable campus solutions to a panel of judges."
  }
];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredEvents = activeCategory === 'All' 
    ? events 
    : events.filter(e => e.category === activeCategory);

  return (
    <SectionContainer>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Events Hub</h1>
            <p className="text-text-secondary mt-1">Discover what's brewing on campus.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeCategory === cat
                    ? 'bg-primary-accent text-white border-primary-accent shadow-lg shadow-primary-accent/20'
                    : 'bg-white/5 text-text-secondary border-white/10 hover:border-white/30'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredEvents.map(event => (
             <GlassCard key={event.id} className="p-0 overflow-hidden group hover:scale-[1.02] duration-500 flex flex-col h-full">
                <div className="w-full h-40 bg-gradient-to-r from-background-secondary to-primary-accent/30 relative">
                   <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-background-dark/80 backdrop-blur-md text-[10px] font-bold text-highlight-accent rounded-lg border border-white/10 italic">
                        {event.category}
                      </span>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-6xl opacity-10 group-hover:opacity-20 transition-opacity">📅</span>
                   </div>
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                   <h3 className="text-2xl font-bold text-white group-hover:text-highlight-accent transition-colors">{event.title}</h3>
                   <p className="text-text-secondary text-sm line-clamp-2 flex-1">{event.desc}</p>
                   
                   <div className="space-y-2 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                         <span className="w-4 h-4 flex items-center justify-center">🕒</span>
                         <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                         <span className="w-4 h-4 flex items-center justify-center">📍</span>
                         <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-primary-accent font-medium pt-2">
                         <span>Organized by {event.organizer}</span>
                      </div>
                   </div>
                </div>
             </GlassCard>
           ))}
        </div>
      </div>
    </SectionContainer>
  );
}
