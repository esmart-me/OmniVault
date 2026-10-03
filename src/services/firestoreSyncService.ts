import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { LifeAdminItem } from '../types/document';

/**
 * Fetches user's items from Firestore
 */
export async function fetchUserItemsFromFirestore(userId: string): Promise<LifeAdminItem[]> {
  try {
    const colRef = collection(db, 'users', userId, 'items');
    const snapshot = await getDocs(colRef);
    const items: LifeAdminItem[] = [];
    snapshot.forEach(docSnap => {
      items.push({ ...(docSnap.data() as LifeAdminItem), id: docSnap.id });
    });
    return items;
  } catch (err) {
    console.error('Failed to fetch items from Firestore:', err);
    return [];
  }
}

/**
 * Saves or updates a single item in Firestore
 */
export async function saveItemToFirestore(userId: string, item: LifeAdminItem): Promise<void> {
  try {
    const itemRef = doc(db, 'users', userId, 'items', item.id);
    await setDoc(itemRef, {
      ...item,
      userId,
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save item to Firestore:', err);
  }
}

/**
 * Deletes an item from Firestore
 */
export async function deleteItemFromFirestore(userId: string, itemId: string): Promise<void> {
  try {
    const itemRef = doc(db, 'users', userId, 'items', itemId);
    await deleteDoc(itemRef);
  } catch (err) {
    console.warn('Failed to delete item from Firestore:', err);
  }
}

/**
 * Merges local items into Firestore batch
 */
export async function syncLocalItemsToFirestore(userId: string, items: LifeAdminItem[]): Promise<void> {
  if (items.length === 0) return;
  try {
    const batch = writeBatch(db);
    items.forEach(item => {
      const ref = doc(db, 'users', userId, 'items', item.id);
      batch.set(ref, {
        ...item,
        userId,
        updated_at: new Date().toISOString()
      }, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Batch sync to Firestore failed:', err);
  }
}
