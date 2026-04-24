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
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import { db, sanitizeData } from '@/lib/firebase';
import Link from 'next/link';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const DEMO_PROJECTS = [
  {
    id: 'demo-1',
    title: 'AI Study Companion',
    desc: 'An AI-powered tool specifically trained on RIT lecture slides to help students generate summaries and mock quizzes.',
    stack: ['Python', 'OpenAI', 'React'],
    creatorName: 'Aditya P',
    creatorId: 'demo-user-1',
    createdAt: new Date().toISOString(),
    members: ['Aditya P', 'Rahul S'],
    status: 'Active',
    applicants: []
  },
  {
    id: 'demo-2',
    title: 'Smart Campus Map',
    desc: 'Real-time navigation system for the RIT campus including indoor mapping for Lab Block and Academic Block.',
    stack: ['Next.js', 'Leaflet', 'Firebase'],
    creatorName: 'Sneha Rao',
    creatorId: 'demo-user-2',
    createdAt: new Date().toISOString(),
    members: ['Sneha Rao'],
    status: 'Recruiting',
    applicants: []
  },
  {
    id: 'demo-3',
    title: 'RIT Food Share',
    desc: 'To reduce food waste on campus, this app notifies students when there is excess food available after club events or seminars.',
    stack: ['React Native', 'Firebase'],
    creatorName: 'Karthik M',
    creatorId: 'demo-user-3',
    createdAt: new Date().toISOString(),
    members: ['Karthik M', 'Priya K', 'Arjun V'],
    status: 'Active',
    applicants: []
  },
  {
    id: 'demo-4',
    title: 'Alumni Mentorship Connect',
    desc: 'Direct bridge between current RIT students and successful alumni working in Tier-1 companies for career guidance.',
    stack: ['Node.js', 'PostgreSQL', 'Tailwind'],
    creatorName: 'Meera Iyer',
    creatorId: 'demo-user-4',
    createdAt: new Date().toISOString(),
    members: ['Meera Iyer', 'Vikram S'],
    status: 'Active',
    applicants: []
  }
];

