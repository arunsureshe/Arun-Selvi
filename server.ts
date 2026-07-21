import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google GenAI client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in environment or Secrets");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Full-stack API Endpoint for AI Business Summary
app.post("/api/analyze", async (req, res) => {
  try {
    const { dataset, selectedRegion } = req.body;
    if (!dataset) {
      return res.status(400).json({ error: "Dataset is required for analysis." });
    }

    // Heuristic fallback if API key is not set, so user experience is smooth
    const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

    if (!hasApiKey) {
      // Return a smart simulated analysis but mark it as simulated
      const regionalDetails = dataset.regions.map((r: any) => {
        const rating = r.avgRating || 4.2;
        const stockouts = r.totalStockouts || 0;
        const target = r.targetAttainment || 100;
        const conversion = r.conversionRate || 18.5;
        const roi = r.marketingRoi || 30;

        return {
          region: r.regionName,
          keyObservation: `Sales in ${r.regionName} reached $${(r.totalSales / 1000000).toFixed(2)}M, achieving ${target}% of target. Conversion rate stands at ${conversion}% across ${r.totalTransactions.toLocaleString()} transactions.`,
          strength: `Product demand is dominated by ${r.categoryBreakdown[0]?.category || 'Electronics'}. Store ratings are strong at ${rating} ★ with a high marketing ROI of ${roi}x.`,
          actionItem: stockouts > 15 
            ? `Critical: address the ${stockouts} stockout incidents across underperforming locations to recapture deferred demand.` 
            : `Duplicate strategies of top performing store ${r.topStores[0]?.storeName || 'flagship location'} across adjacent low-performing nodes.`
        };
      });

      const catOpps = [
        { category: "Electronics", trend: "growth", strategicAction: "Increase inventory buffer to prevent stockouts of high-margin lines." },
        { category: "Apparel", trend: "stable", strategicAction: "Optimize seasonal markdown codes based on regional conversion rates." },
        { category: "Home & Kitchen", trend: "stable", strategicAction: "Reposition household staples as high-value bundles in Flagship locations." },
        { category: "Groceries", trend: "growth", strategicAction: "Leverage high footfall density by introducing premium shelf positioning." },
        { category: "Beauty", trend: "stable", strategicAction: "Enhance customer satisfaction reviews with customized sales training." }
      ];

      return res.json({
        isSimulated: true,
        analysis: {
          executiveSummary: `This is a preloaded, offline analysis of the "${dataset.name || 'network'}" dataset. national net sales stand at $${(dataset.aggregateKPIs.totalSales / 1000000).toFixed(2)}M, achieving ${dataset.aggregateKPIs.targetAttainment?.toFixed(1) || '101.2'}% of sales targets. Average customer ratings are high (${dataset.aggregateKPIs.avgRating || '4.38'} ★), with conversion rates averaging ${dataset.aggregateKPIs.conversionRate?.toFixed(1) || '18.5'}%. However, we identified ${dataset.aggregateKPIs.totalStockouts || '71'} total stockout incidents that represent immediate supply chain leakage.`,
          regionalInsights: regionalDetails,
          categoryOpportunities: catOpps,
          criticalActionItems: [
            "Implement high-velocity replenishment cycles to resolve stockout bottlenecks in underperforming locations.",
            "Reallocate marketing spend to regions with proven high Marketing ROI (>35x) to maximize top-line leverage.",
            "Establish unified checkout training to boost average Conversion Rates from the current level to 22.0%.",
            "Examine Midwest's target gap by implementing local price matching on key high-volume product categories."
          ]
        }
      });
    }

    // Call actual Gemini API if key is available
    const ai = getAiClient();
    
    // Construct a comprehensive prompt with the dataset summary
    const regionTextSummary = dataset.regions.map((r: any) => {
      const topStoreStr = r.topStores.map((s: any) => `${s.storeName} ($${s.sales.toLocaleString()}, Target Attainment: ${s.targetAttainment || '100'}%, Conversion: ${s.conversionRate || '0'}%, Rating: ${s.customerRating || 'N/A'}, Stockouts: ${s.stockouts || '0'})`).join(", ");
      const lowStoreStr = r.lowStores.map((s: any) => `${s.storeName} ($${s.sales.toLocaleString()}, Target Attainment: ${s.targetAttainment || '100'}%, Conversion: ${s.conversionRate || '0'}%, Rating: ${s.customerRating || 'N/A'}, Stockouts: ${s.stockouts || '0'})`).join(", ");
      const catStr = r.categoryBreakdown.map((c: any) => `${c.category}: $${c.sales.toLocaleString()} (${c.transactions.toLocaleString()} txs, ${c.unitsSold || c.transactions} units)`).join(", ");
      return `Region: ${r.regionName}
- Total Net Sales: $${r.totalSales.toLocaleString()} (${r.salesGrowth}% YoY Growth)
- Transactions: ${r.totalTransactions.toLocaleString()} (AOV: $${r.averageOrderValue.toFixed(2)})
- Footfall: ${r.totalFootfall ? r.totalFootfall.toLocaleString() : 'N/A'} (Conversion Rate: ${r.conversionRate ? r.conversionRate + '%' : 'N/A'})
- Target Attainment: ${r.targetAttainment ? r.targetAttainment + '%' : '100%'}
- Stockouts: ${r.totalStockouts || 0} incidents
- Average Customer Rating: ${r.avgRating || 'N/A'} ★
- Marketing: Spend $${(r.marketingSpend || 0).toLocaleString()} (ROI: ${r.marketingRoi || '0'}x)
- Top Stores: ${topStoreStr}
- Low Stores/Threats: ${lowStoreStr}
- Categories: ${catStr}`;
    }).join("\n\n");

    const prompt = `You are a world-class senior retail operations analyst and business intelligence director.
Analyze the following sales dataset and return a highly detailed, action-oriented, executive-level business summary.

--- Dataset Details ---
Dataset Name: ${dataset.name}
Total Aggregate Sales: $${dataset.aggregateKPIs.totalSales.toLocaleString()}
Total Aggregate Transactions: ${dataset.aggregateKPIs.totalTransactions.toLocaleString()}
Aggregate AOV: $${dataset.aggregateKPIs.aov.toFixed(2)}
Average YoY growth rate: ${dataset.aggregateKPIs.avgGrowth}%
Aggregate Footfall: ${dataset.aggregateKPIs.totalFootfall ? dataset.aggregateKPIs.totalFootfall.toLocaleString() : 'N/A'}
Aggregate Conversion Rate: ${dataset.aggregateKPIs.conversionRate ? dataset.aggregateKPIs.conversionRate.toFixed(1) + '%' : 'N/A'}
Aggregate Target Attainment: ${dataset.aggregateKPIs.targetAttainment ? dataset.aggregateKPIs.targetAttainment.toFixed(1) + '%' : 'N/A'}
Aggregate Stockouts: ${dataset.aggregateKPIs.totalStockouts || 0} incidences
Aggregate Average Rating: ${dataset.aggregateKPIs.avgRating || 'N/A'} ★
Target Selection Focus (if any): ${selectedRegion ? `Analyze "${selectedRegion}" with higher emphasis` : 'National aggregate footprint'}

--- Regional Breakdown ---
${regionTextSummary}

Provide critical, pragmatic, professional business conclusions. Focus heavily on optimizing conversion rates, eliminating stockouts, maximizing marketing ROI, and hitting sales targets. Avoid generic fluff. Be concrete about category strategies and operational maneuvers.`;

    // Define the rigid JSON response schema using Type enum from @google/genai
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Chief Executive Advisor in global retail operations. Your summaries are highly strategic, analytical, professional, and omit generic advice.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["executiveSummary", "regionalInsights", "categoryOpportunities", "criticalActionItems"],
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: "High level overall retail health, strength, or warnings based on the entire dataset. Be concrete."
            },
            regionalInsights: {
              type: Type.ARRAY,
              description: "Structured insights for each region.",
              items: {
                type: Type.OBJECT,
                required: ["region", "keyObservation", "strength", "actionItem"],
                properties: {
                  region: { type: Type.STRING, description: "Name of the region" },
                  keyObservation: { type: Type.STRING, description: "Key diagnostic observation" },
                  strength: { type: Type.STRING, description: "The biggest asset or growth driver" },
                  actionItem: { type: Type.STRING, description: "Remediation or scaling strategy" }
                }
              }
            },
            categoryOpportunities: {
              type: Type.ARRAY,
              description: "Product category trends and strategic opportunities.",
              items: {
                type: Type.OBJECT,
                required: ["category", "trend", "strategicAction"],
                properties: {
                  category: { type: Type.STRING, description: "Name of product category" },
                  trend: { type: Type.STRING, description: "Trend status: must be exactly 'growth', 'declining', or 'stable'" },
                  strategicAction: { type: Type.STRING, description: "Strategic action to capitalize on this category" }
                }
              }
            },
            criticalActionItems: {
              type: Type.ARRAY,
              description: "3-5 high priority, concrete action items for the regional managers and executive board.",
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text returned from Gemini");
    }

    const parsedResult = JSON.parse(text);
    return res.json({
      isSimulated: false,
      analysis: parsedResult
    });

  } catch (error: any) {
    console.error("Analysis Endpoint Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze retail dataset." });
  }
});

// Setup Vite Dev Server Middleware or Production Static Pipeline
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Retail Intelligence server successfully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
