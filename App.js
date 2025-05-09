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
import useAuth from './firebase/auth';

// Create stack navigator
const Stack = createStackNavigator();

// Define shared constants
export const BOTTOM_SHEET_MIN_HEIGHT = 100;

// Main App Component
function MainApp({ navigation }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sheetRef = useRef(null);

  const handleAddToCart = (item) => {
    console.log('Item added to cart:', item);
  };

  const handleSendMessage = (item) => {
    console.log('Send message to:', item);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      <Header onMenuPress={() => setIsSheetOpen(true)} navigation={navigation} />
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
    position: 'relative',
  },
  sheetContent: {
    paddingBottom: 30, // Extra padding for bottom safe area
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#ff3040',
    textAlign: 'center',
  },
});