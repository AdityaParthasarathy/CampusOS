"use client";

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { db, sanitizeData } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/hooks/useUser';
import { AvatarDisplay } from './AvatarDisplay';
import Link from 'next/link';

const CommentItem = ({ comment }: { comment: any }) => {
  const authorProfile = useUser(comment.authorId);
  return (
    <div className="flex gap-2 text-sm items-start animate-fade-in">
      <Link href={comment.authorId ? `/profile/${comment.authorId}` : '#'} className="w-6 h-6 rounded-full overflow-hidden border border-primary-teal/10 shrink-0 hover:ring-2 hover:ring-primary-teal/30 transition-all">
        <AvatarDisplay avatar={authorProfile?.avatar} fallbackSeed={comment.authorId} className="w-full h-full !border-none !rounded-none" />
      </Link>
      <div className="flex-1">
        <Link href={comment.authorId ? `/profile/${comment.authorId}` : '#'} className="font-black mr-2 text-text-charcoal hover:text-primary-teal transition-colors">{authorProfile?.name || comment.author}</Link>
        <span className="text-text-charcoal font-medium leading-snug">{comment.text}</span>
        <div className="text-[10px] text-text-gray font-bold mt-1 uppercase tracking-tighter">
          {comment.createdAt?.seconds 
            ? new Date(comment.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : 'Sending...'}
        </div>
      </div>
    </div>
  );
};

interface PostCardProps {
  post: any;
  onReaction: (postId: string, type: 'hype' | 'boost' | 'imIn') => void;
  user: any;
  onDelete?: (postId: string) => void;
  onHide?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onReaction, user, onDelete, onHide }) => {
  const { userData } = useAuth();
  const authorProfile = useUser(post.authorId);
  const [showFire, setShowFire] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const isHyped = user && Array.isArray(post.hypedBy) && post.hypedBy.includes(user.uid);
  const isBoosted = user && Array.isArray(post.boostedBy) && post.boostedBy.includes(user.uid);
  const isParticipant = user && Array.isArray(post.participants) && post.participants.includes(user.uid);
  const isAuthor = user && user.uid === post.authorId;

  const isEvent = ['Club Event', 'Workshop', 'Initiative'].includes(post.category);

  // Fetch comments in real-time
  useEffect(() => {
    if (!db || !post.id || post.id.startsWith('local-')) return;

    const q = query(
      collection(db, "feed", post.id, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(fetchedComments);
    }, (error) => {
      if (error.code !== 'permission-denied') console.error('Comments snapshot error:', error);
    });

    return () => unsubscribe();
  }, [post.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !db || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        text: newComment.trim(),
        author: userData?.name || user.displayName || "RIT Student",
        authorId: user.uid,
        createdAt: serverTimestamp()
      };

      if (post.id.startsWith('local-')) {
        // Handle local post comment locally
        setComments(prev => [...prev, {
          id: `local-comment-${Date.now()}`,
          ...commentData,
          createdAt: { seconds: Date.now() / 1000 } // Mock timestamp
        }]);
      } else {
        await addDoc(collection(db, "feed", post.id, "comments"), sanitizeData(commentData));
      }
      setNewComment("");
      setIsExpanded(true); // Expand to show the new comment
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoubleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    // Prevent accidental triggers from clicking on buttons or inputs
    if (e && (e.target as HTMLElement).closest('button, input, textarea')) return;

    onReaction(post.id, 'hype');
    setShowFire(true);
    setTimeout(() => setShowFire(false), 800);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      handleDoubleTap(e);
      setLastTap(0); // Reset after successful double tap
    } else {
      setLastTap(now);
    }
  };

  return (
    <div 
      className="floating-card overflow-hidden !p-0 bg-white group select-none border-none shadow-[0_8px_20px_rgba(0,0,0,0.06)] relative"
      onDoubleClick={(e) => handleDoubleTap(e)}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-primary-teal/5">
        <Link
          href={post.authorId ? `/profile/${post.authorId}` : '#'}
          className="flex items-center gap-3 group/author"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-10 rounded-full ring-2 ring-primary-teal/20 shadow-sm relative group-hover/author:ring-primary-teal/40 transition-all">
            <div className="w-full h-full rounded-full border-2 border-white flex overflow-hidden bg-white shadow-inner">
              <AvatarDisplay avatar={authorProfile?.avatar} fallbackSeed={post.authorId} className="w-full h-full !rounded-none !border-none" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-text-charcoal group-hover/author:text-primary-teal transition-colors font-heading leading-tight flex items-center gap-1">{authorProfile?.name || post.author}</span>
            <span className="text-[10px] text-text-gray font-bold uppercase tracking-widest">{post.category} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}</span>
          </div>
        </Link>
        {isAuthor && (
          <div className="relative">
            <button 
              className="text-text-gray hover:text-primary-teal transition-colors"
              onClick={() => setShowMenu(!showMenu)}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-primary-teal/10 overflow-hidden z-50 animate-fade-in">
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    if (onHide) onHide(post.id);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-text-charcoal hover:bg-primary-teal/5 transition-colors"
                >
                  Hide Post
                </button>
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    if (window.confirm("Are you sure you want to delete this post?")) {
                      if (onDelete) onDelete(post.id);
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-secondary-coral hover:bg-secondary-coral/5 transition-colors"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
        {!isAuthor && (
          <button 
            className="text-text-gray hover:text-primary-teal transition-colors"
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* Media/Content Area */}
      <div className="relative aspect-square w-full bg-[#f8fafc] flex items-center justify-center p-8 text-center overflow-hidden border-b border-primary-teal/5">
        {(post.imageUrl || post.image) ? (
          <img src={post.imageUrl || post.image} alt="post content" className="object-cover w-full h-full absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="max-w-xs">
            <p className="text-xl font-bold text-text-charcoal leading-relaxed italic">
              "{post.content}"
            </p>
          </div>
        )}

        {/* Double tap fire animation */}
        {showFire && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="animate-fire-pop drop-shadow-2xl text-6xl">🔥</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onReaction(post.id, 'hype')}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`hover:scale-125 active:scale-90 transition-all duration-300 transform flex items-center gap-1 ${isHyped ? 'text-secondary-coral' : 'text-text-charcoal'}`}
            >
              <span className="text-2xl">{isHyped ? '🔥' : '🔥'}</span>
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              onDoubleClick={(e) => e.stopPropagation()}
              className="hover:scale-125 active:scale-90 transition-all duration-300 transform"
            >
              <MessageCircle 
                size={24} 
                className={isExpanded ? "text-primary-teal" : "text-text-charcoal hover:text-primary-teal"} 
                fill={isExpanded ? "rgba(0, 194, 203, 0.1)" : "transparent"}
              />
            </button>
            <button 
              onClick={() => onReaction(post.id, 'boost')}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`hover:scale-125 active:scale-90 transition-all duration-300 transform ${isBoosted ? 'text-blue-500' : 'text-text-charcoal'}`}
            >
              <Send size={24} className={isBoosted ? "fill-current" : ""} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {isEvent && (
              <button 
                onClick={() => onReaction(post.id, 'imIn')}
                onDoubleClick={(e) => e.stopPropagation()}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  isParticipant 
                    ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' 
                    : 'bg-primary-teal/10 text-primary-teal hover:bg-primary-teal/20'
                }`}
              >
                {isParticipant ? '✅ I\'m In' : 'Join'}
              </button>
            )}
            <button 
              className="hover:scale-125 active:scale-90 transition-all duration-300 transform"
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <Bookmark size={24} className="text-text-charcoal hover:text-primary-teal" />
            </button>
          </div>
        </div>

        {/* Reaction Counts */}
        <div className="flex items-center gap-4 text-[10px] font-black text-text-gray uppercase tracking-[0.2em] pt-1">
          <span className={isHyped ? "text-secondary-coral" : ""}>
            🔥 {post.hypes || 0} Hypes
          </span>
          {isEvent && (
            <span className={isParticipant ? "text-primary-teal" : ""}>
              👥 {post.participants?.length || 0} In
            </span>
          )}
          {post.boosts > 0 && (
            <span className="text-blue-500 flex items-center gap-1">
              🚀 Boosted by {post.boosts}
            </span>
          )}
        </div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-black mr-2 text-text-charcoal">{post.author}</span>
          <span className="text-text-charcoal font-medium leading-snug">
            {(post.imageUrl || post.image) ? post.content : post.category}
          </span>
        </div>

        {/* Comments Section */}
        {comments.length > 0 && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-xs text-text-gray font-bold hover:text-primary-teal transition-colors uppercase tracking-wider block"
          >
            View all {comments.length} comments
          </button>
        )}

        {isExpanded && (
          <div className="space-y-3 pt-2 max-h-60 overflow-y-auto custom-scrollbar">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-text-gray italic text-center py-2">No conversations yet. Start one! 🚀</p>
            )}
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-[10px] text-primary-teal font-black uppercase tracking-widest pt-2 hover:opacity-70"
            >
              Hide comments
            </button>
          </div>
        )}

        {/* Input Field */}
        <form 
          onSubmit={handleAddComment}
          className="flex items-center gap-2 pt-1 border-t border-primary-teal/5 mt-2"
        >
          <input 
            type="text" 
            placeholder="Add a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onDoubleClick={(e) => e.stopPropagation()}
            disabled={isSubmitting}
            className="flex-1 bg-transparent text-sm text-text-charcoal outline-none placeholder:text-text-gray font-medium disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="text-primary-teal font-black text-xs uppercase tracking-widest disabled:opacity-30 hover:text-secondary-coral transition-colors"
          >
            {isSubmitting ? "..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
};
