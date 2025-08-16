import React, { useRef } from 'react';
import { View, Image, StyleSheet, Animated, PanResponder, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderMove: Animated.event(
        [null, { dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -80) {
          router.replace('/(auth)/login');
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/images/cta.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Manage your expenses seamlessly & intuitively with TestApp. Track, plan, and stay ahead effortlessly.
        </Text>
      </View>

      <Animated.View
        style={[styles.swipeContainer, { transform: [{ translateY: pan.y }] }]}
        {...panResponder.panHandlers}
      >
        <Image
          source={require('../assets/gif/swipe.gif')} // Your existing swipe gif
          style={styles.swipeGif}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#013fc4',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  image: {
    width: 260,
    height: 260,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  swipeContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  swipeGif: {
    width: 80,
    height: 80,
  },
});
