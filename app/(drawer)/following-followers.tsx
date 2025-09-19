import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function FollowingFollowersScreen() {
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
            Following / Followers
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Following
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Handicappers you're following will appear here
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Followers
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Users following you will appear here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
