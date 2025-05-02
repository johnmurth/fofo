import React from 'react';
import { View, StyleSheet } from 'react-native';
import CardSlider from './components/CardSlider';


export default function App() {

  return (
    <View style={styles.container}>
      <CardSlider />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});