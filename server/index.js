const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Client, GatewayIntentBits } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mystic';

// === MIDDLEWARE ===
app.use(cors());
app.use(bodyParser.json());

// === DATABASE CONNECTION ===
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// === DATA MODELS ===
const enchantmentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // Client-generated ID
  name: String,
  slot: String,
  rarity: String,
  type: String,
  cost: String,
  trigger: String,
  flavorText: String,
  effects: [String],
  iconUrl: String,
  author: String,
  itemScore: Number,
  stats: {
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 }
  },
  createdAt: { type: Number, default: Date.now }
});

const Enchantment = mongoose.model('Enchantment', enchantmentSchema);

// === DISCORD BOT ===
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

if (process.env.DISCORD_BOT_TOKEN) {
    client.login(process.env.DISCORD_BOT_TOKEN)
        .then(() => console.log(`🤖 Bot logged in as ${client.user.tag}`))
        .catch(err => console.error("⚠️ Bot Login Failed (Check Token)", err));
}

// === ROUTES ===

// Health Check
app.get('/api/status', async (req, res) => {
    const count = await Enchantment.countDocuments();
    res.json({ 
        status: 'online', 
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        bot: client.isReady() ? 'ready' : 'offline',
        items: count 
    });
});

// Get All
app.get('/api/enchantments', async (req, res) => {
    try {
        const items = await Enchantment.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create
app.post('/api/enchantments', async (req, res) => {
    try {
        const item = new Enchantment(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Delete
app.delete('/api/enchantments/:id', async (req, res) => {
    try {
        await Enchantment.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Actions
app.post('/api/enchantments/:id/like', async (req, res) => {
    try {
        // Simple increment for now. Real apps would track User ID likes.
        await Enchantment.updateOne({ id: req.params.id }, { $inc: { "stats.likes": 1 } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/enchantments/:id/:stat', async (req, res) => {
    const { stat } = req.params;
    if (!['views', 'downloads'].includes(stat)) return res.status(400).json({ error: "Invalid stat" });
    
    try {
        const update = {};
        update[`stats.${stat}`] = 1;
        await Enchantment.updateOne({ id: req.params.id }, { $inc: update });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Auth Verification
app.post('/api/auth/verify', async (req, res) => {
    const { token } = req.body;
    try {
        // 1. Validate Token with Discord API
        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error("Invalid Token");
        const userData = await userRes.json();

        // 2. Check Guild Membership using Bot (More Reliable than User OAuth)
        let isMember = false;
        const guildId = process.env.GUILD_ID || '1408571660994482298';
        
        if (client.isReady()) {
            try {
                const guild = await client.guilds.fetch(guildId);
                const member = await guild.members.fetch(userData.id);
                if (member) isMember = true;
            } catch (e) {
                console.log(`User ${userData.username} not found in guild.`);
            }
        } else {
            // Fallback to User OAuth Guilds if bot is offline
            const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
                 headers: { Authorization: `Bearer ${token}` }
            });
            if (guildsRes.ok) {
                const guilds = await guildsRes.json();
                isMember = guilds.some(g => g.id === guildId);
            }
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
        console.error("Verification Error:", e);
        res.status(401).json({ error: "Verification Failed" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});