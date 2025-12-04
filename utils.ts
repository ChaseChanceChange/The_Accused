
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Enchantment } from './types';

export const calculatePowerLevel = (e: Enchantment): number => {
    let score = 0;

    // 1. Rarity Base Score
    // Sets the baseline expectation for the item
    switch(e.rarity) {
        case 'Legendary': score += 400; break;
        case 'Epic': score += 250; break;
        case 'Rare': score += 150; break;
        case 'Common': score += 50; break;
        default: score += 10;
    }

    // 2. Slot Multiplier
    // Weapons and Chest pieces typically carry more "stat budget" in RPGs
    let multiplier = 1.0;
    if (e.slot === 'Weapon') multiplier = 1.25;
    if (e.slot === 'Chest' || e.slot === 'Legs') multiplier = 1.15;
    if (e.slot === 'Trinket') multiplier = 1.1; // Trinkets are powerful but situational

    // 3. Text Analysis (Effects & Flavor)
    // We combine flavor text and effects to look for keywords and numbers
    const textToAnalyze = [...e.effects, e.trigger].join(' ').toLowerCase();
    
    // Extract numbers to gauge raw stat magnitude
    // e.g., "300 strength" -> 300
    const numbers = textToAnalyze.match(/(\d+(?:\.\d+)?)/g)?.map(Number) || [];
    
    // Weighted Sum of Numbers
    // We dampen large numbers (like 300 str) vs small important numbers (like 10% crit)
    // This is a heuristic: Raw stats usually in 100s, percentages in 1-50s.
    numbers.forEach(num => {
        if (num > 100) {
            score += num * 0.15; // Raw stats (e.g. +300 Str = +45 score)
        } else if (num <= 100 && num > 0) {
            score += num * 1.5; // Percentages or Durations (e.g. 10% = +15 score)
        }
    });

    // Keyword Analysis
    // specific words imply powerful mechanics
    const keywords = [
        { word: 'damage', val: 20 },
        { word: 'heal', val: 20 },
        { word: 'stun', val: 50 }, // CC is expensive
        { word: 'silence', val: 40 },
        { word: 'immune', val: 100 }, // Immunity is very strong
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
    // Passive effects are generally more valuable than conditional ones (uptime)
    if (e.type === 'Passive Effect' || e.type === 'Aura') {
        score *= 1.1;
    }

    return Math.floor(score * multiplier);
};
