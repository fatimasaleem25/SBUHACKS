import Transcript from "../models/Transcript.js";
import Insight from "../models/Insight.js";
import { extractInsightsFromText } from "../utils/ai.js";

export const extractInsights = async (req, res) => {
  try {
    const projectId = req.params.id;
    const transcript = await Transcript.findOne({ projectId }).sort({ createdAt: -1 });
    if (!transcript) return res.status(404).json({ message: "No transcript found" });

    const insightsData = await extractInsightsFromText(transcript.text || "");
    const insightsArray = Array.isArray(insightsData) ? insightsData : insightsData.insights || [];

    const insights = await Insight.insertMany(
      insightsArray.map((insight) => ({
        projectId,
        ...insight,
        createdAt: new Date()
      }))
    );

    res.status(201).json(insights);
  } catch (err) {
    console.error("extractInsights error", err);
    res.status(500).json({ message: "AI insight extraction failed" });
  }
};