// postDataService.js - Handle post creation in Firestore
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Alert } from 'react-native';

/**
 * Create a text-only post in Firestore
 * @param {Object} options - Post options
 * @returns {Promise<Object>} Created document reference
 */
export const createTextPost = async ({ db, userId, userData, textPost, navigation }) => {
  console.log('Creating text-only post');
  
  try {
    const docRef = await addDoc(collection(db, 'cards'), {
      userId,
      profileName: userData?.displayName || 'Anonymous',
      profileImage: userData?.photoURL || '',
      images: [],
      textPost: textPost || '',
      caption: '',
      timestamp: serverTimestamp(),
      label: userData?.label || 'No label',
      postType: 'text',
    });
    
    console.log('Text post created successfully with ID:', docRef.id);
    
    Alert.alert('Success', 'Post uploaded successfully!', [
      { text: 'OK', onPress: () => navigation?.goBack() }
    ]);
    
    return docRef;
  } catch (error) {
    console.error('Error creating text post:', error);
    throw error;
  }
};

/**
 * Create a media post with images/videos in Firestore
 * @param {Object} options - Post options
 * @returns {Promise<Object>} Created document reference
 */
export const createMediaPost = async ({ db, userId, userData, mediaUrls, textPost, navigation }) => {
  console.log('Creating media post with', mediaUrls.length, 'media items');
  
  try {
    const docRef = await addDoc(collection(db, 'cards'), {
      userId,
      profileName: userData?.displayName || 'Anonymous',
      profileImage: userData?.photoURL || '',
      images: mediaUrls,
      textPost: textPost || '',
      caption: '',
      timestamp: serverTimestamp(),
      label: userData?.label || 'No label',
      postType: 'media',
    });
    
    console.log('Media post created successfully with ID:', docRef.id);
    
    Alert.alert('Success', 'Post uploaded successfully!', [
      { text: 'OK', onPress: () => navigation?.goBack() }
    ]);
    
    return docRef;
  } catch (error) {
    console.error('Error creating media post:', error);
    throw error;
  }
};

/**
 * Handle post creation errors with proper user feedback
 * @param {Error} error - Post creation error
 */
export const handlePostError = (error) => {
  console.error('Error creating post:', error);
  
  let errorMessage = 'Failed to upload post. Please try again.';
  
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
      case 'storage/unauthorized':
        errorMessage = 'You don\'t have permission to upload posts. Please check your account permissions.';
        break;
      case 'storage/quota-exceeded':
        errorMessage = 'Storage quota exceeded. Please contact the app administrator.';
        break;
      case 'storage/invalid-argument':
        errorMessage = 'Invalid file provided for upload. Please try a different file.';
        break;
      case 'storage/retry-limit-exceeded':
        errorMessage = 'Upload failed due to network issues. Please check your internet connection and try again.';
        break;
      case 'storage/canceled':
        errorMessage = 'Upload was canceled. Please try again.';
        break;
      case 'storage/unknown':
        errorMessage = 'Upload failed due to a Firebase Storage issue. Please try using a smaller JPG or PNG image.';
        break;
      default:
        errorMessage = `Upload error: ${error.message || error.code}`;
    }
  } else if (error.message) {
    if (error.message.includes('WebP')) {
      errorMessage = 'WebP images are causing upload problems. Please use JPG or PNG images instead.';
    } else if (error.message.includes('authentication') || error.message.includes('log in')) {
      errorMessage = 'Please sign in before posting.';
    } else {
      errorMessage = error.message;
    }
  }
  
  Alert.alert('Upload Error', errorMessage);
};