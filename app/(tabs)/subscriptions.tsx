import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { purchaseService, Transaction, Subscription } from '../../services/purchases';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

export default function SubscriptionsScreen() {
  const { signOut, user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    netEarnings: 0,
    platformFees: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const createMockTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Create mock transactions for testing
      const mockTransactions = [
        {
          userId: user.uid,
          productId: 'handicapper_pro_monthly',
          productType: 'subscription',
          amount: 9.99,
          currency: 'USD',
          status: 'active',
          platformFee: 1.50,
          netAmount: 8.49,
          transactionId: 'mock_txn_001',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          userId: user.uid,
          productId: 'pick_premium_001',
          productType: 'one_time_pick',
          amount: 4.99,
          currency: 'USD',
          status: 'completed',
          platformFee: 0.75,
          netAmount: 4.24,
          transactionId: 'mock_txn_002',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: user.uid,
          productId: 'handicapper_pro_annual',
          productType: 'subscription',
          amount: 99.99,
          currency: 'USD',
          status: 'cancelled',
          platformFee: 15.00,
          netAmount: 84.99,
          transactionId: 'mock_txn_003',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          cancelledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const transactionsRef = collection(db, 'transactions');
      for (const transaction of mockTransactions) {
        await addDoc(transactionsRef, transaction);
      }

      Alert.alert('Success', 'Mock transactions created successfully!');
      await loadData(); // Reload data to show new transactions
    } catch (error) {
      console.error('Error creating mock transactions:', error);
      Alert.alert('Error', 'Failed to create mock transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Query Firestore transactions collection directly
      const transactionsRef = collection(db, 'transactions');
      const transactionsQuery = query(
        transactionsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData: Transaction[] = [];
      
      transactionsSnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          userId: data.userId,
          handicapperId: data.handicapperId,
          productId: data.productId,
          productType: data.productType,
          amount: data.amount,
          currency: data.currency || 'USD',
          status: data.status,
          platformFee: data.platformFee || 0,
          netAmount: data.netAmount || data.amount,
          transactionId: data.transactionId,
          purchaseToken: data.purchaseToken,
          receiptData: data.receiptData,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      // Separate active subscriptions and past purchases
      const activeSubscriptions = transactionsData.filter(
        t => t.productType === 'subscription' && t.status === 'active'
      );
      const pastPurchases = transactionsData.filter(
        t => t.status !== 'active' || t.productType === 'one_time_pick'
      );

      // Create subscription objects from active subscription transactions
      const subscriptionsData: Subscription[] = activeSubscriptions.map(transaction => ({
        id: transaction.id,
        userId: transaction.userId,
        productId: transaction.productId,
        startDate: transaction.createdAt,
        status: transaction.status as 'active' | 'expired' | 'cancelled',
        autoRenew: true, // Default to true, would come from store data
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      }));

      // Calculate earnings (for handicappers)
      const earningsData = {
        totalEarnings: transactionsData
          .filter(t => t.handicapperId === user.uid && t.status === 'completed')
          .reduce((sum, t) => sum + t.netAmount, 0),
        netEarnings: transactionsData
          .filter(t => t.handicapperId === user.uid && t.status === 'completed')
          .reduce((sum, t) => sum + t.netAmount, 0),
        platformFees: transactionsData
          .filter(t => t.handicapperId === user.uid && t.status === 'completed')
          .reduce((sum, t) => sum + t.platformFee, 0),
        transactionCount: transactionsData
          .filter(t => t.handicapperId === user.uid && t.status === 'completed').length,
      };

      setTransactions(pastPurchases);
      setSubscriptions(subscriptionsData);
      setEarnings(earningsData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleRestorePurchases = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const restoredTransactions = await purchaseService.restorePurchases(user.uid);
      
      if (restoredTransactions.length > 0) {
        Alert.alert(
          'Purchases Restored',
          `Successfully restored ${restoredTransactions.length} purchase(s)`
        );
        await loadData(); // Reload data to show restored purchases
      } else {
        Alert.alert('No Purchases', 'No purchases found to restore');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, productId: string) => {
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to cancel your ${productId.replace('_', ' ')} subscription?`,
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Update the transaction status in Firestore
              const transactionRef = doc(db, 'transactions', subscriptionId);
              await updateDoc(transactionRef, {
                status: 'cancelled',
                updatedAt: serverTimestamp(),
                cancelledAt: serverTimestamp(),
              });

              // In a real app, you would also call the appropriate store API:
              // - For iOS: StoreKit's cancelSubscription method
              // - For Android: Google Play Billing's cancelSubscription method
              // - For Stripe: Stripe's cancelSubscription API
              
              Alert.alert(
                'Subscription Cancelled',
                'Your subscription has been cancelled. You will continue to have access until the end of your current billing period.',
                [{ text: 'OK' }]
              );
              
              // Reload data to reflect the cancellation
              await loadData();
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 dark:bg-red-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading subscription data...</Text>
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
          Subscriptions
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 py-6">
          {/* Earnings Summary (for handicappers) */}
          {earnings.transactionCount > 0 && (
            <View className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6">
              <Text className="text-white text-lg font-semibold mb-4">Your Earnings</Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white/90">Total Earnings:</Text>
                <Text className="text-white font-bold">{formatCurrency(earnings.totalEarnings)}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white/90">Platform Fees (15%):</Text>
                <Text className="text-white font-bold">-{formatCurrency(earnings.platformFees)}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-4 border-t border-white/20 pt-2">
                <Text className="text-white font-semibold">Net Earnings:</Text>
                <Text className="text-white font-bold text-lg">{formatCurrency(earnings.netEarnings)}</Text>
              </View>
              <Text className="text-white/80 text-sm">
                Based on {earnings.transactionCount} completed transactions
              </Text>
            </View>
          )}

          {/* Active Subscriptions */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Active Subscriptions
            </Text>
            
            {subscriptions.filter(sub => sub.status === 'active').length > 0 ? (
              <View className="space-y-3">
                {subscriptions.filter(sub => sub.status === 'active').map((subscription) => (
                  <View key={subscription.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-900 dark:text-white font-medium">
                        {subscription.productId.replace('_', ' ').toUpperCase()}
                      </Text>
                      <View className={`px-2 py-1 rounded-full ${getStatusBadgeColor(subscription.status)}`}>
                        <Text className={`text-xs font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                      Started: {formatDate(subscription.startDate)}
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {subscription.autoRenew ? 'Auto-renewal enabled' : 'Auto-renewal disabled'}
                    </Text>
                    <TouchableOpacity
                      className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg py-2 px-4 self-start"
                      onPress={() => handleCancelSubscription(subscription.id, subscription.productId)}
                    >
                      <Text className="text-red-700 dark:text-red-300 font-semibold text-sm">
                        Cancel Subscription
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  No active subscriptions
                </Text>
              </View>
            )}
          </View>

          {/* Purchase History */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Purchase History
            </Text>
            
            {transactions.length > 0 ? (
              <View className="space-y-3">
                {transactions.map((transaction) => (
                  <View key={transaction.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-900 dark:text-white font-medium">
                        {transaction.productId.replace('_', ' ').toUpperCase()}
                      </Text>
                      <View className={`px-2 py-1 rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                        <Text className={`text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-600 dark:text-gray-400 text-sm">
                        {formatDate(transaction.createdAt)}
                      </Text>
                      <Text className="text-gray-900 dark:text-white font-semibold">
                        {formatCurrency(transaction.amount)}
                      </Text>
                    </View>
                    {transaction.productType === 'subscription' && (
                      <Text className="text-gray-600 dark:text-gray-400 text-xs">
                        Transaction ID: {transaction.transactionId}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  No purchase history found
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3"
              onPress={handleRestorePurchases}
            >
              <Text className="text-white text-center font-semibold">
                Restore Purchases
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-gray-300 dark:border-gray-600 rounded-lg py-3"
              onPress={() => router.push('/(drawer)/upgrade-pro')}
            >
              <Text className="text-gray-900 dark:text-white text-center font-semibold">
                Upgrade to Pro
              </Text>
            </TouchableOpacity>

            {/* Development/Testing Button */}
            <TouchableOpacity
              className="bg-yellow-600 rounded-lg py-3"
              onPress={createMockTransactions}
            >
              <Text className="text-white text-center font-semibold">
                Create Mock Data (Dev)
              </Text>
            </TouchableOpacity>

            {user && (
              <TouchableOpacity
                className="bg-red-600 rounded-lg py-3"
                onPress={handleLogout}
              >
                <Text className="text-white text-center font-semibold">
                  Logout
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
