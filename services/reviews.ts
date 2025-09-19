import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  getDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';

export interface Review {
  id?: string;
  userId: string;
  handicapperId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
  updatedAt: string;
  purchaseId?: string; // Reference to the transaction that allowed this review
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

class ReviewService {
  private reviewsRef = collection(db, 'reviews');

  /**
   * Create a new review
   */
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const review = {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(this.reviewsRef, review);
      
      // Update handicapper's average rating
      await this.updateHandicapperRating(reviewData.handicapperId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review');
    }
  }

  /**
   * Get reviews for a specific handicapper
   */
  async getHandicapperReviews(handicapperId: string, limitCount: number = 20): Promise<Review[]> {
    try {
      const q = query(
        this.reviewsRef,
        where('handicapperId', '==', handicapperId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          userId: data.userId,
          handicapperId: data.handicapperId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          purchaseId: data.purchaseId,
        });
      });

      return reviews;
    } catch (error) {
      console.error('Error getting handicapper reviews:', error);
      throw new Error('Failed to get reviews');
    }
  }

  /**
   * Get review statistics for a handicapper
   */
  async getHandicapperReviewStats(handicapperId: string): Promise<ReviewStats> {
    try {
      const q = query(
        this.reviewsRef,
        where('handicapperId', '==', handicapperId)
      );

      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          userId: data.userId,
          handicapperId: data.handicapperId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          purchaseId: data.purchaseId,
        });
      });

      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

      return {
        averageRating,
        totalReviews: reviews.length,
        ratingDistribution,
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      throw new Error('Failed to get review statistics');
    }
  }

  /**
   * Check if user has already reviewed a handicapper
   */
  async hasUserReviewed(userId: string, handicapperId: string): Promise<boolean> {
    try {
      const q = query(
        this.reviewsRef,
        where('userId', '==', userId),
        where('handicapperId', '==', handicapperId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if user has reviewed:', error);
      return false;
    }
  }

  /**
   * Check if user has purchased from a handicapper (can review)
   */
  async canUserReview(userId: string, handicapperId: string): Promise<boolean> {
    try {
      // Check if user has any completed transactions with this handicapper
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        where('handicapperId', '==', handicapperId),
        where('status', '==', 'completed')
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if user can review:', error);
      return false;
    }
  }

  /**
   * Update handicapper's average rating in their profile
   */
  private async updateHandicapperRating(handicapperId: string): Promise<void> {
    try {
      const stats = await this.getHandicapperReviewStats(handicapperId);
      
      const userRef = doc(db, 'users', handicapperId);
      await updateDoc(userRef, {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating handicapper rating:', error);
      // Don't throw error here as it's not critical for the review creation
    }
  }

  /**
   * Get user's review for a specific handicapper
   */
  async getUserReview(userId: string, handicapperId: string): Promise<Review | null> {
    try {
      const q = query(
        this.reviewsRef,
        where('userId', '==', userId),
        where('handicapperId', '==', handicapperId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        userId: data.userId,
        handicapperId: data.handicapperId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        purchaseId: data.purchaseId,
      };
    } catch (error) {
      console.error('Error getting user review:', error);
      return null;
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(reviewId: string, rating: number, comment: string): Promise<void> {
    try {
      const reviewRef = doc(this.reviewsRef, reviewId);
      await updateDoc(reviewRef, {
        rating,
        comment,
        updatedAt: serverTimestamp(),
      });

      // Get the review to update handicapper rating
      const reviewDoc = await getDoc(reviewRef);
      if (reviewDoc.exists()) {
        const data = reviewDoc.data();
        await this.updateHandicapperRating(data.handicapperId);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Failed to update review');
    }
  }
}

export const reviewService = new ReviewService();
