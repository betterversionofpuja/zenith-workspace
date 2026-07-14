import { File } from "../models/file.model.js";
import { generateEmbedding } from "./embedding.service.js";

const TOP_K = 5;
const SIMILARITY_THRESHOLD = 0.7;

export const cosineSimilarity = (a, b) => {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

export const findRelevantFiles = async (projectId, prompt) => {
  const promptEmbedding = await generateEmbedding(prompt);

  const files = await File.find({ project: projectId });

  const rankedFiles = files
  .map((file) => ({
    ...file.toObject(),
    score: cosineSimilarity(promptEmbedding, file.embedding),
  }))
  .filter((file) => file.score >= SIMILARITY_THRESHOLD)
  .sort((a, b) => b.score - a.score);

return rankedFiles.slice(0, TOP_K);
};