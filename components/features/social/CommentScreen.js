import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchComments, addComment } from '../../../firebase/firebaseData';
import { auth } from '../../../firebase/firebaseConfig';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75; // 3/4 of screen
const DRAG_THRESHOLD = 50;

const CommentScreen = ({ cardId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [commentPreview, setCommentPreview] = useState({
    count: 0,
    previewUsers: []
  });

  // Animation values
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = bottomSheetAnim.interpolate({
    inputRange: [0, BOTTOM_SHEET_MAX_HEIGHT],
    outputRange: [0, 0.5],
    extrapolate: 'clamp',
  });

  // PanResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow moving down (positive dy)
        if (gestureState.dy > 0) {
          bottomSheetAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down past threshold, close modal
        if (gestureState.dy > DRAG_THRESHOLD) {
          closeModal();
        } else {
          // Otherwise, snap back to open position
          Animated.spring(bottomSheetAnim, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    loadPreviewComments();

    // Setup keyboard listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [cardId]);

  // Load just preview comments (3)
  const loadPreviewComments = async () => {
    if (!cardId) return;
    
    try {
      setLoading(true);
      const commentsData = await fetchComments(cardId, 3); // Fetch just 3 for preview
      
      // Format comments for display
      const preview = {
        count: commentsData.length,
        previewUsers: commentsData
          .filter(comment => comment.userProfileImage)
          .map(comment => comment.userProfileImage)
          .slice(0, 3)
      };
      
      setCommentPreview(preview);
    } catch (error) {
      console.error('Error loading preview comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load all comments
  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await fetchComments(cardId);
      setComments(commentsData);

      // Update preview data as well
      setCommentPreview({
        count: commentsData.length,
        previewUsers: commentsData
          .filter(comment => comment.userProfileImage)
          .map(comment => comment.userProfileImage)
          .slice(0, 3)
      });
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !auth.currentUser) {
      return;
    }

    try {
      setSubmitting(true);
      const success = await addComment(
        cardId,
        auth.currentUser.uid,
        newComment.trim()
      );

      if (success) {
        setNewComment('');
        // Reload comments to show the new one
        await loadComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
    loadComments(); // Load all comments when opening modal
    Animated.spring(bottomSheetAnim, {
      toValue: 0,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
  };
  
  const closeModal = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: BOTTOM_SHEET_MAX_HEIGHT,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setIsModalVisible(false);
      Keyboard.dismiss();
    });
  };

  const renderComment = ({ item }) => {
    // Safely handle image URI
    const imageUri = item.userProfileImage && typeof item.userProfileImage === 'string' && 
                    item.userProfileImage.trim() !== '' ? 
                    item.userProfileImage : 
                    'https://via.placeholder.com/40';
    
    return (
      <View style={styles.commentItem}>
        <Image
          source={{ uri: imageUri }}
          style={styles.userAvatar}
          defaultSource={require('../../../assets/k.png')}
        />
        <View style={styles.commentContent}>
          <Text style={styles.userName}>{item.userName || 'Anonymous'}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recently'}
          </Text>
        </View>
      </View>
    );
  };

  // Preview component (closed state)
  if (loading && !isModalVisible) {
    return (
      <TouchableOpacity style={styles.container} onPress={openModal} activeOpacity={0.7}>
        <ActivityIndicator size="small" color="#0095f6" />
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={openModal}
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
            <Text style={styles.commentCount}>{commentPreview.count} {commentPreview.count === 1 ? 'comment' : 'comments'}</Text>
            <Ionicons name="chevron-forward" size={16} color="#8e8e8e" style={styles.icon} />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Bottom sheet modal */}
      {isModalVisible && (
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View 
              style={[
                styles.backdrop, 
                { opacity: backdropOpacity }
              ]} 
            />
          </TouchableWithoutFeedback>
          
          <Animated.View 
            style={[
              styles.bottomSheet,
              {
                transform: [
                  { 
                    translateY: bottomSheetAnim.interpolate({
                      inputRange: [0, BOTTOM_SHEET_MAX_HEIGHT],
                      outputRange: [0, BOTTOM_SHEET_MAX_HEIGHT],
                      extrapolate: 'clamp',
                    }) 
                  }
                ],
                maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
                paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0,
              },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.dragHandle}>
              <View style={styles.dragHandleBar} />
            </View>
            
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Comments</Text>
              <View style={{ width: 24 }} />
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0095f6" />
              </View>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.commentsList}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No comments yet</Text>
                    <Text style={styles.emptySubtext}>Be the first to add a comment!</Text>
                  </View>
                )}
              />
            )}
            
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={10}
              style={styles.keyboardView}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={1000}
                />
                {submitting ? (
                  <ActivityIndicator size="small" color="#0095f6" />
                ) : (
                  <TouchableOpacity
                    style={[styles.postButton, !newComment.trim() && styles.disabledButton]}
                    onPress={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Text style={styles.postButtonText}>Post</Text>
                  </TouchableOpacity>
                )}
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
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
    color: '#8e8e8e',
    flex: 1,
  },
  icon: {
    marginLeft: 4,
  },
  // Bottom sheet styles
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  dragHandle: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    marginBottom: 4,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8e8e8e',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  postButtonText: {
    color: '#0095f6',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CommentScreen;