import { auth, db } from './firebase'; // Assuming you have firebase config
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
      newCard.textContent = textContent;
      // Add an empty array or null for images
      newCard.images = [];
    } else {
      newCard.images = images;
    }
    
    const docRef = await addDoc(cardsCollection, newCard);
    return docRef.id; // Return the new document ID
    
  } catch (error) {
    console.error('Error posting new card:', error);
    throw error;
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
export const postReply = async (cardId, imageIndex, replyText, userId) => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    // Assuming replies are stored in a subcollection for each image
    const replyData = {
      userId,
      text: replyText,
      timestamp: serverTimestamp(),
      // Any additional reply metadata
    };

    // Path might vary based on your Firestore structure
    const replyRef = collection(db, `cards/${cardId}/images/${imageIndex}/replies`);
    await addDoc(replyRef, replyData);
    
    return true;
    
  } catch (error) {
    console.error('Error posting reply:', error);
    throw error;
  }
};