import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This file is for server-side Firebase access ONLY.

let db: FirebaseFirestore.Firestore;

if (!getApps().length) {
    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables.');
        }
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
            credential: cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch(e: any) {
        console.error("Failed to initialize Firebase Admin SDK. Please ensure your FIREBASE_SERVICE_ACCOUNT_KEY is set correctly in your environment variables.", e.message);
    }
}

db = getFirestore();

export { db };
