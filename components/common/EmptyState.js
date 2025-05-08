import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyState = () => {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.illustrationContainer}>
        <Ionicons name="share-social-outline" size={100} color="#b2dffc" />
      </View>
      <Text style={styles.emptyStateTitle}>Ready to share?</Text>
      <Text style={styles.emptyStateText}>
        Choose one of the options below to start creating your post.
      </Text>
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionItem}>
          <Ionicons name="images-outline" size={24} color="#0095f6" />
          <Text style={styles.instructionText}>Share photos from your gallery</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="camera-outline" size={24} color="#0095f6" />
          <Text style={styles.instructionText}>Capture a new moment</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="create-outline" size={24} color="#0095f6" />
          <Text style={styles.instructionText}>Write what's on your mind</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f8ff',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#222',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 15,
    maxWidth: '80%',
  },
  instructionsContainer: {
    width: '100%',
    marginTop: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  instructionText: {
    marginLeft: 15,
    fontSize: 15,
    color: '#444',
  },
});

export default EmptyState;