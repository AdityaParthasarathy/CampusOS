import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const listings = [
  {
    id: 1,
    title: "Engineering Mathematics Textbook",
    price: "$25",
    description: "Mint condition, latest edition. Essential for freshman year.",
    seller: "John Doe",
    icon: "📖"
  },
  {
    id: 2,
    title: "iPad Pro 11-inch (2022)",
    price: "$450",
    description: "Comes with Apple Pencil. Perfect for digital note-taking.",
    seller: "Maria Garcia",
    icon: "📱"
  },
  {
    id: 3,
    title: "Python Tutoring Services",
    price: "$20/hr",
    description: "Expert guidance for CS101. Helping you ace those labs.",
    seller: "Alex Chen",
    icon: "🐍"
  }
];

export default function MarketplacePage() {
  return (
    <SectionContainer>
      <div className="space-y-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Student Marketplace</h1>
            <p className="text-text-secondary mt-2">Buy, sell, or trade with fellow students.</p>
          </div>
          <div className="flex gap-4">
             <button className="glass px-6 py-3 rounded-xl text-white font-medium hover:bg-white/10 transition-all">My Listings</button>
             <PrimaryButton>Post Item</PrimaryButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <GlassCard key={item.id} className="group overflow-hidden p-0 h-full flex flex-col">
              <div className="h-48 bg-gradient-to-br from-background-secondary to-primary-accent/10 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white group-hover:text-highlight-accent transition-colors line-clamp-1">{item.title}</h3>
                  <span className="text-lg font-bold text-highlight-accent">{item.price}</span>
                </div>
                <p className="text-text-secondary text-sm flex-1">{item.description}</p>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                  <span className="text-text-secondary italic">Listed by {item.seller}</span>
                  <button className="text-white font-bold hover:text-primary-accent transition-colors">Details →</button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
