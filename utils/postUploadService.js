// postUploadService.js - Main post upload service that integrates all components
import { Alert } from 'react-native';

// Import all services
import { getUserData, validateAuthState, handleAuthError } from './authService';
import { uploadMediaFile, testStorageConnection } from './mediaUtils';
import { createTextPost, createMediaPost, handlePostError } from './postDataService';
import { initializeStorage, validateStorageConnectivity, isFileSizeValid } from './storageService';
import { extendSession, hasValidSession } from './sessionManager';

/**
 * Main function to handle post uploads with better structure and error handling
 */
export const uploadPost = async ({
  user,
  db,
  storage,
  postMode,
  selectedMedia = [],
  captions = {},
  textPost = '',
  navigation
}) => {
  console.log('Starting uploadPost with:', {
    hasStorage: !!storage,
    mediaCount: selectedMedia?.length || 0,
    postMode,
    userId: user?.uid
  });
  
  try {
    // 1. Validate authentication
    const sessionValid = await hasValidSession();
    if (!sessionValid) {
      const authValid = await validateAuthState(user);
      if (!authValid) {
        throw new Error('authentication_required');
      }
    } else {
      // Extend session if valid
      await extendSession();
    }
    
    if (!user || !user.uid) {
      throw new Error('authentication_required');
    }
    
    // 2. Initialize storage if not provided
    if (!storage) {
      storage = initializeStorage();
      if (!storage) {
        throw new Error('Failed to initialize storage');
      }
    }
    
    // 3. Validate storage connectivity
    const isStorageConnected = await validateStorageConnectivity(storage);
    if (!isStorageConnected) {
      throw new Error('Storage API is not accessible. Please check your internet connection.');
    }
    
    // 4. Test storage permissions
    const testSuccess = await testStorageConnection(storage, user.uid);
    if (!testSuccess) {
      throw new Error('storage/unauthorized');
    }
    
    // 5. Get user data
    const userData = await getUserData(user, db);
    
    // 6. Handle text-only posts
    if (postMode === 'text' || !selectedMedia || selectedMedia.length === 0) {
      await createTextPost({ db, userId: user.uid, userData, textPost, navigation });
      return;
    }
    
    // 7. Process and upload media items
    console.log(`Processing ${selectedMedia.length} media items`);
    const mediaUrls = [];
    
    // Process media items sequentially
    for (let i = 0; i < selectedMedia.length; i++) {
      const item = selectedMedia[i];
      
      try {
        console.log(`Uploading media item ${i+1}/${selectedMedia.length}`);
        console.log('Media item details:', {
          type: item.type,
          uri: item.uri && item.uri.substring(0, 50) + '...',
          fileName: item.fileName || 'undefined',
          fileSize: item.fileSize || 'unknown'
        });
        
        // Validate file size
        if (!isFileSizeValid(item.fileSize)) {
          throw new Error('File size exceeds 20MB limit. Please select a smaller file.');
        }
        
        // Determine media type
        const isVideo = item.type?.includes('video') || 
                      item.uri.toLowerCase().endsWith('.mp4') || 
                      item.uri.toLowerCase().endsWith('.mov');
                      
        // Set appropriate content type
        const contentType = isVideo ? 'video/mp4' : 'image/jpeg';
        
        // Upload the media file
        const downloadURL = await uploadMediaFile({
          storage,
          userId: user.uid,
          mediaItem: item,
          mediaIndex: i,
          contentType,
          isVideo
        });
        
        // Add successfully uploaded media to the array
        mediaUrls.push({
          uri: downloadURL,
          duration: item.duration || null,
          caption: captions && item.id && captions[item.id] ? captions[item.id] : '',
          type: isVideo ? 'video' : 'image',
          fileName: `user_${user.uid.substring(0, 8)}_${Date.now()}_${i}.${isVideo ? 'mp4' : 'jpg'}`,
          contentType: contentType,
        });
        
        console.log(`Media item ${i+1} uploaded successfully`);
      } catch (itemError) {
        console.error(`Error uploading media item ${i+1}:`, itemError);
        
        if (selectedMedia.length === 1) {
          throw new Error(`Failed to upload media: ${itemError.message}`);
        }
        
        Alert.alert(
          'Partial Upload Issue', 
          `Item ${i + 1} failed to upload, but we'll continue with the others.`
        );
      }
    }
    
    if (mediaUrls.length === 0 && selectedMedia.length > 0) {
      throw new Error('No media items were successfully uploaded');
    }
    
    // 8. Create post with uploaded media
    console.log('All media processed successfully, creating post document');
    await createMediaPost({ 
      db, 
      userId: user.uid, 
      userData, 
      mediaUrls, 
      textPost, 
      navigation 
    });
    
  } catch (error) {
    console.error('Error in uploadPost:', error);
    
    // Handle authentication errors specifically
    if (error.message === 'authentication_required' || 
        error.code === 'auth/user-token-expired' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-user-token' ||
        error.message.includes('authentication')) {
      handleAuthError(error, () => navigation && navigation.navigate('Login', { returnTo: 'CreatePost' }));
    } else {
      // Handle other errors
      handlePostError(error);
    }
  }
};