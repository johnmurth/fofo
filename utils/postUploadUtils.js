// utils/postUploadUtils.js
import { Alert, Platform } from 'react-native';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

/**
 * Helper function to convert a URI to a blob
 * @param {string} uri - The file URI
 * @returns {Promise<Blob>} - A blob of the file
 */
const uriToBlob = async (uri) => {
  try {
    // Handle file:// protocol on Android specifically
    if (Platform.OS === 'android' && uri.startsWith('file://')) {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const blob = await response.blob();
      return blob;
    } else {
      // Standard approach for other scenarios
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const blob = await response.blob();
      return blob;
    }
  } catch (error) {
    console.error('Error in uriToBlob:', error);
    throw new Error(`Failed to convert URI to blob: ${error.message}`);
  }
};

/**
 * Uploads a post to Firebase
 * @param {Object} params - Post parameters
 * @param {Object} params.user - Current authenticated user
 * @param {Object} params.db - Firestore database reference
 * @param {Object} params.storage - Firebase storage reference
 * @param {String} params.postMode - Type of post ('text', 'gallery', 'camera')
 * @param {Array} params.selectedMedia - Array of selected media items
 * @param {Object} params.captions - Object with captions for each media item
 * @param {String} params.textPost - Content of text post
 * @param {Object} params.navigation - Navigation object for redirecting after post
 * @returns {Promise<void>}
 */
