import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const Header = ({ onMenuPress, onAddPress }) => {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Left Logo */}
          <Image
            source={require('../../assets/k.png')} // Replace with your logo path
            style={styles.logo}
            resizeMode="contain"
          /> 

          {/* Center Add Icon */}
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Entypo name="plus" size={28} color="#000" />
          </TouchableOpacity>

          {/* Right Menu Icon */}
          <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
            <MaterialCommunityIcons name="dots-vertical" size={25} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
    marginVertical: 10
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 60,
  },
  logo: {
    width: 30,
    height: 30,
  },
  addButton: {
    backgroundColor: 'rgb(238, 238, 238)',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',   
  },
  menuButton: {
    width: 30,
  },
});

export default Header;
