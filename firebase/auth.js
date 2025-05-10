// hooks/useAuth.js - Enhanced version
import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const db = getFirestore();
  
  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        console.log("Auth state changed: User logged in", firebaseUser.uid);
        setUser(firebaseUser);
        
        // Save session data to AsyncStorage
        try {
          const sessionData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            timestamp: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          };
          
          AsyncStorage.setItem('auth_session', JSON.stringify(sessionData))
            .then(() => console.log("Session data saved to AsyncStorage"))
            .catch(err => console.error("Error saving session data:", err));
        } catch (err) {
          console.error("Error preparing session data:", err);
        }
      } else {
        console.log("Auth state changed: User logged out");
        setUser(null);
        
        // Clear session data
        AsyncStorage.removeItem('auth_session')
          .then(() => console.log("Session data cleared from AsyncStorage"))
          .catch(err => console.error("Error clearing session data:", err));
      }
      
      setLoading(false);
      setError(null);
    }, (authError) => {
      // This is the error callback for onAuthStateChanged
      console.error("Auth state change error:", authError);
      setError(`Authentication error: ${authError.message}`);
      setLoading(false);
    });
    
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, [auth]);
  
  const signIn = async (email, password) => {
    console.log("Attempting to sign in user:", email);
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign in successful for:", userCredential.user.email);
      // The auth state listener will update the user state
      return true;
    } catch (error) {
      console.error("Sign in error:", error);
      setLoading(false);
      
      let errorMessage = 'Sign in failed';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else {
        errorMessage = `Sign in failed: ${error.message}`;
      }
      
      setError(errorMessage);
      return false;
    }
  };
  
  const signUp = async (email, password, displayName) => {
    console.log("Attempting to create user:", email);
    setLoading(true);
    setError(null);
    
    try {
      // Validate password length
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return false;
      }
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully:", userCredential.user.uid);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      console.log("User profile updated with display name");
      
      // Create user document in Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName: displayName,
          email: email,
          photoURL: '',
          createdAt: new Date(),
          bio: '',
        });
        console.log("User document created in Firestore");
      } catch (firestoreError) {
        console.error("Error creating user document:", firestoreError);
        // Continue anyway since the user account was created
      }
      
      // The auth state listener will update the user state
      return true;
    } catch (error) {
      console.error("Sign up error:", error);
      setLoading(false);
      
      let errorMessage = 'Sign up failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak (minimum 6 characters)';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else {
        errorMessage = `Sign up failed: ${error.message}`;
      }
      
      setError(errorMessage);
      return false;
    }
  };
  
  const logOut = async () => {
    console.log("Attempting to sign out user");
    setLoading(true);
    
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      setError(`Sign out failed: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Debugging function
  const checkAuthStatus = () => {
    const currentUser = auth.currentUser;
    console.log("Current Firebase user:", currentUser ? currentUser.uid : "No user");
    return !!currentUser;
  };
  
  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logOut,
    checkAuthStatus
  };
};

export default useAuth;