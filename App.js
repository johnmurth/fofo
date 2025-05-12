import React, {useRef, useState, useEffect} from 'react';
import { StatusBar, View, StyleSheet, ActivityIndicator, SafeAreaView, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CardSlider from './components/common/CardSlider';
import BottomSheet from './components/layout/BottomSheet';
import Header from './components/layout/Header';
import SearchAndFilter from './components/features/shopping/SearchAndFilter';
import ShoppingList from './components/features/shopping/ShoppingList';
import PostScreen from './components/common/PostScreen';
import CardComments from './components/features/social/CardComments'; // Import CardComments
import useAuth from './firebase/auth';

// Create a context for comments functionality
export const CommentsContext = React.createContext(null);

// Create stack navigator
const Stack = createStackNavigator();

// Define shared constants
export const BOTTOM_SHEET_MIN_HEIGHT = 100;

// Main App Component
function MainApp({ navigation }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState(null);
  const sheetRef = useRef(null);
  
  const handleAddToCart = (item) => {
    console.log('Item added to cart:', item);
  };
  
  const handleSendMessage = (item) => {
    console.log('Send message to:', item);
  };
  
  // Function to open comments for a specific card
  const openComments = (cardId) => {
    setActiveCardId(cardId);
    setIsCommentsModalOpen(true);
  };
  
  // Function to close comments
  const closeComments = () => {
    setIsCommentsModalOpen(false);
    setActiveCardId(null);
  };
  
  // Create comments context value
  const commentsContextValue = {
    openComments,
    closeComments
  };
  
  return (
    <CommentsContext.Provider value={commentsContextValue}>
      <View style={styles.container}>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
        <Header onMenuPress={() => setIsSheetOpen(true)} navigation={navigation} />
        <CardSlider />
        
        {/* Bottom sheet for shopping/filters */}
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
        
        {/* Render CardComments conditionally */}
        {isCommentsModalOpen && activeCardId && (
          <CardComments 
            cardId={activeCardId} 
            isVisible={isCommentsModalOpen}
            onClose={closeComments}
          />
        )}
      </View>
    </CommentsContext.Provider>
  );
}

// Root App Component
export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (authLoading) return;
        setInitializing(false);
      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Failed to initialize app. Please try again.');
        setInitializing(false);
      }
    };
    initializeApp();
  }, [authLoading, user]);
  
  if (authLoading || initializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Main" component={MainApp} />
        <Stack.Screen name="PostScreen" component={PostScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232323',
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    padding: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  sheetContent: {
    flex: 1,
    paddingTop: 10,
  },
});