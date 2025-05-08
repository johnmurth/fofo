// firebaseData.js
import { db, auth } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  query, 
  orderBy, 
  limit, where,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { Dimensions } from 'react-native';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

// Constants that were previously in mockData.js
const { width } = Dimensions.get('window');
export const CARD_WIDTH = width - 20; // 10px padding on each side
export const SPACING = 10;
export const SNAP_INTERVAL = CARD_WIDTH + SPACING;

// Add these new functions to the existing file
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to fetch all cards (stories/posts) from Firestore
export const fetchCards = async () => {
  try {
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const cards = [];
    querySnapshot.forEach((doc) => {
      cards.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return cards;
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
};
/**
 * Posts a new card to Firebase
 * @param {string} userId - ID of the user creating the post
 * @param {string} profileName - Display name of the user
 * @param {string} profileImage - URL to user's profile image
 * @param {Array|null} images - Array of image objects {uri, duration, caption} or null for text posts
 * @param {string} textContent - Text content for text-only posts
 * @param {string} label - Optional label for the post
 * @returns {Promise<string>} - Returns the ID of the newly created document
 */
export const postNewCard = async (userId, profileName, profileImage, images = null, textContent = '', label = '') => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
   
    const cardsCollection = collection(db, 'cards'); // Assuming 'cards' is your collection name
   
    // Determine if this is a text post or image post
    const isTextPost = !images || images.length === 0;
   
    const newCard = {
      userId,
      profileName,
      profileImage,
      label,
      timestamp: serverTimestamp(), // Firebase server timestamp
    };
   
    // Add appropriate content based on post type
    if (isTextPost) {
      newCard.textPost = textContent;
      newCard.postType = 'text';
      // Add an empty array for images
      newCard.images = [];
    } else {
      newCard.images = images;
      newCard.postType = 'media';
    }
   
    const docRef = await addDoc(cardsCollection, newCard);
    return docRef.id; // Return the new document ID
   
  } catch (error) {
    console.error('Error posting new card:', error);
    throw error;
  }
};

/**
 * Posts a new comment on a card
 * @param {string} cardId - ID of the card
 * @param {string} text - Comment text
 * @returns {Promise<boolean>} - Returns true if successful
 */
export const addComment = async (cardId, userId, text) => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    // Get user data for the comment
    const userDoc = await getDoc(doc(db, 'users', userId));
    let userData = { displayName: 'Anonymous', photoURL: '' };
    if (userDoc.exists()) {
      userData = userDoc.data();
    }

    // Create the comment document in a separate comments collection
    await addDoc(collection(db, 'comments'), {
      cardId,
      userId,
      text,
      timestamp: serverTimestamp(),
      userName: userData.displayName || auth.currentUser.displayName || 'Anonymous',
      userProfileImage: userData.photoURL || auth.currentUser.photoURL || '',
      likes: 0,
    });

    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
};

/**
 * Fetch comments for a specific card
 * @param {string} cardId - The ID of the card to fetch comments for
 * @param {number} commentLimit - Optional limit for number of comments to fetch
 * @returns {Promise<Array>} - Array of comment objects
 */
export const fetchComments = async (cardId, commentLimit = 50) => {
  try {
    if (!cardId) {
      console.error('Card ID is required to fetch comments');
      return [];
    }
    
    // Access the comments as a subcollection of the specific card
    const commentsRef = collection(db, 'cards', cardId, 'comments');
    const commentsQuery = query(
      commentsRef,
      orderBy('timestamp', 'desc'),
      limit(commentLimit)
    );
    
    const querySnapshot = await getDocs(commentsQuery);
   
    const comments = [];
    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      comments.push({
        id: doc.id,
        ...commentData,
        timestamp: commentData.timestamp ? commentData.timestamp.toDate().toISOString() : new Date().toISOString(),
      });
    });
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

/**
 * Posts a new reply to a specific image in a card
 * @param {string} cardId - ID of the card document
 * @param {number} imageIndex - Index of the image in the images array
 * @param {string} replyText - The reply text content
 * @param {string} userId - ID of the user posting the reply
 * @returns {Promise<boolean>} - Returns true if successful
 */
export const addReply = async (cardId, imageIndex, replyText, userId) => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    const cardRef = doc(db, 'cards', cardId);
    const cardDoc = await getDoc(cardRef);
    
    if (!cardDoc.exists()) {
      throw new Error('Card not found');
    }
    
    // Create a new reply object
    const reply = {
      userId,
      text: replyText,
      timestamp: new Date(),
    };
    
    // Update the card document
    await updateDoc(cardRef, {
      [`images.${imageIndex}.replies`]: arrayUnion(reply)
    });
    
    return true;
  } catch (error) {
    console.error('Error adding reply:', error);
    return false;
  }
};

// Function to toggle like on a card image
export const toggleLike = async (cardId, imageIndex, userId, isLiked) => {
  try {
    const cardRef = doc(db, 'cards', cardId);
    
    if (isLiked) {
      // Remove like
      await updateDoc(cardRef, {
        [`images.${imageIndex}.likes`]: arrayUnion(userId),
        [`images.${imageIndex}.likeCount`]: increment(1)
      });
    } else {
      // Add like
      await updateDoc(cardRef, {
        [`images.${imageIndex}.likes`]: arrayUnion(userId),
        [`images.${imageIndex}.likeCount`]: increment(1)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error toggling like:', error);
    return false;
  }
};

/**
 * Fetch a preview of comments for a card (for display in card footer)
 * @param {string} cardId - The ID of the card
 * @returns {Promise<Array>} - Array of comment preview objects
 */
export const fetchCommentPreview = async (cardId) => {
  try {
    if (!cardId) {
      return null;
    }

    const commentsQuery = query(
      collection(db, 'comments'),
      where('cardId', '==', cardId),
      orderBy('timestamp', 'desc'),
      limit(3)
    );

    const querySnapshot = await getDocs(commentsQuery);
    
    if (querySnapshot.empty) {
      return null;
    }

    const comments = [];
    querySnapshot.forEach((doc) => {
      const commentData = doc.data();
      comments.push({
        id: doc.id,
        ...commentData,
        timestamp: commentData.timestamp ? commentData.timestamp.toDate().toISOString() : new Date().toISOString(),
      });
    });

    return comments;
  } catch (error) {
    console.error('Error fetching comment preview:', error);
    return null;
  }
};
// Function to follow a user
export const followUser = async (currentUserId, targetUserId) => {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId)
    });
    
    const targetUserRef = doc(db, 'users', targetUserId);
    
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUserId)
    });
    
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};