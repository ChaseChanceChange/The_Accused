
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Megaphone, Scroll, Heart, Sparkles, ExternalLink, Calendar, Star } from 'lucide-react';
import { DONATION_LINK, DISCORD_INVITE_LINK } from './types';

export const CommunityView: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-500 pb-24">
            
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
                <h1 className="font-header text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-glow">
                    THE ARCHIVES
                </h1>
                <p className="font-mono text-gray-400 max-w-2xl mx-auto">
                    News, ancient lore, and community contributions from the Order of Mystic Enchanters.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col: Updates */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Updates Section */}
                    <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
                        <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5">
                            <Megaphone className="text-blue-400" size={20} />
                            <h2 className="font-header text-xl tracking-widest text-blue-100">System Updates</h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            <div className="p-6 hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg text-purple-300">The Balance Matrix Update</span>
                                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1"><Calendar size={12}/> v1.2.0</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    We've introduced the Balance Matrix! You can now visualize the power distribution of enchantments across rarities. 
                                    A new "Item Score" (GS) is now calculated automatically for every enchantment forged.
                                </p>
                            </div>
                             <div className="p-6 hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg text-white">Discord Integration</span>
                                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1"><Calendar size={12}/> v1.1.0</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    The Forge is now secure. Only verified members of "The Accused" and those allied with MysticBot can access the creation tools.
                                </p>
                            </div>
                             <div className="p-6 hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg text-gray-400">Genesis</span>
                                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1"><Calendar size={12}/> v1.0.0</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    The Mystic Enchant Creator is live. Create, share, and download your RPG enchantments with AI-powered art and lore.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lore Section */}
                    <div className="bg-black/40 border border-yellow-900/30 rounded-xl overflow-hidden backdrop-blur-md relative">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                             <Scroll size={120} />
                         </div>
                        <div className="p-4 border-b border-yellow-900/30 flex items-center gap-2 bg-yellow-900/10">
                            <Scroll className="text-yellow-500" size={20} />
                            <h2 className="font-header text-xl tracking-widest text-yellow-100">Lore of the Forge</h2>
                        </div>
                        <div className="p-6 md:p-8">
                            <p className="font-serif italic text-yellow-100/80 text-lg leading-loose text-center">
                                "Before the breaking of the world, there was the Forge. It is said that the First Enchanters used starlight and shadow to bind magic into steel. Now, as the realms fracture, we—the new generation of artificers—must rediscover these lost arts. Every card you create is a memory recovered, a spell re-woven, adding strength to our order against the coming darkness."
                            </p>
                            <div className="mt-6 flex justify-center">
                                <span className="text-xs font-mono uppercase tracking-[0.3em] text-yellow-600">Archmage Arcanist</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Col: Community & Donate */}
                <div className="space-y-8">
                    
                    {/* Donation Card */}
                    <div className="bg-gradient-to-b from-[#1a1a1a] to-black border border-yellow-500/50 rounded-xl p-6 shadow-[0_0_30px_rgba(234,179,8,0.1)] text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl group-hover:bg-yellow-500/30 transition-colors"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                <Heart className="text-yellow-400 fill-yellow-400 animate-pulse" size={32} />
                            </div>
                            
                            <h3 className="font-header text-2xl text-yellow-400 mb-2">Support the Forge</h3>
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                Creating legendary tools requires mana (and coffee). Your support helps keep the servers running and the features flowing.
                            </p>
                            
                            <a 
                                href={DONATION_LINK} 
                                target="_blank" 
                                rel="noreferrer"
                                className="block w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-header text-lg uppercase tracking-wider rounded shadow-lg transform hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Sparkles size={18} /> Donate
                            </a>
                             <p className="text-[10px] text-gray-600 mt-4 font-mono">
                                via PayPal Secure Checkout
                            </p>
                        </div>
                    </div>

                    {/* Discord Card */}
                    <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl p-6 relative overflow-hidden">
                        <h3 className="font-header text-xl text-white mb-2 flex items-center gap-2">
                             Join The Order
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Connect with other creators, share your cards, and get direct support in our Discord.
                        </p>
                        <a 
                            href={DISCORD_INVITE_LINK}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-[#5865F2] hover:text-white font-bold uppercase text-xs tracking-wider transition-colors"
                        >
                            Open Discord <ExternalLink size={12} />
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
};
