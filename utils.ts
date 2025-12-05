
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Enchantment } from './types';

export const calculatePowerLevel = (e: Enchantment): number => {
    let score = 0;

    // 1. Rarity Base Score
    switch(e.rarity) {
        case 'Legendary': score += 400; break;
        case 'Epic': score += 250; break;
        case 'Rare': score += 150; break;
        case 'Common': score += 50; break;
        default: score += 10;
    }

    // 2. Slot Multiplier
    let multiplier = 1.0;
    if (e.slot === 'Weapon') multiplier = 1.25;
    if (e.slot === 'Chest' || e.slot === 'Legs') multiplier = 1.15;
    if (e.slot === 'Trinket') multiplier = 1.1;

    // 3. Text Analysis (Effects & Flavor)
    const textToAnalyze = [...e.effects, e.trigger].join(' ').toLowerCase();
    
    // Extract numbers to gauge raw stat magnitude
    const numbers = textToAnalyze.match(/(\d+(?:\.\d+)?)/g)?.map(Number) || [];
    
    numbers.forEach(num => {
        if (num > 100) {
            score += num * 0.15; // Raw stats
        } else if (num <= 100 && num > 0) {
            score += num * 1.5; // Percentages
        }
    });

    // Keyword Analysis
    const keywords = [
        { word: 'damage', val: 20 },
        { word: 'heal', val: 20 },
        { word: 'stun', val: 50 },
        { word: 'silence', val: 40 },
        { word: 'immune', val: 100 },
        { word: 'invulnerable', val: 100 },
        { word: 'kill', val: 50 },
        { word: 'destroy', val: 40 },
        { word: 'summon', val: 60 },
        { word: 'shockwave', val: 30 },
        { word: 'critical', val: 25 },
        { word: 'speed', val: 20 }
    ];

    keywords.forEach(k => {
        if (textToAnalyze.includes(k.word)) score += k.val;
    });

    // 4. Trigger Analysis
    if (e.type === 'Passive Effect' || e.type === 'Aura') {
        score *= 1.1;
    }

    return Math.floor(score * multiplier);
};
