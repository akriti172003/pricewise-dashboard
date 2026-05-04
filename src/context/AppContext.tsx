import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { PricingState, AppSettings } from '../types';

// Types & Interfaces
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
  // --- State Management ---
  const [pricing, setPricing] = useState<PricingState>({
    basePrice: 4500,
    occupancyRate: 65,
    demandLevel: 'medium',
    dayType: 'weekday',
    season: 'low',
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('pricewise-settings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      notifications: true,
      currency: 'INR',
    };
  });

  // --- Feedback Systems ---
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // --- Core Business Logic (Memoized for Performance) ---
  const analytics = useMemo(() => {
    let multiplier = 1;
    let reasons: string[] = [];
    let confidence: 'High' | 'Medium' | 'Low' = 'Medium';

    const contextPrefix = "Based on Indian hospitality trends, ";

    // 1. Occupancy Analysis
    if (pricing.occupancyRate > 85) {
      multiplier += 0.25;
      reasons.push(`with ${pricing.occupancyRate}% occupancy, a 25% price increase maximizes yield.`);
      confidence = 'High';
    } else if (pricing.occupancyRate < 40) {
      multiplier -= 0.15;
      reasons.push(`low ${pricing.occupancyRate}% occupancy suggests a 15% discount to drive volume.`);
      confidence = 'Low';
    }

    // 2. Demand & Seasonality Logic
    if (pricing.demandLevel === 'high') multiplier += 0.20;
    if (pricing.dayType === 'weekend') multiplier += 0.15;
    if (pricing.season === 'peak') multiplier += 0.30;

    const suggested = Math.round(pricing.basePrice * multiplier);
    
    // 3. Revenue Projections
    const daily = pricing.basePrice * (pricing.occupancyRate / 100);
    // Predicted occupancy logic: higher price reduces occupancy slightly, lower price boosts it
    const priceDiffRatio = suggested / pricing.basePrice;
    const predictedOccupancy = Math.min(100, pricing.occupancyRate * (1 / priceDiffRatio));
    const predictedDaily = suggested * (predictedOccupancy / 100);

    return {
      suggested,
      reason: contextPrefix + (reasons.length > 0 ? reasons.join(" ") : "current pricing is stable for market conditions."),
      confidence,
      daily,
      predictedDaily
    };
  }, [pricing]);

  // --- Handlers ---
  const autoOptimize = useCallback(() => {
    setPricing(prev => ({
      ...prev,
      basePrice: analytics.suggested,
      occupancyRate: Math.min(90, prev.occupancyRate + 5) // Simulate efficiency gain
    }));
    showToast("Strategy optimized for maximum revenue 🚀", "success");
  }, [analytics.suggested, showToast]);

  const applyRecommendation = useCallback((type: 'increase' | 'decrease', amount: number) => {
    setPricing(prev => ({
      ...prev,
      basePrice: type === 'increase' ? prev.basePrice + amount : Math.max(100, prev.basePrice - amount)
    }));
    showToast("Pricing adjusted successfully", "info");
  }, [showToast]);

  // --- Persistence & Theme Effects ---
  useEffect(() => {
    localStorage.setItem('pricewise-settings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings]);

  // --- Context Value Construction ---
  const value = useMemo(() => ({
    pricing,
    setPricing,
    settings,
    setSettings,
    suggestedPrice: analytics.suggested,
    recommendationReason: analytics.reason,
    confidenceLevel: analytics.confidence,
    revenue: {
      current: Math.round(analytics.daily * 30),
      predicted: Math.round(analytics.predictedDaily * 30),
      breakdown: {
        daily: Math.round(analytics.daily),
        weekly: Math.round(analytics.daily * 7),
        monthly: Math.round(analytics.daily * 30)
      }
    },
    autoOptimize,
    applyRecommendation,
    showToast,
    toasts
  }), [pricing, settings, analytics, autoOptimize, applyRecommendation, showToast, toasts]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};