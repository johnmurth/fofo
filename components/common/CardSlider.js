// CardSlider.js
import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Animated, Dimensions } from 'react-native';
import Card from './Card';
import { data, CARD_WIDTH, SPACING, SNAP_INTERVAL } from '../../utils/mockData';

const { width, height } = Dimensions.get('window');
// Import the BOTTOM_SHEET_MIN_HEIGHT constant or define it here
const BOTTOM_SHEET_MIN_HEIGHT = 100;

const CardSlider = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const newIndex = Math.round(value / SNAP_INTERVAL);
      setActiveIndex(newIndex);
    });
    return () => scrollX.removeListener(listener);
  }, []);
  
  // Calculate the card height to extend to where the bottom sheet starts
  // Leave some padding at the bottom for better visual appearance
  const CARD_HEIGHT = height - BOTTOM_SHEET_MIN_HEIGHT - 70; // 20px padding
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollViewContent}
      >
        {data.map((item, index) => {
          const inputRange = [
            (index - 1) * SNAP_INTERVAL,
            index * SNAP_INTERVAL,
            (index + 1) * SNAP_INTERVAL,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [10, 0, 10],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.card,
                {
                  height: CARD_HEIGHT, // Use the dynamic height here
                  transform: [{ scale }, { translateY }],
                  opacity,
                  marginRight: index === data.length - 1 ? 0 : SPACING,
                },
              ]}
            >
              <Card
                item={item}
                isActive={activeIndex === index}
              />
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    marginTop: 10
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  card: {
    width: CARD_WIDTH,
    // height is now set dynamically in the component
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default CardSlider;