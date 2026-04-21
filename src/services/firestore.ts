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
  getDocFromServer,
  writeBatch,
  onSnapshot,
  limit,
  getCountFromServer
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../firebase";
import type { 
  BusinessListing, 
  BusinessStatus, 
  PlanRequest, 
  MembershipPlan, 
  Enquiry, 
  ChatMessage, 
  Notification,
  UserProfile
} from "../types";

/**
 * Throws a JSON string of FirestoreErrorInfo if a permission error occurs.
 */
export const handleFirestoreError = (error: any, operationType: string, path: string | null = null) => {
  if (error.code === 'permission-denied' || error.message?.includes('insufficient permissions')) {
    const authInfo = {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || 'none',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      providerInfo: auth.currentUser?.providerData?.map(p => ({
        providerId: String(p.providerId),
        displayName: String(p.displayName || ''),
        email: String(p.email || ''),
      })) || []
    };
    
    // Create a safe, flat object for stringification
    const errorData = {
      error: "Missing or insufficient permissions.",
      operationType: String(operationType),
      path: path ? String(path) : null,
      authInfo
    };

    let serialized: string;
    try {
      // Defensively stringify to catch any potential structure issues
      serialized = JSON.stringify(errorData);
    } catch (stringifyError) {
      // Fallback for circular structures or other serialization failures
      serialized = `Missing or insufficient permissions. Operation: ${operationType}, Path: ${path || 'unknown'}, User: ${authInfo.userId}`;
    }
    
    throw new Error(serialized, { cause: error });
  }
  throw error;
};

export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
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

// --- Notifications ---
export const createNotification = async (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
  return addDoc(collection(db, "notifications"), {
    ...notif,
    read: false,
    createdAt: serverTimestamp()
  });
};

export const markNotificationRead = (id: string) => {
  return updateDoc(doc(db, "notifications", id), { read: true });
};

// --- Users & Admin ---
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
};

export const updateUserStatus = (uid: string, status: 'active' | 'blocked') => {
  return updateDoc(doc(db, "users", uid), { status });
};

export const updateUserRole = (uid: string, role: string) => {
  return updateDoc(doc(db, "users", uid), { role });
};

// --- Business & Plans ---
export const createBusinessWithPlan = async (
  bizData: Omit<BusinessListing, 'id' | 'status' | 'planApproved' | 'createdAt'>,
  selectedPlan: MembershipPlan
) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  try {
    const batch = writeBatch(db);
    
    // 1. Create Business Listing (status: under_review, planApproved: false)
    const bizRef = doc(collection(db, "businesses"));
    const bizId = bizRef.id;
    
    batch.set(bizRef, {
      ...bizData,
      id: bizId,
      status: "under_review",
      planApproved: false,
      planType: selectedPlan,
      createdAt: serverTimestamp(),
    });

    // 2. Create Plan Request
    const planReqRef = doc(collection(db, "plan_requests"));
    batch.set(planReqRef, {
      assetOwnerId: auth.currentUser.uid,
      businessId: bizId,
      planName: selectedPlan,
      status: "pending",
      createdAt: serverTimestamp(),
    } as Omit<PlanRequest, 'id'>);

    await batch.commit();
    return bizId;
  } catch (error) {
    return handleFirestoreError(error, 'create', 'businesses-with-plan');
  }
};

// --- Enquiries & Chat ---
export const sendEnquiry = async (biz: BusinessListing, message: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const enquiryData: Omit<Enquiry, 'id'> = {
    acquirerId: auth.currentUser.uid,
    ownerId: biz.ownerId,
    businessId: biz.id,
    message,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, "enquiries"), enquiryData);
  
  // Notify owner
  await createNotification({
    userId: biz.ownerId,
    title: "New Acquisition Enquiry",
    message: `An acquirer is interested in "${biz.title}".`,
    type: "new_enquiry",
    relatedId: docRef.id
  });

  return docRef.id;
};

export const getEnquiries = async (role: 'acquirer' | 'seller') => {
  if (!auth.currentUser) return [];
  const field = role === 'acquirer' ? 'acquirerId' : 'ownerId';
  const q = query(collection(db, "enquiries"), where(field, "==", auth.currentUser.uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry));
};

export const getMessages = (enquiryId: string, callback: (msgs: ChatMessage[]) => void) => {
  if (!auth.currentUser) return () => {};
  
  const q = query(
    collection(db, "chats"), 
    where("enquiryId", "==", enquiryId), 
    where("participants", "array-contains", auth.currentUser.uid),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
  });
};

