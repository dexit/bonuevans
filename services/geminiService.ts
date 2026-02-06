import { GoogleGenAI } from "@google/genai";
import { BonusInputs, SimulationResult } from "../types";
import { MODEL_NAME } from "../constants";

export const analyzeBonus = async (inputs: BonusInputs, results: SimulationResult): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please check your configuration.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a professional casino bonus analyst. Analyze the following casino bonus offer and simulation results.
    
    Bonus Parameters:
    - Deposit: €${inputs.deposit}
    - Bonus Match: ${inputs.matchPercent}% up to €${inputs.matchUpTo}
    - Wager Requirement Multiplier: ${inputs.wagerMultiplier}x
    - Game RTP: ${inputs.rtp}%
    - Volatility Index: ${inputs.volatility} (0-1 scale)
    - Player Aggression (Risk Score): ${inputs.riskScore}/10

    Simulation Results (Monte Carlo):
    - Player EV (Expected Value): €${results.ev.toFixed(2)}
    - Win Probability (Beat Wager): ${results.winRate.toFixed(1)}%
    - Bust Probability: ${results.bustRate.toFixed(1)}%
    - Average Ending Balance: €${results.averageEndBalance.toFixed(2)}
    
    Provide a concise, 3-paragraph analysis:
    1. Verdict: Is this bonus mathematically profitable (+EV) or a trap (-EV)?
    2. Risk Assessment: How volatile is this strategy? Is the risk of ruin high?
    3. Strategy Tip: Based on the "Risk Score" and results, what should the player be aware of?
    
    Keep it professional, objective, and mathematical. Do not encourage gambling, but analyze the math.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while generating the analysis. Please try again.";
  }
};