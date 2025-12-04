
import { Enchantment, User, API_CONFIG } from './types';
import { calculatePowerLevel } from './utils';

// MOCK DATA for Fallback
const MOCK_DATA: Enchantment[] = [
    {
        id: '1',
        name: 'The Beast Within',
        slot: 'Weapon',
        rarity: 'Legendary',
        type: 'On Use',
        cost: '100 Energy',
        trigger: 'Active ability',
        flavorText: '+Chance to summon the beast within last 10 seconds. 15% proc chance to unleash devastating attacks.',
        effects: [
            '+50% chance to unleash the beast within special attacks', 
            'Grant 200 Strength', 
            'Your attacks cleave for 50% damage'
        ],
        iconUrl: 'https://images.unsplash.com/photo-1633355209376-8575087f941f?q=80&w=400&auto=format&fit=crop',
        author: 'Anonymous',
        stats: { likes: 365, views: 1200, downloads: 45 },
        createdAt: 1715400000000,
        isLiked: true,
        itemScore: 450
    },
    {
        id: '2',
        name: 'Windfury Legacy',
        slot: 'Weapon',
        rarity: 'Legendary',
        type: 'Proc Chance',
        cost: 'Passive',
        trigger: 'On Melee Hit',
        flavorText: 'The wind guides your strikes with furious anger.',
        effects: [
            '15% chance to grant 2 extra attacks', 
            'Increases movement speed by 5%', 
            'Your next stormstrike deals 20% more damage'
        ],
        iconUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=400&auto=format&fit=crop',
        author: 'seed',
        stats: { likes: 19, views: 240, downloads: 2 },
        createdAt: 1715300000000,
        itemScore: 380
    },
    {
        id: '3',
        name: 'Void Infusion',
        slot: 'Chest',
        rarity: 'Epic',
        type: 'Passive Effect',
        cost: '500 Mana',
        trigger: 'Always Active',
        flavorText: 'The void stares back, and it grants you power.',
        effects: [
            'Increases maximum Mana by 800', 
            'Your shadow spells deal 10% increased damage', 
            'Reduces physical damage taken by 5%'
        ],
        iconUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=400&auto=format&fit=crop',
        author: 'seed',
        stats: { likes: 454, views: 3000, downloads: 890 },
        createdAt: 1715200000000,
        itemScore: 320
    }
];

class ApiService {
    private isOnline: boolean = false;

    constructor() {
        this.checkStatus();
    }

    async checkStatus() {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${API_CONFIG.BASE_URL}/status`, { signal: controller.signal });
            clearTimeout(id);
            this.isOnline = res.ok;
            return this.isOnline;
        } catch (e) {
            this.isOnline = false;
            return false;
        }
    }

    getIsOnline() {
        return this.isOnline;
    }

    // --- Enchantments ---

    async getEnchantments(): Promise<Enchantment[]> {
        if (this.isOnline) {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/enchantments`);
                if (res.ok) return await res.json();
            } catch (e) {
                console.warn("API Call Failed, falling back to local");
                this.isOnline = false;
            }
        }
        
        // Fallback: LocalStorage
        const saved = localStorage.getItem('mystic_enchantments');
        let data = saved ? JSON.parse(saved) : MOCK_DATA;
        
        // Ensure scores
        return data.map((item: any) => ({
            ...item,
            itemScore: item.itemScore || calculatePowerLevel(item)
        }));
    }

    async saveEnchantment(enchantment: Enchantment): Promise<void> {
        // Always save to local storage as cache
        const current = await this.getEnchantments();
        const updated = [enchantment, ...current];
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));

        if (this.isOnline) {
            try {
                await fetch(`${API_CONFIG.BASE_URL}/enchantments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(enchantment)
                });
            } catch (e) { console.error("Sync to server failed"); }
        }
    }

    async deleteEnchantment(id: string): Promise<void> {
        const current = await this.getEnchantments();
        const updated = current.filter(e => e.id !== id);
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));

        if (this.isOnline) {
             try {
                await fetch(`${API_CONFIG.BASE_URL}/enchantments/${id}`, { method: 'DELETE' });
            } catch (e) { console.error("Sync to server failed"); }
        }
    }

    async toggleLike(id: string): Promise<void> {
         // Optimistic Update Local
         const current = await this.getEnchantments();
         const updated = current.map(e => {
             if (e.id === id) {
                 const isLiked = !e.isLiked;
                 return {
                     ...e,
                     isLiked,
                     stats: { ...e.stats, likes: isLiked ? e.stats.likes + 1 : e.stats.likes - 1 }
                 };
             }
             return e;
         });
         localStorage.setItem('mystic_enchantments', JSON.stringify(updated));

         if (this.isOnline) {
             try {
                 await fetch(`${API_CONFIG.BASE_URL}/enchantments/${id}/like`, { method: 'POST' });
             } catch (e) { console.error("Sync to server failed"); }
         }
    }

    async incrementStat(id: string, stat: 'views' | 'downloads'): Promise<void> {
        // Local update
        const current = await this.getEnchantments();
        const updated = current.map(e => 
            e.id === id ? { ...e, stats: { ...e.stats, [stat]: e.stats[stat] + 1 } } : e
        );
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));

        if (this.isOnline) {
            try {
                 await fetch(`${API_CONFIG.BASE_URL}/enchantments/${id}/${stat}`, { method: 'POST' });
             } catch (e) { console.error("Sync to server failed"); }
        }
    }

    // --- Auth ---

    async verifyDiscord(token: string): Promise<User | null> {
        if (this.isOnline) {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/auth/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                if (res.ok) return await res.json();
            } catch(e) {
                console.warn("Server verification failed, trying client-side fallback");
            }
        }
        return null; // Fallback handled by App.tsx
    }
}

export const api = new ApiService();
