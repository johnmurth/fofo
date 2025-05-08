// components/MediaList.js
import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const MediaList = ({ 
  selectedMedia, 
  setSelectedMedia, 
  captions, 
  updateCaption, 
  removeMedia,
  postMode
}) => {
  // Import necessary function from parent component via props
  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission required",
          "Please allow access to your media library to select photos",
          [{ text: "OK" }]
        );
        return;
      }
    
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
        setSelectedMedia([...selectedMedia, ...formattedAssets]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  // Open device camera
  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission required",
          "Please allow access to your camera to take photos",
          [{ text: "OK" }]
        );
        return;
      }

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
        setSelectedMedia([...selectedMedia, capturedAsset]);
      }
    } catch (error) {
      console.error('Error using camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  // Render selected media item with caption input
  const renderMediaItem = ({ item }) => {
    return (
      <View style={styles.mediaItemContainer}>
        <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
        
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption to this photo..."
            value={captions[item.id] || ''}
            onChangeText={(text) => updateCaption(item.id, text)}
            multiline
            maxLength={200}
          />
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeMedia(item.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={selectedMedia}
      renderItem={renderMediaItem}
      keyExtractor={item => item.id}
      style={styles.container}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <View style={styles.infoContainer}>
            <Ionicons 
              name={postMode === 'gallery' ? "images" : "camera"} 
              size={22} 
              color="#0095f6" 
            />
            <Text style={styles.infoText}>
              {selectedMedia.length} {selectedMedia.length === 1 ? 'item' : 'items'} selected
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addMoreButton}
            onPress={postMode === 'gallery' ? openGallery : openCamera}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text style={styles.addMoreText}>Add More</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  addMoreButton: {
    backgroundColor: '#0095f6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoreText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  mediaItemContainer: {
    marginVertical: 12,
    marginHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mediaPreview: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  captionContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  captionInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
    marginRight: 10,
  },
  removeButton: {
    padding: 8,
  },
});

export default MediaList;