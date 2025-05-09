import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const time = timestamp instanceof Date ? timestamp : timestamp?.toDate?.(); // Firestore timestamp compatibility
  if (!time) return 'Just now';

  const diffMs = now - time;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds}s`;
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

const CardHeader = ({
  profileImage,
  profileName,
  timestamp,
  label,
  onFollowPress,
  onMenuPress,
  userId // Add userId prop to check if user is already followed
}) => {
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if the current user is already following this user
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!auth.currentUser || !userId) return;
      
      try {
        const currentUserRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(currentUserRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.following && userData.following.includes(userId)) {
            setIsFollowing(true);
          }
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    
    checkFollowStatus();
  }, [userId]);

  const handleFollowPress = () => {
    setIsFollowing(true); // Optimistic UI update
    onFollowPress();
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton
            ]}
            onPress={handleFollowPress}
          >
            <Ionicons 
              name={isFollowing ? "checkmark" : "add"} 
              size={16} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
       
        <View style={styles.profileInfo}>
          <View style={styles.profTimeCaption}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.timestamp}>
              {formatRelativeTime(timestamp)}
            </Text>
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="ellipsis-horizontal" size={20} color="rgb(133, 133, 133)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
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
    borderColor: 'rgb(184, 184, 184)',
  },
  followButton: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: '#ff3040',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgb(184, 184, 184)',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  profTimeCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileName: {
    color: 'rgb(0, 0, 0)',
    fontWeight: 'bold',
    fontSize: 14,
  },
  label: {
    color: 'rgb(133, 133, 133)',
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    color: 'rgb(133, 133, 133)',
    fontSize: 12,
    marginLeft: 5,
  },
});

export default CardHeader;