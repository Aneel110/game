
import admin from 'firebase-admin';

// Helper to check if a string is Base64 encoded
function isBase64(str: string): boolean {
  if (!str || str.trim() === '') {
    return false;
  }
  try {
    // Attempt to decode and re-encode, then check if the result is the same.
    // This is a reliable way to verify Base64 encoding.
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (err) {
    return false;
  }
}

function getServiceAccount() {
    let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.");
        return null;
    }

    // If the key is Base64 encoded, decode it.
    if (isBase64(serviceAccountKey)) {
        try {
            serviceAccountKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
        } catch (e) {
            console.error("Failed to decode Base64 service account key:", e);
            return null;
        }
    }

    // Parse the JSON key
    try {
        return JSON.parse(serviceAccountKey);
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", e);
        return null;
    }
}

function initializeAdminServices() {
  // If the app is already initialized, return the existing services
  if (admin.apps.length > 0) {
    return { 
      db: admin.firestore(), 
      auth: admin.auth() 
    };
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    console.warn("Firebase Admin SDK not initialized due to missing or invalid service account key.");
    return { db: null, auth: null };
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    return { 
      db: admin.firestore(), 
      auth: admin.auth() 
    };
  } catch (e: any) {
    console.error("Firebase Admin SDK initialization failed:", e.message);
    return { db: null, auth: null };
  }
}

export const { db, auth } = initializeAdminServices();
