
// Always use import {GoogleGenAI} from "@google/genai";
import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 2000; // 2 seconds starting point

// Fixed: Always use named parameter for apiKey and direct access to process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to wrap API calls with exponential backoff retry logic for 429 errors.
 */
const withRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = 
        error?.message?.includes('429') || 
        error?.status === 429 || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');

      if (isRateLimit) {
        const delay = INITIAL_BACKOFF * Math.pow(2, i);
        console.warn(`LÚMEN: Limite de cota atingido. Tentando novamente em ${delay}ms... (Tentativa ${i + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        continue;
      }
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If we reach here, all retries failed
  if (lastError?.message?.includes('RESOURCE_EXHAUSTED')) {
    throw new Error("LIMITE DE COTA EXCEDIDO: A LÚMEN atingiu o limite de requisições do seu plano Gemini. Por favor, aguarde alguns instantes ou verifique as configurações de faturamento no Google AI Studio.");
  }
  throw lastError;
};

export const generateText = async (prompt: string, systemInstruction?: string) => {
  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { systemInstruction }
    });
    // Fixed: Always use .text property, not .text() method
    return response.text || "";
  });
};

export const generateJson = async <T,>(prompt: string, schema: any): Promise<T> => {
  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });
    // Fixed: Always use .text property
    return JSON.parse((response.text || "{}").trim()) as T;
  });
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1", referenceImage?: string) => {
  return withRetry(async () => {
    const ai = getAI();
    const parts: any[] = [{ text: prompt }];
    
    if (referenceImage) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: referenceImage.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio } }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        // Find the image part in nano banana models
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Nenhum dado de imagem retornado pela IA.");
  });
};
