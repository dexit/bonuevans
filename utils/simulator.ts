
import { BonusInputs, SimulationResult, RiskMetric } from '../types';
import { SIMULATION_ITERATIONS } from '../constants';

export const runSimulation = (inputs: BonusInputs): SimulationResult => {
  const {
    mode,
    deposit,
    matchPercent,
    matchUpTo,
    wagerMultiplier,
    rtp,
    volatility,
    riskScore,
    loopLimit,
    metricWeights,
    metricTargets,
    manualBetSize,
    useManualBet,
    minOdds,
    isFreeBet,
    bookieMargin
  } = inputs;

  const bonusAmount = Math.min(deposit * (matchPercent / 100), matchUpTo);
  const wageringReq = (deposit + bonusAmount) * wagerMultiplier;
  
  let totalEndBalance = 0;
  let wins = 0;
  let busts = 0;
  let totalWageredGlobal = 0;
  const balances: number[] = [];

  const autoBetSize = (deposit + bonusAmount) * (0.005 + ((riskScore - 1) / 9) * 0.095);
  const fixedBetSize = useManualBet ? manualBetSize : Math.max(0.10, autoBetSize);

  // Casino Standard Deviation Logic
  const stdDevPerUnit = 1 + (volatility * 14);

  for (let i = 0; i < SIMULATION_ITERATIONS; i++) {
    let currentBalance = deposit + bonusAmount;
    let wageredSoFar = 0;
    let spins = 0;

    if (mode === 'casino') {
      while (wageredSoFar < wageringReq && currentBalance > 0 && spins < loopLimit) {
        const bet = Math.min(fixedBetSize, currentBalance);
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // Win/Loss calculation
        const netChange = (bet * ((rtp / 100) - 1)) + (bet * stdDevPerUnit * z);
        currentBalance += netChange;
        wageredSoFar += bet;
        spins++;
        if (currentBalance < 0.01) currentBalance = 0;
      }
    } else {
      // Sportsbook Logic
      // In sportsbook mode, if it's a free bet, the first bet consumes the bonus
      let bonusActive = true;
      
      while (wageredSoFar < wageringReq && currentBalance > 0 && spins < loopLimit) {
        const bet = Math.min(fixedBetSize, currentBalance);
        
        // Probability based on odds and margin
        // Win Prob = (1 / odds) * (1 - margin/100)
        const winProb = (1 / minOdds) * (1 - (bookieMargin / 100));
        const isWin = Math.random() < winProb;
        
        if (isFreeBet && bonusActive) {
          // Free bet: only winnings returned
          if (isWin) {
            currentBalance += (bet * (minOdds - 1));
          } else {
            currentBalance -= bet;
          }
          bonusActive = false; // Only one free bet in this simplified model
        } else {
          // Regular bet
          if (isWin) {
            currentBalance += (bet * (minOdds - 1));
          } else {
            currentBalance -= bet;
          }
        }
        
        wageredSoFar += bet;
        spins++;
        if (currentBalance < 0.01) currentBalance = 0;
      }
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

  const avgWagered = totalWageredGlobal / SIMULATION_ITERATIONS;
  const holdActual = (deposit + bonusAmount - avgEnd) / (avgWagered || 1);
  const bonusCostActual = bonusAmount / (avgWagered || 1);
  const cannibalizationActual = bonusAmount / (deposit || 1);
  
  const riskMetrics: RiskMetric[] = [
    {
      name: 'Hold %',
      actual: holdActual,
      target: metricTargets['Hold %'],
      formula: '1 - RTP',
      score: holdActual < metricTargets['Hold %'] ? 2 : 0,
      weight: metricWeights['Hold %'] ?? 1,
      isPercentage: true
    },
    {
      name: 'Bonus Cost',
      actual: bonusCostActual,
      target: metricTargets['Bonus Cost'],
      formula: 'B / Wagered',
      score: bonusCostActual > metricTargets['Bonus Cost'] ? 3 : 0,
      weight: metricWeights['Bonus Cost'] ?? 1,
      isPercentage: true
    },
    {
      name: 'Cannibalization',
      actual: cannibalizationActual,
      target: metricTargets['Cannibalization'],
      formula: 'B / Cash Deposit',
      score: cannibalizationActual > metricTargets['Cannibalization'] ? 4 : 0,
      weight: metricWeights['Cannibalization'] ?? 1,
      isPercentage: true
    },
    {
      name: 'VIP Net Contribution',
      actual: -ev,
      target: metricTargets['VIP Net Contribution'],
      formula: 'NGR - Cost ≈ -EV',
      score: ev > 0 ? 5 : 0,
      weight: metricWeights['VIP Net Contribution'] ?? 1,
      isCurrency: true
    },
    {
      name: 'Churn 30d',
      actual: 0.11, // Placeholder
      target: metricTargets['Churn 30d'],
      formula: 'P(Bust)',
      score: 1,
      weight: metricWeights['Churn 30d'] ?? 1,
      isPercentage: true
    }
  ];

  const compositeRiskScore = riskMetrics.reduce((sum, m) => sum + (m.score * m.weight), 0);

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
    compositeRiskScore,
    totalWageringRequired: wageringReq
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
