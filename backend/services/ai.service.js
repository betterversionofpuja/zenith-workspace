import { GoogleGenAI } from "@google/genai";
import systemInstruction from "../config/systemInstruction.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateResult = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemInstruction}\n\nUser: ${prompt}`,
  });

  return response.text;
};