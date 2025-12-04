
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type Slot = 'Weapon' | 'Chest' | 'Head' | 'Legs' | 'Hands' | 'Ring' | 'Trinket';

export interface Enchantment {
  id: string;
  name: string;
  slot: Slot;
  rarity: Rarity;
  type: string;
  cost: string;
  trigger: string;
  flavorText: string;
  effects: string[];
  iconUrl?: string;
  author: string;
  stats: {
    likes: number;
    views: number;
    downloads: number;
  };
  createdAt: number;
  isLiked?: boolean; // Local user state
}

export const RARITY_COLORS = {
  Common: 'text-gray-400 border-gray-600 shadow-gray-500/20',
  Rare: 'text-blue-400 border-blue-500 shadow-blue-500/20',
  Epic: 'text-purple-400 border-purple-500 shadow-purple-500/20',
  Legendary: 'text-orange-400 border-orange-500 shadow-orange-500/20',
};

export const RARITY_BG = {
  Common: 'bg-gradient-to-br from-gray-900/80 to-gray-900/40',
  Rare: 'bg-gradient-to-br from-blue-900/30 to-blue-900/10',
  Epic: 'bg-gradient-to-br from-purple-900/30 to-purple-900/10',
  Legendary: 'bg-gradient-to-br from-orange-900/30 to-orange-900/10',
};

// Legacy Comic Creator Types & Constants (kept for build safety if needed, though unused)
export interface Persona {
  base64: string;
}

export interface ComicFace {
  pageIndex?: number;
  type: 'cover' | 'story' | 'back_cover';
  imageUrl?: string;
  isLoading?: boolean;
  isDecisionPage?: boolean;
  choices: string[];
  resolvedChoice?: string;
}

export const TOTAL_PAGES = 8;
export const INITIAL_PAGES = 4;
export const GATE_PAGE = 1;

export const GENRES = [
  'Superhero',
  'Fantasy',
  'Sci-Fi',
  'Cyberpunk',
  'Noir',
  'Mystery',
  'Custom'
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
];
