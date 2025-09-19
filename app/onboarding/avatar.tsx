import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';

export default function AvatarScreen() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const username = params.username as string;

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: '/onboarding/preferences',
      params: { username, avatarUri }
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/onboarding/preferences',
      params: { username }
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-black px-6">
      <View className="flex-1 justify-center">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Add Your Avatar
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Choose a photo to personalize your profile
          </Text>
        </View>

        {/* Avatar Preview */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mb-4">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-32 h-32 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 dark:text-gray-400 text-4xl">
                👤
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          <TouchableOpacity
            className="border border-gray-300 dark:border-gray-600 rounded-lg py-3 flex-row items-center justify-center"
            onPress={pickImage}
          >
            <Text className="text-gray-900 dark:text-white font-medium">
              Choose from Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-gray-300 dark:border-gray-600 rounded-lg py-3 flex-row items-center justify-center"
            onPress={takePhoto}
          >
            <Text className="text-gray-900 dark:text-white font-medium">
              Take a Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-3 mb-4"
          onPress={handleContinue}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? 'Processing...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          className=""
          onPress={handleSkip}
        >
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
