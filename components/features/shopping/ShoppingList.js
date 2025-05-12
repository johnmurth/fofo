import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ShoppingItem from './ShoppingItem';
import { shoppingData } from '../../../utils/mockData';

const ShoppingList = ({ onAddToCart, onSendMessage }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.itemsContainer}>
        {shoppingData.map(item => (
          <View style={styles.itemWrapper} key={item.id}>
            <ShoppingItem
              id={item.id}
              itemImage={item.itemImage}
              description={item.description}
              price={item.price}
              sellerProfile={item.sellerProfile}
              sellerLocation={item.location}
              onAddToCart={() => onAddToCart(item.id)}
              onSendMessage={(msg) => onSendMessage(item.id, msg)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingTop: 15,
    borderRadius: 10
  },
  contentContainer: {
    paddingBottom: 20,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  itemWrapper: {
    width: '48%', // Slightly less than half to allow for spacing
    marginBottom: 16,
  },
});

export default ShoppingList;