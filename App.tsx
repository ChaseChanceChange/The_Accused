
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Enchantment, User, DISCORD_CLIENT_ID, DONATION_LINK } from './types';
import { CreateView } from './CreateView';
import { GalleryView } from './GalleryView';
import { CommunityView } from './CommunityView';
import { DiscordLogin } from './DiscordLogin';
import { calculatePowerLevel } from './utils';
import { api } from './api';
import { Plus, LayoutGrid, Heart, Sparkles, AlertTriangle, Scroll, Gamepad2, Wifi, WifiOff, LogOut } from 'lucide-react';
import { DiscordSDK } from "@discord/embedded-app-sdk";

const App: React.FC = () => {
  const [view, setView] = useState<'browse' | 'create' | 'community'>('browse');
  const [enchantments, setEnchantments] = useState<Enchantment[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const [serverStatus, setServerStatus] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sdk, setSdk] = useState<DiscordSDK | null>(null);

  // === DISCORD ACTIVITY INITIALIZATION ===
  useEffect(() => {
    const initActivity = async () => {
        try {
            // 1. Initialize SDK
            const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
            await discordSdk.ready();
            setSdk(discordSdk);
            console.log("Discord SDK Ready");

            // 2. Authenticate User inside Activity
            try {
                // Use authorize to get the code
                const { code } = await discordSdk.commands.authorize({
                    client_id: DISCORD_CLIENT_ID,
                    response_type: "code",
                    state: "",
                    prompt: "none",
                    scope: [
                        "identify",
                        "guilds",
                    ],
                });
                
                // Try to exchange code via our Docker Backend (if running)
                const verifiedUser = await api.exchangeDiscordCode(code);
                
                if (verifiedUser) {
                    setUser(verifiedUser);
                } else {
                    // Fallback for Client-Only Activity
                    console.log("Backend exchange failed, using Activity Guest mode");
                    setUser({
                        id: 'activity-guest',
                        username: 'Discord Adventurer',
                        discriminator: '0000',
                        avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
                        isMember: false // Cannot verify membership without backend
                    });
                }
            } catch (authErr) {
                console.warn("Activity Auth Failed:", authErr);
                // Fallback
                setUser({
                    id: 'guest',
                    username: 'Guest',
                    discriminator: '0000',
                    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
                    isMember: false
                });
            }

        } catch (e) {
            console.log("Not running in Discord Activity frame", e);
            // Fallback to standard web checks
            checkWebAuth();
        } finally {
            setIsInitializing(false);
            
            // Load Data
            const data = await api.getEnchantments();
            setEnchantments(data);
            const online = await api.checkStatus();
            setServerStatus(online);
        }
    };

    initActivity();
  }, []);

  const checkWebAuth = async () => {
    const saved = localStorage.getItem('mystic_user');
    if (saved) setUser(JSON.parse(saved));
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async (newEnchantment: Enchantment) => {
      if (!user) return;
      const score = calculatePowerLevel(newEnchantment);
      const item = { ...newEnchantment, itemScore: score, author: user.username };
      await api.saveEnchantment(item);
      setEnchantments(await api.getEnchantments());
      setView('browse');
      showNotification(`Forged! GS: ${score}`);
  };

  // Render Loading
  if (isInitializing) {
      return (
          <div className="fixed inset-0 bg-[#050505] flex items-center justify-center text-purple-400">
              <div className="flex flex-col items-center gap-4 animate-pulse">
                  <Gamepad2 size={48} />
                  <h2 className="font-header text-2xl tracking-widest">CONNECTING TO DISCORD</h2>
              </div>
          </div>
      );
  }

  // Activity Mode (No Login Gate needed if we successfully detected Activity context)
  // If web mode and no user, show login gate.
  if (!sdk && !user) {
      return <DiscordLogin onLogin={() => {}} onClose={() => {}} isForced={true} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Animated Background */}
      <div className="fixed inset-0 bg-mana-stream opacity-20 pointer-events-none z-0"></div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('browse')}>
                <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded flex items-center justify-center shadow-lg shadow-purple-900/50">
                    <Sparkles size={16} />
                </div>
                <h1 className="font-header text-xl tracking-widest hidden sm:block">MYSTIC</h1>
            </div>

            <nav className="flex gap-2">
                <button onClick={() => setView('browse')} className={`p-2 rounded-lg transition-all ${view === 'browse' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
                    <LayoutGrid size={20} />
                </button>
                <button onClick={() => setView('create')} className={`p-2 rounded-lg transition-all ${view === 'create' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-purple-400'}`}>
                    <Plus size={20} />
                </button>
                <button onClick={() => setView('community')} className={`p-2 rounded-lg transition-all ${view === 'community' ? 'bg-yellow-600/20 text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}>
                    <Scroll size={20} />
                </button>
            </nav>

            <div className="flex items-center gap-3">
                 <div className={`hidden md:flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-1 rounded border ${serverStatus ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                    {serverStatus ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {serverStatus ? 'Online' : 'Offline'}
                 </div>
                 <img src={user?.avatar} className="w-8 h-8 rounded-full border border-white/20" />
            </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 p-4 pb-24">
         {view === 'create' ? (
             <CreateView onSave={handleSave} user={user} onLoginRequest={() => {}} />
         ) : view === 'community' ? (
             <CommunityView />
         ) : (
             <GalleryView 
                items={enchantments} 
                onLike={async (id) => { await api.toggleLike(id); setEnchantments(await api.getEnchantments()); }} 
                onDelete={async (id) => { await api.deleteEnchantment(id); setEnchantments(await api.getEnchantments()); }}
                onDownload={async (id) => { await api.incrementStat(id, 'downloads'); setEnchantments(await api.getEnchantments()); }}
                onView={async (id) => api.incrementStat(id, 'views')}
             />
         )}
      </main>

      {/* Notifications */}
      {notification && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 w-full max-w-sm px-4">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md ${notification.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-100' : 'bg-blue-900/90 border-blue-500/50 text-blue-100'}`}>
                  <Sparkles size={16} />
                  <span className="font-header text-xs tracking-wide uppercase">{notification.message}</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
