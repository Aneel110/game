import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is for server-side Firebase access ONLY.

let app: App;
let db: Firestore;

if (getApps().length) {
  app = getApps()[0];
} else {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables.');
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
    console.error("Failed to initialize Firebase Admin SDK. Please ensure your FIREBASE_SERVICE_ACCOUNT_KEY is set correctly in your environment variables.", e.message);
  }
}

// @ts-ignore
if (app) {
    db = getFirestore(app);
}

// @ts-ignore
export { db };
