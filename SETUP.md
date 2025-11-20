# DareDrop Setup Guide

Welcome to DareDrop! Follow these steps to get your app running with the beautiful animated envelope design.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all the necessary packages including:

- Expo SDK 51
- React Native
- Expo Router
- Custom fonts (Poor Story, Outfit)
- TypeScript support
- React Native SVG

### 2. Start the Development Server

```bash
npx expo start
```

Or simply:

```bash
npm start
```

### 3. Run on Your Device

Once the Metro bundler starts, you'll see a QR code in your terminal. You have several options:

#### Option A: Physical Device (Recommended for best performance)

1. Install **Expo Go** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code with:
   - **iOS:** Camera app
   - **Android:** Expo Go app
3. Wait for fonts to load (first launch may take a moment)

#### Option B: iOS Simulator (macOS only)

- Press `i` in the terminal
- Requires Xcode to be installed
- Best for testing iOS-specific features

#### Option C: Android Emulator

- Press `a` in the terminal
- Requires Android Studio with an emulator set up
- Best for testing Android-specific features

#### Option D: Web Browser

- Press `w` in the terminal
- Opens in your default browser
- Some animations may perform differently on web

## 🎨 What You'll See

### Home Screen Features

1. **Welcome Header** - Personalized greeting with user name
2. **Fire Badge** - Streak counter showing consecutive days
3. **Envelope Animation** - Tap to open and reveal today's dare
4. **Dare Card** - Yellow card with the daily creative challenge
5. **Your Dares** - Grid of completed dares with circular thumbnails

### Interactions

- **Tap the envelope** to see it animate open
- **Watch the card slide out** with smooth spring physics
- **Mark dares complete** to track your progress

## 📁 Project Structure Overview

```
daredrop-app/
├── app/                        # 📱 Your app screens (Expo Router)
│   ├── _layout.tsx            # Root layout with font loading
│   └── index.tsx              # Home screen with envelope
│
├── components/                 # 🧩 Reusable React Native components
│   ├── EnvelopeAnimation.tsx  # Animated envelope interaction
│   ├── FireBadge.tsx          # Streak counter badge
│   └── DareHistory.tsx        # Grid of completed dares
│
├── constants/                  # ⚙️ App configuration
│   └── theme.ts               # Colors, fonts, spacing
│
├── assets/                     # 🎨 Images, icons, splash screens
│
├── app.json                    # ⚙️ Expo configuration
├── package.json                # 📦 Dependencies
├── tsconfig.json               # 🔧 TypeScript config
└── babel.config.js             # 🔧 Babel config with Expo Router
```

## 🎨 Design System

### Colors

The app uses a carefully chosen color palette:

- **Background**: Warm cream (#E8DDD3)
- **Primary**: Purple-blue (#6B7BB8) - for main text
- **Secondary**: Rose pink (#D67B9B) - for accents
- **Accent Yellow**: (#F4D35E) - for dare cards
- **Accent Orange**: (#F48C42) - for fire badge
- **Accent Green**: (#86C580) - for history section

### Typography

- **Primary Font**: "Poor Story" - Playful, handwritten style
  - Used for headings, dare text, main interactions
- **Secondary Font**: "Outfit" - Clean, modern sans-serif
  - Used for body text, buttons, UI elements
  - Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)

### Spacing & Layout

Consistent spacing scale: 4, 8, 16, 24, 32, 48px

## 🔧 Troubleshooting

### "expo: command not found"

Install Expo CLI globally:

```bash
npm install -g expo-cli
```

### Fonts not loading

If you see warnings about fonts:

1. Wait a few seconds - fonts load on first launch
2. Reload the app (shake device → "Reload")
3. Clear cache: `npx expo start -c`

### Metro bundler won't start

Clear the cache and restart:

```bash
npx expo start -c
```

### TypeScript errors before install

The tsconfig.json error about 'expo/tsconfig.base' is normal before running `npm install`. It will resolve after installation.

### Animations choppy

- Use a physical device for best performance
- Ensure you're not in slow animation mode
- Check that "Debug Remote JS" is disabled

### Can't connect to Metro

Make sure your phone and computer are on the same WiFi network.

## 🚀 Next Steps

Now that your app is running, you can:

1. **Tap the envelope** to see the animation in action
2. **Customize the design**: Edit colors in `constants/theme.ts`
3. **Add more dares**: Update the `sampleDares` array in `app/index.tsx`
4. **Modify animations**: Adjust timing in `components/EnvelopeAnimation.tsx`
5. **Add your photos**: Update `DareHistory.tsx` with real images
6. **Change the user name**: Edit the `userName` variable in `app/index.tsx`
7. **Adjust streak**: Modify the `streakDays` state in the home screen

## 🎯 Key Files to Edit

### To change colors or fonts:

`constants/theme.ts`

### To modify the envelope animation:

`components/EnvelopeAnimation.tsx`

### To customize the home screen layout:

`app/index.tsx`

### To adjust the fire badge design:

`components/FireBadge.tsx`

### To update the dare history:

`components/DareHistory.tsx`

## 📚 Learn More

### Official Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Docs](https://expo.github.io/router/docs/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Native Animations](https://reactnative.dev/docs/animations)

### Design Resources

- [Expo Google Fonts](https://github.com/expo/google-fonts)
- [React Native Styling](https://reactnative.dev/docs/style)

### Community

- [Expo Forums](https://forums.expo.dev/)
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)

## 🐛 Need Help?

If you encounter issues:

1. Check the terminal for error messages
2. Look at the error overlay on the device
3. Try clearing cache: `npx expo start -c`
4. Review the main [README.md](./README.md) for more details
5. Check Expo forums for similar issues

## 🎉 You're Ready!

Your DareDrop app is now set up and ready for development. Enjoy creating your daily creative challenge app!

Happy coding! 🚀✨
