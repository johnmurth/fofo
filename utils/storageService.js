// storageService.js - Firebase Storage utilities
import { getStorage } from 'firebase/storage';
import { Alert } from 'react-native';

/**
 * Initialize Firebase Storage with error handling
 * @returns {Object} Firebase Storage instance
 */
export const initializeStorage = () => {
  try {
    const storage = getStorage();
    console.log("Retrieved storage instance"); 
    return storage;
  } catch (storageError) {
    console.error("Failed to get storage:", storageError);
    Alert.alert('Storage Error', 'Failed to initialize Firebase Storage. Please restart the app.');
    return null;
  }
};

/**
 * Validate connectivity to Firebase Storage
 * @param {Object} storage - Firebase Storage instance
 * @returns {Promise<boolean>} Whether storage is accessible
 */
export const validateStorageConnectivity = async (storage) => {
  if (!storage) {
    return false;
  }
  
  try {
    const testUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o`;
    const response = await fetch(testUrl);
    const isConnected = response.status < 500; // Any non-server error means the API is reachable
    console.log('Storage API reachable:', response.status, isConnected);
    return isConnected;
  } catch (networkError) {
    console.error('Storage API network check failed:', networkError);
    return false;
  }
};

/**
 * Get file size limit in bytes
 * @returns {number} Size limit in bytes (20MB)
 */
export const getFileSizeLimit = () => {
  return 20 * 1024 * 1024; // 20MB
};

/**
 * Check if file size is within the allowed limit
 * @param {number} fileSize - Size of file in bytes
 * @returns {boolean} Whether file is within size limit
 */
export const isFileSizeValid = (fileSize) => {
  if (!fileSize) return true; // If size is unknown, assume it's valid
  return fileSize <= getFileSizeLimit();
};