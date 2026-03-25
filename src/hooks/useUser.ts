"use client";

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AvatarState } from './useAvatar';

export interface UserProfile {
  id: string;
  name: string;
  avatar: AvatarState | string | null;
  role?: string;
}

// ----------------------------------------------------------------------
// High-Performance Singleton Cache to prevent redundant onSnapshot listeners
// and eliminate the N+1 fetching problem across hundreds of feed posts.
// ----------------------------------------------------------------------
class UserStore {
  private static instance: UserStore;
  private cache = new Map<string, UserProfile>();
  private listeners = new Map<string, Set<(user: UserProfile) => void>>();
  private unsubs = new Map<string, () => void>();

  public static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  public subscribe(userId: string, callback: (user: UserProfile | null) => void): () => void {
    // Return cached data immediately if available
    if (this.cache.has(userId)) {
      callback(this.cache.get(userId)!);
    } else {
      callback(null); // Explicit initial null
    }

    // Add listener
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)!.add(callback);

    // Mount Firestore listener if it's the first subscriber
    if (!this.unsubs.has(userId) && db) {
      const unsub = onSnapshot(doc(db, 'users', userId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const profile: UserProfile = {
            id: docSnap.id,
            name: data.name || 'Unknown User',
            avatar: data.avatar || null,
            role: data.role || 'Student',
          };
          this.cache.set(userId, profile);
          
          // Broadcast to all active components
          this.listeners.get(userId)?.forEach(cb => cb(profile));
        }
      }, (error) => {
        console.error(`Error fetching user ${userId}:`, error);
      });
      
      this.unsubs.set(userId, unsub);
    }

    // Clean up
    return () => {
      const activeCallbacks = this.listeners.get(userId);
      if (activeCallbacks) {
        activeCallbacks.delete(callback);
        
        // If no components are listening to this user anymore, close the stream
        if (activeCallbacks.size === 0) {
          const unsub = this.unsubs.get(userId);
          if (unsub) {
            unsub();
            this.unsubs.delete(userId);
          }
          this.listeners.delete(userId);
        }
      }
    };
  }
}

export function useUser(userId: string | undefined): UserProfile | null {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const store = UserStore.getInstance();
    const unsubscribe = store.subscribe(userId, (profile) => {
      setUserProfile(profile);
    });

    return () => unsubscribe();
  }, [userId]);

  return userProfile;
}
