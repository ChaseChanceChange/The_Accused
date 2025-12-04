/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { DISCORD_CLIENT_ID, DISCORD_INVITE_LINK } from './types';
import { X, Shield, Bot, Server, LogIn, Copy, Check, AlertCircle } from 'lucide-react';

interface DiscordLoginProps {
    onLogin: (user: any) => void; 
    onClose: () => void;
    isForced?: boolean; 
}

export const DiscordLogin: React.FC<DiscordLoginProps> = ({ onClose, isForced = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // 1. Generate a Clean Redirect URI
    const getRedirectUri = () => {
        if (typeof window === 'undefined') return '';
        const url = new URL(window.location.href);
        // Remove 'index.html' if present
        let cleanPath = url.pathname.replace(/\/index\.html$/, '/');
        // Ensure no double slashes
        cleanPath = cleanPath.replace(/\/\/+/g, '/');
        return `${url.origin}${cleanPath}`;
    };

    const handleConnect = (e: React.MouseEvent) => {
        e.preventDefault(); // Stop any form submission or default link behavior
        setIsLoading(true);
        
        const redirectUri = getRedirectUri();
        
        console.log("Attempting Discord Login...");
        console.log("Client ID:", DISCORD_CLIENT_ID);
        console.log("Redirect URI:", redirectUri);

        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: 'token',
            scope: 'identify guilds'
        });

        // FORCE browser navigation
        window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    };
    
    // Bot Invite URL
    const botInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot`;
    const serverInviteUrl = DISCORD_INVITE_LINK; 

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isForced ? 'bg-[#050505]' : ''}`}>
            {!isForced && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
            )}
            
            <div className="relative w-full max-w-md bg-[#36393f] rounded-lg shadow-[0_0_40px_rgba(88,101,242,0.3)] overflow-hidden border border-[#2f3136] animate-in zoom-in-95 duration-300 z-10">
                {/* Header */}
                <div className="bg-[#2f3136] p-4 flex justify-between items-center border-b border-[#202225]">
                    <div className="flex items-center gap-2">
                        <Shield className="text-[#5865F2]" size={20} />
                        <span className="font-header text-white tracking-wide">
                            {isForced ? 'Authentication Required' : 'Server Verification'}
                        </span>
                    </div>
                    {!isForced && (
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center text-center">
                    
                    <div className="w-20 h-20 bg-[#5865F2] rounded-full flex items-center justify-center mb-6 shadow-lg relative group">
                        <div className="absolute inset-0 bg-[#5865F2] rounded-full animate-ping opacity-20"></div>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 00.0101-.1217c3.9538 1.8105 8.2163 1.8105 12.1157 0a.074.074 0 00.0116.1218c.1197.0991.246.197.3718.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                        </svg>
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-2">Login with Discord</h2>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-xs">
                        {isForced 
                            ? "You must log in to access the Mystic Enchant Creator." 
                            : "Authenticate securely to access the Mystic Forge. We will verify your membership."
                        }
                    </p>
                    
                    <div className="bg-[#2f3136] p-4 rounded w-full mb-6 text-left border border-[#202225]">
                        <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">Requirements</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <Server size={14} className="text-[#5865F2]" /> 
                                Member of "The Accused"
                            </li>
                            <li className="flex items-center gap-2">
                                <Bot size={14} className="text-green-500" /> 
                                Or have MysticBot added
                            </li>
                        </ul>
                    </div>

                    <div className="w-full space-y-3">
                        <button 
                            onClick={handleConnect}
                            disabled={isLoading}
                            className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(88,101,242,0.4)] hover:shadow-[0_0_30px_rgba(88,101,242,0.6)] disabled:opacity-50 disabled:cursor-wait"
                        >
                            <LogIn size={18} /> {isLoading ? 'Redirecting...' : 'Connect Discord'}
                        </button>
                        
                        <div className="flex gap-2">
                            <a 
                                href={serverInviteUrl}
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 bg-[#2f3136] hover:bg-[#202225] text-gray-300 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-white/10"
                            >
                                <Server size={12} /> Join Server
                            </a>
                            <a 
                                href={botInviteUrl}
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 bg-[#2f3136] hover:bg-[#202225] text-gray-300 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-white/10"
                            >
                                <Bot size={12} /> Add Bot
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};