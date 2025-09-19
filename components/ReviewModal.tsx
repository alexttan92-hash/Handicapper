import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { reviewService, Review } from '../services/reviews';
import { analyticsService } from '../services/analytics';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  handicapperId: string;
  handicapperName: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  visible,
  onClose,
  handicapperId,
  handicapperName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    if (visible && user) {
      checkReviewEligibility();
    }
  }, [visible, user, handicapperId]);

  const checkReviewEligibility = async () => {
    if (!user) return;

    try {
      setCheckingEligibility(true);
      
      const [canReviewResult, hasReviewedResult, userReview] = await Promise.all([
        reviewService.canUserReview(user.uid, handicapperId),
        reviewService.hasUserReviewed(user.uid, handicapperId),
        reviewService.getUserReview(user.uid, handicapperId),
      ]);

      setCanReview(canReviewResult);
      setHasReviewed(hasReviewedResult);
      setExistingReview(userReview);

      if (userReview) {
        setRating(userReview.rating);
        setComment(userReview.comment);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      Alert.alert('Error', 'Failed to check review eligibility');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !canReview) return;

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Comment Required', 'Please write at least 10 characters for your review');
      return;
    }

    try {
      setLoading(true);

      if (existingReview) {
        // Update existing review
        await reviewService.updateReview(existingReview.id!, rating, comment.trim());
        Alert.alert('Success', 'Your review has been updated');
      } else {
        // Create new review
        await reviewService.createReview({
          userId: user.uid,
          handicapperId,
          userName: user.displayName || user.email || 'Anonymous',
          userAvatar: user.photoURL,
          rating,
          comment: comment.trim(),
        });
        Alert.alert('Success', 'Your review has been submitted');
      }

      // Log analytics event
      analyticsService.logLeaveReview({
        handicapperId,
        rating,
        hasComment: comment.trim().length > 0,
        commentLength: comment.trim().length,
      });

      onReviewSubmitted?.();
      handleClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setExistingReview(null);
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          className="mr-2"
        >
          <Text className={`text-4xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  if (checkingEligibility) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mx-4">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 dark:text-gray-400 mt-4 text-center">
              Checking review eligibility...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!canReview) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mx-4 max-w-sm">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Cannot Review
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              You can only review handicappers you have purchased picks from.
            </Text>
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3"
              onPress={handleClose}
            >
              <Text className="text-white text-center font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white dark:bg-gray-800 rounded-lg p-6 mx-4 max-w-sm w-full">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              {hasReviewed ? 'Update Review' : 'Write a Review'}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              {handicapperName}
            </Text>

            {/* Star Rating */}
            <View className="items-center mb-6">
              <View className="flex-row items-center mb-2">
                {renderStars()}
              </View>
              <Text className="text-lg font-medium text-gray-900 dark:text-white">
                {getRatingText()}
              </Text>
            </View>

            {/* Comment */}
            <View className="mb-6">
              <Text className="text-gray-900 dark:text-white font-medium mb-2">
                Your Review
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]"
                placeholder="Share your experience with this handicapper..."
                placeholderTextColor="#9CA3AF"
                value={comment}
                onChangeText={setComment}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1 text-right">
                {comment.length}/500 characters
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-3"
                onPress={handleClose}
                disabled={loading}
              >
                <Text className="text-gray-900 dark:text-white text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 rounded-lg py-3 ${
                  rating > 0 && comment.trim().length >= 10
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                onPress={handleSubmitReview}
                disabled={loading || rating === 0 || comment.trim().length < 10}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    {hasReviewed ? 'Update' : 'Submit'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
