'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';

interface UserData {
  uid: string;
  name: string;
  phone: string;
  email: string;
  createdAt: any;
  lastLogin: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserData(user.uid);
        await updateLastLogin(user.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserData({ uid, ...userDoc.data() } as UserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateLastLogin = async (uid: string) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const createUserDocument = async (user: User, additionalData?: { name?: string; phone?: string }) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const { displayName, email } = user;
        const userData = {
          name: additionalData?.name || displayName || '',
          phone: additionalData?.phone || '',
          email: email || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };
        
        await setDoc(userRef, userData);
        setUserData({ uid: user.uid, ...userData });
      }
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await createUserDocument(result.user);
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string, phone: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user, { name, phone });
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    signupWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};