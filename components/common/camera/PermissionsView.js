// PermissionsView.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PermissionsView = ({ onRequestPermissions }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>We need your permission to use the camera and gallery</Text>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={onRequestPermissions}
      >
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PermissionsView;