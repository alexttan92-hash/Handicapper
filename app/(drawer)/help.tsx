import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function HelpScreen() {
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
            Help & Support
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </Text>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">How do I place a pick?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">How do I follow a handicapper?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">What is Handicapper Pro?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3">
            <Text className="text-gray-900 dark:text-white">How do I cancel my subscription?</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Support
          </Text>
          
          <TouchableOpacity className="bg-blue-600 rounded-lg py-3 mb-4">
            <Text className="text-white text-center font-semibold">
              Email Support
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-lg py-3 mb-4">
            <Text className="text-gray-900 dark:text-white text-center font-semibold">
              Live Chat
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-lg py-3">
            <Text className="text-gray-900 dark:text-white text-center font-semibold">
              Report a Bug
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Resources
          </Text>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">User Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-gray-900 dark:text-white">Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3">
            <Text className="text-gray-900 dark:text-white">Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
