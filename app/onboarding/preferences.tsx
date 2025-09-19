import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const SPORTS = [
  { id: 'nfl', name: 'NFL', icon: '🏈' },
  { id: 'nba', name: 'NBA', icon: '🏀' },
  { id: 'mlb', name: 'MLB', icon: '⚾' },
  { id: 'nhl', name: 'NHL', icon: '🏒' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'mma', name: 'MMA', icon: '🥊' },
  { id: 'golf', name: 'Golf', icon: '⛳' },
];

const BET_TYPES = [
  { id: 'spread', name: 'Point Spread' },
  { id: 'moneyline', name: 'Moneyline' },
  { id: 'total', name: 'Over/Under' },
  { id: 'props', name: 'Props' },
  { id: 'futures', name: 'Futures' },
];

export default function PreferencesScreen() {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const username = params.username as string;
  const avatarUri = params.avatarUri as string;
  const { user, updateUserProfile } = useAuth();

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev => 
      prev.includes(sportId) 
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
  };

  const toggleBetType = (betTypeId: string) => {
    setSelectedBetTypes(prev => 
      prev.includes(betTypeId) 
        ? prev.filter(id => id !== betTypeId)
        : [...prev, betTypeId]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const userData = {
        username,
        avatarUri,
        preferences: {
          sports: selectedSports,
          betTypes: selectedBetTypes,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateUserProfile(userData);
      router.replace('/(tabs)/following');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const userData = {
        username,
        avatarUri,
        preferences: {
          sports: [],
          betTypes: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateUserProfile(userData);
      router.replace('/(tabs)/following');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1 px-6">
        <View className="py-12">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Set Your Preferences
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Choose your favorite sports and betting types
            </Text>
          </View>

          {/* Sports Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Favorite Sports
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  className={`px-4 py-2 rounded-full border ${
                    selectedSports.includes(sport.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                  onPress={() => toggleSport(sport.id)}
                >
                  <Text className={`${
                    selectedSports.includes(sport.id)
                      ? 'text-white'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {sport.icon} {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bet Types Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Betting Types
            </Text>
            <View className="space-y-3">
              {BET_TYPES.map((betType) => (
                <TouchableOpacity
                  key={betType.id}
                  className={`p-4 rounded-lg border ${
                    selectedBetTypes.includes(betType.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                  onPress={() => toggleBetType(betType.id)}
                >
                  <Text className={`font-medium ${
                    selectedBetTypes.includes(betType.id)
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {betType.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-3 mb-4"
            onPress={handleComplete}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            className=""
            onPress={handleSkip}
            disabled={loading}
          >
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
