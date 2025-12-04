
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Enchantment } from './types';
import { EnchantmentCard } from './EnchantmentCard';
import { GoogleGenAI, Type } from '@google/genai';
import { Sparkles, Image as ImageIcon, Trash2, Cpu } from 'lucide-react';

interface CreateViewProps {
    onSave: (e: Enchantment) => void;
}

const INITIAL_STATE: Enchantment = {
    id: 'draft',
    name: '',
    slot: 'Weapon',
    rarity: 'Legendary',
    type: 'Passive Effect',
    cost: '50 Mana',
    trigger: '',
    flavorText: '',
    effects: [],
    iconUrl: '',
    author: 'You',
    stats: { likes: 0, views: 0, downloads: 0 },
    createdAt: Date.now()
};

export const CreateView: React.FC<CreateViewProps> = ({ onSave }) => {
    const [draft, setDraft] = useState<Enchantment>({
        ...INITIAL_STATE, 
        name: 'soul reavers edge',
        trigger: 'chance on spell hit',
        cost: '100 Rage',
        flavorText: 'forged by the fires of the reavers liar',
        effects: [
            'grants 300 strength and 200 critical strike rating',
            'increases movement speed by 10% for 10 seconds',
            'slams ground to create a shockwave blasting enemies in a 10 yard radius'
        ],
        iconUrl: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?q=80&w=400&auto=format&fit=crop'
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isImgGenerating, setIsImgGenerating] = useState(false);

    const updateField = (field: keyof Enchantment, value: any) => {
        setDraft(prev => ({ ...prev, [field]: value }));
    };

    const addEffect = () => {
        if (draft.effects.length < 5) {
            setDraft(prev => ({ ...prev, effects: [...prev.effects, ''] }));
        }
    };

    const updateEffect = (idx: number, val: string) => {
        const newEffects = [...draft.effects];
        newEffects[idx] = val;
        setDraft(prev => ({ ...prev, effects: newEffects }));
    };

    const removeEffect = (idx: number) => {
        setDraft(prev => ({ ...prev, effects: prev.effects.filter((_, i) => i !== idx) }));
    };

    // --- AI Functions ---
    const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

    const generateDetails = async () => {
        if (!draft.name) return;
        setIsGenerating(true);
        try {
            const ai = getAI();
            const prompt = `
            Create a fantasy RPG enchantment details for "${draft.name}". 
            Slot: ${draft.slot}. Rarity: ${draft.rarity}.
            Generate a short flavor text (lore), a trigger condition (short), a cost string (e.g. 50 Mana, Passive), and 3 distinct effects (stats/procs).
            Make it sound powerful, mystical, and balanced for a game.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { 
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            flavorText: { type: Type.STRING },
                            trigger: { type: Type.STRING },
                            cost: { type: Type.STRING },
                            effects: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING } 
                            }
                        },
                        required: ["flavorText", "trigger", "effects"]
                    }
                }
            });
            
            const json = JSON.parse(response.text || '{}');
            setDraft(prev => ({
                ...prev,
                flavorText: json.flavorText || prev.flavorText,
                trigger: json.trigger || prev.trigger,
                cost: json.cost || prev.cost,
                effects: json.effects || prev.effects
            }));
        } catch (e) {
            console.error("Error generating text:", e);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateIcon = async () => {
        if (!draft.name) return;
        setIsImgGenerating(true);
        try {
            const ai = getAI();
            const prompt = `
            Game icon for fantasy RPG enchantment "${draft.name}". 
            Slot: ${draft.slot}. Rarity: ${draft.rarity}.
            Style: High contrast, dark fantasy, digital painting, glowing magical aura, detailed, square, cyberpunk undertones.
            No text.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: { imageConfig: { aspectRatio: '1:1' } }
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData?.data) {
                const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                setDraft(prev => ({ ...prev, iconUrl: url }));
            }
        } catch (e) {
            console.error("Error generating icon:", e);
        } finally {
            setIsImgGenerating(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 pb-24">
            {/* Editor Panel */}
            <div className="flex-1 min-w-0 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded shadow-lg shadow-purple-900/40 shrink-0">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <h1 className="font-header text-2xl md:text-3xl text-white tracking-widest uppercase truncate">Create Enchantment</h1>
                </div>
                
                <p className="text-gray-400 font-mono text-sm mb-6 border-l-2 border-purple-500 pl-4">
                    Forge your legendary enchantment and share it with the community!
                </p>

                <div className="bg-[#0a0a0c] border border-white/10 p-4 md:p-6 rounded-xl space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] pointer-events-none"></div>

                    {/* Name & Icon Gen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Name</label>
                            <div className="flex gap-2 relative">
                                <input 
                                    type="text" 
                                    value={draft.name} 
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="input-cyber w-full p-3 rounded bg-black/50 border-gray-800 text-white focus:border-purple-500"
                                    placeholder="e.g. Soul Reaver's Edge"
                                />
                                <button 
                                    onClick={generateDetails}
                                    disabled={isGenerating || !draft.name}
                                    className="absolute right-1 top-1 bottom-1 px-3 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded flex items-center justify-center disabled:opacity-50 transition-all border border-purple-600/30"
                                    title="Auto-fill with AI"
                                >
                                    <Cpu size={18} className={isGenerating ? "animate-spin" : ""} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Icon URL</label>
                             <div className="flex gap-2 relative">
                                <input 
                                    type="text" 
                                    value={draft.iconUrl || ''} 
                                    onChange={(e) => updateField('iconUrl', e.target.value)}
                                    className="input-cyber w-full p-3 rounded bg-black/50 border-gray-800 text-gray-400"
                                    placeholder="https://..."
                                />
                                <button 
                                    onClick={generateIcon}
                                    disabled={isImgGenerating || !draft.name}
                                    className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded flex items-center justify-center disabled:opacity-50 transition-all border border-blue-600/30"
                                    title="Generate Icon"
                                >
                                    <ImageIcon size={18} className={isImgGenerating ? "animate-pulse" : ""} />
                                </button>
                             </div>
                        </div>
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Slot</label>
                            <select 
                                value={draft.slot} 
                                onChange={(e) => updateField('slot', e.target.value)}
                                className="input-cyber w-full p-3 rounded appearance-none cursor-pointer bg-black/50"
                            >
                                {['Weapon', 'Chest', 'Head', 'Legs', 'Hands', 'Ring', 'Trinket'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Rarity</label>
                            <select 
                                value={draft.rarity} 
                                onChange={(e) => updateField('rarity', e.target.value)}
                                className="input-cyber w-full p-3 rounded appearance-none cursor-pointer bg-black/50"
                            >
                                {['Common', 'Rare', 'Epic', 'Legendary'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Type</label>
                            <select 
                                value={draft.type} 
                                onChange={(e) => updateField('type', e.target.value)}
                                className="input-cyber w-full p-3 rounded appearance-none cursor-pointer bg-black/50"
                            >
                                {['Passive Effect', 'On Use', 'Proc Chance', 'Aura'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Cost</label>
                            <input 
                                type="text" 
                                value={draft.cost} 
                                onChange={(e) => updateField('cost', e.target.value)}
                                className="input-cyber w-full p-3 rounded bg-black/50 border-gray-800"
                                placeholder="e.g. 100 Mana"
                            />
                        </div>
                    </div>

                    {/* Trigger */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Trigger/Proc Condition</label>
                        <input 
                            type="text" 
                            value={draft.trigger || ''} 
                            onChange={(e) => updateField('trigger', e.target.value)}
                            className="input-cyber w-full p-3 rounded bg-black/50 border-gray-800"
                            placeholder="e.g. Chance on spell hit"
                        />
                    </div>

                    {/* Flavor */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Flavor Text/Description</label>
                        <textarea 
                            value={draft.flavorText} 
                            onChange={(e) => updateField('flavorText', e.target.value)}
                            className="input-cyber w-full p-3 rounded h-20 resize-none italic text-gray-400 bg-black/50 border-gray-800"
                            placeholder="Enter lore description..."
                        />
                    </div>

                    {/* Effects List */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Effect Lines (Max 5)</label>
                        </div>
                        <div className="space-y-2">
                            {draft.effects.map((eff, i) => (
                                <div key={i} className="flex gap-2 group">
                                    <input 
                                        type="text" 
                                        value={eff} 
                                        onChange={(e) => updateEffect(i, e.target.value)}
                                        className="input-cyber w-full p-3 rounded font-mono text-sm text-green-400 bg-black/50 border-gray-800 focus:border-green-500"
                                        placeholder="Enter effect..."
                                    />
                                    <button onClick={() => removeEffect(i)} className="p-3 text-gray-600 hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {draft.effects.length < 5 && (
                                <button onClick={addEffect} className="w-full py-2 border border-dashed border-gray-800 text-gray-600 hover:text-gray-400 hover:border-gray-600 rounded text-xs uppercase font-bold tracking-widest transition-all">
                                    + Add Effect Line
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 border-t border-white/10">
                        <button 
                            onClick={() => onSave({...draft, id: Date.now().toString(), createdAt: Date.now()})}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-header text-xl tracking-[0.2em] uppercase rounded shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all active:scale-[0.98] relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2"><Sparkles size={20} /> Create Enchantment</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                    </div>

                </div>
            </div>

            {/* Live Preview Panel - Side on LG, Top/Bottom on Mobile */}
            <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col gap-6">
                 <div className="flex items-center gap-2 pl-1">
                    <h2 className="font-header text-xl text-gray-300 tracking-widest">Live Preview</h2>
                 </div>
                 
                 <div className="lg:sticky lg:top-24 space-y-4">
                     <EnchantmentCard data={draft} />
                     <div className="text-center">
                         <div className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] uppercase tracking-widest font-mono animate-pulse">
                            System Ready
                         </div>
                     </div>
                     {/* Mobile tip */}
                     <div className="block lg:hidden text-center text-xs text-gray-500 font-mono">
                        Preview updates automatically
                     </div>
                 </div>
            </div>
        </div>
    );
};
