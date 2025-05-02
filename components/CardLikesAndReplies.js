import React from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Text 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CardLikesAndReplies = ({ 
  currentImageIndex, 
  images, 
  onReplySubmit,
  caption
}) => {
  const [replyText, setReplyText] = React.useState('');
  const [likes, setLikes] = React.useState(
    images.map(() => Math.floor(Math.random() * 100))
  );
  const [isLiked, setIsLiked] = React.useState(
    images.map(() => false)
  );

  const handleLikePress = () => {
    const newLikes = [...likes];
    const newIsLiked = [...isLiked];
    
    if (newIsLiked[currentImageIndex]) {
      newLikes[currentImageIndex]--;
    } else {
      newLikes[currentImageIndex]++;
    }
    
    newIsLiked[currentImageIndex] = !newIsLiked[currentImageIndex];
    setLikes(newLikes);
    setIsLiked(newIsLiked);
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReplySubmit(currentImageIndex, replyText);
      setReplyText('');
    }
  };

  return (
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
            name={isLiked[currentImageIndex] ? "heart" : "heart-outline"} 
            size={28} 
            color={isLiked[currentImageIndex] ? "#ff3040" : "#fff"} 
          />
          <Text style={styles.likeCount}>{likes[currentImageIndex]}</Text>
        </TouchableOpacity>

        {/* Reply Input */}
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Reply to this image...`}
            placeholderTextColor="#aaa"
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
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  captionContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  captionText: {
    color: '#fff',
    fontSize: 14,
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    minWidth: 80,
    justifyContent: 'center',
  },
  likeCount: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
  replyContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  replyInput: {
    flex: 1,
    color: '#fff',
    height: 50,
    paddingVertical: 12,
  },
  sendButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default CardLikesAndReplies;