import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function AddAccountScreen() {
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
            Add Account
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Link Additional Accounts
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-6">
            Connect additional social media accounts or betting platforms
          </Text>

          <TouchableOpacity className="bg-blue-600 rounded-lg py-3 mb-4">
            <Text className="text-white text-center font-semibold">
              Add Google Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-800 rounded-lg py-3 mb-4">
            <Text className="text-white text-center font-semibold">
              Add Apple Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-lg py-3">
            <Text className="text-gray-900 dark:text-white text-center font-semibold">
              Add Email Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
