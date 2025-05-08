// components/PostScreenHeader.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthModal from '../../firebase/AuthModal';

const PostScreenHeader = ({
  navigation,
  postMode,
  selectedMedia = [],
  textPost = '',
  isUploading = false,
  user = null,
  onUpload,
  onAuthSuccess
}) => {
  // State to track button enabled status and auth modal visibility
  const [isPostButtonEnabled, setIsPostButtonEnabled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
 
  // Check if content is available for posting
  const hasContent = () => {
    const textCondition = postMode === 'text' && textPost.trim().length > 0;
    const mediaCondition = (postMode === 'gallery' || postMode === 'camera') && selectedMedia.length > 0;
    return textCondition || mediaCondition;
  };

  // Check if post button should be enabled
  useEffect(() => {
    setIsPostButtonEnabled(hasContent() && !isUploading);
  }, [postMode, textPost, selectedMedia, isUploading]);

  // Debug function to check conditions
  const debugPostConditions = () => {
    const conditions = {
      'Text mode with content': postMode === 'text' && textPost.trim().length > 0,
      'Media mode with selected media': (postMode === 'gallery' || postMode === 'camera') && selectedMedia.length > 0,
      'Not currently uploading': !isUploading,
      'Content available': (postMode === 'text' && textPost.trim().length > 0) ||
                          ((postMode === 'gallery' || postMode === 'camera') && selectedMedia.length > 0),
      'User is logged in': !!user
    };
   
    console.log('Post Button Conditions:', conditions);
    Alert.alert(
      'Post Button Status',
      Object.entries(conditions)
        .map(([key, value]) => `${key}: ${value ? '✓' : '✗'}`)
        .join('\n')
    );
  };

  // Handle post button press
  const handlePostButtonPress = () => {
    if (!isPostButtonEnabled) {
      Alert.alert('Cannot Post', 'Please add text or media content before posting.');
      return;
    }
   
    if (!user) {
      // Show auth modal if content is valid but user isn't logged in
      setShowAuthModal(true);
    } else {
      // User is logged in and content is valid, proceed with upload
      onUpload();
    }
  };

  // Handle successful authentication from modal
  const handleAuthSuccess = (authenticatedUser) => {
    // Close the modal
    setShowAuthModal(false);
    
    // If user was authenticated successfully and parent component provided a callback
    if (authenticatedUser && onAuthSuccess) {
      onAuthSuccess(authenticatedUser);
    } else if (authenticatedUser && hasContent()) {
      // Fallback if no callback provided
      onUpload();
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#222" />
      </TouchableOpacity>
     
      <Text style={styles.headerTitle}>
        {postMode === 'initial' ? 'Create Post' :
         postMode === 'text' ? 'Text Post' :
         selectedMedia.length > 0 ? 'New Post' : 'Create Post'}
      </Text>
     
      <View style={styles.rightButtons}>
        {/* Debug button */}
        <TouchableOpacity
          onPress={debugPostConditions}
          style={styles.debugButton}
        >
          <Ionicons name="bug-outline" size={22} color="#555" />
        </TouchableOpacity>
       
        <TouchableOpacity
          onPress={handlePostButtonPress}
          disabled={!isPostButtonEnabled}
          style={[
            styles.postButton,
            !isPostButtonEnabled && styles.disabledButton
          ]}
        >
          <Text style={[
            styles.postButtonText,
            !isPostButtonEnabled && styles.disabledButtonText
          ]}>
            {isUploading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        navigation={navigation}
        onAuthSuccess={handleAuthSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugButton: {
    marginRight: 12,
    padding: 5,
  },
  postButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  }
});

export default PostScreenHeader;