// mediaUtils.js - Handle media processing and uploads
import { Platform } from 'react-native';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Tests storage connection with a small upload to verify permissions
 * @param {Object} storage - Firebase storage reference
 * @param {string} userId - Current user ID
 * @returns {Promise<boolean>} Whether the test was successful
 */
export const testStorageConnection = async (storage, userId) => {
  try {
    const testRef = ref(storage, `access_test/${userId}/${Date.now()}.txt`);
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    await uploadBytesResumable(testRef, testBlob);
    console.log('Test upload successful - storage connection verified');
    return true;
  } catch (testError) {
    console.error('Storage test upload failed:', testError);
    return false;
  }
};

/**
 * Optimize an image file for better upload success
 * @param {string} uri - URI of the image to optimize
 * @returns {Promise<string>} URI of the optimized image
 */
export const optimizeImage = async (uri) => {
  try {
    console.log('Converting image with reduced quality for upload');
    // Use lower quality and smaller dimensions to reduce file size
    const processedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 0.6 }
    );
    
    const optimizedUri = processedImage.uri;
    console.log('Image converted successfully to compressed JPEG');
    
    // DEBUG: Log file info after compression
    const fileInfo = await FileSystem.getInfoAsync(optimizedUri);
    console.log('Compressed file size:', fileInfo.size, 'bytes');
    
    return optimizedUri;
  } catch (error) {
    console.error('Failed to optimize image:', error);
    return uri; // Return original if optimization fails
  }
};

/**
 * Upload a media file to Firebase Storage
 * @param {Object} options - Upload options
 * @returns {Promise<string>} Download URL of the uploaded file
 */
export const uploadMediaFile = async ({
  storage,
  userId,
  mediaItem,
  mediaIndex,
  contentType,
  isVideo
}) => {
  // Create unique file name with simple format (avoid special characters)
  const timestamp = new Date().getTime();
  const fileExtension = isVideo ? 'mp4' : 'jpg';
  const fileName = `user_${userId.substring(0, 8)}_${timestamp}_${mediaIndex}.${fileExtension}`;
  
  // Use posts/{userId}/{fileName} path structure which is allowed in your rules
  const storageRef = ref(storage, `posts/${userId}/${fileName}`);
  
  // Set appropriate content type in metadata
  const metadata = {
    contentType,
    customMetadata: {
      userId,
      uploadDate: new Date().toISOString()
    }
  };
  
  // Process the URI if it's an image
  let processedUri = mediaItem.uri;
  if (!isVideo) {
    processedUri = await optimizeImage(mediaItem.uri);
  }
  
  // Different upload strategies based on platform
  if (Platform.OS === 'web') {
    return await uploadWebFile(processedUri, storageRef, metadata);
  } else {
    return await uploadNativeFile(processedUri, storageRef, metadata, contentType);
  }
};

/**
 * Upload file from web platform
 * @private
 */
const uploadWebFile = async (uri, storageRef, metadata) => {
  // For web, fetch the file as blob
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: HTTP ${response.status}`);
  }
  const fileBlob = await response.blob();
  
  console.log('Blob created with size:', fileBlob.size, 'and type:', fileBlob.type);
  
  // Upload the blob directly
  const uploadTask = uploadBytesResumable(storageRef, fileBlob, metadata);
  
  // Create a promise to handle the upload completion
  return await new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at:', url);
          resolve(url);
        } catch (urlError) {
          console.error('Error getting download URL:', urlError);
          reject(urlError);
        }
      }
    );
  });
};

/**
 * Upload file from native platform with multiple fallback strategies
 * @private
 */
const uploadNativeFile = async (uri, storageRef, metadata, contentType) => {
  // Approach 1: Direct fetch and blob approach
  try {
    console.log('Attempting fetch API upload approach');
    
    // Use a timeout to prevent hanging
    const fetchController = new AbortController();
    const timeoutId = setTimeout(() => fetchController.abort(), 30000); // 30-second timeout
    
    const response = await fetch(uri, { 
      signal: fetchController.signal
    });
    clearTimeout(timeoutId); // Clear timeout since fetch succeeded
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: HTTP ${response.status}`);
    }
    
    const fileBlob = await response.blob();
    console.log('Blob created with size:', fileBlob.size, 'bytes and type:', fileBlob.type);
    
    // Upload with simpler onSnapshot approach
    const uploadTask = uploadBytesResumable(storageRef, fileBlob, metadata);
    
    return await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at:', url);
          resolve(url);
        }
      );
    });
  } catch (directUploadError) {
    console.error('Direct upload failed:', directUploadError);
    
    // Approach 2: FileSystem API for binary data
    try {
      console.log('Trying FileSystem.readAsStringAsync with UTF8 encoding');
      
      // Read file as binary data
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      if (!base64 || base64.length < 100) {
        throw new Error('Invalid base64 data received');
      }
      
      console.log('Base64 data length:', base64.length);
      
      // Convert base64 to blob
      const base64Content = `data:${contentType};base64,${base64}`;
      const response = await fetch(base64Content);
      const blob = await response.blob();
      
      console.log('Base64 blob size:', blob.size);
      
      // Upload the blob
      const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
      
      return await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Base64 upload progress: ${progress.toFixed(2)}%`);
          },
          (error) => {
            console.error('Base64 upload error:', error);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at:', url);
            resolve(url);
          }
        );
      });
    } catch (base64Error) {
      console.error('Base64 upload failed:', base64Error);
      
      // Approach 3: FileSystem native URI approach (last resort)
      if (Platform.OS === 'android' && uri.startsWith('file://')) {
        try {
          console.log('Trying native file path approach');
          
          // Convert to Blob using a different method
          const fileContent = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          const blob = await (await fetch(`data:${contentType};base64,${fileContent}`)).blob();
          const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
          
          return await new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Native path upload progress: ${progress.toFixed(2)}%`);
              },
              (error) => {
                console.error('Native path upload error:', error);
                reject(error);
              },
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('File available at:', url);
                resolve(url);
              }
            );
          });
        } catch (nativePathError) {
          console.error('Native path upload failed:', nativePathError);
        }
      }
      
      // If all methods fail, throw an error
      throw new Error('All upload methods failed. Please check your media file and try again.');
    }
  }
};