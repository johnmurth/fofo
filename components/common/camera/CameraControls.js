// CameraControls.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CameraControls = ({ 
  cameraMode, 
  isRecording, 
  takePicture, 
  startRecording, 
  stopRecording, 
  pickFromGallery, 
  toggleCameraType 
}) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity style={styles.controlButton} onPress={pickFromGallery}>
        <Ionicons name="images" size={28} color="white" />
      </TouchableOpacity>
      
      {cameraMode === 'photo' ? (
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.captureButton, isRecording && styles.recordingButton]} 
          onPress={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <View style={styles.stopRecordingButton} />
          ) : (
            <View style={styles.startRecordingButton} />
          )}
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
        <Ionicons name="camera-reverse" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  startRecordingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
  },
  stopRecordingButton: {
    width: 30,
    height: 30,
    backgroundColor: 'red',
    borderRadius: 4,
  },
});

export default CameraControls;