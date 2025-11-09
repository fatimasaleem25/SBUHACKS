const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const elevenLabsApi = {
  // Get available voices
  async getVoices(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/elevenlabs/voices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch voices: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  },

  // Convert text to speech
  async textToSpeech(token, text, voiceId = '21m00Tcm4TlvDq8ikWAM', options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/elevenlabs/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, voiceId, options })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate speech: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      throw error;
    }
  },

  // Narrate transcript
  async narrateTranscript(token, transcript, voiceId = '21m00Tcm4TlvDq8ikWAM') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/elevenlabs/narrate-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transcript, voiceId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to narrate transcript: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error narrating transcript:', error);
      throw error;
    }
  }
};

