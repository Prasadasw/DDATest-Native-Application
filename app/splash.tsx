import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync();
    
    // Show splash for 2 seconds then navigate to main app
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
