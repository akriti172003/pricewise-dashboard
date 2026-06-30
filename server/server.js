import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Scenario from './models/Scenario.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pricewise';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('PriceWise Smart Pricing API is live 🚀');
});

app.post('/api/save-scenario', async (req, res) => {
  try {
    const { basePrice, occupancyRate, demandLevel, dayType, season } = req.body;

    const newScenario = new Scenario({
      basePrice,
      occupancyRate,
      demandLevel,
      dayType,
      season,
      createdAt: new Date()
    });

    const savedScenario = await newScenario.save();
    res.status(201).json({
      success: true,
      message: 'Pricing scenario saved successfully!',
      data: savedScenario
    });
  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save scenario',
      error: error.message
    });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await Scenario.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

/**
 * @route   POST /api/ai-strategy
 * @desc    Uses Groq (Llama 3.3) to generate a pricing strategy, confidence level, and reasoning
 */
app.post('/api/ai-strategy', async (req, res) => {
  try {
    const { basePrice, occupancyRate, demandLevel, dayType, season } = req.body;

    const prompt = `You are a hospitality revenue management consultant for the Indian market.

Given these inputs:
- Base price: ₹${basePrice}
- Occupancy rate: ${occupancyRate}%
- Demand level: ${demandLevel}
- Day type: ${dayType}
- Season: ${season}

Weigh these factors together, including any tradeoffs or contradictions between them (e.g. high demand but low occupancy), the way an experienced revenue manager would. Then respond with ONLY valid JSON, no markdown, no extra text, in this exact shape:
{"multiplier": <number between 0.7 and 1.5>, "confidence": "High" | "Medium" | "Low", "reason": "<one sentence consultant-style explanation referencing the specific numbers>"}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from Groq: ' + JSON.stringify(data));
    }

    const raw = data.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({ success: true, ...parsed });
  } catch (error) {
    console.error('AI Strategy Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI strategy generation failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});