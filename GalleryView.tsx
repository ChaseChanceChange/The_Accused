
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Enchantment } from './types';
import { EnchantmentCard } from './EnchantmentCard';
import { Search, TrendingUp, Clock, Eye, ShieldAlert, ShieldCheck, AlertTriangle, X, Trash2 } from 'lucide-react';

interface GalleryViewProps {
    items: Enchantment[];
    onLike: (id: string) => void;
    onDelete: (id: string) => void;
    onDownload: (id: string) => void;
    onView?: (id: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ items, onLike, onDelete, onDownload, onView }) => {
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState<'recent' | 'popular' | 'views'>('recent');
    const [modMode, setModMode] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filteredItems = items
        .filter(i => i.name.toLowerCase().includes(filter.toLowerCase()) || i.flavorText.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => {
            if (sort === 'popular') return b.stats.likes - a.stats.likes;
            if (sort === 'views') return b.stats.views - a.stats.views;
            return b.createdAt - a.createdAt;
        });

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20 relative">
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl backdrop-blur-md shadow-xl sticky top-24 z-40">
                 <div className="relative w-full md:w-96 group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                     <input 
                        type="text" 
                        placeholder="Search enchantments..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white text-sm font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                     />
                 </div>

                 <div className="flex flex-wrap items-center gap-2">
                     <button onClick={() => setSort('recent')} className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all border ${sort === 'recent' ? 'bg-orange-600/20 text-orange-400 border-orange-600/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}>
                        <Clock size={14} /> Recent
                     </button>
                     <button onClick={() => setSort('popular')} className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all border ${sort === 'popular' ? 'bg-purple-600/20 text-purple-400 border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}>
                        <TrendingUp size={14} /> Most Upvoted
                     </button>
                     <button onClick={() => setSort('views')} className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all border ${sort === 'views' ? 'bg-blue-600/20 text-blue-400 border-blue-600/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}>
                        <Eye size={14} /> Most Viewed
                     </button>
                     
                     <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
                     
                     <button 
                        onClick={() => setModMode(!modMode)} 
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all border ${modMode ? 'bg-red-600/20 text-red-400 border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-transparent text-gray-600 border-transparent hover:text-gray-400'}`}
                        title="Moderator Mode"
                     >
                        {modMode ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                     </button>
                 </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/40 border border-white/10 p-6 rounded-xl text-center relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors duration-500" />
                    <div className="relative z-10">
                        <div className="font-header text-4xl text-purple-400 mb-1 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">{items.length}</div>
                        <div className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Total Enchantments</div>
                    </div>
                </div>
                <div className="bg-black/40 border border-white/10 p-6 rounded-xl text-center relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                    <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors duration-500" />
                    <div className="relative z-10">
                        <div className="font-header text-4xl text-orange-400 mb-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">{filteredItems.length}</div>
                        <div className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Showing</div>
                    </div>
                </div>
                <div className="bg-black/40 border border-white/10 p-6 rounded-xl text-center relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />
                    <div className="relative z-10">
                        <div className="font-header text-4xl text-blue-400 mb-1 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                            {items.filter(i => i.isLiked).length}
                        </div>
                        <div className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Your Favorites</div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4">
                {filteredItems.map(item => (
                    <div key={item.id} className="relative">
                         <EnchantmentCard 
                            data={item} 
                            isInteractive 
                            onLike={() => onLike(item.id)}
                            onDownload={() => onDownload(item.id)}
                            onDelete={modMode ? () => setDeleteId(item.id) : undefined}
                            onView={() => onView && onView(item.id)}
                         />
                    </div>
                ))}
                
                {filteredItems.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        <div className="font-header text-2xl mb-2 opacity-50">No Enchantments Found</div>
                        <p className="font-mono text-sm">Adjust your filters or forge something new.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteId(null)}></div>
                    <div className="relative w-full max-w-md bg-[#0f0f12] border border-red-500/50 p-6 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4 text-red-500">
                            <div className="p-3 bg-red-500/10 rounded-full">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="font-header text-2xl uppercase tracking-wider">Confirm Deletion</h3>
                        </div>
                        
                        <p className="text-gray-300 mb-8 font-mono leading-relaxed">
                            Are you sure you want to destroy this enchantment? This action cannot be undone and the lore will be lost forever.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setDeleteId(null)}
                                className="px-6 py-2 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold uppercase text-sm tracking-wider"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-6 py-2 rounded bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all font-bold uppercase text-sm tracking-wider flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Destroy
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setDeleteId(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
