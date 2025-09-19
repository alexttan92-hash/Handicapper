import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface StarRatingProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
}

export default function StarRating({
  rating,
  size = 'medium',
  showNumber = false,
  interactive = false,
  onRatingChange,
  maxRating = 5,
}: StarRatingProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-2xl';
      default:
        return 'text-lg';
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= rating;
      const isHalfFilled = i === Math.ceil(rating) && rating % 1 !== 0;
      
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={interactive ? () => onRatingChange?.(i) : undefined}
          disabled={!interactive}
          className={interactive ? 'mr-1' : ''}
        >
          <Text className={`${getSizeClass()} ${
            isFilled 
              ? 'text-yellow-400' 
              : isHalfFilled 
                ? 'text-yellow-300' 
                : 'text-gray-300'
          }`}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View className="flex-row items-center">
      <View className="flex-row">
        {renderStars()}
      </View>
      {showNumber && (
        <Text className="text-gray-600 dark:text-gray-400 ml-2 text-sm">
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
