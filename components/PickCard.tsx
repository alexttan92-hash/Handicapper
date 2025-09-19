import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import StarRating from './StarRating';

interface PickCardProps {
  pick: {
    id: string;
    handicapperId: string;
    handicapperName: string;
    handicapperAvatar?: string;
    handicapperRating?: number;
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
  };
  isSubscribed?: boolean;
  onPress?: () => void;
}

export default function PickCard({ pick, isSubscribed = false, onPress }: PickCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'text-green-600 dark:text-green-400';
      case 'lost':
        return 'text-red-600 dark:text-red-400';
      case 'push':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'lost':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'push':
        return 'bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/20';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700"
      onPress={onPress}
    >
      {/* Handicapper Header */}
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: pick.handicapperAvatar || 'https://via.placeholder.com/40' }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-white font-semibold">
            {pick.handicapperName}
          </Text>
          {pick.handicapperRating && (
            <StarRating rating={pick.handicapperRating} size="small" />
          )}
        </View>
        <View className="items-end">
          {pick.isPaid && !isSubscribed && (
            <Text className="text-yellow-600 text-lg mb-1">🔒</Text>
          )}
          {pick.isPaid && (
            <Text className="text-green-600 font-semibold text-sm">
              ${pick.price?.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {/* Game and Pick */}
      <View className="mb-3">
        <Text className="text-gray-900 dark:text-white font-medium mb-1">
          {pick.game}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          {pick.pick}
        </Text>
      </View>

      {/* Pick Content */}
      <Text className="text-gray-700 dark:text-gray-300 text-sm mb-3" numberOfLines={2}>
        {pick.content}
      </Text>

      {/* Footer */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-gray-500 dark:text-gray-500 text-xs">
            {formatDate(pick.createdAt)}
          </Text>
          <Text className="text-gray-500 dark:text-gray-500 text-xs mx-2">•</Text>
          <Text className="text-gray-500 dark:text-gray-500 text-xs">
            {pick.sport}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${getStatusBadgeColor(pick.status)}`}>
          <Text className={`text-xs font-medium ${getStatusColor(pick.status)}`}>
            {pick.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
