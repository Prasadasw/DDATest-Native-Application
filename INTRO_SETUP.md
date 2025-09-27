# Introduction Screens Setup

## Overview
This app now includes a beautiful introduction flow that shows only once for first-time users. The intro consists of 3 screens:

1. **Welcome Screen** - Shows the DDA logo with motivational text about defense excellence
2. **Certification Screen** - Explains the certification benefits with a Lottie animation
3. **Trophy/Ranking Screen** - Shows the competitive aspect with Champion Lottie animation

## Features
- ✅ Shows only once for first-time users
- ✅ Skip button on all screens
- ✅ Next/Get Started buttons with smooth navigation
- ✅ Beautiful gradients and animations
- ✅ Lottie animations for visual appeal
- ✅ Page indicators showing current screen
- ✅ Proper AsyncStorage management

## How It Works

### First Time Users
1. App loads → Splash Screen (2 seconds)
2. Checks if user has seen intro (`hasSeenIntro` in AsyncStorage)
3. If not seen → Shows intro screens
4. After completing intro → Saves flag and goes to login

### Returning Users
1. App loads → Splash Screen (2 seconds)
2. Checks intro flag → Directly goes to login screen

## Testing the Intro

### Method 1: Development Reset Button
1. Login to the app
2. Go to Profile screen
3. Scroll to "Account Settings"
4. Tap "Reset Intro (Dev Only)" button (only visible in development)
5. Restart the app to see intro again

### Method 2: Manual AsyncStorage Clear
```javascript
// In React Native Debugger or development console
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.removeItem('hasSeenIntro');
```

### Method 3: Use Utility Function
```javascript
import { resetIntroForTesting } from './utils/introUtils';
resetIntroForTesting();
```

## Customization

### Colors
The intro screens use the app's color scheme:
- Screen 1: `#0a7ea4` to `#013fc4` (App primary colors)
- Screen 2: `#11998E` to `#38EF7D` (Success/Growth colors)
- Screen 3: `#FF7E5F` to `#FEB47B` (Achievement/Trophy colors)

### Text Content
Edit the text in `app/intro/index.tsx`:
- `title`: Main heading for each screen
- `subtitle`: Motivational quote
- `description`: Detailed explanation

### Animations
- Certification screen uses: `assets/lottie/certification.json`
- Trophy screen uses: `assets/lottie/Champion.json`

## File Structure
```
app/
├── intro/
│   └── index.tsx          # Main intro screen component
├── splash.tsx             # Updated to check intro status
└── _layout.tsx            # Added intro route

utils/
└── introUtils.ts          # Utility functions for intro management

components/
└── ProfileScreen.tsx      # Added dev reset button
```

## Dependencies Added
- `lottie-react-native` - For animations
- `react-native-svg` - Required by lottie
- `@react-native-async-storage/async-storage` - Already in project

## Production Deployment
The reset button only appears in development (`__DEV__` flag). In production builds, users will only see the intro once and there's no way to reset it (which is the intended behavior).
