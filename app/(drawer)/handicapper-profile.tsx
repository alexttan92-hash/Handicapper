import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import ReviewModal from '../../components/ReviewModal';
import StarRating from '../../components/StarRating';
import { reviewService, Review } from '../../services/reviews';

interface HandicapperProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  specialties: string[];
  isHandicapperPro: boolean;
  isVerified: boolean;
  followers: number;
  totalPicks: number;
  winRate: number;
  unitPlusMinus: number;
  activePicks: number;
  averageRating: number;
  totalReviews: number;
  joinDate: string;
}

interface Pick {
  id: string;
  handicapperId: string;
  content: string;
  game: string;
  pick: string;
  confidence: number;
  isPaid: boolean;
  price?: number;
  isFree: boolean;
  sport: string;
  status: 'pending' | 'won' | 'lost' | 'push';
  createdAt: string;
  result?: 'win' | 'loss' | 'push';
  units?: number;
}

interface Review {
  id: string;
  handicapperId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface PerformanceStats {
  totalPicks: number;
  winRate: number;
  unitPlusMinus: number;
  activePicks: number;
  recent5: { wins: number; losses: number; pushes: number };
  recent10: { wins: number; losses: number; pushes: number };
  recent30: { wins: number; losses: number; pushes: number };
  bySport: { [sport: string]: { picks: number; wins: number; winRate: number } };
}

export default function HandicapperProfileScreen() {
  const { user } = useAuth();
  const { handicapperId } = useLocalSearchParams();
  const [profile, setProfile] = useState<HandicapperProfile | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const loadHandicapperProfile = async () => {
    if (!handicapperId) return;

    try {
      setLoading(true);

      // Load handicapper profile
      const userDoc = await getDoc(doc(db, 'users', handicapperId as string));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          id: userDoc.id,
          username: userData.username || userData.displayName || 'Unknown',
          displayName: userData.displayName || userData.username || 'Unknown',
          avatarUrl: userData.avatarUrl || userData.photoURL,
          bio: userData.bio || 'Professional sports handicapper with years of experience.',
          specialties: userData.specialties || ['General'],
          isHandicapperPro: userData.isHandicapperPro || false,
          isVerified: userData.isVerified || false,
          followers: userData.followers || 0,
          totalPicks: userData.totalPicks || 0,
          winRate: userData.winRate || 0,
          unitPlusMinus: userData.unitPlusMinus || 0,
          activePicks: userData.activePicks || 0,
          averageRating: userData.averageRating || 0,
          totalReviews: userData.totalReviews || 0,
          joinDate: userData.joinDate || new Date().toISOString(),
        });
      }