export const sendMessage = async (enquiryId: string, text: string, receiverId: string) => {
  if (!auth.currentUser) return;
  
  const msgRef = await addDoc(collection(db, "chats"), {
    enquiryId,
    senderId: auth.currentUser.uid,
    receiverId,
    participants: [auth.currentUser.uid, receiverId],
    text,
    createdAt: serverTimestamp()
  });

  await createNotification({
    userId: receiverId,
    title: "New Transmission",
    message: "You received a new message regarding a listing.",
    type: "new_message",
    relatedId: enquiryId
  });

  return msgRef.id;
};

export const getApprovedBusinesses = async (filters?: { 
  category?: string; 
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limitCount?: number;
}) => {
  let q = query(
    collection(db, "businesses"), 
    where("status", "==", "approved"),
    where("planApproved", "==", true)
  );

  if (filters?.category && filters.category !== 'All') {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters?.country && filters.country !== 'All') {
    q = query(q, where("location.country", "==", filters.country));
  }
  if (filters?.city) {
    q = query(q, where("location.city", "==", filters.city));
  }

  const querySnapshot = await getDocs(q);
  let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing));
  
  // Client-side filtering for search and price range (since Firestore composite queries are limited without indexes)
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(b => 
      b.title.toLowerCase().includes(s) || 
      b.description.toLowerCase().includes(s) ||
      b.location.city.toLowerCase().includes(s)
    );
  }

  if (filters?.minPrice !== undefined) {
    results = results.filter(b => b.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    results = results.filter(b => b.price <= filters.maxPrice!);
  }

  const planWeights = { 'Platinum': 3, 'Intermediate': 2, 'Basic': 1 };
  results.sort((a, b) => {
    if (a.planType !== b.planType) {
      return planWeights[b.planType] - planWeights[a.planType];
    }
    return b.createdAt?.toMillis() - a.createdAt?.toMillis();
  });

  if (filters?.limitCount) {
    return results.slice(0, filters.limitCount);
  }

  return results;
};

// --- Favorites ---
export const toggleFavorite = async (businessId: string) => {
  if (!auth.currentUser) throw new Error("Authentication required");
  
  const q = query(
    collection(db, "favorites"), 
    where("userId", "==", auth.currentUser.uid), 
    where("businessId", "==", businessId)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    await addDoc(collection(db, "favorites"), {
      userId: auth.currentUser.uid,
      businessId,
      createdAt: serverTimestamp()
    });
    return true; // Added
  } else {
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    return false; // Removed
  }
};

export const getFavorites = async () => {
  if (!auth.currentUser) return [];
  const q = query(collection(db, "favorites"), where("userId", "==", auth.currentUser.uid));
  const snap = await getDocs(q);
  const businessIds = snap.docs.map(d => d.data().businessId);
  
  if (businessIds.length === 0) return [];

  // Fetch the actual businesses
  const results: BusinessListing[] = [];
  for (const id of businessIds) {
    const biz = await getBusinessById(id);
    if (biz) results.push(biz);
  }
  return results;
};

export const isFavorite = async (businessId: string) => {
  if (!auth.currentUser) return false;
  const q = query(
    collection(db, "favorites"), 
    where("userId", "==", auth.currentUser.uid), 
    where("businessId", "==", businessId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
};

// --- Admin Panel Services ---
export const getAdminStats = async () => {
  const usersColl = collection(db, "users");
  const bizColl = collection(db, "businesses");
  const planReqColl = collection(db, "plan_requests");
  const enquiryColl = collection(db, "enquiries");

  const [uCount, sCount, bCount, pbCount, ppCount, eCount] = await Promise.all([
    getCountFromServer(usersColl),
    getCountFromServer(query(usersColl, where("role", "==", "seller"))),
    getCountFromServer(bizColl),
    getCountFromServer(query(bizColl, where("status", "==", "under_review"))),
    getCountFromServer(query(planReqColl, where("status", "==", "pending"))),
    getCountFromServer(enquiryColl)
  ]);

  return {
    totalUsers: uCount.data().count,
    totalSellers: sCount.data().count,
    totalListings: bCount.data().count,
    pendingListings: pbCount.data().count,
    pendingPlans: ppCount.data().count,
    totalEnquiries: eCount.data().count,
  };
};

export const getRecentActivities = async () => {
  const usersQ = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5));
  const bizQ = query(collection(db, "businesses"), orderBy("createdAt", "desc"), limit(5));
  
  const [uSnap, bSnap] = await Promise.all([getDocs(usersQ), getDocs(bizQ)]);
  
  const activities: any[] = [];
  
  uSnap.forEach(d => {
    activities.push({
      id: d.id,
      type: 'user_joined',
      title: 'New Principal Onboarded',
      message: `${d.data().name} joined as ${d.data().role}`,
      time: d.data().createdAt
    });
  });
  
  bSnap.forEach(d => {
    activities.push({
      id: d.id,
      type: 'listing_created',
      title: 'New Asset Transmission',
      message: `${d.data().title} submitted for review`,
      time: d.data().createdAt
    });
  });
  
  return activities.sort((a, b) => {
    const timeA = a.time?.toMillis() || 0;
    const timeB = b.time?.toMillis() || 0;
    return timeB - timeA;
  }).slice(0, 8);
};

