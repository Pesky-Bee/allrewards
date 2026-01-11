export interface RewardCard {
  id: string;
  storeName: string;
  imageUri: string;
  createdAt: number;
  updatedAt: number;
  // Store location data for GPS matching
  storeLocations?: StoreLocation[];
}

export interface StoreLocation {
  latitude: number;
  longitude: number;
  address?: string;
  radius?: number; // Detection radius in meters (default 100m)
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

// Known store chains for auto-detection
export const KNOWN_STORES: Record<string, string[]> = {
  'Lidl': ['lidl'],
  'Tesco': ['tesco'],
  'Sainsbury\'s': ['sainsbury'],
  'Asda': ['asda'],
  'Morrisons': ['morrisons'],
  'Aldi': ['aldi'],
  'Waitrose': ['waitrose'],
  'Co-op': ['co-op', 'coop'],
  'M&S': ['marks', 'spencer', 'm&s'],
  'Iceland': ['iceland'],
  'Boots': ['boots'],
  'Superdrug': ['superdrug'],
  'Holland & Barrett': ['holland', 'barrett'],
  'Costa': ['costa'],
  'Starbucks': ['starbucks'],
  'Nando\'s': ['nandos', 'nando'],
  'Greggs': ['greggs'],
  'Subway': ['subway'],
  'McDonald\'s': ['mcdonald', 'mcdonalds'],
  'KFC': ['kfc'],
};
