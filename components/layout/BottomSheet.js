import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';

const { height } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = height * 1;
const BOTTOM_SHEET_MIN_HEIGHT = 100;
const MAX_UPWARD_TRANSLATE_Y = -BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_MIN_HEIGHT;
const MAX_DOWNWARD_TRANSLATE_Y = 0;

const BottomSheet = ({ children }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const dragY = useRef(new Animated.Value(0)).current;
  const lastDragPosition = useRef(0);
  const isDragging = useRef(false);

  // Initialize the starting position
  useEffect(() => {
    animatedValue.setValue(MAX_DOWNWARD_TRANSLATE_Y);
  }, []);

  const springAnimation = (direction) => {
    const toValue = direction === 'up' ? MAX_UPWARD_TRANSLATE_Y : MAX_DOWNWARD_TRANSLATE_Y;
    
    // Reset drag reference when animating
    lastDragPosition.current = toValue;
    
    Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      friction: 10,
      tension: 50,
      velocity: 0.6,
    }).start(() => {
      setIsExpanded(direction === 'up');
    });
  };

  // Create pan responder for the sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only respond to significant vertical movements
        return Math.abs(gesture.dy) > 5 && Math.abs(gesture.dx) < Math.abs(gesture.dy);
      },
      onPanResponderGrant: () => {
        // Stop any running animations
        animatedValue.stopAnimation((value) => {
          // Store the exact position where the drag started
          lastDragPosition.current = value;
          dragY.setValue(0); // Reset the drag accumulator
          isDragging.current = true;
        });
      },
      onPanResponderMove: (_, gesture) => {
        // Update the drag accumulator
        dragY.setValue(gesture.dy);
        
        // Calculate the new position by adding the drag distance to the last position
        const newPosition = lastDragPosition.current + gesture.dy;
        
        // Keep the position within bounds
        if (newPosition <= MAX_DOWNWARD_TRANSLATE_Y && newPosition >= MAX_UPWARD_TRANSLATE_Y) {
          animatedValue.setValue(newPosition);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        isDragging.current = false;
        
        // Get the final velocity including direction
        const velocity = gesture.vy;
        const currentPosition = lastDragPosition.current + gesture.dy;
        
        // Update the last position for the next interaction
        lastDragPosition.current = currentPosition;
        
        // Determine whether to snap up or down based on:
        // 1. Current position relative to halfway point
        // 2. Velocity of the gesture
        const midPoint = (MAX_UPWARD_TRANSLATE_Y + MAX_DOWNWARD_TRANSLATE_Y) / 2;
        
        if (velocity > 0.5) {
          // Fast downward flick
          springAnimation('down');
        } else if (velocity < -0.5) {
          // Fast upward flick
          springAnimation('up');
        } else if (currentPosition < midPoint) {
          // Closer to top
          springAnimation('up');
        } else {
          // Closer to bottom
          springAnimation('down');
        }
      },
      onPanResponderTerminate: () => {
        // If interrupted, animate to the nearest edge
        isDragging.current = false;
        const currentValue = lastDragPosition.current;
        const midPoint = (MAX_UPWARD_TRANSLATE_Y + MAX_DOWNWARD_TRANSLATE_Y) / 2;
        
        if (currentValue < midPoint) {
          springAnimation('up');
        } else {
          springAnimation('down');
        }
      }
    })
  ).current;

  // Calculate dynamic styles
  const animatedStyle = {
    transform: [{
      translateY: animatedValue
    }],
  };

  const overlayOpacity = animatedValue.interpolate({
    inputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  // Handle tap on overlay - close the sheet when overlay is tapped
  const handleOverlayTap = () => {
    if (isExpanded && !isDragging.current) {
      springAnimation('down');
    }
  };

  return (
    <>
      {/* Overlay - responds to taps when expanded */}
      <TouchableWithoutFeedback onPress={handleOverlayTap}>
        <Animated.View style={[
          styles.overlay, 
          { 
            opacity: overlayOpacity,
            pointerEvents: isExpanded ? 'auto' : 'none'
          }
        ]} />
      </TouchableWithoutFeedback>
      
      {/* Bottom Sheet - responds to drags */}
      <Animated.View style={[styles.container, animatedStyle]} {...panResponder.panHandlers}>
        <View style={styles.dragHandle}>
          <View style={styles.dragHandleIndicator} />
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    width: '100%',
    height: BOTTOM_SHEET_MAX_HEIGHT,
    bottom: -BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_MIN_HEIGHT,
    backgroundColor: 'rgb(255, 255, 255)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 20,
  },
  dragHandle: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandleIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 10,
    paddingTop: 0,
    maxHeight: height * 0.85, // Prevent sheet from going too high
  },
});

export default BottomSheet;