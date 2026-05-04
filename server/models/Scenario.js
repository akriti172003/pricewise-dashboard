import mongoose from 'mongoose';

const ScenarioSchema = new mongoose.Schema({
  basePrice: { type: Number, required: true },
  occupancyRate: { type: Number, required: true },
  demandLevel: { type: String, required: true },
  dayType: { type: String, required: true },
  season: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Scenario', ScenarioSchema);