
import { BonusInputs, SimulationResult, RiskMetric } from '../types';
import { SIMULATION_ITERATIONS } from '../constants';

export const runSimulation = (inputs: BonusInputs): SimulationResult => {
  const {
    deposit,
    matchPercent,
    matchUpTo,
    wagerMultiplier,
    rtp,
    volatility,
    riskScore,
    loopLimit
  } = inputs;

  const bonusAmount = Math.min(deposit * (matchPercent / 100), matchUpTo);
  const startBankroll = deposit + bonusAmount;
  const wageringReq = (deposit + bonusAmount) * wagerMultiplier;

  const betSizePercentage = 0.005 + ((riskScore - 1) / 9) * 0.095; 
  const fixedBetSize = Math.max(0.10, startBankroll * betSizePercentage);

  const stdDevPerUnit = 1 + (volatility * 14);

  let totalEndBalance = 0;
  let wins = 0;
  let busts = 0;
  let totalWageredGlobal = 0;
  const balances: number[] = [];
  
  for (let i = 0; i < SIMULATION_ITERATIONS; i++) {
    let currentBalance = startBankroll;
    let wageredSoFar = 0;
    let spins = 0;

    while (wageredSoFar < wageringReq && currentBalance > 0 && spins < loopLimit) {
      const bet = Math.min(fixedBetSize, currentBalance);
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

      const netChange = (bet * ((rtp / 100) - 1)) + (bet * stdDevPerUnit * z);
      
      currentBalance += netChange;
      wageredSoFar += bet;
      spins++;
      
      if (currentBalance < 0.01) currentBalance = 0;
    }

    balances.push(currentBalance);
    totalEndBalance += currentBalance;
    totalWageredGlobal += wageredSoFar;
    
    if (currentBalance >= 0.01 && wageredSoFar >= wageringReq) {
      wins++;
    } else {
      busts++;
    }
  }

  balances.sort((a, b) => a - b);
  const avgEnd = totalEndBalance / SIMULATION_ITERATIONS;
  const ev = avgEnd - deposit;

  // Calculation of Operator Risk Metrics (Placeholder logic to be refined by Excel formulas)
  const avgWagered = totalWageredGlobal / SIMULATION_ITERATIONS;
  const holdActual = (deposit + bonusAmount - avgEnd) / (avgWagered || 1);
  const bonusCostActual = bonusAmount / (avgWagered || 1);
  const cannibalizationActual = (bonusAmount / startBankroll) * 0.85; // Heuristic
  
  const riskMetrics: RiskMetric[] = [
    {
      name: 'Hold %',
      actual: holdActual,
      target: 0.065,
      formula: '1-RTP',
      score: holdActual < 0.065 ? 2 : 0,
      isPercentage: true
    },
    {
      name: 'Bonus Cost',
      actual: bonusCostActual,
      target: 0.35,
      formula: 'B/W',
      score: bonusCostActual > 0.35 ? 3 : 0,
      isPercentage: true
    },
    {
      name: 'Cannibalization',
      actual: cannibalizationActual,
      target: 0.15,
      formula: 'B/Cash',
      score: cannibalizationActual > 0.15 ? 4 : 0,
      isPercentage: true
    },
    {
      name: 'VIP Net Contribution',
      actual: ev * -100, // Scaled for demo
      target: 0,
      formula: 'NGR-Cost',
      score: ev > 0 ? 5 : 0,
      isCurrency: true
    },
    {
      name: 'Churn 30d',
      actual: 0.11,
      target: 0.08,
      formula: 'P(Bust)',
      score: 1,
      isPercentage: true
    }
  ];

  const compositeRiskScore = riskMetrics.reduce((sum, m) => sum + m.score, 0);

  return {
    ev,
    winRate: (wins / SIMULATION_ITERATIONS) * 100,
    bustRate: (busts / SIMULATION_ITERATIONS) * 100,
    averageEndBalance: avgEnd,
    medianEndBalance: balances[Math.floor(balances.length / 2)],
    minBalance: balances[0],
    maxBalance: balances[balances.length - 1],
    resultsDistribution: balances,
    theoreticalCost: -ev,
    wagerCompletedAvg: avgWagered,
    riskMetrics,
    compositeRiskScore
  };
};

export const generateHistogramData = (data: number[], bins: number = 20) => {
  if (data.length === 0) return [];
  const min = 0;
  const max = Math.max(...data, 100);
  const width = (max - min) / bins;
  
  const histogram = new Array(bins).fill(0).map((_, i) => ({
    range: `${Math.floor(min + i * width)}-${Math.floor(min + (i + 1) * width)}`,
    value: min + (i * width) + (width / 2),
    count: 0
  }));

  data.forEach(val => {
    const index = Math.min(Math.floor((val - min) / width), bins - 1);
    if (index >= 0) histogram[index].count++;
  });

  return histogram;
};
