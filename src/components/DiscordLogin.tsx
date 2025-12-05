import React from 'react';
import { DISCORD_CLIENT_ID, DISCORD_INVITE_LINK } from '../types';
import { LogIn, Bot, Server } from 'lucide-react';

interface DiscordLoginProps {
    onLogin: (user: any) => void; 
    onClose: () => void;
    isForced?: boolean; 
}

export const DiscordLogin: React.FC<DiscordLoginProps> = ({ isForced }) => {
    const handleConnect = (e: React.MouseEvent) => {
        e.preventDefault();
        const redirectUri = window.location.origin + window.location.pathname; // Clean redirect
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'identify guilds'
        });
        window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050505]">
            <div className="w-full max-w-md bg-[#36393f] rounded-lg shadow-2xl overflow-hidden border border-[#2f3136] p-6 text-center">
                <div className="w-20 h-20 bg-[#5865F2] rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
                    <LogIn className="text-white" size={40} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Login with Discord</h2>
                <p className="text-gray-400 text-sm mb-6">Authenticate to access the Mystic Forge.</p>
                <button onClick={handleConnect} className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-3 rounded mb-4 flex items-center justify-center gap-2">
                    <LogIn size={18} /> Connect Discord
                </button>
            </div>
        </div>
    );
};