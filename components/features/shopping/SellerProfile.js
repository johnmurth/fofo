// SellerProfile.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SellerProfile = ({ profileImage, profileName, location }) => {
    const [showLocation, setShowLocation] = useState(false);
    const nameOpacity = useState(new Animated.Value(1))[0];
    const locationOpacity = useState(new Animated.Value(0))[0];
  
    useEffect(() => {
      const interval = setInterval(() => {
        setShowLocation(prev => !prev);
      }, 3000); // Switch every 3 seconds
  
      return () => clearInterval(interval);
    }, []);
  
    useEffect(() => {
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: showLocation ? 0 : 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(locationOpacity, {
          toValue: showLocation ? 1 : 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }, [showLocation]);
  
    return (
      <View style={styles.container}>
        <Image 
          source={{ uri: profileImage }} 
          style={styles.profileImage} 
        />
        
        <View style={styles.textContainer}>
          <Animated.Text 
            style={[styles.profileName, { opacity: nameOpacity }]} 
            numberOfLines={1}
          >
            {profileName}
          </Animated.Text>
          
          <Animated.View style={[styles.locationContainer, { opacity: locationOpacity }]}>
            <Ionicons name="location" size={12} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24, // Fixed height for smooth transition
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 6,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  profileName: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    maxWidth: '90%',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    maxWidth: '80%',
  },
});

export default SellerProfile;