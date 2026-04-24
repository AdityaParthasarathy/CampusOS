"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, setDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const CAMPUS_COORDS: [number, number] = [13.038472636528205, 80.04582264887989];

// Robust mapping of campus location names to coordinates
const LOCATION_MAP: Record<string, [number, number]> = {
  "Cafeteria": [13.0386, 80.0459],
  "Library": [13.0382, 80.0462],
  "Auditorium": [13.0390, 80.0455],
  "Main Auditorium": [13.0390, 80.0455],
  "Sports Complex": [13.0375, 80.0450],
  "Lab Block A": [13.0395, 80.0465],
  "Admin Building": [13.0388, 80.0460],
  "Open Ground": [13.0370, 80.0445],
  "Seminar Hall": [13.0392, 80.0458]
};

/**
 * Advanced MapPage
 * - Handles real-time geolocation with a secure fallback to campus.
 * - Integrates live Firestore events from the 'feed' collection.
 * - NEW: Real-time user location tracking and "Live Users" layer.
 * - Prevents SSR/Hydration errors.
 */
export default function MapPage() {
  const [isClient, setIsClient] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);

    // Initial icon setup on client
    import('leaflet').then((L) => {
      if (typeof window !== 'undefined' && L.Icon && L.Icon.Default) {
        // @ts-ignore
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      }
    });

    // 1. Auth Listener
    if (auth) {
      const unsubAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUid(user.uid);
        } else {
          setCurrentUid(null);
        }
      });
      return () => unsubAuth();
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let watchId: number | null = null;

    // 2. Geolocation Watcher
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      // Get initial position quickly
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPosition(coords);
          setLocationLoading(false);
          
          // Update Firestore for current user if UID is known
          if (currentUid && db) {
            setDoc(doc(db, "users", currentUid), {
              uid: currentUid,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              updatedAt: serverTimestamp()
            }, { merge: true }).catch(err => console.error("Error updating user location:", err));
          }
        },
        () => {
          if (!userPosition) setUserPosition(CAMPUS_COORDS);
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );

      // Start watching continuous updates
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPosition(coords);
          
          if (currentUid && db) {
            setDoc(doc(db, "users", currentUid), {
              uid: currentUid,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              updatedAt: serverTimestamp()
            }, { merge: true }).catch(err => console.error("Error updating user location (watch):", err));
          }
        },
        (error) => console.warn("Watch position error:", error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    } else {
      setUserPosition(CAMPUS_COORDS);
      setLocationLoading(false);
    }

    // 3. Firestore Listeners
    if (db) {
      // Events Listener
      const qEvents = query(collection(db, "events"));
      const unsubEvents = onSnapshot(qEvents, (snapshot) => {
        const liveEvents = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((ev: any) => ev.location && LOCATION_MAP[ev.location]);
        setEvents(liveEvents);
      }, (error) => {
        if (error.code !== 'permission-denied') console.error('Events map snapshot error:', error);
      });

      // Active Users Listener (last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const qUsers = query(
        collection(db, "users"), 
        where("updatedAt", ">=", Timestamp.fromDate(twoMinutesAgo))
      );

      const unsubUsers = onSnapshot(qUsers, (snapshot) => {
        const liveUsers = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((u: any) => u.uid !== currentUid && u.latitude && u.longitude);
        setActiveUsers(liveUsers);
      }, (error) => {
        if (error.code !== 'permission-denied') console.error('Active users snapshot error:', error);
      });

      return () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        unsubEvents();
        unsubUsers();
      };
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isClient, currentUid]);

  if (!isClient || locationLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background-neutral overflow-hidden">
        <div className="relative flex flex-col items-center">
          <div className="absolute h-32 w-32 animate-ping rounded-full bg-primary-teal/5" />
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-teal/10 border-t-primary-teal shadow-2xl" />
          <div className="mt-8 text-center animate-fade-in">
            <h2 className="text-2xl font-black text-primary-teal tracking-tighter italic font-heading">CampusOS Map</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-gray mt-2">Connecting Grid...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background-neutral overflow-hidden">
      {userPosition && (
        <MapContainer 
          center={userPosition} 
          zoom={16} 
          scrollWheelZoom={true}
          style={{ height: '100vh', width: '100%' }}
          className="h-full w-full z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Live Marker (YOU) */}
          <Marker position={userPosition}>
            <Popup>
              <div className="p-2 text-center min-w-[140px]">
                <h3 className="text-sm font-black text-primary-teal font-heading">You are here</h3>
                <p className="text-[9px] font-bold text-text-gray uppercase tracking-widest mt-1">Live Position</p>
              </div>
            </Popup>
          </Marker>

          {/* Other Active Users Markers */}
          {activeUsers.map((user) => (
            <Marker 
              key={user.uid} 
              position={[user.latitude, user.longitude]}
            >
              <Popup className="user-popup">
                <div className="p-2 text-center min-w-[130px]">
                  <h3 className="text-sm font-black text-secondary-coral font-heading italic">Campus User</h3>
                  <p className="text-[8px] font-bold text-text-gray uppercase tracking-[0.2em] mt-1 italic">Active Nearby</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Static Campus Center Reference */}
          <Marker position={CAMPUS_COORDS}>
            <Popup>
              <div className="p-2 text-center min-w-[120px]">
                <h3 className="text-sm font-black text-text-charcoal font-heading italic">CampusOS Hub</h3>
                <p className="text-[9px] text-text-gray font-bold uppercase tracking-wider mt-1">Main Entrance</p>
              </div>
            </Popup>
          </Marker>

          {/* Dynamic Event Markers from Firestore */}
          {events.map((event) => {
            const coords = LOCATION_MAP[event.location];
            if (!coords) return null;

            return (
              <Marker key={event.id} position={coords}>
                <Popup className="event-popup">
                  <div className="p-2 text-center min-w-[160px]">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-secondary-coral/10 text-secondary-coral px-3 py-1 rounded-full mb-2 inline-block">
                      Campus Event
                    </span>
                    <h3 className="text-base font-black text-text-charcoal font-heading leading-tight mb-1">{event.title}</h3>
                    <p className="text-[10px] text-text-gray font-medium line-clamp-2 italic mb-2">{event.desc}</p>
                    <p className="text-[10px] text-text-gray font-medium italic mb-2">Location: {event.location}</p>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-secondary-coral/30 to-transparent my-2" />
                    <p className="text-[9px] font-black text-secondary-coral uppercase tracking-widest">Active Now</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}

      {/* CampusOS UI Styling */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 2rem !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1) !important;
        }
        .event-popup .leaflet-popup-content-wrapper {
          border-left: 4px solid #ff6b6b !important;
        }
        .user-popup .leaflet-popup-content-wrapper {
          border-left: 4px solid #00C2CB !important;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.9) !important;
        }
      `}</style>
    </div>
  );
}
