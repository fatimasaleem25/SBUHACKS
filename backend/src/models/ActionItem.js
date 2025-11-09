import mongoose from "mongoose";

const ActionItemSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  task: String,
  assignee: String,
  dueDate: Date,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ActionItem", ActionItemSchema);

