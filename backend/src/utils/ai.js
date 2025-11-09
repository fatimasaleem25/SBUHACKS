import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_URL || !GEMINI_API_KEY) {
  console.warn("GEMINI_API_URL or GEMINI_API_KEY not set — AI calls will fail.");
}

async function callGemini(payload, path = "/v1/respond") {
  const url = `${GEMINI_API_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${GEMINI_API_KEY}`,
    "Content-Type": "application/json"
  };
  const res = await axios.post(url, payload, { headers });
  return res.data;
}

export async function generateMindMapFromText(text) {
  const prompt = `Extract a hierarchical mindmap from the text below. Return JSON with "nodes": [...]\n\n${text}`;
  const payload = { prompt, max_tokens: 1500, temperature: 0.2 };
  const data = await callGemini({ input: payload }, "/v1/generate");
  return data.nodes || [];
}

export async function extractInsightsFromText(text) {
  const prompt = `Extract JSON array of insights from transcript below. Each insight: { type, text, confidence }\n\n${text}`;
  const payload = { prompt, max_tokens: 800, temperature: 0.2 };
  const data = await callGemini({ input: payload }, "/v1/generate");
  return data.insights || [];
}

export async function transcribeAudioChunk(base64Chunk) {
  const payload = { audio: base64Chunk, encoding: "base64", sample_rate_hz: 16000 };
  const data = await callGemini(payload, "/v1/transcribe");
  return data;
}
