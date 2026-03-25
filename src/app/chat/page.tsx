"use client";

import React from 'react';
import { Search, MoreHorizontal, Camera, Edit2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ChatPage() {
  const contacts = [
    { id: '1', name: 'RIT Tech Club', lastMsg: 'See you at the workshop!', time: '2m', unread: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech' },
    { id: '2', name: 'Alex Rivera', lastMsg: 'Did you finish the project?', time: '1h', unread: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: '3', name: 'Sarah Chen', lastMsg: 'Sent a photo', time: '3h', unread: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: '4', name: 'Campus Events', lastMsg: 'New event tomorrow!', time: '1d', unread: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Campus' },
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col md:flex-row gap-4 px-4 pb-20 md:pb-0">
      {/* Sidebar */}
      <div className="flex-[0.4] bg-white/40 rounded-[2.5rem] border border-primary-teal/5 flex flex-col overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-text-charcoal font-heading">Messages</h1>
            <Edit2 size={20} className="text-primary-teal cursor-pointer" />
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-white/60 border border-primary-teal/5 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-teal/20 transition-all font-medium"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-2 space-y-1 pb-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center gap-3 p-4 hover:bg-white/60 rounded-3xl cursor-pointer transition-colors group">
              <div className="w-12 h-12 rounded-full ring-2 ring-primary-teal/20 shrink-0">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                  <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-text-charcoal text-sm truncate">{contact.name}</span>
                  <span className="text-[10px] text-text-gray font-bold">{contact.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-text-gray truncate font-medium">{contact.lastMsg}</p>
                  {contact.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-secondary-coral text-white flex items-center justify-center text-[8px] font-black">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Placeholder */}
      <div className="flex-1 bg-white/40 rounded-[2.5rem] border border-primary-teal/5 flex flex-col overflow-hidden relative">
        <div className="p-6 border-b border-primary-teal/5 flex justify-between items-center bg-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full ring-2 ring-primary-teal/20">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                <img src={contacts[0].avatar} alt={contacts[0].name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h2 className="font-black text-text-charcoal text-sm">{contacts[0].name}</h2>
              <span className="text-[10px] text-primary-teal font-black uppercase tracking-widest">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-text-gray">
             <Camera size={20} className="hover:text-primary-teal cursor-pointer" />
             <MoreHorizontal size={20} className="hover:text-primary-teal cursor-pointer" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
           <div className="text-6xl animate-bounce">💬</div>
           <h3 className="text-xl font-black text-text-charcoal font-heading">Select a chat to start vibing</h3>
           <p className="text-text-gray text-sm font-medium max-w-xs leading-relaxed">
             Direct messages and group chats are coming soon! Connect with your RIT friends in real-time.
           </p>
        </div>

        <div className="p-6 bg-white/20">
           <div className="bg-white/60 border border-primary-teal/10 rounded-3xl p-4 flex items-center gap-4">
             <input 
               type="text" 
               placeholder="Message..." 
               disabled
               className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-gray font-medium" 
             />
             <button disabled className="text-primary-teal font-black text-sm uppercase tracking-widest opacity-50">Send</button>
           </div>
        </div>
      </div>
    </div>
  );
}
