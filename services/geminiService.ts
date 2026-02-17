
import { GoogleGenAI, Type } from "@google/genai";
import { SiteUsage, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getProductivityAnalysis = async (usageData: SiteUsage[]): Promise<AIAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze the following web usage data from a user's productivity tracker.
    Provide a productivity score (0-100), a concise summary of their digital habits,
    3 actionable recommendations to improve focus, and a specific "Focus Plan" for the next day.

    Usage Data:
    ${usageData.map(u => `${u.domain}: ${u.duration} mins (${u.category})`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productivityScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            focusPlan: { type: Type.STRING }
          },
          required: ["productivityScore", "summary", "recommendations", "focusPlan"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as AIAnalysis;
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    throw error;
  }
};
