import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDbPHhOu776l5tp8qvXRJRZ7QY_R-DJKNA",
  authDomain: "fofo-4c356.firebaseapp.com",
  projectId: "fofo-4c356",
  storageBucket: "fofo-4c356.firebasestorage.app",
  messagingSenderId: "207618174282",
  appId: "1:207618174282:web:c3996314ce7c38ef3aa5b3"
};

// Initialize Firebase App (singleton pattern)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth (with singleton check)
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  if (e.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  }
}

// Initialize other services
const db = getFirestore(app);
const storage = getStorage(app, "gs://fofo-4c356.firebasestorage.app");

export { auth, db, storage };