import React, { useRef } from 'react';

// Categories mapping to visual bubbles
export const PULSE_ITEMS = [
  { id: 'all', label: 'All Grid', icon: '✨', color: 'from-gray-100 to-white', border: 'border-gray-300' },
  { id: 'events', label: 'Live Events', icon: '🔴', color: 'from-secondary-coral/20 to-white', border: 'border-secondary-coral/50' },
  { id: 'announcements', label: 'Alerts', icon: '📢', color: 'from-blue-400/20 to-white', border: 'border-blue-400/50' },
  { id: 'trending', label: 'Trending', icon: '🔥', color: 'from-orange-400/20 to-white', border: 'border-orange-400/50' },
  { id: 'clubs', label: 'Active Clubs', icon: '👥', color: 'from-purple-400/20 to-white', border: 'border-purple-400/50' },
];

interface CampusPulseProps {
  activePulse: string;
  onSelectPulse: (id: string) => void;
}

export const CampusPulse: React.FC<CampusPulseProps> = ({ activePulse, onSelectPulse }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full relative z-10">
      <div className="flex items-center justify-between px-2 mb-3">
        <h2 className="text-sm font-black text-text-charcoal uppercase tracking-widest font-heading flex items-center gap-2">
          Campus Pulse
        </h2>
        <span className="text-[9px] font-bold text-secondary-coral bg-secondary-coral/10 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-secondary-coral animate-pulse" /> Live</span>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-4 custom-scrollbar snap-x no-scrollbar mask-edges"
      >
        {PULSE_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPulse(item.id)}
            className={`flex flex-col items-center gap-2 shrink-0 snap-start group outline-none hover:scale-105 active:scale-95 transition-all w-20 
              ${activePulse === item.id ? 'opacity-100 scale-105 transform translate-y-[-2px]' : 'opacity-70 hover:opacity-100'}`}
          >
            <div className={`w-16 h-16 rounded-[2rem] bg-gradient-to-br ${item.color} flex items-center justify-center border-2 
              ${activePulse === item.id ? item.border : 'border-white'} 
              shadow-sm group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden`}
            >
              {activePulse === item.id && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
              <span className="text-2xl relative z-10 filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </span>
            </div>
            <span className={`text-[10px] uppercase tracking-widest text-center truncate w-full px-1 
              ${activePulse === item.id ? 'font-black text-text-charcoal' : 'font-bold text-text-gray'}`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
      <style jsx>{`
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};
