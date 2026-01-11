import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardCard } from '../types';

const CARDS_STORAGE_KEY = '@all_rewards_cards';

export const StorageService = {
  // Get all reward cards
  async getCards(): Promise<RewardCard[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error reading cards:', error);
      return [];
    }
  },

  // Save a new reward card
  async saveCard(card: Omit<RewardCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<RewardCard> {
    try {
      const cards = await this.getCards();
      const newCard: RewardCard = {
        ...card,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      cards.push(newCard);
      await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
      return newCard;
    } catch (error) {
      console.error('Error saving card:', error);
      throw error;
    }
  },

  // Update an existing card
  async updateCard(id: string, updates: Partial<RewardCard>): Promise<RewardCard | null> {
    try {
      const cards = await this.getCards();
      const index = cards.findIndex(card => card.id === id);
      if (index === -1) return null;

      cards[index] = {
        ...cards[index],
        ...updates,
        updatedAt: Date.now(),
      };
      await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
      return cards[index];
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  // Delete a card
  async deleteCard(id: string): Promise<boolean> {
    try {
      const cards = await this.getCards();
      const filtered = cards.filter(card => card.id !== id);
      await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  },

  // Get a single card by ID
  async getCard(id: string): Promise<RewardCard | null> {
    try {
      const cards = await this.getCards();
      return cards.find(card => card.id === id) || null;
    } catch (error) {
      console.error('Error getting card:', error);
      return null;
    }
  },
};
