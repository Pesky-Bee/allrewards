# All Rewards 📱💳

A simple, privacy-focused mobile app for managing your reward cards. Upload screenshots of your loyalty cards and the app will automatically show the right one when you're at a store.

## Features

- **📸 Easy Card Management** - Add reward cards by uploading screenshots
- **📍 Smart Detection** - GPS-based auto-detection shows the right card at each store
- **🔒 Privacy First** - All data stored locally, no login required
- **🚀 Simple UX** - Clean interface with only essential actions
- **💰 100% Free** - No ads, no subscriptions, no in-app purchases

## Screenshots

*Coming soon*

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS: macOS with Xcode
- For Android: Android Studio with an emulator or physical device

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd all-rewards
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device:**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator, `i` for iOS simulator

### Adding App Icons

Replace the placeholder files in `assets/`:
- `icon.png` - 1024x1024px app icon
- `splash.png` - 1284x2778px splash screen
- `adaptive-icon.png` - 1024x1024px Android adaptive icon

Recommended design: Coral (#FF6B6B) accent on dark navy (#1A1A2E) background.

## Publishing to App Stores

### Setup EAS Build

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure your project:**
   ```bash
   eas build:configure
   ```

4. **Update `app.json`:**
   - Change `expo.extra.eas.projectId` to your project ID
   - Update bundle identifiers if needed

### Build for Android

1. **Create a production build:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Google Play:**
   - Create a Google Play Developer account ($25 one-time fee)
   - Create your app listing in Google Play Console
   - Add your `google-service-account.json` for automated uploads
   ```bash
   eas submit --platform android
   ```

### Build for iOS

1. **Create a production build:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store:**
   - Enroll in Apple Developer Program ($99/year)
   - Create your app in App Store Connect
   - Update `eas.json` with your Apple credentials
   ```bash
   eas submit --platform ios
   ```

### App Store Requirements

**Privacy Policy:** Since the app uses location, you'll need a privacy policy. Key points to include:
- Location data is only used locally to detect nearby stores
- No data is transmitted to external servers
- All card images are stored on-device only
- No user accounts or personal data collection

**Store Listings:**
- App name: All Rewards
- Category: Utilities / Shopping
- Age rating: 4+

## Permissions Used

| Permission | Purpose | Platform |
|------------|---------|----------|
| Location (When In Use) | Detect nearby stores to show relevant cards | iOS & Android |
| Photo Library | Add card images from screenshots | iOS & Android |

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **AsyncStorage** for local data persistence
- **Expo Location** for GPS services
- **Expo Image Picker** for photo selection

## Project Structure

```
all-rewards/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with navigation
│   ├── index.tsx           # Home screen
│   ├── cards.tsx           # All cards list
│   ├── add.tsx             # Add new card
│   ├── edit/[id].tsx       # Edit card
│   └── view/[id].tsx       # View card fullscreen
├── src/
│   ├── constants/          # Theme and styling
│   ├── hooks/              # React hooks (useCards, useLocation)
│   ├── services/           # Storage and location services
│   └── types/              # TypeScript types
├── assets/                 # App icons and images
├── app.json                # Expo configuration
├── eas.json                # EAS Build configuration
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is free and open source. Use it however you like.

---

Made with ❤️ for everyone who's tired of juggling loyalty apps
