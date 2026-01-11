import { useState, useEffect, useCallback } from 'react';
import { UserLocation, RewardCard } from '../types';
import { LocationService } from '../services/location';

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const checkPermission = useCallback(async () => {
    const granted = await LocationService.hasPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      const granted = await LocationService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loc = await LocationService.getCurrentLocation();
      if (loc) {
        setLocation(loc);
        setHasPermission(true);
      } else {
        setError('Could not get location');
      }
      return loc;
    } catch (err) {
      setError('Failed to get location');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const findNearbyCard = useCallback(
    (cards: RewardCard[]) => {
      if (!location) return null;
      return LocationService.findNearbyCard(location, cards);
    },
    [location]
  );

  // Detect nearby card by checking the place name at the current location
  const detectNearbyCardByPlace = useCallback(
    async (cards: RewardCard[]) => {
      if (!location) return null;
      return LocationService.detectNearbyCardByPlaceName(
        location.latitude,
        location.longitude,
        cards
      );
    },
    [location]
  );

  return {
    location,
    loading,
    error,
    hasPermission,
    requestPermission,
    refreshLocation,
    findNearbyCard,
    detectNearbyCardByPlace,
  };
}
