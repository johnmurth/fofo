// CameraScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Platform, StatusBar,
  SafeAreaView, Alert, Modal, TextInput
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

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

  if (!cameraPermission) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }
  
  if (!cameraPermission.granted || !mediaPermission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>We need your permission to use the camera and gallery</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => {
            requestCameraPermission();
            requestMediaPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerOptions}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
            <Ionicons 
              name={flashMode === 'on' ? "flash" : "flash-off"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleCameraMode}>
            <Ionicons 
              name={cameraMode === 'photo' ? "videocam" : "camera"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          video={cameraMode === 'video'}
        />
      </View>

      {/* Selected Media Preview (if any) */}
      {selectedMedia.length > 0 && (
        <View style={styles.selectedMediaBar}>
          <Text style={styles.selectedCount}>
            Selected: {selectedMedia.length}
          </Text>
          <FlatList
            data={selectedMedia}
            keyExtractor={(_, index) => `selected-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedMediaList}
            renderItem={({ item, index }) => (
              <View style={styles.selectedItem}>
                <Image source={{ uri: item.uri }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.removeBadge}
                  onPress={() => removeSelectedMedia(index)}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={goToPostScreen}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={pickFromGallery}>
          <Ionicons name="images" size={28} color="white" />
        </TouchableOpacity>
        
        {cameraMode === 'photo' ? (
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.captureButton, isRecording && styles.recordingButton]} 
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <View style={styles.stopRecordingButton} />
            ) : (
              <View style={styles.startRecordingButton} />
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Gallery Preview */}
      <View style={styles.galleryContainer}>
        {isGalleryLoading ? (
          <View style={styles.galleryLoading}>
            <Text style={styles.galleryLoadingText}>Loading gallery...</Text>
          </View>
        ) : (
          <FlatList
            data={galleryItems}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.galleryItem}
                onPress={() => handleGalleryItemPress(item)}
              >
                <Image source={{ uri: item.uri }} style={styles.galleryImage} />
                {item.mediaType === 'video' && (
                  <View style={styles.videoIndicator}>
                    <Ionicons name="videocam" size={14} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Caption Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={captionModalVisible}
        onRequestClose={() => setCaptionModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Caption</Text>
            
            {currentMediaIndex !== null && selectedMedia[currentMediaIndex] && (
              <Image 
                source={{ uri: selectedMedia[currentMediaIndex].uri }}
                style={styles.modalImage}
              />
            )}
            
            <TextInput
              style={styles.modalInput}
              placeholder="Write a caption for this media..."
              placeholderTextColor="#999"
              multiline
              value={currentCaption}
              onChangeText={setCurrentCaption}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCaptionModalVisible(false)}
              >
                <Text style={styles.buttonText}>Skip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveCaption}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  headerOptions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  startRecordingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
  },
  stopRecordingButton: {
    width: 30,
    height: 30,
    backgroundColor: 'red',
    borderRadius: 4,
  },
  galleryContainer: {
    height: 80,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  galleryList: {
    paddingHorizontal: 10,
  },
  galleryItem: {
    marginHorizontal: 5,
    position: 'relative',
  },
  galleryImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  galleryLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryLoadingText: {
    color: 'white',
  },
  videoIndicator: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 3,
    borderRadius: 4,
  },
  errorText: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedMediaBar: {
    backgroundColor: '#000',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  selectedCount: {
    color: 'white',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  selectedMediaList: {
    paddingRight: 70, // space for the Next button
  },
  selectedItem: {
    marginRight: 8,
    position: 'relative',
  },
  selectedImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  removeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    backgroundColor: '#0095f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 5,
  },
  // Add other styles as needed
});

export default CameraScreen;