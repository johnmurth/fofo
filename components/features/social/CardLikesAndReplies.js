import React from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Text,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CardLikesAndReplies = ({ 
  currentImageIndex, 
  images, 
  onReplySubmit,
  caption,
  comments // Add comments prop
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
            placeholder={`Reply to this...`}
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

    {/* Comment Thumbnails and Forward Button */}
    {comments && (
      <View style={styles.commentRow}>
        <TouchableOpacity style={styles.commentPreview}>
          <View style={styles.thumbnailStack}>
            {comments.previewUsers.slice(0, 2).map((thumb, index) => (
              <Image
                key={`thumb-${index}`}
                source={{ uri: thumb }}
                style={[
                  styles.thumbnail,
                  index === 1 && styles.secondThumbnail
                ]}
              />
            ))}
          </View>
          <Text style={styles.commentCount}>{comments.count} comments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.forwardButton}
          onPress={() => console.log('Forward pressed')}
        >
          <Ionicons name="arrow-redo-outline" size={20} color="rgb(133, 133, 133)" />
        </TouchableOpacity>
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    padding: 10,
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
  commentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 3,
  },
  commentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailStack: {
    flexDirection: 'row',
    marginRight: 10,
  },
  thumbnail: {
    width: 25,
    height: 25,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#ddd',
  },
  secondThumbnail: {
    marginLeft: -15,
    zIndex: -1,
  },
  commentCount: {
    color: 'rgb(139, 139, 139)',
    fontSize: 12,
    fontWeight: '500',
  },
  forwardButton: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    padding: 5,
    borderRadius: 20,
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 8,
    flexDirection: 'row',
    height: 50,
    width: 50,
    justifyContent: 'center',
  },
  likeCount: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
    display: 'none'
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