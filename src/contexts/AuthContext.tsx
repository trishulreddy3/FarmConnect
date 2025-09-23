import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, facebookProvider, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: (role?: 'farmer' | 'buyer') => Promise<void>;
  signInWithFacebook: (role?: 'farmer' | 'buyer') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, role: 'farmer' | 'buyer') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanFirestoreData = (data: any) => {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      if (value === undefined) {
        return null;
      }
      return value;
    }));
  };

  const createUserDocument = async (firebaseUser: FirebaseUser, role?: 'farmer' | 'buyer', retryCount = 0) => {
    try {
      // Ensure we have a valid auth token before making Firestore requests
      await firebaseUser.getIdToken();
      
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      } catch (docError) {
        console.warn('Error reading user document, will create new one:', docError);
        userDoc = { exists: () => false };
      }
      
      if (!userDoc.exists()) {
        // If no role is provided, throw an error to force role selection
        if (!role) {
          throw new Error('User role must be specified');
        }

        const defaultProfile = role === 'farmer' ? {
          farmName: '',
          location: { address: '', coordinates: { lat: 0, lng: 0 } },
          farmSize: '',
          certifications: [],
          experience: 0,
          bio: '',
          phone: ''
        } : {
          companyName: '',
          businessType: '',
          location: { address: '', coordinates: { lat: 0, lng: 0 } },
          bio: '',
          phone: ''
        };

        const newUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          role: role, // Use the provided role, no default
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          profile: defaultProfile
        };

        // Only add photoURL if it exists
        if (firebaseUser.photoURL) {
          newUser.photoURL = firebaseUser.photoURL;
        }

        // Ensure no undefined values are passed to Firestore
        const cleanUser = cleanFirestoreData(newUser);
        await setDoc(doc(db, 'users', firebaseUser.uid), cleanUser);
        
        // Return user with proper Date objects for the app
        return {
          ...newUser,
          createdAt: new Date(),
          updatedAt: new Date()
        } as User;
      } else {
        try {
          const userData = userDoc.data();
          // Clean any undefined values from existing user data
          const cleanUserData = cleanFirestoreData(userData);
          
          // If a role is provided and it's different from the existing role, update it
          if (role && role !== cleanUserData.role) {
            const updatedUser = {
              ...cleanUserData,
              role: role,
              updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser);
            return { ...updatedUser, updatedAt: new Date() } as User;
          }
          
          return cleanUserData as User;
        } catch (dataError) {
          console.warn('Error reading user data, recreating document:', dataError);
          // If there's an error reading the data, delete the corrupted document and recreate it
          if (retryCount < 2) { // Prevent infinite recursion
            await deleteDoc(doc(db, 'users', firebaseUser.uid));
            // Recursively call this function to create a new document
            return await createUserDocument(firebaseUser, role, retryCount + 1);
          } else {
            throw new Error('Failed to create user document after multiple attempts');
          }
        }
      }
    } catch (error) {
      console.error('Error creating/fetching user document:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (role?: 'farmer' | 'buyer') => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = await createUserDocument(result.user, role);
      setCurrentUser(user);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else {
        throw new Error('Failed to sign in with Google. Please try again.');
      }
    }
  };

  const signInWithFacebook = async (role?: 'farmer' | 'buyer') => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = await createUserDocument(result.user, role);
      setCurrentUser(user);
    } catch (error: any) {
      console.error('Error signing in with Facebook:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else {
        throw new Error('Failed to sign in with Facebook. Please try again.');
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, role: 'farmer' | 'buyer') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = await createUserDocument(result.user, role);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Wait for auth token to be ready
          await firebaseUser.getIdToken();
          
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User);
          } else {
            // If user document doesn't exist, create it
            const user = await createUserDocument(firebaseUser);
            setCurrentUser(user);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        // If there's an error, still set loading to false to prevent infinite loading
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};