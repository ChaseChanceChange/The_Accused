
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState } from 'react';
import { Enchantment, RARITY_COLORS, RARITY_BG } from './types';
import { Download, Heart, Eye, Zap, Trash2, Loader2, Info, Swords } from 'lucide-react';
import html2canvas from 'html2canvas';

interface EnchantmentCardProps {
  data: Enchantment;
  isInteractive?: boolean;
  onLike?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onView?: (id: string) => void;
}

const SLOT_LORE: Record<string, string> = {
    Weapon: "Imbues your strike with the essence of destruction.",
    Chest: "Protects the heart, where the soul resides.",
    Head: "Enhances the mind's connection to the arcane.",
    Legs: "Grants swiftness to outmaneuver fate.",
    Hands: "Guides the fingers to weave complex spells.",
    Ring: "A circle of power that binds magic to the wearer.",
    Trinket: "A small object holding immense, often unstable, power."
};

export const EnchantmentCard: React.FC<EnchantmentCardProps> = ({ 
  data, 
  isInteractive = false,
  onLike,
  onDownload,
  onDelete,
  onView
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [sheenPos, setSheenPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const hasViewedRef = useRef(false);

  const colorClass = RARITY_COLORS[data.rarity];
  const borderColor = colorClass.split(' ')[1];
  const textColor = colorClass.split(' ')[0];
  const shadowColor = colorClass.split(' ')[2];

  // 3D Tilt Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDownloading || !isInteractive) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (max 10 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
    setSheenPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    setIsHovering(true);
  };

  const handleMouseEnter = () => {
    if (isInteractive && !isDownloading) {
        setIsHovering(true);
        // Trigger view count once per session/mount when hovered
        if (onView && !hasViewedRef.current) {
            onView(data.id);
            hasViewedRef.current = true;
        }
    }
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovering(false);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading || !cardRef.current) return;
    
    setIsDownloading(true);
    setRotation({ x: 0, y: 0 }); // Flatten for capture
    setIsHovering(false); // Reset hover state

    // Slight delay to allow render cycle to flatten the card
    setTimeout(async () => {
        try {
            const canvas = await html2canvas(cardRef.current!, {
                useCORS: true,
                backgroundColor: null,
                scale: 2,
                logging: false
            });
            
            const link = document.createElement('a');
            link.download = `${data.name.replace(/\s+/g, '_')}_MysticCard.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            if (onDownload) onDownload();
        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to create card image.");
        } finally {
            setIsDownloading(false);
        }
    }, 100);
  };

  return (
    <div className="relative w-full max-w-[420px] mx-auto group/container">
      
      {/* 3D Card Container */}
      <div 
        ref={containerRef}
        className={`perspective-1000 z-10 relative`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
          {/* Moderation/Delete Button */}
          {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute -top-3 -right-3 z-50 bg-red-600 text-white p-2 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)] hover:scale-110 transition-transform"
                title="Delete Enchantment"
              >
                  <Trash2 size={16} />
              </button>
          )}

          {/* Main Card Content */}
          <div 
            ref={cardRef}
            style={{
                transform: isDownloading ? 'none' : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovering ? 1.03 : 1})`,
                transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
            }}
            className={`relative w-full rounded-xl overflow-hidden border-[3px] ${borderColor} ${RARITY_BG[data.rarity]} backdrop-blur-md flex flex-col shadow-[0_0_30px_-10px_rgba(0,0,0,1)] ${shadowColor} transform-style-3d bg-[#0a0a0a]`}
          >
            
            {/* Enhanced Holographic Sheen Overlay */}
            {!isDownloading && (
                <div 
                    className="absolute inset-0 pointer-events-none z-20 opacity-0 group-hover/container:opacity-100 transition-opacity duration-500 mix-blend-hard-light"
                    style={{
                        background: `linear-gradient(115deg, transparent 20%, rgba(0, 255, 255, 0.2) ${sheenPos.x - 15}%, rgba(255, 0, 255, 0.2) ${sheenPos.x}%, rgba(255, 255, 0, 0.2) ${sheenPos.x + 15}%, transparent 80%)`,
                        filter: 'blur(2px)'
                    }}
                />
            )}

            {/* Header Section */}
            <div className="p-5 relative z-10 flex justify-between items-start border-b border-white/5 bg-black/40">
              <div className="flex-1 pr-4 group/name relative">
                <h2 className={`font-header text-2xl uppercase tracking-wider ${textColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none mb-1 cursor-help`}>
                  {data.name || "Unknown Enchantment"}
                </h2>
                
                {/* Cost & Rarity Sub-header */}
                <div className="flex items-center gap-2 mt-1">
                     <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.1em] font-mono">
                         {data.rarity}
                     </span>
                     {data.cost && (
                         <span className="bg-blue-900/40 border border-blue-500/30 text-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                             {data.cost}
                         </span>
                     )}
                     
                     {/* Item Score Badge */}
                     {data.itemScore !== undefined && (
                        <div className="group/score relative ml-auto">
                           <span className={`bg-[#111] border ${borderColor} ${textColor} text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wide flex items-center gap-1`}>
                               <Swords size={10} /> GS:{data.itemScore}
                           </span>
                           <div className="lore-tooltip left-0 bottom-full mb-1 w-32">
                               <div className="text-[10px] uppercase font-bold text-gray-400">Item Score</div>
                               <div className="text-white">Calculated power based on stats.</div>
                           </div>
                        </div>
                     )}
                </div>
                
                {/* Rich Tooltip: Name */}
                <div className="lore-tooltip top-full left-0 mt-2 w-64 translate-y-2 group-hover/name:translate-y-0 transition-transform">
                    <div className="text-xs uppercase font-bold text-gray-500 mb-1 tracking-widest">Ancient Inscription</div>
                    <p className="text-gray-300 italic">"The runes on this item glow with a power that matches the {data.rarity} energy of the {data.slot}."</p>
                </div>
              </div>
              
              <div className="relative group/icon">
                   <div className={`w-14 h-14 rounded border-2 ${borderColor} overflow-hidden bg-black shadow-inner relative`}>
                      {data.iconUrl ? (
                        <img src={data.iconUrl} alt="icon" className="w-full h-full object-cover scale-110" crossOrigin="anonymous" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                           <Zap size={20} className="text-gray-600 opacity-50" />
                        </div>
                      )}
                      {/* Scanline effect on icon */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                   </div>
                   {data.iconUrl && <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-orange-400 font-mono shadow-lg z-20">ICON</div>}
              </div>
            </div>

            {/* Body Section */}
            <div className="flex-1 p-5 flex flex-col gap-5 relative z-10">
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                 <div className="relative group/slot cursor-help">
                     <span className="bg-orange-500/10 text-orange-300 border border-orange-500/30 px-2 py-1 text-xs font-bold uppercase rounded-sm tracking-wide">
                       {data.slot}
                     </span>
                     {/* Lore Tooltip for Slot */}
                     <div className="lore-tooltip bottom-full left-0 mb-2 w-48 translate-y-2 group-hover/slot:translate-y-0 group-hover/slot:opacity-100 transition-all origin-bottom z-50">
                        <div className="text-[10px] uppercase font-bold text-orange-400 mb-1 tracking-widest">Slot Resonance</div>
                        <p className="text-gray-300 font-serif leading-tight">{SLOT_LORE[data.slot] || "A vessel for magical power."}</p>
                     </div>
                 </div>
                 {data.type && (
                   <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-1 text-xs font-bold uppercase rounded-sm tracking-wide">
                     {data.type}
                   </span>
                 )}
              </div>

              {/* Flavor Text with Tooltip */}
              <div className="relative group/flavor cursor-help">
                  <div className="text-yellow-500/80 italic text-sm font-serif border-l-2 border-yellow-500/30 pl-3 leading-relaxed min-h-[40px]">
                    "{data.flavorText || "The magic remains dormant..."}"
                  </div>
                  
                  {/* Rich Tooltip: Lore */}
                  <div className="lore-tooltip bottom-full left-0 mb-2 w-full translate-y-2 group-hover/flavor:translate-y-0 transition-transform origin-bottom">
                      <div className="flex items-center gap-2 text-xs uppercase font-bold text-yellow-500 mb-1 tracking-widest">
                          <Info size={12} /> Deep Lore
                      </div>
                      <p className="text-gray-300 font-serif">Legends say this enchantment was discovered by {data.author || 'an unknown traveler'} during the Age of Mystics.</p>
                  </div>
              </div>

              {/* Effects List */}
              <div className="font-mono text-sm leading-relaxed space-y-3 min-h-[100px] bg-black/20 p-3 rounded border border-white/5">
                  {data.trigger && (
                      <div className="text-gray-300 flex justify-between items-baseline border-b border-white/5 pb-1">
                          <span className="text-gray-500 uppercase text-[10px] tracking-widest">Trigger</span>
                          <span className="text-blue-300 font-bold">{data.trigger}</span>
                      </div>
                  )}
                  
                  <div className="space-y-2 mt-2">
                      {data.effects.map((effect, idx) => (
                          <div key={idx} className="text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.2)] flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 bg-green-500 rounded-full shrink-0"></span>
                              <span>{effect}</span>
                          </div>
                      ))}
                  </div>
                  
                  {data.effects.length === 0 && !data.trigger && (
                      <div className="text-gray-700 text-center py-4 font-mono text-xs uppercase tracking-widest animate-pulse">
                          &lt; Awaiting Enchantment Data &gt;
                      </div>
                  )}
              </div>
            </div>

            {/* Stats Footer */}
            <div className="px-5 py-3 bg-black/60 border-t border-white/10 flex justify-between items-center text-xs font-mono text-gray-400 relative z-10">
               <div className="flex gap-4">
                   <span className={`flex items-center gap-1.5 transition-colors ${data.isLiked ? 'text-pink-500' : 'group-hover/name:text-white'}`}>
                       <Heart size={12} className={data.isLiked ? "fill-pink-500" : ""} /> {data.stats.likes}
                   </span>
                   <span className="flex items-center gap-1.5 group-hover/name:text-white transition-colors">
                       <Eye size={12} /> {data.stats.views}
                   </span>
                   <span className="flex items-center gap-1.5 group-hover/name:text-white transition-colors">
                       <Download size={12} /> {data.stats.downloads}
                   </span>
               </div>
               
               {/* Branding Tag */}
               <div className="flex items-center gap-2 opacity-50">
                   <span className="w-1 h-3 bg-gradient-to-b from-purple-500 to-blue-500"></span>
                   <div className="uppercase tracking-widest text-[9px]">Mystic Creator</div>
               </div>
            </div>
          </div>
      </div>

      {/* Action Bar - Placed neatly under the card */}
      {isInteractive && (
          <div className="flex items-center justify-between gap-3 mt-4 px-1 opacity-0 group-hover/container:opacity-100 translate-y-[-10px] group-hover/container:translate-y-0 transition-all duration-300">
             {onLike && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onLike(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-header uppercase tracking-wider text-xs border transition-all hover:scale-105 active:scale-95 shadow-lg ${data.isLiked ? 'bg-pink-600 border-pink-500 text-white shadow-pink-900/40' : 'bg-[#111] border-white/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/50 hover:bg-[#1a1a1a]'}`}
                >
                    <Heart size={16} className={data.isLiked ? "fill-white" : ""} />
                    {data.isLiked ? "Liked" : "Like"}
                </button>
             )}

             {onDownload && (
                <button 
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-header uppercase tracking-wider text-xs border bg-[#111] border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-[#1a1a1a] transition-all hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isDownloading ? "Saving..." : "Download"}
                </button>
             )}
          </div>
      )}
    </div>
  );
};
