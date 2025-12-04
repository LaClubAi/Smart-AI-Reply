import { GoogleGenAI, Type } from "@google/genai";
import { AssistantMode, ToneAnalysisResult } from "../types";
import { MODE_CONFIG } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const streamResponse = async (
  mode: AssistantMode,
  history: { role: string; parts: { text: string }[] }[],
  currentMessage: string,
  onChunk: (text: string) => void
) => {
  const ai = getClient();
  const instruction = MODE_CONFIG[mode].systemInstruction;
  
  // Use a faster model for chat interactions
  const modelId = "gemini-2.5-flash";

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: instruction,
      },
      history: history,
    });

    const result = await chat.sendMessageStream({ message: currentMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error streaming response:", error);
    onChunk("\n\n[خطا در برقراری ارتباط با هوش مصنوعی]");
  }
};

export const analyzeTone = async (text: string): Promise<ToneAnalysisResult | null> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following Persian text and provide the tone analysis in JSON: "${text}"`,
      config: {
        systemInstruction: MODE_CONFIG[AssistantMode.TONE_ANALYSIS].systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotion: { type: Type.STRING },
            intensity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            politeness: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ToneAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("Tone analysis failed:", error);
    return null;
  }
};
