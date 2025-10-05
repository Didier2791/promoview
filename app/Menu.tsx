import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { router } from 'expo-router';

// Importation des icônes PNG
import PublicationsIcon from '../assets/icons/publications.png';
import PlanIcon from '../assets/icons/plan.png';
import ContactIcon from '../assets/icons/contact.png';
import FavorisIcon from '../assets/icons/favoris.png';

const Menu = () => {
  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={() => router.push('/AccueilClient')} style={styles.menuItem}>
        <Image source={PublicationsIcon} style={styles.icon} />
        <Text style={styles.menuText}>Accueil</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/MonPlanScreen')} style={styles.menuItem}>
        <Image source={PlanIcon} style={styles.icon} />
        <Text style={styles.menuText}>Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/NousContacterScreen')} style={styles.menuItem}>
        <Image source={ContactIcon} style={styles.icon} />
        <Text style={styles.menuText}>Contact</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/Favoris')} style={styles.menuItem}>
        <Image source={FavorisIcon} style={styles.icon} />
        <Text style={styles.menuText}>Favoris</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
    backgroundColor: '#9daccb',
    borderColor: '#ccc',
  },
  menuItem: {
    alignItems: 'center',
    marginTop: 5,

  },
  menuText: {
    color: 'black',
    fontSize: 14,
    marginTop: 4,
       fontWeight:'bold',
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});

export default Menu;

