// In your navigation file (e.g., AppNavigator.js)
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../screens/AuthScreen';
import PostScreen from '../screens/PostScreen';
import CommentScreen from '../features/social/CommentScreen';
import { NavigationContainer } from '@react-navigation/native';

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
      {/* Your other screens */}
      <Stack.Screen 
        name="NewPost" 
        component={PostScreen} 
        options={{ title: 'New Post' }} 
      />
      <Stack.Screen 
        name="CommentScreen" 
        component={CommentScreen} 
        options={{ title: 'Comments' }} 
      />
    </Stack.Navigator>
    </NavigationContainer>
  );
}