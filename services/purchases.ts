import * as InAppPurchases from 'expo-in-app-purchases';
import { doc, setDoc, getDocs, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { analyticsService } from './analytics';
import { notificationService } from './notifications';

export interface Transaction {
  id: string;
  userId: string;
  pickId?: string;
  subscriptionId?: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  productType: 'subscription' | 'pick' | 'premium_pack';
  productId: string;
  transactionId: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
  platform: 'ios' | 'android';
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  currencyCode: string;
  type: 'subscription' | 'inapp';
}

const PLATFORM_FEE_PERCENTAGE = 0.15; // 15%

class PurchaseService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await InAppPurchases.connectAsync();
      this.isInitialized = true;
      console.log('In-app purchases initialized');
    } catch (error) {
      console.error('Failed to initialize in-app purchases:', error);
      throw error;
    }
  }

  async getProducts(productIds: string[]): Promise<Product[]> {
    await this.initialize();
    
    try {
      const products = await InAppPurchases.getProductsAsync(productIds);
      return products.map(product => ({
        productId: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        priceAmountMicros: product.priceAmountMicros,
        currencyCode: product.currencyCode,
        type: product.type as 'subscription' | 'inapp',
      }));
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  }

  async purchaseProduct(productId: string, userId: string, pickId?: string): Promise<Transaction> {
    await this.initialize();
    
    try {
      const result = await InAppPurchases.purchaseProductAsync(productId);
      
      if (result.responseCode === InAppPurchases.IAPResponseCode.OK) {
        // Calculate amounts
        const amount = result.results?.[0]?.priceAmountMicros ? 
          result.results[0].priceAmountMicros / 1000000 : 0;
        const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
        const netAmount = amount - platformFee;

        // Create transaction record
        const transaction: Omit<Transaction, 'id'> = {
          userId,
          pickId,
          amount,
          platformFee,
          netAmount,
          status: 'completed',
          productType: productId.includes('subscription') ? 'subscription' : 'pick',
          productId,
          transactionId: result.results?.[0]?.transactionId || '',
          receipt: result.results?.[0]?.transactionReceipt || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          platform: 'ios', // This should be determined by the platform
        };

        // Save to Firestore
        const transactionRef = doc(collection(db, 'transactions'));
        const transactionWithId = { ...transaction, id: transactionRef.id };
        await setDoc(transactionRef, transactionWithId);

        // Log analytics event
        analyticsService.logPurchase({
          transactionId: transactionWithId.transactionId,
          productId: transactionWithId.productId,
          productType: transactionWithId.productType,
          amount: transactionWithId.amount,
          currency: 'USD', // This should be determined by the platform
        });

        return transactionWithId;
      } else {
        throw new Error(`Purchase failed with code: ${result.responseCode}`);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(userId: string): Promise<Transaction[]> {
    await this.initialize();
    
    try {
      const result = await InAppPurchases.getPurchaseHistoryAsync();
      const restoredTransactions: Transaction[] = [];

      if (result.responseCode === InAppPurchases.IAPResponseCode.OK) {
        for (const purchase of result.results || []) {
          // Check if transaction already exists
          const existingTransactions = await getDocs(
            query(
              collection(db, 'transactions'),
              where('transactionId', '==', purchase.transactionId),
              where('userId', '==', userId)
            )
          );

          if (existingTransactions.empty) {
            // Create new transaction record for restored purchase
            const amount = purchase.priceAmountMicros / 1000000;
            const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
            const netAmount = amount - platformFee;

            const transaction: Omit<Transaction, 'id'> = {
              userId,
              amount,
              platformFee,
              netAmount,
              status: 'completed',
              productType: purchase.productId.includes('subscription') ? 'subscription' : 'pick',
              productId: purchase.productId,
              transactionId: purchase.transactionId,
              receipt: purchase.transactionReceipt,
              createdAt: purchase.purchaseTime ? new Date(purchase.purchaseTime).toISOString() : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              platform: 'ios',
            };

            const transactionRef = doc(collection(db, 'transactions'));
            const transactionWithId = { ...transaction, id: transactionRef.id };
            await setDoc(transactionRef, transactionWithId);
            restoredTransactions.push(transactionWithId);
          }
        }
      }

      return restoredTransactions;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  async getUserTransactions(userId: string, limitCount: number = 50): Promise<Transaction[]> {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(transactionsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      console.error('Failed to get user transactions:', error);
      throw error;
    }
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const subscriptionsQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(subscriptionsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
    } catch (error) {
      console.error('Failed to get user subscriptions:', error);
      throw error;
    }
  }

  async getHandicapperEarnings(userId: string): Promise<{
    totalEarnings: number;
    netEarnings: number;
    platformFees: number;
    transactionCount: number;
  }> {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(transactionsQuery);
      let totalEarnings = 0;
      let platformFees = 0;

      snapshot.docs.forEach(doc => {
        const transaction = doc.data() as Transaction;
        totalEarnings += transaction.amount;
        platformFees += transaction.platformFee;
      });

      return {
        totalEarnings,
        netEarnings: totalEarnings - platformFees,
        platformFees,
        transactionCount: snapshot.docs.length,
      };
    } catch (error) {
      console.error('Failed to get handicapper earnings:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.isInitialized) {
      await InAppPurchases.disconnectAsync();
      this.isInitialized = false;
    }
  }
}

export const purchaseService = new PurchaseService();
