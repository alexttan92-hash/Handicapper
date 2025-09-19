import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// Complete the auth session for web browsers
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = 'your-google-client-id'; // Replace with your actual Google client ID

// Apple OAuth configuration
const APPLE_CLIENT_ID = 'your-apple-client-id'; // Replace with your actual Apple client ID

export const signInWithGoogle = async () => {
  try {
    // Create a code challenge for PKCE
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      'random-string', // In production, use a random string
      { encoding: Crypto.CryptoEncoding.BASE64URL }
    );

    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      codeChallenge,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      extraParams: {},
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (result.type === 'success') {
      // Exchange the code for tokens
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: GOOGLE_CLIENT_ID,
          code: result.params.code,
          redirectUri,
          extraParams: {
            code_verifier: 'random-string', // Should match the code challenge
          },
        },
        {
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
        }
      );

      // Create Firebase credential
      const credential = GoogleAuthProvider.credential(tokenResponse.accessToken);
      
      // Sign in with Firebase
      await signInWithCredential(auth, credential);
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signInWithApple = async () => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    const request = new AuthSession.AuthRequest({
      clientId: APPLE_CLIENT_ID,
      scopes: ['name', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
      extraParams: {},
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
    });

    if (result.type === 'success') {
      // Exchange the code for tokens
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: APPLE_CLIENT_ID,
          code: result.params.code,
          redirectUri,
        },
        {
          tokenEndpoint: 'https://appleid.apple.com/auth/token',
        }
      );

      // Create Firebase credential
      const credential = OAuthProvider.credential('apple.com', {
        idToken: tokenResponse.idToken,
        accessToken: tokenResponse.accessToken,
      });
      
      // Sign in with Firebase
      await signInWithCredential(auth, credential);
    }
  } catch (error) {
    console.error('Apple sign-in error:', error);
    throw error;
  }
};

export const signInWithPhoneNumber = async (phoneNumber: string) => {
  try {
    // This would require implementing RecaptchaVerifier
    // For now, we'll throw an error to indicate it needs to be implemented
    throw new Error('Phone authentication requires additional setup with RecaptchaVerifier');
  } catch (error) {
    console.error('Phone sign-in error:', error);
    throw error;
  }
};
