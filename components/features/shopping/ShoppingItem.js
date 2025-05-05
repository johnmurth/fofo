import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Dimensions,
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SellerProfile from './SellerProfile';

// Global state to track which item has an open chat
let globalOpenChatId = null;
// Event emitter to notify other components
const chatEvents = {
  listeners: [],
  subscribe: (id, callback) => {
    chatEvents.listeners.push({ id, callback });
    return () => {
      chatEvents.listeners = chatEvents.listeners.filter(listener => listener.id !== id);
    };
  },
  emit: (openId) => {
    chatEvents.listeners.forEach(listener => {
      if (listener.id !== openId) {
        listener.callback();
      }
    });
  }
};

const ShoppingItem = ({ 
  id, // Add a unique ID prop to identify each ShoppingItem
  itemImage,
  description,
  price,
  sellerProfile,
  sellerLocation,
  onAddToCart,
  onSendMessage
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get('window').width;
  
  // Subscribe to chat events
  useEffect(() => {
    const unsubscribe = chatEvents.subscribe(id, () => {
      // Close this chat if another one opens
      if (isChatOpen) {
        closeChat();
      }
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, [id, isChatOpen]);

  const toggleChat = () => {
    if (isChatOpen && message.trim()) {
      handleSend();
      return;
    } 
    
    if (!isChatOpen) {
      // Notify other components to close their chats
      globalOpenChatId = id;
      chatEvents.emit(id);
    }
    
    Animated.spring(slideAnim, {
      toValue: isChatOpen ? 0 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start(() => setIsChatOpen(!isChatOpen));
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
    closeChat();
  };

  const closeChat = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      useNativeDriver: true,
    }).start(() => setIsChatOpen(false));
  };

  const getChatIcon = () => {
    if (isChatOpen) {
      return message.trim() ? "send" : "close";
    }
    return "chatbubble-ellipses";
  };

  const getChatIconColor = () => {
    if (isChatOpen) {
      return message.trim() ? "#007AFF" : "#ff4444";
    }
    return "#007AFF";
  };

  return (
    <View style={styles.container}>
      {/* Item Image with Chat Button */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: itemImage }} 
          style={styles.itemImage} 
          resizeMode="cover"
        />
        
        {/* Chat Input Field - Now slides from right to left */}
        <Animated.View style={[
          styles.chatInputContainer,
          {
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [windowWidth, 0] // Now slides in from right
              })
            }],
            opacity: slideAnim
          }
        ]}>
          <TextInput
            style={styles.chatInput}
            placeholder="Reply..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSend}
          />
        </Animated.View>
        
        {/* Chat button placed after the input to ensure higher z-index */}
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={toggleChat}
        >
          <Ionicons 
            name={getChatIcon()} 
            size={20} 
            color={getChatIconColor()} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Item Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">
          {description}
        </Text>
        
        {/* Price and Add to Cart */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={onAddToCart}
          >
            <Ionicons name="cart" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Seller Profile */}
        <SellerProfile 
          profileImage={sellerProfile.image}
          profileName={sellerProfile.name}
          location={sellerLocation}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  chatButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    zIndex: 2, // Higher z-index to appear above the input field
  },
  detailsContainer: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInputContainer: {
    position: 'absolute',
    bottom: 8, // Aligned with the chatButton
    left: 0,
    right: 45, // Leave space for the chat button on the right
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginLeft: 10,
    borderRadius: 50,
    zIndex: 1, // Lower z-index than the chat button
  },
  chatInput: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    color: '#fff',
    paddingVertical: 0, // Important for vertical centering on Android
    textAlignVertical: 'center', // Ensures text is vertically centered
    includeFontPadding: false
  },
});

export default ShoppingItem;