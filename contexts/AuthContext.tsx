import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { auth, db } from '../config/firebase';
import { analyticsService } from '../services/analytics';
import { notificationService } from '../services/notifications';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Set analytics user ID
        analyticsService.setUserId(user.uid);
        
        // Register for push notifications
        try {
          const token = await notificationService.registerForPushNotificationsAsync();
          if (token) {
            await notificationService.saveNotificationToken(user.uid, token);
          }
        } catch (error) {
          console.error('Error registering for push notifications:', error);
        }
        
        // Check if user is onboarded
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          setIsOnboarded(userDoc.exists());
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          setIsOnboarded(false);
        }
      } else {
        setIsOnboarded(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Log analytics event
      analyticsService.logLogin('email', email);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      // Log analytics event
      analyticsService.logSignUp('email', result.user.uid);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      await SecureStore.deleteItemAsync('userSession');
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      // This will be implemented with RecaptchaVerifier
      // For now, we'll throw an error to indicate it needs to be implemented
      throw new Error('Phone authentication not yet implemented');
    } catch (error) {
      throw error;
    }
  };

  const verifyPhoneCode = async (verificationId: string, code: string) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { signInWithGoogle: googleSignIn } = await import('../services/auth');
      await googleSignIn();
      // Log analytics event
      if (user) {
        analyticsService.logLogin('google', user.uid);
      }
    } catch (error) {
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const { signInWithApple: appleSignIn } = await import('../services/auth');
      await appleSignIn();
      // Log analytics event
      if (user) {
        analyticsService.logLogin('apple', user.uid);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (userData: any) => {
    try {
      if (user) {
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        setIsOnboarded(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithPhone,
    verifyPhoneCode,
    signInWithGoogle,
    signInWithApple,
    updateUserProfile,
    isOnboarded,
    setIsOnboarded,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
