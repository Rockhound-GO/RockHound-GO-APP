import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CLOVER_SYSTEM_INSTRUCTION } from "../constants";
import { IdentificationResult } from "../types";

// Safe access to API Key to prevent crash if process is undefined
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const identifySpecimen = async (base64Image: string): Promise<IdentificationResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      isRock: { type: Type.BOOLEAN, description: "True if the image contains a rock, mineral, crystal, or fossil. False if it is man-made, organic (plant/animal), or unclear." },
      name: { type: Type.STRING, description: "Common name of the specimen." },
      scientificName: { type: Type.STRING, description: "Scientific name or chemical classification." },
      confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 100." },
      description: { type: Type.STRING, description: "Brief visual description." },
      geologicalOrigin: { type: Type.STRING, description: "Explanation of how it formed (Igneous, Metamorphic, Sedimentary process)." },
      cloverComment: { type: Type.STRING, description: "A persona-driven comment from Clover (The Geologist Field Guide) explaining a specific feature seen in the image." },
      xpValue: { type: Type.INTEGER, description: "Experience points to award based on rarity and condition." }
    },
    required: ["isRock", "name", "confidence", "cloverComment", "xpValue"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Analyze this image. Act as Clover, the expert geologist. Identify if this is a geological specimen."
          }
        ]
      },
      config: {
        systemInstruction: CLOVER_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4, // Lower temperature for more factual analysis
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as IdentificationResult;

  } catch (error) {
    console.error("Gemini Identification Error:", error);
    throw error;
  }
};

export const chatWithClover = async (message: string, context?: string): Promise<string> => {
  if (!apiKey) return "Authentication Error: API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context: ${context || 'None'}. User Question: ${message}`,
      config: {
        systemInstruction: CLOVER_SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "I'm having trouble analyzing the strata right now. Ask me again in a moment.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Connection to the field database lost. Please check your network.";
  }
};