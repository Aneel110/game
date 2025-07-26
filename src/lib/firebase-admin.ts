
'use server';

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables.');
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
