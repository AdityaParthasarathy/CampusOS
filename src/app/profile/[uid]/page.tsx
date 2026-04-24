/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { MessageCircle, ArrowLeft, Briefcase, Users, MapPin } from 'lucide-react';

export default function PublicProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [teamPosts, setTeamPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Redirect to /profile if viewing own profile
  useEffect(() => {
    if (user && user.uid === uid) {
      router.replace('/profile');
    }
  }, [user, uid]);

  useEffect(() => {
    if (!uid || !db) return;

    const fetchProfile = async () => {
      try {
        // Fetch user doc
        const userSnap = await getDoc(doc(db!, 'users', uid));
        if (!userSnap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setProfileUser({ id: userSnap.id, ...userSnap.data() });

        // Fetch their projects
        const projectsSnap = await getDocs(
          query(collection(db!, 'projects'), where('creatorId', '==', uid))
        );
        setProjects(projectsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch their team posts
        const teamSnap = await getDocs(
          query(collection(db!, 'team_posts'), where('posterId', '==', uid))
        );
        setTeamPosts(teamSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching profile:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 border-4 border-primary-teal/10 border-t-primary-teal rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="text-7xl">👤</div>
        <h2 className="text-3xl font-black text-text-charcoal font-heading italic tracking-tighter">Profile not found</h2>
        <p className="text-text-gray font-medium">This user doesn't exist or may have deleted their account.</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-teal text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-6 space-y-10">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black text-text-gray uppercase tracking-widest hover:text-primary-teal transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-primary-teal/5 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Avatar */}
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-primary-teal/10 shadow-2xl shadow-primary-teal/10 shrink-0">
          <div className="w-full h-full rounded-full border-4 border-white overflow-hidden shadow-inner">
            <AvatarDisplay
              avatar={profileUser?.avatar}
              fallbackSeed={uid}
              className="w-full h-full !rounded-none !border-none"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-text-charcoal tracking-tighter font-heading italic leading-none mb-2">
              {profileUser?.name || 'RIT Student'}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary-teal uppercase tracking-[0.25em] bg-primary-teal/5 px-4 py-1.5 rounded-full border border-primary-teal/10">
                <Briefcase size={10} />
                {profileUser?.role || 'RIT Student'}
              </span>
              {profileUser?.branch && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-text-gray uppercase tracking-[0.2em] bg-background-neutral px-4 py-1.5 rounded-full">
                  <MapPin size={10} />
                  {profileUser.branch}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-text-gray font-medium leading-relaxed italic max-w-md mx-auto md:mx-0">
            &ldquo;{profileUser?.bio || 'Building the future at RIT.'}&rdquo;
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center md:justify-start gap-6 pt-2 border-t border-primary-teal/5">
            <div className="text-center">
              <div className="text-xl font-black text-text-charcoal">{projects.length}</div>
              <div className="text-[9px] font-bold text-text-gray uppercase tracking-widest">Projects</div>
            </div>
            <div className="w-px h-8 bg-primary-teal/10" />
            <div className="text-center">
              <div className="text-xl font-black text-text-charcoal">{teamPosts.length}</div>
              <div className="text-[9px] font-bold text-text-gray uppercase tracking-widest">Team Posts</div>
            </div>
          </div>

          {/* Actions */}
          {user && (
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                href={`/chat?user=${uid}&name=${encodeURIComponent(profileUser?.name || 'User')}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-teal text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_8px_20px_rgba(0,194,203,0.3)] hover:-translate-y-0.5"
              >
                <MessageCircle size={14} />
                Message
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile link copied! 📋');
                }}
                className="px-6 py-2.5 rounded-full bg-white border border-primary-teal/15 text-text-charcoal text-[10px] font-black uppercase tracking-widest hover:border-primary-teal/30 transition-all shadow-sm"
              >
                Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Projects Section */}
      {projects.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚀</span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-teal">
              Projects
            </h2>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary-teal/10 text-primary-teal">
              {projects.length}
            </span>
            <div className="flex-1 h-px bg-primary-teal/5" />
            <Link href="/projects" className="text-[9px] font-black uppercase tracking-widest text-primary-teal hover:opacity-70 transition-opacity">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
              <GlassCard
                key={project.id}
                className="!p-0 overflow-hidden border-primary-teal/5 bg-white hover:border-primary-teal/20 hover:shadow-[0_8px_25px_rgba(0,194,203,0.08)] transition-all group"
              >
                {project.imageUrl && (
                  <div className="h-32 overflow-hidden relative">
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
                  </div>
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-base text-text-charcoal group-hover:text-primary-teal transition-colors font-heading leading-tight">
                      {project.title}
                    </h3>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shrink-0 ${
                      project.status === 'Recruiting'
                        ? 'bg-secondary-coral text-white'
                        : 'bg-primary-teal text-white'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-gray font-medium line-clamp-2 leading-relaxed">{project.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack?.slice(0, 4).map((tech: string) => (
                      <span key={tech} className="text-[9px] font-black bg-background-neutral px-3 py-1 rounded-full text-text-charcoal uppercase tracking-wider">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Team Posts Section */}
      {teamPosts.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xl">🫂</span>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">
              Team Openings
            </h2>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-500">
              {teamPosts.length}
            </span>
            <div className="flex-1 h-px bg-primary-teal/5" />
            <Link href="/team-finder" className="text-[9px] font-black uppercase tracking-widest text-purple-500 hover:opacity-70 transition-opacity">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamPosts.map(post => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-purple-100 p-6 space-y-3 hover:border-purple-200 hover:shadow-[0_8px_25px_rgba(168,85,247,0.08)] transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-base text-text-charcoal group-hover:text-purple-500 transition-colors font-heading leading-tight">
                    {post.role || 'Team Opening'}
                  </h3>
                  <span className="text-[9px] font-black px-3 py-1 rounded-full bg-purple-50 text-purple-500 uppercase tracking-wider shrink-0">
                    Open
                  </span>
                </div>
                <p className="text-xs text-text-gray font-medium line-clamp-2 leading-relaxed">{post.desc}</p>
                {post.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.skills.slice(0, 4).map((skill: string) => (
                      <span key={skill} className="text-[9px] font-black bg-purple-50 px-3 py-1 rounded-full text-purple-500 uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state if no content */}
      {projects.length === 0 && teamPosts.length === 0 && (
        <div className="py-16 text-center space-y-4 opacity-60">
          <div className="text-6xl">✨</div>
          <p className="font-bold text-text-gray text-sm">
            {profileUser?.name?.split(' ')[0] || 'This student'} hasn&apos;t posted anything yet.
          </p>
        </div>
      )}
    </div>
  );
}
