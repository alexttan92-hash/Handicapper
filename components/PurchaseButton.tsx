import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { purchaseService, Product } from '../services/purchases';
import { useAuth } from '../contexts/AuthContext';

interface PurchaseButtonProps {
  product: Product;
  pickId?: string;
  onPurchaseSuccess?: (transaction: any) => void;
  onPurchaseError?: (error: Error) => void;
  style?: any;
  textStyle?: any;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  product,
  pickId,
  onPurchaseSuccess,
  onPurchaseError,
  style,
  textStyle,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to make a purchase');
      return;
    }

    if (!product) {
      Alert.alert('Error', 'Product information not available');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase ${product.title} for ${product.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              setLoading(true);
              const transaction = await purchaseService.purchaseProduct(
                product.productId,
                user.uid,
                pickId
              );
              
              Alert.alert(
                'Purchase Successful',
                `You have successfully purchased ${product.title}`
              );
              
              onPurchaseSuccess?.(transaction);
            } catch (error: any) {
              console.error('Purchase failed:', error);
              Alert.alert('Purchase Failed', error.message || 'An error occurred during purchase');
              onPurchaseError?.(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      className={`bg-blue-600 rounded-lg py-3 px-6 flex-row items-center justify-center ${
        loading ? 'opacity-50' : ''
      }`}
      style={style}
      onPress={handlePurchase}
      disabled={loading}
    >
      {loading && (
        <ActivityIndicator size="small" color="white" className="mr-2" />
      )}
      <Text className="text-white font-semibold text-center" style={textStyle}>
        {loading ? 'Processing...' : `Buy ${product.price}`}
      </Text>
    </TouchableOpacity>
  );
};

interface SubscriptionButtonProps {
  productId: string;
  title: string;
  price: string;
  description: string;
  onSubscriptionSuccess?: (transaction: any) => void;
  onSubscriptionError?: (error: Error) => void;
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  productId,
  title,
  price,
  description,
  onSubscriptionSuccess,
  onSubscriptionError,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubscription = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to subscribe');
      return;
    }

    Alert.alert(
      'Subscribe to Pro',
      `${description}\n\nPrice: ${price}\n\nThis subscription will auto-renew unless cancelled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Create a mock product for the subscription
              const product: Product = {
                productId,
                title,
                description,
                price,
                priceAmountMicros: 0, // This would be set by the actual product data
                currencyCode: 'USD',
                type: 'subscription',
              };

              const transaction = await purchaseService.purchaseProduct(
                productId,
                user.uid
              );
              
              Alert.alert(
                'Subscription Active',
                `You have successfully subscribed to ${title}`
              );
              
              onSubscriptionSuccess?.(transaction);
            } catch (error: any) {
              console.error('Subscription failed:', error);
              Alert.alert('Subscription Failed', error.message || 'An error occurred during subscription');
              onSubscriptionError?.(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      className={`bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg py-4 px-6 ${
        loading ? 'opacity-50' : ''
      }`}
      onPress={handleSubscription}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text className="text-white font-semibold text-center text-lg">
          Subscribe - {price}
        </Text>
      )}
    </TouchableOpacity>
  );
};

interface PickPurchaseButtonProps {
  pickId: string;
  pickTitle: string;
  price: string;
  handicapperName: string;
  onPurchaseSuccess?: (transaction: any) => void;
  onPurchaseError?: (error: Error) => void;
}

export const PickPurchaseButton: React.FC<PickPurchaseButtonProps> = ({
  pickId,
  pickTitle,
  price,
  handicapperName,
  onPurchaseSuccess,
  onPurchaseError,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePickPurchase = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to purchase this pick');
      return;
    }

    Alert.alert(
      'Purchase Pick',
      `Pick: ${pickTitle}\nHandicapper: ${handicapperName}\nPrice: ${price}\n\nAre you sure you want to purchase this pick?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Create a mock product for the pick
              const product: Product = {
                productId: `pick_${pickId}`,
                title: pickTitle,
                description: `Premium pick from ${handicapperName}`,
                price,
                priceAmountMicros: 0, // This would be set by the actual product data
                currencyCode: 'USD',
                type: 'inapp',
              };

              const transaction = await purchaseService.purchaseProduct(
                product.productId,
                user.uid,
                pickId
              );
              
              Alert.alert(
                'Pick Purchased',
                `You have successfully purchased ${pickTitle} from ${handicapperName}`
              );
              
              onPurchaseSuccess?.(transaction);
            } catch (error: any) {
              console.error('Pick purchase failed:', error);
              Alert.alert('Purchase Failed', error.message || 'An error occurred during purchase');
              onPurchaseError?.(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      className={`bg-green-600 rounded-lg py-3 px-6 flex-row items-center justify-center ${
        loading ? 'opacity-50' : ''
      }`}
      onPress={handlePickPurchase}
      disabled={loading}
    >
      {loading && (
        <ActivityIndicator size="small" color="white" className="mr-2" />
      )}
      <Text className="text-white font-semibold text-center">
        {loading ? 'Processing...' : `Buy Pick - ${price}`}
      </Text>
    </TouchableOpacity>
  );
};
