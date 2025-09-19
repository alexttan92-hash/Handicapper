# Handicapper App Setup

## ✅ Completed Setup

### Dependencies Installed
- **Navigation**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `react-native-safe-area-context`, `react-native-screens`
- **UI**: `tailwindcss`, `nativewind`
- **Auth/Storage**: `firebase`, `expo-auth-session`, `expo-secure-store`
- **Notifications**: `expo-notifications`
- **Payments**: `expo-in-app-purchases`
- **Data Fetching**: `axios`, `@tanstack/react-query`

### Configuration
- ✅ Tailwind CSS configured with NativeWind
- ✅ Metro bundler configured for NativeWind
- ✅ Global CSS imported in root layout
- ✅ Babel plugin added to app.json

### Navigation Structure
- ✅ Bottom tab navigation with 5 screens:
  1. **Following** - Track favorite handicappers
  2. **Post Picks** - Share sports predictions
  3. **Handicappers** - Discover experts
  4. **Ask Handicapper** - Get personalized advice
  5. **Subscriptions** - Manage premium features

## 🚀 Running the App

```bash
cd handicapper
npx expo start
```

Scan the QR code with Expo Go app on your mobile device.

## 📁 Project Structure

```
handicapper/
├── app/
│   ├── (tabs)/
│   │   ├── following.tsx
│   │   ├── post-picks.tsx
│   │   ├── handicappers.tsx
│   │   ├── ask-handicapper.tsx
│   │   ├── subscriptions.tsx
│   │   └── _layout.tsx
│   ├── _layout.tsx
│   └── modal.tsx
├── components/
├── global.css
├── metro.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Styling

The app uses Tailwind CSS with NativeWind for styling. Use className props for styling:

```jsx
<View className="flex-1 bg-white dark:bg-black">
  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
    Hello World
  </Text>
</View>
```

## 📱 Next Steps

1. Implement authentication flow with Firebase
2. Set up data fetching with React Query
3. Add notification handling
4. Implement in-app purchases
5. Build out individual screen functionality
