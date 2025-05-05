import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ItemChat = ({ onSend }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TouchableOpacity 
      style={styles.chatButton}
      onPress={() => setIsExpanded(!isExpanded)}
    >
      <Ionicons 
        name={isExpanded ? "close" : "chatbubble-ellipses"} 
        size={18} 
        color="#007AFF" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    padding: 4,
  },
});

export default ItemChat;