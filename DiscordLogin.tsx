
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Check, Loader2, X, Shield, Bot, Server } from 'lucide-react';

interface DiscordLoginProps {
    onLogin: (user: User) => void;
    onClose: () => void;
}

export const DiscordLogin: React.FC<DiscordLoginProps> = ({ onLogin, onClose }) => {
    const [step, setStep] = useState<'init' | 'connecting' | 'verifying' | 'success'>('init');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const handleLoginClick = () => {
        setStep('connecting');
        addLog("Initializing OAuth2 handshake...");
        
        setTimeout(() => {
            addLog("Connected to Discord Gateway.");
            addLog("Requesting user identity...");
            
            setTimeout(() => {
                setStep('verifying');
                addLog("Identity verified: MysticUser#1337");
                addLog("Checking Guild Membership...");
                
                setTimeout(() => {
                    addLog("Verifying 'Mystic Enchanters' server role...");
                    addLog("Checking for 'MysticBot' integration...");
                    
                    setTimeout(() => {
                        setStep('success');
                        addLog("Access Granted. Welcome, Traveler.");
                        
                        setTimeout(() => {
                            onLogin({
                                id: '123456789',
                                username: 'MysticUser',
                                discriminator: '1337',
                                avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
                                isMember: true
                            });
                        }, 1000);
                    }, 1500);
                }, 1500);
            }, 1500);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md bg-[#36393f] rounded-lg shadow-[0_0_40px_rgba(88,101,242,0.3)] overflow-hidden border border-[#2f3136] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-[#2f3136] p-4 flex justify-between items-center border-b border-[#202225]">
                    <div className="flex items-center gap-2">
                        <Shield className="text-[#5865F2]" size={20} />
                        <span className="font-header text-white tracking-wide">Server Verification</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center text-center">
                    
                    {step === 'init' && (
                        <>
                            <div className="w-20 h-20 bg-[#5865F2] rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 00.0101-.1217c3.9538 1.8105 8.2163 1.8105 12.1157 0a.074.074 0 00.0116.1218c.1197.0991.246.197.3718.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Creating enchantments and voting is restricted to verified community members.
                                Please log in with Discord to verify your server membership.
                            </p>
                            
                            <div className="bg-[#2f3136] p-4 rounded w-full mb-6 text-left">
                                <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">Requirements</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2"><Server size={14} className="text-[#5865F2]" /> Member of "Mystic Enchanters" Server</li>
                                    <li className="flex items-center gap-2"><Bot size={14} className="text-[#5865F2]" /> Or have MysticBot added</li>
                                </ul>
                            </div>

                            <button 
                                onClick={handleLoginClick}
                                className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                            >
                                Connect with Discord
                            </button>
                            <p className="text-[10px] text-gray-600 mt-2">Simulation Mode: No real credentials required.</p>
                        </>
                    )}

                    {(step === 'connecting' || step === 'verifying') && (
                        <div className="w-full py-8">
                             <Loader2 size={40} className="text-[#5865F2] animate-spin mx-auto mb-6" />
                             <h3 className="text-white font-bold text-lg mb-4">Verifying Credentials...</h3>
                             <div className="bg-black/50 p-3 rounded h-32 overflow-y-auto text-left font-mono text-xs space-y-1 custom-scrollbar">
                                {logs.map((log, i) => (
                                    <div key={i} className="text-green-400">> {log}</div>
                                ))}
                             </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="w-full py-8 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-white" />
                            </div>
                            <h3 className="text-white font-bold text-2xl mb-2">Verification Complete</h3>
                            <p className="text-gray-400">Welcome to the inner circle.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
