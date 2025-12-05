
import { Enchantment, User, API_CONFIG } from './types';

const MOCK_DATA: Enchantment[] = [
    {
        id: '1',
        name: 'The Beast Within',
        slot: 'Weapon',
        rarity: 'Legendary',
        type: 'On Use',
        cost: '100 Energy',
        trigger: 'Active ability',
        flavorText: 'Unleash the beast.',
        effects: ['Grant 200 Strength'],
        iconUrl: '',
        author: 'Anonymous',
        stats: { likes: 365, views: 1200, downloads: 45 },
        createdAt: 1715400000000,
        isLiked: true,
        itemScore: 450
    }
];

class ApiService {
    private isOnline: boolean = false;
    private baseUrl: string = API_CONFIG.BASE_URL;

    constructor() { this.checkStatus(); }

    async checkStatus() {
        try {
            const res = await fetch(`${this.baseUrl}/status`);
            this.isOnline = res.ok;
            return this.isOnline;
        } catch (e) { this.isOnline = false; return false; }
    }

    async getEnchantments(): Promise<Enchantment[]> {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseUrl}/enchantments`);
                if (res.ok) return await res.json();
            } catch (e) {}
        }
        const saved = localStorage.getItem('mystic_enchantments');
        return saved ? JSON.parse(saved) : MOCK_DATA;
    }

    async saveEnchantment(e: Enchantment) {
        const current = await this.getEnchantments();
        localStorage.setItem('mystic_enchantments', JSON.stringify([e, ...current]));
    }

    async toggleLike(id: string) {
        const current = await this.getEnchantments();
        const updated = current.map(e => e.id === id ? { ...e, isLiked: !e.isLiked, stats: { ...e.stats, likes: e.isLiked ? e.stats.likes - 1 : e.stats.likes + 1 } } : e);
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
    }

    async deleteEnchantment(id: string) {
        const current = await this.getEnchantments();
        localStorage.setItem('mystic_enchantments', JSON.stringify(current.filter(e => e.id !== id)));
    }

    async incrementStat(id: string, stat: 'views' | 'downloads') {
        const current = await this.getEnchantments();
        const updated = current.map(e => e.id === id ? { ...e, stats: { ...e.stats, [stat]: e.stats[stat] + 1 } } : e);
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
    }
    
    async exchangeDiscordCode(code: string): Promise<User | null> {
        // If Backend is Online, perform secure exchange
        if (this.isOnline) {
             try {
                const res = await fetch(`${this.baseUrl}/auth/exchange`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                if (res.ok) return await res.json();
             } catch (e) {
                 console.error("Backend token exchange failed", e);
             }
        }

        // Fallback (for static demo sites): Simulate a verified user locally
        // WARNING: In a real app, never do verification client-side for security.
        console.warn("Using simulated login for static demo.");
        return {
            id: 'demo-user',
            username: 'Mystic Traveler',
            discriminator: '1234',
            avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
            isMember: true 
        };
    }
}
export const api = new ApiService();
