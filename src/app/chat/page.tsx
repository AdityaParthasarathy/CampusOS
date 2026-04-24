/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Search, Edit2, Send, ArrowLeft, X, MessageCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  getDocs,
  limit,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  participants: string[];
  names: Record<string, string>;
  avatars: Record<string, any>;
  lastMessage: string;
  lastMessageAt: any;
  lastSenderId: string;
  unread: Record<string, number>;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
}

interface UserResult {
  id: string;
  name: string;
  avatar: any;
  role?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getConvId = (uid1: string, uid2: string) =>
  [uid1, uid2].sort().join('_');

const formatTime = (ts: any): string => {
  if (!ts) return '';
  const date: Date = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatMessageTime = (ts: any): string => {
  if (!ts) return '';
  const date: Date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ─── Main Page ────────────────────────────────────────────────────────────────

function ChatPageInner() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);

  // New-chat modal
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Mobile view toggle
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null;

  // ── Redirect if not logged in ──────────────────────────────────────────────
  useEffect(() => {
    if (!user && !userData) {
      router.push('/login');
    }
  }, [user]);

  // ── Auto-open conversation from ?user=uid&name=name (from profile page) ────
  useEffect(() => {
    const targetUid = searchParams.get('user');
    const targetName = searchParams.get('name');
    if (!targetUid || !user || !userData || !db) return;

    const autoOpen = async () => {
      try {
        const otherDoc = await getDoc(doc(db!, 'users', targetUid));
        const otherData = otherDoc.exists() ? otherDoc.data() : null;
        const otherUser: UserResult = {
          id: targetUid,
          name: otherData?.name || targetName || 'User',
          avatar: otherData?.avatar || null,
          role: otherData?.role,
        };
        await startConversation(otherUser);
      } catch (err) {
        console.error('Auto-open conversation error:', err);
      }
    };

    autoOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user?.uid, userData]);

  // ── Subscribe to conversations ─────────────────────────────────────────────
  useEffect(() => {
    if (!db || !user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const convs: Conversation[] = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Conversation))
        .sort((a, b) => {
          const at = a.lastMessageAt?.toMillis?.() ?? 0;
          const bt = b.lastMessageAt?.toMillis?.() ?? 0;
          return bt - at;
        });
      setConversations(convs);
      setLoadingConvs(false);
    }, (err) => {
      if (err.code !== 'permission-denied') console.error('Conversations error:', err);
      setLoadingConvs(false);
    });

