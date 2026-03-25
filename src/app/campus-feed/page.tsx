/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GlassModal } from '@/components/ui/GlassModal';
import { GlassTextArea } from '@/components/ui/GlassTextArea';
import { GlassInput } from '@/components/ui/GlassInput';
import { useAuth } from '@/context/AuthContext';
import { db, sanitizeData } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import { CampusPulse } from '@/components/ui/CampusPulse';
import { PostCard } from '@/components/ui/PostCard';

export default function CampusFeedPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [localPosts, setLocalPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ content: '', category: 'General', type: 'general', location: '', image: '' });

  const [activePulse, setActivePulse] = useState('all');

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('campus-posts');
    if (saved) {
      try {
        setLocalPosts(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing local posts:", e);
      }
    }
  }, []);

  // Sync LocalPosts to LocalStorage
  useEffect(() => {
    localStorage.setItem('campus-posts', JSON.stringify(localPosts));
  }, [localPosts]);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db!, "feed"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((doc: any) => !doc.hidden);
      // Merge with local posts, avoiding duplicates
      const safeLocalPosts = Array.isArray(localPosts) ? localPosts : [];
      const merged = [...safeLocalPosts.filter(lp => !lp.hidden && !dbPosts.find(dp => dp.id === lp.id)), ...dbPosts];
      setPosts(merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [localPosts]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;
    if (formData.type === 'event' && !formData.location) {
      alert('Please enter a location for the event');
      return;
    }

    const newPost = {
      id: `local-${Date.now()}`,
      content: formData.content,
      category: formData.category,
      type: formData.type,
      location: formData.type === 'event' ? formData.location : '',
      image: formData.image,
      author: userData?.name || user?.displayName || "Campus Student",
      authorId: user?.uid || "anon",
      hypes: 0,
      hypedBy: [],
      participants: [],
      boosts: 0,
      boostedBy: [],
      createdAt: new Date().toISOString()
    };

    // Add to Local
    setLocalPosts([newPost, ...localPosts]);

    // Add to Firestore if available
    if (db && user) {
      try {
        await addDoc(collection(db, "feed"), sanitizeData(newPost));
      } catch (error) {
        console.error("Error posting update to Firestore:", error);
      }
    }

    setIsModalOpen(false);
    setFormData({ content: '', category: 'General', type: 'general', location: '', image: '' });
  };

  const handleReaction = async (postId: string, type: 'hype' | 'boost' | 'imIn') => {
    if (!user) {
      router.push('/login');
      return;
    }

    const updatedLocal = localPosts.map(p => {
      if (p.id !== postId) return p;

      const newPost = { ...p };
      const userId = user.uid;

      if (type === 'hype') {
        const hypedBy = Array.isArray(p.hypedBy) ? p.hypedBy : (Array.isArray(p.likedBy) ? p.likedBy : []);
        const isHyped = hypedBy.includes(userId);
        newPost.hypedBy = isHyped ? hypedBy.filter((id: string) => id !== userId) : [...hypedBy, userId];
        newPost.hypes = newPost.hypedBy.length;
      } else if (type === 'imIn') {
        const participants = Array.isArray(p.participants) ? p.participants : [];
        const isParticipant = participants.includes(userId);
        newPost.participants = isParticipant ? participants.filter((id: string) => id !== userId) : [...participants, userId];
      } else if (type === 'boost') {
        const boostedBy = Array.isArray(p.boostedBy) ? p.boostedBy : [];
        const isBoosted = boostedBy.includes(userId);
        newPost.boostedBy = isBoosted ? boostedBy.filter((id: string) => id !== userId) : [...boostedBy, userId];
        newPost.boosts = newPost.boostedBy.length;
      }

      return newPost;
    });

    setLocalPosts(updatedLocal);

    // Update Firestore
    if (db && !postId.startsWith('local-')) {
      const postRef = doc(db, "feed", postId);
      const postToUpdate = updatedLocal.find(p => p.id === postId);
      if (postToUpdate) {
        try {
          await updateDoc(postRef, sanitizeData({
            hypes: postToUpdate.hypes || 0,
            hypedBy: postToUpdate.hypedBy || [],
            participants: postToUpdate.participants || [],
            boosts: postToUpdate.boosts || 0,
            boostedBy: postToUpdate.boostedBy || []
          }));
        } catch (error) {
          console.error(`Error updating ${type} in Firestore:`, error);
        }
      }
    }
  };

  const handleDelete = async (postId: string) => {
    // Optimistic local update
    setLocalPosts(prev => prev.filter(p => p.id !== postId));
    setPosts(prev => prev.filter(p => p.id !== postId));

    if (db && !postId.startsWith('local-')) {
      try {
        await deleteDoc(doc(db, "feed", postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleHide = async (postId: string) => {
    // Optimistic local update
    setLocalPosts(prev => prev.map(p => p.id === postId ? { ...p, hidden: true } : p));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, hidden: true } : p));

    if (db && !postId.startsWith('local-')) {
      try {
        await updateDoc(doc(db, "feed", postId), { hidden: true });
      } catch (error) {
        console.error("Error hiding post:", error);
      }
    }
  };

  const getDisplayedPosts = () => {
    // Map existing posts to ensure backward compatibility (default 'general')
    let result = posts.map(p => ({ ...p, type: p.type || 'general' }));
    
    switch (activePulse) {
      case 'events':
        result = result.filter(p => p.type === 'event' || ['Club Event', 'Workshop', 'Initiative'].includes(p.category));
        break;
      case 'announcements':
        result = result.filter(p => p.type === 'announcement');
        break;
      case 'trending':
        result = result.filter(p => (p.hypes || 0) > 0 || (p.boosts || 0) > 0);
        result.sort((a, b) => ((b.hypes || 0) + (b.boosts || 0)) - ((a.hypes || 0) + (a.boosts || 0)));
        break;
      case 'clubs':
        result = result.filter(p => p.category === 'Club Event');
        break;
    }
    
    return result;
  };

  const displayedPosts = getDisplayedPosts();

  return (
    <div className="max-w-xl mx-auto pb-20 md:pb-10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background-neutral/80 backdrop-blur-xl px-4 py-4 md:py-6 flex justify-between items-center border-b border-primary-teal/5">
        <h1 className="text-4xl font-black text-primary-teal tracking-tighter font-heading italic">CampusOS</h1>
        <div className="flex gap-4">
            <PrimaryButton 
            onClick={() => user ? setIsModalOpen(true) : router.push('/login')}
            className="!px-8 !py-2 !h-12 !text-[11px] rounded-full shadow-[0_8px_25px_rgba(0,194,203,0.25)] hover:scale-105 active:scale-95 transition-all"
          >
            + New Post
          </PrimaryButton>
        </div>
      </div>

      <div className="space-y-6 px-0 md:px-0">
        {/* Campus Pulse Layer */}
        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] p-4 mt-2 border border-white/40 shadow-sm mx-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-coral/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-teal/5 rounded-full blur-3xl pointer-events-none" />
          <CampusPulse 
            activePulse={activePulse} 
            onSelectPulse={setActivePulse} 
          />
        </div>

        {/* Feed */}
        <div className="space-y-8 pb-24">
          {loading ? (
             [1,2,3].map(i => (
               <div key={i} className="floating-card h-[500px] animate-pulse !p-0 bg-white shadow-md border-none">
                 <div className="p-4 h-16 bg-slate-50/50" />
                 <div className="bg-[#f8fafc] flex-1 h-[400px]" />
               </div>
             ))
          ) : displayedPosts.length > 0 ? (
            <div className="flex flex-col gap-8 px-2">
              {displayedPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onReaction={handleReaction} 
                  user={user} 
                  onDelete={handleDelete}
                  onHide={handleHide}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white/60 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-primary-teal/10 mx-4 shadow-sm">
               <div className="text-6xl mb-6">{activePulse === 'events' ? '📅' : activePulse === 'announcements' ? '📢' : '✨'}</div>
               <h3 className="text-2xl font-black text-text-charcoal font-heading tracking-tight">
                 {activePulse === 'events' ? 'No live events right now' : activePulse === 'announcements' ? 'No announcements right now' : 'The feed is fresh...'}
               </h3>
               <p className="text-text-gray font-bold uppercase tracking-widest text-[10px] mt-2">
                 {activePulse === 'events' ? 'Check back later or host one yourself!' : activePulse === 'announcements' ? 'Stay tuned for campus-wide updates!' : 'Be the trendsetter and post first!'}
               </p>
            </div>
          )}
        </div>
      </div>

      <GlassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Campus Update"
      >
        <form onSubmit={handlePostUpdate} className="space-y-6">
          <GlassTextArea 
            label="Caption"
            placeholder="What's happening?"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            required
          />
          <GlassInput 
            label="Optional Image URL"
            placeholder="https://images.unsplash.com/..."
            value={formData.image}
            onChange={(e) => setFormData({...formData, image: e.target.value})}
          />
          {formData.image && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-primary-teal/10 bg-black/5">
              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => setFormData({...formData, image: ''})}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
              >
                ✕
              </button>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-gray ml-1 uppercase tracking-wider">Post Type</label>
            <div className="flex gap-2">
              {[
                { id: 'general', label: '📝 General' },
                { id: 'event', label: '🔴 Event' },
                { id: 'announcement', label: '📢 Announcement' }
              ].map(typeOption => (
                <button
                  key={typeOption.id}
                  type="button"
                  onClick={() => setFormData({...formData, type: typeOption.id, location: typeOption.id !== 'event' ? '' : formData.location})}
                  className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                    formData.type === typeOption.id 
                      ? 'bg-primary-teal text-white shadow-md transform scale-[1.02]' 
                      : 'bg-white/60 text-text-gray hover:bg-white border border-primary-teal/10'
                  }`}
                >
                  {typeOption.label}
                </button>
              ))}
            </div>
          </div>
          {formData.type === 'event' && (
            <div className="space-y-2 animate-fade-in">
              <input
                className="w-full bg-white/60 backdrop-blur-md border border-secondary-coral/20 rounded-2xl px-5 h-14 text-text-charcoal focus:outline-none focus:ring-2 focus:ring-secondary-coral/30 transition-all"
                placeholder="e.g. Main Auditorium"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-gray ml-1 uppercase tracking-wider">Category</label>
            <select 
              className="w-full bg-white/60 backdrop-blur-md border border-primary-teal/10 rounded-2xl px-5 h-14 text-text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-teal/30 transition-all appearance-none"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {['General', 'Club Event', 'Workshop', 'Initiative', 'Urgent'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-primary-teal/10">
             <button 
               type="button" 
               onClick={() => setIsModalOpen(false)}
               className="btn-rounded text-sm text-text-gray hover:bg-black/5"
             >
               Cancel
             </button>
             <PrimaryButton type="submit" className="!px-10 !h-12 rounded-full">
               Share Post
             </PrimaryButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
