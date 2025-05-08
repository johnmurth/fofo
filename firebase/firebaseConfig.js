// firebase.js (or firebaseConfig.js)
import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbPHhOu776l5tp8qvXRJRZ7QY_R-DJKNA",
  authDomain: "fofo-4c356.firebaseapp.com",
  projectId: "fofo-4c356",
  storageBucket: "fofo-4c356.appspot.com",
  messagingSenderId: "207618174282",
  appId: "1:207618174282:web:c3996314ce7c38ef3aa5b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize other services
const db = getFirestore(app);
const storage = getStorage(app);

// Export initialized services
export { auth, db, storage };