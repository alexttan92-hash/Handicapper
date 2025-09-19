import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notifications';

export interface Handicapper {
  id: string;
  username: string;
  displayName: string;
  avatarUri?: string;
  isVerified: boolean;
  winRate: number;
  totalPicks: number;
  followers: number;
  isHandicapperPro: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pick {
  id: string;
  handicapperId: string;
  handicapper: Handicapper;
  content: string;
  game: string;
  pick: string;
  confidence: number;
  isPaid: boolean;
  price?: number;
  isFree: boolean;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  sport: string;
  status: 'pending' | 'won' | 'lost' | 'void';
  tags?: string[];
  analysis?: string;
  reasoning?: string;
}

export interface PickInteraction {
  id: string;
  userId: string;
  pickId: string;
  type: 'like' | 'comment' | 'share' | 'purchase';
  createdAt: string;
}

class PicksService {
  async createPick(pickData: Omit<Pick, 'id' | 'handicapper' | 'createdAt' | 'updatedAt'>): Promise<Pick> {
    try {
      const now = new Date().toISOString();
      const pickRef = await addDoc(collection(db, 'picks'), {
        ...pickData,
        createdAt: now,
        updatedAt: now,
      });

      // Get the handicapper data
      const handicapper = await this.getHandicapper(pickData.handicapperId);
      
      const pick = {
        id: pickRef.id,
        ...pickData,
        handicapper,
        createdAt: now,
        updatedAt: now,
      };

      // Send notification to followers about new pick
      try {
        await notificationService.sendNewPickNotification(pickData.handicapperId, {
          handicapperName: handicapper.displayName,
          game: pickData.game,
          pick: pickData.pick,
          sport: pickData.sport,
        });
      } catch (error) {
        console.error('Error sending new pick notification:', error);
        // Don't throw error here as it's not critical for pick creation
      }

      return pick;
    } catch (error) {
      console.error('Error creating pick:', error);
      throw error;
    }
  }

  async getPicks(filters?: {
    handicapperId?: string;
    sport?: string;
    isPaid?: boolean;
    isFree?: boolean;
    limitCount?: number;
  }): Promise<Pick[]> {
    try {
      let picksQuery = query(collection(db, 'picks'));

      if (filters?.handicapperId) {
        picksQuery = query(picksQuery, where('handicapperId', '==', filters.handicapperId));
      }

      if (filters?.sport) {
        picksQuery = query(picksQuery, where('sport', '==', filters.sport));
      }

      if (filters?.isPaid !== undefined) {
        picksQuery = query(picksQuery, where('isPaid', '==', filters.isPaid));
      }

      if (filters?.isFree !== undefined) {
        picksQuery = query(picksQuery, where('isFree', '==', filters.isFree));
      }

      picksQuery = query(picksQuery, orderBy('createdAt', 'desc'));
      
      if (filters?.limitCount) {
        picksQuery = query(picksQuery, limit(filters.limitCount));
      }

      const snapshot = await getDocs(picksQuery);
      const picks: Pick[] = [];

      for (const doc of snapshot.docs) {
        const pickData = doc.data();
        const handicapper = await this.getHandicapper(pickData.handicapperId);
        
        picks.push({
          id: doc.id,
          ...pickData,
          handicapper,
        } as Pick);
      }

      return picks;
    } catch (error) {
      console.error('Error getting picks:', error);
      throw error;
    }
  }

