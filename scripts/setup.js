#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('🚀 HandiCapper Environment Setup\n');
  
  // Check if .env already exists
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('Please provide your Firebase configuration:\n');

  const firebaseApiKey = await question('Firebase API Key: ');
  const firebaseAuthDomain = await question('Firebase Auth Domain (e.g., project.firebaseapp.com): ');
  const firebaseProjectId = await question('Firebase Project ID: ');
  const firebaseStorageBucket = await question('Firebase Storage Bucket (e.g., project.appspot.com): ');
  const firebaseMessagingSenderId = await question('Firebase Messaging Sender ID: ');
  const firebaseAppId = await question('Firebase App ID: ');
  const firebaseMeasurementId = await question('Firebase Measurement ID (optional): ');
  const easProjectId = await question('EAS Project ID (optional): ');

  const envContent = `# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=${firebaseApiKey}
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=${firebaseAuthDomain}
EXPO_PUBLIC_FIREBASE_PROJECT_ID=${firebaseProjectId}
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=${firebaseStorageBucket}
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${firebaseMessagingSenderId}
EXPO_PUBLIC_FIREBASE_APP_ID=${firebaseAppId}
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=${firebaseMeasurementId}

# Expo Configuration
EXPO_PUBLIC_EAS_PROJECT_ID=${easProjectId}

# Environment
EXPO_PUBLIC_ENVIRONMENT=development
`;

  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Environment configuration saved to .env');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npx expo start');
  console.log('3. Scan QR code with Expo Go app');
  
  rl.close();
}

setupEnvironment().catch(console.error);
