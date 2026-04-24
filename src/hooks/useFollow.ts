"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  doc, setDoc, deleteDoc, onSnapshot,
  collection, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

/** Follow / unfollow a specific user and track if current user already follows them */
export function useFollow(targetUid: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Real-time: does current user follow targetUid?
  useEffect(() => {
    if (!user || !targetUid || !db || user.uid === targetUid) return;

    const ref = doc(db!, `users/${user.uid}/following/${targetUid}`);
    const unsub = onSnapshot(ref, (snap) => {
      setIsFollowing(snap.exists());
    }, () => {/* permission errors — silent */});
    return () => unsub();
  }, [user, targetUid]);

  // Real-time: how many followers does targetUid have?
  useEffect(() => {
    if (!targetUid || !db) return;

    const ref = collection(db!, `users/${targetUid}/followers`);
    const unsub = onSnapshot(ref, (snap) => {
      setFollowersCount(snap.size);
    }, () => {});
    return () => unsub();
  }, [targetUid]);

  const toggleFollow = useCallback(async () => {
    if (!user || !targetUid || !db || loading || user.uid === targetUid) return;
    setLoading(true);
    try {
      const followingRef = doc(db!, `users/${user.uid}/following/${targetUid}`);
      const followerRef  = doc(db!, `users/${targetUid}/followers/${user.uid}`);

      if (isFollowing) {
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
      } else {
        await setDoc(followingRef, { followedAt: serverTimestamp() });
        await setDoc(followerRef,  { followedAt: serverTimestamp() });
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, targetUid, isFollowing, loading]);

  return { isFollowing, followersCount, toggleFollow, loading };
}

/** Get the list of UIDs that a user follows — used for the feed filter */
export function useFollowingIds(uid: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (!uid || !db) return;

    const ref = collection(db!, `users/${uid}/following`);
    const unsub = onSnapshot(ref, (snap) => {
      setIds(snap.docs.map(d => d.id));
    }, () => {});
    return () => unsub();
  }, [uid]);

  return ids;
}

/** Get follower + following counts for a user */
export function useFollowCounts(uid: string) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    if (!uid || !db) return;

    const unsubFollowers = onSnapshot(
      collection(db!, `users/${uid}/followers`),
      (snap) => setFollowers(snap.size),
      () => {}
    );
    const unsubFollowing = onSnapshot(
      collection(db!, `users/${uid}/following`),
      (snap) => setFollowing(snap.size),
      () => {}
    );

    return () => { unsubFollowers(); unsubFollowing(); };
  }, [uid]);

  return { followers, following };
}
