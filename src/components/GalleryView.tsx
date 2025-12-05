import React, { useState, useMemo } from 'react';
import { Enchantment } from '../types';
import { EnchantmentCard } from './EnchantmentCard';
import { Search, TrendingUp, Clock, Swords } from 'lucide-react';

interface GalleryViewProps {
    items: Enchantment[];
    onLike: (id: string) => void;
    onDelete: (id: string) => void;
    onDownload: (id: string) => void;
    onView?: (id: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ items, onLike, onDelete, onDownload, onView }) => {
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState<'recent' | 'popular'>('recent');

    const filteredItems = useMemo(() => {
        return items
        .filter(i => i.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => sort === 'popular' ? b.stats.likes - a.stats.likes : b.createdAt - a.createdAt);
    }, [items, filter, sort]);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl sticky top-24 z-40 backdrop-blur-md">
                 <div className="relative w-full md:w-96">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                     <input 
                        type="text" 
                        placeholder="Search..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-lg py-3 pl-12 text-white text-sm font-mono focus:border-purple-500 outline-none"
                     />
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setSort('recent')} className={`px-3 py-2 rounded flex gap-2 text-xs font-bold uppercase ${sort === 'recent' ? 'bg-orange-600/20 text-orange-400' : 'text-gray-500'}`}>
                        <Clock size={14} /> Recent
                    </button>
                    <button onClick={() => setSort('popular')} className={`px-3 py-2 rounded flex gap-2 text-xs font-bold uppercase ${sort === 'popular' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500'}`}>
                        <TrendingUp size={14} /> Popular
                    </button>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4">
                {filteredItems.map((item) => (
                    <EnchantmentCard 
                        key={item.id} 
                        data={item} 
                        isInteractive 
                        onLike={() => onLike(item.id)}
                        onDownload={() => onDownload(item.id)}
                        onDelete={() => onDelete(item.id)}
                        onView={onView}
                    />
                ))}
            </div>
        </div>
    );
};