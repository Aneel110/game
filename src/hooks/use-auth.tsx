
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isModerator: false,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase auth is initialized
    if (!auth || !db) {
        console.warn("Firebase is not initialized. Auth features will be disabled.");
        setLoading(false);
        return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user document from Firestore to check role
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsAdmin(userData.role === 'admin');
          setIsModerator(userData.role === 'moderator');
        } else {
          setIsAdmin(false);
          setIsModerator(false);
        }

      } else {
        setUser(null);
        setIsAdmin(false);
        setIsModerator(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isModerator, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
