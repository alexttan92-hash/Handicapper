import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { app } from '../config/firebase';

// Initialize Analytics
let analytics: any = null;

try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Firebase Analytics not available:', error);
}

export interface AnalyticsEvent {
  name: string;
  parameters?: { [key: string]: any };
}

class AnalyticsService {
  private isEnabled = true;

  /**
   * Set user ID for analytics
   */
  setUserId(userId: string) {
    if (!analytics || !this.isEnabled) return;
    
    try {
      setUserId(analytics, userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: { [key: string]: string | number | boolean }) {
    if (!analytics || !this.isEnabled) return;
    
    try {
      setUserProperties(analytics, properties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  /**
   * Log a custom event
   */
  logEvent(eventName: string, parameters?: { [key: string]: any }) {
    if (!analytics || !this.isEnabled) return;
    
    try {
      logEvent(analytics, eventName, parameters);
      console.log('Analytics event logged:', eventName, parameters);
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }

  /**
   * Log sign up event
   */
  logSignUp(method: string, userId: string) {
    this.logEvent('sign_up', {
      method: method, // 'email', 'google', 'apple', 'phone'
      user_id: userId,
    });
  }

  /**
   * Log login event
   */
  logLogin(method: string, userId: string) {
    this.logEvent('login', {
      method: method, // 'email', 'google', 'apple', 'phone'
      user_id: userId,
    });
  }

  /**
   * Log post pick event
   */
  logPostPick(pickData: {
    handicapperId: string;
    sport: string;
    isPaid: boolean;
    price?: number;
    confidence: number;
    pickType: string; // 'moneyline', 'spread', 'total'
  }) {
    this.logEvent('post_pick', {
      handicapper_id: pickData.handicapperId,
      sport: pickData.sport,
      is_paid: pickData.isPaid,
      price: pickData.price || 0,
      confidence: pickData.confidence,
      pick_type: pickData.pickType,
    });
  }

  /**
   * Log purchase event
   */
  logPurchase(purchaseData: {
    transactionId: string;
    productId: string;
    productType: 'subscription' | 'one_time_pick';
    amount: number;
    currency: string;
    handicapperId?: string;
  }) {
    this.logEvent('purchase', {
      transaction_id: purchaseData.transactionId,
      product_id: purchaseData.productId,
      product_type: purchaseData.productType,
      value: purchaseData.amount,
      currency: purchaseData.currency,
      handicapper_id: purchaseData.handicapperId,
    });
  }

  /**
   * Log subscribe event
   */
  logSubscribe(subscriptionData: {
    handicapperId: string;
    subscriptionType: string; // 'monthly', 'annual'
    amount: number;
    currency: string;
  }) {
    this.logEvent('subscribe', {
      handicapper_id: subscriptionData.handicapperId,
      subscription_type: subscriptionData.subscriptionType,
      value: subscriptionData.amount,
      currency: subscriptionData.currency,
    });
  }

  /**
   * Log leave review event
   */
  logLeaveReview(reviewData: {
    handicapperId: string;
    rating: number;
    hasComment: boolean;
    commentLength: number;
  }) {
    this.logEvent('leave_review', {
      handicapper_id: reviewData.handicapperId,
      rating: reviewData.rating,
      has_comment: reviewData.hasComment,
      comment_length: reviewData.commentLength,
    });
  }

  /**
   * Log screen view event
   */
  logScreenView(screenName: string, screenClass?: string) {
    this.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  /**
   * Log search event
   */
  logSearch(searchTerm: string, resultsCount: number) {
    this.logEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }

  /**
   * Log share event
   */
  logShare(contentType: string, itemId: string, method: string) {
    this.logEvent('share', {
      content_type: contentType,
      item_id: itemId,
      method: method,
    });
  }

  /**
   * Log follow event
   */
  logFollow(handicapperId: string, action: 'follow' | 'unfollow') {
    this.logEvent('follow', {
      handicapper_id: handicapperId,
      action: action,
    });
  }

  /**
   * Log chat event
   */
  logChat(action: 'start_chat' | 'send_message', handicapperId: string) {
    this.logEvent('chat', {
      action: action,
      handicapper_id: handicapperId,
    });
  }

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Check if analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.isEnabled && analytics !== null;
  }
}

export const analyticsService = new AnalyticsService();
