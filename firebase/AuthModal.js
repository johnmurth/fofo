// COMPLETE REVISED AUTHMODAL.JS

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../firebase/auth'; // Import the useAuth hook

const AuthModal = ({ visible, onClose, navigation, onAuthSuccess = null }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the auth hook
  const { signIn, signUp, user, error: authError } = useAuth();
  
  // Clear error when switching between login/signup
  useEffect(() => {
    setError('');
  }, [isLogin]);
  
  // Update error from auth hook
  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
  }, [authError]);
  
  // Handle successfully authenticated user
  useEffect(() => {
    if (user && visible && onAuthSuccess) {
      console.log("User detected in AuthModal, calling onAuthSuccess");
      // Small delay to ensure Firebase has completed its internal processes
      const timer = setTimeout(() => {
        setLoading(false);
        onAuthSuccess(user);
        handleClose();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, visible]);
  
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    // Form validation
    if (!email) {
      setError('Email is required');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (!isLogin && !displayName) {
      setError('Display name is required');
      return false;
    }
    
    // Additional validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleAuth = async () => {
    // Clear previous errors
    setError('');
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Attempting to ${isLogin ? 'sign in' : 'sign up'} with email: ${email}`);
      
      let success = false;
      
      if (isLogin) {
        // Use the signIn function from useAuth
        success = await signIn(email, password);
        console.log("Sign in result:", success);
      } else {
        // Use the signUp function from useAuth
        success = await signUp(email, password, displayName);
        console.log("Sign up result:", success);
      }
      
      // If auth failed but no error was thrown, set a generic error
      if (!success && !error && !authError) {
        setError('Authentication failed for unknown reason. Please try again.');
        setLoading(false);
      }
      
      // Note: We don't need to manually call onAuthSuccess here
      // The useEffect hook will handle that when the user state updates
      
    } catch (err) {
      console.error("Authentication error in handleAuth:", err);
      setError(`Authentication error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.messageText}>
                  {isLogin 
                    ? 'Sign in to continue with posting' 
                    : 'Create an account to start posting'}
                </Text>
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                {!isLogin && (
                  <TextInput
                    style={styles.input}
                    placeholder="Display Name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                )}
                
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
                
                <TouchableOpacity
                  style={[styles.authButton, loading && styles.disabledButton]}
                  onPress={handleAuth}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.switchModeButton}
                  onPress={() => setIsLogin(!isLogin)}
                  disabled={loading}
                >
                  <Text style={styles.switchText}>
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                  </Text>
                </TouchableOpacity>
              
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Add your existing styles here
const styles = StyleSheet.create({
  // Copy your existing styles from AuthModal.js
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  messageText: {
    marginBottom: 15,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  authButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#AACFFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchModeButton: {
    padding: 10,
  },
  switchText: {
    color: '#007AFF',
    textAlign: 'center',
  },
});

export default AuthModal;