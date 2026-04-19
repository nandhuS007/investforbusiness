import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { UserProfile } from "../types";

interface AuthContextType {
  user: (User & UserProfile) | null;
  loading: boolean;
  isAdmin: boolean;
  isSeller: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isSeller: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & UserProfile) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      try {
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          
          // Initial check/create
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: 'buyer',
              createdAt: serverTimestamp(),
            });
          }

          // Live sync the profile
          unsubscribeProfile = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              const profile = doc.data() as UserProfile;
              setUser({ ...firebaseUser, ...profile } as any);
              setLoading(false);
            }
          });
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isSeller }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
