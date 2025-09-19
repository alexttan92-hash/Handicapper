import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notifications';

interface NotificationSetupProps {
  userId: string;
}

export default function NotificationSetup({ userId }: NotificationSetupProps) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    registerForPushNotifications();

    // Listen for notifications
    const notificationListener = notificationService.addNotificationListener((notification) => {
      setNotification(notification);
    });

    const responseListener = notificationService.addNotificationResponseListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        await notificationService.saveNotificationToken(userId, token);
        console.log('Push token:', token);
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendNotificationToUser(userId, {
        title: 'Test Notification',
        body: 'This is a test notification from HandiCapper!',
        data: { test: true },
      });
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const scheduleTestNotification = async () => {
    try {
      const notificationId = await notificationService.scheduleLocalNotification(
        {
          title: 'Scheduled Test',
          body: 'This is a scheduled test notification!',
          data: { scheduled: true },
        },
        { seconds: 5 }
      );
      Alert.alert('Success', `Scheduled notification with ID: ${notificationId}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  return (
    <View className="p-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Push Notifications Setup
      </Text>
      
      {expoPushToken ? (
        <View className="mb-4">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Push Token:
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-500 font-mono">
            {expoPushToken.substring(0, 50)}...
          </Text>
        </View>
      ) : (
        <Text className="text-gray-600 dark:text-gray-400 mb-4">
          Registering for push notifications...
        </Text>
      )}

      <View className="space-y-3">
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-3"
          onPress={sendTestNotification}
        >
          <Text className="text-white text-center font-semibold">
            Send Test Notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-600 rounded-lg py-3"
          onPress={scheduleTestNotification}
        >
          <Text className="text-white text-center font-semibold">
            Schedule Test (5 seconds)
          </Text>
        </TouchableOpacity>
      </View>

      {notification && (
        <View className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            Last Notification:
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {notification.request.content.title}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {notification.request.content.body}
          </Text>
        </View>
      )}
    </View>
  );
}
