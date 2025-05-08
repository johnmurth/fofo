// services/firestoreService.js
import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  query, 
  orderBy, 
  limit,
  increment
} from 'firebase/firestore';

export const fetchCards = async () => {
  const cardsRef = collection(db, 'cards');
  const q = query(cardsRef, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const toggleLike = async (cardId, imageIndex, userId) => {
  const cardRef = doc(db, 'cards', cardId);
  const cardSnap = await getDoc(cardRef);
  
  if (!cardSnap.exists()) return false;

  const imageData = cardSnap.data().images[imageIndex];
  const isLiked = imageData.likes?.includes(userId);

  await updateDoc(cardRef, {
    [`images.${imageIndex}.likes`]: isLiked 
      ? arrayRemove(userId) 
      : arrayUnion(userId),
    [`images.${imageIndex}.likeCount`]: increment(isLiked ? -1 : 1)
  });

  return !isLiked;
};

// ... include all your other Firestore operations here
// (fetchComments, followUser, etc. from your original firebaseData.js)