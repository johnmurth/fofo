import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CardComments = ({ comments, onForwardPress }) => {
    if (!comments || !comments.previewUsers) return null; // Safety check
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.commentPreview}>
        <View style={styles.thumbnailsStack}>
          {comments.previewUsers.slice(0, 2).map((thumb, index) => (
            <Image
              key={`thumb-${index}`}
              source={{ uri: thumb }}
              style={[
                styles.thumbnail,
                index === 1 && styles.secondThumbnail
              ]}
            />
          ))}
        </View>
        <Text style={styles.commentCount}>{comments.count} comments</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.forwardButton}
        onPress={onForwardPress}
      >
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100 // Ensure it's above other elements
  },
  commentPreview: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  thumbnailsStack: {
    flexDirection: 'row',
    marginRight: 10,
    height: 40
  },
  thumbnail: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#ddd'
  },
  secondThumbnail: {
    marginLeft: -15
  },
  commentCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  forwardButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20
  }
});

export default CardComments;