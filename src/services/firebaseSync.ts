import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import {
  SchoolIdentity,
  NewsArticle,
  MediaItem,
  GraduationConfig,
  GraduationStudent
} from '../types';

/**
 * Strips all `undefined` values and ensures valid JSON structure for Firestore.
 * In Firestore SDK, any key with value `undefined` causes setDoc() to fail completely.
 */
function cleanForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  return JSON.parse(JSON.stringify(data));
}

// ----------------- SCHOOL IDENTITY -----------------

export async function fetchRemoteSchoolIdentity(): Promise<SchoolIdentity | null> {
  try {
    const docRef = doc(db, 'schoolIdentity', 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SchoolIdentity;
    }
  } catch (err) {
    console.warn('[Firebase] unable to fetch remote school identity:', err);
  }
  return null;
}

export async function syncRemoteSchoolIdentity(identity: SchoolIdentity): Promise<boolean> {
  try {
    const docRef = doc(db, 'schoolIdentity', 'global');
    const cleaned = cleanForFirestore({
      ...identity,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned, { merge: true });
    console.log('[Firebase] School identity synced successfully to Cloud Firestore');
    return true;
  } catch (err) {
    console.warn('[Firebase] unable to sync school identity:', err);
    return false;
  }
}

export function subscribeToRemoteSchoolIdentity(
  callback: (identity: SchoolIdentity) => void
): () => void {
  try {
    const docRef = doc(db, 'schoolIdentity', 'global');
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

// ----------------- ARTICLES -----------------

export async function fetchRemoteArticles(): Promise<NewsArticle[] | null> {
  try {
    const colRef = collection(db, 'articles');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const articles: NewsArticle[] = [];
      snap.forEach((d) => {
        articles.push(d.data() as NewsArticle);
      });
      articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return articles;
    }
    return [];
  } catch (err) {
    console.warn('[Firebase] unable to fetch remote articles:', err);
  }
  return null;
}

export async function syncRemoteArticle(article: NewsArticle): Promise<boolean> {
  try {
    const docRef = doc(db, 'articles', article.id);
    const cleaned = cleanForFirestore(article);
    await setDoc(docRef, cleaned, { merge: true });
    console.log('[Firebase] Article synced to Cloud Firestore:', article.title);
    return true;
  } catch (err) {
    console.warn('[Firebase] unable to sync article to Cloud:', err);
    return false;
  }
}

export async function deleteRemoteArticle(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'articles', id);
    await deleteDoc(docRef);
    console.log('[Firebase] Article deleted from Cloud Firestore:', id);
    return true;
  } catch (err) {
    console.warn('[Firebase] unable to delete remote article:', err);
    return false;
  }
}

export function subscribeToRemoteArticles(
  callback: (articles: NewsArticle[]) => void
): () => void {
  try {
    const colRef = collection(db, 'articles');
    return onSnapshot(
      colRef,
      (snap) => {
        const articles: NewsArticle[] = [];
        snap.forEach((d) => {
          articles.push(d.data() as NewsArticle);
        });
        articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(articles);
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

// ----------------- MEDIA METADATA -----------------

export async function fetchRemoteMedia(): Promise<MediaItem[] | null> {
  try {
    const colRef = collection(db, 'media');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items: MediaItem[] = [];
      snap.forEach((d) => {
        items.push(d.data() as MediaItem);
      });
      return items;
    }
    return [];
  } catch (err) {
    console.warn('[Firebase] unable to fetch remote media:', err);
  }
  return null;
}

export async function syncRemoteMediaItem(item: MediaItem): Promise<boolean> {
  try {
    const itemCopy = { ...item };
    if (itemCopy.dataUrl && itemCopy.dataUrl.length > 500000) {
      delete (itemCopy as any).dataUrl;
    }
    const docRef = doc(db, 'media', item.id);
    const cleaned = cleanForFirestore(itemCopy);
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firebase] unable to sync media item:', err);
    return false;
  }
}

export async function deleteRemoteMediaItem(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'media', id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('[Firebase] unable to delete remote media:', err);
    return false;
  }
}

// ----------------- GRADUATION CONFIG & STUDENTS -----------------

export async function fetchRemoteGraduation(): Promise<{ config?: GraduationConfig; students?: GraduationStudent[] } | null> {
  try {
    const configDoc = await getDoc(doc(db, 'graduationConfig', 'main'));
    const config = configDoc.exists() ? (configDoc.data() as GraduationConfig) : undefined;

    const studentsSnap = await getDocs(collection(db, 'graduationStudents'));
    const students: GraduationStudent[] = [];
    studentsSnap.forEach((d) => students.push(d.data() as GraduationStudent));

    return {
      config,
      students: students.length > 0 ? students : undefined
    };
  } catch (err) {
    console.warn('[Firebase] unable to fetch remote graduation:', err);
    return null;
  }
}

export async function syncRemoteGraduation(config: GraduationConfig, students?: GraduationStudent[]): Promise<boolean> {
  try {
    await setDoc(doc(db, 'graduationConfig', 'main'), cleanForFirestore(config), { merge: true });
    if (students && students.length > 0) {
      for (const st of students) {
        await setDoc(doc(db, 'graduationStudents', st.id || st.nisn), cleanForFirestore(st), { merge: true });
      }
    }
    return true;
  } catch (err) {
    console.warn('[Firebase] unable to sync graduation config:', err);
    return false;
  }
}
