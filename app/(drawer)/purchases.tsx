import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function PurchasesScreen() {
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
            Purchases
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Subscription Status
          </Text>
          
          <View className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-900 dark:text-white font-medium">
                Handicapper Pro
              </Text>
              <View className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                <Text className="text-green-800 dark:text-green-200 text-xs font-medium">
                  ACTIVE
                </Text>
              </View>
            </View>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Next billing: January 15, 2024
            </Text>
          </View>
          
          <TouchableOpacity className="bg-red-600 rounded-lg py-3">
            <Text className="text-white text-center font-semibold">
              Cancel Subscription
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Purchase History
          </Text>
          
          <View className="space-y-3">
            <View className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 dark:text-white font-medium">
                  Handicapper Pro
                </Text>
                <Text className="text-gray-900 dark:text-white font-bold">
                  $9.99
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                December 15, 2023
              </Text>
            </View>
            
            <View className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 dark:text-white font-medium">
                  Premium Picks Pack
                </Text>
                <Text className="text-gray-900 dark:text-white font-bold">
                  $4.99
                </Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                November 28, 2023
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Manage Purchases
          </Text>
          
          <TouchableOpacity className="bg-blue-600 rounded-lg py-3 mb-4">
            <Text className="text-white text-center font-semibold">
              Restore Purchases
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="border border-gray-300 dark:border-gray-600 rounded-lg py-3">
            <Text className="text-gray-900 dark:text-white text-center font-semibold">
              View Receipts
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
