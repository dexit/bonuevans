
import { BonusInputs, SimulationResult, RiskMetric, MetricBaseFormula } from '../types';
import { SIMULATION_ITERATIONS } from '../constants';

export const runSimulation = (inputs: BonusInputs): SimulationResult => {
  const {
    mode, deposit, matchPercent, matchUpTo, wagerMultiplier,
    rtp, volatility, riskScore, loopLimit, manualBetSize,
    useManualBet, minOdds, isFreeBet, bookieMargin, metrics
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
        const netChange = (bet * ((rtp / 100) - 1)) + (bet * stdDevPerUnit * z);
        currentBalance += netChange;
        wageredSoFar += bet;
        spins++;
        if (currentBalance < 0.01) currentBalance = 0;
      }
    } else {
      let bonusActive = true;
      while (wageredSoFar < wageringReq && currentBalance > 0 && spins < loopLimit) {
        const bet = Math.min(fixedBetSize, currentBalance);
        const winProb = (1 / minOdds) * (1 - (bookieMargin / 100));
        const isWin = Math.random() < winProb;
        if (isFreeBet && bonusActive) {
          if (isWin) currentBalance += (bet * (minOdds - 1));
          else currentBalance -= bet;
          bonusActive = false;
        } else {
          if (isWin) currentBalance += (bet * (minOdds - 1));
          else currentBalance -= bet;
        }
        wageredSoFar += bet;
        spins++;
        if (currentBalance < 0.01) currentBalance = 0;
      }
    }
    balances.push(currentBalance);
    totalEndBalance += currentBalance;
    totalWageredGlobal += wageredSoFar;
    if (currentBalance >= 0.01 && wageredSoFar >= wageringReq) wins++;
    else busts++;
  }

  balances.sort((a, b) => a - b);
  const avgEnd = totalEndBalance / SIMULATION_ITERATIONS;
  const ev = avgEnd - deposit;
  const avgWagered = totalWageredGlobal / SIMULATION_ITERATIONS;
  const bustRate = busts / SIMULATION_ITERATIONS;

  const riskMetrics: RiskMetric[] = metrics.map(m => {
    let actual = 0;
    let formulaString = "";
    let score = 0;

    switch (m.formulaType) {
      case 'HOLD_PERCENT':
        actual = (deposit + bonusAmount - avgEnd) / (avgWagered || 1);
        formulaString = "(D + B - End) / Wagered";
        // Penalty if hold is too low
        score = actual < m.target ? 2 : 0;
        break;
      case 'BONUS_COST':
        actual = bonusAmount / (avgWagered || 1);
        formulaString = "Bonus / Wagered";
        // Penalty if bonus cost is too high
        score = actual > m.target ? 3 : 0;
        break;
      case 'CANNIBALIZATION':
        actual = bonusAmount / (deposit || 1);
        formulaString = "Bonus / Deposit";
        // Penalty if matching too much deposit
        score = actual > m.target ? 4 : 0;
        break;
      case 'NET_CONTRIBUTION':
        actual = -ev;
        formulaString = "NGR - Bonus Cost";
        // Penalty if EV is positive (operator loss)
        score = ev > m.target ? 5 : 0;
        break;
      case 'CHURN_PROB':
        actual = bustRate;
        formulaString = "P(Balance = 0)";
        // Penalty if player busts too easily
        score = actual > m.target ? 2 : 0;
        break;
      case 'ROI_PERCENT':
        actual = ev / (deposit || 1);
        formulaString = "EV / Deposit";
        // Penalty if ROI is too high for player
        score = actual > m.target ? 3 : 0;
        break;
    }

    return { ...m, actual, formulaString, score };
  });

  const compositeRiskScore = riskMetrics.reduce((sum, m) => sum + (m.score * m.weight), 0);

  return {
    ev,
    winRate: (wins / SIMULATION_ITERATIONS) * 100,
    bustRate: bustRate * 100,
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
