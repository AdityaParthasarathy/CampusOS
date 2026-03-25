/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { 
  SEED_EVENTS, 
  SEED_PROJECTS, 
  SEED_MARKETPLACE, 
  SEED_TEAM_POSTS 
} from '@/lib/seedData';
import { sanitizeData } from '@/lib/firebase';

export const useDataSeeder = () => {
    useEffect(() => {
        const seedIfEmpty = async () => {
            if (!db) return;

            const collectionsToSeed = [
                { name: 'events', data: SEED_EVENTS, log: 'events' },
                { name: 'projects', data: SEED_PROJECTS, log: 'projects' },
                { name: 'marketplace', data: SEED_MARKETPLACE, log: 'marketplace' },
                { name: 'team_posts', data: SEED_TEAM_POSTS, log: 'team finder' }
            ];

            for (const col of collectionsToSeed) {
                try {
                    const colRef = collection(db, col.name);
                    const q = query(colRef, limit(1));
                    const snapshot = await getDocs(q);

                    if (snapshot.empty) {
                        console.log(`🌱 Seeding ${col.log}...`);
                        for (const item of col.data) {
                            await addDoc(colRef, sanitizeData(item));
                        }
                        console.log(`✅ ${col.log} seeded successfully.`);
                    }
                } catch (error) {
                    console.error(`❌ [Seeder] Error seeding ${col.name}:`, error);
                }
            }
        };

        seedIfEmpty();
    }, []);
};
