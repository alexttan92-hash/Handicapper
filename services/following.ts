import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  addDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Following {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

class FollowingService {
  async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      // Check if already following
      const existingFollow = await this.isFollowing(followerId, followingId);
      if (existingFollow) {
        throw new Error('Already following this user');
      }

      // Add follow relationship
      await addDoc(collection(db, 'following'), {
        followerId,
        followingId,
        createdAt: new Date().toISOString(),
      });

      // Update follower count for the followed user
      await this.updateFollowerCount(followingId, 1);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      // Find and delete the follow relationship
      const followQuery = query(
        collection(db, 'following'),
        where('followerId', '==', followerId),
        where('followingId', '==', followingId)
      );

      const snapshot = await getDocs(followQuery);
      
      if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
        
        // Update follower count for the unfollowed user
        await this.updateFollowerCount(followingId, -1);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const followQuery = query(
        collection(db, 'following'),
        where('followerId', '==', followerId),
        where('followingId', '==', followingId)
      );

      const snapshot = await getDocs(followQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  async getFollowing(userId: string): Promise<string[]> {
    try {
      const followingQuery = query(
        collection(db, 'following'),
        where('followerId', '==', userId)
      );

      const snapshot = await getDocs(followingQuery);
      return snapshot.docs.map(doc => doc.data().followingId);
    } catch (error) {
      console.error('Error getting following list:', error);
      return [];
    }
  }

  async getFollowers(userId: string): Promise<string[]> {
    try {
      const followersQuery = query(
        collection(db, 'following'),
        where('followingId', '==', userId)
      );

      const snapshot = await getDocs(followersQuery);
      return snapshot.docs.map(doc => doc.data().followerId);
    } catch (error) {
      console.error('Error getting followers list:', error);
      return [];
    }
  }

  async getFollowerCount(userId: string): Promise<number> {
    try {
      const followersQuery = query(
        collection(db, 'following'),
        where('followingId', '==', userId)
      );

      const snapshot = await getDocs(followersQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting follower count:', error);
      return 0;
    }
  }

  async getFollowingCount(userId: string): Promise<number> {
    try {
      const followingQuery = query(
        collection(db, 'following'),
        where('followerId', '==', userId)
      );

      const snapshot = await getDocs(followingQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  }

  private async updateFollowerCount(userId: string, increment: number): Promise<void> {
    try {
      // This would typically use a transaction to ensure atomicity
      // For now, we'll just update the user document
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
      
      if (!userDoc.empty) {
        const currentFollowers = userDoc.docs[0].data().followers || 0;
        await setDoc(userRef, {
          followers: Math.max(0, currentFollowers + increment),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating follower count:', error);
    }
  }

  async getSuggestedHandicappers(userId: string, limitCount: number = 10): Promise<string[]> {
    try {
      // Get top-rated handicappers that the user is not following
      const following = await this.getFollowing(userId);
      
      // Query for Pro handicappers with high win rates
      const usersQuery = query(
        collection(db, 'users'),
        where('isHandicapperPro', '==', true)
      );

      const snapshot = await getDocs(usersQuery);
      const suggestedIds: string[] = [];

      for (const doc of snapshot.docs) {
        const userData = doc.data();
        const handicapperId = doc.id;
        
        // Skip if already following or if it's the user themselves
        if (!following.includes(handicapperId) && handicapperId !== userId) {
          suggestedIds.push(handicapperId);
          
          if (suggestedIds.length >= limitCount) {
            break;
          }
        }
      }

      return suggestedIds;
    } catch (error) {
      console.error('Error getting suggested handicappers:', error);
      return [];
    }
  }
}

export const followingService = new FollowingService();
