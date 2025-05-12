// components/GalleryPreview.js
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GalleryPreview = ({ isGalleryLoading, galleryItems, handleGalleryItemPress }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default GalleryPreview;
