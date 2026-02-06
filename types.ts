
export interface BonusInputs {
  deposit: number;
  matchPercent: number;
  matchUpTo: number;
  wagerMultiplier: number;
  rtp: number; // Percentage 0-100
  volatility: number; // 0-1
  riskScore: number; // 1-10 (Aggression)
  loopLimit: number;
  metricWeights: { [key: string]: number };
}

export interface RiskMetric {
  name: string;
  actual: number;
  target: number;
  formula: string;
  score: number;
  weight: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export interface SimulationResult {
  ev: number;
  winRate: number; // % of times wager completed
  bustRate: number; // % of times balance hit 0
  averageEndBalance: number;
  medianEndBalance: number;
  minBalance: number;
  maxBalance: number;
  resultsDistribution: number[]; 
  theoreticalCost: number;
  wagerCompletedAvg: number;
  // New Operator Risk Metrics
  riskMetrics: RiskMetric[];
  compositeRiskScore: number;
}

export interface ChartDataPoint {
  range: string;
  count: number;
  value: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}