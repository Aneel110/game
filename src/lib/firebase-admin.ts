
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

// Helper to check if a string is Base64 encoded
function isBase64(str: string): boolean {
  if (str === '' || str.trim() === '') {
    return false;
  }
  try {
    // We can't just use btoa and atob because they are not available in Node.js environment.
    // Buffer.from is a reliable way to check for Base64.
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (err) {
    return false;
  }
}

try {
    let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables.');
    }

    // Check if the key is Base64 encoded and decode it if necessary
    if (isBase64(serviceAccountKey)) {
        serviceAccountKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    if (!getApps().length) {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        app = getApps()[0];
    }
    db = getFirestore(app);

} catch (e: any) {
    console.error("Firebase Admin SDK initialization failed:", e.message);
    // @ts-ignore
    db = null;
}

export { db };
