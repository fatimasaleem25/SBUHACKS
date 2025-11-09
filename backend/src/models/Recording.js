import mongoose from "mongoose";

const RecordingSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: { type: String, required: true }, // Auth0 user ID who created the recording
  userEmail: { type: String, required: true },
  title: { type: String, default: 'Untitled Recording' },
  transcript: { type: String, default: '' },
  audioURL: { type: String }, // URL or base64 of audio file
  recordingTime: { type: Number, default: 0 }, // Duration in seconds
  
  // AI-generated content
  insights: { type: mongoose.Schema.Types.Mixed }, // AI insights
  notes: { type: mongoose.Schema.Types.Mixed }, // Meeting notes
  brainstorm: { type: mongoose.Schema.Types.Mixed }, // Brainstorm/flowchart data
  mindmap: { type: String }, // Mermaid mindmap code
  
  // Metadata
  status: { 
    type: String, 
    enum: ['recording', 'processing', 'completed', 'archived'], 
    default: 'completed' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt before saving
RecordingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
RecordingSchema.index({ projectId: 1, createdAt: -1 });
RecordingSchema.index({ userId: 1 });

export default mongoose.model('Recording', RecordingSchema);

