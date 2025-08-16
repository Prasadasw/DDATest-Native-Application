// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { CustomBottomTabs } from './components/CustomBottomTabs';

export default function App() {
  return (
    <NavigationContainer>
      <CustomBottomTabs />
    </NavigationContainer>
  );
}