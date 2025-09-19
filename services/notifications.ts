import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: { [key: string]: any };
}

export interface NotificationToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Register for push notifications
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        token = pushTokenData.data;
        this.expoPushToken = token;
      } catch (error) {
        console.error('Error getting push token:', error);
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  /**
   * Save notification token to Firestore
   */
  async saveNotificationToken(userId: string, token: string): Promise<void> {
    try {
      const deviceId = await Device.getDeviceIdAsync();
      const platform = Platform.OS as 'ios' | 'android' | 'web';

      // Check if token already exists for this user and device
      const tokensRef = collection(db, 'notification_tokens');
      const q = query(
        tokensRef,
        where('userId', '==', userId),
        where('deviceId', '==', deviceId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new token record
        await addDoc(tokensRef, {
          userId,
          token,
          platform,
          deviceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Update existing token
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          token,
          platform,
          updatedAt: serverTimestamp(),
        });
      }

      console.log('Notification token saved successfully');
    } catch (error) {
      console.error('Error saving notification token:', error);
    }
  }

  /**
   * Get notification tokens for a user
   */
  async getUserNotificationTokens(userId: string): Promise<string[]> {
    try {
      const tokensRef = collection(db, 'notification_tokens');
      const q = query(tokensRef, where('userId', '==', userId));
      
      const querySnapshot = await getDocs(q);
      const tokens: string[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tokens.push(data.token);
      });
      
      return tokens;
    } catch (error) {
      console.error('Error getting user notification tokens:', error);
      return [];
    }
  }

  /**
   * Send push notification to a user
   */
  async sendNotificationToUser(userId: string, notification: NotificationData): Promise<void> {
    try {
      const tokens = await this.getUserNotificationTokens(userId);
      
      if (tokens.length === 0) {
        console.log('No notification tokens found for user:', userId);
        return;
      }

      const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      }));

      // Send notifications via Expo Push API
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Notifications sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(userIds: string[], notification: NotificationData): Promise<void> {
    try {
      const allTokens: string[] = [];
      
      for (const userId of userIds) {
        const tokens = await this.getUserNotificationTokens(userId);
        allTokens.push(...tokens);
      }

      if (allTokens.length === 0) {
        console.log('No notification tokens found for users');
        return;
      }

      const messages = allTokens.map(token => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      }));

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Notifications sent to multiple users successfully');
    } catch (error) {
      console.error('Error sending notifications to multiple users:', error);
    }
  }

  /**
   * Send notification for new pick posted
   */
  async sendNewPickNotification(handicapperId: string, pickData: {
    handicapperName: string;
    game: string;
    pick: string;
    sport: string;
  }): Promise<void> {
    try {
      // Get followers of the handicapper
      const followersRef = collection(db, 'follows');
      const q = query(followersRef, where('handicapperId', '==', handicapperId));
      
      const querySnapshot = await getDocs(q);
      const followerIds: string[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        followerIds.push(data.userId);
      });

      if (followerIds.length === 0) {
        console.log('No followers found for handicapper:', handicapperId);
        return;
      }

      const notification: NotificationData = {
        title: `New Pick from ${pickData.handicapperName}`,
        body: `${pickData.sport}: ${pickData.game} - ${pickData.pick}`,
        data: {
          type: 'new_pick',
          handicapperId,
          pickId: pickData.game, // This would be the actual pick ID
        },
      };

      await this.sendNotificationToUsers(followerIds, notification);
    } catch (error) {
      console.error('Error sending new pick notification:', error);
    }
  }

  /**
   * Send subscription renewal reminder
   */
  async sendSubscriptionRenewalReminder(userId: string, subscriptionData: {
    productName: string;
    renewalDate: string;
  }): Promise<void> {
    const notification: NotificationData = {
      title: 'Subscription Renewal Reminder',
      body: `Your ${subscriptionData.productName} subscription will renew on ${subscriptionData.renewalDate}`,
      data: {
        type: 'subscription_renewal',
        renewalDate: subscriptionData.renewalDate,
      },
    };

    await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send expiring subscription notice
   */
  async sendExpiringSubscriptionNotice(userId: string, subscriptionData: {
    productName: string;
    expirationDate: string;
    daysRemaining: number;
  }): Promise<void> {
    const notification: NotificationData = {
      title: 'Subscription Expiring Soon',
      body: `Your ${subscriptionData.productName} subscription expires in ${subscriptionData.daysRemaining} days`,
      data: {
        type: 'subscription_expiring',
        expirationDate: subscriptionData.expirationDate,
        daysRemaining: subscriptionData.daysRemaining,
      },
    };

    await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(notification: NotificationData, trigger: Notifications.NotificationTriggerInput): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling scheduled notification:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Add notification listener
   */
  addNotificationListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener
   */
  addNotificationResponseListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Get current push token
   */
  getCurrentPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
