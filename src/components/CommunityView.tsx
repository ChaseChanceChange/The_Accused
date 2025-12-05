import React from 'react';
import { Megaphone, Scroll, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { DONATION_LINK, DISCORD_INVITE_LINK } from '../types';

export const CommunityView: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 pb-24">
            <div className="text-center space-y-4 py-8">
                <h1 className="font-header text-5xl text-purple-400">THE ARCHIVES</h1>
                <p className="font-mono text-gray-400">News, lore, and community contributions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden p-6">
                        <h2 className="font-header text-xl text-blue-100 mb-4 flex gap-2"><Megaphone size={20}/> Updates</h2>
                        <div className="space-y-4 text-gray-300 text-sm">
                            <p><strong>v2.0.0</strong> - Full architectural overhaul. Discord Activity Support added.</p>
                            <p><strong>v1.2.0</strong> - Balance Matrix and Item Scores implemented.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-[#1a1a1a] border border-yellow-500/50 rounded-xl p-6 text-center">
                        <Heart className="text-yellow-400 mx-auto mb-4" size={32} />
                        <h3 className="font-header text-2xl text-yellow-400 mb-2">Support the Forge</h3>
                        <a href={DONATION_LINK} target="_blank" rel="noreferrer" className="block w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase rounded mt-4">
                            Donate
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};