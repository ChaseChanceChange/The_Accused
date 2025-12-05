
import React, { useState, useEffect } from 'react';
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { Enchantment, User, DISCORD_CLIENT_ID } from './types';
import { api } from './api';
import { CreateView } from './components/CreateView';
import { GalleryView } from './components/GalleryView';
import { CommunityView } from './components/CommunityView';
import { DiscordLogin } from './components/DiscordLogin';
import { LayoutGrid, Plus, Scroll, Wifi, WifiOff, Sparkles, Gamepad2 } from 'lucide-react';

interface AppProps {
    isActivityContext: boolean;
}

const App: React.FC<AppProps> = ({ isActivityContext }) => {
    const [view, setView] = useState<'browse' | 'create' | 'community'>('browse');
    const [enchantments, setEnchantments] = useState<Enchantment[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [serverStatus, setServerStatus] = useState(false);

    useEffect(() => {
        const init = async () => {
            // 1. Data Load
            const data = await api.getEnchantments();
            setEnchantments(data);
            const online = await api.checkStatus();
            setServerStatus(online);

            // 2. Auth Logic
            if (isActivityContext) {
                await initDiscordActivity();
            } else {
                // Check for OAuth Callback Code
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                
                if (code) {
                    await handleAuthCallback(code);
                } else {
                    await checkWebAuth();
                }
            }
        };
        init();
    }, [isActivityContext]);

    const handleAuthCallback = async (code: string) => {
        try {
            const verifiedUser = await api.exchangeDiscordCode(code);
            if (verifiedUser) {
                setUser(verifiedUser);
                localStorage.setItem('mystic_user', JSON.stringify(verifiedUser));
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (e) {
            console.error("Auth Callback Failed", e);
        } finally {
            setIsInitializing(false);
        }
    };

    const checkWebAuth = async () => {
        const saved = localStorage.getItem('mystic_user');
        if (saved) {
            setUser(JSON.parse(saved));
        }
        setIsInitializing(false);
    };

    const initDiscordActivity = async () => {
        try {
            const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
            await discordSdk.ready();
            console.log("Discord SDK Ready");

            // Attempt Auth
            const { code } = await discordSdk.commands.authorize({
                client_id: DISCORD_CLIENT_ID,
                response_type: "code",
                state: "",
                prompt: "none",
                scope: ["identify", "guilds"]
            });

            const verifiedUser = await api.exchangeDiscordCode(code);
            if (verifiedUser) {
                setUser(verifiedUser);
            } else {
                // Fallback for Activity Guest
                setUser({
                    id: 'activity-guest',
                    username: 'Discord Adventurer',
                    discriminator: '0000',
                    avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
                    isMember: false
                });
            }
        } catch (e) {
            console.error("Activity Init Error", e);
            // Even if auth fails, let them in as guest in activity
             setUser({
                id: 'activity-guest',
                username: 'Discord Adventurer',
                discriminator: '0000',
                avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
                isMember: false
            });
        } finally {
            setIsInitializing(false);
        }
    };

    const handleSave = async (e: Enchantment) => {
        await api.saveEnchantment(e);
        setEnchantments(await api.getEnchantments());
        setView('browse');
    };

    if (isInitializing) {
        return (
            <div className="fixed inset-0 bg-[#050505] flex items-center justify-center text-purple-400">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Gamepad2 size={48} />
                    <h2 className="font-header text-2xl tracking-widest">
                        INITIALIZING {isActivityContext ? 'ACTIVITY' : 'THE FORGE'}
                    </h2>
                </div>
            </div>
        );
    }

    if (!user && !isActivityContext) {
        return <DiscordLogin onLogin={setUser} onClose={() => {}} isForced={true} />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white overflow-x-hidden selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-mana-stream opacity-20 pointer-events-none z-0"></div>

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
                         </div>
                         <img src={user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 rounded-full border border-white/20" />
                    </div>
                </div>
            </header>

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
                        onDownload={async (id) => { await api.incrementStat(id, 'downloads'); }}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
