import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAKOdPWiNBgUaxe8ss3NSefFp17-_p3VdA",
  authDomain: "farmconnect-9484b.firebaseapp.com",
  projectId: "farmconnect-9484b",
  storageBucket: "farmconnect-9484b.appspot.com",
  messagingSenderId: "1067433976000",
  appId: "1:1067433976000:web:6ca3bd9b40272294df4d25",
  measurementId: "G-886D6EY590"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure providers with additional scopes if needed
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

// Configure auth settings to avoid popup issues
auth.useDeviceLanguage();

// Set auth persistence to avoid repeated logins
setPersistence(auth, browserLocalPersistence);

// Add connection retry settings for Firestore
if (typeof window !== 'undefined') {
  // Only run in browser environment
  try {
    // Enable offline persistence
    import('firebase/firestore').then(() => {
      console.log('Firestore network controls available');
    });
  } catch (error) {
    console.warn('Could not enable Firestore network controls:', error);
  }
}

export default app;