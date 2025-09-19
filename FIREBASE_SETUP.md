# Firebase Authentication Setup Guide

## 🔥 Firebase Configuration Required

To complete the authentication setup, you need to configure Firebase with your project credentials.

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click "Email/Password" and toggle "Enable"
   - **Google**: Click "Google" and enable it
   - **Apple**: Click "Apple" and enable it (iOS only)
   - **Phone**: Click "Phone" and enable it

### 3. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</> icon)
4. Register your app with a nickname
5. Copy the Firebase config object

### 4. Update Firebase Configuration

Replace the placeholder values in `config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 5. Configure OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add your bundle ID (for iOS) and package name (for Android)
6. Copy the Client ID and update `services/auth.ts`:

```typescript
const GOOGLE_CLIENT_ID = 'your-actual-google-client-id';
```

#### Apple OAuth Setup

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Create a new App ID with Sign In with Apple capability
3. Create a Service ID for web authentication
4. Copy the Service ID and update `services/auth.ts`:

```typescript
const APPLE_CLIENT_ID = 'your-actual-apple-service-id';
```

### 6. Firestore Security Rules

Update your Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Test the Authentication

1. Start the Expo development server: `npx expo start`
2. Test email/password signup and login
3. Test social authentication (Google/Apple)
4. Verify onboarding flow works
5. Check that user data is saved to Firestore

## 📱 Features Implemented

### ✅ Authentication Methods
- **Email/Password**: Complete signup and login flow
- **Google OAuth**: Using expo-auth-session with PKCE
- **Apple OAuth**: Using expo-auth-session (iOS only)
- **Phone Authentication**: Framework ready (requires RecaptchaVerifier setup)

### ✅ Onboarding Flow
- **Username Selection**: Choose unique username
- **Avatar Upload**: Take photo or select from gallery
- **Preferences**: Select favorite sports and betting types

### ✅ Data Storage
- **Firestore**: Users collection with profile data
- **Session Persistence**: Using expo-secure-store
- **Profile Management**: Update user profile and preferences

### ✅ Navigation
- **Auth State Management**: Automatic routing based on auth state
- **Protected Routes**: Tabs require authentication and onboarding
- **Loading States**: Proper loading indicators during auth operations

## 🔧 Additional Configuration

### App.json Updates Needed

Add these to your `app.json` for social authentication:

```json
{
  "expo": {
    "scheme": "handicapper",
    "plugins": [
      "expo-router",
      "nativewind/babel",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ]
  }
}
```

### Environment Variables (Optional)

For production, consider using environment variables:

1. Install `expo-constants`: `npm install expo-constants`
2. Create `.env` file with your Firebase config
3. Update `config/firebase.ts` to use environment variables

## 🚀 Next Steps

1. **Configure Firebase** with your actual project credentials
2. **Test all authentication flows** thoroughly
3. **Set up push notifications** for user engagement
4. **Implement phone verification** with RecaptchaVerifier
5. **Add user profile management** screens
6. **Build out the main app features**

## 🐛 Troubleshooting

### Common Issues

1. **Firebase config not working**: Double-check your config values
2. **Google/Apple auth failing**: Verify OAuth client IDs and redirect URIs
3. **Firestore permission denied**: Check security rules
4. **Session not persisting**: Ensure AsyncStorage is properly configured

### Debug Mode

Enable debug logging in Firebase:

```typescript
// Add to your app entry point
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

if (__DEV__) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## 📚 Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/)
