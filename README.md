# DareDrop 🎨

A daily creative challenge mobile app that sparks your imagination with fresh dares every day! Built with Expo and featuring a beautiful, playful design with animated interactions.

## About

DareDrop delivers everyday creative challenges to help you break out of your routine and explore your creative side. Whether it's drawing, writing, photography, or crafting, each dare is designed to be fun, accessible, and inspiring.

## ✨ Features

### Current

- ✅ Beautiful, responsive mobile UI matching Figma design
- ✅ Animated envelope that opens to reveal daily dare
- ✅ Streak tracking with fire badge
- ✅ "Your Dares" history section with circular thumbnails
- ✅ Custom fonts: "Poor Story" (primary) and "Outfit" (secondary)
- ✅ Themed color palette from Figma designs
- ✅ Cross-platform (iOS, Android, Web)
- ✅ Smooth animations using React Native Animated API

### Planned

- 🔜 Daily dare rotation (one new dare per day)
- 🔜 User authentication
- 🔜 Dare history with actual completed dare photos
- 🔜 Share completed dares with the community
- 🔜 Custom dare categories (art, writing, photography, etc.)
- 🔜 Difficulty levels
- 🔜 Push notifications for daily dares
- 🔜 User-submitted dares
- 🔜 Achievement system
- 🔜 Photo/video upload for completed dares
- 🔜 Real-time streak persistence
- 🔜 Social features and community feed

## 🎨 Design

The app follows a warm, inviting design aesthetic with:

- **Color Palette**: Cream background (#E8DDD3), purple-blue primary (#6B7BB8), pink secondary (#D67B9B)
- **Accent Colors**: Yellow dare cards (#F4D35E), orange fire badge (#F48C42), green history section (#86C580)
- **Typography**:
  - Primary: "Poor Story" - Playful, handwritten style
  - Secondary: "Outfit" - Clean, modern sans-serif
- **Animations**: Envelope opening effect, card slide-in, smooth transitions

## 🛠 Tech Stack

- **Framework:** Expo SDK 51
- **Router:** Expo Router (File-based routing)
- **Language:** TypeScript
- **Navigation:** React Navigation (via Expo Router)
- **Styling:** React Native StyleSheet with custom theme system
- **Fonts:** Google Fonts (Poor Story, Outfit)
- **Animations:** React Native Animated API

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm
- For iOS: macOS with Xcode
- For Android: Android Studio
- Expo Go app (for testing on physical devices)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd daredrop-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npx expo start
```

4. Run on your device or emulator:
   - **iOS Simulator:** Press `i` in the terminal
   - **Android Emulator:** Press `a` in the terminal
   - **Physical Device:** Scan the QR code with Expo Go app
   - **Web:** Press `w` in the terminal

## 📁 Project Structure

```
daredrop-app/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with font loading
│   └── index.tsx                # Home screen
├── components/                   # React Native components
│   ├── EnvelopeAnimation.tsx   # Animated envelope component
│   ├── FireBadge.tsx           # Streak counter badge
│   └── DareHistory.tsx         # Dare history grid
├── constants/                    # App constants
│   └── theme.ts                # Color palette, fonts, spacing
├── assets/                       # Images, fonts, etc.
├── app.json                      # Expo configuration
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler config
└── README.md                     # This file
```

## 🎯 Key Components

### EnvelopeAnimation

The main interaction component that displays the daily dare. Features:

- Tap to open animation
- Envelope flap rotation using 3D transforms
- Card slide-out effect with spring physics
- Mark as complete functionality

### FireBadge

Displays the user's streak with an animated fire icon:

- Dual-color flame design
- Dynamic day counter
- Matches Figma design aesthetic

### DareHistory

Grid of completed dares:

- Circular thumbnails with photos
- Placeholder emoji for dares without photos
- Scrollable grid layout
- Color-coded backgrounds

## 🎨 Theming

The app uses a centralized theme system in `constants/theme.ts`:

- **Colors**: Primary, secondary, accent, text colors
- **Typography**: Font families and sizes
- **Spacing**: Consistent spacing scale
- **Shadows**: Pre-defined shadow styles
- **Border Radius**: Consistent rounded corners

## 📱 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Open on Android
- `npm run ios` - Open on iOS
- `npm run web` - Open in web browser

## 🔮 Roadmap

### Phase 1: Core Features ✅ (Current)

- Basic UI matching Figma design
- Envelope animation
- Dare display and interaction
- Streak tracking display
- History section layout

### Phase 2: Data & Daily System

- Implement daily dare rotation
- Add date-based dare selection
- Create dare database/API
- Local storage for offline access
- Persistent streak tracking

### Phase 3: User Features

- User authentication (Firebase/Supabase)
- Profile pages
- Actual dare history with photos
- Enhanced streak system with notifications
- User preferences

### Phase 4: Content Creation

- Camera integration
- Photo/video upload for completed dares
- In-app image editing
- Media library access
- Dare completion flow

### Phase 5: Community

- Share completed dares
- Like and comment system
- Follow other creators
- User-submitted dares
- Dare voting system
- Community feed

### Phase 6: Enhanced Features

- Multiple dare categories
- Difficulty levels
- Custom preferences
- Push notifications
- Achievements and badges
- Multiple language support
- Accessibility improvements

## 🧪 Testing

The app can be tested on:

- iOS devices and simulators (iOS 13.4+)
- Android devices and emulators (Android 5.0+)
- Web browsers (modern browsers recommended)
- Expo Go app for quick testing on physical devices

## 🚢 Deployment

This app can be deployed to:

- **iOS:** App Store via EAS Build and TestFlight
- **Android:** Google Play Store via EAS Build
- **Web:** Vercel, Netlify, or any static hosting platform

### Building with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🤝 Contributing

This is currently a personal project, but suggestions and ideas are welcome! Feel free to open an issue to discuss potential changes or improvements.

## 📄 License

MIT License - feel free to use this project as inspiration for your own creative apps!

## 🙏 Acknowledgments

- Design inspiration from Figma prototype
- Google Fonts for Poor Story and Outfit typefaces
- Expo team for the amazing development platform

---

Built with ❤️ and creative energy using Expo & React Native
