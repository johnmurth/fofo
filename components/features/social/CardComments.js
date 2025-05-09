import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchComments } from '../../../firebase/firebaseData';

const CardComments = ({ cardId, onCommentsPress }) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState(null);
  
  useEffect(() => {
    const loadComments = async () => {
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
        
        setComments(formattedComments);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadComments();
  }, [cardId]);
  
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
      onPress={onCommentsPress}
      activeOpacity={0.7}
    >
      {(!comments || comments.count === 0) ? (
        <Text style={styles.commentCount}>0 comments</Text>
      ) : (
        <View style={styles.commentContainer}>
          <View style={styles.thumbnailsStack}>
            {comments.previewUsers.length > 0 && comments.previewUsers.slice(0, 3).map((thumb, index) => (
              <Image
                key={`thumb-${index}`}
                source={{ uri: thumb || 'https://via.placeholder.com/30' }}
                style={[
                  styles.thumbnail,
                  index === 1 && { marginLeft: -10 },
                  index === 2 && { marginLeft: -10 }
                ]}
              />
            ))}
          </View>
          <Text style={styles.commentCount}>{comments.count} {comments.count === 1 ? 'comment' : 'comments'}</Text>
          <Ionicons name="chevron-forward" size={16} color="#8e8e8e" style={styles.icon} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailsStack: {
    flexDirection: 'row',
    marginRight: 8,
  },
  thumbnail: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  commentCount: {
    fontSize: 14,
    color: 'rgb(133, 133, 133)',
    marginLeft: 4,
    flex: 1,
  },
  icon: {
    marginLeft: 'auto',
  }
});

export default CardComments;