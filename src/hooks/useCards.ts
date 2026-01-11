import { useState, useEffect, useCallback } from 'react';
import { RewardCard } from '../types';
import { StorageService } from '../services/storage';

export function useCards() {
  const [cards, setCards] = useState<RewardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedCards = await StorageService.getCards();
      setCards(loadedCards);
    } catch (err) {
      setError('Failed to load cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const addCard = useCallback(
    async (card: Omit<RewardCard, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newCard = await StorageService.saveCard(card);
        setCards(prev => [...prev, newCard]);
        return newCard;
      } catch (err) {
        setError('Failed to add card');
        throw err;
      }
    },
    []
  );

  const updateCard = useCallback(
    async (id: string, updates: Partial<RewardCard>) => {
      try {
        const updated = await StorageService.updateCard(id, updates);
        if (updated) {
          setCards(prev => prev.map(card => (card.id === id ? updated : card)));
        }
        return updated;
      } catch (err) {
        setError('Failed to update card');
        throw err;
      }
    },
    []
  );

  const deleteCard = useCallback(async (id: string) => {
    try {
      await StorageService.deleteCard(id);
      setCards(prev => prev.filter(card => card.id !== id));
      return true;
    } catch (err) {
      setError('Failed to delete card');
      return false;
    }
  }, []);

  const getCard = useCallback(
    (id: string) => {
      return cards.find(card => card.id === id) || null;
    },
    [cards]
  );

  return {
    cards,
    loading,
    error,
    addCard,
    updateCard,
    deleteCard,
    getCard,
    refreshCards: loadCards,
  };
}
