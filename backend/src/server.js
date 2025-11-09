import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { geminiService } from './services/geminiServices.js';
// Lazy import OpenAI service (optional - will fallback to Gemini if not available)
let openAIService = null;
const loadOpenAIService = async () => {
  if (openAIService) return openAIService;
  try {
    const openAIModule = await import('./services/openAIService.js');
    openAIService = openAIModule.openAIService;
    console.log('✅ OpenAI service loaded');
    return openAIService;
  } catch (error) {
    console.warn('⚠️ OpenAI service not available (package may not be installed). Will use Gemini as fallback.');
    return null;
  }
};
import { elevenLabsService } from './services/elevenLabsService.js';
import { snowflakeService } from './services/snowflakeService.js';
import collaborationRoutes from './routes/collaboration.js';
import Project from './models/Project.js';
import User from './models/User.js';
import Recording from './models/Recording.js';
import { getUserEmail, getUserData } from './utils/authHelper.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
// Increase body size limit for audio data (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Auth0 JWT verification middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    console.error("\n💡 Troubleshooting:");
    console.error("1. Check if your IP address is whitelisted in MongoDB Atlas");
    console.error("2. Go to: https://cloud.mongodb.com/ → Network Access → Add IP Address");
    console.error("3. Add your current IP or use 0.0.0.0/0 for development (less secure)");
    console.error("4. Verify your MONGO_URI in .env file is correct");
  });

// Note: Project and User models are imported from models directory
// The old 'Idea' model has been replaced with 'Project' model

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Collaboration routes
app.use('/api/collaboration', checkJwt, collaborationRoutes);

