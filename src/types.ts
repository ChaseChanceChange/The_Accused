export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type Slot = 'Weapon' | 'Chest' | 'Head' | 'Legs' | 'Hands' | 'Ring' | 'Trinket';

export const DISCORD_CLIENT_ID = '1444798601032372431';
export const REQUIRED_GUILD_ID = '1408571660994482298'; 
export const DISCORD_INVITE_LINK = 'https://discord.gg/MGZUeqhB4V';

export const API_CONFIG = {
    BASE_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:4000/api' 
        : 'https://the-accused-api.onrender.com/api', // Update with real production API
    TIMEOUT: 5000
};

export const DONATION_LINK = 'https://www.paypal.com/paypalme/MilliesTipBowl?locale.x=en_IE';

export interface User {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  isMember: boolean; 
}

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
  itemScore?: number;
  stats: {
    likes: number;
    views: number;
    downloads: number;
  };
  createdAt: number;
  isLiked?: boolean;
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