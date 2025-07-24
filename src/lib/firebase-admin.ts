'use server';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This file is for server-side Firebase access ONLY.

let db: FirebaseFirestore.Firestore;

if (!getApps().length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
        initializeApp({
            credential: cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized.");
    } catch(e: any) {
        console.error("Failed to initialize Firebase Admin SDK:", e.message);
    }
}

db = getFirestore();

export { db };
