import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  TouchableWithoutFeedback, 
  Image 
} from 'react-native';
import CardLikesAndReplies from '../features/social/CardLikesAndReplies';
import CardHeader from '../common/CardHeader';

const Card = ({ item, isActive }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const handleFollowPress = () => {
    console.log('Follow button pressed');
  };

  const handleMenuPress = () => {
    console.log('Menu button pressed');
  };

  useEffect(() => {
    if (!isActive) {
      setCurrentImageIndex(0);
      progress.setValue(0);
      return;
    }

    if (paused) return;

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: item.images[currentImageIndex].duration,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished && isActive) {
        nextImage();
      }
    });

    return () => animation.stop();
  }, [currentImageIndex, isActive, paused]);

  const nextImage = () => {
    if (currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      progress.setValue(0);
    } else {
      setCurrentImageIndex(0);
      progress.setValue(0);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      progress.setValue(0);
    }
  };

  const handleTap = (event) => {
    if (cardWidth === 0) return;
    
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

  const handleReplySubmit = (imageIndex, replyText) => {
    console.log(`Reply to image ${imageIndex + 1}: ${replyText}`);
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View 
        style={styles.container}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setCardWidth(width);
        }}
      >
        <Image
          source={{ uri: item.images[currentImageIndex].uri }}
          style={styles.image}
        />
        
        <CardHeader
          profileImage={item.profileImage}
          profileName={item.profileName}
          timestamp={item.timestamp}
          label={item.label}
          onFollowPress={handleFollowPress}
          onMenuPress={handleMenuPress}
        />

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

        <CardLikesAndReplies
          currentImageIndex={currentImageIndex}
          images={item.images}
          onReplySubmit={handleReplySubmit}
          caption={item.images[currentImageIndex].caption}
          comments={item.comments} // Pass comments data here
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  progressContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
});

export default Card;