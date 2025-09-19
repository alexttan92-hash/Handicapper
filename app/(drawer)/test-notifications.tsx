import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSetup from '../../components/NotificationSetup';
import { notificationService } from '../../services/notifications';

export default function TestNotificationsScreen() {
  const { user } = useAuth();

  const sendNewPickNotification = async () => {
    if (!user) return;
    
    try {
      await notificationService.sendNewPickNotification('test_handicapper_id', {
        handicapperName: 'Test Handicapper',
        game: 'Lakers vs Warriors',
        pick: 'Lakers -5.5',
        sport: 'NBA',
      });
    } catch (error) {
      console.error('Error sending new pick notification:', error);
    }
  };

  const sendSubscriptionReminder = async () => {
    if (!user) return;
    
    try {
      await notificationService.sendSubscriptionRenewalReminder(user.uid, {
        productName: 'Handicapper Pro Monthly',
        renewalDate: '2024-02-15',
      });
    } catch (error) {
      console.error('Error sending subscription reminder:', error);
    }
  };

  const sendExpiringNotice = async () => {
    if (!user) return;
    
    try {
      await notificationService.sendExpiringSubscriptionNotice(user.uid, {
        productName: 'Handicapper Pro Annual',
        expirationDate: '2024-02-15',
        daysRemaining: 3,
      });
    } catch (error) {
      console.error('Error sending expiring notice:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black">
      <View className="px-6 py-8">
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.back()}
          >
            <Text className="text-blue-600 text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Test Notifications
          </Text>
        </View>

        {user && (
          <NotificationSetup userId={user.uid} />
        )}

        <View className="mt-8">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Notification Types
          </Text>
          
          <View className="space-y-3">
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3"
              onPress={sendNewPickNotification}
            >
              <Text className="text-white text-center font-semibold">
                Test New Pick Notification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-yellow-600 rounded-lg py-3"
              onPress={sendSubscriptionReminder}
            >
              <Text className="text-white text-center font-semibold">
                Test Subscription Renewal Reminder
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-600 rounded-lg py-3"
              onPress={sendExpiringNotice}
            >
              <Text className="text-white text-center font-semibold">
                Test Expiring Subscription Notice
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Instructions
          </Text>
          <View className="space-y-2">
            <Text className="text-gray-600 dark:text-gray-400">
              • Make sure you're running on a physical device
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              • Grant notification permissions when prompted
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              • Test notifications will be sent to your device
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              • Check the notification tray for received notifications
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
