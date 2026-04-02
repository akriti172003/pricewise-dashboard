import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PricingState, AppSettings, DemandLevel } from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  pricing: PricingState;
  setPricing: React.Dispatch<React.SetStateAction<PricingState>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  suggestedPrice: number;
  recommendationReason: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  revenue: {
    current: number;
    predicted: number;
    breakdown: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  autoOptimize: () => void;
  applyRecommendation: (type: 'increase' | 'decrease', amount: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toasts: Toast[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pricing, setPricing] = useState<PricingState>({
    basePrice: 4500,
    occupancyRate: 65,
    demandLevel: 'medium',
    dayType: 'weekday',
    season: 'low',
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('pricewise-settings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      notifications: true,
      currency: 'INR',
    };
  });

  useEffect(() => {
    localStorage.setItem('pricewise-settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Logic for suggested price and reason
  const calculateOptimization = () => {
    let multiplier = 1;
    let reasons: string[] = [];
    let confidence: 'High' | 'Medium' | 'Low' = 'Medium';

    // Real-world context prefix
    const contextPrefix = "Based on Indian hospitality trends, ";

    // Occupancy logic
    if (pricing.occupancyRate > 85) {
      multiplier += 0.25;
      reasons.push(`with ${pricing.occupancyRate}% occupancy, increasing your price by 25% can maximize revenue without significantly affecting bookings.`);
      confidence = 'High';
    } else if (pricing.occupancyRate > 70) {
      multiplier += 0.1;
      reasons.push(`healthy ${pricing.occupancyRate}% occupancy allows for a 10% premium to capture higher yield.`);
      confidence = 'High';
    } else if (pricing.occupancyRate < 40) {
      multiplier -= 0.15;
      reasons.push(`low ${pricing.occupancyRate}% occupancy requires a 15% price reduction to boost volume and stay competitive.`);
      confidence = 'Low';
    } else {
      reasons.push("current occupancy levels are stable.");
    }

    // Demand logic
    if (pricing.demandLevel === 'high') {
      multiplier += 0.2;
      reasons.push("High market demand justifies aggressive pricing.");
      if (pricing.occupancyRate > 60) confidence = 'High';
    } else if (pricing.demandLevel === 'low') {
      multiplier -= 0.1;
      reasons.push("Weak market demand requires lower rates to maintain flow.");
      confidence = 'Low';
    }

    // Day Type logic
    if (pricing.dayType === 'weekend') {
      multiplier += 0.15;
      reasons.push("Weekend leisure demand is typically higher in India, allowing for a weekend premium.");
    }

    // Season logic
    if (pricing.season === 'peak') {
      multiplier += 0.3;
      reasons.push("Peak season baseline pricing is applied to capture maximum seasonal value.");
    }

    const suggested = Math.round(pricing.basePrice * multiplier);
    const reason = contextPrefix + (reasons.length > 0 ? reasons.join(" ") : "current pricing is aligned with market conditions.");
    
    return { suggested, reason, confidence };
  };

  const { suggested: suggestedPrice, reason: recommendationReason, confidence: confidenceLevel } = calculateOptimization();

  // Logic for revenue breakdown
  const dailyRevenue = pricing.basePrice * (pricing.occupancyRate / 100);
  const weeklyRevenue = dailyRevenue * 7;
  const monthlyRevenue = dailyRevenue * 30;

  const predictedDaily = suggestedPrice * (Math.min(100, pricing.occupancyRate + (suggestedPrice < pricing.basePrice ? 12 : -8)) / 100);
  const predictedMonthly = predictedDaily * 30;

  const autoOptimize = () => {
    // Logic to find the "sweet spot"
    let targetPrice = pricing.basePrice;
    let targetOccupancy = pricing.occupancyRate;

    if (pricing.demandLevel === 'high' || pricing.season === 'peak') {
      targetPrice = Math.round(pricing.basePrice * 1.25);
      targetOccupancy = Math.max(70, pricing.occupancyRate - 5);
    } else if (pricing.demandLevel === 'low') {
      targetPrice = Math.round(pricing.basePrice * 0.85);
      targetOccupancy = Math.min(90, pricing.occupancyRate + 15);
    } else {
      targetPrice = suggestedPrice;
      targetOccupancy = 80; // Target healthy occupancy
    }

    setPricing(prev => ({
      ...prev,
      basePrice: targetPrice,
      occupancyRate: targetOccupancy
    }));

    showToast("Pricing updated successfully 🚀", "success");
  };

  const applyRecommendation = (type: 'increase' | 'decrease', amount: number) => {
    setPricing(prev => ({
      ...prev,
      basePrice: type === 'increase' ? prev.basePrice + amount : Math.max(100, prev.basePrice - amount)
    }));
    showToast("Pricing updated successfully 🚀", "success");
  };

  return (
    <AppContext.Provider value={{
      pricing,
      setPricing,
      settings,
      setSettings,
      suggestedPrice,
      recommendationReason,
      confidenceLevel,
      revenue: {
        current: Math.round(monthlyRevenue),
        predicted: Math.round(predictedMonthly),
        breakdown: {
          daily: Math.round(dailyRevenue),
          weekly: Math.round(weeklyRevenue),
          monthly: Math.round(monthlyRevenue)
        }
      },
      autoOptimize,
      applyRecommendation,
      showToast,
      toasts
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
