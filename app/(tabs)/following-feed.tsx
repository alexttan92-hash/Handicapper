import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { picksService, Pick } from '../../services/picks';
import { followingService } from '../../services/following';

interface Handicapper {
  id: string;
  username: string;
  displayName: string;
  avatarUri?: string;
  isVerified: boolean;
  winRate: number;
  totalPicks: number;
  followers: number;
}

interface Pick {
  id: string;
  handicapperId: string;
  handicapper: Handicapper;
  content: string;
  game: string;
  pick: string;
  confidence: number;
  isPaid: boolean;
  price?: number;
  isFree: boolean;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  sport: string;
  status: 'pending' | 'won' | 'lost' | 'void';
}

export default function FollowingFeedScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    loadFollowing();
  }, [user]);

  useEffect(() => {
    loadPicks();
  }, [activeTab, following]);

  const loadFollowing = async () => {
    if (!user) return;
    
    try {
      const followingList = await followingService.getFollowing(user.uid);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error loading following:', error);
      // Fallback to mock data for demo
      setFollowing(['handicapper1', 'handicapper2', 'handicapper3']);
    }
  };

  const loadPicks = async () => {
    try {
      setLoading(true);
      
      let picksData: Pick[];
      
      if (activeTab === 'following' && following.length > 0) {
        // Load picks from followed handicappers
        picksData = await picksService.getFollowingPicks(following, 20);
      } else {
        // Load top-rated handicapper picks for "For You"
        picksData = await picksService.getTopRatedPicks(20);
      }

      setPicks(picksData);
    } catch (error) {
      console.error('Error loading picks:', error);
      // For demo purposes, create mock data
      setPicks(createMockPicks());
    } finally {
      setLoading(false);
    }
  };

  const createMockPicks = (): Pick[] => {
    const mockPicks: Pick[] = [];
    const sports = ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];
    const games = [
      'Chiefs vs Bills',
      'Lakers vs Warriors',
      'Yankees vs Red Sox',
      'Bruins vs Rangers',
      'Real Madrid vs Barcelona'
    ];
    const picks = [
      'Chiefs -3.5',
      'Lakers +2.5',
      'Over 8.5 runs',
      'Bruins ML',
      'Real Madrid -1'
    ];

    for (let i = 0; i < 10; i++) {
      const isPaid = Math.random() > 0.6;
      const isFree = Math.random() > 0.8;
      
      mockPicks.push({
        id: `pick_${i}`,
        handicapperId: `handicapper${i % 5}`,
        handicapper: {
          id: `handicapper${i % 5}`,
          username: `handicapper${i % 5}`,
          displayName: `Handicapper ${i % 5}`,
          isVerified: Math.random() > 0.5,
          winRate: Math.floor(Math.random() * 30) + 60,
          totalPicks: Math.floor(Math.random() * 200) + 50,
          followers: Math.floor(Math.random() * 1000) + 100,
        },
        content: `My analysis for ${games[i % games.length]}: ${picks[i % picks.length]} is the play here. Strong value based on recent form and matchup advantages.`,
        game: games[i % games.length],
        pick: picks[i % picks.length],
        confidence: Math.floor(Math.random() * 30) + 70,
        isPaid,
        price: isPaid ? 4.99 : undefined,
        isFree,
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        sport: sports[i % sports.length],
        status: 'pending',
      });
    }
    return mockPicks;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPicks();
    setRefreshing(false);
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handlePickInteraction = async (pickId: string, action: 'like' | 'share' | 'purchase') => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to interact with picks');
      return;
    }

    try {
      switch (action) {
        case 'like':
          await picksService.likePick(pickId, user.uid);
          // Refresh the pick to show updated like count
          await loadPicks();
          break;
        case 'share':
          await picksService.sharePick(pickId, user.uid);
          Alert.alert('Shared', 'Pick shared successfully');
          break;
        case 'purchase':
          // Navigate to purchase screen
          router.push(`/(drawer)/sample-pick-purchase`);
          break;
      }
    } catch (error) {
      console.error('Error handling pick interaction:', error);
      Alert.alert('Error', 'Failed to perform action');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}w`;
  };

  const PickCard = ({ pick }: { pick: Pick }) => (
    <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
      {/* Handicapper Header */}
      <View className="flex-row items-center mb-3">
        <TouchableOpacity className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mr-3">
            {pick.handicapper.avatarUri ? (
              <Image
                source={{ uri: pick.handicapper.avatarUri }}
                className="w-12 h-12 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 dark:text-gray-400 text-lg">
                {pick.handicapper.displayName.charAt(0)}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-gray-900 dark:text-white font-semibold">
                {pick.handicapper.displayName}
              </Text>
              {pick.handicapper.isVerified && (
                <Text className="text-blue-500 ml-1">✓</Text>
              )}
              <Text className="text-gray-500 dark:text-gray-400 ml-2">
                @{pick.handicapper.username}
              </Text>
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {formatTimeAgo(pick.createdAt)} • {pick.sport}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Pick Status Icon */}
        <View className="ml-2">
          {pick.isFree ? (
            <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center">
              <Text className="text-green-600 dark:text-green-400 text-sm">🔓</Text>
            </View>
          ) : pick.isPaid ? (
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 items-center justify-center"
              onPress={() => handlePickInteraction(pick.id, 'purchase')}
            >
              <Text className="text-blue-600 dark:text-blue-400 text-sm">$</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">🔒</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pick Content */}
      <View className="mb-4">
        <Text className="text-gray-900 dark:text-white text-base leading-6 mb-3">
          {pick.content}
        </Text>
        
        {/* Pick Details Card */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-900 dark:text-white font-semibold">
              {pick.game}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-gray-600 dark:text-gray-400 text-sm mr-2">Confidence:</Text>
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                {pick.confidence}%
              </Text>
            </View>
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {pick.pick}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {pick.sport} • {pick.handicapper.winRate}% win rate
            </Text>
            {pick.isPaid && (
              <Text className="text-green-600 dark:text-green-400 font-semibold">
                ${pick.price}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Interaction Buttons */}
      <View className="flex-row items-center justify-between px-4">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => handlePickInteraction(pick.id, 'like')}
        >
          <Text className="text-gray-500 dark:text-gray-400 mr-2">❤️</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {pick.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => handlePickInteraction(pick.id, 'share')}
        >
          <Text className="text-gray-500 dark:text-gray-400 mr-2">💬</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {pick.comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => handlePickInteraction(pick.id, 'share')}
        >
          <Text className="text-gray-500 dark:text-gray-400 mr-2">📤</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {pick.shares}
          </Text>
        </TouchableOpacity>

        {pick.isPaid && (
          <TouchableOpacity
            className="bg-blue-600 rounded-full px-4 py-2"
            onPress={() => handlePickInteraction(pick.id, 'purchase')}
          >
            <Text className="text-white font-semibold text-sm">
              Buy ${pick.price}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading picks...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={openDrawer}>
          <View className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">👤</Text>
          </View>
        </TouchableOpacity>
        
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Handicapper
          </Text>
        </View>
        
        <View className="w-8" />
      </View>

      {/* Tab Navigation */}
      <View className="flex-row border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === 'for-you' ? 'border-b-2 border-blue-500' : ''
          }`}
          onPress={() => setActiveTab('for-you')}
        >
          <Text className={`font-semibold ${
            activeTab === 'for-you'
              ? 'text-blue-500'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            For You
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === 'following' ? 'border-b-2 border-blue-500' : ''
          }`}
          onPress={() => setActiveTab('following')}
        >
          <Text className={`font-semibold ${
            activeTab === 'following'
              ? 'text-blue-500'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {picks.length > 0 ? (
          picks.map((pick) => (
            <PickCard key={pick.id} pick={pick} />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No picks available
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-center px-8">
              {activeTab === 'following' 
                ? 'Follow some handicappers to see their picks here'
                : 'Check back later for new picks'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
