/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, db, isFirebaseConfigured, isDbReady, sanitizeData } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { useDataSeeder } from "@/hooks/useDataSeeder";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auto-seeding system
  useDataSeeder();

  useEffect(() => {
    // 1. Handle Safe Mode (No Firebase)
    if (!isFirebaseConfigured || !auth || !db) {
      console.warn("⚠️ [AuthContext] Entering Safe Mode due to missing configuration.");
      const mockUser = {
        uid: 'demo-user-123',
        displayName: 'Guest Student',
        email: 'guest@rit.edu.in',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'
      } as User;
      
      const mockUserData = {
        uid: 'demo-user-123',
        name: 'Guest Student',
        email: 'guest@rit.edu.in',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
        role: "Student",
        createdAt: new Date().toISOString()
      };

      setUser(mockUser);
      setUserData(mockUserData);
      setLoading(false);
      return;
    }

    // 2. Handle Live Mode
    console.log("🔥 [AuthContext] Initializing Firebase Auth observer...");
    let userSnapshotUnsub: (() => void) | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (userSnapshotUnsub) {
        userSnapshotUnsub();
        userSnapshotUnsub = null;
      }
      
      if (user && db) {
        try {
          const userRef = doc(db, "users", user.uid);
          
          userSnapshotUnsub = onSnapshot(userRef, async (userDoc) => {
            if (userDoc.exists()) {
              setUserData({ id: user.uid, ...userDoc.data() });
            } else {
              const initialData = {
                uid: user.uid,
                name: user.displayName || "RIT Student",
                email: user.email,
                avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                role: "Student",
                createdAt: serverTimestamp(),
                projectsCreated: [],
                applicationsSent: [],
                postsMade: []
              };
              await setDoc(userRef, sanitizeData(initialData));
            }
          });
        } catch (err) {
          console.error("❌ [AuthContext] Firestore user fetch error:", err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      if (userSnapshotUnsub) userSnapshotUnsub();
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) {
        alert("Authentication is currently unavailable. Operating in Safe Mode.");
        return;
    }
    
    const provider = new GoogleAuthProvider();
    try {
      console.log("🔑 [AuthContext] Attempting Google Sign-In...");
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("❌ [AuthContext] Login failed:", error.code, error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const logout = async () => {
    if (!auth) {
        setUser(null);
        setUserData(null);
        return;
    }
    
    try {
      console.log("🚪 [AuthContext] Attempting Logout...");
      await signOut(auth);
    } catch (error) {
      console.error("❌ [AuthContext] Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      loginWithGoogle, 
      logout, 
      isFirebaseAvailable: isDbReady() 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
