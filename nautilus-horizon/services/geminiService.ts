import { GoogleGenAI } from "@google/genai";
// FIX: Changed import path to point to types/index.ts to avoid conflict with empty types.ts file.
import { ScenarioParams, ScenarioResult, CharterCalculationInput, CharterCalculationResult } from '../types/index';

// IMPORTANT: The API key must be set in the .env file as VITE_GEMINI_API_KEY
// Vite exposes env vars via import.meta.env (not process.env)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set VITE_GEMINI_API_KEY in .env file. AI features will be disabled.");
}

// Lazy initialization - only create AI instance when needed (prevents crash if API_KEY is missing)
let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!API_KEY) {
    throw new Error("Gemini API key not configured");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

function formatParams(params: ScenarioParams): string {
    let vesselInfo = '';
    if (params.vessel) {
        vesselInfo = `
**Vessel Information:**
- Name: ${params.vessel.name}
- IMO: ${params.vessel.imo}
- Type: ${params.vessel.ship_type || 'N/A'}
        `;
    }

    let fuelInfo = '';
    if (params.fuelSelections && params.fuelSelections.length > 0) {
        const fuelList = params.fuelSelections
            .map(f => `${f.fuelType} (${f.percentage.toFixed(1)}%)`)
            .join(', ');
        fuelInfo = `
**Fuel Mix:**
- ${fuelList}
        `;
    }

    let voyageInfo = '';
    if (params.originPort || params.destinationPort || params.distanceNauticalMiles) {
        voyageInfo = `
**Voyage Details:**
- Route: ${params.originPort || 'N/A'} → ${params.destinationPort || 'N/A'}
- Distance: ${Number(params.distanceNauticalMiles || 0).toLocaleString()} nautical miles
- Duration: ${Number(params.daysAtSea || 0).toFixed(1)} days at sea, ${Number(params.daysInPort || 0).toFixed(1)} days in port
        `;
    }

    let consumptionInfo = '';
    if (params.portConsumptionPerDay || params.seaConsumptionPerDay) {
        consumptionInfo = `
**Consumption:**
- Port: ${Number(params.portConsumptionPerDay || 0).toFixed(1)} t/day
- Sea: ${Number(params.seaConsumptionPerDay || 0).toFixed(1)} t/day
        `;
    }

    return `
${vesselInfo}
${fuelInfo}
${voyageInfo}
${consumptionInfo}
**Operating Parameters:**
- Vessel Speed: ${Number(params.speedKnots)?.toFixed(1) || 'N/A'} knots
- SGM Efficiency: ${Number(params.sgmEfficiency || 0).toFixed(1)}% fuel reduction
- VFD Efficiency: ${Number(params.vfdEfficiency || 0).toFixed(1)}% fuel reduction
- WHR Efficiency: ${Number(params.whrEfficiency || 0).toFixed(1)}% fuel reduction
- Weather Margin: ${Number(params.weatherMargin || 5).toFixed(1)}%

**Market Prices:**
- Fuel: €${Number(params.fuelPrice || 0).toFixed(2)}/tonne
- EUA: €${Number(params.euaPrice || 0).toFixed(2)}/tonne CO₂
    `;
}

function formatResult(result: ScenarioResult): string {
    let voyageDetails = '';
    if (result.voyageDistanceNm || result.voyageDurationDays || result.fuelConsumedT) {
        voyageDetails = `
**Voyage Summary:**
- Total Distance: ${result.voyageDistanceNm?.toLocaleString() || 'N/A'} NM
- Total Duration: ${result.voyageDurationDays?.toFixed(1) || 'N/A'} days
- Total Fuel Consumed: ${result.fuelConsumedT?.toFixed(2) || 'N/A'} tonnes
- Total CO₂ Emissions: ${result.co2EmissionsT?.toFixed(2) || 'N/A'} tonnes
        `;
    }

    return `
${voyageDetails}
**Voyage Cost Breakdown:**
- Fuel Cost: €${result.fuelCostEur?.toLocaleString('en-US', {maximumFractionDigits: 0}) || 'N/A'}
- ETS Cost: €${result.etsCostEur?.toLocaleString('en-US', {maximumFractionDigits: 0}) || 'N/A'}
- FuelEU Penalty/Surplus: €${result.fuelEuPenaltyEur?.toLocaleString('en-US', {maximumFractionDigits: 0}) || 'N/A'}
- Efficiency Savings: €${result.efficiencySavingsEur?.toLocaleString('en-US', {maximumFractionDigits: 0}) || 'N/A'}
- **TOTAL VOYAGE COST: €${result.totalVoyageCostEur?.toLocaleString('en-US', {maximumFractionDigits: 0}) || 'N/A'}**
    `;
}

export async function generateScenarioSummary(params: ScenarioParams, result: ScenarioResult): Promise<string> {
    if (!API_KEY) {
        return Promise.resolve(`
            <div style="padding: 1rem; background: rgba(251, 146, 60, 0.1); border: 1px solid rgba(251, 146, 60, 0.3); border-radius: 0.5rem;">
                <h3 style="color: #fb923c; margin-bottom: 0.5rem;">🔑 API Key Required</h3>
                <p style="margin-bottom: 0.5rem;">AI Summary feature requires a Gemini API key.</p>
                <p style="font-size: 0.875rem; color: #9ca3af;">
                    Create <code style="background: rgba(0,0,0,0.3); padding: 0.125rem 0.25rem; border-radius: 0.25rem;">nautilus-horizon/.env</code> with:<br/>
                    <code style="background: rgba(0,0,0,0.3); padding: 0.125rem 0.25rem; border-radius: 0.25rem;">VITE_GEMINI_API_KEY=your_api_key_here</code>
                </p>
                <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem;">
                    Get your free key at: <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #fb923c;">https://aistudio.google.com/app/apikey</a>
                </p>
            </div>
        `);
    }
  
    const prompt = `
    You are an expert maritime compliance analyst. Your task is to provide a concise, professional summary of a vessel performance scenario.
    
    **Scenario Parameters:**
    ${formatParams(params)}

    **Projected Impact (vs. Baseline):**
    ${formatResult(result)}

    **Your Task:**
    Generate a two-part response:
    1.  **For the Compliance Officer:** A brief, professional summary (2-3 sentences) explaining the key takeaways of this scenario, focusing on the financial and compliance impact. Use bold headings.
    2.  **For the Ship's Crew:** A single, clear, and simple prescriptive action or observation (1 sentence) that could be sent as a recommendation. Use a bold heading.
    
    IMPORTANT: Respond ONLY with valid HTML. Do NOT include markdown code blocks (no \`\`\`html tags). Use clean HTML formatting with:
    - <h3> for main headings
    - <p> for paragraphs
    - <strong> or <b> for bold text
    - <ul> and <li> for lists
    `;

    try {
        const genAI = getAI();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error: any) {
        console.error("Gemini API call failed:", error);
        return `
            <div style="padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 0.5rem;">
                <h3 style="color: #ef4444; margin-bottom: 0.5rem;">❌ API Error</h3>
                <p>${error?.message || 'Failed to generate summary from Gemini API.'}</p>
            </div>
        `;
    }
}

// Charter calculation with AI-powered clause interpretation
export async function calculateCharterCostWithAI(input: CharterCalculationInput): Promise<CharterCalculationResult> {
    if (!API_KEY) {
        // Fallback to basic calculation without AI
        return calculateBasicCharterCost(input);
    }

    const prompt = `
    You are an expert maritime lawyer and charter party specialist. Analyze this charter cost allocation scenario and provide a detailed breakdown.

    **Charter Details:**
    - Charter Type: ${input.charterType}
    - Clause Variant: ${input.clauseVariant}
    - Fuel Consumption: ${input.fuelTons} tonnes
    - CO₂ Emissions: ${input.co2Tons} tonnes  
    - EU ETS Coverage: ${input.etsCoveredSharePct}%
    - EUA Price: €${input.euaPrice}/tonne
    - FuelEU Energy: ${input.fueleuEnergyGj} GJ
    - Compliance Balance: ${input.complianceBalanceGco2e} gCO₂e
    - Pool Price: €${input.poolPrice || 'N/A'}/gCO₂e
    - Penalty Rate: €${input.penalty}/GJ

    **Task:**
    Based on BIMCO standard forms and maritime law principles, determine:
    1. Who bears fuel costs (Owner/Charterer)
    2. Who bears EU ETS allowance costs (Owner/Charterer)  
    3. Who bears FuelEU Maritime compliance costs (Owner/Charterer)
    4. Calculate exact cost allocation in EUR

    **Charter Type Guidance:**
    - SPOT_VOYAGE: Depends on clause variant
    - TIME: Generally charterer bears compliance costs
    - BAREBOAT: Charterer as disponent owner bears most costs

    **Clause Variants:**
    - FREIGHT_INCLUSIVE: All costs included in freight
    - SURCHARGE: Compliance costs as separate surcharge
    - TRANSFER_OF_ALLOWANCES: Monthly EUA transfers
    - TIME_CLAUSE_2022: Updated BIMCO time charter provisions

    Respond with a JSON object matching this structure:
    {
      "ownerCostEur": number,
      "chartererCostEur": number, 
      "voyageTccEur": number,
      "breakdown": {
        "fuel": {"owner": number, "charterer": number},
        "ets": {"owner": number, "charterer": number},
        "fueleu": {"owner": number, "charterer": number}
      },
      "reasoning": "Brief explanation of allocation logic"
    }
    `;

    try {
        const genAI = getAI();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Parse AI response
        const aiResult = JSON.parse(response.text);
        
        // Validate and return structured result
        return {
            ownerCostEur: aiResult.ownerCostEur || 0,
            chartererCostEur: aiResult.chartererCostEur || 0,
            voyageTccEur: aiResult.voyageTccEur || 0,
            breakdown: aiResult.breakdown || {
                fuel: { owner: 0, charterer: 0 },
                ets: { owner: 0, charterer: 0 },
                fueleu: { owner: 0, charterer: 0 }
            }
        };
    } catch (error) {
        console.error("Gemini charter calculation failed:", error);
        // Fallback to basic calculation
        return calculateBasicCharterCost(input);
    }
}

// Fallback basic charter calculation
function calculateBasicCharterCost(input: CharterCalculationInput): CharterCalculationResult {
    const baseFuelCost = input.fuelTons * 600; // €600/tonne assumption
    const etsCost = input.co2Tons * (input.etsCoveredSharePct / 100) * input.euaPrice;
    const fueleuCost = Math.max(0, -input.complianceBalanceGco2e / 1e6 * (input.poolPrice || input.penalty));

    let ownerCost = 0;
    let chartererCost = 0;

    // Basic allocation rules
    switch (input.charterType) {
        case 'SPOT_VOYAGE':
            if (input.clauseVariant === 'FREIGHT_INCLUSIVE') {
                chartererCost = baseFuelCost + etsCost + fueleuCost;
            } else {
                ownerCost = baseFuelCost;
                chartererCost = etsCost + fueleuCost;
            }
            break;
        case 'TIME':
            ownerCost = baseFuelCost;
            chartererCost = etsCost + fueleuCost;
            break;
        case 'BAREBOAT':
            chartererCost = baseFuelCost + etsCost + fueleuCost;
            break;
    }

    return {
        ownerCostEur: ownerCost,
        chartererCostEur: chartererCost,
        voyageTccEur: ownerCost + chartererCost,
        breakdown: {
            fuel: { 
                owner: input.charterType === 'BAREBOAT' ? 0 : baseFuelCost, 
                charterer: input.charterType === 'BAREBOAT' ? baseFuelCost : 0 
            },
            ets: { owner: 0, charterer: etsCost },
            fueleu: { owner: 0, charterer: fueleuCost }
        }
    };
}

// Generate compliance audit narrative
export async function generateAuditNarrative(
    decisionType: string,
    inputs: Record<string, any>,
    outputs: Record<string, any>
): Promise<string> {
    if (!API_KEY) {
        return `Audit pack for ${decisionType} decision generated on ${new Date().toISOString()}`;
    }

    const prompt = `
    You are a maritime compliance auditor. Generate a professional audit narrative for this compliance decision.

    **Decision Type:** ${decisionType}
    **Decision Inputs:** ${JSON.stringify(inputs, null, 2)}
    **Decision Outputs:** ${JSON.stringify(outputs, null, 2)}

    **Task:**
    Write a clear, professional audit narrative (2-3 paragraphs) that:
    1. Summarizes the compliance decision made
    2. Explains the rationale and regulatory context
    3. Documents the financial impact
    4. Confirms policy compliance

    Use formal audit language appropriate for regulatory review.
    `;

    try {
        const genAI = getAI();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini audit narrative failed:", error);
        return `Audit pack for ${decisionType} decision generated on ${new Date().toISOString()}. AI narrative generation failed, manual review required.`;
    }
}

// Generate market analysis with trading recommendations
export async function generateMarketAnalysis(data: {
    currentPrice: number;
    futuresPrice: number;
    historicalData: Array<{date: string; price: number}>;
    fleetExposure: number;
    fueleuSurplus: number;
    fueleuDeficit: number;
}): Promise<string> {
    if (!API_KEY) {
        return `
            <div class="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                <h3 class="text-orange-400 font-semibold mb-2">🔑 API Key Required</h3>
                <p class="text-orange-300">AI Market Analysis requires a Gemini API key.</p>
                <p class="text-sm text-gray-400 mt-2">
                    Configure <code class="bg-black/30 px-2 py-1 rounded">VITE_GEMINI_API_KEY</code> in your .env file.
                </p>
            </div>
        `;
    }

    const avgPrice = data.historicalData.reduce((sum, d) => sum + d.price, 0) / data.historicalData.length;
    const priceChange = ((data.currentPrice - avgPrice) / avgPrice * 100).toFixed(2);
    const trend = parseFloat(priceChange) > 0 ? 'upward' : 'downward';
    
    const prompt = `
    You are an expert carbon markets and maritime compliance analyst. Provide a comprehensive market analysis.

    **Current Market Conditions:**
    - Current EUA Spot Price: €${data.currentPrice.toFixed(2)}/tCO₂
    - December 2025 Futures: €${data.futuresPrice.toFixed(2)}/tCO₂
    - 30-Day Average: €${avgPrice.toFixed(2)}/tCO₂
    - Price Trend: ${trend} (${priceChange}% vs 30-day average)
    - Historical Range: €${Math.min(...data.historicalData.map(d => d.price)).toFixed(2)} - €${Math.max(...data.historicalData.map(d => d.price)).toFixed(2)}

    **Fleet Position:**
    - Total EUA Exposure: ${data.fleetExposure.toFixed(0)} tCO₂
    - FuelEU Surplus Vessels: ${data.fueleuSurplus}
    - FuelEU Deficit Vessels: ${data.fueleuDeficit}

    **Analysis Required:**
    
    Generate a professional market analysis report with:

    1. **Market Overview** - Current state and recent trends
    2. **Price Analysis** - Is the market in contango or backwardation? What does the futures premium tell us?
    3. **Trading Recommendations** - Top 3 specific, actionable recommendations with reasoning:
       - Consider hedging strategies based on the futures curve
       - FuelEU pooling opportunities
       - Timing recommendations for EUA purchases
    4. **Risk Assessment** - Key risks and opportunities in the current market
    5. **Action Items** - Immediate steps the compliance team should take

    **Respond ONLY with valid HTML** - No markdown code blocks. Use:
    - <h3 class="text-primary font-semibold mb-2"> for headings
    - <p class="text-gray-300 mb-4"> for paragraphs
    - <ul class="list-disc list-inside text-gray-300 mb-4"> for lists
    - <strong class="text-white"> for emphasis
    - <div class="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-4"> for recommendation boxes
    `;

    try {
        const genAI = getAI();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error: any) {
        console.error("Gemini market analysis failed:", error);
        return `
            <div class="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <h3 class="text-red-400 font-semibold mb-2">❌ Analysis Error</h3>
                <p class="text-red-300">${error?.message || 'Failed to generate market analysis. Please try again.'}</p>
            </div>
        `;
    }
}