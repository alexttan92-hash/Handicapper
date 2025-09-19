import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function UsernameScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    try {
      // Store username temporarily - will be saved with other onboarding data
      router.push({
        pathname: '/onboarding/avatar',
        params: { username: username.trim() }
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white dark:bg-black px-6"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Username
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            This will be your unique identifier on Handicapper
          </Text>
        </View>

        {/* Username Input */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </Text>
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Enter your username"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Only letters, numbers, and underscores allowed
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-3"
          onPress={handleContinue}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? 'Checking...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          className="mt-4"
          onPress={() => router.push('/onboarding/avatar')}
        >
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