export default function ProjectsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>(DEMO_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    stack: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (!db) {
      setProjects(DEMO_PROJECTS);
      setLoading(false);
      return;
    }

    console.log("🔍 [Firestore] Querying projects. DB instance:", db);
    const q = query(collection(db!, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbProjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Merge Firestore data with DEMO_PROJECTS, filter out duplicates if user deleted demo projects (simplified)
      setProjects([...dbProjects, ...DEMO_PROJECTS]);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!db) {
      alert("Database connection required for this action. App is in Safe Mode.");
      return;
    }

    try {
      const payload = {
        ...formData,
        stack: formData.stack.split(',').map(s => s.trim())
      };

      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), sanitizeData(payload));
        alert("Project updated!");
      } else {
        const projectData = {
          ...payload,
          creatorId: user.uid,
          creatorName: userData?.name || user.displayName,
          createdAt: new Date().toISOString(),
          members: [userData?.name || user.displayName],
          applicants: [],
          status: 'Active'
        };
        await addDoc(collection(db, "projects"), sanitizeData(projectData));
        alert("Project launched!");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', desc: '', stack: '', imageUrl: '' });
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project.");
    }
  };

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      desc: project.desc,
      stack: project.stack?.join(', ') || '',
      imageUrl: project.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleApply = async (projectId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!db) {
      alert("Database connection required to partner up.");
      return;
    }
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, sanitizeData({
        applicants: arrayUnion({
          uid: user.uid,
          name: userData?.name || user.displayName,
          status: 'pending'
        })
      }));
      alert("Application sent!");
    } catch (error) {
      console.error("Error applying:", error);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!db) {
      alert("Database connection required to delete items.");
      return;
    }
    if (!confirm("Delete project?")) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <SectionContainer className="bg-background-neutral min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary-teal/5 border border-primary-teal/10 text-[10px] font-black text-secondary-coral tracking-[0.3em] uppercase">
            Build The Future
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-text-charcoal tracking-tighter font-heading italic leading-none">Project Hub</h1>
          <p className="text-xl text-text-gray max-w-2xl font-bold leading-relaxed">Launch your next big idea or join elite campus builds with the RIT developer community.</p>
        </div>
        <PrimaryButton 
          onClick={() => user ? setIsModalOpen(true) : router.push('/login')}
          className="!h-16 !px-12 rounded-full shadow-2xl !w-full md:!w-auto"
        >
          Launch Project
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-8">
            <div className="w-16 h-16 border-4 border-primary-teal/10 border-t-primary-teal rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-text-gray tracking-[0.3em] uppercase animate-pulse">Syncing with campus data...</p>
          </div>
        ) : projects.length > 0 ? projects.map((project) => (
          <GlassCard key={project.id} className="group border-white hover:border-primary-teal/30 bg-white hover:scale-[1.03] transition-all duration-700 flex flex-col h-full relative overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_rgba(0,194,203,0.12)] !p-0">
            {project.imageUrl && (
              <div className="w-full h-44 overflow-hidden relative shrink-0">
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
              </div>
            )}
            <div className="p-8 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-8">
              <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-5 py-2 rounded-full border shadow-sm transition-all ${
                project.status === 'Active' ? 'bg-primary-teal text-white border-primary-teal' : 
                'bg-secondary-coral text-white border-secondary-coral'
              }`}>
                {project.status}
              </span>
              {user && project.creatorId === user.uid && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleEdit(project)}
                    className="w-10 h-10 rounded-full bg-background-neutral text-primary-teal hover:bg-primary-teal hover:text-white transition-all border border-primary-teal/5 shadow-sm flex items-center justify-center font-bold text-lg"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="w-10 h-10 rounded-full bg-background-neutral text-secondary-coral hover:bg-secondary-coral hover:text-white transition-all border border-secondary-coral/5 shadow-sm flex items-center justify-center font-bold text-lg"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-3xl font-black text-text-charcoal group-hover:text-primary-teal transition-colors mb-4 tracking-tighter font-heading italic leading-none">
              {project.title}
            </h3>
            
            <p className="text-text-gray leading-relaxed font-bold text-sm mb-10 flex-1 line-clamp-3">
              {project.desc}
            </p>
            
            <div className="space-y-8 pt-8 border-t border-primary-teal/5 mt-auto">
              <div className="flex flex-wrap gap-2.5">
                {project.stack?.map((tech: string) => (
                  <span key={tech} className="text-[10px] font-black bg-background-neutral border border-primary-teal/5 px-4 py-2 rounded-full text-text-charcoal tracking-widest uppercase shadow-sm group-hover:bg-primary-teal/5 group-hover:border-primary-teal/20 transition-all">
                    {tech}
                  </span>
                )) || <span className="text-[10px] text-text-gray font-bold italic tracking-widest uppercase">Building...</span>}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {project.members?.slice(0, 3).map((m: string, idx: number) => (
                      <div key={idx} className="w-10 h-10 rounded-full bg-white border-2 border-primary-teal/10 flex items-center justify-center text-[10px] font-black text-text-charcoal shadow-md ring-2 ring-white">
                        {m?.[0] || '?'}
                      </div>
                    ))}
                    {project.members && project.members.length > 3 && (
                      <div className="w-10 h-10 rounded-full bg-background-neutral border-2 border-white flex items-center justify-center text-[10px] font-black text-primary-teal shadow-md ring-2 ring-white">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  {project.creatorId && !project.id.startsWith('demo-') && (
                    <Link
                      href={`/profile/${project.creatorId}`}
                      className="text-[9px] font-black text-text-gray uppercase tracking-widest hover:text-primary-teal transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      by {project.creatorName}
                    </Link>
                  )}
                </div>
                
                {project.applicants?.some((a: any) => a.uid === user?.uid) ? (
                   <span className="text-[10px] font-black text-primary-teal uppercase tracking-[0.2em] bg-primary-teal/10 px-6 py-3 rounded-full border border-primary-teal/20 shadow-inner">Applied</span>
                ) : (
                  <button 
                    onClick={() => handleApply(project.id)}
                    className="flex-shrink-0 px-8 py-3 rounded-full bg-primary-teal text-[10px] font-black text-white hover:scale-110 active:scale-95 transition-all uppercase tracking-[0.2em] cursor-pointer shadow-[0_10px_25px_rgba(0,194,203,0.3)] hover:shadow-[0_15px_35px_rgba(0,194,203,0.4)]"
                  >
                    Partner Up →
                  </button>
                )}
              </div>
            </div>
            </div>
          </GlassCard>
        )) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-primary-teal/10 shadow-inner">
             <div className="text-8xl mb-8 animate-float-card">🚀</div>
             <h3 className="text-4xl font-black text-text-charcoal mb-4 font-heading italic tracking-tighter">No projects available</h3>
             <p className="text-text-gray font-bold uppercase tracking-widest text-xs">Be the first to launch a legacy at RIT!</p>
          </div>
        )}
      </div>

      <GlassModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ title: '', desc: '', stack: '', imageUrl: '' });
        }} 
        title={editingId ? "Edit Project" : "Launch Your Build"}
      >
        <form onSubmit={handleSaveProject} className="space-y-8">
          <GlassInput 
            label="Project Name"
            placeholder="e.g. CampusOS RIT"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <GlassTextArea 
            label="What's the vision?"
            placeholder="Share the mission. Keep it bold."
            value={formData.desc}
            onChange={(e) => setFormData({...formData, desc: e.target.value})}
            required
          />
          <GlassInput
            label="Tech Stack (comma separated)"
            placeholder="Next.js, Tailwind, AI"
            value={formData.stack}
            onChange={(e) => setFormData({...formData, stack: e.target.value})}
            required
          />
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData({...formData, imageUrl: url})}
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
               {editingId ? "Update Project" : "Launch Project"}
             </PrimaryButton>
          </div>
        </form>
      </GlassModal>
    </SectionContainer>
  );
}
