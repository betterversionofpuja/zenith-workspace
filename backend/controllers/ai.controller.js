import { generateResult } from "../services/ai.service.js";

export const getResult = async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await generateResult(prompt);

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};