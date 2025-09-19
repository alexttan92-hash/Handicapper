import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
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
            Settings & Privacy
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </Text>
          
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 dark:text-white">Push Notifications</Text>
            <Switch value={true} />
          </View>
          
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 dark:text-white">Pick Alerts</Text>
            <Switch value={true} />
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-900 dark:text-white">Marketing Emails</Text>
            <Switch value={false} />
          </View>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Privacy
          </Text>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">Data & Privacy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">Account Security</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3">
            <Text className="text-gray-900 dark:text-white">Blocked Users</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            App Settings
          </Text>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">Language</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">Theme</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3">
            <Text className="text-gray-900 dark:text-white">Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
