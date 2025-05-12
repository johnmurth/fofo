import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toggleLike } from '../../../firebase/firebaseData';
import { auth } from '../../../firebase/firebaseConfig';

const CardLikesAndReplies = ({
  currentImageIndex = 0,
  images = [],
  onReplySubmit = () => {},
  caption = '',
  comments = null,
  cardId = ''
}) => {
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState([]);
  
  // Initialize isLiked array based on Firebase data
  useEffect(() => {
    if (!images || !Array.isArray(images) || !auth.currentUser) return;
    
    // Compare current isLiked with what it should be to avoid unnecessary updates
    const likedArray = images.map(img => {
      if (!img || !img.likes || !Array.isArray(img.likes)) return false;
      return img.likes.includes(auth.currentUser.uid);
    });
    
    // Only update state if the liked status has actually changed
    // This prevents infinite re-renders
    if (JSON.stringify(likedArray) !== JSON.stringify(isLiked)) {
      setIsLiked(likedArray);
    }
  }, [images, auth.currentUser?.uid]);
  
  const handleLikePress = async () => {
    if (!auth.currentUser) {
      console.log('User not authenticated');
      return;
    }
    
    // Safety check
    if (!images || !Array.isArray(images) || currentImageIndex < 0 || currentImageIndex >= images.length) {
      console.log('Invalid image index or images array');
      return;
    }
    
    const currentLiked = isLiked[currentImageIndex] || false;
    
    // Optimistically update UI
    const newIsLiked = [...isLiked];
    newIsLiked[currentImageIndex] = !currentLiked;
    setIsLiked(newIsLiked);
    
    // Update in Firebase
    try {
      const success = await toggleLike(
        cardId,
        currentImageIndex,
        auth.currentUser.uid,
        !currentLiked
      );
      
      if (!success) {
        // Revert UI if Firebase update failed
        newIsLiked[currentImageIndex] = currentLiked;
        setIsLiked(newIsLiked);
        console.log('Failed to update like status');
      }
    } catch (error) {
      // Revert UI if error occurs
      newIsLiked[currentImageIndex] = currentLiked;
      setIsLiked(newIsLiked);
      console.error('Error toggling like:', error);
    }
  };
  
  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReplySubmit(currentImageIndex, replyText);
      setReplyText('');
    }
  };

  // Make sure we have valid data before rendering
  const currentImage = images && Array.isArray(images) && images.length > currentImageIndex 
    ? images[currentImageIndex] 
    : null;
  
  const likeCount = currentImage && typeof currentImage.likeCount === 'number' 
    ? currentImage.likeCount 
    : 0;
  
  const currentIsLiked = Array.isArray(isLiked) && isLiked.length > currentImageIndex 
    ? isLiked[currentImageIndex] 
    : false;
  
  return (
    <View>
      <View style={styles.bottomContainer}>
        {/* Caption */}
        {caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        )}
        
        {/* Like and Reply Container */}
        <View style={styles.interactionContainer}>
          {/* Like Button */}
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLikePress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={currentIsLiked ? "heart" : "heart-outline"}
              size={25}
              color={currentIsLiked ? "#ff3040" : "rgba(255, 255, 255, 0.7)"}
            />
            <Text style={styles.likeCount}>{likeCount}</Text>
          </TouchableOpacity>
          
          {/* Reply Input */}
          <View style={styles.replyContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Reply to this..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={replyText}
              onChangeText={setReplyText}
              onSubmitEditing={handleReplySubmit}
            />
            {replyText ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleReplySubmit}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: 12,
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
  captionContainer: {
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  captionText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 35,
    marginRight: 10,
    width: 40,
    height: 40,
  },
  likeCount: {
    color: 'rgb(219, 219, 219)',
    marginLeft: 4,
    fontSize: 14,
    display: 'none'
  },
  replyContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  replyInput: {
    flex: 1,
    color: 'rgb(0, 0, 0)',
    padding: 8,
    fontSize: 14,
  },
  sendButton: {
    padding: 6,
  },
  forwardButton: {
    padding: 8,
  },
});

export default CardLikesAndReplies;