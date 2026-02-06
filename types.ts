
export type BonusMode = 'casino' | 'sportsbook';

export type MetricBaseFormula = 
  | 'HOLD_PERCENT' 
  | 'BONUS_COST' 
  | 'CANNIBALIZATION' 
  | 'NET_CONTRIBUTION' 
  | 'CHURN_PROB' 
  | 'ROI_PERCENT';

export interface MetricConfig {
  id: string;
  name: string;
  formulaType: MetricBaseFormula;
  target: number;
  weight: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export interface BonusInputs {
  mode: BonusMode;
  deposit: number;
  matchPercent: number;
  matchUpTo: number;
  wagerMultiplier: number;
  rtp: number;
  volatility: number;
  riskScore: number;
  loopLimit: number;
  manualBetSize: number;
  useManualBet: boolean;
  minOdds: number;
  isFreeBet: boolean;
  bookieMargin: number;
  metrics: MetricConfig[];
}

export interface RiskMetric extends MetricConfig {
  actual: number;
  formulaString: string;
  score: number;
}

export interface SimulationResult {
  ev: number;
  winRate: number;
  bustRate: number;
  averageEndBalance: number;
  medianEndBalance: number;
  minBalance: number;
  maxBalance: number;
  resultsDistribution: number[]; 
  theoreticalCost: number;
  wagerCompletedAvg: number;
  riskMetrics: RiskMetric[];
  compositeRiskScore: number;
  totalWageringRequired: number;
}

export interface Preset {
  id: string;
  name: string;
  inputs: BonusInputs;
  timestamp: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
