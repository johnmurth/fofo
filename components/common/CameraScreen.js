// CameraScreen.js (refactored)
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Alert, SafeAreaView, StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

// Import refactored components
import CameraHeader from './camera/CameraHeader';
import CameraControls from './camera/CameraControls';
import GalleryPreview from './camera/GalleryPreview';
import SelectedMediaBar from './camera/SelectedMediaBar';
import CaptionModal from './camera/CaptionModal';
import PermissionsView from './camera/PermissionsView';

const CameraScreen = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  
  const [cameraType, setCameraType] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [galleryItems, setGalleryItems] = useState([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [cameraMode, setCameraMode] = useState('photo'); // 'photo' or 'video'
  const [isRecording, setIsRecording] = useState(false);
  
  // Caption modal state
  const [captionModalVisible, setCaptionModalVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(null);
  const [currentCaption, setCurrentCaption] = useState('');
  
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      // Request all required permissions
      await requestCameraPermission();
      await requestMicrophonePermission();
      await requestMediaPermission();
      
      if (mediaPermission?.granted) {
        loadGalleryImages();
      }
    })();
  }, []);

  const loadGalleryImages = async () => {
    setIsGalleryLoading(true);
    
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        sortBy: ['creationTime'],
        first: 20,
      });
      
      setGalleryItems(media.assets);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      Alert.alert('Error', 'Failed to load gallery images');
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        
        // Add to selected media with empty caption
        const newMedia = {
          ...photo,
          caption: '',
          type: 'image'
        };
        
        setSelectedMedia(prev => [...prev, newMedia]);
        setCurrentMediaIndex(selectedMedia.length);
        setCurrentCaption('');
        setCaptionModalVisible(true);
        
        // Reload gallery to show new image
        loadGalleryImages();
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const videoRecordPromise = cameraRef.current.recordAsync();
        
        // Set up a recording limit (optional)
        const recordingTimerId = setTimeout(() => {
          if (isRecording) {
            stopRecording();
          }
        }, 30000); // 30-second limit
        
        const video = await videoRecordPromise;
        clearTimeout(recordingTimerId);
        
        // Save to media library
        await MediaLibrary.saveToLibraryAsync(video.uri);
        
        // Add to selected media with empty caption
        const newMedia = {
          uri: video.uri,
          caption: '',
          type: 'video',
          duration: video.duration || 5000
        };
        
        setSelectedMedia(prev => [...prev, newMedia]);
        setCurrentMediaIndex(selectedMedia.length);
        setCurrentCaption('');
        setCaptionModalVisible(true);
        
        // Reload gallery
        loadGalleryImages();
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('Error', 'Failed to record video');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode(current => (current === 'off' ? 'on' : 'off'));
  };

  const toggleCameraMode = () => {
    setCameraMode(current => (current === 'photo' ? 'video' : 'photo'));
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });
      
      if (!result.canceled) {
        const newMedia = result.assets.map(item => ({
          ...item,
          caption: '',
          type: item.type || 'image'
        }));
        
        setSelectedMedia(prev => [...prev, ...newMedia]);
        
        // If only one item selected, open caption modal
        if (newMedia.length === 1) {
          setCurrentMediaIndex(selectedMedia.length);
          setCurrentCaption('');
          setCaptionModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Failed to pick media from gallery');
    }
  };

  const handleGalleryItemPress = (item) => {
    const newMediaItem = {
      uri: item.uri,
      caption: '',
      type: item.mediaType === 'video' ? 'video' : 'image',
      duration: item.duration || 5000
    };
    
    setSelectedMedia(prev => [...prev, newMediaItem]);
    setCurrentMediaIndex(selectedMedia.length);
    setCurrentCaption('');
    setCaptionModalVisible(true);
  };
  
  const saveCaption = () => {
    if (currentMediaIndex !== null) {
      setSelectedMedia(prev => 
        prev.map((item, index) => 
          index === currentMediaIndex ? { ...item, caption: currentCaption } : item
        )
      );
    }
    setCaptionModalVisible(false);
  };

  const removeSelectedMedia = (index) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const goToPostScreen = () => {
    if (selectedMedia.length > 0) {
      navigation.navigate('PostScreen', { selectedMedia });
    } else {
      Alert.alert('No Media Selected', 'Please select at least one photo or video.');
    }
  };

  const requestPermissions = () => {
    requestCameraPermission();
    requestMediaPermission();
  };

  if (!cameraPermission) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }
  
  if (!cameraPermission.granted || !mediaPermission?.granted) {
    return <PermissionsView onRequestPermissions={requestPermissions} />;
  }

  const currentMediaItem = currentMediaIndex !== null ? selectedMedia[currentMediaIndex] : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <CameraHeader 
        navigation={navigation}
        flashMode={flashMode}
        toggleFlash={toggleFlash}
        cameraMode={cameraMode}
        toggleCameraMode={toggleCameraMode}
      />

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          video={cameraMode === 'video'}
        />
      </View>

      <SelectedMediaBar
        selectedMedia={selectedMedia}
        removeSelectedMedia={removeSelectedMedia}
        goToPostScreen={goToPostScreen}
      />

      <CameraControls
        cameraMode={cameraMode}
        isRecording={isRecording}
        takePicture={takePicture}
        startRecording={startRecording}
        stopRecording={stopRecording}
        pickFromGallery={pickFromGallery}
        toggleCameraType={toggleCameraType}
      />

      <GalleryPreview
        isGalleryLoading={isGalleryLoading}
        galleryItems={galleryItems}
        handleGalleryItemPress={handleGalleryItemPress}
      />

      <CaptionModal
        visible={captionModalVisible}
        onClose={() => setCaptionModalVisible(false)}
        currentMedia={currentMediaItem}
        caption={currentCaption}
        onCaptionChange={setCurrentCaption}
        onSave={saveCaption}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});

export default CameraScreen;