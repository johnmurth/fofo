import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
// Import your screens
import AuthScreen from '../screens/AuthScreen';
import PostScreen from '../screens/PostScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewPost"
          component={PostScreen}
          options={{ title: 'New Post' }}
        />
        {/* Add other screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}