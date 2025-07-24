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
    }
    
    db = getFirestore();
  }

} catch (e: any) {
  // In a production environment, it's better to log the error
  // without exposing details to the console.
  console.error("Firebase Admin SDK initialization failed.");
}


export { db };
