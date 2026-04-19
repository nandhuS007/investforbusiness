import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  orderBy, 
  serverTimestamp,
  type DocumentData,
  getDocFromServer
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../firebase";
import type { BusinessListing, BusinessStatus } from "../types";

// Test connection
async function testConnection() {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await getDocFromServer(testDocRef);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      // Expected if rules for /test/connection are not yet deployed or if public read is not desired
      return;
    }
    if (error.message?.includes('offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}
testConnection();

/**
 * Throws a JSON string of FirestoreErrorInfo if a permission error occurs.
 */
export const handleFirestoreError = (error: any, operationType: any, path: string | null = null) => {
  if (error.code === 'permission-denied' || error.message?.includes('insufficient permissions')) {
    const authInfo = {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || 'none',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      providerInfo: auth.currentUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })) || []
    };
    
    throw new Error(JSON.stringify({
      error: "Missing or insufficient permissions.",
      operationType,
      path,
      authInfo
    }));
  }
  throw error;
};

export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const createBusiness = async (bizData: Omit<BusinessListing, 'id' | 'status' | 'createdAt'>) => {
  try {
    return await addDoc(collection(db, "businesses"), {
      ...bizData,
      status: "under_review",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    return handleFirestoreError(error, 'create', 'businesses');
  }
};

export const getApprovedBusinesses = async (filters?: { category?: string; location?: string }) => {
  let q = query(
    collection(db, "businesses"), 
    where("status", "==", "approved"),
    orderBy("isFeatured", "desc"),
    orderBy("createdAt", "desc")
  );

  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing));
};

export const getBusinessById = async (id: string) => {
  const docRef = doc(db, "businesses", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as BusinessListing;
  }
  return null;
};

export const updateBusinessStatus = async (id: string, status: BusinessStatus) => {
  const docRef = doc(db, "businesses", id);
  return await updateDoc(docRef, { status });
};
