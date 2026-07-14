import { GoogleGenAI } from "@google/genai";
import systemInstruction from "../config/systemInstruction.js";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateResult = async ({
  prompt,
  projectName,
  contextFiles,
}) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
${systemInstruction}

Current Project:
${projectName}

Current Workspace:
${contextFiles
  .map(
    (file) => `
File: ${file.path}

${file.content}
`
  )
  .join("\n\n")}

User:
${prompt}
`,
  });

  const rawText = (response.text || "").trim();

  // Conversation Mode (plain text)
  if (!rawText.startsWith("{") && !rawText.startsWith("```")) {
    return {
      text: rawText,
      fileTree: {},
      buildCommand: null,
      startCommand: null,
    };
  }

  try {
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON even if Gemini adds extra text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}$/);

    if (!jsonMatch) {
      throw new Error("No JSON object found.");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI Response Parse Error:", error);
    console.log("Raw AI Response:", rawText);

    return {
      text: rawText,
      fileTree: {},
      buildCommand: null,
      startCommand: null,
    };
  }
};