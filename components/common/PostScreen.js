// PostScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  LogBox
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../../firebase/firebaseConfig';
import PostScreenHeader from './PostScreenHeader';
import EmptyState from './EmptyState';
import TextPostForm from './TextPostForm';
import MediaList from './MediaList';
import { uploadPost } from '../../utils/postUploadUtils';
import useAuth from '../../firebase/auth'; // Import the useAuth hook

// Ignore specific warnings related to Expo Go media library limitations
LogBox.ignoreLogs(['Due to changes in Androids permission requirements']);

const { width } = Dimensions.get('window');

const PostScreen = ({ navigation }) => {
  // State variables
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [postMode, setPostMode] = useState('initial'); // 'initial', 'gallery', 'camera', 'text'
  const [textPost, setTextPost] = useState('');
  const [captions, setCaptions] = useState({});
  
  // Use the auth hook instead of directly accessing Firebase auth
  const { user, loading: authLoading } = useAuth();

  // Update caption for a specific media item
  const updateCaption = (assetId, text) => {
    setCaptions({
      ...captions,
      [assetId]: text
    });
  };

  // Remove a media item from selection
  const removeMedia = (assetId) => {
    setSelectedMedia(prev => prev.filter(item => item.id !== assetId));
    
    // Remove caption for this asset
    const newCaptions = {...captions};
    delete newCaptions[assetId];
    setCaptions(newCaptions);
  };

  // Handle uploading the post
  const handleUploadPost = async () => {
    if (postMode === 'text' && !textPost.trim()) {
      Alert.alert('Error', 'Please enter some text for your post');
      return;
    }
    
    if ((postMode === 'gallery' || postMode === 'camera') && selectedMedia.length === 0) {
      Alert.alert('Error', 'Please select at least one media item');
      return;
    }
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }

    setIsUploading(true);
    try {
      await uploadPost({
        user,
        db,
        storage,
        postMode,
        selectedMedia,
        captions,
        textPost,
        navigation
      });
      
      // Reset form after successful upload
      setSelectedMedia([]);
      setTextPost('');
      setCaptions({});
      setPostMode('initial');
      
    } catch (error) {
      console.error('Error uploading post:', error);
      Alert.alert('Error', 'Failed to upload post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Open gallery picker
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        "Permission required",
        "Please allow access to your media library to select photos",
        [{ text: "OK" }]
      );
      return;
    }
  
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 10,
        aspect: [4, 3],
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Format assets to have a unique id
        const formattedAssets = result.assets.map(asset => ({
          ...asset,
          id: asset.assetId || `${asset.uri}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: asset.type || 'image'
        }));
        setSelectedMedia(formattedAssets);
        // Set post mode after selecting media
        setPostMode('gallery');
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open device camera
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        "Permission required",
        "Please allow access to your camera to take photos",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedAsset = {
          ...result.assets[0],
          id: result.assets[0].assetId || `camera-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: result.assets[0].type || 'image'
        };
        setSelectedMedia([capturedAsset]);
        // Set post mode after capturing media
        setPostMode('camera');
      }
    } catch (error) {
      console.error('Error using camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle auth success callback from PostScreenHeader/AuthModal
  const handleAuthSuccess = (authUser) => {
    // User is now authenticated, can proceed with upload if there's content
    if (authUser && 
        ((postMode === 'text' && textPost.trim()) || 
         ((postMode === 'gallery' || postMode === 'camera') && selectedMedia.length > 0))) {
      handleUploadPost();
    }
  };

  // Render the content based on the mode
  const renderContent = () => {
    if (postMode === 'initial') {
      return <EmptyState />;
    }
    
    if (postMode === 'text') {
      return <TextPostForm textPost={textPost} setTextPost={setTextPost} />;
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
          <Text style={styles.loadingText}>Loading media...</Text>
        </View>
      );
    }

    if (selectedMedia.length > 0) {
      return (
        <MediaList 
          selectedMedia={selectedMedia}
          setSelectedMedia={setSelectedMedia}
          captions={captions}
          updateCaption={updateCaption}
          removeMedia={removeMedia}
          postMode={postMode}
        />
      );
    }

    return <EmptyState />;
  };

  return (
    <View style={styles.container}>
      {/* Header Component */}
      <PostScreenHeader
        navigation={navigation}
        postMode={postMode}
        selectedMedia={selectedMedia}
        textPost={textPost}
        isUploading={isUploading}
        user={user}
        onUpload={handleUploadPost}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Post Option Buttons */}
      <View style={styles.optionsContainer}>
        <Text style={styles.promptText}>
          What would you like to share today?
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.optionButton, postMode === 'gallery' && styles.activeOption]} 
            onPress={() => {
              openGallery();
            }}
          >
            <Ionicons 
              name="images" 
              size={28} 
              color={postMode === 'gallery' ? "#ffffff" : "#0095f6"} 
            />
            <Text style={[styles.optionText, postMode === 'gallery' && styles.activeOptionText]}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionButton, postMode === 'camera' && styles.activeOption]} 
            onPress={() => {
              openCamera();
            }}
          >
            <Ionicons 
              name="camera" 
              size={28} 
              color={postMode === 'camera' ? "#ffffff" : "#0095f6"} 
            />
            <Text style={[styles.optionText, postMode === 'camera' && styles.activeOptionText]}>
              Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionButton, postMode === 'text' && styles.activeOption]} 
            onPress={() => setPostMode('text')}
          >
            <Ionicons 
              name="create" 
              size={28} 
              color={postMode === 'text' ? "#ffffff" : "#0095f6"} 
            />
            <Text style={[styles.optionText, postMode === 'text' && styles.activeOptionText]}>
              Text
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading Overlay */}
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.uploadingText}>Uploading post...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#0095f6',
    fontSize: 16,
  },
  optionsContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  promptText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: width / 3.5,
  },
  activeOption: {
    backgroundColor: '#0095f6',
  },
  optionText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  activeOptionText: {
    color: '#fff',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  uploadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 15,
  },
});

export default PostScreen;