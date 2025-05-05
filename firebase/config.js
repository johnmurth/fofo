// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbPHhOu776l5tp8qvXRJRZ7QY_R-DJKNA",
  authDomain: "fofo-4c356.firebaseapp.com",
  projectId: "fofo-4c356",
  storageBucket: "fofo-4c356.firebasestorage.app",
  messagingSenderId: "207618174282",
  appId: "1:207618174282:web:c3996314ce7c38ef3aa5b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);