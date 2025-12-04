
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Enchantment, User, REQUIRED_GUILD_ID, DONATION_LINK, DISCORD_CLIENT_ID } from './types';
import { CreateView } from './CreateView';
import { GalleryView } from './GalleryView';
import { CommunityView } from './CommunityView';
import { DiscordLogin } from './DiscordLogin';
import { calculatePowerLevel } from './utils';
import { Plus, LayoutGrid, Heart, User as UserIcon, Sparkles, Info, LogOut, Loader2, AlertTriangle, Scroll, Coffee, Gamepad2 } from 'lucide-react';
import { DiscordSDK } from "@discord/embedded-app-sdk";

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

const App: React.FC = () => {
  const [view, setView] = useState<'browse' | 'create' | 'community'>('browse');
  const [enchantments, setEnchantments] = useState<Enchantment[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // Prevents flash of login screen
  const [isInDiscordActivity, setIsInDiscordActivity] = useState(false);

  // --- Real Discord OAuth Logic (Web) ---
  const verifyDiscordToken = async (accessToken: string) => {
    setIsVerifying(true);
    try {
        console.log("Verifying token...", accessToken.substring(0, 5) + "...");
        
        // 1. Fetch User Profile
        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!userRes.ok) throw new Error("Failed to fetch user profile");
        const userData = await userRes.json();

        // 2. Fetch Guilds to verify membership
        const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        let isMember = false;
        if (guildsRes.ok) {
            const guilds = await guildsRes.json();
            console.log("User Guilds:", guilds.map((g: any) => ({ id: g.id, name: g.name, owner: g.owner })));
            
            // Strictly check for "The Accused" server membership
            isMember = guilds.some((g: any) => g.id === REQUIRED_GUILD_ID);
            
            // Fallback for owners/admins who might have scope issues
            if (!isMember && guilds.some((g: any) => g.id === REQUIRED_GUILD_ID && g.owner)) {
                isMember = true;
            }
        } else {
            console.warn("Could not fetch guilds to verify membership.");
        }

        const appUser: User = {
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            avatar: userData.avatar 
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator || '0') % 5}.png`,
            isMember: isMember
        };

        setUser(appUser);
        localStorage.setItem('mystic_user', JSON.stringify(appUser));
        
        if (isMember) {
             showNotification(`Verified as ${appUser.username}! Welcome to the Forge.`);
        } else {
             showNotification(`Logged in as Guest.`, 'info');
        }

    } catch (error) {
        console.error("Discord verification failed:", error);
        showNotification("Verification Failed. Please try again.", 'error');
    } finally {
        setIsVerifying(false);
        // Clear the hash from the URL so we don't re-trigger
        window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
        // 1. Init Data
        const saved = localStorage.getItem('mystic_enchantments');
        let data: Enchantment[] = [];
        if (saved) {
          data = JSON.parse(saved);
        } else {
          data = MOCK_DATA;
        }

        const updatedWithScores = data.map(item => {
            if (!item.itemScore) {
                return { ...item, itemScore: calculatePowerLevel(item) };
            }
            return item;
        });

        if (JSON.stringify(updatedWithScores) !== JSON.stringify(data) || !saved) {
            setEnchantments(updatedWithScores);
            localStorage.setItem('mystic_enchantments', JSON.stringify(updatedWithScores));
        } else {
            setEnchantments(data);
        }

        // 2. DISCORD ACTIVITY CHECK
        // If we are running inside Discord, 'DiscordSDK' will successfully handshake
        try {
            const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
            // This timeout prevents hanging if we are NOT in Discord (on web)
            const timeout = new Promise((_, reject) => setTimeout(() => reject("Not in Discord"), 1000));
            
            await Promise.race([discordSdk.ready(), timeout]);
            
            console.log("Discord Activity SDK Ready!");
            setIsInDiscordActivity(true);

            // Since we are in an Activity on static hosting, we cannot securely exchange tokens 
            // without a backend. We will create a "Guest Session" for the user.
            const activityUser: User = {
                id: 'activity-guest',
                username: 'Discord Adventurer',
                discriminator: '0000',
                avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
                isMember: false // Guests in activity mode are restricted from deletion
            };
            setUser(activityUser);
            setIsInitializing(false);
            return; // Skip normal web auth check

        } catch (e) {
            console.log("Running in Web Mode (Not Embedded)");
        }
        
        // 3. Init User (Web Persistence Check)
        const savedUser = localStorage.getItem('mystic_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        // 4. Check for Discord OAuth Callback (Web)
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get('access_token');
        
        if (accessToken) {
            verifyDiscordToken(accessToken).then(() => {
                setIsInitializing(false);
            });
        } else {
            setIsInitializing(false);
        }
    };

    initializeApp();
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('mystic_user');
      setView('browse');
      showNotification('Logged out successfully.', 'info');
  };

  const checkPermission = (action: 'create' | 'interact', callback: () => void) => {
      if (!user) return; 
      callback();
  };

  const handleSave = (newEnchantment: Enchantment) => {
    checkPermission('create', () => {
        const score = calculatePowerLevel(newEnchantment);
        const enchantmentWithScore = { 
            ...newEnchantment, 
            itemScore: score,
            author: user?.username || 'Unknown' 
        };
        
        const updated = [enchantmentWithScore, ...enchantments];
        setEnchantments(updated);
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
        setView('browse');
        showNotification(`Enchantment Forged! Item Score: ${score}`);
    });
  };

  const handleLike = (id: string) => {
    checkPermission('interact', () => {
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
    });
  };

  const handleView = (id: string) => {
    const updated = enchantments.map(e => 
        e.id === id ? { ...e, stats: { ...e.stats, views: e.stats.views + 1 } } : e
    );
    setEnchantments(updated);
    localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
      if (!user?.isMember) {
          showNotification("Only Verified Members can destroy ancient artifacts.", "error");
          return;
      }
      const updated = enchantments.filter(e => e.id !== id);
      setEnchantments(updated);
      localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
      showNotification("Enchantment Deleted", 'info');
  };

  const handleDownloadStatUpdate = (id: string) => {
      checkPermission('interact', () => {
        const updated = enchantments.map(e => 
            e.id === id ? { ...e, stats: { ...e.stats, downloads: e.stats.downloads + 1 } } : e
        );
        setEnchantments(updated);
        localStorage.setItem('mystic_enchantments', JSON.stringify(updated));
        showNotification("Downloading Lore Card...");
      });
  };

  // 1. Global Loading State (Initializing or Verifying)
  if (isInitializing || isVerifying) {
      return (
          <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]"></div>
              <Loader2 size={64} className="text-purple-500 animate-spin mb-6" />
              <h2 className="font-header text-3xl tracking-widest animate-pulse text-purple-200">
                  {isVerifying ? 'Verifying Credentials' : 'Accessing Archive'}
              </h2>
              <p className="font-mono text-gray-500 mt-2">
                  {isVerifying ? 'Handshaking with Discord Gateway...' : 'Loading local profile...'}
              </p>
          </div>
      );
  }

  // 2. Not Logged In - Strict Gate (Skip if in Discord Activity)
  if (!user && !isInDiscordActivity) {
      return (
          <div className="min-h-screen bg-[#050505] relative flex flex-col">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#050505]"></div>
              <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
              
              {/* Brand Header for Landing */}
              <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
                   <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-tr from-purple-600 to-blue-600 rounded shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="font-header text-3xl text-white tracking-widest leading-none">MYSTIC</h1>
                            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.4em] leading-none text-center">Enchant Creator</div>
                        </div>
                    </div>
              </div>

              {/* Login Component (Forced) */}
              <DiscordLogin onLogin={() => {}} onClose={() => {}} isForced={true} />
              
               {notification && (
                  <div className="fixed bottom-8 right-8 z-[120] animate-in slide-in-from-right fade-in duration-300">
                      <div className={`flex items-center gap-3 px-6 py-4 rounded-lg border shadow-2xl ${notification.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-100' : 'bg-blue-900/90 border-blue-500/50 text-blue-100'}`}>
                          <AlertTriangle size={20} />
                          <span className="font-header tracking-wide uppercase text-sm">{notification.message}</span>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // 3. Authenticated App
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-purple-500/30 selection:text-white">
      
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('browse')}>
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="text-white fill-white/20" size={20} />
                </div>
                <div className="hidden sm:block">
                    <h1 className="font-header text-2xl text-white tracking-widest leading-none group-hover:text-purple-300 transition-colors">MYSTIC</h1>
                    <div className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.3em] leading-none">Enchant Creator</div>
                </div>
            </div>

            <nav className="flex items-center gap-2 md:gap-3 lg:gap-4 overflow-x-auto no-scrollbar px-2">
                <button 
                    onClick={() => setView('browse')}
                    className={`px-3 md:px-5 py-2 rounded-lg flex items-center gap-2 font-bold uppercase tracking-wider text-[10px] md:text-xs transition-all border ${view === 'browse' ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                    <LayoutGrid size={16} /> <span className="hidden md:inline">Browse</span>
                </button>
                
                <button 
                    onClick={() => setView('create')}
                    className={`px-3 md:px-5 py-2 rounded-lg flex items-center gap-2 font-bold uppercase tracking-wider text-[10px] md:text-xs transition-all border ${view === 'create' ? 'bg-purple-600 text-white border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'bg-purple-600/10 text-purple-400 border-purple-600/30 hover:bg-purple-600 hover:text-white'}`}
                >
                    <Plus size={16} /> <span>Create</span>
                </button>

                <button 
                    onClick={() => setView('community')}
                    className={`px-3 md:px-5 py-2 rounded-lg flex items-center gap-2 font-bold uppercase tracking-wider text-[10px] md:text-xs transition-all border ${view === 'community' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-transparent text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/10'}`}
                >
                    <Scroll size={16} /> <span className="hidden md:inline">Lore & Updates</span>
                </button>
            </nav>

            <div className="flex items-center gap-4">
                {/* Donate Button */}
                <a 
                    href={DONATION_LINK} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black text-xs font-bold uppercase tracking-wider rounded shadow hover:shadow-[0_0_15px_rgba(234,179,8,0.6)] transform hover:-translate-y-0.5 transition-all"
                >
                    <Heart size={14} className="fill-black" /> Donate
                </a>

                {/* Profile */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-white max-w-[100px] truncate">{user?.username || 'Guest'}</div>
                        {user?.isMember ? (
                            <div className="text-[10px] text-green-400 uppercase tracking-wide">Verified</div>
                        ) : (
                            <div className="text-[10px] text-blue-400 uppercase tracking-wide flex items-center justify-end gap-1">
                                {isInDiscordActivity ? <Gamepad2 size={8} /> : <AlertTriangle size={8} />} 
                                {isInDiscordActivity ? 'Activity' : 'Guest'}
                            </div>
                        )}
                    </div>
                    <div className="relative group">
                            <img src={user?.avatar} alt="User" className={`w-10 h-10 rounded-full border-2 cursor-pointer ${user?.isMember ? 'border-green-500' : 'border-blue-500'}`} />
                            <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-black border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <a href={DONATION_LINK} target="_blank" rel="noreferrer" className="w-full text-left px-4 py-3 text-xs text-yellow-500 hover:bg-white/5 flex items-center gap-2 lg:hidden border-b border-white/5">
                                    <Coffee size={12} /> Donate / Support
                                </a>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs text-red-400 hover:bg-white/5 flex items-center gap-2">
                                    <LogOut size={12} /> Logout
                                </button>
                            </div>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none fixed"></div>
         
         {view === 'create' ? (
             <CreateView 
                onSave={handleSave} 
                user={user} 
                onLoginRequest={() => {}} 
             />
         ) : view === 'community' ? (
             <CommunityView />
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
              <div className={`flex items-center gap-3 px-6 py-4 rounded-lg border shadow-[0_0_30px_rgba(0,0,0,0.5)] ${notification.type === 'success' ? 'bg-green-900/90 border-green-500/50 text-green-100' : notification.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-100' : 'bg-blue-900/90 border-blue-500/50 text-blue-100'}`}>
                  {notification.type === 'success' ? <Sparkles size={20} className="text-green-400" /> : notification.type === 'error' ? <AlertTriangle size={20} className="text-red-400" /> : <Info size={20} className="text-blue-400" />}
                  <span className="font-header tracking-wide uppercase text-sm">{notification.message}</span>
              </div>
          </div>
      )}

    </div>
  );
};

export default App;