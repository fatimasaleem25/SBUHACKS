import mongoose from "mongoose";

const InsightSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  type: String,
  text: String,
  confidence: Number,
  sourceTranscriptId: { type: mongoose.Schema.Types.ObjectId, ref: "Transcript" },
  createdAt: { type: Date, default: Date.now },
  metadata: Object
});

export default mongoose.model("Insight", InsightSchema);
