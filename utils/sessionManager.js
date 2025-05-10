// sessionManager.js - Manage authentication session persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Session constants
const AUTH_SESSION_KEY = 'auth_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Initialize session listener to keep track of authentication state
 * @param {Function} onSessionChange - Callback when session changes
 * @returns {Function} Unsubscribe function
 */
export const initSessionListener = (onSessionChange) => {
  const auth = getAuth();
  
  // Listen for auth state changes
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in, save session
      await saveSession(user);
      onSessionChange && onSessionChange(true);
    } else {
      // User is signed out, clear session
      await clearSession();
      onSessionChange && onSessionChange(false);
    }
  });
  
  return unsubscribe;
};

/**
 * Save current authentication session
 * @param {Object} user - Firebase user object
 */
export const saveSession = async (user) => {
  if (!user) return;
  
  try {
    const sessionData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      timestamp: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT
    };
    
    await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
    console.log('Auth session saved successfully');
  } catch (error) {
    console.error('Error saving auth session:', error);
  }
};

/**
 * Clear current authentication session
 */
export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
    console.log('Auth session cleared');
  } catch (error) {
    console.error('Error clearing auth session:', error);
  }
};

/**
 * Check if there's a valid cached session
 * @returns {Promise<boolean>} Whether there's a valid session
 */
export const hasValidSession = async () => {
  try {
    const sessionData = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    if (!sessionData) return false;
    
    const session = JSON.parse(sessionData);
    const now = Date.now();
    
    // Check if session is still valid
    return session && session.expiresAt && session.expiresAt > now;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

/**
 * Extend current session timeout
 */
export const extendSession = async () => {
  try {
    const sessionData = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    if (!sessionData) return;
    
    const session = JSON.parse(sessionData);
    session.expiresAt = Date.now() + SESSION_TIMEOUT;
    
    await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    console.log('Session extended');
  } catch (error) {
    console.error('Error extending session:', error);
  }
};