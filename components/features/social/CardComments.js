// CardComments.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchComments, addComment } from '../../../firebase/firebaseData';
import { auth } from '../../../firebase/firebaseConfig';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75; // 3/4 of screen
const DRAG_THRESHOLD = 50;

const CardComments = ({ cardId, isVisible = false, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Animation values
  const bottomSheetAnim = useRef(new Animated.Value(isVisible ? 0 : BOTTOM_SHEET_MAX_HEIGHT)).current;
  const backdropOpacity = bottomSheetAnim.interpolate({
    inputRange: [0, BOTTOM_SHEET_MAX_HEIGHT],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });
  
  // Create pan responder for the drag handle
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

  // Effect to sync with isVisible prop
  useEffect(() => {
    if (isVisible) {
      openModal();
      loadAllComments();
    } else {
      closeModal();
    }
  }, [isVisible, cardId]);

  useEffect(() => {
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
  }, []);
  
  // Load all comments
  const loadAllComments = async () => {
    if (!cardId) return;
    
    try {
      setLoading(true);
      const commentsData = await fetchComments(cardId); // Fetch all comments
      
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
      console.error('Error loading all comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
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
      if (onClose) onClose();
      Keyboard.dismiss();
    });
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
        await loadAllComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
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

  // If not visible, don't render anything
  if (!isModalVisible) {
    return null;
  }
  
  // Show loading state
  if (loading) {
    return (
      <View style={styles.modalContainer}>
        <View style={[styles.backdrop, { opacity: 0.5 }]} />
        <View style={[styles.bottomSheet, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.modalContainer}>
      {/* Backdrop */}
      <TouchableOpacity 
        style={[
          styles.backdrop, 
          { opacity: backdropOpacity }
        ]} 
        activeOpacity={1}
        onPress={closeModal}
      />
      
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
        
        <FlatList
          data={comments?.data || []}
          renderItem={renderComment}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to add a comment!</Text>
            </View>
          )}
        />
        
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
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    zIndex: 1001,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  dragHandle: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d0d0d0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d0d0d0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  commentsList: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#efefef',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 4,
  },
  keyboardView: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d0d0d0',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f1f1f1',
    fontSize: 14,
  },
  postButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  postButtonText: {
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8e8e8e',
  },
});

export default CardComments;