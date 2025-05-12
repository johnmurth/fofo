// SelectedMediaBar.js
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SelectedMediaBar = ({ selectedMedia, removeSelectedMedia, goToPostScreen }) => {
  if (selectedMedia.length === 0) return null;
  
  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default SelectedMediaBar;