import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { elevenLabsApi } from '../services/elevenLabsApi';
import './Pages.css';

const Transcripts = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationAudio, setNarrationAudio] = useState(null);

  const transcriptSessions = [
    {
      id: 1,
      project: 'Marketing Strategy Q1',
      date: 'Nov 8, 2025',
      duration: '45 min',
      participants: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      messageCount: 127,
      keyTopics: ['Social Media', 'Budget', 'Timeline']
    },
    {
      id: 2,
      project: 'Product Roadmap 2024',
      date: 'Nov 7, 2025',
      duration: '32 min',
      participants: ['John Doe', 'Sarah Lee'],
      messageCount: 84,
      keyTopics: ['Features', 'Mobile App', 'User Testing']
    },
    {
      id: 3,
      project: 'Marketing Strategy Q1',
      date: 'Nov 6, 2025',
      duration: '28 min',
      participants: ['Jane Smith', 'Mike Johnson'],
      messageCount: 56,
      keyTopics: ['Instagram Strategy', 'Content Calendar']
    }
  ];

  const sampleMessages = [
    { speaker: 'John Doe', time: '10:23 AM', text: 'Let\'s start by discussing our Q1 social media strategy.' },
    { speaker: 'Jane Smith', time: '10:24 AM', text: 'I think we should focus heavily on Instagram and LinkedIn.' },
    { speaker: 'Mike Johnson', time: '10:25 AM', text: 'Agreed. What\'s our budget allocation looking like?' },
    { speaker: 'John Doe', time: '10:26 AM', text: 'We have $50k for Q1. I suggest 60% on Instagram, 30% on LinkedIn, and 10% for testing new platforms.' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Conversation Transcripts</h1>
          <p className="page-subtitle">Review and search through all recorded conversations</p>
        </div>
        <button className="secondary-button">📥 Export All</button>
      </div>

      <div className="transcripts-layout">
        {/* Left side - Session list */}
        <div className="transcripts-sidebar">
          <div className="transcripts-search">
            <input type="search" placeholder="Search transcripts..." />
          </div>

          <div className="transcript-sessions">
            {transcriptSessions.map(session => (
              <div 
                key={session.id} 
                className={`session-card ${selectedTranscript === session.id ? 'selected' : ''}`}
                onClick={() => setSelectedTranscript(session.id)}
              >
                <div className="session-header">
                  <h4>{session.project}</h4>
                  <span className="session-date">{session.date}</span>
                </div>
                <div className="session-meta">
                  <span>⏱️ {session.duration}</span>
                  <span>💬 {session.messageCount} messages</span>
                </div>
                <div className="session-participants">
                  <span>👥 {session.participants.join(', ')}</span>
                </div>
                <div className="session-topics">
                  {session.keyTopics.map((topic, idx) => (
                    <span key={idx} className="topic-tag">{topic}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Transcript viewer */}
        <div className="transcript-viewer">
          {selectedTranscript ? (
            <>
              <div className="viewer-header">
                <div>
                  <h2>{transcriptSessions.find(s => s.id === selectedTranscript)?.project}</h2>
                  <p className="viewer-meta">
                    {transcriptSessions.find(s => s.id === selectedTranscript)?.date} • 
                    {transcriptSessions.find(s => s.id === selectedTranscript)?.duration}
                  </p>
                </div>
                <div className="viewer-actions">
                  <button className="secondary-button">📥 Export</button>
                  <button className="secondary-button">🗺️ Generate Mind Map</button>
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsNarrating(true);
                        const token = await getAccessTokenSilently({
                          authorizationParams: {
                            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                          }
                        });
                        const transcriptText = sampleMessages.map(m => `${m.speaker}: ${m.text}`).join('\n');
                        const audio = await elevenLabsApi.narrateTranscript(token, transcriptText);
                        if (audio.audioChunks && audio.audioChunks.length > 0) {
                          // Convert base64 to audio URL
                          const audioData = `data:audio/mpeg;base64,${audio.audioChunks[0]}`;
                          setNarrationAudio(audioData);
                        }
                      } catch (error) {
                        console.error('Error narrating:', error);
                        alert('Failed to narrate transcript. Make sure ElevenLabs API key is configured.');
                      } finally {
                        setIsNarrating(false);
                      }
                    }}
                    disabled={isNarrating}
                  >
                    {isNarrating ? '🔊 Narrating...' : '🔊 Listen to Transcript'}
                  </button>
                  <button className="primary-button">🤖 AI Summary</button>
                </div>
              </div>

              <div className="transcript-content">
                {sampleMessages.map((msg, idx) => (
                  <div key={idx} className="message-block">
                    <div className="message-header">
                      <strong>{msg.speaker}</strong>
                      <span className="message-time">{msg.time}</span>
                    </div>
                    <p className="message-text">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Audio Narration */}
              {narrationAudio && (
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  backgroundColor: '#162033',
                  borderRadius: '8px',
                  border: '1px solid #2A3F5F'
                }}>
                  <h3 style={{ color: '#C9D8E6', marginBottom: '1rem' }}>🔊 Audio Narration</h3>
                  <audio controls src={narrationAudio} style={{ width: '100%' }} />
                </div>
              )}

              <div className="ai-summary-panel">
                <h3>🤖 AI Summary</h3>
                <p>This conversation focused on Q1 social media strategy with emphasis on Instagram and LinkedIn campaigns. Budget allocation of $50k was discussed with a 60-30-10 split across platforms.</p>
                <div className="summary-actions">
                  <button className="text-button">View Key Points →</button>
                  <button className="text-button">Extract Action Items →</button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-viewer">
              <h3>Select a transcript to view</h3>
              <p>Choose a conversation from the list to see the full transcript and AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transcripts;