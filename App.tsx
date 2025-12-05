
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
import { api } from './api';
import { Plus, LayoutGrid, Heart, User as UserIcon, Sparkles, Info, LogOut, Loader2, AlertTriangle, Scroll, Coffee, Gamepad2, Wifi, WifiOff } from 'lucide-react';
import { DiscordSDK } from "@discord/embedded-app-sdk";

const App: React.FC = () => {
  const [view, setView] = useState<'browse' | 'create' | 'community'>('browse');
  const [enchantments, setEnchantments] = useState<Enchantment[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverStatus, setServerStatus] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // Prevents flash of login screen
  const [isInDiscordActivity, setIsInDiscordActivity] = useState(false);

  // --- Real Discord OAuth Logic (Web) ---
  const verifyDiscordToken = async (accessToken: string) => {
    setIsVerifying(true);
    try {
        console.log("Verifying token...", accessToken.substring(0, 5) + "...");
        
        // 1. Try Server Verification First (Secure Docker Backend)
        const serverUser = await api.verifyDiscord(accessToken);
        
        if (serverUser) {
            setUser(serverUser);
            localStorage.setItem('mystic_user', JSON.stringify(serverUser));
            showNotification(`Verified via Server as ${serverUser.username}!`);
            setIsVerifying(false);
            window.history.replaceState(null, '', window.location.pathname);
            return;
        }

        // 2. Fallback to Client-Side (GitHub Pages Mode)
        console.log("Server verification skipped/failed, using Client-Side validation...");
        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!userRes.ok) throw new Error("Failed to fetch user profile");
        const userData = await userRes.json();

        const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        let isMember = false;
        if (guildsRes.ok) {
            const guilds = await guildsRes.json();
            console.log("User Guilds:", guilds.map((g: any) => ({ id: g.id, name: g.name, owner: g.owner })));
            isMember = guilds.some((g: any) => g.id === REQUIRED_GUILD_ID) || 
                       guilds.some((g: any) => g.id === REQUIRED_GUILD_ID && g.owner);
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
        window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
        // Check Server Health
        const online = await api.checkStatus();
        setServerStatus(online);

        // 1. Init Data (via API bridge)
        const data = await api.getEnchantments();
        setEnchantments(data);

        // 2. DISCORD ACTIVITY CHECK
        try {
            const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
            const timeout = new Promise((_, reject) => setTimeout(() => reject("Not in Discord"), 1000));
            await Promise.race([discordSdk.ready(), timeout]);
            
            console.log("Discord Activity SDK Ready!");
            setIsInDiscordActivity(true);

            const activityUser: User = {
                id: 'activity-guest',
                username: 'Discord Adventurer',
                discriminator: '0000',
                avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
                isMember: false
            };
            setUser(activityUser);
            setIsInitializing(false);
            return;

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

  const handleSave = async (newEnchantment: Enchantment) => {
    checkPermission('create', async () => {
        const score = calculatePowerLevel(newEnchantment);
        const enchantmentWithScore = { 
            ...newEnchantment, 
            itemScore: score,
            author: user?.username || 'Unknown' 
        };
        
        await api.saveEnchantment(enchantmentWithScore);
        const updated = await api.getEnchantments();
        setEnchantments(updated);
        
        setView('browse');
        showNotification(`Enchantment Forged! Item Score: ${score}`);
    });
  };

  const handleLike = async (id: string) => {
    checkPermission('interact', async () => {
        await api.toggleLike(id);
        const updated = await api.getEnchantments();
        setEnchantments(updated);
    });
  };

  const handleView = async (id: string) => {
    await api.incrementStat(id, 'views');
    // Don't re-fetch whole list for a view to avoid jitter, just local update is fine via api.ts
  };

  const handleDelete = async (id: string) => {
      if (!user?.isMember) {
          showNotification("Only Verified Members can destroy ancient artifacts.", "error");
          return;
      }
      await api.deleteEnchantment(id);
      const updated = await api.getEnchantments();
      setEnchantments(updated);
      showNotification("Enchantment Deleted", 'info');
  };

  const handleDownloadStatUpdate = async (id: string) => {
      checkPermission('interact', async () => {
        await api.incrementStat(id, 'downloads');
        const updated = await api.getEnchantments();
        setEnchantments(updated);
        showNotification("Downloading Lore Card...");
      });
  };

  // 1. Global Loading State (Initializing or Verifying)
  if (isInitializing || isVerifying) {
      return (
          <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white relative overflow-hidden">
               {/* Magic Loading Background */}
               <div className="absolute inset-0 bg-mana-stream opacity-20"></div>
              <Loader2 size={64} className="text-purple-500 animate-spin mb-6 relative z-10" />
              <h2 className="font-header text-3xl tracking-widest animate-pulse text-purple-200 relative z-10">
                  {isVerifying ? 'Verifying Credentials' : 'Accessing Archive'}
              </h2>
              <p className="font-mono text-gray-500 mt-2 relative z-10">
                  {isVerifying ? 'Handshaking with Discord Gateway...' : 'Loading local profile...'}
              </p>
          </div>
      );
  }

  // 2. Not Logged In - Strict Gate (Skip if in Discord Activity)
  if (!user && !isInDiscordActivity) {
      return (
          <div className="min-h-screen bg-[#050505] relative flex flex-col overflow-hidden">
              {/* Animated Mana Background */}
              <div className="absolute inset-0 bg-mana-stream opacity-30"></div>
              
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
              <div className="relative z-20 flex-1 flex items-center justify-center">
                <DiscordLogin onLogin={() => {}} onClose={() => {}} isForced={true} />
              </div>
              
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
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('browse')}>
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6">
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
                {/* Server Status Indicator */}
                <div className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono uppercase tracking-wider ${serverStatus ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                    {serverStatus ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {serverStatus ? 'Server Online' : 'Offline Mode'}
                </div>

                {/* Donate Button */}
                <a 
                    href={DONATION_LINK} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black text-xs font-bold uppercase tracking-wider rounded shadow hover:shadow-[0_0_15px_rgba(234,179,8,0.6)] transform hover:-translate-y-0.5 transition-all donate-btn"
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
         <div className="absolute inset-0 bg-mana-stream opacity-[0.2] pointer-events-none fixed"></div>
         
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
