import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: String, required: true },
  collaborators: [{ type: String }],
  settings: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  status: { type: String, default: "active" }
});

export default mongoose.model("Project", ProjectSchema);

