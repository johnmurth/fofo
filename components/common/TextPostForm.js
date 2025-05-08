import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TextPostForm = ({ textPost, setTextPost }) => {
  return (
    <View style={styles.textPostContainer}>
      <View style={styles.heading}>
        <Ionicons name="create-outline" size={24} color="#0095f6" />
        <Text style={styles.headingText}>Share your thoughts</Text>
      </View>
     
      <TextInput
        style={styles.textPostInput}
        placeholder="What's on your mind today?"
        placeholderTextColor="#999"
        multiline
        value={textPost}
        onChangeText={setTextPost}
        autoFocus
        maxLength={2000}
      />
     
      <View style={styles.counter}>
        <Text style={[
          styles.counterText,
          textPost.length > 500 && styles.counterWarning
        ]}>
          {textPost.length}/2000
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  textPostContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flex: 1,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  textPostInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 10,
  },
  counter: {
    alignItems: 'flex-end',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  counterText: {
    fontSize: 14,
    color: '#777',
  },
  counterWarning: {
    color: '#ff8800',
  },
});

export default TextPostForm;