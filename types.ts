export enum RarityTier {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary',
}

export interface Mineral {
  id: string;
  name: string;
  description: string;
  rarity: RarityTier;
  hardness: number;
  type: 'Igneous' | 'Sedimentary' | 'Metamorphic' | 'Mineral';
  imageUrl: string;
  dateFound: string;
  confidence?: number;
  cloverComment?: string;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  gemBits: number;
  class: 'Prospector' | 'Lapidary' | 'Geologist';
}

export interface GeoNode {
  id: string;
  lat: number;
  lng: number;
  type: 'Deposit' | 'Point of Interest' | 'Hazard';
  name: string;
  description: string;
  mineralId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface IdentificationResult {
  isRock: boolean;
  name: string;
  scientificName: string;
  confidence: number;
  description: string;
  geologicalOrigin: string;
  cloverComment: string;
  xpValue: number;
}