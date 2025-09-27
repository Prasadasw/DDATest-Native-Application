import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { hasUserSeenIntro } from '../utils/introUtils';

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Hide the native splash screen
      await SplashScreen.hideAsync();
      
      // Check if user has seen the intro
      const hasSeenIntro = await hasUserSeenIntro();
      
      // Show splash for 2 seconds then navigate
      setTimeout(() => {
        if (hasSeenIntro) {
          // User has seen intro, go directly to login
          router.replace('/(auth)/login');
        } else {
          // First time user, show intro screens
          router.replace('/intro');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error initializing app:', error);
      // Fallback to login screen
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo/LOGO.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6, // 60% of screen width
    height: height * 0.3, // 30% of screen height
    maxWidth: 300,
    maxHeight: 200,
  },
});