    return () => unsub();
  }, [user?.uid]);

  // ── Subscribe to messages in active conversation ───────────────────────────
  useEffect(() => {
    if (!db || !activeConvId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'conversations', activeConvId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    }, (err) => {
      if (err.code !== 'permission-denied') console.error('Messages error:', err);
    });

    // Mark as read
    if (user) {
      const convRef = doc(db, 'conversations', activeConvId);
      updateDoc(convRef, { [`unread.${user.uid}`]: 0 }).catch(() => {});
    }

    return () => unsub();
  }, [activeConvId]);

  // ── Auto-scroll to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Search users ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userSearchQuery.trim() || !db) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const name = userSearchQuery.trim();
        const snap = await getDocs(
          query(
            collection(db!, 'users'),
            where('name', '>=', name),
            where('name', '<=', name + '\uf8ff'),
            limit(10)
          )
        );
        const results: UserResult[] = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as UserResult))
          .filter(u => u.id !== user?.uid);
        setUserResults(results);
      } catch (err) {
        console.error('User search error:', err);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  // ── Start or open a conversation ──────────────────────────────────────────
  const startConversation = useCallback(async (otherUser: UserResult) => {
    if (!user || !db || !userData) return;

    const convId = getConvId(user.uid, otherUser.id);
    const convRef = doc(db, 'conversations', convId);
    const existing = await getDoc(convRef);

    if (!existing.exists()) {
      const myAvatar = typeof userData.avatar === 'string'
        ? userData.avatar
        : null;
      const theirAvatar = typeof otherUser.avatar === 'string'
        ? otherUser.avatar
        : null;

      await setDoc(convRef, {
        participants: [user.uid, otherUser.id],
        names: {
          [user.uid]: userData.name || user.displayName || 'Me',
          [otherUser.id]: otherUser.name,
        },
        avatars: {
          [user.uid]: myAvatar,
          [otherUser.id]: theirAvatar,
        },
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        lastSenderId: '',
        unread: { [user.uid]: 0, [otherUser.id]: 0 },
      });
    }

    setActiveConvId(convId);
    setShowNewChat(false);
    setUserSearchQuery('');
    setUserResults([]);
    setMobileShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [user, userData]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId || !user || !db || sending) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const convRef = doc(db, 'conversations', activeConvId);
      const conv = conversations.find(c => c.id === activeConvId);
      const otherUid = conv?.participants.find(p => p !== user.uid);

      // Add message
      await addDoc(collection(db, 'conversations', activeConvId, 'messages'), {
        text,
        senderId: user.uid,
        senderName: userData?.name || user.displayName || 'Me',
        createdAt: serverTimestamp(),
      });

      // Update conversation metadata
      const update: Record<string, any> = {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastSenderId: user.uid,
        [`unread.${user.uid}`]: 0,
      };
      if (otherUid) {
        const currentUnread = conv?.unread?.[otherUid] ?? 0;
        update[`unread.${otherUid}`] = currentUnread + 1;
      }
      await updateDoc(convRef, update);
    } catch (err) {
      console.error('Send error:', err);
      setNewMessage(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  // ── Select conversation ───────────────────────────────────────────────────
  const selectConv = (convId: string) => {
    setActiveConvId(convId);
    setMobileShowChat(true);
  };

  // ── Derived: other user info for active conv ───────────────────────────────
  const getOtherUser = (conv: Conversation) => {
    if (!user) return { name: 'Unknown', avatar: null, uid: '' };
    const otherUid = conv.participants.find(p => p !== user.uid) ?? '';
    return {
      name: conv.names?.[otherUid] ?? 'Unknown',
      avatar: conv.avatars?.[otherUid] ?? null,
      uid: otherUid,
    };
  };

  // ── Filter conversations by search ────────────────────────────────────────
  const filteredConvs = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const other = getOtherUser(conv);
    return other.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-center">
        <div className="space-y-4">
          <div className="text-6xl">💬</div>
          <p className="font-black text-text-charcoal text-xl">Sign in to chat</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex gap-4 px-2 md:px-4 pb-20 md:pb-4">

      {/* ── Conversation List (left panel) ─────────────────────────────────── */}
      <div className={`
        ${mobileShowChat ? 'hidden md:flex' : 'flex'}
        flex-col w-full md:w-80 lg:w-96 shrink-0
        bg-white/70 backdrop-blur-xl rounded-[2.5rem]
        border border-primary-teal/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)]
      `}>
        {/* Header */}
        <div className="p-5 border-b border-primary-teal/5 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-text-charcoal font-heading italic tracking-tight">Messages</h1>
            <button
              onClick={() => setShowNewChat(true)}
              className="w-9 h-9 rounded-full bg-primary-teal/10 flex items-center justify-center hover:bg-primary-teal hover:text-white transition-all text-primary-teal"
            >
              <Edit2 size={15} strokeWidth={2.5} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" size={14} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background-neutral/60 border border-primary-teal/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-teal/20 transition-all font-medium placeholder:text-text-gray"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-1">
          {loadingConvs ? (
            [1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-primary-teal/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-primary-teal/10 rounded-full w-3/4" />
                  <div className="h-2 bg-primary-teal/5 rounded-full w-1/2" />
                </div>
              </div>
            ))
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-3 opacity-60">
              <MessageCircle size={36} className="text-primary-teal/40" />
              <p className="text-sm font-bold text-text-gray">No conversations yet</p>
              <p className="text-xs text-text-gray">Tap the pencil icon to start one</p>
            </div>
          ) : (
            filteredConvs.map(conv => {
              const other = getOtherUser(conv);
              const myUnread = conv.unread?.[user.uid] ?? 0;
              const isActive = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConv(conv.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-3xl cursor-pointer transition-all text-left group ${
                    isActive
                      ? 'bg-primary-teal/10 shadow-sm'
                      : 'hover:bg-white/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full ring-2 ring-primary-teal/15 shrink-0 overflow-hidden">
                    <AvatarDisplay avatar={other.avatar} fallbackSeed={other.uid} className="w-full h-full !rounded-none !border-none" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`font-black text-sm truncate ${isActive ? 'text-primary-teal' : 'text-text-charcoal'}`}>
                        {other.name}
                      </span>
                      <span className="text-[10px] text-text-gray font-bold shrink-0 ml-2">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-text-gray truncate font-medium">
                        {conv.lastSenderId === user.uid && conv.lastMessage ? `You: ${conv.lastMessage}` : conv.lastMessage || 'Say hello 👋'}
                      </p>
                      {myUnread > 0 && (
                        <span className="ml-2 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary-coral text-white flex items-center justify-center text-[9px] font-black shrink-0">
                          {myUnread > 9 ? '9+' : myUnread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Window (right panel) ──────────────────────────────────────── */}
      <div className={`
        ${mobileShowChat ? 'flex' : 'hidden md:flex'}
        flex-1 flex-col
        bg-white/70 backdrop-blur-xl rounded-[2.5rem]
        border border-primary-teal/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)]
      `}>
        {activeConv && user ? (
          <>
            {/* Chat header */}
            <div className="p-4 md:p-5 border-b border-primary-teal/5 flex items-center gap-3 bg-white/30">
              <button
                onClick={() => { setMobileShowChat(false); }}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary-teal/10 text-text-gray hover:text-primary-teal transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <a href={`/profile/${getOtherUser(activeConv).uid}`} className="w-10 h-10 rounded-full ring-2 ring-primary-teal/20 overflow-hidden shrink-0 hover:ring-primary-teal/50 transition-all">
                <AvatarDisplay
                  avatar={getOtherUser(activeConv).avatar}
                  fallbackSeed={getOtherUser(activeConv).uid}
                  className="w-full h-full !rounded-none !border-none"
                />
              </a>
              <div>
                <a href={`/profile/${getOtherUser(activeConv).uid}`} className="font-black text-text-charcoal text-sm leading-tight hover:text-primary-teal transition-colors block">{getOtherUser(activeConv).name}</a>
                <span className="text-[10px] text-primary-teal font-black uppercase tracking-widest">RIT Student</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-60">
                  <div className="text-4xl">👋</div>
                  <p className="text-sm font-bold text-text-gray text-center">
                    Start the conversation with {getOtherUser(activeConv).name}!
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user.uid;
                  const prevMsg = messages[idx - 1];
                  const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {showSender && !isMine && (
                        <span className="text-[10px] text-text-gray font-black uppercase tracking-wider ml-1 mb-1">
                          {msg.senderName}
                        </span>
                      )}
                      <div className={`max-w-[75%] md:max-w-[65%] group relative`}>
                        <div className={`px-4 py-2.5 rounded-3xl text-sm font-medium leading-relaxed break-words ${
                          isMine
                            ? 'bg-primary-teal text-white rounded-tr-lg shadow-[0_4px_15px_rgba(0,194,203,0.25)]'
                            : 'bg-white text-text-charcoal rounded-tl-lg shadow-sm border border-primary-teal/5'
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[9px] text-text-gray font-bold mt-1 block opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'text-right' : 'text-left'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 md:p-5 border-t border-primary-teal/5 bg-white/20">
              <div className="flex items-center gap-3 bg-white/80 border border-primary-teal/10 rounded-3xl px-5 py-3 shadow-sm focus-within:border-primary-teal/30 focus-within:shadow-[0_0_0_3px_rgba(0,194,203,0.08)] transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Message ${getOtherUser(activeConv).name}...`}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1 bg-transparent text-sm outline-none text-text-charcoal font-medium placeholder:text-text-gray disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-9 h-9 rounded-full bg-primary-teal text-white flex items-center justify-center hover:brightness-110 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,194,203,0.3)]"
                >
                  <Send size={15} strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-5">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-teal/10 to-secondary-coral/10 flex items-center justify-center shadow-inner">
              <MessageCircle size={40} className="text-primary-teal/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-charcoal font-heading italic tracking-tight">Your Messages</h3>
              <p className="text-text-gray text-sm font-medium max-w-xs leading-relaxed">
                Send private messages to your RIT peers. Click the pencil icon to start a new chat.
              </p>
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="mt-2 px-8 py-3 rounded-full bg-primary-teal text-white text-sm font-black uppercase tracking-widest shadow-[0_8px_25px_rgba(0,194,203,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              Start a Chat
            </button>
          </div>
        )}
      </div>

      {/* ── New Chat Modal ─────────────────────────────────────────────────── */}
      {showNewChat && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowNewChat(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-6 border-b border-primary-teal/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-text-charcoal font-heading italic">New Message</h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="w-9 h-9 rounded-full hover:bg-primary-teal/10 flex items-center justify-center text-text-gray hover:text-primary-teal transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search input */}
            <div className="p-4 border-b border-primary-teal/5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" size={15} />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-background-neutral border border-primary-teal/10 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-teal/20 transition-all font-medium placeholder:text-text-gray"
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar p-3 space-y-1">
              {searchingUsers ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-primary-teal/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-primary-teal/10 rounded-full w-1/2" />
                      <div className="h-2 bg-primary-teal/5 rounded-full w-1/3" />
                    </div>
                  </div>
                ))
              ) : userResults.length > 0 ? (
                userResults.map(u => (
                  <button
                    key={u.id}
                    onClick={() => startConversation(u)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-primary-teal/5 transition-colors text-left group"
                  >
                    <div className="w-11 h-11 rounded-full ring-2 ring-primary-teal/10 overflow-hidden shrink-0">
                      <AvatarDisplay avatar={u.avatar} fallbackSeed={u.id} className="w-full h-full !rounded-none !border-none" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-text-charcoal group-hover:text-primary-teal transition-colors">{u.name}</p>
                      <p className="text-[10px] text-text-gray font-bold uppercase tracking-wider">{u.role || 'Student'}</p>
                    </div>
                  </button>
                ))
              ) : userSearchQuery.trim() ? (
                <div className="py-12 text-center text-text-gray text-sm font-medium opacity-60">
                  No users found for &quot;{userSearchQuery}&quot;
                </div>
              ) : (
                <div className="py-12 text-center text-text-gray text-sm font-medium opacity-60">
                  Type a name to search for RIT students
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-teal/10 border-t-primary-teal rounded-full animate-spin" />
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}
