// postUploadUtils.js - Main entry point that uses all components
import { Alert, Platform } from 'react-native';
import { getStorage } from 'firebase/storage';

// Import utility function from restructured code
import { uploadPost } from './postUploadService';
import { initSessionListener, hasValidSession } from './sessionManager';

// Init session listener in app startup (should be called in app initialization)
let unsubscribeSession = null;
export const setupAuthListener = (onSessionChange) => {
  // Clean up previous listener if it exists
  if (unsubscribeSession) {
    unsubscribeSession();
  }
  
  // Setup new listener
  unsubscribeSession = initSessionListener(onSessionChange);
  return unsubscribeSession;
};

/**
 * Upload post with better error handling and session management
 * This is the main function that should be used in your components
 */
export const uploadPostWithSession = async ({
  user,
  db,
  postMode,
  selectedMedia,
  captions,
  textPost,
  navigation
}) => {
  console.log('Starting uploadPostWithSession...');
  
  try {
    // Check session status
    const hasSession = await hasValidSession();
    console.log('Session validation result:', hasSession);
    
    if (!hasSession && (!user || !user.uid)) {
      // If no session and no user, prompt for authentication
      Alert.alert(
        'Authentication Required',
        'Please sign in to post content.',
        [
          { 
            text: 'Sign In', 
            onPress: () => navigation.navigate('Login', { returnTo: 'CreatePost' })
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    
    // Initialize storage
    const storage = getStorage();
    
    // Log storage configuration for debugging
    if (storage?.app?.options) {
      console.log('Using storage bucket:', storage.app.options.storageBucket);
    }
    
    // Show progress indicator
    if (selectedMedia && selectedMedia.length > 0) {
      // Show upload progress indicator (implementation depends on your UI)
      Alert.alert('Uploading', 'Your post is being uploaded. Please wait...');
    }
    
    // Validate platform-specific constraints
    if (Platform.OS !== 'web') {
      try {
        // Some native-only validations could go here
        console.log('Platform:', Platform.OS);
      } catch (platformError) {
        console.error('Platform check error:', platformError);
      }
    }
    
    // Call the main uploadPost function with all required parameters
    await uploadPost({
      user,
      db,
      storage,
      postMode,
      selectedMedia,
      captions,
      textPost,
      navigation
    });
    
  } catch (error) {
    console.error('Error in uploadPostWithSession:', error);
    
    // Show generic error message
    Alert.alert(
      'Upload Failed',
      'There was a problem uploading your post. Please try again later.'
    );
  }
};

// Export the cleanup function to be called on component unmount
export const cleanupAuthListener = () => {
  if (unsubscribeSession) {
    unsubscribeSession();
    unsubscribeSession = null;
    console.log('Auth listener cleaned up');
  }
};