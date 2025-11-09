import mongoose from "mongoose";

const TranscriptSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  sessionName: String,
  audioUrl: String,
  text: { type: String, default: "" },
  participants: [String],
  duration: Number,
  createdAt: { type: Date, default: Date.now },
  metadata: Object
});

export default mongoose.model("Transcript", TranscriptSchema);
