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
import { GlassModal } from '@/components/ui/GlassModal';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassTextArea } from '@/components/ui/GlassTextArea';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { db, sanitizeData } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function KnowledgeHubPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = ['Notes', 'Tutorials', 'PYQs', 'Lab Guides'];
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    console.log("🔍 [Firestore] Querying knowledge resources. DB instance:", db);
    const q = query(collection(db!, "resources"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resourcesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResources(resourcesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!db) {
      alert("Database connection required to share resources.");
      return;
    }
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim().toLowerCase()),
      };

      if (editingId) {
        await updateDoc(doc(db, "resources", editingId), sanitizeData(payload));
        alert("Resource updated!");
      } else {
        const resourceData = {
          ...payload,
          uploaderId: user.uid,
          uploaderName: userData?.name || user.displayName,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, "resources"), sanitizeData(resourceData));
        alert("Resource shared!");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', link: '', description: '', tags: '' });
    } catch (error) {
      console.error("Error saving resource:", error);
      alert("Failed to save resource.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) {
      alert("Database connection required to delete resources.");
      return;
    }
    if (!confirm("Delete resource?")) return;
    try {
      await deleteDoc(doc(db, "resources", id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (res: any) => {
    setEditingId(res.id);
    setFormData({
      title: res.title,
      link: res.link,
      description: res.description,
      tags: res.tags?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = (res.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (Array.isArray(res.tags) && res.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = !activeCategory || (Array.isArray(res.tags) && res.tags.some((tag: string) => 
      tag.toLowerCase().includes(activeCategory.toLowerCase()) || 
      activeCategory.toLowerCase().includes(tag.toLowerCase())
    ));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <SectionContainer className="bg-background-neutral min-h-screen">
      <div className="space-y-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary-teal/5 border border-primary-teal/10 text-[10px] font-black text-secondary-coral tracking-[0.3em] uppercase">
              Academic Repository
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-text-charcoal tracking-tighter font-heading italic leading-none">Knowledge Hub</h1>
            <p className="text-xl text-text-gray max-w-xl font-bold leading-relaxed">Access curated RIT study materials, lab guides, and previous year legacies.</p>
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-6">
             <div className="relative flex-1 sm:min-w-[350px]">
                <GlassInput 
                  placeholder="Search materials or tags..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 h-16 rounded-full shadow-inner"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-40">🔍</span>
             </div>
             <PrimaryButton 
               onClick={() => user ? setIsModalOpen(true) : router.push('/login')}
               className="!h-16 !px-12 rounded-full shadow-2xl whitespace-nowrap"
             >
               Share Knowledge
             </PrimaryButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {categories.map(cat => (
             <GlassCard 
               key={cat} 
               onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
               className={`group cursor-pointer border-2 transition-all duration-500 flex flex-col items-center text-center p-10 rounded-[3rem] ${
                 activeCategory === cat 
                   ? 'border-primary-teal bg-primary-teal shadow-[0_20px_40px_rgba(0,194,203,0.3)] scale-105' 
                   : 'border-white bg-white hover:border-primary-teal/30 shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:-translate-y-2'
               }`}
             >
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mb-6 transition-all duration-500 shadow-inner ${
                  activeCategory === cat ? 'bg-white/20' : 'bg-background-neutral group-hover:bg-primary-teal/10'
                }`}>
                  {cat === 'Notes' ? '📝' : cat === 'Tutorials' ? '📺' : cat === 'PYQs' ? '📄' : '🔬'}
                </div>
                <h3 className={`text-xl font-black font-heading italic tracking-tighter transition-colors ${activeCategory === cat ? 'text-white' : 'text-text-charcoal group-hover:text-primary-teal'}`}>{cat}</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 transition-colors ${activeCategory === cat ? 'text-white/80' : 'text-text-gray group-hover:text-primary-teal/60'}`}>
                  {activeCategory === cat ? 'Selected' : 'Explore'}
                </p>
             </GlassCard>
           ))}
        </div>

        <div className="space-y-12 pt-10">
           <div className="flex items-center justify-between border-b-2 border-primary-teal/5 pb-8">
              <h2 className="text-4xl font-black text-text-charcoal tracking-tighter font-heading italic">Recent Additions</h2>
              <span className="text-[10px] font-black text-text-gray uppercase tracking-[0.3em] bg-background-neutral px-6 py-2 rounded-full border border-primary-teal/5">{filteredResources.length} Results Found</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {loading ? (
                 <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-8">
                   <div className="w-16 h-16 border-4 border-primary-teal/10 border-t-primary-teal rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-text-gray tracking-[0.3em] uppercase animate-pulse">Syncing knowledge base...</p>
                 </div>
              ) : filteredResources.map(res => (
                <GlassCard key={res.id} className="group border-white hover:border-primary-teal/30 bg-white hover:scale-[1.03] transition-all duration-700 flex flex-col h-full relative overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_rgba(0,194,203,0.12)]">
                   <div className="flex justify-between items-start mb-10">
                      <div className="flex gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-background-neutral border border-primary-teal/10 flex items-center justify-center text-3xl shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            📚
                         </div>
                         {user && res.uploaderId === user.uid && (
                            <div className="flex gap-2">
                               <button onClick={() => handleEdit(res)} className="w-10 h-10 rounded-full bg-background-neutral text-primary-teal hover:bg-primary-teal/10 transition-all border border-primary-teal/5 shadow-sm flex items-center justify-center font-bold" title="Edit">✏️</button>
                               <button onClick={() => handleDelete(res.id)} className="w-10 h-10 rounded-full bg-background-neutral text-secondary-coral hover:bg-secondary-coral/10 transition-all border border-secondary-coral/5 shadow-sm flex items-center justify-center font-bold" title="Delete">🗑️</button>
                            </div>
                         )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end max-w-[150px]">
                        {Array.isArray(res.tags) && res.tags.slice(0, 2).map((tag: string) => (
                           <span key={tag} className="text-[9px] font-black text-primary-teal bg-primary-teal/5 border border-primary-teal/10 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm group-hover:bg-primary-teal group-hover:text-white transition-all">
                             {tag}
                           </span>
                        ))}
                      </div>
                   </div>

                   <h3 className="text-2xl font-black text-text-charcoal group-hover:text-primary-teal transition-colors mb-4 line-clamp-2 leading-none font-heading italic tracking-tighter">
                      {res.title}
                   </h3>

                   <p className="text-text-gray text-sm font-bold leading-relaxed mb-10 flex-1 line-clamp-3 italic">
                      "{res.description}"
                   </p>

                   <div className="space-y-6 pt-8 border-t border-primary-teal/5 mt-auto">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                         <span className="text-text-gray italic">Contributor: <span className="text-text-charcoal not-italic font-black">{res.uploaderName}</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-primary-teal tracking-[0.2em]">{new Date(res.createdAt).toLocaleDateString()}</span>
                         <a 
                           href={res.link} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="px-8 py-3 bg-primary-teal text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-110 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,194,203,0.3)]"
                         >
                            View Source →
                         </a>
                      </div>
                   </div>
                </GlassCard>
              ))}
           </div>
        </div>
      </div>

      <GlassModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ title: '', link: '', description: '', tags: '' });
        }} 
        title={editingId ? "Edit Knowledge" : "Share Knowledge"}
      >
        <form onSubmit={handleSaveResource} className="space-y-8">
          <GlassInput 
            label="Resource Name"
            placeholder="e.g. OS Unit 3 Hand-drawn Notes"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <GlassInput 
            label="Access Link (Drive/GitHub)"
            placeholder="https://drive.google.com/..."
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            required
            type="url"
          />
          <GlassTextArea 
            label="Details & How it helps"
            placeholder="Briefly describe the treasure you're sharing."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
          <GlassInput 
            label="Keywords (comma separated)"
            placeholder="Notes, CS, OS, Sem 4"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            required
          />
          <div className="flex justify-end gap-4 pt-6 mt-4">
             <button 
               type="button" 
               onClick={() => setIsModalOpen(false)}
               className="px-8 py-3 rounded-full text-[10px] font-black text-text-gray uppercase tracking-widest hover:bg-background-neutral transition-all"
             >
               Cancel
             </button>
             <PrimaryButton type="submit" className="!px-12 !h-14 rounded-full shadow-2xl">
               {editingId ? "Update Resource" : "Publish Resource"}
             </PrimaryButton>
          </div>
        </form>
      </GlassModal>
    </SectionContainer>
  );
}
