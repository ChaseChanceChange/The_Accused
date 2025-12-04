
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { DISCORD_CLIENT_ID, DISCORD_INVITE_LINK } from './types';
import { X, Shield, Bot, Server, LogIn } from 'lucide-react';

interface DiscordLoginProps {
    onLogin: (user: any) => void; 
    onClose: () => void;
    isForced?: boolean;
}

export const DiscordLogin: React.FC<DiscordLoginProps> = ({ onClose, isForced = false }) => {
    
    // 1. Calculate Redirect URI (Base URL without hash/query)
    const [redirectUri, setRedirectUri] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Remove any existing hash or query params to get a clean base URL
            const url = new URL(window.location.href);
            let cleanUrl = url.origin + url.pathname;
            
            // Remove trailing slash if present to avoid mismatches
            if (cleanUrl.endsWith('/')) {
                cleanUrl = cleanUrl.slice(0, -1);
            }
            setRedirectUri(cleanUrl);
        }
    }, []);

    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        if (!redirectUri) return;
        setIsLoading(true);
        
        // Construct OAuth URL
        // Using 'prompt=consent' ensures the user sees the authorize screen again if they messed up previously
        const loginUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify%20guilds`;
        
        console.log("Redirecting to Discord:", loginUrl);
        
        // Force browser navigation
        window.location.href = loginUrl;
    };

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
                        <Bot size={40} className="text-white relative z-10" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-2">Login with Discord</h2>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-xs">
                        Connect your account to access the Mystic Forge.
                        We will verify your membership in <strong>The Accused</strong>.
                    </p>
                    
                    <div className="w-full space-y-3">
                        <button 
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(88,101,242,0.4)] hover:shadow-[0_0_30px_rgba(88,101,242,0.6)] active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isLoading ? 'Redirecting...' : <><LogIn size={18} /> Connect Discord</>}
                        </button>
                        
                        <div className="flex gap-2">
                            <a 
                                href={DISCORD_INVITE_LINK}
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 bg-[#2f3136] hover:bg-[#202225] text-gray-300 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-white/10"
                            >
                                <Server size={12} /> Join Server
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
