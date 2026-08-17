# Connect with Food - Frontend (Mobile)

React Native mobile app built with Expo for the Connect with Food platform.

## Features

- **Phone OTP Authentication** - Secure login with one-time passwords
- **Map View** - Real-time map showing nearby food donations
- **Create Listings** - Share excess food with location and timing
- **Geolocation** - Find donations within 5-10 km radius
- **Request Management** - Request and track food reservations
- **Profile Management** - Manage account and donation history

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **Maps**: React Native Maps
- **Location**: Expo Location
- **HTTP Client**: Axios
- **State**: AsyncStorage

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS (Xcode) or Android (Android Studio) emulator

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npm start
   ```

3. **Run on emulator**
   - **iOS**: Press `i`
   - **Android**: Press `a`
   - **Web**: Press `w`

### Mobile Development

#### For Android
```bash
npm run android
# or
expo run:android
```

#### For iOS
```bash
npm run ios
# or
expo run:ios
```

## Project Structure

```
screens/
├── LoginScreen.js        # OTP login & signup
├── MapScreen.js          # Map view with nearby listings
├── CreateListingScreen.js # Create food donation
└── ProfileScreen.js      # User profile & settings

App.js                     # Navigation setup
```

## Environment Setup

### Google Maps API
- Add your Google Maps API key to `app.json`
- Set `NEXT_PUBLIC_MAPS_API_KEY` in backend `.env`

### Location Permissions
- **iOS**: Automatically requested via `app.json` config
- **Android**: Permissions declared in `app.json`

## API Integration

- Backend must be running on `http://localhost:3000` (or configure `API_URL` in components)
- Endpoints used:
  - `/auth/send-otp`
  - `/auth/verify`
  - `/listings`
  - `/listings/nearby`
  - `/requests`

## Building for Production

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Local Build
```bash
# Eject from Expo
expo eject
```

## Deployment

- **iOS**: Submit to App Store via Xcode
- **Android**: Submit to Google Play via Android Studio or Play Console
- **Web**: Deploy static build to Vercel/Netlify

## Contributing

- Create feature branches: `feature/*`
- Follow React Native best practices
- Test on both iOS and Android emulators

## License

MIT
