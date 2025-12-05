
import { Enchantment, User, API_CONFIG } from './types';
import { calculatePowerLevel } from './utils';

// MOCK DATA for Fallback (Offline Mode)
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
    }
];

class ApiService {
    private isOnline: boolean = false;
    private baseUrl: string;

    constructor() {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            this.baseUrl = 'http://localhost:4000/api';
        } else {
            this.baseUrl = API_CONFIG.BASE_URL;
        }
        this.checkStatus();
    }

    async checkStatus() {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${this.baseUrl}/status`, { signal: controller.signal });
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

    async getEnchantments(): Promise<Enchantment[]> {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseUrl}/enchantments`);
                if (res.ok) return await res.json();
            } catch (e) {
                console.warn("API Call Failed, falling back to local");
                this.isOnline = false;
            }
        }
        
        // Fallback: LocalStorage
        const saved = localStorage.getItem('mystic_enchantments');
        let data = saved ? JSON.parse(saved) : MOCK_DATA;
        
        return data.map((item: any) => ({
            ...item,
            itemScore: item.itemScore || calculatePowerLevel(item)
        }));
    }

    async saveEnchantment(enchantment: Enchantment): Promise<void> {
        // Cache locally first
        const current = await this.getEnchantments();
        const updated = [enchantment, ...current];
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));

        if (this.isOnline) {
            try {
                await fetch(`${this.baseUrl}/enchantments`, {
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
                await fetch(`${this.baseUrl}/enchantments/${id}`, { method: 'DELETE' });
            } catch (e) { console.error("Sync to server failed"); }
        }
    }

    async toggleLike(id: string): Promise<void> {
         const current = await this.getEnchantments();
         const updated = current.map(e => {
             if (e.id === id) {
                 const isLiked = !e.isLiked;
                 return { ...e, isLiked, stats: { ...e.stats, likes: isLiked ? e.stats.likes + 1 : e.stats.likes - 1 } };
             }
             return e;
         });
         localStorage.setItem('mystic_enchantments', JSON.stringify(updated));

         if (this.isOnline) {
             try {
                 await fetch(`${this.baseUrl}/enchantments/${id}/like`, { method: 'POST' });
             } catch (e) { console.error("Sync to server failed"); }
         }
    }

    async incrementStat(id: string, stat: 'views' | 'downloads'): Promise<void> {
        const current = await this.getEnchantments();
        const updated = current.map(e => 
            e.id === id ? { ...e, stats: { ...e.stats, [stat]: e.stats[stat] + 1 } } : e
        );
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));

        if (this.isOnline) {
            try {
                 await fetch(`${this.baseUrl}/enchantments/${id}/${stat}`, { method: 'POST' });
             } catch (e) { console.error("Sync to server failed"); }
        }
    }

    async verifyDiscord(token: string): Promise<User | null> {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseUrl}/auth/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                if (res.ok) return await res.json();
            } catch(e) {
                console.warn("Server verification failed, trying client-side fallback");
            }
        }
        return null;
    }

    async exchangeDiscordCode(code: string): Promise<User | null> {
        if (this.isOnline) {
             try {
                 const res = await fetch(`${this.baseUrl}/auth/exchange`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ code })
                 });
                 if (res.ok) return await res.json();
             } catch(e) {
                 console.warn("Code exchange failed");
             }
        }
        return null;
    }
}

export const api = new ApiService();
