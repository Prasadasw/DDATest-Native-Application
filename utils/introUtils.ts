import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for managing intro screen state
 */

export const resetIntroForTesting = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('hasSeenIntro');
    console.log('✅ Intro reset successfully - user will see intro on next app launch');
  } catch (error) {
    console.error('❌ Error resetting intro:', error);
  }
};

export const hasUserSeenIntro = async (): Promise<boolean> => {
  try {
    const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
    return hasSeenIntro === 'true';
  } catch (error) {
    console.error('❌ Error checking intro status:', error);
    return false;
  }
};

export const markIntroAsSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('hasSeenIntro', 'true');
    console.log('✅ Intro marked as seen');
  } catch (error) {
    console.error('❌ Error marking intro as seen:', error);
  }
};
