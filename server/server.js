import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Scenario from './models/Scenario.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Note: Replace the URI with your MongoDB Atlas string or use a local one
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pricewise';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- API Routes ---

/**
 * @route   GET /
 * @desc    Health check for the API
 */
app.get('/', (req, res) => {
  res.send('PriceWise Smart Pricing API is live 🚀');
});

/**
 * @route   POST /api/save-scenario
 * @desc    Saves a pricing simulation to the database
 */
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

/**
 * @route   GET /api/history
 * @desc    Retrieves all past pricing simulations
 */
app.get('/api/history', async (req, res) => {
  try {
    const history = await Scenario.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});