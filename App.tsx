
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Enchantment } from './types';
import { CreateView } from './CreateView';
import { GalleryView } from './GalleryView';
import { Plus, LayoutGrid, Heart, User, Sparkles, Info } from 'lucide-react';

// Mock Data matching the screenshots
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
        isLiked: true
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
        createdAt: 1715300000000
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
        createdAt: 1715200000000
    }
];

const App: React.FC = () => {
  const [view, setView] = useState<'browse' | 'create'>('browse');
  const [enchantments, setEnchantments] = useState<Enchantment[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem('mystic_enchantments');
    if (saved) {
      setEnchantments(JSON.parse(saved));
    } else {
      setEnchantments(MOCK_DATA);
      localStorage.setItem('mystic_enchantments', JSON.stringify(MOCK_DATA));
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = (newEnchantment: Enchantment) => {
    const updated = [newEnchantment, ...enchantments];
    setEnchantments(updated);
    localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
    setView('browse');
    showNotification("Enchantment Forged Successfully!");
  };

  const handleLike = (id: string) => {
    const updated = enchantments.map(e => {
        if (e.id === id) {
            const isLiked = !e.isLiked;
            return {
                ...e,
                isLiked,
                stats: {
                    ...e.stats,
                    likes: isLiked ? e.stats.likes + 1 : e.stats.likes - 1
                }
            };
        }
        return e;
    });
    setEnchantments(updated);
    localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
  };

  const handleView = (id: string) => {
    // Only increment view if it hasn't been done in this session/component lifecycle for simplicity
    // But since this is a global handler, we just increment. 
    // The EnchantmentCard component handles the "once per hover" logic to prevent spam.
    const updated = enchantments.map(e => 
        e.id === id ? { ...e, stats: { ...e.stats, views: e.stats.views + 1 } } : e
    );
    setEnchantments(updated);
    localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
      // Direct delete, confirmation handled in GalleryView
      const updated = enchantments.filter(e => e.id !== id);
      setEnchantments(updated);
      localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
      showNotification("Enchantment Deleted", 'info');
  };

  const handleDownloadStatUpdate = (id: string) => {
      const updated = enchantments.map(e => 
          e.id === id ? { ...e, stats: { ...e.stats, downloads: e.stats.downloads + 1 } } : e
      );
      setEnchantments(updated);
      localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
      showNotification("Downloading Lore Card...");
  };

  const favoritedCount = enchantments.filter(e => e.isLiked).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-purple-500/30 selection:text-white">
      
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('browse')}>
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="text-white fill-white/20" size={20} />
                </div>
                <div>
                    <h1 className="font-header text-2xl text-white tracking-widest leading-none group-hover:text-purple-300 transition-colors">MYSTIC</h1>
                    <div className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.3em] leading-none">Enchant Creator</div>
                </div>
            </div>

            <nav className="flex items-center gap-2 md:gap-4">
                <button 
                    onClick={() => setView('browse')}
                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center gap-2 font-bold uppercase tracking-wider text-xs transition-all border ${view === 'browse' ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                    <LayoutGrid size={16} /> <span className="hidden md:inline">Browse All</span>
                </button>
                
                <button 
                    onClick={() => setView('create')}
                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center gap-2 font-bold uppercase tracking-wider text-xs transition-all border ${view === 'create' ? 'bg-purple-600 text-white border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-purple-600/10 text-purple-400 border-purple-600/30 hover:bg-purple-600 hover:text-white'}`}
                >
                    <Plus size={16} /> <span>Create</span>
                </button>

                <div className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-500 border border-transparent">
                    <Heart size={16} className={favoritedCount > 0 ? "text-pink-500 fill-pink-500" : ""} /> 
                    <span className="text-xs font-bold uppercase tracking-wider">Favorites ({favoritedCount})</span>
                </div>
            </nav>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-900/20 rounded-lg border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-900/30 transition-all cursor-pointer">
                 <User size={16} className="text-purple-300" />
                 <span className="text-xs text-purple-200 font-bold uppercase tracking-wide">Login with Discord</span>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none fixed"></div>
         
         {view === 'create' ? (
             <CreateView onSave={handleSave} />
         ) : (
             <GalleryView 
                items={enchantments} 
                onLike={handleLike} 
                onDelete={handleDelete}
                onDownload={handleDownloadStatUpdate}
                onView={handleView}
             />
         )}
      </main>

      {/* Notification Toast */}
      {notification && (
          <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right fade-in duration-300">
              <div className={`flex items-center gap-3 px-6 py-4 rounded-lg border shadow-[0_0_30px_rgba(0,0,0,0.5)] ${notification.type === 'success' ? 'bg-green-900/90 border-green-500/50 text-green-100' : 'bg-blue-900/90 border-blue-500/50 text-blue-100'}`}>
                  {notification.type === 'success' ? <Sparkles size={20} className="text-green-400" /> : <Info size={20} className="text-blue-400" />}
                  <span className="font-header tracking-wide uppercase text-sm">{notification.message}</span>
              </div>
          </div>
      )}

    </div>
  );
};

export default App;
