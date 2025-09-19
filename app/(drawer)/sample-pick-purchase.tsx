import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { PickPurchaseButton } from '../../components/PurchaseButton';

export default function SamplePickPurchaseScreen() {
  const handlePurchaseSuccess = (transaction: any) => {
    console.log('Pick purchase successful:', transaction);
    router.back();
  };

  const handlePurchaseError = (error: Error) => {
    console.error('Pick purchase failed:', error);
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
            Premium Pick
          </Text>
        </View>

        {/* Sample Pick */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            NFL Sunday Special
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-4">
            Expert handicapper with 78% win rate
          </Text>
          
          <View className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4">
            <Text className="text-gray-900 dark:text-white font-semibold mb-2">
              Pick Details
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              <Text className="font-semibold">Game:</Text> Chiefs vs Bills
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              <Text className="font-semibold">Pick:</Text> Chiefs -3.5
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              <Text className="font-semibold">Confidence:</Text> High (85%)
            </Text>
            <Text className="text-gray-700 dark:text-gray-300">
              <Text className="font-semibold">Analysis:</Text> The Chiefs have been dominant at home this season, and with their strong defense against the run, we expect them to cover the spread against the Bills.
            </Text>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">Handicapper</Text>
              <Text className="text-gray-900 dark:text-white font-semibold">SportsPro22</Text>
            </View>
            <View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">Win Rate</Text>
              <Text className="text-green-600 dark:text-green-400 font-semibold">78%</Text>
            </View>
            <View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">Total Picks</Text>
              <Text className="text-gray-900 dark:text-white font-semibold">156</Text>
            </View>
          </View>

          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <Text className="text-blue-900 dark:text-blue-100 font-semibold mb-2">
              Why This Pick?
            </Text>
            <Text className="text-blue-800 dark:text-blue-200 text-sm">
              • Historical data shows Chiefs perform 15% better at home
            </Text>
            <Text className="text-blue-800 dark:text-blue-200 text-sm">
              • Bills struggle against teams with strong pass rush
            </Text>
            <Text className="text-blue-800 dark:text-blue-200 text-sm">
              • Weather conditions favor the home team
            </Text>
          </View>

          <PickPurchaseButton
            pickId="nfl_chiefs_bills_001"
            pickTitle="Chiefs -3.5 vs Bills"
            price="$4.99"
            handicapperName="SportsPro22"
            onPurchaseSuccess={handlePurchaseSuccess}
            onPurchaseError={handlePurchaseError}
          />
        </View>

        {/* Handicapper Info */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            About SportsPro22
          </Text>
          
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center mr-4">
              <Text className="text-gray-600 dark:text-gray-400 text-2xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white font-semibold">SportsPro22</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">Professional Handicapper</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">Member since 2020</Text>
            </View>
          </View>

          <View className="grid grid-cols-3 gap-4 mb-4">
            <View className="bg-white dark:bg-gray-700 rounded-lg p-3">
              <Text className="text-2xl font-bold text-green-600 text-center">78%</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center text-sm">Win Rate</Text>
            </View>
            <View className="bg-white dark:bg-gray-700 rounded-lg p-3">
              <Text className="text-2xl font-bold text-blue-600 text-center">156</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center text-sm">Total Picks</Text>
            </View>
            <View className="bg-white dark:bg-gray-700 rounded-lg p-3">
              <Text className="text-2xl font-bold text-purple-600 text-center">4.8★</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center text-sm">Rating</Text>
            </View>
          </View>

          <Text className="text-gray-700 dark:text-gray-300 text-sm">
            SportsPro22 has been providing expert sports analysis for over 3 years. 
            Specializing in NFL and NBA, they have built a reputation for accurate 
            predictions and detailed analysis.
          </Text>
        </View>

        {/* Related Picks */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            More Picks from SportsPro22
          </Text>
          
          <View className="space-y-3">
            <View className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 dark:text-white font-medium">
                  Lakers vs Warriors
                </Text>
                <Text className="text-green-600 dark:text-green-400 font-semibold">$4.99</Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                NBA • Over 228.5 points
              </Text>
            </View>
            
            <View className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 dark:text-white font-medium">
                  Packers vs Vikings
                </Text>
                <Text className="text-green-600 dark:text-green-400 font-semibold">$4.99</Text>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                NFL • Packers +2.5
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
