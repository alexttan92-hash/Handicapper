import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import StarRating from '../../components/StarRating';

interface Handicapper {
  id: string;
  username: string;
  avatarUrl?: string;
  displayName?: string;
  email: string;
  role: 'handicapper';
  isHandicapperPro: boolean;
  specialties: string[];
  introBlurb?: string;
  winRate: number;
  activePicks: number;
  totalPicks: number;
  reviews: number;
  averageRating: number;
  unitPlusMinus: number;
  followers: number;
  isVerified: boolean;
  joinDate: string;
  lastActive: string;
}

export default function HandicappersScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [handicappers, setHandicappers] = useState<Handicapper[]>([]);
  const [filteredHandicappers, setFilteredHandicappers] = useState<Handicapper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'trending' | 'hot' | 'nfl' | 'nba'>('trending');

  const filters = [
    { id: 'trending', label: 'Trending', icon: '📈' },
    { id: 'hot', label: 'Hot', icon: '🔥' },
    { id: 'nfl', label: 'NFL', icon: '🏈' },
    { id: 'nba', label: 'NBA', icon: '🏀' },
  ];

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const fetchHandicappers = async () => {
    try {
      setLoading(true);
      
      // Query users collection for handicappers
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'handicapper'),
        orderBy('followers', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const handicappersData: Handicapper[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        handicappersData.push({
          id: doc.id,
          username: data.username || data.displayName || 'Unknown',
          avatarUrl: data.avatarUrl || data.photoURL,
          displayName: data.displayName,
          email: data.email,
          role: 'handicapper',
          isHandicapperPro: data.isHandicapperPro || false,
          specialties: data.specialties || ['General'],
          introBlurb: data.introBlurb || 'Professional sports handicapper with years of experience.',
          winRate: data.winRate || Math.floor(Math.random() * 30) + 60, // 60-90% mock data
          activePicks: data.activePicks || Math.floor(Math.random() * 20) + 5,
          totalPicks: data.totalPicks || Math.floor(Math.random() * 200) + 50,
          reviews: data.reviews || Math.floor(Math.random() * 100) + 10,
          averageRating: data.averageRating || (Math.random() * 1.5 + 3.5), // 3.5-5.0 mock data
          unitPlusMinus: data.unitPlusMinus || (Math.random() * 100 - 50), // -50 to +50 mock data
          followers: data.followers || Math.floor(Math.random() * 1000) + 100,
          isVerified: data.isVerified || Math.random() > 0.3, // 70% verified
          joinDate: data.joinDate || new Date().toISOString(),
          lastActive: data.lastActive || new Date().toISOString(),
        });
      });

      // If no real data, create mock handicappers
      if (handicappersData.length === 0) {
        const mockHandicappers = createMockHandicappers();
        setHandicappers(mockHandicappers);
        setFilteredHandicappers(mockHandicappers);
      } else {
        setHandicappers(handicappersData);
        setFilteredHandicappers(handicappersData);
      }
    } catch (error) {
      console.error('Error fetching handicappers:', error);
      // Fallback to mock data
      const mockHandicappers = createMockHandicappers();
      setHandicappers(mockHandicappers);
      setFilteredHandicappers(mockHandicappers);
    } finally {
      setLoading(false);
    }
  };

  const createMockHandicappers = (): Handicapper[] => {
    const mockData = [
      {
        id: '1',
        username: 'ProPicksMaster',
        displayName: 'Pro Picks Master',
        email: 'pro@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        specialties: ['NFL', 'NBA'],
        introBlurb: 'Professional handicapper with 15+ years experience. Specializing in NFL and NBA with a focus on value betting.',
        winRate: 78,
        activePicks: 12,
        totalPicks: 156,
        reviews: 89,
        averageRating: 4.7,
        unitPlusMinus: 45.2,
        followers: 1250,
        isVerified: true,
      },
      {
        id: '2',
        username: 'SportsAnalyst',
        displayName: 'Sports Analyst',
        email: 'analyst@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        specialties: ['NBA', 'MLB'],
        introBlurb: 'Data-driven approach to sports betting. Using advanced analytics and statistical models for consistent profits.',
        winRate: 72,
        activePicks: 8,
        totalPicks: 98,
        reviews: 67,
        averageRating: 4.5,
        unitPlusMinus: 32.8,
        followers: 890,
        isVerified: true,
      },
      {
        id: '3',
        username: 'GridironGuru',
        displayName: 'Gridiron Guru',
        email: 'guru@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
        specialties: ['NFL'],
        introBlurb: 'NFL specialist with insider knowledge and years of coaching experience. Focus on underdogs and value plays.',
        winRate: 75,
        activePicks: 15,
        totalPicks: 203,
        reviews: 124,
        averageRating: 4.8,
        unitPlusMinus: 67.5,
        followers: 2100,
        isVerified: true,
      },
      {
        id: '4',
        username: 'BasketballBetting',
        displayName: 'Basketball Betting Pro',
        email: 'bball@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
        specialties: ['NBA', 'NCAAB'],
        introBlurb: 'Former college basketball player turned handicapper. Deep understanding of the game and player dynamics.',
        winRate: 69,
        activePicks: 10,
        totalPicks: 87,
        reviews: 45,
        averageRating: 4.3,
        unitPlusMinus: 28.3,
        followers: 650,
        isVerified: false,
      },
      {
        id: '5',
        username: 'SharpShooter',
        displayName: 'Sharp Shooter',
        email: 'sharp@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
        specialties: ['NFL', 'NHL'],
        introBlurb: 'Sharp bettor with a focus on line shopping and value identification. Consistent long-term profitability.',
        winRate: 81,
        activePicks: 6,
        totalPicks: 134,
        reviews: 78,
        averageRating: 4.9,
        unitPlusMinus: 52.1,
        followers: 1800,
        isVerified: true,
      },
      {
        id: '6',
        username: 'BaseballExpert',
        displayName: 'Baseball Expert',
        email: 'baseball@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
        specialties: ['MLB'],
        introBlurb: 'MLB specialist with extensive knowledge of pitching matchups, weather factors, and ballpark effects.',
        winRate: 73,
        activePicks: 18,
        totalPicks: 167,
        reviews: 92,
        averageRating: 4.6,
        unitPlusMinus: 38.7,
        followers: 1100,
        isVerified: true,
      },
    ];

    return mockData.map((data) => ({
      ...data,
      role: 'handicapper' as const,
      isHandicapperPro: Math.random() > 0.3,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  useEffect(() => {
    fetchHandicappers();
  }, []);

  useEffect(() => {
    filterHandicappers();
  }, [searchQuery, activeFilter, handicappers]);

  const filterHandicappers = () => {
    let filtered = [...handicappers];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((handicapper) =>
        handicapper.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        handicapper.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        handicapper.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'trending':
        filtered = filtered.sort((a, b) => b.followers - a.followers);
        break;
      case 'hot':
        filtered = filtered.sort((a, b) => b.activePicks - a.activePicks);
        break;
      case 'nfl':
        filtered = filtered.filter(h => h.specialties.includes('NFL'));
        break;
      case 'nba':
        filtered = filtered.filter(h => h.specialties.includes('NBA'));
        break;
    }

    setFilteredHandicappers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHandicappers();
    setRefreshing(false);
  };

  const formatUnitPlusMinus = (units: number) => {
    const sign = units >= 0 ? '+' : '';
    return `${sign}${units.toFixed(1)}`;
  };

  const getUnitColor = (units: number) => {
    if (units > 0) return 'text-green-600 dark:text-green-400';
    if (units < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const renderHandicapperCard = (handicapper: Handicapper) => (
    <TouchableOpacity
      key={handicapper.id}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 mx-4 border border-gray-200 dark:border-gray-700"
      onPress={() => {
        // Navigate to handicapper profile
        console.log('Navigate to handicapper profile:', handicapper.id);
      }}
    >
      <View className="flex-row items-start">
        {/* Avatar */}
        <View className="relative">
          <Image
            source={{ uri: handicapper.avatarUrl || 'https://via.placeholder.com/60' }}
            className="w-16 h-16 rounded-full"
          />
          {handicapper.isVerified && (
            <View className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
              <Text className="text-white text-xs">✓</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 ml-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {handicapper.displayName || handicapper.username}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                @{handicapper.username}
              </Text>
            </View>
            {handicapper.isHandicapperPro && (
              <View className="bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">PRO</Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center space-x-4">
              <View className="items-center">
                <Text className="text-lg font-bold text-green-600 dark:text-green-400">
                  {handicapper.winRate}%
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">Win Rate</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {handicapper.activePicks}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">Active</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {handicapper.reviews}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">Reviews</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className={`text-lg font-bold ${getUnitColor(handicapper.unitPlusMinus)}`}>
                {formatUnitPlusMinus(handicapper.unitPlusMinus)}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">Units</Text>
            </View>
          </View>

          {/* Specialties */}
          <View className="flex-row flex-wrap mb-3">
            {handicapper.specialties.map((specialty, index) => (
              <View
                key={index}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full mr-2 mb-1"
              >
                <Text className="text-xs text-gray-700 dark:text-gray-300">
                  {specialty}
                </Text>
              </View>
            ))}
          </View>

          {/* Intro Blurb */}
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3" numberOfLines={2}>
            {handicapper.introBlurb}
          </Text>

          {/* Footer */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <StarRating rating={handicapper.averageRating} size="small" />
              <Text className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                {handicapper.followers} followers
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-500">
                {handicapper.totalPicks} total picks
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAdvertisingBanner = () => (
    <View className="mx-4 mb-4">
      <View className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
        <Text className="text-white text-lg font-bold mb-2">
          🎯 Premium Handicapper Access
        </Text>
        <Text className="text-white/90 text-sm mb-4">
          Get exclusive picks from top handicappers with Pro subscriptions
        </Text>
        <TouchableOpacity className="bg-white/20 rounded-lg py-2 px-4 self-start">
          <Text className="text-white font-semibold">Learn More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading handicappers...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Header with Menu Button */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={openDrawer}>
          <Text className="text-2xl">☰</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">
          Handicappers
        </Text>
        <View className="w-6" />
      </View>

      {/* Search Bar */}
      <View className="px-4 py-4">
        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 flex-row items-center">
          <Text className="text-gray-400 mr-3">🔍</Text>
          <TextInput
            className="flex-1 text-gray-900 dark:text-white"
            placeholder="Search handicappers..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-4 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  activeFilter === filter.id
                    ? 'bg-blue-600'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
                onPress={() => setActiveFilter(filter.id as any)}
              >
                <Text className="mr-2">{filter.icon}</Text>
                <Text
                  className={`font-semibold ${
                    activeFilter === filter.id
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Advertising Banner */}
        {renderAdvertisingBanner()}

        {/* Handicappers List */}
        {filteredHandicappers.length > 0 ? (
          filteredHandicappers.map(renderHandicapperCard)
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No handicappers found
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-center px-8">
              {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new handicappers'}
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}