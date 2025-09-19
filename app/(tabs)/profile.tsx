import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

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

export default function ProfileScreen() {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedBetTypes, setSelectedBetTypes] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile(data);
        setUsername(data.username || '');
        setSelectedSports(data.preferences?.sports || []);
        setSelectedBetTypes(data.preferences?.betTypes || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    setSaving(true);
    try {
      const userData = {
        username: username.trim(),
        preferences: {
          sports: selectedSports,
          betTypes: selectedBetTypes,
        },
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'users', user.uid), userData);
      setProfile({ ...profile, ...userData });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && user) {
        // In a real app, you'd upload to Firebase Storage
        // For now, we'll just update the local state
        const newAvatarUri = result.assets[0].uri;
        setProfile({ ...profile, avatarUri: newAvatarUri });
        
        // Update in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          avatarUri: newAvatarUri,
          updatedAt: new Date().toISOString(),
        });
        
        Alert.alert('Success', 'Avatar updated successfully');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Error', 'Failed to update avatar');
    }
  };

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

  const handleUpgradeToPro = async () => {
    if (!user) return;
    
    Alert.alert(
      'Upgrade to Pro',
      'This will upgrade your account to Handicapper Pro. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.uid), {
                isHandicapperPro: true,
                upgradedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              
              setProfile({ ...profile, isHandicapperPro: true });
              Alert.alert('Success', 'You are now a Handicapper Pro!');
            } catch (error) {
              console.error('Error upgrading to pro:', error);
              Alert.alert('Error', 'Failed to upgrade account');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black">
      <View className="px-6 py-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </Text>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            onPress={() => setEditing(!editing)}
          >
            <Text className="text-gray-900 dark:text-white font-medium">
              {editing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View className="items-center mb-8">
          <TouchableOpacity
            className="relative"
            onPress={editing ? handleAvatarChange : undefined}
            disabled={!editing}
          >
            <View className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
              {profile?.avatarUri ? (
                <Image
                  source={{ uri: profile.avatarUri }}
                  className="w-32 h-32 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-gray-500 dark:text-gray-400 text-4xl">
                  👤
                </Text>
              )}
            </View>
            {editing && (
              <View className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white text-lg">+</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-gray-600 dark:text-gray-400 mt-2">
            {editing ? 'Tap to change avatar' : profile?.username || 'No username'}
          </Text>
        </View>

        {/* User Info */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Information
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </Text>
            <Text className="text-gray-900 dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {user?.email}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </Text>
            {editing ? (
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text className="text-gray-900 dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {profile?.username || 'No username set'}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Type
            </Text>
            <View className="flex-row items-center">
              <Text className="text-gray-900 dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex-1">
                {profile?.isHandicapperPro ? 'Handicapper Pro' : 'Standard User'}
              </Text>
              {profile?.isHandicapperPro && (
                <View className="ml-3 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                  <Text className="text-green-800 dark:text-green-200 text-sm font-medium">
                    PRO
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Upgrade to Pro Button */}
        {!profile?.isHandicapperPro && (
          <TouchableOpacity
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg py-4 mb-8"
            onPress={handleUpgradeToPro}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Upgrade to Handicapper Pro
            </Text>
            <Text className="text-white/80 text-center text-sm mt-1">
              Get exclusive picks and advanced features
            </Text>
          </TouchableOpacity>
        )}

        {/* Preferences Section */}
        {editing && (
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Preferences
            </Text>

            {/* Sports */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Favorite Sports
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SPORTS.map((sport) => (
                  <TouchableOpacity
                    key={sport.id}
                    className={`px-3 py-2 rounded-full border ${
                      selectedSports.includes(sport.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                    onPress={() => toggleSport(sport.id)}
                  >
                    <Text className={`text-sm ${
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

            {/* Bet Types */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Betting Types
              </Text>
              <View className="space-y-2">
                {BET_TYPES.map((betType) => (
                  <TouchableOpacity
                    key={betType.id}
                    className={`p-3 rounded-lg border ${
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

            {/* Save Button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3"
              onPress={handleSave}
              disabled={saving}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Stats */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Stats
          </Text>
          <View className="flex-row justify-around bg-gray-50 dark:bg-gray-800 rounded-lg py-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">0</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">Following</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">0</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">0</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">Picks</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
