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
import { collection, onSnapshot, addDoc, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Listing {
  id: string;
  title: string;
  price: string;
  description: string;
  seller: string;
  sellerId: string;
  icon: string;
  category: string;
  createdAt: string;
}

const DEMO_LISTINGS: Listing[] = [
  {
    id: 'demo-m1',
    title: 'Deep Learning (Ian Goodfellow) Textbook',
    price: '1200',
    description: 'Original hardcover copy in perfect condition. Essential for CS students taking the Neural Networks elective.',
    seller: 'Rahul Sharma',
    sellerId: 'demo-user-1',
    icon: '📖',
    category: 'Books',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-m2',
    title: 'Keychron K2 Mechanical Keyboard',
    price: '4500',
    description: 'Wireless mechanical keyboard with Gateron Blue switches. Barely used, comes with original box and cable.',
    seller: 'Sneha Reddy',
    sellerId: 'demo-user-2',
    icon: '⌨️',
    category: 'Electronics',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-m3',
    title: 'MATLAB & Simulink Tutoring',
    price: '300',
    description: '1-on-1 tutoring sessions for MATLAB/Simulink assignments. Special focus on EEE/ECE systems modelling.',
    seller: 'Karthik Murali',
    sellerId: 'demo-user-3',
    icon: '📈',
    category: 'Services',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-m4',
    title: 'Complete Lab Manual Set (SEM 1&2)',
    price: '200',
    description: 'Printed and annotated lab manuals for Physics, Chemistry, and Basic Engineering labs. Very useful for rituals!',
    seller: 'Priya Krishnan',
    sellerId: 'demo-user-4',
    icon: '🔬',
    category: 'Study Material',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-m5',
    title: 'Professional Drafter & Geometry Kit',
    price: '800',
    description: 'Complete set for Engineering Graphics. Includes mini-drafter, compass set, and pro-circle. RIT regulation approved.',
    seller: 'Arjun Vyas',
    sellerId: 'demo-user-5',
    icon: '📐',
    category: 'Other',
    createdAt: new Date().toISOString()
  }
];

export default function MarketplacePage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>(DEMO_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMyItems, setShowMyItems] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Electronics',
    icon: '📦'
  });

  useEffect(() => {
    if (!db) {
      setListings(DEMO_LISTINGS);
      setLoading(false);
      return;
    }

    console.log("🔍 [Firestore] Querying marketplace listings. DB instance:", db);
    const q = query(collection(db!, "marketplace"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbListings = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Listing));
      setListings([...dbListings, ...DEMO_LISTINGS]);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePostListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!db) {
      alert("Database connection required to post listings.");
      return;
    }

    try {
      if (editingId) {
        console.log("🔍 [Firestore] Updating marketplace listing:", editingId);
        const docRef = doc(db!, "marketplace", editingId);
        await updateDoc(docRef, sanitizeData({ ...formData }));
        alert("Listing updated!");
      } else {
        console.log("🔍 [Firestore] Adding new marketplace listing...");
        const listingData = {
          ...formData,
          seller: userData?.name || user.displayName || "Anonymous",
          sellerId: user.uid,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db!, "marketplace"), sanitizeData(listingData));
        alert("Listing posted successfully!");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', price: '', description: '', category: 'Electronics', icon: '📦' });
    } catch (error) {
      console.error("Error saving listing:", error);
      alert("Failed to save listing.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) {
      alert("Database connection required to delete listings.");
      return;
    }
    if (!confirm("Delete this listing?")) return;
    try {
      console.log("🔍 [Firestore] Deleting marketplace listing:", id);
      await deleteDoc(doc(db!, "marketplace", id));
      alert("Listing deleted.");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (item: Listing) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      price: item.price,
      description: item.description,
      category: item.category,
      icon: item.icon
    });
    setIsModalOpen(true);
  };

  const handleContact = (item: Listing) => {
    const confirmWhatsApp = confirm(`Do you want to contact ${item.seller} via WhatsApp?`);
    if (confirmWhatsApp) {
      window.open(`https://wa.me/919876543210?text=Hi ${item.seller}, I'm interested in your ${item.title} on CampusOS!`, '_blank');
    } else {
      alert(`Contact ${item.seller} at: ${item.seller.replace(' ', '.').toLowerCase()}@rit.edu.in`);
    }
  };

  const filteredListings = showMyItems 
    ? listings.filter(l => l.sellerId === user?.uid)
    : listings;

  return (
    <SectionContainer className="bg-background-neutral min-h-screen">
      <div className="space-y-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary-teal/5 border border-primary-teal/10 text-[10px] font-black text-secondary-coral tracking-[0.3em] uppercase">
              Student Trade Hub
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-text-charcoal tracking-tighter font-heading italic leading-none">Marketplace</h1>
            <p className="text-xl text-text-gray max-w-xl font-bold leading-relaxed">Buy, sell, or trade within the RIT student community. Secure, fast, and local.</p>
          </div>
          
          <div className="flex bg-white/80 backdrop-blur-xl p-2 rounded-full border border-primary-teal/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] w-full md:w-auto">
             <button 
               onClick={() => setShowMyItems(false)}
               className={`flex-1 md:px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                 !showMyItems 
                  ? 'bg-primary-teal text-white shadow-[0_10px_20px_rgba(0,194,203,0.3)]' 
                  : 'text-text-gray hover:text-primary-teal hover:bg-primary-teal/5'
               }`}
             >
               Buy
             </button>
             <button 
               onClick={() => {
                 if (!user) return router.push('/login');
                 setShowMyItems(true);
               }}
               className={`flex-1 md:px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                 showMyItems 
                  ? 'bg-secondary-coral text-white shadow-[0_10px_20px_rgba(255,107,107,0.3)]' 
                  : 'text-text-gray hover:text-secondary-coral hover:bg-secondary-coral/5'
               }`}
             >
               My Items
             </button>
             <button 
               onClick={() => user ? setIsModalOpen(true) : router.push('/login')}
               className="flex-1 md:px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-teal border border-primary-teal/20 hover:bg-primary-teal hover:text-white transition-all ml-2 shadow-sm"
             >
               Sell +
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {loading ? (
             <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-8">
               <div className="w-16 h-16 border-4 border-primary-teal/10 border-t-primary-teal rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-text-gray tracking-[0.3em] uppercase animate-pulse">Fetching campus listings...</p>
             </div>
          ) : filteredListings.length > 0 ? filteredListings.map((item) => (
            <GlassCard key={item.id} className="group overflow-hidden p-0 h-full flex flex-col border-white hover:border-primary-teal/30 bg-white transition-all duration-700 hover:scale-[1.03] shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_rgba(0,194,203,0.12)]">
              <div className="h-64 bg-gradient-to-br from-primary-teal/5 via-secondary-coral/5 to-primary-teal/10 flex items-center justify-center text-8xl relative overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-teal/10 blur-[60px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-coral/10 blur-[50px] rounded-full"></div>
                
                <span className="relative z-10 group-hover:scale-125 transition-transform duration-1000 animate-float-card drop-shadow-2xl">{item.icon || '📦'}</span>
                
                <div className="absolute top-5 left-5">
                  <span className="px-5 py-2 bg-white/95 backdrop-blur-xl text-[10px] font-black text-primary-teal rounded-full border border-primary-teal/10 uppercase tracking-widest shadow-sm group-hover:bg-primary-teal group-hover:text-white transition-all">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 space-y-8 flex-1 flex flex-col">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-3xl font-black text-text-charcoal group-hover:text-primary-teal transition-colors line-clamp-1 tracking-tighter font-heading italic leading-none">{item.title || 'Untitled Item'}</h3>
                    <span className="text-3xl font-black text-secondary-coral italic tracking-tighter">₹{item.price || '0'}</span>
                  </div>
                  <p className="text-text-gray leading-relaxed font-bold text-sm line-clamp-2">{item.description || 'No description provided.'}</p>
                </div>

                <div className="pt-8 border-t border-primary-teal/5 mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background-neutral border-2 border-primary-teal/10 flex items-center justify-center text-xs shadow-inner">👤</div>
                    <span className="text-[10px] font-black text-text-gray uppercase tracking-widest italic">By {item.seller || 'Member'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {user && item.sellerId === user.uid && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2.5 text-primary-teal hover:bg-primary-teal/10 rounded-full transition-all border border-transparent hover:border-primary-teal/20" title="Edit">✏️</button>
                        <button onClick={() => handleDelete(item.id)} className="p-2.5 text-secondary-coral hover:bg-secondary-coral/10 rounded-full transition-all border border-transparent hover:border-secondary-coral/20" title="Delete">🗑️</button>
                      </div>
                    )}
                    <button 
                      onClick={() => handleContact(item)}
                      className="text-white font-black text-[10px] bg-primary-teal hover:scale-110 px-8 py-3 rounded-full transition-all duration-300 tracking-[0.2em] uppercase cursor-pointer shadow-[0_10px_20px_rgba(0,194,203,0.3)]"
                    >
                      Contact →
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          )) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-primary-teal/10 shadow-inner">
               <div className="text-8xl mb-8 animate-float-card">🏜️</div>
               <h3 className="text-4xl font-black text-text-charcoal mb-4 font-heading italic tracking-tighter">No listings found</h3>
               <p className="text-text-gray font-bold uppercase tracking-widest text-xs">Try a different filter or post your first item!</p>
            </div>
          )}
        </div>
      </div>

      <GlassModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ title: '', price: '', description: '', category: 'Electronics', icon: '📦' });
        }} 
        title={editingId ? "Edit Listing" : "Post New Item"}
      >
        <form onSubmit={handlePostListing} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassInput 
              label="Item Name"
              placeholder="e.g. DBMS Textbook"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <GlassInput 
              label="Price (₹)"
              placeholder="e.g. 500"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
              type="number"
            />
          </div>
          <GlassTextArea 
            label="Condition & Details"
            placeholder="Tell us why it's a great deal..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-gray ml-2 uppercase tracking-[0.2em]">Category</label>
              <select 
                className="w-full bg-background-neutral border border-primary-teal/10 rounded-2xl px-6 py-4 text-text-charcoal font-black uppercase tracking-widest text-xs focus:outline-none focus:ring-4 focus:ring-primary-teal/5 focus:border-primary-teal/30 focus:bg-white transition-all shadow-inner"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {['Electronics', 'Books', 'Services', 'Study Material', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <GlassInput 
              label="Emoji (Visual)"
              placeholder="e.g. 📦, 💻, 📖"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-4 pt-6 mt-4">
             <button 
               type="button" 
               onClick={() => setIsModalOpen(false)}
               className="px-8 py-3 rounded-full text-[10px] font-black text-text-gray uppercase tracking-widest hover:bg-background-neutral transition-all"
             >
               Cancel
             </button>
             <PrimaryButton type="submit" className="!px-12 !h-14 rounded-full shadow-2xl">
               {editingId ? "Update Listing" : "Post Listing"}
             </PrimaryButton>
          </div>
        </form>
      </GlassModal>
    </SectionContainer>
  );
}
