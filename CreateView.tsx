
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Enchantment, User } from './types';
import { EnchantmentCard } from './EnchantmentCard';
import { GoogleGenAI, Type } from '@google/genai';
import { Sparkles, Image as ImageIcon, Trash2, Cpu, Settings, Key, Lock, Shield } from 'lucide-react';

interface CreateViewProps {
    onSave: (e: Enchantment) => void;
    user: User | null;
    onLoginRequest: () => void;
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

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1633355209376-8575087f941f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=400&auto=format&fit=crop',
];

export const CreateView: React.FC<CreateViewProps> = ({ onSave, user, onLoginRequest }) => {
    // If not user, show locked state
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mb-6 border-2 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <Lock size={48} className="text-red-500" />
                </div>
                <h2 className="font-header text-4xl text-white mb-2 tracking-widest uppercase">Access Denied</h2>
                <p className="font-mono text-gray-400 max-w-md mb-8">
                    The Forge is restricted to verified members of the Mystic Enchanters order. 
                    You must verify your identity and server membership to craft legendary items.
                </p>
                <button 
                    onClick={onLoginRequest}
                    className="flex items-center gap-2 px-8 py-4 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-lg transition-all font-bold uppercase tracking-widest shadow-lg hover:shadow-[0_0_20px_rgba(88,101,242,0.5)] transform hover:-translate-y-1"
                >
                    <Shield size={20} /> Verify with Discord
                </button>
            </div>
        );
    }

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
        iconUrl: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?q=80&w=400&auto=format&fit=crop',
        author: user.username
    });
    
    // ... existing logic ...
    const [isGenerating, setIsGenerating] = useState(false);
    const [isImgGenerating, setIsImgGenerating] = useState(false);
    
    // API Key State
    const [apiKey, setApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('user_gemini_key');
        if (storedKey) setApiKey(storedKey);
    }, []);

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKey(e.target.value);
        localStorage.setItem('user_gemini_key', e.target.value);
    };

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
    const getAI = () => {
        const keyToUse = apiKey || process.env.API_KEY;
        if (!keyToUse) return null;
        return new GoogleGenAI({ apiKey: keyToUse });
    };

    const generateDetails = async () => {
        if (!draft.name) return;
        setIsGenerating(true);
        try {
            const ai = getAI();
            if (!ai) throw new Error("No API Key");

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
            console.warn("AI Generation unavailable or failed. Using Mock Data.", e);
            setTimeout(() => {
                setDraft(prev => ({
                    ...prev,
                    flavorText: `Legends say that ${prev.name} was crafted during the Age of Stars, imbued with the raw energy of the ${prev.slot}.`,
                    trigger: "Chance on hit",
                    cost: "Passive",
                    effects: [
                        `Increases ${prev.slot === 'Weapon' ? 'Damage' : 'Armor'} by 150`,
                        `+5% Critical Strike Chance`,
                        `User radiates a faint magical aura`
                    ]
                }));
            }, 1000);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateIcon = async () => {
        if (!draft.name) return;
        setIsImgGenerating(true);
        try {
            const ai = getAI();
            if (!ai) throw new Error("No API Key");

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
             console.warn("AI Image Generation unavailable or failed. Using Fallback.", e);
             const randomImg = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
             setTimeout(() => {
                 setDraft(prev => ({ ...prev, iconUrl: randomImg }));
             }, 1000);
        } finally {
            setIsImgGenerating(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 pb-24">
            {/* Editor Panel */}
            <div className="flex-1 min-w-0 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded shadow-lg shadow-purple-900/40 shrink-0">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <h1 className="font-header text-2xl md:text-3xl text-white tracking-widest uppercase truncate">Create Enchantment</h1>
                    </div>
                    
                    {/* API Key Toggle */}
                    <button 
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        className="p-2 text-gray-500 hover:text-white transition-colors"
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                </div>
                
                {showKeyInput && (
                    <div className="bg-[#111] border border-gray-700 p-4 rounded-lg animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                            <Key size={12} /> API Configuration
                        </div>
                        <p className="text-gray-400 text-xs mb-3">
                            Enter your free Gemini API Key to enable AI generation. If left empty, the app will use "Simulation Mode" with mock data.
                            <br/>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Get a free key here</a>.
                        </p>
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={handleKeyChange}
                            placeholder="Paste your API Key here (starts with AIza...)"
                            className="input-cyber w-full p-2 rounded bg-black border-gray-600 text-white"
                        />
                    </div>
                )}
                
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
                                    title={apiKey ? "Generate with Gemini" : "Simulate Generation (No Key)"}
                                >
                                    <Cpu size={18} className={isGenerating ? "animate-spin" : ""} />
                                </button>
                            </div>
                            {!apiKey && (
                                <p className="text-[10px] text-gray-500 text-right">Running in Simulation Mode (No API Key)</p>
                            )}
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
                 </div>
            </div>
        </div>
    );
};
