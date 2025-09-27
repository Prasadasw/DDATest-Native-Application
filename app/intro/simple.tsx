import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { markIntroAsSeen } from '../../utils/introUtils';

const { width, height } = Dimensions.get('window');

const SimpleIntroScreen = () => {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Create separate animation values for each screen to avoid conflicts
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [fadeAnim] = useState(new Animated.Value(0.7));
  const [rotateAnim] = useState(new Animated.Value(0));

  const startAnimations = () => {
    console.log('Starting animations for page:', currentPage);
    
    // Reset animations - start from visible state to avoid invisible content
    scaleAnim.setValue(0.9);
    fadeAnim.setValue(0.7); // Start from 0.7 instead of 0 to ensure visibility
    rotateAnim.setValue(0);

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('Animations completed for page:', currentPage);
    });
  };

  useEffect(() => {
    // Start animations when page changes
    const timer = setTimeout(startAnimations, 150);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < 2) {
      const nextPage = currentPage + 1;
      console.log('Moving to page:', nextPage);
      setCurrentPage(nextPage);
    } else {
      completeIntro();
    }
  };

  const handleSkip = () => {
    completeIntro();
  };

  const completeIntro = async () => {
    try {
      await markIntroAsSeen();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error saving intro completion:', error);
      router.replace('/(auth)/login');
    }
  };

  const renderScreen1 = () => (
    <LinearGradient colors={['#0a7ea4', '#013fc4']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a7ea4" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo with Animation */}
        <Animated.View style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <Image
            source={require('../../assets/logo/LOGO.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text Content */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Welcome to DDA Test</Text>
          <Text style={styles.subtitle}>
            "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution."
          </Text>
          <Text style={styles.description}>
            Your journey to defense excellence starts here. Prepare for NDA, SSP, and scholarship tests with confidence.
          </Text>
        </Animated.View>
      </View>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        <View style={[styles.indicator, styles.activeIndicator]} />
        <View style={styles.indicator} />
        <View style={styles.indicator} />
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderScreen2 = () => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <LinearGradient colors={['#11998E', '#38EF7D']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#11998E" />
        
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Animated Certification Icon */}
          <Animated.View style={[
            styles.animationContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: spin }
              ]
            }
          ]}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🎓</Text>
            </View>
            <View style={[styles.iconCircle, styles.iconCircleSecondary]}>
              <Text style={styles.iconEmojiSecondary}>📜</Text>
            </View>
          </Animated.View>

         {/* Text Content */}
         <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
           <Text style={styles.title}>Get Certified</Text>
           <Text style={styles.subtitle}>
             "Success is where preparation and opportunity meet."
           </Text>
           <Text style={styles.description}>
             Earn valuable certifications that validate your knowledge and boost your career prospects in defense services.
           </Text>
         </Animated.View>
        </View>

        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          <View style={styles.indicator} />
          <View style={[styles.indicator, styles.activeIndicator]} />
          <View style={styles.indicator} />
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  const renderScreen3 = () => {
    const bounce = scaleAnim.interpolate({
      inputRange: [0.8, 1],
      outputRange: [0.8, 1.1],
    });

    return (
      <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#FF7E5F" />
        
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Animated Trophy Icon */}
          <Animated.View style={[
            styles.animationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: bounce }]
            }
          ]}>
            <View style={styles.trophyContainer}>
              <Text style={styles.trophyEmoji}>🏆</Text>
              <Text style={styles.rankingText}>#1</Text>
            </View>
            <View style={styles.starsContainer}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={styles.starEmoji}>⭐</Text>
            </View>
          </Animated.View>

           {/* Text Content */}
           <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
             <Text style={styles.title}>Earn Trophies</Text>
             <Text style={styles.subtitle}>
               "Champions are made when nobody's watching."
             </Text>
             <Text style={styles.description}>
               Compete with students nationwide and become #1 ranked. Earn trophies and recognition for your achievements.
             </Text>
           </Animated.View>
        </View>

        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          <View style={styles.indicator} />
          <View style={styles.indicator} />
          <View style={[styles.indicator, styles.activeIndicator]} />
        </View>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  const renderCurrentScreen = () => {
    switch (currentPage) {
      case 0:
        return renderScreen1();
      case 1:
        return renderScreen2();
      case 2:
        return renderScreen3();
      default:
        return renderScreen1();
    }
  };

  return (
    <View style={styles.pagerView}>
      {renderCurrentScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.6,
    height: height * 0.25,
    maxWidth: 300,
    maxHeight: 200,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 300,
    maxHeight: 300,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
  },
  iconCircleSecondary: {
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 100,
    right: 20,
  },
  iconEmoji: {
    fontSize: 50,
    textAlign: 'center',
  },
  iconEmojiSecondary: {
    fontSize: 30,
    textAlign: 'center',
  },
  trophyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 10,
  },
  rankingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  starEmoji: {
    fontSize: 30,
    marginHorizontal: 5,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: 'white',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nextButton: {
    marginHorizontal: 30,
    marginBottom: 40,
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SimpleIntroScreen;
