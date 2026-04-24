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
  deleteDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  setDoc,
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const DEMO_POSTS = [
  {
    id: 'demo-p1',
    name: 'Rahul Sharma',
    role: 'Full Stack Developer',
    skills: ['React', 'Node.js', 'MongoDB'],
    description: 'Looking to join a hackathon team. I can handle both frontend and backend. Love building performance-focused apps.',
    creatorId: 'demo-user-1',
    createdAt: new Date().toISOString(),
    applicants: []
  },
  {
    id: 'demo-p2',
    name: 'Sneha Reddy',
    role: 'UI/UX Designer',
    skills: ['Figma', 'Adobe XD', 'CSS'],
    description: 'Specializing in premium glassmorphism designs. Available for projects that need a high-end visual touch.',
    creatorId: 'demo-user-2',
    createdAt: new Date().toISOString(),
    applicants: []
  },
  {
    id: 'demo-p3',
    name: 'Karthik Murali',
    role: 'ML Engineer',
    skills: ['Python', 'PyTorch', 'TensorFlow'],
    description: 'Interested in computer vision and campus automation projects. I have experience with real-time detection systems.',
    creatorId: 'demo-user-3',
    createdAt: new Date().toISOString(),
    applicants: []
  },
  {
    id: 'demo-p4',
    name: 'Priya Krishnan',
    role: 'Product Manager',
    skills: ['Agile', 'Jira', 'Pitch Strategy'],
    description: 'Let me handle the project organization and the final presentation while you focus on the code. 10x Hackathon winner.',
    creatorId: 'demo-user-4',
    createdAt: new Date().toISOString(),
    applicants: []
  }
];

