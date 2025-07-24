import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is for server-side Firebase access ONLY.

let db: Firestore | null = null;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    }
    
    db = getFirestore();
  } else {
    // This warning is important for developers to see during local development.
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side Firebase features will be disabled.");
  }

} catch (e: any) {
  console.error("Failed to initialize Firebase Admin SDK. Please ensure your FIREBASE_SERVICE_ACCOUNT_KEY is a valid JSON object.", e.message);
}


export { db };