// Get all projects for a user (owned and collaborated)
app.get('/api/ideas', checkJwt, async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({ 
        error: 'Database connection unavailable. Please check MongoDB connection.',
        details: 'Make sure your IP is whitelisted in MongoDB Atlas'
      });
    }
    
    const userId = req.auth.sub; // Get user ID from JWT token
    const userEmail = getUserEmail(req);
    
    console.log('Fetching projects for user:', userId, 'email:', userEmail);
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    // Find projects where user is owner or collaborator
    // Also check by email in case userId doesn't match
    const query = {
      $or: [
        { ownerId: userId },
        { 'collaborators.userId': userId }
      ]
    };
    
    // If we have email, also search by email
    if (userEmail) {
      query.$or.push(
        { ownerEmail: userEmail },
        { 'collaborators.email': userEmail }
      );
    }
    
    const projects = await Project.find(query).sort({ createdAt: -1 });
    
    console.log('Found projects:', projects.length);
    
    // Transform to match frontend expectation (ideas format for backward compatibility)
    const ideas = projects.map(project => ({
      _id: project._id,
      title: project.title,
      description: project.description || '',
      tags: project.tags || [],
      createdAt: project.createdAt,
      userId: project.ownerId, // Keep for backward compatibility
      ownerId: project.ownerId,
      ownerEmail: project.ownerEmail,
      isOwner: project.ownerId === userId,
      collaborators: project.collaborators || []
    }));
    
    res.json(ideas);
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('MongoDB')) {
      return res.status(503).json({ 
        error: 'Database connection error',
        details: 'Please check MongoDB connection and IP whitelist'
      });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Create a new project
app.post('/api/ideas', checkJwt, async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({ 
        error: 'Database connection unavailable. Please check MongoDB connection.',
        details: 'Make sure your IP is whitelisted in MongoDB Atlas'
      });
    }
    
    const userId = req.auth.sub;
    const userEmail = getUserEmail(req);
    const { title, description, tags } = req.body;
    
    console.log('Creating project for user:', userId, 'email:', userEmail);
    console.log('Project data:', { title, description, tags });
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        error: 'Project title is required',
        details: 'Please enter a project name'
      });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ 
        error: 'Project description is required',
        details: 'Please enter a project description'
      });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    // Create or update user record first to ensure email is saved
    let projectOwnerEmail = userEmail;
    try {
      const userData = getUserData(req);
      const user = await User.findOrCreate(userData);
      // If we got email from user record, use it
      if (user && user.email && user.email.includes('@')) {
        projectOwnerEmail = user.email;
        console.log('✅ Using email from User record:', projectOwnerEmail);
      } else if (userData.email && userData.email.includes('@')) {
        projectOwnerEmail = userData.email;
        console.log('✅ Using email from getUserData:', projectOwnerEmail);
      } else {
        console.warn('⚠️ No valid email found for project owner. User ID:', userId);
        // Don't use userId as email - leave it empty or null
        // The Project schema allows ownerEmail to be optional
        projectOwnerEmail = null;
      }
    } catch (userError) {
      console.error('Error creating/updating user:', userError);
      // If user creation fails but we have email from token, use it
      if (userEmail && userEmail.includes('@')) {
        projectOwnerEmail = userEmail;
      } else {
        projectOwnerEmail = null;
      }
    }
    
    const newProject = new Project({
      title: title.trim(),
      description: description.trim(),
      ownerId: userId,
      ownerEmail: projectOwnerEmail, // Will be null if no email available (schema allows this)
      tags: tags || [],
      collaborators: []
    });
    
    await newProject.save();
    console.log('Project created successfully:', newProject._id);
    
    // Sync to Snowflake (non-blocking)
    snowflakeService.syncProject(newProject).catch(err => {
      console.error('Failed to sync project to Snowflake:', err);
    });
    
    // Transform to match frontend expectation
    const idea = {
      _id: newProject._id,
      title: newProject.title,
      description: newProject.description,
      tags: newProject.tags,
      createdAt: newProject.createdAt,
      userId: newProject.ownerId,
      ownerId: newProject.ownerId,
      ownerEmail: newProject.ownerEmail,
      isOwner: true,
      collaborators: []
    };
    
    res.status(201).json(idea);
  } catch (error) {
    console.error('Error creating project:', error);
    
    // Check if it's a MongoDB connection error
    if (error.name === 'MongooseServerSelectionError' || error.message.includes('MongoDB')) {
      return res.status(503).json({ 
        error: 'Database connection error',
        details: 'Please check MongoDB connection and IP whitelist'
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationMessages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ 
        error: 'Validation error',
        details: validationMessages || 'Please check all required fields are filled correctly'
      });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update a project
app.put('/api/ideas/:id', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { id } = req.params;
    const { title, description, tags } = req.body;
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is owner or admin collaborator
    const isOwner = project.ownerId === userId;
    const isAdmin = project.collaborators.some(
      collab => collab.userId === userId && collab.role === 'admin'
    );
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only owners and admins can update projects' });
    }
    
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (tags) project.tags = tags;
    
    await project.save();
    
    // Transform to match frontend expectation
    const idea = {
      _id: project._id,
      title: project.title,
      description: project.description,
      tags: project.tags,
      createdAt: project.createdAt,
      userId: project.ownerId,
      ownerId: project.ownerId,
      isOwner: project.ownerId === userId,
      collaborators: project.collaborators
    };
    
    res.json(idea);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a project
app.delete('/api/ideas/:id', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { id } = req.params;
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Only owner can delete project
    if (project.ownerId !== userId) {
      return res.status(403).json({ error: 'Only project owner can delete the project' });
    }
    
    await Project.findByIdAndDelete(id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
// Gemini AI Routes

// Analyze text with Gemini
app.post('/api/gemini/analyze', checkJwt, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const analysis = await geminiService.analyzeText(text);
    res.json({ analysis });
  } catch (error) {
    console.error('Gemini analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate mind map from text
app.post('/api/gemini/mind-map', checkJwt, async (req, res) => {
  try {
    const { text, projectId } = req.body;
    const userId = req.auth.sub;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const mindMap = await geminiService.generateMindMap(text);
    
    // Optionally save to database
    if (projectId) {
      // You can create a MindMap model and save it here
      // For now, just return the generated mind map
    }
    
    res.json(mindMap);
  } catch (error) {
    console.error('Mind map generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze conversation transcript (with AI provider selection)
app.post('/api/gemini/analyze-conversation', checkJwt, async (req, res) => {
  try {
    const { transcript, projectId, aiProvider = 'gemini', model } = req.body;
    const userId = req.auth.sub;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    let insights;
    
    // Choose AI provider based on request
    if (aiProvider === 'openai' || aiProvider === 'gpt-4') {
      try {
        const openAI = await loadOpenAIService();
        if (openAI) {
          const openAIModel = model || 'gpt-4-turbo-preview';
          insights = await openAI.analyzeConversation(transcript, openAIModel);
        } else {
          throw new Error('OpenAI service not available');
        }
      } catch (openAIError) {
        console.error('OpenAI failed, falling back to Gemini:', openAIError.message);
        // Fallback to Gemini if OpenAI fails
        insights = await geminiService.analyzeConversation(transcript);
      }
    } else {
      // Default to Gemini
      insights = await geminiService.analyzeConversation(transcript);
    }
    
    res.json(insights);
  } catch (error) {
    console.error('Conversation analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Transcribe audio using Gemini
app.post('/api/gemini/transcribe-audio', checkJwt, async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', projectId } = req.body;
    const userId = req.auth.sub;
    
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    const transcript = await geminiService.transcribeAudio(audioBase64, mimeType);
    
    res.json(transcript);
  } catch (error) {
    console.error('Audio transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ElevenLabs Routes
// Get available voices
app.get('/api/elevenlabs/voices', checkJwt, async (req, res) => {
  try {
    const voices = await elevenLabsService.getVoices();
    res.json({ voices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Convert text to speech
app.post('/api/elevenlabs/text-to-speech', checkJwt, async (req, res) => {
  try {
    const { text, voiceId, options } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const audio = await elevenLabsService.textToSpeech(text, voiceId, options);
    res.json(audio);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Narrate transcript (convert transcript to speech)
app.post('/api/elevenlabs/narrate-transcript', checkJwt, async (req, res) => {
  try {
    const { transcript, voiceId } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    const audio = await elevenLabsService.narrateTranscript(transcript, voiceId);
    res.json(audio);
  } catch (error) {
    console.error('Narration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Snowflake Analytics Routes
// Get analytics data from Snowflake
app.get('/api/snowflake/analytics', checkJwt, async (req, res) => {
  try {
    const { queryType, filters } = req.query;
    const data = await snowflakeService.getAnalytics(queryType, filters ? JSON.parse(filters) : {});
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync data to Snowflake (manual trigger)
app.post('/api/snowflake/sync', checkJwt, async (req, res) => {
  try {
    const { type, id } = req.body; // type: 'recording' or 'project'
    
    if (type === 'recording') {
      const recording = await Recording.findById(id);
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }
      const result = await snowflakeService.syncRecording(recording);
      res.json(result);
    } else if (type === 'project') {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      const result = await snowflakeService.syncProject(project);
      res.json(result);
    } else {
      res.status(400).json({ error: 'Invalid type. Must be "recording" or "project"' });
    }
  } catch (error) {
    console.error('Error syncing to Snowflake:', error);
    res.status(500).json({ error: error.message });
  }
});

// Log analytics event
app.post('/api/snowflake/events', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { eventType, projectId, recordingId, metadata } = req.body;
    
    const result = await snowflakeService.logEvent(eventType, userId, projectId, recordingId, metadata || {});
    res.json(result);
  } catch (error) {
    console.error('Error logging event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Mermaid mindmap from transcript (with AI provider selection)
app.post('/api/gemini/mermaid-mindmap', checkJwt, async (req, res) => {
  try {
    const { transcript, aiProvider = 'gemini', model } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    let mindmap;
    
    // Choose AI provider based on request
    if (aiProvider === 'openai' || aiProvider === 'gpt-4') {
      try {
        const openAI = await loadOpenAIService();
        if (openAI) {
          const openAIModel = model || 'gpt-4-turbo-preview';
          mindmap = await openAI.generateMermaidMindmap(transcript, openAIModel);
        } else {
          throw new Error('OpenAI service not available');
        }
      } catch (openAIError) {
        console.error('OpenAI failed, falling back to Gemini:', openAIError.message);
        // Fallback to Gemini if OpenAI fails
        mindmap = await geminiService.generateMermaidMindmap(transcript);
      }
    } else {
      // Default to Gemini
      mindmap = await geminiService.generateMermaidMindmap(transcript);
    }
    
    res.json(mindmap);
  } catch (error) {
    console.error('Mermaid mindmap generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate meeting notes from transcript (with AI provider selection)
app.post('/api/gemini/meeting-notes', checkJwt, async (req, res) => {
  try {
    const { transcript, aiProvider = 'gemini', model } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    let notes;
    
    // Choose AI provider based on request
    if (aiProvider === 'openai' || aiProvider === 'gpt-4') {
      try {
        const openAI = await loadOpenAIService();
        if (openAI) {
          const openAIModel = model || 'gpt-4-turbo-preview';
          notes = await openAI.generateMeetingNotes(transcript, openAIModel);
        } else {
          throw new Error('OpenAI service not available');
        }
      } catch (openAIError) {
        console.error('OpenAI failed, falling back to Gemini:', openAIError.message);
        // Fallback to Gemini if OpenAI fails
        notes = await geminiService.generateMeetingNotes(transcript);
      }
    } else {
      // Default to Gemini
      notes = await geminiService.generateMeetingNotes(transcript);
    }
    
    res.json(notes);
  } catch (error) {
    console.error('Meeting notes generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate brainstorm/visualization from transcript (with AI provider selection)
app.post('/api/gemini/brainstorm', checkJwt, async (req, res) => {
  try {
    const { transcript, aiProvider = 'gemini', model } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    let brainstorm;
    
    // Choose AI provider based on request
    if (aiProvider === 'openai' || aiProvider === 'gpt-4') {
      try {
        const openAI = await loadOpenAIService();
        if (openAI) {
          const openAIModel = model || 'gpt-4-turbo-preview';
          brainstorm = await openAI.generateBrainstorm(transcript, openAIModel);
        } else {
          throw new Error('OpenAI service not available');
        }
      } catch (openAIError) {
        console.error('OpenAI failed, falling back to Gemini:', openAIError.message);
        // Fallback to Gemini if OpenAI fails
        brainstorm = await geminiService.generateBrainstorm(transcript);
      }
    } else {
      // Default to Gemini
      brainstorm = await geminiService.generateBrainstorm(transcript);
    }
    
    res.json(brainstorm);
  } catch (error) {
    console.error('Brainstorm generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Recording Routes - Save and share recordings with collaborators
// Save a recording to a project
app.post('/api/recordings', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const userEmail = getUserEmail(req);
    const { projectId, title, transcript, audioURL, recordingTime, insights, notes, brainstorm, mindmap } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const isOwner = project.ownerId === userId;
    const isCollaborator = project.collaborators.some(collab => collab.userId === userId);
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }
    
    const recording = new Recording({
      projectId,
      userId,
      userEmail: userEmail || userId,
      title: title || `Recording ${new Date().toLocaleString()}`,
      transcript: transcript || '',
      audioURL,
      recordingTime: recordingTime || 0,
      insights,
      notes,
      brainstorm,
      mindmap,
      status: 'completed'
    });
    
    await recording.save();
    
    // Sync to Snowflake (non-blocking)
    snowflakeService.syncRecording(recording).catch(err => {
      console.error('Failed to sync recording to Snowflake:', err);
    });
    
    res.status(201).json({ message: 'Recording saved successfully', recording });
  } catch (error) {
    console.error('Error saving recording:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get recordings for a project (collaborators can see all recordings)
app.get('/api/projects/:projectId/recordings', checkJwt, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.auth.sub;
    
    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const isOwner = project.ownerId === userId;
    const isCollaborator = project.collaborators.some(collab => collab.userId === userId);
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }
    
    const recordings = await Recording.find({ projectId })
      .sort({ createdAt: -1 })
      .select('-audioURL'); // Don't send full audio URLs to reduce payload
    
    res.json({ recordings });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get a specific recording
app.get('/api/recordings/:recordingId', checkJwt, async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.auth.sub;
    
    const recording = await Recording.findById(recordingId).populate('projectId', 'title ownerId collaborators');
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    // Check if user has access to the project
    const project = recording.projectId;
    const isOwner = project.ownerId === userId;
    const isCollaborator = project.collaborators.some(collab => collab.userId === userId);
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'You do not have access to this recording' });
    }
    
    res.json({ recording });
  } catch (error) {
    console.error('Error fetching recording:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Delete a recording (only owner or creator)
app.delete('/api/recordings/:recordingId', checkJwt, async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.auth.sub;
    
    const recording = await Recording.findById(recordingId).populate('projectId', 'ownerId');
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    // Only creator or project owner can delete
    const isCreator = recording.userId === userId;
    const isProjectOwner = recording.projectId.ownerId === userId;
    
    if (!isCreator && !isProjectOwner) {
      return res.status(403).json({ error: 'You do not have permission to delete this recording' });
    }
    
    await Recording.findByIdAndDelete(recordingId);
    
    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// User Settings Routes
// Get user settings
app.get('/api/user/settings', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      profile: {
        name: user.name,
        email: user.email,
        picture: user.picture,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      },
      privacy: user.privacySettings || {},
      security: user.securitySettings || {},
      notifications: user.notificationSettings || {}
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update user profile
app.put('/api/user/profile', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { name, bio, location, website } = req.body;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({ message: 'Profile updated successfully', profile: {
      name: user.name,
      email: user.email,
      picture: user.picture,
      bio: user.bio,
      location: user.location,
      website: user.website
    }});
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update privacy settings
app.put('/api/user/privacy', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const privacySettings = req.body;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.privacySettings = { ...user.privacySettings, ...privacySettings };
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({ message: 'Privacy settings updated successfully', privacy: user.privacySettings });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update security settings
app.put('/api/user/security', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const securitySettings = req.body;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.securitySettings = { ...user.securitySettings, ...securitySettings };
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({ message: 'Security settings updated successfully', security: user.securitySettings });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Update notification settings
app.put('/api/user/notifications', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const notificationSettings = req.body;
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({ message: 'Notification settings updated successfully', notifications: user.notificationSettings });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Error handler for JWT authentication (must be after routes)
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    console.error('JWT Authentication Error:', err.message);
    return res.status(401).json({ error: 'Invalid or missing token', details: err.message });
  }
  console.error('Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please:`);
    console.error(`   1. Kill the process: lsof -ti:${PORT} | xargs kill -9`);
    console.error(`   2. Or change PORT in .env file to a different port`);
    console.error(`   3. Current PORT from .env: ${process.env.PORT || 'not set (using default 4000)'}`);
    process.exit(1);
  } else {
    throw err;
  }
});