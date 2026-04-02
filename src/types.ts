export type DemandLevel = 'low' | 'medium' | 'high';
export type DayType = 'weekday' | 'weekend';
export type Season = 'low' | 'peak';

export interface PricingState {
  basePrice: number;
  occupancyRate: number;
  demandLevel: DemandLevel;
  dayType: DayType;
  season: Season;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  action: string;
  type: 'increase' | 'decrease' | 'neutral';
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  currency: string;
}
