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
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassTextArea } from '@/components/ui/GlassTextArea';
import { useAuth } from '@/context/AuthContext';
import { db, sanitizeData } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  setDoc,
  getDocs
} from 'firebase/firestore';

const categories = ['All', 'Hackathon', 'Workshop', 'Competition', 'Club Meeting', 'Social'];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();
  
  // New event form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Hackathon',
    date: '',
    location: '',
    desc: ''
  });

  // Comments state mapped by event ID
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  // Likes state mapped by event ID
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [userLikesMap, setUserLikesMap] = useState<Record<string, boolean>>({});

  // Real-time events listener
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db!, "events"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(fetchedEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listeners for Comments and Likes for all fetched events
  useEffect(() => {
    if (!db || events.length === 0) return;

    const unsubscribes: any[] = [];

    events.forEach(event => {
      // Comments Listener
      const commentsQuery = query(collection(db!, `events/${event.id}/comments`), orderBy("createdAt", "desc"));
      const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
        setCommentsMap(prev => ({
          ...prev,
          [event.id]: snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        }));
      });
      unsubscribes.push(unsubComments);

      // Likes Listener
      const likesRef = collection(db!, `events/${event.id}/likes`);
      const unsubLikes = onSnapshot(likesRef, (snapshot) => {
        setLikesCountMap(prev => ({
           ...prev,
           [event.id]: snapshot.size
        }));

        if (user) {
           const hasLiked = snapshot.docs.some(doc => doc.id === user.uid);
           setUserLikesMap(prev => ({
              ...prev,
              [event.id]: hasLiked
           }));
        }
      });
      unsubscribes.push(unsubLikes);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [events, user]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData || !db) return;

    try {
      const eventData = {
        ...formData,
        creatorId: user.uid,
        organizer: userData.name || user.displayName || "Anonymous",
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db!, "events"), sanitizeData(eventData));
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'Hackathon',
        date: '',
        location: '',
        desc: ''
      });
    } catch (error) {
      console.error("Error adding event: ", error);
      alert("Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId: string, creatorId: string) => {
    if (!user || user.uid !== creatorId || !db) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db!, "events", eventId));
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const handleLikeToggle = async (eventId: string) => {
    if (!user || !db) {
       alert("Please login to like events.");
       return;
    }

    const likeDocRef = doc(db!, `events/${eventId}/likes`, user.uid);
    const hasLiked = userLikesMap[eventId];

    try {
       if (hasLiked) {
          await deleteDoc(likeDocRef);
          // Only notification cleanup could go here, but usually not needed for toggle
       } else {
          await setDoc(likeDocRef, sanitizeData({
             userId: user.uid,
             userName: userData?.name || user.displayName || "User",
             createdAt: new Date().toISOString()
          }));

          // Trigger notification
          const event = events.find(e => e.id === eventId);
          if (event && event.creatorId !== user.uid) {
             await addDoc(collection(db!, `users/${event.creatorId}/notifications`), {
               type: "like",
               message: `${userData?.name || user.displayName} liked your event "${event.title}"`,
               relatedId: eventId,
               senderId: user.uid,
               senderName: userData?.name || user.displayName,
               senderPhotoURL: userData?.avatar || user.photoURL,
               isRead: false,
               createdAt: new Date().toISOString()
             });
          }
       }
    } catch (error) {
       console.error("Error toggling like:", error);
    }
  };

  const handlePostComment = async (eventId: string) => {
    if (!user || !db) {
       alert("Please login to comment.");
       return;
    }

    const commentText = newCommentText[eventId];
    if (!commentText || commentText.trim() === '') return;

    try {
       await addDoc(collection(db!, `events/${eventId}/comments`), sanitizeData({
          text: commentText.trim(),
          userId: user.uid,
          userName: userData?.name || user.displayName || "User",
          userPhotoURL: userData?.avatar || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          createdAt: new Date().toISOString()
       }));

       setNewCommentText(prev => ({ ...prev, [eventId]: '' }));

       // Trigger notification
       const event = events.find(e => e.id === eventId);
       if (event && event.creatorId !== user.uid) {
          await addDoc(collection(db!, `users/${event.creatorId}/notifications`), sanitizeData({
            type: "comment",
            message: `${userData?.name || user.displayName} commented on your event "${event.title}"`,
            relatedId: eventId,
            senderId: user.uid,
            senderName: userData?.name || user.displayName,
            senderPhotoURL: userData?.avatar || user.photoURL,
            isRead: false,
            createdAt: new Date().toISOString()
          }));
       }
    } catch (error) {
       console.error("Error posting comment:", error);
    }
  };

  const filteredEvents = activeCategory === 'All' 
    ? events 
    : events.filter(e => e.category === activeCategory);

  return (
    <SectionContainer className="bg-background-neutral min-h-screen">
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-text-charcoal tracking-tighter font-heading italic">Campus Events</h1>
            <p className="text-text-gray font-bold uppercase tracking-[0.2em] text-[10px]">What's brewing on campus today.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full md:w-auto">
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest ${
                    activeCategory === cat
                      ? 'bg-primary-teal text-white border-primary-teal shadow-[0_10px_25px_rgba(0,194,203,0.3)] scale-105'
                      : 'bg-white/80 text-text-gray border-primary-teal/10 hover:bg-white hover:text-primary-teal hover:border-primary-teal/30 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {user && (
              <PrimaryButton onClick={() => setIsModalOpen(true)} className="rounded-full !px-10 !h-14 w-full md:w-auto">
                Host Event
              </PrimaryButton>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-teal/10 border-t-primary-teal"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             {filteredEvents.map(event => (
               <GlassCard key={event.id} className="p-0 overflow-hidden group hover:scale-[1.03] transition-all duration-700 flex flex-col h-full bg-white border-white shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_rgba(0,194,203,0.12)]">
                  <div className="w-full h-56 bg-gradient-to-br from-primary-teal/5 to-secondary-coral/5 relative overflow-hidden flex items-center justify-center">
                     <div className="absolute top-5 left-5 z-10">
                        <span className="px-5 py-2 bg-white/95 backdrop-blur-xl text-[10px] font-black tracking-[0.2em] uppercase text-primary-teal rounded-full border border-primary-teal/10 shadow-sm transition-all group-hover:bg-primary-teal group-hover:text-white group-hover:border-primary-teal">
                          {event.category}
                        </span>
                     </div>
                     {user && user.uid === event.creatorId && (
                       <div className="absolute top-5 right-5 z-10">
                         <button 
                           onClick={() => handleDeleteEvent(event.id, event.creatorId)}
                           className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-secondary-coral hover:bg-secondary-coral hover:text-white transition-all shadow-md border border-secondary-coral/10"
                           title="Delete Event"
                         >
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                           </svg>
                         </button>
                       </div>
                     )}
                     <div className="text-9xl opacity-10 group-hover:scale-125 group-hover:opacity-30 transition-all duration-1000 animate-float-card">🎉</div>
                  </div>

                  <div className="p-8 space-y-8 flex-1 flex flex-col bg-white">
                     <div className="space-y-3">
                        <h3 className="text-4xl font-black text-text-charcoal group-hover:text-primary-teal transition-colors font-heading tracking-tighter italic leading-none">{event.title}</h3>
                        <p className="text-text-gray text-sm leading-relaxed max-w-lg font-bold">{event.desc}</p>
                     </div>
                     
                     <div className="space-y-4 py-6 border-y border-primary-teal/5 flex-1">
                        <div className="flex items-center gap-4 text-sm text-text-gray font-bold">
                           <div className="w-10 h-10 rounded-2xl bg-secondary-coral/10 flex items-center justify-center text-secondary-coral border border-secondary-coral/10">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                           </div>
                           <span className="uppercase tracking-widest text-xs">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-gray font-bold">
                           <div className="w-10 h-10 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal border border-primary-teal/10">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                           </div>
                           <span className="uppercase tracking-widest text-xs">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-text-charcoal mt-2 uppercase tracking-widest">
                           <div className="w-8 h-8 rounded-full bg-background-neutral overflow-hidden border-2 border-primary-teal/10 shadow-inner">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.creatorId}`} className="w-full h-full object-cover" alt="Organizer" />
                           </div>
                           <span>Hosted by <span className="text-primary-teal">{event.organizer}</span></span>
                        </div>
                     </div>

                     {/* Actions: Like and Comment Toggle */}
                     <div className="flex items-center gap-4 pt-2">
                        <button 
                           onClick={() => handleLikeToggle(event.id)}
                           className={`flex items-center gap-3 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                              userLikesMap[event.id] 
                                 ? 'bg-secondary-coral text-white border-secondary-coral shadow-[0_8px_20px_rgba(255,107,107,0.3)]' 
                                 : 'bg-white text-text-gray border-primary-teal/10 hover:bg-primary-teal/5 hover:text-primary-teal hover:border-primary-teal/30'
                           }`}
                        >
                           <svg width="16" height="16" viewBox="0 0 24 24" fill={userLikesMap[event.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                           </svg>
                           <span>{likesCountMap[event.id] || 0} Vibes</span>
                        </button>
                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-background-neutral border border-primary-teal/5 text-[10px] text-text-gray font-black uppercase tracking-widest shadow-inner">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                           </svg>
                           <span>{commentsMap[event.id]?.length || 0} Comments</span>
                        </div>
                     </div>

                     {/* Comments Section */}
                     <div className="bg-background-neutral rounded-[2rem] p-6 space-y-6">
                        <div className="max-h-48 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                           {(!commentsMap[event.id] || commentsMap[event.id].length === 0) ? (
                              <p className="text-[10px] font-black text-text-gray/50 text-center uppercase tracking-widest py-4">Be the first to comment...</p>
                           ) : (
                              commentsMap[event.id].map(comment => (
                                 <div key={comment.id} className="flex gap-4 items-start group/comment">
                                    <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white shrink-0">
                                      <img src={comment.userPhotoURL} alt="avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none border border-primary-teal/5 shadow-sm group-hover/comment:border-primary-teal/20 transition-all flex-1">
                                       <p className="text-[10px] font-black text-primary-teal tracking-widest uppercase mb-1">{comment.userName}</p>
                                       <p className="text-xs text-text-charcoal font-bold">{comment.text}</p>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                        {user && (
                           <div className="flex gap-3 items-center pt-2">
                              <input 
                                 type="text" 
                                 placeholder="Add a comment..."
                                 value={newCommentText[event.id] || ''}
                                 onChange={(e) => setNewCommentText(prev => ({...prev, [event.id]: e.target.value}))}
                                 onKeyDown={(e) => {
                                    if(e.key === 'Enter') handlePostComment(event.id);
                                 }}
                                 className="flex-1 bg-white border border-primary-teal/10 rounded-full px-6 h-12 text-sm text-text-charcoal font-bold focus:outline-none focus:ring-4 focus:ring-primary-teal/5 focus:border-primary-teal/30 shadow-inner transition-all"
                              />
                              <button 
                                 onClick={() => handlePostComment(event.id)}
                                 disabled={!newCommentText[event.id]?.trim()}
                                 className="w-12 h-12 rounded-full bg-primary-teal text-white flex items-center justify-center hover:scale-110 active:scale-90 disabled:opacity-30 disabled:scale-100 transition-all shadow-[0_8px_20px_rgba(0,194,203,0.3)] cursor-pointer"
                              >
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                 </svg>
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </GlassCard>
             ))}
          </div>
        )}
      </div>

      <GlassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Host Campus Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-8">
          <GlassInput 
            label="Event Name"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            placeholder="e.g. AI Hackathon 26"
          />
          <div className="space-y-3">
             <label className="text-[10px] font-black text-text-gray ml-2 uppercase tracking-[0.2em]">Category</label>
             <select 
               className="w-full bg-background-neutral border border-primary-teal/10 rounded-2xl px-6 py-4 text-text-charcoal font-black uppercase tracking-widest text-xs focus:outline-none focus:ring-4 focus:ring-primary-teal/5 focus:border-primary-teal/30 focus:bg-white transition-all shadow-inner"
               value={formData.category}
               onChange={(e) => setFormData({...formData, category: e.target.value})}
             >
               {categories.filter(c => c !== 'All').map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
               ))}
             </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <GlassInput 
               label="When"
               type="text"
               placeholder="Oct 15, 2:00 PM"
               value={formData.date}
               onChange={(e) => setFormData({...formData, date: e.target.value})}
               required
             />
             <GlassInput 
               label="Where"
               placeholder="Main Auditorium"
               value={formData.location}
               onChange={(e) => setFormData({...formData, location: e.target.value})}
               required
             />
          </div>
          <GlassTextArea 
            label="What's happening?"
            placeholder="Share the vibes..."
            value={formData.desc}
            onChange={(e) => setFormData({...formData, desc: e.target.value})}
            required
          />
          <div className="flex justify-end gap-4 pt-6 mt-4">
             <button 
               type="button" 
               onClick={() => setIsModalOpen(false)}
               className="px-8 py-3 rounded-full text-[10px] font-black text-text-gray uppercase tracking-widest hover:text-text-charcoal hover:bg-background-neutral transition-all"
             >
               Cancel
             </button>
             <PrimaryButton type="submit" className="!px-12 !h-14 rounded-full shadow-2xl">
               Publish Event
             </PrimaryButton>
          </div>
        </form>
      </GlassModal>
    </SectionContainer>
  );
}

