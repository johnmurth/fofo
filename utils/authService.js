// authService.js - Handle authentication related operations
import { doc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Gets current user data from Firestore and validates authentication
 * @param {Object} user - Firebase user object
 * @param {Object} db - Firestore database reference
 * @returns {Promise<Object>} User data object or default values if not found
 */
export const getUserData = async (user, db) => {
  if (!user || !user.uid) {
    throw new Error('Invalid user: User must be authenticated');
  }
  
  // Verify user authentication state
  try {
    await user.getIdToken(true);
    console.log('User authentication token refreshed successfully');
  } catch (tokenError) {
    console.error('Error refreshing authentication token:', tokenError);
    throw new Error('Authentication session expired. Please log in again.');
  }

  // Get user data
  let userData = { displayName: 'Anonymous', photoURL: '', label: 'No label' };
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      userData = userDoc.data();
      console.log('Retrieved user data successfully');
      
      // Cache user data for offline access
      await AsyncStorage.setItem('cachedUserData', JSON.stringify(userData));
    } else {
      console.log('User document not found, using default values');
      
      // Try to load from cache if document doesn't exist
      try {
        const cachedData = await AsyncStorage.getItem('cachedUserData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData.displayName && parsedData.displayName !== 'Anonymous') {
            userData = parsedData;
            console.log('Using cached user data');
          }
        }
      } catch (cacheError) {
        console.error('Error reading cached user data:', cacheError);
      }
    }
  } catch (userError) {
    console.error('Error fetching user data:', userError);
    
    // Try to load from cache if fetch fails
    try {
      const cachedData = await AsyncStorage.getItem('cachedUserData');
      if (cachedData) {
        userData = JSON.parse(cachedData);
        console.log('Using cached user data due to fetch error');
      }
    } catch (cacheError) {
      console.error('Error reading cached user data:', cacheError);
    }
  }
  
  return userData;
};

/**
 * Validates the current authentication state
 * @param {Object} user - Firebase user object
 * @returns {Promise<boolean>} Whether user is authenticated
 */
export const validateAuthState = async (user) => {
  if (!user || !user.uid) {
    return false;
  }
  
  try {
    // Check if user token is still valid
    await user.getIdToken(false); // Don't force refresh
    return true;
  } catch (error) {
    console.error('Authentication validation failed:', error);
    return false;
  }
};

/**
 * Handle authentication errors with proper user feedback
 * @param {Error} error - Authentication error
 * @param {Function} navigateToAuth - Navigation function to auth screen
 */
export const handleAuthError = (error, navigateToAuth) => {
  console.error('Authentication error:', error);
  
  let message = 'Please sign in to continue.';
  if (error?.message?.includes('expired')) {
    message = 'Your session has expired. Please sign in again.';
  }
  
  Alert.alert(
    'Authentication Required',
    message,
    [
      { 
        text: 'Sign In', 
        onPress: () => navigateToAuth && navigateToAuth()
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]
  );
};