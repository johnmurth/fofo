import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Image,
  Text
} from 'react-native';
import CardLikesAndReplies from '../features/social/CardLikesAndReplies';
import CardHeader from '../common/CardHeader';
import CardComments from '../features/social/CardComments'; // Using bottom sheet approach
import CommentTrigger from '../features/social/CommentTrigger'; // Import the CommentTrigger
import { addReply, followUser } from '../../firebase/firebaseData';
import { auth } from '../../firebase/firebaseConfig';

const Card = ({ item, isActive }) => {
  // Check if this is a text-only post
  const isTextPost = item.postType === 'text' || 
                    (item.textPost && item.textPost.trim() !== '') ||
                    (!item.images || item.images.length === 0);
  
  // For image posts, validate the structure
  const hasValidImages = !isTextPost && 
                         Array.isArray(item.images) && 
                         item.images.length > 0;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [error, setError] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  
  // Validate images after component mounts
  useEffect(() => {
    if (!isTextPost && (!hasValidImages || !validateImages())) {
      setError(true);
    }
  }, []);
  
  // Validate image URIs
  const validateImages = () => {
    if (!item.images || !Array.isArray(item.images)) return false;
    
    // Check if all images have valid URIs
    return item.images.every(img => 
      img && typeof img === 'object' && 
      img.uri && typeof img.uri === 'string' && 
      img.uri.trim() !== ''
    );
  };
  
  // Get image source safely
  const getImageSource = (imageItem) => {
    // Default placeholder image
    const placeholderImage = require('../../assets/k.png');
    
    // Check if image object exists and has a valid URI
    if (!imageItem || !imageItem.uri || typeof imageItem.uri !== 'string' || imageItem.uri.trim() === '') {
      return placeholderImage;
    }
    
    return { uri: imageItem.uri };
  };
  
  const handleFollowPress = async () => {
    if (!auth.currentUser) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      const success = await followUser(auth.currentUser.uid, item.userId);
      if (success) {
        console.log('Successfully followed user');
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };
  
  const handleMenuPress = () => {
    console.log('Menu button pressed');
  };
  
  // Only run the image animation for image posts
  useEffect(() => {
    if (isTextPost || !isActive || !hasValidImages || error) {
      setCurrentImageIndex(0);
      progress.setValue(0);
      return;
    }
    
    if (paused) return;
    
    // Ensure the current image has a duration value, default to 5000ms if not
    const currentImage = item.images[currentImageIndex];
    const duration = currentImage && currentImage.duration ? currentImage.duration : 5000;
    
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    });
    
    animation.start(({ finished }) => {
      if (finished && isActive) {
        nextImage();
      }
    });
    
    return () => animation.stop();
  }, [currentImageIndex, isActive, paused, hasValidImages, isTextPost, item?.images, error]);
  
  const nextImage = () => {
    if (isTextPost || !hasValidImages || error) return;
    
    if (currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      progress.setValue(0);
    } else {
      setCurrentImageIndex(0);
      progress.setValue(0);
    }
  };
  
  const prevImage = () => {
    if (isTextPost || !hasValidImages || error) return;
    
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      progress.setValue(0);
    }
  };
  
  const handleTap = (event) => {
    if (isTextPost || cardWidth === 0 || error) return;
   
    const tapX = event.nativeEvent.locationX;
    const tapPosition = tapX / cardWidth;
    
    if (tapPosition < 0.33) {
      if (currentImageIndex > 0) {
        prevImage();
      }
    } else if (tapPosition > 0.66) {
      if (currentImageIndex < item.images.length - 1) {
        nextImage();
      }
    } else {
      setPaused(prev => !prev);
    }
  };
  
  const handleReplySubmit = async (imageIndex, replyText) => {
    if (!auth.currentUser) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      const success = await addReply(
        item.id, 
        isTextPost ? 0 : imageIndex, // Use 0 as default index for text posts
        replyText, 
        auth.currentUser.uid
      );
      
      if (success) {
        console.log(`Reply submitted successfully`);
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
    }
  };
  
  // If error or invalid data, show error component
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Unable to load content</Text>
      </View>
    );
  }
  
  // Reference to track if the component is mounted
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Render a text-only post
  if (isTextPost) {
    return (
      <View style={styles.outerContainer}>
        <View
          style={styles.container}
          onLayout={(event) => {
            if (isMounted.current) {
              const { width } = event.nativeEvent.layout;
              setCardWidth(width);
            }
          }}
        >
          <CardHeader
            profileImage={item.profileImage}
            profileName={item.profileName}
            timestamp={item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : item.timestamp}
            label={item.label}
            onFollowPress={handleFollowPress}
            onMenuPress={handleMenuPress}
            userId={item.userId}
          />
          
          <View style={styles.textPostContent}>
            <Text style={styles.textPostText}>{item.textPost}</Text>
          </View>
          
          <CardLikesAndReplies
            currentImageIndex={0}
            isTextPost={true}
            onReplySubmit={(_, replyText) => handleReplySubmit(0, replyText)}
            caption=""
            cardId={item.id}
          />
        </View>
        
        {/* Comments section using bottom sheet (no navigation prop needed) */}
        <CommentTrigger cardId={item.id} />
      </View>
    );
  }
  
  // For image posts, proceed with original rendering logic
  // Get the current image safely
  const currentImage = hasValidImages ? item.images[currentImageIndex] : null;
  const imageSource = getImageSource(currentImage);
  
  return (
    <View style={styles.outerContainer}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View
          style={styles.container}
          onLayout={(event) => {
            if (isMounted.current) {
              const { width } = event.nativeEvent.layout;
              setCardWidth(width);
            }
          }}
        >
          <Image
            source={imageSource}
            style={styles.image}
            onError={() => setError(true)}
            defaultSource={require('../../assets/k.png')} // Fallback image while loading
          />
         
          <CardHeader
            profileImage={item.profileImage}
            profileName={item.profileName}
            timestamp={item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : item.timestamp}
            label={item.label}
            onFollowPress={handleFollowPress}
            onMenuPress={handleMenuPress}
            userId={item.userId}
          />
          
          {hasValidImages && (
            <View style={styles.progressContainer}>
              {item.images.map((_, index) => (
                <View key={index} style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: index === currentImageIndex
                          ? progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            })
                          : index < currentImageIndex ? '100%' : '0%',
                      }
                    ]}
                  />
                </View>
              ))}
            </View>
          )}
          
          <CardLikesAndReplies
            currentImageIndex={currentImageIndex}
            images={item.images}
            onReplySubmit={handleReplySubmit}
            caption={currentImage?.caption || ''}
            cardId={item.id}
          />
        </View>
      </TouchableWithoutFeedback>
      
      {/* Comment trigger - this replaces the previous direct inclusion of CardComments */}
      <CommentTrigger cardId={item.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'space-between',
    height: '100%',
  },
  container: {
    position: 'relative',
    borderRadius: 10,
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
  },
  textPostContent: {
    padding: 16,
    backgroundColor: 'rgba(46, 104, 212, 0.4)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    flex: 1,
  },
  textPostText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#262626',
  },
});

export default Card;