import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from './VoiceRecorder';
import { apiService } from '../services/api';
import { recordingApi } from '../services/recordingApi';
import { elevenLabsApi } from '../services/elevenLabsApi';
import './Pages.css';

const AIInsights = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [pendingTranscript, setPendingTranscript] = useState(''); // Store transcript before state updates
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [activeView, setActiveView] = useState('insights'); // 'notes', 'insights', 'brainstorm'
  const [notes, setNotes] = useState(null);
  const [insights, setInsights] = useState(null);
  const [brainstorm, setBrainstorm] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [narrating, setNarrating] = useState(false);
  const [narrationAudio, setNarrationAudio] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const [voices, setVoices] = useState([]);
  const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' or 'gpt-4'
  const [aiModel, setAiModel] = useState('gpt-4-turbo-preview'); // For OpenAI models

  // Fetch projects and voices on mount
  useEffect(() => {
    fetchProjects();
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      const data = await elevenLabsApi.getVoices(token);
      setVoices(data.voices || []);
      if (data.voices && data.voices.length > 0) {
        setSelectedVoice(data.voices[0].voice_id);
      }
    } catch (err) {
      console.error('Error fetching voices:', err);
      // Don't show error, just use default voice
    }
  };

  // Debug: Log when modal state changes
  useEffect(() => {
    console.log('showSelectionModal changed to:', showSelectionModal);
  }, [showSelectionModal]);

  const fetchProjects = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      const data = await apiService.getIdeas(token);
      setProjects(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleTranscriptComplete = (data) => {
    console.log('Transcript complete received:', data); // Debug log
    const transcriptText = data.transcript || '';
    console.log('Transcript text length:', transcriptText.length);
    // Store transcript in both state and pending transcript for immediate use in modal
    setPendingTranscript(transcriptText);
    setTranscript(transcriptText);
    setAudioURL(data.audioURL || null);
    setRecordingTime(data.recordingTime || 0);
    // Show selection modal - use pendingTranscript in modal check
    setTimeout(() => {
      setShowSelectionModal(true);
      console.log('Setting showSelectionModal to true, transcript:', transcriptText.substring(0, 50));
    }, 200); // Increased timeout to ensure state is updated
  };

  const generateInsights = async (transcriptText) => {
    // Use provided transcriptText, or fall back to state
    const transcriptToUse = transcriptText || transcript || pendingTranscript;
    if (!transcriptToUse || transcriptToUse.trim().length === 0) {
      setError('No transcript available. Please record first or wait for processing.');
      setShowSelectionModal(false);
      return;
    }
    
    console.log('generateInsights called with transcript length:', transcriptToUse.length);
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setActiveView('insights');
    setShowSelectionModal(false);
    
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/gemini/analyze-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          transcript: transcriptToUse,
          aiProvider: aiProvider,
          model: aiProvider === 'gpt-4' ? aiModel : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to generate insights');
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNotes = async () => {
    // Use pendingTranscript if transcript is not yet set
    const transcriptToUse = transcript || pendingTranscript;
    if (!transcriptToUse || transcriptToUse.trim().length === 0) {
      setError('No transcript available. Please record first or wait for processing.');
      setShowSelectionModal(false);
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setActiveView('notes');
    setShowSelectionModal(false);
    
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/gemini/meeting-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          transcript: transcriptToUse,
          aiProvider: aiProvider,
          model: aiProvider === 'gpt-4' ? aiModel : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to generate meeting notes');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Error generating notes:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateBrainstorm = async () => {
    // Use pendingTranscript if transcript is not yet set
    const transcriptToUse = transcript || pendingTranscript;
    if (!transcriptToUse || transcriptToUse.trim().length === 0) {
      setError('No transcript available. Please record first or wait for processing.');
      setShowSelectionModal(false);
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setActiveView('brainstorm');
    setShowSelectionModal(false);
    
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/gemini/brainstorm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          transcript: transcriptToUse,
          aiProvider: aiProvider,
          model: aiProvider === 'gpt-4' ? aiModel : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to generate brainstorm');
      const data = await response.json();
      setBrainstorm(data);
    } catch (err) {
      console.error('Error generating brainstorm:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMindMap = async () => {
    // Use pendingTranscript if transcript is not yet set
    const transcriptToUse = transcript || pendingTranscript;
    if (!transcriptToUse || transcriptToUse.trim().length === 0) {
      setError('No transcript available. Please record first or wait for processing.');
      setShowSelectionModal(false);
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setActiveView('mindmap');
    setShowSelectionModal(false);
    
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/gemini/mermaid-mindmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          transcript: transcriptToUse,
          aiProvider: aiProvider,
          model: aiProvider === 'gpt-4' ? aiModel : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to generate mind map');
      const data = await response.json();
      setBrainstorm({ mindmap: data.mindmap, flowchart: null, ideas: null });
    } catch (err) {
      console.error('Error generating mind map:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadContent = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleNarrateTranscript = async () => {
    if (!transcript || transcript.trim().length === 0) {
      setError('No transcript available to narrate. Please record first.');
      return;
    }

    try {
      setNarrating(true);
      setError(null);
      setSuccess(null);
      
      console.log('Starting narration...', { transcriptLength: transcript.length, voiceId: selectedVoice });
      
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      console.log('Token obtained, calling ElevenLabs API...');
      const data = await elevenLabsApi.narrateTranscript(token, transcript, selectedVoice);
      
      console.log('Narration response:', { totalChunks: data.totalChunks, format: data.format });
      
      // Convert base64 audio chunks to playable audio
      if (data.audioChunks && data.audioChunks.length > 0) {
        // Combine chunks into single audio
        const audioBlob = new Blob(
          data.audioChunks.map(chunk => {
            try {
              const binaryString = atob(chunk);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return bytes;
            } catch (e) {
              console.error('Error decoding audio chunk:', e);
              return new Uint8Array(0);
            }
          }),
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        setNarrationAudio(audioUrl);
        setSuccess('Audio narration generated successfully!');
        console.log('✅ Audio narration created:', audioUrl);
      } else {
        throw new Error('No audio chunks received from server');
      }
    } catch (err) {
      console.error('Error narrating transcript:', err);
      const errorMessage = err.message || 'Failed to narrate transcript. Please check that the backend server is running and the ElevenLabs API key is configured.';
      setError(errorMessage);
    } finally {
      setNarrating(false);
    }
  };

  const handleSaveRecording = async () => {
    if (!selectedProject) {
      setError('Please select a project to save the recording');
      return;
    }

    if (!recordingTitle.trim()) {
      setError('Please enter a title for the recording');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      const recordingData = {
        projectId: selectedProject,
        title: recordingTitle.trim(),
        transcript,
        audioURL,
        recordingTime,
        insights,
        notes,
        brainstorm,
        mindmap: brainstorm?.mindmap || null
      };

      await recordingApi.saveRecording(token, recordingData);
      
      setSuccess('Recording saved successfully! Collaborators can now see it.');
      setShowSaveModal(false);
      setRecordingTitle('');
      
      // Optionally navigate to project
      setTimeout(() => {
        navigate(`/projects/${selectedProject}`);
      }, 2000);
    } catch (err) {
      console.error('Error saving recording:', err);
      setError(err.message || 'Failed to save recording');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🤖 AI Insights</h1>
          <p className="page-subtitle">Record conversations and get AI-powered analysis, notes, and visualizations</p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#2A1F1F',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#1F2A1F',
          border: '1px solid #51cf66',
          borderRadius: '8px',
          color: '#51cf66'
        }}>
          {success}
        </div>
      )}

      <VoiceRecorder onTranscriptComplete={handleTranscriptComplete} />

      {/* Narration Controls - Show when transcript is available */}
      {transcript && !isProcessing && !showSelectionModal && (
        <div style={{
          marginTop: '1rem',
          padding: '1.5rem',
          backgroundColor: '#101C34',
          border: '1px solid #233E66',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#C9D8E6', marginBottom: '1rem' }}>🔊 Audio Narration</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {voices.length > 0 && (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '8px',
                  color: '#C9D8E6',
                  minWidth: '200px'
                }}
              >
                {voices.map(voice => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} {voice.labels?.accent ? `(${voice.labels.accent})` : ''}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleNarrateTranscript}
              disabled={narrating}
              className="primary-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {narrating ? '⏳ Generating Audio...' : '🔊 Narrate Transcript'}
            </button>
          </div>
          {narrationAudio && (
            <div style={{ marginTop: '1rem' }}>
              <audio controls src={narrationAudio} style={{ width: '100%' }} />
            </div>
          )}
        </div>
      )}

      {/* Selection Modal - Show after stopping recording */}
      {showSelectionModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'default'
          }}
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowSelectionModal(false);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: '#101C34',
              border: '1px solid #233E66',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              position: 'relative',
              zIndex: 10001,
              pointerEvents: 'auto'
            }}
            onClick={(e) => {
              // Prevent clicks inside modal from closing it
              e.stopPropagation();
            }}
          >
            <h2 style={{ color: '#C9D8E6', marginBottom: '1rem' }}>What would you like to generate?</h2>
            <p style={{ color: '#8B9BAE', marginBottom: '1rem' }}>Select an option to process your recording:</p>
            
            {/* AI Provider Selection */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#0A1126', borderRadius: '8px', border: '1px solid #233E66' }}>
              <label style={{ color: '#C9D8E6', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem', fontWeight: '500' }}>
                🤖 AI Provider:
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '4px',
                  color: '#C9D8E6',
                  width: '100%',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <option value="gemini">🤖 Google Gemini 1.5 Pro (Default - Fast & Cost-effective)</option>
                <option value="gpt-4">✨ OpenAI GPT-4 Turbo (Premium - Higher Quality)</option>
              </select>
              {aiProvider === 'gpt-4' && (
                <p style={{ color: '#8B9BAE', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  💡 GPT-4 provides higher quality but is more expensive. Falls back to Gemini if unavailable.
                </p>
              )}
            </div>
            
            {(() => {
              // Check both transcript and pendingTranscript to handle state timing
              const currentTranscript = transcript || pendingTranscript;
              const hasTranscript = currentTranscript && currentTranscript.trim().length > 0;
              
              if (!hasTranscript) {
                return (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: '#ffa500', marginBottom: '0.5rem', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: '#2A2A1F', borderRadius: '4px', border: '1px solid #ffa500' }}>
                      ⏳ Processing transcript... This may take a few moments.
                    </p>
                    <p style={{ color: '#8B9BAE', fontSize: '0.85rem', padding: '0 0.5rem' }}>
                      💡 You can still generate content using the audio file. The AI will process the audio directly.
                    </p>
                  </div>
                );
              } else {
                return (
                  <p style={{ color: '#51cf66', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: '#1F2A1F', borderRadius: '4px', border: '1px solid #51cf66' }}>
                    ✅ Transcript ready ({currentTranscript.length} characters)
                  </p>
                );
              }
            })()}
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Meeting Notes clicked');
                  generateNotes();
                }}
                className="primary-button"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 10002
                }}
                disabled={isProcessing}
              >
                <span style={{ fontSize: '2rem' }}>📝</span>
                Meeting Notes
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Insights clicked');
                  const transcriptToUse = transcript || pendingTranscript;
                  generateInsights(transcriptToUse);
                }}
                className="primary-button"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.1rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 10002,
                  opacity: isProcessing ? 0.6 : 1
                }}
                disabled={isProcessing}
              >
                <span style={{ fontSize: '2rem' }}>💡</span>
                Insights
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Mind Map clicked');
                  generateMindMap();
                }}
                className="primary-button"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 10002
                }}
                disabled={isProcessing}
              >
                <span style={{ fontSize: '2rem' }}>🗺️</span>
                Mind Map
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Brainstorm clicked');
                  generateBrainstorm();
                }}
                className="primary-button"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 10002
                }}
                disabled={isProcessing}
              >
                <span style={{ fontSize: '2rem' }}>🧠</span>
                Brainstorm
              </button>
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel clicked');
                setShowSelectionModal(false);
              }}
              className="secondary-button"
              style={{ 
                width: '100%',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save Recording Modal */}
      {showSaveModal && (notes || insights || brainstorm) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#101C34',
            border: '1px solid #233E66',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ color: '#C9D8E6', marginBottom: '1rem' }}>Save Recording to Project</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#C9D8E6' }}>
                Select Project:
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '8px',
                  color: '#C9D8E6'
                }}
              >
                <option value="">Select a project...</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.title} {project.isOwner ? '(Owner)' : '(Collaborator)'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#C9D8E6' }}>
                Recording Title:
              </label>
              <input
                type="text"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                placeholder="Enter a title for this recording..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '8px',
                  color: '#C9D8E6'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSaveRecording}
                className="primary-button"
                disabled={isProcessing || !selectedProject || !recordingTitle.trim()}
                style={{ flex: 1 }}
              >
                {isProcessing ? 'Saving...' : 'Save Recording'}
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setRecordingTitle('');
                }}
                className="secondary-button"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Show after recording */}
      {transcript && !isProcessing && !showSelectionModal && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#101C34',
          border: '1px solid #233E66',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#C9D8E6', marginBottom: '1rem' }}>Generate AI Content</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              onClick={generateNotes}
              className="primary-button"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              📝 Meeting Notes
            </button>
            <button
              onClick={() => generateInsights(transcript)}
              className="primary-button"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              💡 Insights
            </button>
            <button
              onClick={generateBrainstorm}
              className="primary-button"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              🧠 Brainstorm & Visualize
            </button>
          </div>
          
          {/* Save to Project Button */}
          {(notes || insights || brainstorm) && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="primary-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                justifyContent: 'center',
                marginTop: '1rem'
              }}
            >
              💾 Save Recording to Project
            </button>
          )}
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div style={{
          marginTop: '2rem',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#101C34',
          border: '1px solid #233E66',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#C9D8E6' }}>Generating {activeView === 'notes' ? 'meeting notes' : activeView === 'brainstorm' ? 'brainstorm visualization' : 'insights'} with Gemini AI...</p>
        </div>
      )}

      {/* Results Tabs */}
      {(notes || insights || brainstorm) && !isProcessing && (
        <div style={{
          marginTop: '2rem',
          backgroundColor: '#101C34',
          border: '1px solid #233E66',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #233E66'
          }}>
            {notes && (
              <button
                onClick={() => setActiveView('notes')}
                className={`tab ${activeView === 'notes' ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                📝 Meeting Notes
              </button>
            )}
            {insights && (
              <button
                onClick={() => setActiveView('insights')}
                className={`tab ${activeView === 'insights' ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                💡 Insights
              </button>
            )}
            {brainstorm && (
              <button
                onClick={() => setActiveView('brainstorm')}
                className={`tab ${activeView === 'brainstorm' ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                🧠 Brainstorm
              </button>
            )}
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Meeting Notes View */}
            {activeView === 'notes' && notes && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: '#C9D8E6' }}>Meeting Notes</h2>
                  <button
                    onClick={() => downloadContent(notes.formattedNotes || notes.notes || '', `meeting-notes-${new Date().toISOString()}.txt`)}
                    className="secondary-button"
                  >
                    📥 Download Notes
                  </button>
                </div>
                <div style={{
                  backgroundColor: '#0A1126',
                  border: '1px solid #233E66',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  whiteSpace: 'pre-wrap',
                  color: '#C9D8E6',
                  lineHeight: '1.8',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}>
                  {notes.formattedNotes || notes.notes || 'No notes generated'}
                </div>
              </div>
            )}

            {/* Insights View */}
            {activeView === 'insights' && insights && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ color: '#C9D8E6' }}>AI Insights</h2>
                  <button
                    onClick={() => {
                      const report = `SUMMARY\n${insights.summary || insights.rawAnalysis || ''}\n\nKEY POINTS\n${(insights.keyPoints || insights.keyInsights || []).join('\n')}\n\nACTION ITEMS\n${(insights.actionItems || []).map(i => typeof i === 'string' ? i : i.task || i).join('\n')}\n\nDECISIONS\n${(insights.decisions || []).join('\n')}\n\nTOPICS\n${(insights.topics || []).join(', ')}`;
                      downloadContent(report, `insights-${new Date().toISOString()}.txt`);
                    }}
                    className="secondary-button"
                  >
                    📥 Download Report
                  </button>
                </div>
                
                <div>
                  <h3 style={{ color: '#4A90E2', marginBottom: '0.75rem' }}>Summary</h3>
                  <p style={{
                    color: '#C9D8E6',
                    lineHeight: '1.6',
                    backgroundColor: '#0A1126',
                    padding: '1rem',
                    borderRadius: '8px'
                  }}>
                    {insights.summary || insights.rawAnalysis || 'No summary available'}
                  </p>
                </div>

                {(insights.keyPoints || insights.keyInsights) && (
                  <div>
                    <h3 style={{ color: '#4A90E2', marginBottom: '0.75rem' }}>Key Points</h3>
                    <ul style={{ color: '#C9D8E6', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                      {(insights.keyPoints || insights.keyInsights).map((point, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>
                          <span style={{
                            backgroundColor: '#4A90E2',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            marginRight: '0.75rem'
                          }}>
                            {i + 1}
                          </span>
                          {point}
                        </li>
              ))}
            </ul>
          </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {insights.actionItems && insights.actionItems.length > 0 && (
                    <div>
                      <h3 style={{ color: '#4A90E2', marginBottom: '0.75rem' }}>Action Items</h3>
            <ul style={{ color: '#C9D8E6', lineHeight: '1.8' }}>
                        {insights.actionItems.map((item, i) => (
                          <li key={i} style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: '#8A2BE2', marginRight: '0.5rem' }}>→</span>
                            {typeof item === 'string' ? item : item.task || item}
                          </li>
              ))}
            </ul>
          </div>
                  )}

                  {insights.decisions && insights.decisions.length > 0 && (
          <div>
                      <h3 style={{ color: '#4A90E2', marginBottom: '0.75rem' }}>Decisions</h3>
            <ul style={{ color: '#C9D8E6', lineHeight: '1.8' }}>
                        {insights.decisions.map((decision, i) => (
                          <li key={i} style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: '#51cf66', marginRight: '0.5rem' }}>✓</span>
                            {decision}
                          </li>
              ))}
            </ul>
                    </div>
                  )}
                </div>

                {insights.topics && insights.topics.length > 0 && (
                  <div>
                    <h3 style={{ color: '#4A90E2', marginBottom: '0.75rem' }}>Topics Discussed</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {insights.topics.map((topic, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: '#2A3F5F',
                            color: '#4A90E2',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {insights.sentiment && (
                  <div>
                    <h3 style={{ color: '#4A90E2', marginBottom: '0.75rem' }}>Overall Sentiment</h3>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      backgroundColor: insights.sentiment === 'positive' ? '#1F2A1F' : 
                                      insights.sentiment === 'negative' ? '#2A1F1F' : '#1F1F2A',
                      color: insights.sentiment === 'positive' ? '#51cf66' : 
                             insights.sentiment === 'negative' ? '#ff6b6b' : '#4A90E2',
                      textTransform: 'capitalize'
                    }}>
                      {insights.sentiment}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Brainstorm View */}
            {activeView === 'brainstorm' && brainstorm && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: '#C9D8E6' }}>Brainstorm & Visualization</h2>
                  <button
                    onClick={() => downloadContent(brainstorm.flowchart || brainstorm.mindmap || brainstorm.visualization || '', `brainstorm-${new Date().toISOString()}.txt`)}
                    className="secondary-button"
                  >
                    📥 Download
                  </button>
                </div>
                
                {brainstorm.flowchart && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: '#4A90E2', marginBottom: '1rem' }}>Flowchart</h3>
                    <div style={{
                      backgroundColor: '#0A1126',
                      border: '1px solid #233E66',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      overflowX: 'auto'
                    }}>
                      <pre style={{
                        color: '#C9D8E6',
                        fontSize: '0.9rem',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        margin: 0
                      }}>
                        {brainstorm.flowchart}
                      </pre>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#8B9BAE', marginTop: '1rem' }}>
                      Copy the code above and paste it into{' '}
                      <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" style={{ color: '#4A90E2' }}>
                        mermaid.live
                      </a>
                      {' '}to visualize
                    </p>
                  </div>
                )}

                {brainstorm.ideas && (
                  <div>
                    <h3 style={{ color: '#4A90E2', marginBottom: '1rem' }}>Ideas & Concepts</h3>
                    <div style={{
                      backgroundColor: '#0A1126',
                      border: '1px solid #233E66',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      whiteSpace: 'pre-wrap',
                      color: '#C9D8E6',
                      lineHeight: '1.8'
                    }}>
                      {brainstorm.ideas}
                    </div>
                  </div>
                )}

                {brainstorm.mindmap && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ color: '#4A90E2', marginBottom: '1rem' }}>Mind Map</h3>
                    <div style={{
                      backgroundColor: '#0A1126',
                      border: '1px solid #233E66',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      overflowX: 'auto'
                    }}>
                      <pre style={{
                        color: '#C9D8E6',
                        fontSize: '0.9rem',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        margin: 0
                      }}>
                        {brainstorm.mindmap}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
