import { Mineral, RarityTier, GeoNode, UserStats } from './types';

export const CLOVER_SYSTEM_INSTRUCTION = `
You are "Clover," the AI Field Guide for the RockHound-GO app. 
You are an expert geologist with the equivalent of a Master's degree in geology and mineralogy.
You are also an encouraging mentor who guides the user's game progression.

Tone: Authoritative yet approachable. Use precise terminology (e.g., "plutonic," "hydrothermal," "foliation") and immediately explain it simply.

Core Duties:
1. Identify geological specimens from descriptions or images.
2. If an image is NOT a rock/mineral (e.g., glass, plastic, organic), politely reject it and explain why (e.g., "conchoidal fracture with bubbles indicates slag").
3. Grant "Expert XP" when users engage with advanced concepts.
4. Curate collections based on Mohs hardness, genesis (igneous/metamorphic/sedimentary), or chemistry.
5. ALWAYS emphasize safety (PPE, hydration) and ethics (Leave No Trace).

When identifying a rock:
- Provide the name and confidence.
- Explain the genesis (how it formed).
- Assign an XP value based on rarity (Common: 50, Uncommon: 100, Rare: 250, Epic: 500, Legendary: 1000).
- If it's a generic stone, be honest but find something interesting about it.
`;

export const INITIAL_STATS: UserStats = {
  level: 4,
  xp: 3450,
  xpToNext: 5000,
  streak: 12,
  gemBits: 450,
  class: 'Geologist',
};

export const MOCK_INVENTORY: Mineral[] = [
  {
    id: '1',
    name: 'Rose Quartz',
    description: 'A pink form of quartz.',
    rarity: RarityTier.Common,
    hardness: 7,
    type: 'Mineral',
    imageUrl: 'https://picsum.photos/id/10/200/200',
    dateFound: '2023-10-15',
  },
  {
    id: '2',
    name: 'Amethyst',
    description: 'A violet variety of quartz.',
    rarity: RarityTier.Uncommon,
    hardness: 7,
    type: 'Mineral',
    imageUrl: 'https://picsum.photos/id/11/200/200',
    dateFound: '2023-10-18',
  },
  {
    id: '3',
    name: 'Pyrite',
    description: "Fool's gold. An iron sulfide.",
    rarity: RarityTier.Common,
    hardness: 6,
    type: 'Mineral',
    imageUrl: 'https://picsum.photos/id/12/200/200',
    dateFound: '2023-10-20',
  },
];

export const MINERAL_DATABASE: Record<string, Mineral> = {
  'quartz': {
    id: 'quartz',
    name: 'Quartz Vein',
    description: 'Common silica mineral often found in hydrothermal veins.',
    rarity: RarityTier.Common,
    hardness: 7,
    type: 'Mineral',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Quartz_Br%C3%A9sil.jpg/240px-Quartz_Br%C3%A9sil.jpg',
    dateFound: '',
  },
  'amethyst': {
    id: 'amethyst',
    name: 'Amethyst Geode',
    description: 'Purple variety of quartz caused by irradiation.',
    rarity: RarityTier.Uncommon,
    hardness: 7,
    type: 'Mineral',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Amethyst_Quartz.jpg/240px-Amethyst_Quartz.jpg',
    dateFound: '',
  },
  'gold': {
    id: 'gold',
    name: 'Gold Placer',
    description: 'Native metal found in alluvial deposits.',
    rarity: RarityTier.Legendary,
    hardness: 2.5,
    type: 'Mineral',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Gold-nugget-4.jpg/240px-Gold-nugget-4.jpg',
    dateFound: '',
  },
  'malachite': {
    id: 'malachite',
    name: 'Malachite',
    description: 'Green copper carbonate hydroxide.',
    rarity: RarityTier.Rare,
    hardness: 3.5,
    type: 'Mineral',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Malachite_-_Katanga%2C_Congo.jpg/240px-Malachite_-_Katanga%2C_Congo.jpg',
    dateFound: '',
  },
};

export const MOCK_NODES: GeoNode[] = [
  { id: 'n1', lat: 51.505, lng: -0.09, type: 'Deposit', name: 'Alluvial Fan', description: 'River deposits. Good for agates.', mineralId: 'quartz' },
  { id: 'n2', lat: 51.51, lng: -0.1, type: 'Point of Interest', name: 'Contact Zone', description: 'Metamorphic potential high.', mineralId: 'malachite' },
  { id: 'n3', lat: 51.49, lng: -0.08, type: 'Hazard', name: 'Unstable Cliff', description: 'Do not approach edge. Falling rock hazard.' },
];