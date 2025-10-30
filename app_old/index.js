import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function Home() {
  return (
    <LinearGradient
      colors={['rgba(17,95,140,1)', 'rgba(5,39,80,1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text
        style={styles.welcome}
      >Seja Bem-Vindo!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/register')}
      >
        <Text style={styles.buttonText}>CADASTRAR</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom:30,
  },
  button: {
    width: 280,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 51,
    backgroundColor: '#d9e6ee',
    marginBottom: 26,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#d9e6ee',
  },
  buttonText: {
    color: '#093f5d',
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'LeagueSpartan-Bold',
  },

  welcome: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 150,
    textAlign: 'center',
    fontFamily: 'LeagueSpartan-Bold',
    letterSpacing: 1.5,
    lineHeight: 30,
  },
});
