import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_23546c1b4a1a08dc5b8d3a27eba9e0859c37c08cf97024e7';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Log API key status (without exposing the key)
if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === '') {
  console.warn('⚠️ ElevenLabs API key not configured. Text-to-speech features will not work.');
} else {
  console.log('✅ ElevenLabs API key configured');
}

export const elevenLabsService = {
  // Get available voices
  async getVoices() {
    try {
      if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === '') {
        throw new Error('ElevenLabs API key not configured');
      }

      console.log('Fetching ElevenLabs voices...');
      const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      });
      
      const voices = response.data.voices || [];
      console.log(`✅ Found ${voices.length} voices`);
      return voices;
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error.response?.data || error.message);
      throw new Error(`Failed to fetch voices: ${error.response?.data?.detail?.message || error.message}`);
    }
  },

  // Convert text to speech
  async textToSpeech(text, voiceId = '21m00Tcm4TlvDq8ikWAM', options = {}) {
    try {
      if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === '') {
        throw new Error('ElevenLabs API key not configured');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('Text is required for text-to-speech');
      }

      const {
        stability = 0.5,
        similarityBoost = 0.75,
        style = 0.0,
        useSpeakerBoost = true
      } = options;

      console.log(`Generating speech for ${text.length} characters with voice ${voiceId}`);

      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      // Convert arraybuffer to base64
      const audioBuffer = Buffer.from(response.data);
      const audioBase64 = audioBuffer.toString('base64');

      console.log(`✅ Generated audio: ${audioBuffer.length} bytes`);

      return {
        audio: audioBase64,
        format: 'mp3',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error with ElevenLabs text-to-speech:', error.response?.data || error.message);
      throw new Error(`Failed to generate speech: ${error.response?.data?.detail?.message || error.message}`);
    }
  },

  // Convert transcript to speech for easy listening
  async narrateTranscript(transcript, voiceId = '21m00Tcm4TlvDq8ikWAM') {
    try {
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is required for narration');
      }

      // Split long transcripts into chunks (ElevenLabs has character limits)
      const maxChunkLength = 5000;
      const chunks = [];
      
      for (let i = 0; i < transcript.length; i += maxChunkLength) {
        chunks.push(transcript.substring(i, i + maxChunkLength));
      }

      console.log(`Narrating transcript in ${chunks.length} chunk(s)...`);

      // Generate audio for each chunk
      const audioChunks = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
        const audio = await this.textToSpeech(chunks[i], voiceId);
        audioChunks.push(audio.audio);
      }

      console.log(`✅ Narrated transcript: ${audioChunks.length} chunk(s)`);

      return {
        audioChunks,
        format: 'mp3',
        totalChunks: audioChunks.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error narrating transcript:', error);
      throw new Error(`Failed to narrate transcript: ${error.message}`);
    }
  }
};

