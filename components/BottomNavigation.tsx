import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

const { width } = Dimensions.get('window');

interface BottomNavigationProps {
  activeTab: 'home' | 'education' | 'profile';
  onTabPress: (tab: 'home' | 'education' | 'profile') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabPress }) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: require('../assets/icons/home.png') },
    { key: 'education', label: 'Education', icon: require('../assets/icons/reading.png') },
    { key: 'profile', label: 'Profile', icon: require('../assets/icons/user.png') },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#013fc4', '#000046']}
        style={styles.gradient}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => onTabPress(tab.key as 'home' | 'education' | 'profile')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, activeTab === tab.key && styles.activeIconContainer]}>
              <Image
                source={tab.icon}
                style={[styles.icon, activeTab === tab.key && styles.activeIcon]}
              />
            </View>
            <Text style={[
              styles.label,
              activeTab === tab.key && styles.activeLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  gradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6, // Reduced from 8 to 6
    paddingHorizontal: 20,
    paddingBottom: 16, // Reduced from 20 to 16
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4, // Reduced from 6 to 4
  },
  activeTab: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 32, // Reduced from 36 to 32
    height: 32, // Reduced from 36 to 32
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2, // Reduced from 3 to 2
  },
  activeIconContainer: {
    shadowColor: '#ffffff',
    // shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    width: 24, // Adjusted size for PNG icons
    height: 24, // Adjusted size for PNG icons
    tintColor: 'rgba(255, 255, 255, 0.7)',
  },
  activeIcon: {
    tintColor: '#ffffff', // Full white for active state
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff', // Changed to white for visibility on dark background
    marginTop: 2,
  },
  activeLabel: {
    color: '#ffffff', // Changed to white for visibility on dark background
    fontWeight: '600',
  },
});

export default BottomNavigation;