export const uploadPost = async ({
  user,
  db,
  storage,
  postMode,
  selectedMedia,
  captions,
  textPost,
  navigation
}) => {
  console.log('Starting uploadPost with:', {
    postMode,
    mediaCount: selectedMedia?.length || 0,
    userId: user?.uid,
    hasStorage: !!storage
  });
  
  try {
    if (!user || !user.uid) {
      throw new Error('Invalid user: User must be authenticated');
    }
    
    if (!storage) {
      throw new Error('Storage reference is missing');
    }
    
    if (!db) {
      throw new Error('Database reference is missing');
    }
    
    const userId = user.uid;
    
    // Get user data
    let userData = { displayName: 'Anonymous', photoURL: '' };
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        userData = userDoc.data();
        console.log('Retrieved user data successfully');
      } else {
        console.log('User document not found, using default values');
      }
    } catch (userError) {
      console.error('Error fetching user data:', userError);
      // Continue with default values
    }

    // Upload media files to storage and get URLs (if not a text post)
    const mediaUrls = [];
    
    if (postMode !== 'text' && selectedMedia && selectedMedia.length > 0) {
      console.log(`Processing ${selectedMedia.length} media items`);
      
      // Process one file at a time to avoid overwhelming the network
      for (let i = 0; i < selectedMedia.length; i++) {
        const item = selectedMedia[i];
        console.log(`Processing item ${i}:`, { uri: item.uri, type: item.type || 'unknown' });
        
        try {
          // Get file extension and MIME type
          const uriParts = item.uri.split('.');
          const fileExt = uriParts[uriParts.length - 1].toLowerCase();
          
          // Ensure we have a valid file extension
          const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'heic'];
          const isVideo = item.type?.includes('video') || fileExt === 'mp4' || fileExt === 'mov';
          const finalExt = validExtensions.includes(fileExt) ? fileExt : (isVideo ? 'mp4' : 'jpg');
          
          // Determine content type
          const contentType = isVideo ? 'video/mp4' : 
                              (finalExt === 'png' ? 'image/png' : 
                              (finalExt === 'gif' ? 'image/gif' : 'image/jpeg'));
          
          console.log(`Item ${i} detected type:`, contentType);
          
          // Create unique filename - simplified to reduce potential issues
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 10);
          const fileName = `posts/${userId}/${timestamp}_${randomId}.${finalExt}`;
          console.log(`Generated filename: ${fileName}`);
          
          // Create storage reference
          const storageRef = ref(storage, fileName);
          console.log('Storage reference created');
          
          // Convert URI to blob
          console.log(`Converting URI to blob for item ${i}`);
          const blob = await uriToBlob(item.uri);
          
          if (!blob || blob.size === 0) {
            throw new Error('Created blob is invalid or empty');
          }
          
          console.log(`Starting upload for item ${i} (${blob.size} bytes)`);

          // APPROACH 1: Try direct upload first (simpler method)
          try {
            console.log(`Starting direct upload for item ${i}`);
            await uploadBytes(storageRef, blob, {
              contentType: contentType
            });
            
            console.log(`Upload completed for item ${i}, getting download URL`);
            const downloadURL = await getDownloadURL(storageRef);
            console.log(`Download URL obtained for item ${i}: ${downloadURL}`);
            
            // Add to media URLs array
            mediaUrls.push({
              uri: downloadURL,
              duration: item.duration || null,
              caption: captions[item.id] || '',
              type: isVideo ? 'video' : 'image',
            });
            
            continue; // Skip to next item since this one succeeded
          } catch (directUploadError) {
            console.warn(`Direct upload failed for item ${i}, trying resumable upload:`, directUploadError);
            // Fall through to resumable upload approach
          }

          // APPROACH 2: If direct upload fails, try resumable with better error handling
          const uploadTask = uploadBytesResumable(storageRef, blob, {
            contentType: contentType
          });
          
          // Track upload with smaller chunks and better error handling
          await new Promise((resolve, reject) => {
            const uploadTimeout = setTimeout(() => {
              reject(new Error('Upload timed out after 60 seconds'));
            }, 60000); // 60 second timeout
            
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload progress for item ${i}: ${progress.toFixed(1)}%`);
              },
              (error) => {
                clearTimeout(uploadTimeout);
                console.error(`Upload error for item ${i}:`, error);
                
                // Provide more detailed error information
                let errorMsg = error.message || 'Unknown error';
                if (error.serverResponse) {
                  errorMsg += ` Server response: ${error.serverResponse}`;
                }
                
                reject(new Error(`Upload failed: ${errorMsg}`));
              },
              async () => {
                try {
                  clearTimeout(uploadTimeout);
                  console.log(`Upload completed for item ${i}, getting download URL`);
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  console.log(`Download URL obtained for item ${i}: ${downloadURL}`);
                  
                  // Add to media URLs array
                  mediaUrls.push({
                    uri: downloadURL,
                    duration: item.duration || null,
                    caption: captions[item.id] || '',
                    type: isVideo ? 'video' : 'image',
                  });
                  
                  resolve();
                } catch (urlError) {
                  console.error(`Error getting download URL for item ${i}:`, urlError);
                  reject(urlError);
                }
              }
            );
          });
          
          console.log(`Item ${i} processed successfully`);
        } catch (itemError) {
          console.error(`Error uploading media item ${i}:`, itemError);
          
          // Try to handle specific error conditions
          if (itemError.code === 'storage/unauthorized') {
            throw new Error(`Firebase Storage permission denied. Check your storage rules to ensure this user (${userId}) has write access.`);
          } else if (itemError.code === 'storage/quota-exceeded') {
            throw new Error('Firebase Storage quota exceeded. Check your Firebase console.');
          } else if (itemError.message && itemError.message.includes('Failed to convert URI to blob')) {
            throw new Error(`Media file ${i+1} could not be read. The file may be corrupted or inaccessible.`);
          } else {
            throw new Error(`Failed to upload media item ${i + 1}: ${itemError.message}`);
          }
        }
      }
    }

    console.log('All media processed, creating post document');
    
    // Create post document
    // Create post document with updated structure for text posts
    await addDoc(collection(db, 'cards'), {
      userId,
      profileName: userData?.displayName || 'Anonymous',
      profileImage: userData?.photoURL || '',
      images: mediaUrls,
      textPost: postMode === 'text' ? textPost : '', // Store text content in dedicated field
      caption: '', // Keep caption field empty for text posts
      timestamp: serverTimestamp(),
      label: userData?.label || 'No label',
      postType: postMode === 'text' ? 'text' : 'media',
    });
    
    console.log('Post document created successfully');
    
    Alert.alert('Success', 'Post uploaded successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
   
  } catch (error) {
    console.error('Error in uploadPost:', error);
    
    // More descriptive error messages
    let errorMessage = 'Failed to upload post. Please try again.';
    
    if (error.code) {
      switch (error.code) {
        case 'storage/unauthorized':
          errorMessage = 'You don\'t have permission to upload files. Check your Firebase storage rules.';
          break;
        case 'storage/canceled':
          errorMessage = 'Upload was canceled.';
          break;
        case 'storage/quota-exceeded':
          errorMessage = 'Storage quota exceeded.';
          break;
        case 'storage/invalid-argument':
          errorMessage = 'Invalid file provided for upload.';
          break;
        case 'storage/retry-limit-exceeded':
          errorMessage = 'Upload failed due to network issues. Please check your internet connection and try again.';
          break;
        case 'storage/unknown':
          errorMessage = 'Network issue or server error encountered. Please check your internet connection and Firebase configuration.';
          break;
        default:
          errorMessage = `Upload error: ${error.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert('Upload Error', errorMessage);
    throw error;
  }
};