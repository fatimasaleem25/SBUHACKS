import mongoose from "mongoose";

const MindMapSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  name: String,
  nodes: { type: Array, default: [] },
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  metadata: Object
});

export default mongoose.model("MindMap", MindMapSchema);
