
import { BonusInputs, MetricConfig } from './types';

export const DEFAULT_METRICS: MetricConfig[] = [
  { id: 'm1', name: 'Hold %', formulaType: 'HOLD_PERCENT', target: 0.065, weight: 1, isPercentage: true },
  { id: 'm2', name: 'Bonus Cost', formulaType: 'BONUS_COST', target: 0.35, weight: 1, isPercentage: true },
  { id: 'm3', name: 'Cannibalization', formulaType: 'CANNIBALIZATION', target: 0.15, weight: 1, isPercentage: true },
  { id: 'm4', name: 'VIP Net Contribution', formulaType: 'NET_CONTRIBUTION', target: 0, weight: 1, isCurrency: true },
  { id: 'm5', name: 'Churn risk', formulaType: 'CHURN_PROB', target: 0.08, weight: 1, isPercentage: true },
];

export const DEFAULT_INPUTS: BonusInputs = {
  mode: 'casino',
  deposit: 100,
  matchPercent: 100,
  matchUpTo: 500,
  wagerMultiplier: 35,
  rtp: 96.5,
  volatility: 0.5,
  riskScore: 5,
  loopLimit: 1500,
  manualBetSize: 2,
  useManualBet: false,
  minOdds: 1.8,
  isFreeBet: false,
  bookieMargin: 5,
  metrics: DEFAULT_METRICS
};

export const SIMULATION_ITERATIONS = 2000;
export const CHART_COLORS = {
  primary: '#10b981',
  secondary: '#6366f1',
  danger: '#ef4444',
  warning: '#f59e0b',
  neutral: '#64748b',
};

export const MODEL_NAME = 'gemini-3-flash-preview';
