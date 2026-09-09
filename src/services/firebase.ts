import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDu93EZdBqp6Zfs2aiSP0JnV06DyM3Qxic",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sdn53website.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sdn53website",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sdn53website.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "276262925376",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:276262925376:web:f436d94a7b8af33bab1ba5"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const isAiStudioSandbox = firebaseConfig.projectId === "forward-entry-2pthm";
const customDatabaseId = isAiStudioSandbox 
  ? (import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-remixportalpubli-fc116a3c-be74-4e60-ab29-41cc872b25ab")
  : undefined;

export const db = customDatabaseId ? getFirestore(app, customDatabaseId) : getFirestore(app);
export const auth = getAuth(app);
export { firebaseConfig, customDatabaseId };
