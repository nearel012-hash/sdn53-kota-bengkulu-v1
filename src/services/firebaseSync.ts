import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { NewsArticle, SchoolIdentity, MediaItem, GraduationConfig, GraduationStudent } from '../types';

const ARTICLES_COLLECTION = 'articles';
const SETTINGS_COLLECTION = 'settings';
const MEDIA_COLLECTION = 'media';
const GRADUATION_COLLECTION = 'graduation';

// --- SCHOOL IDENTITY ---
export async function fetchRemoteSchoolIdentity(): Promise<SchoolIdentity | null> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'school-identity');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SchoolIdentity;
    }
  } catch (err) {
    console.warn('[Firebase] unable to fetch remote school identity:', err);
  }
  return null;
}

export async function syncRemoteSchoolIdentity(identity: SchoolIdentity): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'school-identity');
    await setDoc(docRef, {
      ...identity,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('[Firebase] School identity synced successfully to Cloud Firestore');
  } catch (err) {
    console.warn('[Firebase] unable to sync school identity:', err);
  }
}

export function subscribeToRemoteSchoolIdentity(callback: (identity: SchoolIdentity) => void): () => void {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'school-identity');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as SchoolIdentity);
        }
      },
      (error) => {
        console.warn('[Firebase] Identity snapshot listener notice:', error);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to attach identity listener:', err);
    return () => {};
  }
}

// --- ARTICLES ---
export async function fetchRemoteArticles(): Promise<NewsArticle[] | null> {
  try {
    const colRef = collection(db, ARTICLES_COLLECTION);
    const snap = await getDocs(colRef);
    const items: NewsArticle[] = [];
    snap.forEach((d) => {
      items.push(d.data() as NewsArticle);
    });
    return items;
  } catch (err) {
    console.warn('[Firebase] unable to fetch remote articles:', err);
  }
  return null;
}

export async function syncRemoteArticle(article: NewsArticle): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, article.id);
    await setDoc(docRef, {
      ...article,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('[Firebase] Article synced to Cloud Firestore:', article.title);
  } catch (err) {
    console.warn('[Firebase] unable to sync article to Cloud:', err);
  }
}

export async function deleteRemoteArticle(id: string): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, id);
    await deleteDoc(docRef);
    console.log('[Firebase] Article deleted from Cloud Firestore:', id);
  } catch (err) {
    console.warn('[Firebase] unable to delete remote article:', err);
  }
}

export function subscribeToRemoteArticles(callback: (articles: NewsArticle[]) => void): () => void {
  try {
    const colRef = collection(db, ARTICLES_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        const items: NewsArticle[] = [];
        snap.forEach((d) => items.push(d.data() as NewsArticle));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        console.warn('[Firebase] Articles snapshot listener notice:', error);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to attach articles listener:', err);
    return () => {};
  }
}

// --- MEDIA ITEMS ---
export async function fetchRemoteMedia(): Promise<MediaItem[] | null> {
  try {
    const colRef = collection(db, MEDIA_COLLECTION);
    const snap = await getDocs(colRef);
    const items: MediaItem[] = [];
    snap.forEach((d) => items.push(d.data() as MediaItem));
    return items;
  } catch (err) {
    console.warn('[Firebase] unable to fetch remote media:', err);
  }
  return null;
}

export async function syncRemoteMediaItem(item: MediaItem): Promise<void> {
  try {
    const docRef = doc(db, MEDIA_COLLECTION, item.id);
    await setDoc(docRef, {
      ...item,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] unable to sync media item:', err);
  }
}

export async function deleteRemoteMediaItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, MEDIA_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firebase] unable to delete remote media:', err);
  }
}

// --- GRADUATION DATA ---
export async function fetchRemoteGraduation(): Promise<{ config?: GraduationConfig; students?: GraduationStudent[] } | null> {
  try {
    const docRef = doc(db, GRADUATION_COLLECTION, 'data');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as { config?: GraduationConfig; students?: GraduationStudent[] };
    }
  } catch (err) {
    console.warn('[Firebase] unable to fetch remote graduation:', err);
  }
  return null;
}

export async function syncRemoteGraduation(config?: GraduationConfig, students?: GraduationStudent[]): Promise<void> {
  try {
    const docRef = doc(db, GRADUATION_COLLECTION, 'data');
    const updateObj: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };
    if (config) updateObj.config = config;
    if (students) updateObj.students = students;

    await setDoc(docRef, updateObj, { merge: true });
  } catch (err) {
    console.warn('[Firebase] unable to sync graduation config:', err);
  }
}
