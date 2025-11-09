# API Enhancements - MindMesh

This document outlines the enhanced API integrations for the MindMesh application, leveraging **Google Gemini API** and **ElevenLabs API** for advanced AI features.

## 🚀 Enhanced Features

### 1. **Google Gemini API Integration**

#### Upgraded to Gemini 1.5 Pro
- **Better Analysis**: Using `gemini-1.5-pro` model for superior text analysis
- **Structured Outputs**: JSON-formatted responses for better data handling
- **Advanced Prompts**: Expert-level prompts for conversation analysis

#### New Features:
- **Audio Transcription**: Transcribe audio recordings using Gemini's multimodal capabilities
- **Enhanced Mind Map Generation**: More structured and hierarchical mind maps
- **Comprehensive Conversation Analysis**: Extract insights, action items, decisions, topics, and sentiment

#### API Endpoints:
- `POST /api/gemini/analyze` - Analyze text with structured insights
- `POST /api/gemini/mind-map` - Generate hierarchical mind maps
- `POST /api/gemini/analyze-conversation` - Analyze conversation transcripts
- `POST /api/gemini/transcribe-audio` - Transcribe audio recordings

### 2. **ElevenLabs API Integration**

#### Text-to-Speech Features:
- **Natural Voice Narration**: Convert transcripts to natural-sounding speech
- **Multiple Voice Options**: Support for different voices
- **Chunked Processing**: Handle long transcripts by splitting into chunks

#### API Endpoints:
- `GET /api/elevenlabs/voices` - Get available voices
- `POST /api/elevenlabs/text-to-speech` - Convert text to speech
- `POST /api/elevenlabs/narrate-transcript` - Narrate full transcripts

## 📋 Setup Instructions

### Backend Environment Variables

Add these to your `backend/.env` file:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Auth0 Configuration (existing)
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
AUTH0_CLIENT_ID=your_auth0_client_id

# MongoDB (existing)
MONGODB_URI=your_mongodb_uri
```

### Getting API Keys

#### Google Gemini API:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

#### ElevenLabs API:
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Go to your profile settings
3. Copy your API key
4. Add it to your `.env` file

## 🎯 Usage Examples

### Frontend: Voice Recording with Auto-Transcription

The `VoiceRecorder` component now automatically transcribes audio using Gemini:

```jsx
<VoiceRecorder 
  onTranscriptComplete={handleTranscriptComplete}
  projectId={projectId}
/>
```

### Frontend: Text-to-Speech for Transcripts

Listen to transcripts using ElevenLabs:

```jsx
import { elevenLabsApi } from '../services/elevenLabsApi';

const audio = await elevenLabsApi.narrateTranscript(token, transcriptText);
// Play audio using the returned base64 audio data
```

### Backend: Enhanced Analysis

The Gemini service now returns structured data:

```javascript
const analysis = await geminiService.analyzeConversation(transcript);
// Returns: { summary, keyInsights, actionItems, topics, decisions, sentiment, nextSteps }
```

## 📊 Enhanced Analysis Output

The conversation analysis now includes:

- **Summary**: 2-3 sentence overview
- **Key Insights**: Main takeaways from the conversation
- **Action Items**: Tasks with priority and assignee
- **Topics**: Main topics discussed
- **Decisions**: Decisions made during the conversation
- **Questions**: Questions raised
- **Sentiment**: Overall sentiment (positive/neutral/negative)
- **Next Steps**: Recommended follow-up actions

## 🎨 UI Enhancements

### AI Insights Component
- Displays structured analysis results
- Shows sentiment with color coding
- Displays topics as tags
- Lists action items with priorities

### Transcripts Component
- "Listen to Transcript" button for text-to-speech
- Audio player for narrated transcripts
- Enhanced transcript viewing

## 🔧 Technical Details

### Gemini Service (`geminiServices.js`)
- Uses `gemini-1.5-pro` model
- Structured JSON responses
- Error handling with fallbacks
- Audio transcription support

### ElevenLabs Service (`elevenLabsService.js`)
- Text-to-speech conversion
- Voice selection support
- Chunked processing for long texts
- Base64 audio encoding

## 🚨 Error Handling

Both services include comprehensive error handling:
- API key validation
- Network error handling
- Fallback responses
- User-friendly error messages

## 📝 Notes

- **ElevenLabs API Key**: Required for text-to-speech features. The app will gracefully handle missing keys.
- **Gemini API Key**: Required for all AI features. Ensure it's properly configured.
- **Rate Limits**: Be aware of API rate limits for both services.
- **Audio Formats**: Currently supports `audio/webm` for transcription.

## 🎉 Benefits

1. **Better Analysis**: More accurate and structured insights
2. **Audio Features**: Transcribe and narrate audio content
3. **Enhanced UX**: Text-to-speech for accessibility
4. **Structured Data**: JSON responses for easier data handling
5. **Professional Quality**: Using industry-leading AI APIs

