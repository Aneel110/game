
import admin from 'firebase-admin';

// Helper to check if a string is Base64 encoded
function isBase64(str: string): boolean {
  if (!str || str.trim() === '') {
    return false;
  }
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (err) {
    return false;
  }
}

function getServiceAccount() {
    let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        return null;
    }
    if (isBase64(serviceAccountKey)) {
        serviceAccountKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    }
    try {
        return JSON.parse(serviceAccountKey);
    } catch(e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
        return null;
    }
}

// This is a singleton pattern to ensure we only initialize the app once.
function getAdminServices() {
  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    console.warn("Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid.");
    return { db: null, auth: null };
  }

  if (admin.apps.length > 0) {
    return { db: admin.firestore(), auth: admin.auth() };
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return { db: admin.firestore(), auth: admin.auth() };
  } catch (e: any) {
    console.error("Firebase Admin SDK initialization failed:", e.message);
    return { db: null, auth: null };
  }
}

export const { db, auth } = getAdminServices();