  async getFollowingPicks(followingIds: string[], limitCount: number = 20): Promise<Pick[]> {
    try {
      if (followingIds.length === 0) {
        return [];
      }

      const picksQuery = query(
        collection(db, 'picks'),
        where('handicapperId', 'in', followingIds),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(picksQuery);
      const picks: Pick[] = [];

      for (const doc of snapshot.docs) {
        const pickData = doc.data();
        const handicapper = await this.getHandicapper(pickData.handicapperId);
        
        picks.push({
          id: doc.id,
          ...pickData,
          handicapper,
        } as Pick);
      }

      return picks;
    } catch (error) {
      console.error('Error getting following picks:', error);
      throw error;
    }
  }

  async getTopRatedPicks(limitCount: number = 20): Promise<Pick[]> {
    try {
      // Get picks from top-rated handicappers (handicapperPro = true)
      const picksQuery = query(
        collection(db, 'picks'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(picksQuery);
      const picks: Pick[] = [];

      for (const doc of snapshot.docs) {
        const pickData = doc.data();
        const handicapper = await this.getHandicapper(pickData.handicapperId);
        
        // Filter for top-rated handicappers (Pro users or high win rate)
        if (handicapper.isHandicapperPro || handicapper.winRate >= 70) {
          picks.push({
            id: doc.id,
            ...pickData,
            handicapper,
          } as Pick);
        }
      }

      return picks;
    } catch (error) {
      console.error('Error getting top rated picks:', error);
      throw error;
    }
  }

  async getHandicapper(handicapperId: string): Promise<Handicapper> {
    try {
      const handicapperDoc = await getDocs(
        query(collection(db, 'users'), where('__name__', '==', handicapperId))
      );

      if (handicapperDoc.empty) {
        // Return default handicapper data if not found
        return {
          id: handicapperId,
          username: 'unknown',
          displayName: 'Unknown Handicapper',
          isVerified: false,
          winRate: 0,
          totalPicks: 0,
          followers: 0,
          isHandicapperPro: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      const data = handicapperDoc.docs[0].data();
      return {
        id: handicapperDoc.docs[0].id,
        username: data.username || 'unknown',
        displayName: data.displayName || 'Unknown Handicapper',
        avatarUri: data.avatarUri,
        isVerified: data.isVerified || false,
        winRate: data.winRate || 0,
        totalPicks: data.totalPicks || 0,
        followers: data.followers || 0,
        isHandicapperPro: data.isHandicapperPro || false,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting handicapper:', error);
      throw error;
    }
  }

  async likePick(pickId: string, userId: string): Promise<void> {
    try {
      // Add like interaction
      await addDoc(collection(db, 'pickInteractions'), {
        userId,
        pickId,
        type: 'like',
        createdAt: new Date().toISOString(),
      });

      // Update pick likes count
      const pickRef = doc(db, 'picks', pickId);
      await updateDoc(pickRef, {
        likes: await this.getPickLikesCount(pickId),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error liking pick:', error);
      throw error;
    }
  }

  async sharePick(pickId: string, userId: string): Promise<void> {
    try {
      // Add share interaction
      await addDoc(collection(db, 'pickInteractions'), {
        userId,
        pickId,
        type: 'share',
        createdAt: new Date().toISOString(),
      });

      // Update pick shares count
      const pickRef = doc(db, 'picks', pickId);
      await updateDoc(pickRef, {
        shares: await this.getPickSharesCount(pickId),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sharing pick:', error);
      throw error;
    }
  }

  async getPickLikesCount(pickId: string): Promise<number> {
    try {
      const likesQuery = query(
        collection(db, 'pickInteractions'),
        where('pickId', '==', pickId),
        where('type', '==', 'like')
      );
      const snapshot = await getDocs(likesQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting likes count:', error);
      return 0;
    }
  }

  async getPickSharesCount(pickId: string): Promise<number> {
    try {
      const sharesQuery = query(
        collection(db, 'pickInteractions'),
        where('pickId', '==', pickId),
        where('type', '==', 'share')
      );
      const snapshot = await getDocs(sharesQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting shares count:', error);
      return 0;
    }
  }

  async updatePickStatus(pickId: string, status: 'pending' | 'won' | 'lost' | 'void'): Promise<void> {
    try {
      const pickRef = doc(db, 'picks', pickId);
      await updateDoc(pickRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating pick status:', error);
      throw error;
    }
  }

  async deletePick(pickId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'picks', pickId));
    } catch (error) {
      console.error('Error deleting pick:', error);
      throw error;
    }
  }
}

export const picksService = new PicksService();
