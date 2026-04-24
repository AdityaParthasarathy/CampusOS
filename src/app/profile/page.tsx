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
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { AvatarBuilder } from '@/components/ui/AvatarBuilder';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';

export default function ProfilePage() {
  const { user, userData, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  // Edit Form State
  const [editData, setEditData] = useState({
    name: '',
    role: '',
    bio: '',
    avatar: null as any
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !db) return;

    // Fetch User's Created Projects
    const projectsQuery = query(collection(db!, "projects"), where("creatorId", "==", user.uid));
    const unsubProjects = onSnapshot(projectsQuery, (snap) => {
      setUserProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (error.code !== 'permission-denied') console.error('Projects snapshot error:', error);
    });

    // Fetch User's Created Team Posts
    const postsQuery = query(collection(db!, "team_posts"), where("posterId", "==", user.uid));
    const unsubPosts = onSnapshot(postsQuery, (snap) => {
      setUserPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (error.code !== 'permission-denied') console.error('Team posts snapshot error:', error);
    });

    // Initialize Edit Data
    if (userData) {
      setEditData({
        name: userData.name || '',
        role: userData.role || '',
        bio: userData.bio || '',
        avatar: userData.avatar || null
      });
    }

    return () => {
      unsubProjects();
      unsubPosts();
    };
  }, [user, userData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    try {
      await updateDoc(doc(db!, "users", user.uid), sanitizeData({
        ...editData,
        updatedAt: new Date().toISOString()
      }));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Profile link copied to clipboard! 📋");
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
      router.push('/login');
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-6 mb-16">
        <div 
          onClick={() => setIsEditModalOpen(true)}
          className="w-32 h-32 md:w-44 md:h-44 rounded-full ring-4 ring-primary-teal/10 cursor-pointer group hover:scale-105 transition-all duration-700 shadow-2xl shadow-primary-teal/10"
        >
          <div className="w-full h-full rounded-full border-4 border-white flex overflow-hidden shadow-inner">
            <AvatarDisplay avatar={userData?.avatar || user.photoURL} fallbackSeed={user.uid} className="w-full h-full !rounded-none !border-none" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-text-charcoal tracking-tighter font-heading italic">
            {userData?.name || user.displayName}
          </h1>
          <p className="text-primary-teal font-black uppercase tracking-[0.3em] text-[10px] bg-primary-teal/5 px-4 py-1.5 rounded-full inline-block">
            {userData?.role || "RIT Student"}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <PrimaryButton 
            onClick={() => setIsEditModalOpen(true)}
            className="!px-8 !h-12 rounded-full shadow-[0_10px_30px_rgba(0,194,203,0.3)]"
          >
            Edit Profile
          </PrimaryButton>
          <PrimaryButton 
            onClick={() => setIsAvatarModalOpen(true)}
            className="!px-8 !h-12 rounded-full bg-secondary-coral hover:bg-secondary-coral/90 shadow-[0_10px_30px_rgba(255,107,107,0.3)]"
          >
            Customize Avatar
          </PrimaryButton>
          <button 
            onClick={handleCopyProfile}
            className="btn-rounded bg-white text-text-charcoal border border-primary-teal/10 shadow-sm hover:border-primary-teal/30"
          >
            Share Profile
          </button>
        </div>

        <p className="max-w-md text-text-gray font-bold italic leading-relaxed text-sm">
          "{userData?.bio || "No biography added yet. Building the future at RIT."}"
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-12 border-y border-primary-teal/5 py-8">
        <div className="text-center">
          <div className="text-2xl font-black text-text-charcoal">{userProjects.length}</div>
          <div className="text-[10px] font-bold text-text-gray uppercase tracking-widest">Projects</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-text-charcoal">{userPosts.length}</div>
          <div className="text-[10px] font-bold text-text-gray uppercase tracking-widest">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-text-charcoal">0</div>
          <div className="text-[10px] font-bold text-text-gray uppercase tracking-widest">Followers</div>
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="space-y-12">
        <div className="space-y-6">
          <h2 className="text-xl font-black text-text-charcoal uppercase tracking-widest border-b border-primary-teal/10 pb-2">Active Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProjects.map(project => (
              <GlassCard key={project.id} className="!p-6 border-primary-teal/5 bg-white/40">
                <h4 className="text-lg font-black text-text-charcoal mb-2 font-heading">{project.title}</h4>
                <p className="text-sm text-text-gray line-clamp-2">{project.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-20 flex justify-center">
        <button 
          onClick={handleLogout}
          className="text-xs font-black text-secondary-coral uppercase tracking-[0.3em] hover:opacity-70"
        >
          Logout Account
        </button>
      </div>

      <GlassModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Profile"
      >
        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
          <form onSubmit={handleUpdateProfile} className="space-y-6 pb-8">
            <GlassInput 
              label="Name"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              required
            />
            <GlassInput 
              label="Role"
              value={editData.role}
              onChange={(e) => setEditData({...editData, role: e.target.value})}
              required
            />
            <GlassTextArea 
              label="Bio"
              value={editData.bio}
              onChange={(e) => setEditData({...editData, bio: e.target.value})}
              required
            />
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 btn-rounded bg-black/5 text-text-gray"
              >
                Cancel
              </button>
              <PrimaryButton type="submit" className="flex-[2] !rounded-full">
                Save Changes
              </PrimaryButton>
            </div>
          </form>
        </div>
      </GlassModal>

      {/* Avatar Customization Modal */}
      <GlassModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
        title="Customize Avatar"
      >
        <div className="space-y-8 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar no-scrollbar pb-8">
          <AvatarBuilder onSave={async (state) => {
            if (!user || !db) return;
            try {
              setIsAvatarModalOpen(false);
              await updateDoc(doc(db, "users", user.uid), {
                avatar: state,
                updatedAt: new Date().toISOString()
              });
            } catch (err) {
              console.error("Failed to update avatar", err);
            }
          }} />
        </div>
      </GlassModal>
    </div>
  );
}