      // Load picks
      const picksRef = collection(db, 'picks');
      const picksQuery = query(
        picksRef,
        where('handicapperId', '==', handicapperId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const picksSnapshot = await getDocs(picksQuery);
      const picksData: Pick[] = [];
      picksSnapshot.forEach((doc) => {
        const data = doc.data();
        picksData.push({
          id: doc.id,
          handicapperId: data.handicapperId,
          content: data.content,
          game: data.game,
          pick: data.pick,
          confidence: data.confidence,
          isPaid: data.isPaid,
          price: data.price,
          isFree: data.isFree,
          sport: data.sport,
          status: data.status,
          createdAt: data.createdAt,
          result: data.result,
          units: data.units,
        });
      });
      setPicks(picksData);

      // Load reviews
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(
        reviewsRef,
        where('handicapperId', '==', handicapperId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData: Review[] = [];
      reviewsSnapshot.forEach((doc) => {
        const data = doc.data();
        reviewsData.push({
          id: doc.id,
          handicapperId: data.handicapperId,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt,
        });
      });
      setReviews(reviewsData);

      // Calculate performance stats
      const stats = calculatePerformanceStats(picksData);
      setPerformanceStats(stats);

      // Check subscription status (mock for now)
      setIsSubscribed(Math.random() > 0.5);

    } catch (error) {
      console.error('Error loading handicapper profile:', error);
      Alert.alert('Error', 'Failed to load handicapper profile');
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceStats = (picksData: Pick[]): PerformanceStats => {
    const totalPicks = picksData.length;
    const completedPicks = picksData.filter(p => p.result);
    const wins = completedPicks.filter(p => p.result === 'win').length;
    const losses = completedPicks.filter(p => p.result === 'loss').length;
    const pushes = completedPicks.filter(p => p.result === 'push').length;
    const winRate = completedPicks.length > 0 ? (wins / completedPicks.length) * 100 : 0;

    // Recent performance
    const recent5 = picksData.slice(0, 5).filter(p => p.result);
    const recent10 = picksData.slice(0, 10).filter(p => p.result);
    const recent30 = picksData.slice(0, 30).filter(p => p.result);

    const recent5Stats = {
      wins: recent5.filter(p => p.result === 'win').length,
      losses: recent5.filter(p => p.result === 'loss').length,
      pushes: recent5.filter(p => p.result === 'push').length,
    };

    const recent10Stats = {
      wins: recent10.filter(p => p.result === 'win').length,
      losses: recent10.filter(p => p.result === 'loss').length,
      pushes: recent10.filter(p => p.result === 'push').length,
    };

    const recent30Stats = {
      wins: recent30.filter(p => p.result === 'win').length,
      losses: recent30.filter(p => p.result === 'loss').length,
      pushes: recent30.filter(p => p.result === 'push').length,
    };

    // Performance by sport
    const bySport: { [sport: string]: { picks: number; wins: number; winRate: number } } = {};
    picksData.forEach(pick => {
      if (!bySport[pick.sport]) {
        bySport[pick.sport] = { picks: 0, wins: 0, winRate: 0 };
      }
      bySport[pick.sport].picks++;
      if (pick.result === 'win') {
        bySport[pick.sport].wins++;
      }
    });

    // Calculate win rates by sport
    Object.keys(bySport).forEach(sport => {
      const sportData = bySport[sport];
      sportData.winRate = sportData.picks > 0 ? (sportData.wins / sportData.picks) * 100 : 0;
    });

    return {
      totalPicks,
      winRate,
      unitPlusMinus: profile?.unitPlusMinus || 0,
      activePicks: picksData.filter(p => p.status === 'pending').length,
      recent5: recent5Stats,
      recent10: recent10Stats,
      recent30: recent30Stats,
      bySport,
    };
  };

  useEffect(() => {
    loadHandicapperProfile();
  }, [handicapperId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHandicapperProfile();
    setRefreshing(false);
  };

  const handleSubscribe = () => {
    if (isSubscribed) {
      Alert.alert('Already Subscribed', 'You are already subscribed to this handicapper.');
      return;
    }
    
    Alert.alert(
      'Subscribe to Handicapper',
      `Subscribe to ${profile?.displayName} for exclusive picks and insights?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            // TODO: Implement subscription logic
            Alert.alert('Success', 'Subscription successful!');
            setIsSubscribed(true);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const handleReviewSubmitted = async () => {
    // Reload the profile data to get updated reviews and ratings
    await loadHandicapperProfile();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <Text className="text-gray-600 dark:text-gray-400 text-lg">Profile not found</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-600 rounded-lg px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">
          Profile
        </Text>
        <View className="w-16" />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View className="items-center px-6 py-8">
          <View className="relative">
            <Image
              source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/120' }}
              className="w-32 h-32 rounded-full border-4 border-blue-500"
            />
            {profile.isVerified && (
              <View className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                <Text className="text-white text-sm">✓</Text>
              </View>
            )}
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            {profile.displayName}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-lg">
            @{profile.username}
          </Text>
          
          {profile.isHandicapperPro && (
            <View className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-full mt-2">
              <Text className="text-white font-semibold">PRO HANDICAPPER</Text>
            </View>
          )}

          <Text className="text-gray-600 dark:text-gray-400 text-center mt-4 px-4">
            {profile.bio}
          </Text>

          <TouchableOpacity
            className={`mt-6 px-8 py-4 rounded-lg ${
              isSubscribed 
                ? 'bg-gray-300 dark:bg-gray-600' 
                : 'bg-blue-600'
            }`}
            onPress={handleSubscribe}
          >
            <Text className={`font-semibold text-lg ${
              isSubscribed 
                ? 'text-gray-600 dark:text-gray-400' 
                : 'text-white'
            }`}>
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Summary */}
        <View className="px-6 py-6 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white">
              Reviews
            </Text>
            <TouchableOpacity
              className="bg-blue-600 rounded-lg px-4 py-2"
              onPress={() => setShowReviewModal(true)}
            >
              <Text className="text-white font-semibold text-sm">
                Write Review
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <StarRating 
                rating={profile.averageRating} 
                size="medium" 
                showNumber={true}
              />
            </View>
            <Text className="text-gray-600 dark:text-gray-400">
              {profile.totalReviews} reviews
            </Text>
          </View>
        </View>

        {/* Performance Stats */}
        <View className="px-6 py-6 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Performance Stats
          </Text>
          <View className="grid grid-cols-2 gap-4">
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceStats?.totalPicks || 0}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">Total Picks</Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className="text-2xl font-bold text-green-600 dark:text-green-400">
                {performanceStats?.winRate.toFixed(1) || 0}%
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">Win Rate</Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className={`text-2xl font-bold ${getUnitColor(performanceStats?.unitPlusMinus || 0)}`}>
                {formatUnitPlusMinus(performanceStats?.unitPlusMinus || 0)}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">Units</Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {performanceStats?.activePicks || 0}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">Active Picks</Text>
            </View>
          </View>
        </View>

        {/* Recent Performance */}
        <View className="px-6 py-6 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Performance
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className="text-gray-900 dark:text-white font-medium">Last 5 Picks</Text>
              <Text className="text-gray-600 dark:text-gray-400">
                {performanceStats?.recent5.wins}W - {performanceStats?.recent5.losses}L - {performanceStats?.recent5.pushes}P
              </Text>
            </View>
            <View className="flex-row justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className="text-gray-900 dark:text-white font-medium">Last 10 Picks</Text>
              <Text className="text-gray-600 dark:text-gray-400">
                {performanceStats?.recent10.wins}W - {performanceStats?.recent10.losses}L - {performanceStats?.recent10.pushes}P
              </Text>
            </View>
            <View className="flex-row justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className="text-gray-900 dark:text-white font-medium">Last 30 Picks</Text>
              <Text className="text-gray-600 dark:text-gray-400">
                {performanceStats?.recent30.wins}W - {performanceStats?.recent30.losses}L - {performanceStats?.recent30.pushes}P
              </Text>
            </View>
          </View>
        </View>

        {/* Performance by Sport */}
        <View className="px-6 py-6 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Performance by Sport
          </Text>
          <View className="space-y-3">
            {Object.entries(performanceStats?.bySport || {}).map(([sport, stats]) => (
              <View key={sport} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {sport}
                  </Text>
                  <Text className="text-green-600 dark:text-green-400 font-semibold">
                    {stats.winRate.toFixed(1)}%
                  </Text>
                </View>
                <Text className="text-gray-600 dark:text-gray-400">
                  {stats.picks} picks • {stats.wins} wins
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Open Picks */}
        <View className="px-6 py-6 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Open Picks
          </Text>
          <View className="space-y-3">
            {picks.slice(0, 5).map((pick) => (
              <View key={pick.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {pick.game}
                  </Text>
                  <View className="flex-row items-center">
                    {pick.isPaid && !isSubscribed && (
                      <Text className="text-yellow-600 mr-2">🔒</Text>
                    )}
                    {pick.isPaid && (
                      <Text className="text-green-600 font-semibold">
                        ${pick.price?.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
                <Text className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {pick.pick}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-500 dark:text-gray-500 text-xs">
                    {formatDate(pick.createdAt)}
                  </Text>
                  <View className={`px-2 py-1 rounded-full ${
                    pick.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    pick.status === 'won' ? 'bg-green-100 dark:bg-green-900/20' :
                    pick.status === 'lost' ? 'bg-red-100 dark:bg-red-900/20' :
                    'bg-gray-100 dark:bg-gray-900/20'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      pick.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                      pick.status === 'won' ? 'text-green-600 dark:text-green-400' :
                      pick.status === 'lost' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {pick.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews List */}
        <View className="px-6 py-6 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Reviews
          </Text>
          <View className="space-y-4">
            {reviews.map((review) => (
              <View key={review.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <View className="flex-row items-center mb-3">
                  <Image
                    source={{ uri: review.userAvatar || 'https://via.placeholder.com/40' }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-medium">
                      {review.userName}
                    </Text>
                    <View className="flex-row items-center">
                      <StarRating rating={review.rating} size="small" />
                      <Text className="text-gray-500 dark:text-gray-500 text-xs ml-2">
                        {formatDate(review.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-gray-700 dark:text-gray-300">
                  {review.comment}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        handicapperId={handicapperId as string}
        handicapperName={profile?.displayName || 'Handicapper'}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </View>
  );
}