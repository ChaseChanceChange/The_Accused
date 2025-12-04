
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data', 'enchantments.json');

app.use(cors());
app.use(bodyParser.json());

// Load Data
let enchantments = [];
if (fs.existsSync(DATA_FILE)) {
    try {
        enchantments = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        console.error("Failed to load data", e);
    }
}

const saveData = () => {
    try {
        if (!fs.existsSync(path.dirname(DATA_FILE))) {
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(enchantments, null, 2));
    } catch (e) {
        console.error("Failed to save data", e);
    }
};

// --- ROUTES ---

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', count: enchantments.length });
});

app.get('/api/enchantments', (req, res) => {
    res.json(enchantments);
});

app.post('/api/enchantments', (req, res) => {
    const item = req.body;
    if (!item.id) item.id = Date.now().toString();
    enchantments.unshift(item);
    saveData();
    res.status(201).json(item);
});

app.delete('/api/enchantments/:id', (req, res) => {
    const { id } = req.params;
    enchantments = enchantments.filter(e => e.id !== id);
    saveData();
    res.json({ success: true });
});

app.post('/api/enchantments/:id/like', (req, res) => {
    const { id } = req.params;
    const item = enchantments.find(e => e.id === id);
    if (item) {
        // Toggle logic is handled on client for 'isLiked', server tracks count
        // Simplified: just increment for demo
        item.stats.likes = (item.stats.likes || 0) + 1;
        saveData();
    }
    res.json({ success: true });
});

app.post('/api/enchantments/:id/:stat', (req, res) => {
    const { id, stat } = req.params;
    const item = enchantments.find(e => e.id === id);
    if (item && item.stats[stat] !== undefined) {
        item.stats[stat]++;
        saveData();
    }
    res.json({ success: true });
});

app.post('/api/auth/verify', async (req, res) => {
    const { token } = req.body;
    try {
        // 1. Fetch User
        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error("Discord API Error");
        const userData = await userRes.json();

        // 2. Fetch Guilds
        const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
             headers: { Authorization: `Bearer ${token}` }
        });
        
        let isMember = false;
        if (guildsRes.ok) {
            const guilds = await guildsRes.json();
            const guildId = process.env.GUILD_ID || '1408571660994482298';
            isMember = guilds.some(g => g.id === guildId);
        }

        res.json({
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            avatar: userData.avatar 
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/0.png`,
            isMember: isMember
        });

    } catch (e) {
        console.error("Auth Error", e);
        res.status(401).json({ error: "Verification Failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Mystic Backend running on port ${PORT}`);
});
