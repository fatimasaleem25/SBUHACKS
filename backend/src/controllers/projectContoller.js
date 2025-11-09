import Project from "../models/User.js";
import MindMap from "../models/MindMap.js";
import Transcript from "../models/Transcript.js";
import { generateMindMapFromText } from "../utils/ai.js";

export const createProject = async (req, res) => {
  try {
    const ownerId = req.user?.sub;
    const { name, description, collaborators = [] } = req.body;
    const project = new Project({ name, description, owner: ownerId, collaborators });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating project" });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateMindMap = async (req, res) => {
  try {
    const projectId = req.params.id;
    const transcript = await Transcript.findOne({ projectId }).sort({ createdAt: -1 });
    if (!transcript) return res.status(404).json({ message: "No transcript found" });

    const nodes = await generateMindMapFromText(transcript.text || "");
    const mindmap = new MindMap({
      projectId,
      name: req.body.name || `${projectId} - generated ${new Date().toISOString()}`,
      nodes,
      createdBy: req.user?.sub || "system"
    });
    await mindmap.save();
    res.status(201).json(mindmap);
  } catch (err) {
    console.error("generateMindMap error", err);
    res.status(500).json({ message: "AI generation failed" });
  }
};
