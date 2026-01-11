import * as Location from 'expo-location';
import { UserLocation, RewardCard, KNOWN_STORES } from '../types';

const DEFAULT_DETECTION_RADIUS = 150; // meters

export const LocationService = {
  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  },

  // Check if we have location permissions
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  },

  // Get current location
  async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  // Find nearby stores from user's cards based on GPS
  findNearbyCard(
    userLocation: UserLocation,
    cards: RewardCard[]
  ): RewardCard | null {
    let closestCard: RewardCard | null = null;
    let closestDistance = Infinity;

    for (const card of cards) {
      if (!card.storeLocations || card.storeLocations.length === 0) continue;

      for (const storeLoc of card.storeLocations) {
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          storeLoc.latitude,
          storeLoc.longitude
        );

        const radius = storeLoc.radius || DEFAULT_DETECTION_RADIUS;

        if (distance <= radius && distance < closestDistance) {
          closestDistance = distance;
          closestCard = card;
        }
      }
    }

    return closestCard;
  },

  // Reverse geocode to get address/place name
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const addr = results[0];
        const parts = [addr.name, addr.street, addr.city].filter(Boolean);
        return parts.join(', ');
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  },

  // Try to detect store name from address
  detectStoreFromAddress(address: string): string | null {
    const lowerAddress = address.toLowerCase();
    
    for (const [storeName, keywords] of Object.entries(KNOWN_STORES)) {
      for (const keyword of keywords) {
        if (lowerAddress.includes(keyword.toLowerCase())) {
          return storeName;
        }
      }
    }
    
    return null;
  },

  // Detect which card matches the current location by reverse geocoding
  async detectNearbyCardByPlaceName(
    latitude: number,
    longitude: number,
    cards: RewardCard[]
  ): Promise<RewardCard | null> {
    try {
      // Get place info from coordinates
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (results.length === 0) return null;

      const addr = results[0];
      // Combine all address parts to search
      const searchText = [
        addr.name,
        addr.street,
        addr.streetNumber,
        addr.district,
        addr.subregion,
      ].filter(Boolean).join(' ').toLowerCase();


      // Check each card's store name against the location
      for (const card of cards) {
        const cardName = card.storeName.toLowerCase();
        
        // Direct match - location contains the store name
        if (searchText.includes(cardName)) {
          return card;
        }

        // Check against known store keywords
        const keywords = KNOWN_STORES[card.storeName];
        if (keywords) {
          for (const keyword of keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
              return card;
            }
          }
        }

        // Fuzzy match - check if any word in the card name appears in the location
        const cardWords = cardName.split(/\s+/);
        for (const word of cardWords) {
          if (word.length > 3 && searchText.includes(word)) {
            return card;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error detecting nearby card:', error);
      return null;
    }
  },
};