export const getAllPlanRequests = async () => {
  const q = query(collection(db, "plan_requests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlanRequest));
};

export const approvePlanRequest = async (requestId: string, assetOwnerId: string, planName: MembershipPlan) => {
  const batch = writeBatch(db);
  
  // 1. Update Request
  const reqRef = doc(db, "plan_requests", requestId);
  batch.update(reqRef, { status: 'approved' });

  // 2. Update User Subscription
  const userRef = doc(db, "users", assetOwnerId);
  batch.update(userRef, {
    subscription: {
      planId: planName,
      active: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  });

  // 3. Update Business planApproved status (associated with this request)
  const reqSnap = await getDoc(reqRef);
  if (reqSnap.exists()) {
    const bizId = reqSnap.data().businessId;
    if (bizId) {
      const bizRef = doc(db, "businesses", bizId);
      batch.update(bizRef, { planApproved: true });
    }
  }

  // 4. Create Historical Subscription Entry
  const subRef = doc(collection(db, "subscriptions"));
  batch.set(subRef, {
    assetOwnerId,
    planId: planName,
    startDate: serverTimestamp(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    active: true,
    requestId
  });

  await batch.commit();

  await createNotification({
    userId: assetOwnerId,
    title: "Plan Approved",
    message: `Your request for the ${planName} membership has been approved.`,
    type: "plan_update",
    relatedId: requestId
  });
};

export const createPlanRequest = async (planName: MembershipPlan, businessId?: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const planReqData: any = {
    assetOwnerId: auth.currentUser.uid,
    planName,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  if (businessId) {
    planReqData.businessId = businessId;
  }

  const docRef = await addDoc(collection(db, "plan_requests"), planReqData);
  
  // Also create a notification for the seller to confirm submission
  await createNotification({
    userId: auth.currentUser.uid,
    title: "Plan Request Submitted",
    message: `Your request for the ${planName} plan has been transmitted to our administrative team for review.`,
    type: "plan_update",
    relatedId: docRef.id
  });

  return docRef.id;
};

export const rejectPlanRequest = async (requestId: string, assetOwnerId: string, notes: string) => {
  await updateDoc(doc(db, "plan_requests", requestId), { 
    status: 'rejected',
    notes 
  });

  await createNotification({
    userId: assetOwnerId,
    title: "Plan Request Update",
    message: "Your membership plan request was not approved. Review admin notes for details.",
    type: "plan_update",
    relatedId: requestId
  });
};

export const getAllBusinessesAdmin = async () => {
  const q = query(collection(db, "businesses"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessListing));
};

export const approveListing = async (businessId: string, ownerId: string) => {
  await updateDoc(doc(db, "businesses", businessId), { status: 'approved' });
  
  await createNotification({
    userId: ownerId,
    title: "Listing Approved",
    message: "Your business listing is now live on Inves4Business.",
    type: "listing_update",
    relatedId: businessId
  });
};

export const rejectListing = async (businessId: string, ownerId: string) => {
  await updateDoc(doc(db, "businesses", businessId), { status: 'rejected' });

  await createNotification({
    userId: ownerId,
    title: "Listing Rejected",
    message: "Your listing requires revisions. Please check your dashboard.",
    type: "listing_update",
    relatedId: businessId
  });
};

export const deleteListing = async (businessId: string) => {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "businesses", businessId));
};

export const getAllEnquiriesAdmin = async () => {
  const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry));
};
