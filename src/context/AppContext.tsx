import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { PricingState, AppSettings } from '../types';

// Step 1: Define the Backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  saveCurrentScenario: () => Promise<void>; // Added for backend persistence
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
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('pricewise-settings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      notifications: true,
      currency: 'INR',
    };
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // --- Backend Integration Logic ---
  const saveCurrentScenario = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pricing,
          suggestedPrice: analytics.suggested,
          timestamp: new Date()
        }),
      });

      if (response.ok) {
        showToast("Scenario saved to cloud database ☁️", "success");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      showToast("Cloud sync failed. Check connection.", "error");
      console.error("Save error:", error);
    }
  }, [pricing, showToast]);

  const analytics = useMemo(() => {
    let multiplier = 1;
    let reasons: string[] = [];
    let confidence: 'High' | 'Medium' | 'Low' = 'Medium';

    const contextPrefix = "Based on Indian hospitality trends, ";

    if (pricing.occupancyRate > 85) {
      multiplier += 0.25;
      reasons.push(`with ${pricing.occupancyRate}% occupancy, a 25% price increase maximizes yield.`);
      confidence = 'High';
    } else if (pricing.occupancyRate < 40) {
      multiplier -= 0.15;
      reasons.push(`low ${pricing.occupancyRate}% occupancy suggests a 15% discount to drive volume.`);
      confidence = 'Low';
    }

    if (pricing.demandLevel === 'high') multiplier += 0.20;
    if (pricing.dayType === 'weekend') multiplier += 0.15;
    if (pricing.season === 'peak') multiplier += 0.30;

    const suggested = Math.round(pricing.basePrice * multiplier);
    const daily = pricing.basePrice * (pricing.occupancyRate / 100);
    const priceDiffRatio = suggested / pricing.basePrice;
    const predictedOccupancy = Math.min(100, pricing.occupancyRate * (1 / priceDiffRatio));
    const predictedDaily = suggested * (predictedOccupancy / 100);

    return { suggested, reason: contextPrefix + (reasons.length > 0 ? reasons.join(" ") : "current pricing is stable."), confidence, daily, predictedDaily };
  }, [pricing]);

  const autoOptimize = useCallback(() => {
    setPricing(prev => ({
      ...prev,
      basePrice: analytics.suggested,
      occupancyRate: Math.min(90, prev.occupancyRate + 5)
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

  useEffect(() => {
    localStorage.setItem('pricewise-settings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings]);

  const value = useMemo(() => ({
    pricing, setPricing, settings, setSettings,
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
    autoOptimize, applyRecommendation, showToast, toasts,
    saveCurrentScenario // Exported function
  }), [pricing, settings, analytics, autoOptimize, applyRecommendation, showToast, toasts, saveCurrentScenario]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};