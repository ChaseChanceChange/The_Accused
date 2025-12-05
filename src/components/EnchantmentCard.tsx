import React, { useRef, useState } from 'react';
import { Enchantment, RARITY_COLORS, RARITY_BG } from '../types';
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

export const EnchantmentCard: React.FC<EnchantmentCardProps> = ({ 
  data, isInteractive = false, onLike, onDownload, onDelete, onView
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const colorClass = RARITY_COLORS[data.rarity];
  const borderColor = colorClass.split(' ')[1];
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDownloading || !isInteractive) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setRotation({ x: rotateX, y: rotateY });
    setIsHovering(true);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading || !cardRef.current) return;
    setIsDownloading(true);
    setRotation({ x: 0, y: 0 });
    setTimeout(async () => {
        try {
            const canvas = await html2canvas(cardRef.current!, { backgroundColor: null, scale: 3 });
            const link = document.createElement('a');
            link.download = `${data.name}_Card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (onDownload) onDownload();
        } catch (err) { console.error(err); } finally { setIsDownloading(false); }
    }, 100);
  };

  return (
    <div className="relative w-full max-w-[420px] mx-auto group/container">
      <div 
        ref={containerRef}
        className={`perspective-1000 z-10 relative`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setRotation({ x: 0, y: 0 }); setIsHovering(false); }}
      >
          {onDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute -top-3 -right-3 z-50 bg-red-600 text-white p-2 rounded-full shadow-lg hover:scale-110">
                  <Trash2 size={16} />
              </button>
          )}
          <div 
            ref={cardRef}
            style={{ transform: isDownloading ? 'none' : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovering ? 1.05 : 1})`, transition: isHovering ? 'transform 0.1s' : 'transform 0.5s' }}
            className={`relative w-full rounded-xl overflow-hidden border-[3px] ${borderColor} ${RARITY_BG[data.rarity]} backdrop-blur-xl flex flex-col shadow-2xl transform-style-3d bg-[#0a0a0a]`}
          >
            <div className="p-5 relative z-10 flex justify-between items-start border-b border-white/5 bg-black/50">
               <div>
                   <h2 className={`font-header text-2xl uppercase tracking-wider ${colorClass.split(' ')[0]}`}>{data.name || "Unknown"}</h2>
                   <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{data.rarity}</span>
               </div>
               <div className={`w-14 h-14 rounded border-2 ${borderColor} overflow-hidden bg-black`}>
                  {data.iconUrl ? <img src={data.iconUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Zap size={20} className="text-gray-600"/></div>}
               </div>
            </div>

            <div className="flex-1 p-5 flex flex-col gap-5 relative z-10">
               <div className="text-yellow-500/80 italic text-sm font-serif border-l-2 border-yellow-500/30 pl-3">"{data.flavorText}"</div>
               <div className="font-mono text-sm space-y-2 bg-black/40 p-3 rounded border border-white/5">
                   {data.trigger && <div className="text-blue-300 font-bold">{data.trigger}</div>}
                   {data.effects.map((e, i) => <div key={i} className="text-green-400">• {e}</div>)}
               </div>
            </div>
            
            <div className="px-5 py-3 bg-black/60 border-t border-white/10 flex justify-between items-center text-xs font-mono text-gray-400">
               <div className="flex gap-3">
                   <span className="flex gap-1"><Heart size={12}/> {data.stats.likes}</span>
                   <span className="flex gap-1"><Download size={12}/> {data.stats.downloads}</span>
               </div>
            </div>
          </div>
      </div>
      
      {isInteractive && (
          <div className="flex justify-center gap-3 mt-4 opacity-0 group-hover/container:opacity-100 transition-opacity">
             {onLike && <button onClick={onLike} className="p-2 bg-gray-800 rounded hover:bg-pink-600 text-white transition-colors"><Heart size={16} className={data.isLiked ? 'fill-white' : ''} /></button>}
             {onDownload && <button onClick={handleDownloadClick} className="p-2 bg-gray-800 rounded hover:bg-blue-600 text-white transition-colors"><Download size={16} /></button>}
          </div>
      )}
    </div>
  );
};