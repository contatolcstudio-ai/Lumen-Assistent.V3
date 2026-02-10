import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 2000;

/**
 * Cria uma nova instância do SDK sempre que chamado para garantir
 * que use a chave API mais atualizada disponível no ambiente.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper para chamadas de API com lógica de retry e detecção de chave inválida.
 */
const withRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      const errorMessage = error?.message || "";
      
      // Se a chave for inválida ou expirou (Requested entity was not found)
      if (errorMessage.includes("Requested entity was not found")) {
        // Notifica o sistema para resetar a seleção de chave
        window.dispatchEvent(new CustomEvent('lumen-api-key-error'));
        throw new Error("Sua sessão de chave API expirou. Por favor, selecione-a novamente.");
      }

      const isRateLimit = 
        errorMessage.includes('429') || 
        error?.status === 429 || 
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('quota');

      if (isRateLimit) {
        const delay = INITIAL_BACKOFF * Math.pow(2, i);
        console.warn(`LÚMEN: Limite atingido. Retentando em ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  
  if (lastError?.message?.includes('RESOURCE_EXHAUSTED')) {
    throw new Error("LIMITE DE COTA EXCEDIDO: Aguarde alguns instantes ou verifique seu faturamento no Google AI Studio.");
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
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Nenhum dado de imagem retornado.");
  });
};