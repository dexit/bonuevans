import { BonusInputs } from './types';

export const DEFAULT_INPUTS: BonusInputs = {
  deposit: 100,
  matchPercent: 100,
  matchUpTo: 500,
  wagerMultiplier: 35,
  rtp: 96.5,
  volatility: 0.5,
  riskScore: 5,
  loopLimit: 1000,
  metricWeights: {
    'Hold %': 1,
    'Bonus Cost': 1,
    'Cannibalization': 1,
    'VIP Net Contribution': 1,
    'Churn 30d': 1,
  },
};

export const SIMULATION_ITERATIONS = 2000;
export const CHART_COLORS = {
  primary: '#10b981', // Emerald 500
  secondary: '#6366f1', // Indigo 500
  danger: '#ef4444', // Red 500
  warning: '#f59e0b', // Amber 500
  neutral: '#64748b', // Slate 500
};

export const MODEL_NAME = 'gemini-3-flash-preview';