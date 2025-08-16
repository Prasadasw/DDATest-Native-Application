import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface BottomNavigationProps {
  activeTab: 'home' | 'education' | 'profile';
  onTabPress: (tab: 'home' | 'education' | 'profile') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabPress }) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'education', label: 'Education', icon: '📚' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)']}
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
            <View style={[
              styles.iconContainer,
              activeTab === tab.key && styles.activeIconContainer
            ]}>
              <Text style={[
                styles.icon,
                activeTab === tab.key && styles.activeIcon
              ]}>
                {tab.icon}
              </Text>
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 30, // Extra padding for safe area
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
    paddingVertical: 8,
  },
  activeTab: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(1, 63, 196, 0.1)',
  },
  activeIconContainer: {
    backgroundColor: '#013fc4',
    shadowColor: '#013fc4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 18,
    opacity: 0.7,
  },
  activeIcon: {
    opacity: 1,
    color: '#fff',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#013fc4',
    fontWeight: '600',
  },
});

export default BottomNavigation;