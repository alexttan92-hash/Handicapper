import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SubscriptionButton } from '../../components/PurchaseButton';
import { purchaseService } from '../../services/purchases';

export default function UpgradeProScreen() {
  const [loading, setLoading] = useState(false);

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      // This would need to be called with the actual user ID
      // For now, we'll just show an alert
      Alert.alert(
        'Restore Purchases',
        'This feature will restore your previous purchases when implemented with user authentication.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSuccess = (transaction: any) => {
    console.log('Subscription successful:', transaction);
    // Navigate back or show success message
    router.back();
  };

  const handleSubscriptionError = (error: Error) => {
    console.error('Subscription failed:', error);
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
            Upgrade to Pro
          </Text>
        </View>

        <View className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6">
          <Text className="text-2xl font-bold text-white mb-2">
            Handicapper Pro
          </Text>
          <Text className="text-white/90 mb-4">
            Unlock premium features and exclusive content
          </Text>
          <Text className="text-3xl font-bold text-white">
            $9.99/month
          </Text>
        </View>

        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Pro Features
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Text className="text-green-600 mr-3">✓</Text>
              <Text className="text-gray-900 dark:text-white">Exclusive picks from top handicappers</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-600 mr-3">✓</Text>
              <Text className="text-gray-900 dark:text-white">Advanced analytics and insights</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-600 mr-3">✓</Text>
              <Text className="text-gray-900 dark:text-white">Priority customer support</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-600 mr-3">✓</Text>
              <Text className="text-gray-900 dark:text-white">Ad-free experience</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-600 mr-3">✓</Text>
              <Text className="text-gray-900 dark:text-white">Early access to new features</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-600 mr-3">✓</Text>
              <Text className="text-gray-900 dark:text-white">Access to premium handicapper picks</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-600 mr-3">✓</Text>
              <Text className="text-gray-900 dark:text-white">Detailed performance analytics</Text>
            </View>
          </View>
        </View>

        {/* Subscription Options */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </Text>
          
          {/* Monthly Plan */}
          <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Plan
              </Text>
              <Text className="text-xl font-bold text-blue-600">$9.99</Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Perfect for trying out Pro features
            </Text>
            <SubscriptionButton
              productId="handicapper_pro_monthly"
              title="Handicapper Pro Monthly"
              price="$9.99/month"
              description="Monthly subscription to Handicapper Pro with all premium features"
              onSubscriptionSuccess={handleSubscriptionSuccess}
              onSubscriptionError={handleSubscriptionError}
            />
          </View>

          {/* Annual Plan */}
          <View className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-4 mb-4 relative">
            <View className="absolute -top-3 left-4 bg-blue-500 text-white px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">BEST VALUE</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Annual Plan
              </Text>
              <View>
                <Text className="text-xl font-bold text-blue-600">$99.99</Text>
                <Text className="text-sm text-green-600 font-medium">Save 17%</Text>
              </View>
            </View>
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Best value - Save $20 compared to monthly
            </Text>
            <SubscriptionButton
              productId="handicapper_pro_annual"
              title="Handicapper Pro Annual"
              price="$99.99/year"
              description="Annual subscription to Handicapper Pro with all premium features and maximum savings"
              onSubscriptionSuccess={handleSubscriptionSuccess}
              onSubscriptionError={handleSubscriptionError}
            />
          </View>
        </View>

        {/* Additional Information */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <Text className="text-blue-900 dark:text-blue-100 font-semibold mb-2">
            Subscription Details
          </Text>
          <Text className="text-blue-800 dark:text-blue-200 text-sm mb-1">
            • Subscriptions automatically renew unless cancelled
          </Text>
          <Text className="text-blue-800 dark:text-blue-200 text-sm mb-1">
            • Cancel anytime in your device settings
          </Text>
          <Text className="text-blue-800 dark:text-blue-200 text-sm mb-1">
            • Payment charged to your App Store or Google Play account
          </Text>
          <Text className="text-blue-800 dark:text-blue-200 text-sm">
            • 7-day free trial available for new subscribers
          </Text>
        </View>

        <TouchableOpacity 
          className="border border-gray-300 dark:border-gray-600 rounded-lg py-3 mb-4"
          onPress={handleRestorePurchases}
          disabled={loading}
        >
          <Text className="text-gray-900 dark:text-white text-center font-semibold">
            Restore Purchases
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
