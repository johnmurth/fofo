// CommentTrigger.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchComments } from '../../../firebase/firebaseData';
import { CommentsContext } from '../../../App';

const CommentTrigger = ({ cardId }) => {
  const [loading, setLoading] = useState(true);
  const [commentPreview, setCommentPreview] = useState(null);
  const { openComments } = useContext(CommentsContext);

  useEffect(() => {
    loadPreviewComments();
  }, [cardId]);

  // Load just preview comments (3)
  const loadPreviewComments = async () => {
    if (!cardId) return;
    
    try {
      setLoading(true);
      const commentsData = await fetchComments(cardId, 3); // Fetch just 3 for preview
      
      // Format comments for display
      const formattedComments = {
        count: commentsData.length,
        data: commentsData,
        previewUsers: commentsData
          .filter(comment => comment.userProfileImage)
          .map(comment => comment.userProfileImage)
          .slice(0, 3)
      };
      
      setCommentPreview(formattedComments);
    } catch (error) {
      console.error('Error loading preview comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentsPress = () => {
    openComments(cardId);
  };

  // Preview component (closed state)
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#0095f6" />
      </View>
    );
  }
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleCommentsPress}
      activeOpacity={0.7}
    >
      {(!commentPreview || commentPreview.count === 0) ? (
        <Text style={styles.commentCount}>0 comments</Text>
      ) : (
        <View style={styles.commentContainer}>
          <View style={styles.thumbnailsStack}>
            {commentPreview.previewUsers && commentPreview.previewUsers.length > 0 && 
              commentPreview.previewUsers.slice(0, 3).map((thumb, index) => {
                // Check if thumb is a valid string
                const validThumb = thumb && typeof thumb === 'string' && thumb.trim() !== '';
                
                return (
                  <Image
                    key={`thumb-${index}`}
                    source={validThumb ? { uri: thumb } : require('../../../assets/k.png')}
                    style={[
                      styles.thumbnail,
                      index === 1 && { marginLeft: -10 },
                      index === 2 && { marginLeft: -10 }
                    ]}
                  />
                );
              })
            }
          </View>
          <Text style={styles.commentCount}>
            {commentPreview.count} {commentPreview.count === 1 ? 'comment' : 'comments'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#8e8e8e" style={styles.icon} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnailsStack: {
    flexDirection: 'row',
    marginRight: 8,
  },
  thumbnail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e1e1e1',
    borderWidth: 1,
    borderColor: '#fff',
  },
  commentCount: {
    fontSize: 14,
    color: '#8e8e8e',
    flex: 1,
  },
  icon: {
    marginLeft: 5,
  }
});

export default CommentTrigger;