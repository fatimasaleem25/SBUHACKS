import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { apiService } from "../services/api";
import { recordingApi } from "../services/recordingApi";
import { elevenLabsApi } from "../services/elevenLabsApi";
import "./Pages.css";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [activeTab, setActiveTab] = useState("recordings");
  const [isRecording, setIsRecording] = useState(false);
  const [project, setProject] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [narrating, setNarrating] = useState(false);
  const [narrationAudio, setNarrationAudio] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    fetchProject();
    fetchRecordings();
    fetchVoices();
  }, [projectId]);

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

  const fetchProject = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      const projects = await apiService.getIdeas(token);
      const foundProject = projects.find(p => p._id === projectId);
      setProject(foundProject || { title: 'Project', description: '' });
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.message);
    }
  };

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      const data = await recordingApi.getProjectRecordings(token, projectId);
      setRecordings(data.recordings || []);
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecording = async (recordingId) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      const data = await recordingApi.getRecording(token, recordingId);
      setSelectedRecording(data.recording);
      setActiveTab('recordings');
    } catch (err) {
      console.error('Error fetching recording:', err);
      setError(err.message);
    }
  };

  const handleDeleteRecording = async (recordingId) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      await recordingApi.deleteRecording(token, recordingId);
      setRecordings(recordings.filter(r => r._id !== recordingId));
      if (selectedRecording?._id === recordingId) {
        setSelectedRecording(null);
      }
    } catch (err) {
      console.error('Error deleting recording:', err);
      setError(err.message);
    }
  };

  const handleNarrateTranscript = async () => {
    if (!selectedRecording?.transcript || selectedRecording.transcript.trim().length === 0) {
      setError('No transcript available to narrate');
      return;
    }

    try {
      setNarrating(true);
      setError(null);
      
      console.log('Starting narration for recording...', { 
        transcriptLength: selectedRecording.transcript.length, 
        voiceId: selectedVoice 
      });
      
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      console.log('Token obtained, calling ElevenLabs API...');
      const data = await elevenLabsApi.narrateTranscript(token, selectedRecording.transcript, selectedVoice);
      
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      console.log("🎙️ Starting recording with Gemini AI...");
    } else {
      console.log("⏹️ Stopping recording...");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "recordings":
        return (
          <div className="tab-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#C9D8E6' }}>
                Loading recordings...
              </div>
            ) : error ? (
              <div style={{
                padding: '1rem',
                backgroundColor: '#2A1F1F',
                border: '1px solid #ff6b6b',
                borderRadius: '8px',
                color: '#ff6b6b'
              }}>
                {error}
              </div>
            ) : selectedRecording ? (
              <div>
                <button
                  onClick={() => setSelectedRecording(null)}
                  className="secondary-button"
                  style={{ marginBottom: '1rem' }}
                >
                  ← Back to Recordings
                </button>
                <div style={{
                  padding: '2rem',
                  backgroundColor: '#101C34',
                  border: '1px solid #233E66',
                  borderRadius: '12px'
                }}>
                  <h2 style={{ color: '#C9D8E6', marginBottom: '1rem' }}>{selectedRecording.title}</h2>
                  <p style={{ color: '#8B9BAE', marginBottom: '1rem' }}>
                    Created by {selectedRecording.userEmail} on {new Date(selectedRecording.createdAt).toLocaleString()}
                  </p>
                  
                  {selectedRecording.transcript && (
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ color: '#4A90E2', margin: 0 }}>Transcript</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {voices.length > 0 && (
                            <select
                              value={selectedVoice}
                              onChange={(e) => setSelectedVoice(e.target.value)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#1A2332',
                                border: '1px solid #2A3F5F',
                                borderRadius: '4px',
                                color: '#C9D8E6',
                                fontSize: '0.85rem'
                              }}
                            >
                              {voices.map(voice => (
                                <option key={voice.voice_id} value={voice.voice_id}>
                                  {voice.name}
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
                              gap: '0.5rem',
                              fontSize: '0.9rem',
                              padding: '0.5rem 1rem'
                            }}
                          >
                            {narrating ? '⏳ Generating...' : '🔊 Narrate Transcript'}
              </button>
                        </div>
                      </div>
                      {narrationAudio && (
                        <div style={{ marginBottom: '1rem' }}>
                          <audio controls src={narrationAudio} style={{ width: '100%' }} />
                        </div>
                      )}
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#0A1126',
                        borderRadius: '8px',
                        color: '#C9D8E6',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6'
                      }}>
                        {selectedRecording.transcript}
                      </div>
                    </div>
                  )}

                  {selectedRecording.insights && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ color: '#4A90E2', marginBottom: '0.5rem' }}>AI Insights</h3>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#0A1126',
                        borderRadius: '8px',
                        color: '#C9D8E6'
                      }}>
                        <p><strong>Summary:</strong> {selectedRecording.insights.summary || selectedRecording.insights.rawAnalysis || 'N/A'}</p>
                        {selectedRecording.insights.keyPoints && (
                          <div style={{ marginTop: '1rem' }}>
                            <strong>Key Points:</strong>
                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                              {selectedRecording.insights.keyPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                </div>
              )}
            </div>
                    </div>
                  )}

                  {selectedRecording.notes && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ color: '#4A90E2', marginBottom: '0.5rem' }}>Meeting Notes</h3>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#0A1126',
                        borderRadius: '8px',
                        color: '#C9D8E6',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedRecording.notes.formattedNotes || selectedRecording.notes.notes || 'No notes available'}
                      </div>
                    </div>
                  )}

                  {selectedRecording.brainstorm && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ color: '#4A90E2', marginBottom: '0.5rem' }}>Brainstorm & Visualization</h3>
                      {selectedRecording.brainstorm.flowchart && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Flowchart:</strong>
                          <pre style={{
                            padding: '1rem',
                            backgroundColor: '#0A1126',
                            borderRadius: '8px',
                            color: '#C9D8E6',
                            overflowX: 'auto',
                            fontSize: '0.9rem'
                          }}>
                            {selectedRecording.brainstorm.flowchart}
                          </pre>
                        </div>
                      )}
                      {selectedRecording.mindmap && (
                        <div>
                          <strong>Mind Map:</strong>
                          <pre style={{
                            padding: '1rem',
                            backgroundColor: '#0A1126',
                            borderRadius: '8px',
                            color: '#C9D8E6',
                            overflowX: 'auto',
                            fontSize: '0.9rem'
                          }}>
                            {selectedRecording.mindmap}
                          </pre>
                        </div>
                      )}
                    </div>
              )}
            </div>
          </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#C9D8E6' }}>Project Recordings</h3>
                  <button
                    onClick={() => navigate('/ai-insights')}
                    className="primary-button"
                  >
                    + New Recording
                  </button>
            </div>
                {recordings.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#8B9BAE',
                    backgroundColor: '#101C34',
                    borderRadius: '12px',
                    border: '1px solid #233E66'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
                    <p>No recordings yet. Create a recording to share with collaborators.</p>
                    <button
                      onClick={() => navigate('/ai-insights')}
                      className="primary-button"
                      style={{ marginTop: '1rem' }}
                    >
                      Create Recording
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {recordings.map(recording => (
                      <div
                        key={recording._id}
                        style={{
                          padding: '1.5rem',
                          backgroundColor: '#101C34',
                          border: '1px solid #233E66',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => handleViewRecording(recording._id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#4A90E2';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#233E66';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <h4 style={{ color: '#C9D8E6', marginBottom: '0.5rem' }}>{recording.title}</h4>
                        <p style={{ color: '#8B9BAE', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          By {recording.userEmail}
                        </p>
                        <p style={{ color: '#8B9BAE', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          {new Date(recording.createdAt).toLocaleDateString()} • {formatTime(recording.recordingTime || 0)}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {recording.insights && <span style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#2A3F5F',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#4A90E2'
                          }}>💡 Insights</span>}
                          {recording.notes && <span style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#2A3F5F',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#4A90E2'
                          }}>📝 Notes</span>}
                          {recording.brainstorm && <span style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#2A3F5F',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#4A90E2'
                          }}>🧠 Brainstorm</span>}
                        </div>
                </div>
              ))}
            </div>
                )}
              </div>
            )}
          </div>
        );

      case "mindmaps":
        return (
          <div className="tab-content">
            <div className="mindmap-header">
              <h3>Generated Mind Maps</h3>
              <button className="primary-button">+ Generate New Mind Map</button>
            </div>
            <div className="mindmap-grid">
              {mindMaps.map((map) => (
                <div key={map.id} className="mindmap-card">
                  <div className="mindmap-preview">
                    <span style={{ fontSize: "3rem" }}>🗺️</span>
                  </div>
                  <h4>{map.name}</h4>
                  <p>Created {map.createdAt}</p>
                  <button className="secondary-button">View</button>
                </div>
              ))}
            </div>
          </div>
        );

      case "actions":
        return (
          <div className="tab-content">
            <div className="actions-header">
              <h3>Action Items & Next Steps</h3>
              <button className="primary-button">+ Add Action</button>
            </div>
            <div className="actions-list">
              {actionItems.map((item) => (
                <div key={item.id} className="action-item">
                  <input
                    type="checkbox"
                    checked={item.status === "completed"}
                    readOnly
                  />
                  <div className="action-content">
                    <p>{item.task}</p>
                    <span>Assigned to: {item.assignee}</span>
                  </div>
                  <span className={`status-badge ${item.status}`}>
                    {item.status.replace("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
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

      <div className="project-detail-header">
        <button className="back-button" onClick={() => navigate("/projects")}>
          ← Back to Projects
        </button>
        <div className="project-info">
          <h1>{project?.title || 'Project'}</h1>
          {project && (
          <div className="collaborators-badge">
              👥 {1 + (project.collaborators?.length || 0)} {1 + (project.collaborators?.length || 0) === 1 ? 'member' : 'members'}
          </div>
          )}
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate('/collaborators')}
        >
          👥 Manage Collaborators
        </button>
      </div>

      <div className="project-tabs">
        <button
          className={`tab ${activeTab === "recordings" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("recordings");
            setSelectedRecording(null);
          }}
        >
          🎙️ Recordings ({recordings.length})
        </button>
        <button
          className={`tab ${activeTab === "conversation" ? "active" : ""}`}
          onClick={() => setActiveTab("conversation")}
        >
          🎙️ Live Conversation
        </button>
        <button
          className={`tab ${activeTab === "mindmaps" ? "active" : ""}`}
          onClick={() => setActiveTab("mindmaps")}
        >
          🗺️ Mind Maps
        </button>
        <button
          className={`tab ${activeTab === "actions" ? "active" : ""}`}
          onClick={() => setActiveTab("actions")}
        >
          ✅ Action Items
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default ProjectDetail;
