// components/PostScreenHeader.js - Key parts fixed
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthModal from '../../firebase/AuthModal';
import { validateAuthState, getUserData, handleAuthError } from '../../utils/authService';
import { hasValidSession, extendSession, saveSession } from '../../utils/sessionManager';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import useAuth from '../../firebase/auth'; // Import the useAuth hook

const PostScreenHeader = ({
  navigation,
  postMode,
  selectedMedia = [],
  textPost = '',
  isUploading = false,
  user = null,
  onUpload,
  onAuthSuccess
}) => {
  // State to track button enabled status and auth modal visibility
  const [isPostButtonEnabled, setIsPostButtonEnabled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Start with true to prevent early actions
  const [currentUser, setCurrentUser] = useState(user);
  const [authInProgress, setAuthInProgress] = useState(false);
  const authCheckCompleted = useRef(false);
  
  // Use our auth hook
  const { user: authUser, checkAuthStatus } = useAuth();
  
  // Update currentUser when authUser changes
  useEffect(() => {
    if (authUser) {
      console.log("[PostScreenHeader] Auth user updated from hook:", authUser.uid);
      setCurrentUser(authUser);
      setIsCheckingAuth(false);
      authCheckCompleted.current = true;
    }
  }, [authUser]);
  
  // Check if content is available for posting
  const hasContent = () => {
    const textCondition = postMode === 'text' && textPost.trim().length > 0;
    const mediaCondition = (postMode === 'gallery' || postMode === 'camera') && selectedMedia.length > 0;
    return textCondition || mediaCondition;
  };

  // Check if post button should be enabled
  useEffect(() => {
    setIsPostButtonEnabled(hasContent() && !isUploading && !isCheckingAuth);
  }, [postMode, textPost, selectedMedia, isUploading, isCheckingAuth]);

  // Initialize Firebase Auth listener when component mounts
  useEffect(() => {
    let isMounted = true;
    
    // Restore cached user session first
    const restoreCachedSession = async () => {
      try {
        // Check if we have a valid session first
        const sessionValid = await hasValidSession();
        console.log("[PostScreenHeader] Session valid:", sessionValid);
        
        if (sessionValid) {
          const sessionData = await AsyncStorage.getItem('auth_session');
          if (sessionData) {
            const userData = JSON.parse(sessionData);
            console.log("[PostScreenHeader] Restored user session from cache");
            
            // Check auth status explicitly
            const isAuthenticated = checkAuthStatus();
            console.log("[PostScreenHeader] Current auth status:", isAuthenticated);
            
            if (!isAuthenticated) {
              console.log("[PostScreenHeader] Firebase auth doesn't match session data, clearing cache");
              await AsyncStorage.removeItem('auth_session');
            }
          }
        }
      } catch (error) {
        console.error("[PostScreenHeader] Error restoring session:", error);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
          authCheckCompleted.current = true;
        }
      }
    };
    
    // Restore session immediately
    restoreCachedSession();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Safely process authentication and post
  const processAuthAndPost = async (userToValidate) => {
    if (authInProgress) {
      console.log("[PostScreenHeader] Auth already in progress, ignoring request");
      return;
    }
    
    setAuthInProgress(true);
    setIsCheckingAuth(true);
    
    try {
      if (!userToValidate) {
        console.log("[PostScreenHeader] No user to validate, showing auth modal");
        setShowAuthModal(true);
        return;
      }
      
      console.log("[PostScreenHeader] Validating auth state for user:", userToValidate.uid);
      
      // Validate authentication state
      const isValidAuth = await validateAuthState(userToValidate);
      
      if (!isValidAuth) {
        console.log("[PostScreenHeader] Invalid auth state, showing error");
        handleAuthError(
          new Error('Authentication session expired'), 
          () => navigation.navigate('Auth')
        );
        return;
      }
      
      // If we got here, auth is valid, extend the session
      await extendSession();
      console.log("[PostScreenHeader] Session extended successfully");
      
      // Get fresh user data before posting
      const db = getFirestore();
      const userData = await getUserData(userToValidate, db);
      console.log("[PostScreenHeader] User data retrieved successfully");
      
      // Finally, proceed with upload
      if (onUpload) {
        onUpload(userData);
      } else {
        console.error("[PostScreenHeader] No upload handler provided");
        Alert.alert("Error", "Upload handler not configured correctly.");
      }
    } catch (error) {
      console.error('[PostScreenHeader] Error in processAuthAndPost:', error);
      
      // Check if token expired error
      if (error.message && error.message.includes('expired')) {
        handleAuthError(error, () => navigation.navigate('Auth'));
      } else {
        Alert.alert(
          'Error',
          'There was a problem processing your request. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsCheckingAuth(false);
      setAuthInProgress(false);
    }
  };

  // Handle post button press with debounce to prevent multiple clicks
  const handlePostButtonPress = async () => {
    if (!isPostButtonEnabled || authInProgress) {
      if (!hasContent()) {
        Alert.alert('Cannot Post', 'Please add text or media content before posting.');
      }
      return;
    }
    
    // Set a flag to prevent multiple simultaneous auth processes
    if (!authCheckCompleted.current) {
      Alert.alert('Please wait', 'Still checking authentication status...');
      return;
    }
    
    // Get the current Firebase user state directly
    const auth = getAuth();
    const firebaseUser = auth.currentUser;
    
    // Attempt to use the most reliable user source
    const userToProcess = firebaseUser || currentUser || user;
    
    if (!userToProcess) {
      console.log("[PostScreenHeader] No user available, showing auth modal");
      setShowAuthModal(true);
      return;
    }
    
    // Process auth and upload
    processAuthAndPost(userToProcess);
  };

  // Handle successful authentication from modal
  const handleAuthSuccess = async (authenticatedUser) => {
    // Close the modal first
    setShowAuthModal(false);
    
    if (authInProgress) {
      console.log("[PostScreenHeader] Auth already in progress, ignoring duplicate callback");
      return;
    }
    
    if (!authenticatedUser) {
      console.error("[PostScreenHeader] No authenticated user received");
      return;
    }
    
    try {
      setAuthInProgress(true);
      console.log("[PostScreenHeader] Auth success for user:", authenticatedUser.uid);
      
      // Update our state with the new user
      setCurrentUser(authenticatedUser);
      
      // Save user session
      await saveSession(authenticatedUser);
      
      // If parent component provided an auth success callback
      if (onAuthSuccess) {
        onAuthSuccess(authenticatedUser);
      }
      
      // If we have content, proceed with upload automatically
      if (hasContent()) {
        const db = getFirestore();
        const userData = await getUserData(authenticatedUser, db);
        
        if (onUpload) {
          onUpload(userData);
        }
      }
    } catch (error) {
      console.error('[PostScreenHeader] Error after authentication:', error);
      Alert.alert(
        'Authentication Error',
        'There was a problem completing your authentication. Please try again.'
      );
    } finally {
      setAuthInProgress(false);
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#222" />
      </TouchableOpacity>
     
      <Text style={styles.headerTitle}>
        {postMode === 'initial' ? 'Create Post' :
         postMode === 'text' ? 'Text Post' :
         selectedMedia.length > 0 ? 'New Post' : 'Create Post'}
      </Text>
     
      <View style={styles.rightButtons}>
        {/* Auth status indicator */}
        {isCheckingAuth && (
          <ActivityIndicator size="small" color="#3498db" style={styles.authIndicator} />
        )}
      
        {/* User status indicator - green dot if logged in */}
        <View style={[
          styles.userStatusDot,
          currentUser ? styles.userLoggedIn : styles.userLoggedOut
        ]} />
        
        <TouchableOpacity
          onPress={handlePostButtonPress}
          disabled={!isPostButtonEnabled || authInProgress}
          style={[
            styles.postButton,
            (!isPostButtonEnabled || authInProgress) && styles.disabledButton
          ]}
        >
          {authInProgress ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[
              styles.postButtonText,
              (!isPostButtonEnabled || authInProgress) && styles.disabledButtonText
            ]}>
              {isUploading ? 'Posting...' : 'Post'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthInProgress(false);
        }}
        navigation={navigation}
        onAuthSuccess={handleAuthSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    textAlign: 'center'
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  authIndicator: {
    marginRight: 8
  },
  userStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  userLoggedIn: {
    backgroundColor: '#2ecc71' // Green when logged in
  },
  userLoggedOut: {
    backgroundColor: '#e74c3c' // Red when logged out
  },
  debugButton: {
    padding: 8,
    marginRight: 8
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36 // Fixed height to prevent layout shift
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  disabledButtonText: {
    color: '#888'
  }
});

export default PostScreenHeader;