// App.js
// This file needs to share constants between components
import React, {useRef, useState} from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import CardSlider from './components/common/CardSlider';
import BottomSheet from './components/layout/BottomSheet';
import Header from './components/layout/Header';
import SearchAndFilter from './components//features/shopping/SearchAndFilter';
import ShoppingList from './components/features/shopping/ShoppingList'; 
import { shoppingData } from './utils/mockData';

// Define shared constants in a common place that both components can access
export const BOTTOM_SHEET_MIN_HEIGHT = 100;

export default function App() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sheetRef = useRef(null);

  const handleAddToCart = (itemId) => {
    console.log('Added to cart:', itemId);
    const item = shoppingData.find(i => i.id === itemId);
    alert(`Added ${item.description} to cart!`);
  };

  const handleSendMessage = (itemId, message) => {
    console.log(`Message to ${itemId}:`, message);
    // Implement your messaging logic here
  };

  return (
    <View style={styles.container}>
      <Header />
      <CardSlider />
      <BottomSheet 
        ref={sheetRef}
        onClose={() => setIsSheetOpen(false)}
      >
        <SearchAndFilter 
          onSearch={(query) => console.log('Searching for:', query)}
          onFilterPress={() => console.log('Filter pressed')}
          searchPlaceholder="Search locations..."
        />
        

          <View style={styles.sheetContent}>
            <ShoppingList 
              onAddToCart={handleAddToCart}
              onSendMessage={handleSendMessage}
            />
          </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  sheetContent: {
    paddingBottom: 30, // Extra padding for bottom safe area
  },
});