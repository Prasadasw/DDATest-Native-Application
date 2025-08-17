import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, Dimensions, Easing, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const IntroScreen = () => {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(height * 0.1);
  const cardScale = new Animated.Value(0.9);
  const cardOpacity = new Animated.Value(0);

  const options = [
    { 
      title: 'NDA', 
      icon: require('../assets/icons/nda.png'), 
      gradient: ['#FF7E5F', '#FEB47B'],
    },
    { 
      title: 'Scholarship', 
      icon: require('../assets/icons/mortarboard.png'), 
      gradient: ['#4B6CB7', '#182848'],
    },
    { 
      title: 'SSP Test', 
      icon: require('../assets/icons/nda.png'), 
      gradient: ['#11998E', '#38EF7D'],
    },
    { 
      title: 'Other', 
      icon: require('../assets/icons/more.png'), 
      gradient: ['#8E2DE2', '#4A00E0'],
    },
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.parallel(
        options.map((_, index) => 
          Animated.sequence([
            Animated.delay(index * 100),
            Animated.parallel([
              Animated.timing(cardScale, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              })
            ])
          ])
        )
      )
    ]).start();
  }, []);

  const handleCardPress = (index: number) => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(100),
    ]).start(() => router.replace('/'));
  };

  const handleSkipPress = () => {
    router.replace('/');
  };

  return (
    <LinearGradient 
      colors={['#013fc4', '#000046']} 
      style={styles.container}
    >
      <ScrollView>
        {/* Decorative background circles */}
        <Animated.View style={[styles.circle, { 
          top: -height * 0.2, 
          right: -width * 0.3,
          opacity: fadeAnim,
          transform: [{ scale: fadeAnim }]
        }]} />
        <Animated.View style={[styles.circle, { 
          bottom: -height * 0.15, 
          left: -width * 0.2,
          opacity: fadeAnim,
          transform: [{ scale: fadeAnim }]
        }]} />

        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkipPress}
          activeOpacity={0.7}
        >
          <Animated.Text style={[styles.skipText, { opacity: fadeAnim }]}>
            Skip
          </Animated.Text>
        </TouchableOpacity>

        {/* Content */}
        <Animated.View style={[styles.content, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <Text style={styles.heading}>Select Your Stream</Text>
          <Text style={styles.subheading}>Choose your path to success</Text>

          <View style={styles.cardsContainer}>
            {options.map((item, index) => (
              <Animated.View
                key={index}
                style={[{
                  opacity: cardOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                  transform: [
                    { scale: cardScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    })},
                    {
                      translateY: cardOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }
                  ]
                }]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCardPress(index)}
                  onPressIn={() => {
                    Animated.spring(cardScale, {
                      toValue: 0.95,
                      useNativeDriver: true,
                    }).start();
                  }}
                  onPressOut={() => {
                    Animated.spring(cardScale, {
                      toValue: 1,
                      useNativeDriver: true,
                    }).start();
                  }}
                >
                  <LinearGradient
                    colors={item.gradient as [string, string]}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.textContainer}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Text style={styles.cardSubtext}>Explore options</Text>
                      </View>
                      <Image 
                        source={item.icon} 
                        style={styles.icon} 
                        resizeMode="contain" 
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const { width: W } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingTop: 20,
  },
  circle: {
    position: 'absolute',
    width: W * 0.8,
    height: W * 0.8,
    borderRadius: W * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 1,
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardsContainer: {
    marginBottom: 30,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  cardText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  cardSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '400',
  },
  icon: {
    width: 40,
    height: 40,
    tintColor: '#fff',
  },
});

export default IntroScreen;
