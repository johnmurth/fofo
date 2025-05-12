// CameraHeader.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CameraHeader = ({ navigation, flashMode, toggleFlash, cameraMode, toggleCameraMode }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.headerOptions}>
        <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
          <Ionicons 
            name={flashMode === 'on' ? "flash" : "flash-off"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={toggleCameraMode}>
          <Ionicons 
            name={cameraMode === 'photo' ? "videocam" : "camera"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    padding: 5,
  },
  headerOptions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
});

export default CameraHeader;