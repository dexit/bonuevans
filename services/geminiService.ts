
import { GoogleGenAI, Type } from "@google/genai";
import { BonusInputs, SimulationResult } from "../types";
import { MODEL_NAME } from "../constants";

export const analyzeBonus = async (inputs: BonusInputs, results: SimulationResult): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please check your configuration.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a world-class casino mathematician and bonus analyst. Your tone is professional, insightful, and slightly academic.
    Analyze the following casino bonus offer and its Monte Carlo simulation results.
    Your entire response MUST be a single JSON object that adheres to the provided schema.
    
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
    
    Based on this data, provide a deep, three-part analysis. Use the data points to back up your claims. Be comprehensive and clear.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      verdict: {
        type: Type.STRING,
        description: "Your final verdict on the bonus's profitability. Explain the math behind the EV, contrasting the theoretical house edge against the simulation's outcome where losses are capped. State clearly if it is a +EV or -EV play."
      },
      riskAssessment: {
        type: Type.STRING,
        description: "A detailed assessment of the risk and volatility. Focus on the bust rate and what it means for the player. Explain the distribution of outcomes (e.g., 'top-heavy') and why the EV is driven by a small percentage of successful runs."
      },
      strategyTip: {
        type: Type.STRING,
        description: "A practical strategy tip for the player. Discuss bankroll management in the context of the high bust rate. Advise on how the player's aggression (Risk Score) influences outcomes and what they must be aware of to realize the theoretical EV."
      },
    },
    required: ["verdict", "riskAssessment", "strategyTip"]
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonString = response.text;
    if (!jsonString) {
        return "AI analysis returned an empty response.";
    }

    const analysis = JSON.parse(jsonString);
    const verdictTitle = results.ev > 0 ? "Mathematically Profitable (+EV)" : "Not Profitable (-EV)";

    const formattedAnalysis = `**1. Verdict: ${verdictTitle}**
${analysis.verdict}

**2. Risk Assessment: High Volatility & Risk of Ruin**
${analysis.riskAssessment}

**3. Strategy Tip: Variance and Bankroll Management**
${analysis.strategyTip}`;
    
    return formattedAnalysis;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while generating the analysis. The response may have been malformed. Please try again.";
  }
};