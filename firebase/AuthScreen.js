// screens/AuthScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const AuthScreen = ({ navigation, route }) => {
  // Check if we have an initialMode parameter from navigation
  const initialMode = route.params?.initialMode || 'login';
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
 
  const auth = getAuth();
  const db = getFirestore();

  // Set initial login/register mode based on route params
  useEffect(() => {
    if (route.params?.initialMode) {
      setIsLogin(route.params.initialMode === 'login');
    }
  }, [route.params?.initialMode]);

  // Navigate away if already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.replace('Home');
      }
    });

    return () => unsubscribe();
  }, [navigation]);

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
      let userCredential;
      
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName: displayName,
          email: email,
          photoURL: '',
          createdAt: new Date(),
          bio: '',
        });
      }
      
      // Navigate to Home screen on success
      navigation.replace('Home');
    } catch (error) {
      setLoading(false);
      
      // Handle authentication errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak (minimum 6 characters)');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError('Authentication failed: ' + error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Ionicons name="camera" size={50} color="#0095f6" />
          <Text style={styles.appName}>My Social App</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>{isLogin ? 'Login' : 'Create Account'}</Text>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
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
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity 
              style={styles.visibilityIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons 
                name={passwordVisible ? "eye-off" : "eye"} 
                size={24} 
                color="#777" 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)} 
            disabled={loading}
            style={styles.switchModeButton}
          >
            <Text style={[styles.switchText, loading && styles.disabledText]}>
              {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </Text>
          </TouchableOpacity>
          
          {isLogin && (
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: '#d9534f',
    marginBottom: 15,
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#fde8e6',
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  visibilityIcon: {
    padding: 12,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#0095f6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#b2dffc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#0095f6',
    fontSize: 16,
  },
  disabledText: {
    opacity: 0.5,
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#777',
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
});

export default AuthScreen;