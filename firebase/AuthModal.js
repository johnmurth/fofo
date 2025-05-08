// firebase/AuthModal.js
import React, { useState } from 'react';
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

  // Use the auth hook instead of directly accessing Firebase auth
  const { signIn, signUp, error: authError } = useAuth();
  
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
  
  const navigateToAuthScreen = () => {
    handleClose();
    // Small delay to make the transition feel smoother
    setTimeout(() => {
      navigation.navigate('Auth', { initialMode: isLogin ? 'login' : 'register' });
    }, 300);
  };

  const handleAuth = async () => {
    // Form validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (!isLogin && !displayName) {
      setError('Display name is required');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      let success;
      let userData;
      
      if (isLogin) {
        // Use the signIn function from useAuth
        success = await signIn(email, password);
        if (success) {
          userData = { email }; // Basic user data
        }
      } else {
        // Use the signUp function from useAuth
        success = await signUp(email, password, displayName);
        if (success) {
          userData = { email, displayName }; // Basic user data
        }
      }
      
      // Check for errors from the useAuth hook
      if (authError) {
        setError(authError);
        setLoading(false);
        return;
      }
      
      // Successfully authenticated
      if (success) {
        setLoading(false);
        
        // Call onAuthSuccess callback if provided
        if (onAuthSuccess) {
          onAuthSuccess(userData);
        }
        
        handleClose();
      } else {
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
      
    } catch (error) {
      setLoading(false);
      setError('Authentication failed: ' + error.message);
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
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
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
                
                <TouchableOpacity 
                  style={styles.fullScreenButton} 
                  onPress={navigateToAuthScreen}
                >
                  <Text style={styles.fullScreenText}>
                    Go to full authentication screen
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: '#b2dffc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#0095f6',
    fontSize: 15,
  },
  fullScreenButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fullScreenText: {
    color: '#666',
    fontSize: 14,
  }
});

export default AuthModal;