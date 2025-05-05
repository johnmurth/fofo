import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CardHeader = ({ 
  profileImage, 
  profileName, 
  timestamp, 
  label, 
  onFollowPress,
  onMenuPress 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageWrapper}>
          <Image 
            source={{ uri: profileImage }} 
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={styles.followButton}
            onPress={onFollowPress}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profileName}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  followButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#ff3040',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  profileName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    color: '#fff',
    fontSize: 12,
    marginRight: 15,
  },
});

export default CardHeader;