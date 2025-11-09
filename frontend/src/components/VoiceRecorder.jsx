import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const VoiceRecorder = ({ onTranscriptComplete, projectId }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current.onend = () => {
        if (isRecording && !isPaused) {
          recognitionRef.current.start();
        }
      };
    }

    // Cleanup only on unmount, not when dependencies change
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Don't clear timer here - it's managed separately
    };
  }, []); // Empty dependency array - only run once on mount

  // Separate effect to handle speech recognition restart
  useEffect(() => {
    if (recognitionRef.current && isRecording && !isPaused) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started, ignore
      }
    } else if (recognitionRef.current && (!isRecording || isPaused)) {
      recognitionRef.current.stop();
    }
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Convert audio to base64 for Gemini transcription
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          try {
            setIsProcessing(true);
            const token = await getAccessTokenSilently({
              authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              }
            });

            // Transcribe audio using Gemini
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gemini/transcribe-audio`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType: 'audio/webm',
                projectId
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.transcript) {
                setTranscript(prev => prev + ' ' + data.transcript);
              }
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      
      // Reset and start timer BEFORE setting isRecording to true
      setRecordingTime(0);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Start fresh timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          console.log('Timer updating:', newTime); // Debug log
          return newTime;
        });
      }, 1000);
      
      // Set recording state AFTER timer is set up
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        // Resume recording
        mediaRecorderRef.current.resume();
        recognitionRef.current?.start();
        // Resume timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        // Pause recording
        mediaRecorderRef.current.pause();
        recognitionRef.current?.stop();
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      recognitionRef.current?.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
      setIsPaused(false);
      
      // Notify parent that recording is complete - always call, even if transcript is empty
      // Use a small delay to ensure transcript state is updated
      setTimeout(() => {
        console.log('Stopping recording, transcript:', transcript); // Debug log
        if (onTranscriptComplete) {
          onTranscriptComplete({ 
            transcript: transcript || '', 
            audioURL, 
            recordingTime 
          });
        }
      }, 100);
    }
  };

  const analyzeWithGemini = async () => {
    if (!transcript) {
      alert('No transcript available to analyze');
      return;
    }

    setIsProcessing(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gemini/analyze-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transcript,
          projectId
        })
      });

      if (!response.ok) throw new Error('Failed to analyze conversation');

      const insights = await response.json();
      
      if (onTranscriptComplete) {
        onTranscriptComplete({ transcript, insights, audioURL });
      }
    } catch (error) {
      console.error('Error analyzing with Gemini:', error);
      alert('Failed to analyze conversation');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#162033',
      borderRadius: '12px',
      border: '1px solid #2A3F5F'
    }}>
      <h3 style={{ color: '#C9D8E6', marginBottom: '1.5rem' }}>🎤 Voice Recording & Transcription</h3>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Recording Timer - Always show when recording */}
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: isRecording ? '#4A90E2' : '#8B9BAE',
          fontFamily: 'monospace',
          marginBottom: '1rem',
          minHeight: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          transition: 'color 0.3s'
        }}>
          {isRecording ? formatTime(recordingTime) : '00:00'}
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🎤 Start Recording
            </button>
          ) : (
            <>
              <button
                onClick={pauseRecording}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#FFA500',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={stopRecording}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                ⏹️ Stop
              </button>
            </>
          )}
        </div>

        {/* Live Transcript */}
        {(isRecording || transcript) && (
          <div style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#0A1126',
            borderRadius: '8px',
            border: '1px solid #2A3F5F'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ color: '#C9D8E6', margin: 0 }}>
                {isRecording ? '🎙️ Live Listening...' : '📝 Transcript'}
              </h4>
              {isRecording && (
                <span style={{
                  color: '#51cf66',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#51cf66',
                    animation: 'pulse-recording 1.5s infinite'
                  }}></span>
                  Recording
                </span>
              )}
            </div>
            <p style={{
              color: isRecording ? '#C9D8E6' : '#8B9BAE',
              lineHeight: '1.6',
              maxHeight: '200px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              minHeight: '50px'
            }}>
              {transcript || (isRecording ? 'Listening...' : '')}
            </p>
          </div>
        )}

        {/* Audio Playback */}
        {audioURL && (
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <audio controls src={audioURL} style={{ width: '100%' }} />
          </div>
        )}

        {/* Analyze Button */}
        {transcript && !isRecording && (
          <button
            onClick={analyzeWithGemini}
            disabled={isProcessing}
            style={{
              padding: '1rem 2rem',
              backgroundColor: isProcessing ? '#555' : '#50C878',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              marginTop: '1rem'
            }}
          >
            {isProcessing ? '🤖 Analyzing...' : '🤖 Analyze with Gemini AI'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;