const TeamPostCard = ({ post, user, userData, handleEdit, handleDelete }: any) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const isOwner = user && (user.uid === post.posterId || user.uid === post.creatorId);

  useEffect(() => {
    if (!db || !post.id) return;
    const q = query(collection(db, `team_posts/${post.id}/requests`), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (error.code !== 'permission-denied') console.error('Requests snapshot error:', error);
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    try {
      await setDoc(doc(db, `team_posts/${post.id}/requests`, user.uid), sanitizeData({
        requesterId: user.uid,
        requesterName: userData?.name || user.displayName || "Anonymous",
        requesterPhotoURL: userData?.avatar || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        message: requestMessage.trim(),
        status: "pending",
        createdAt: serverTimestamp()
      }));
      setShowRequestModal(false);
      setRequestMessage("");
      alert("Join request sent!");

      const targetId = post.posterId || post.creatorId;
      if (targetId && targetId !== user.uid) {
         const senderPhoto = typeof userData?.avatar === 'string'
           ? userData.avatar
           : user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;
         await addDoc(collection(db, `users/${targetId}/notifications`), sanitizeData({
           type: 'request',
           message: `${userData?.name || user.displayName || 'Someone'} requested to join your team for "${post.role}"`,
           relatedId: post.id,
           senderId: user.uid,
           senderName: userData?.name || user.displayName || "Anonymous",
           senderPhotoURL: senderPhoto,
           isRead: false,
           createdAt: serverTimestamp()
         }));
      }
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Failed to send request.");
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, requesterId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, `team_posts/${post.id}/requests`, requestId), sanitizeData({
        status: newStatus
      }));
      if (newStatus === "accepted") {
        await updateDoc(doc(db, "team_posts", post.id), sanitizeData({
          members: arrayUnion({ uid: requesterId })
        }));
        const ownerPhoto = typeof userData?.avatar === 'string'
          ? userData.avatar
          : user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || '1'}`;
        await addDoc(collection(db, `users/${requesterId}/notifications`), sanitizeData({
           type: 'accepted',
           message: `Your request for "${post.role}" was accepted by ${userData?.name || user.displayName || 'the owner'}!`,
           relatedId: post.id,
           senderId: user?.uid || "system",
           senderName: userData?.name || user.displayName || "Team Owner",
           senderPhotoURL: ownerPhoto,
           isRead: false,
           createdAt: serverTimestamp()
        }));
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const myRequest = Array.isArray(requests) ? requests.find(r => r.requesterId === user?.uid) : null;
  const pendingCount = Array.isArray(requests) ? requests.filter(r => r.status === "pending").length : 0;

  return (
    <GlassCard className="relative group overflow-hidden border-white hover:border-primary-teal/30 bg-white hover:scale-[1.02] transition-all duration-700 flex flex-col h-full shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_rgba(0,194,203,0.12)]">
      <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-b from-primary-teal to-secondary-coral"></div>
      
      <div className="p-8 flex flex-col h-full">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-background-neutral border border-primary-teal/10 flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform duration-500 shadow-inner">
              {post.role.toLowerCase().includes('dev') ? '💻' : post.role.toLowerCase().includes('design') ? '🎨' : '👥'}
            </div>
            <div>
              <h3 className="text-[10px] font-black text-primary-teal uppercase tracking-[0.3em] leading-none mb-2">Campus Talent</h3>
              <p className="text-2xl font-black text-text-charcoal leading-none font-heading italic tracking-tighter">{post.posterName || post.name || 'Anonymous'}</p>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-3">
              <button 
                onClick={() => handleEdit(post)}
                className="w-10 h-10 rounded-full bg-background-neutral text-primary-teal hover:bg-primary-teal hover:text-white transition-all border border-primary-teal/5 shadow-sm flex items-center justify-center font-bold text-lg"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDelete(post.id)}
                className="w-10 h-10 rounded-full bg-background-neutral text-secondary-coral hover:bg-secondary-coral hover:text-white transition-all border border-secondary-coral/5 shadow-sm flex items-center justify-center font-bold text-lg"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8 flex-1">
          <div>
            <p className="text-[10px] font-black text-text-gray uppercase tracking-[0.2em] mb-2">Specialization</p>
            <p className="text-text-charcoal font-black text-xl italic tracking-tight">{post.role || 'General Contributor'}</p>
          </div>
          
          <p className="text-text-gray text-sm font-bold leading-relaxed italic border-l-4 border-primary-teal/10 pl-4 py-2 bg-primary-teal/[0.02]">
            "{post.description || 'Ready to innovate and build legacies at RIT.'}"
          </p>

          <div>
             <p className="text-[10px] font-black text-text-gray uppercase tracking-[0.2em] mb-4">Skills & Tools</p>
             <div className="flex flex-wrap gap-2.5">
                {(Array.isArray(post.skills) ? post.skills : (post.skills?.split(',') || [])).map((skill: string) => (
                  <span key={skill} className="px-5 py-2 bg-background-neutral border border-primary-teal/10 rounded-full text-[10px] text-text-charcoal font-black tracking-widest uppercase shadow-sm group-hover:bg-primary-teal/5 group-hover:border-primary-teal/20 transition-all">
                     {skill.trim()}
                  </span>
                ))}
                {(!post.skills || (Array.isArray(post.skills) && post.skills.length === 0)) && (
                  <span className="text-[10px] text-text-gray font-bold italic tracking-widest uppercase py-2">Exploration Phase...</span>
                )}
             </div>
          </div>
          
          {post.members && post.members.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-text-gray uppercase tracking-[0.2em] mb-4">Current Squad ({post.members.length})</p>
              <div className="flex flex-wrap gap-2.5">
                {post.members.map((member: any) => (
                  <div key={member.uid} className="px-5 py-2 bg-primary-teal text-white border border-primary-teal rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-primary-teal/20">
                    Active Partner
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-10 mt-10 border-t border-primary-teal/5 flex flex-col gap-6">
           <div className="flex items-center justify-between w-full">
             <div className="text-[10px] font-black text-text-gray tracking-[0.3em] uppercase opacity-50">Verified RIT Student</div>
             
             <div className="flex items-center gap-3">
               {isOwner ? (
                  <button 
                    onClick={() => setShowRequestsPanel(!showRequestsPanel)}
                    className="h-12 px-8 bg-white border-2 border-primary-teal/20 rounded-full text-primary-teal text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-teal hover:text-white hover:border-primary-teal transition-all duration-300 flex items-center gap-3 shadow-sm active:scale-95"
                  >
                    Requests
                    {pendingCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-secondary-coral text-white flex items-center justify-center text-[10px] font-black shadow-lg animate-pulse">{pendingCount}</span>
                    )}
                  </button>
               ) : myRequest ? (
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full border shadow-inner ${
                    myRequest.status === 'accepted' ? 'bg-primary-teal text-white border-primary-teal' : 
                    myRequest.status === 'rejected' ? 'bg-secondary-coral/10 text-secondary-coral border-secondary-coral/20' : 
                    'bg-primary-teal/5 text-primary-teal border-primary-teal/10'
                  }`}>
                    {myRequest.status === 'pending' ? 'Request Pending' : myRequest.status === 'accepted' ? 'Joined ✅' : 'Unavailable'}
                  </span>
               ) : (
                  <button 
                    onClick={() => {
                      if (!user) return alert('Please login to connect.');
                      setShowRequestModal(true);
                    }}
                    className="h-12 px-10 bg-primary-teal text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-110 transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_10px_25px_rgba(0,194,203,0.3)]"
                  >
                     Connect →
                  </button>
               )}
             </div>
           </div>

           {isOwner && showRequestsPanel && (
             <div className="border-t border-primary-teal/5 pt-6 mt-2 space-y-4">
               <h4 className="text-[10px] font-black text-text-charcoal uppercase tracking-[0.3em] italic">Incoming Requests</h4>
               <div className="max-h-64 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                 {requests.length === 0 ? (
                   <div className="text-[10px] text-text-gray font-bold italic uppercase py-4">No active connection requests.</div>
                 ) : requests.map(req => (
                   <div key={req.id} className="bg-background-neutral border border-primary-teal/5 rounded-[2rem] p-5 flex flex-col gap-4 relative shadow-inner">
                     <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                         <img src={req.requesterPhotoURL} className="w-8 h-8 rounded-full border-2 border-primary-teal/20" alt="" />
                         <span className="text-[10px] font-black text-text-charcoal uppercase tracking-widest">{req.requesterName}</span>
                       </div>
                       <span className="text-[8px] font-black text-text-gray uppercase tracking-widest opacity-50">
                         {req.createdAt ? new Date(req.createdAt.toDate?.() || req.createdAt).toLocaleDateString() : 'New'}
                       </span>
                     </div>
                     {req.message && <p className="text-[11px] text-text-gray font-bold italic leading-relaxed bg-white/50 p-3 rounded-xl border border-primary-teal/5">"{req.message}"</p>}
                     
                     <div className="flex justify-end gap-3 mt-1">
                       {req.status === 'pending' ? (
                         <>
                           <button onClick={() => handleUpdateRequestStatus(req.id, req.requesterId, 'accepted')} className="px-6 py-2 bg-primary-teal text-white text-[9px] font-black uppercase rounded-full hover:scale-105 transition-all shadow-md">Accept</button>
                           <button onClick={() => handleUpdateRequestStatus(req.id, req.requesterId, 'rejected')} className="px-6 py-2 bg-secondary-coral/10 text-secondary-coral text-[9px] font-black uppercase rounded-full hover:bg-secondary-coral hover:text-white transition-all">Reject</button>
                         </>
                       ) : (
                         <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${req.status === 'accepted' ? 'bg-primary-teal text-white border-primary-teal' : 'bg-secondary-coral/10 text-secondary-coral border-secondary-coral/20'}`}>{req.status}</span>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {showRequestModal && (
           <div className="absolute inset-0 bg-white/98 backdrop-blur-3xl z-30 p-8 flex flex-col justify-center border-4 border-primary-teal/10 rounded-[2.5rem] shadow-2xl animate-in fade-in duration-500">
             <h4 className="text-3xl font-black text-text-charcoal mb-2 font-heading italic tracking-tighter">Join Request</h4>
             <p className="text-[10px] font-black text-text-gray mb-8 uppercase tracking-[0.2em]">Build a legacy. Pitch your value to {post.posterName || post.name}.</p>
             <form onSubmit={handleSendRequest} className="space-y-6">
               <textarea 
                 value={requestMessage}
                 onChange={e => setRequestMessage(e.target.value)}
                 placeholder="Why are you the perfect fit for this squad?" 
                 className="w-full h-32 bg-background-neutral border border-primary-teal/10 rounded-2xl p-6 text-sm text-text-charcoal font-bold focus:outline-none focus:ring-4 focus:ring-primary-teal/5 focus:border-primary-teal/30 focus:bg-white resize-none shadow-inner transition-all"
               />
               <div className="flex gap-4 justify-end pt-4">
                 <button type="button" onClick={() => setShowRequestModal(false)} className="px-8 py-3 text-[10px] font-black text-text-gray uppercase tracking-widest hover:text-primary-teal transition-all">Cancel</button>
                 <button type="submit" className="px-10 py-3 bg-primary-teal text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-110 transition-all shadow-xl shadow-primary-teal/20">Send Request →</button>
               </div>
             </form>
           </div>
        )}
      </div>
    </GlassCard>
  );
};

export default function TeamFinderPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>(DEMO_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    role: '',
    skills: '',
    description: ''
  });

  useEffect(() => {
    if (!db) {
      setPosts(DEMO_POSTS);
      setLoading(false);
      return;
    }

    console.log("🔍 [Firestore] Querying team posts. DB instance:", db);
    const q = query(collection(db!, "team_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts([...dbPosts, ...DEMO_POSTS]);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!db) {
      alert("Database connection required to list your profile.");
      return;
    }

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim())
      };

      if (editingId) {
        console.log("🔍 [Firestore] Updating team profile:", editingId);
        await updateDoc(doc(db!, "team_posts", editingId), sanitizeData(payload));
        alert("Profile updated!");
      } else {
        console.log("🔍 [Firestore] Creating new team profile...");
        const postData = {
          ...payload,
          posterId: user.uid,
          posterName: userData?.name || user.displayName,
          createdAt: new Date().toISOString(),
          applicants: []
        };
        await addDoc(collection(db!, "team_posts"), sanitizeData(postData));
        alert("Profile listed!");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ role: '', skills: '', description: '' });
    } catch (error) {
      console.error("Error saving requirement:", error);
      alert("Failed to save profile.");
    }
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setFormData({
      role: post.role,
      skills: post.skills?.join(', ') || '',
      description: post.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (postId: string) => {
    if (!db) {
      alert("Database connection required to delete profiles.");
      return;
    }
    if (!confirm("Delete requirement?")) return;

    try {
      console.log("🔍 [Firestore] Deleting team profile:", postId);
      await deleteDoc(doc(db!, "team_posts", postId));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <SectionContainer className="bg-background-neutral min-h-screen">
      <div className="space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary-teal/5 border border-primary-teal/10 text-[10px] font-black text-secondary-coral tracking-[0.3em] uppercase">
              Student Directory
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-text-charcoal tracking-tighter font-heading italic leading-none">Team Finder</h1>
            <p className="text-xl text-text-gray max-w-xl font-bold leading-relaxed">Build your squad. Connect with talented RIT students and showcase your expertise to the campus.</p>
          </div>
          <PrimaryButton 
            onClick={() => user ? setIsModalOpen(true) : router.push('/login')}
            className="!h-16 !px-12 rounded-full shadow-2xl !w-full md:!w-auto"
          >
            Create Profile
          </PrimaryButton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {loading ? (
             <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-8">
               <div className="w-16 h-16 border-4 border-primary-teal/10 border-t-primary-teal rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-text-gray tracking-[0.3em] uppercase animate-pulse">Scanning RIT Talent...</p>
             </div>
          ) : posts.length > 0 ? posts.map((post) => (
            <TeamPostCard 
              key={post.id} 
              post={post} 
              user={user} 
              userData={userData} 
              handleEdit={handleEdit} 
              handleDelete={handleDelete} 
            />
          )) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-primary-teal/10 shadow-inner">
               <div className="text-8xl mb-8 animate-float-card">🤝</div>
               <h3 className="text-4xl font-black text-text-charcoal mb-4 font-heading italic tracking-tighter">No profiles found</h3>
               <p className="text-text-gray font-bold uppercase tracking-widest text-xs">Be the first to create a profile and find your RIT squad!</p>
            </div>
          )}
        </div>
      </div>

      <GlassModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ role: '', skills: '', description: '' });
        }} 
        title={editingId ? "Edit Your Profile" : "Create Team Profile"}
      >
        <form onSubmit={handleSaveRequirement} className="space-y-8">
          <GlassInput 
            label="Your Primary Role"
            placeholder="e.g. Lead Designer, Frontend"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            required
          />
          <GlassInput 
            label="Skills (comma separated)"
            placeholder="React, Figma, Python"
            value={formData.skills}
            onChange={(e) => setFormData({...formData, skills: e.target.value})}
            required
          />
          <GlassTextArea 
            label="Experience & Pitch"
            placeholder="Tell the campus what you're looking for or what you bring to the table."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
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
               {editingId ? "Update Profile" : "List Profile"}
             </PrimaryButton>
          </div>
        </form>
      </GlassModal>
    </SectionContainer>
  );
}
