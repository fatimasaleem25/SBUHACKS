# OpenAI GPT-4 Integration Setup

## Overview

You can now use OpenAI GPT-4 Turbo for generating mind maps, meeting notes, insights, and brainstorming visualizations. The system automatically falls back to Google Gemini if OpenAI is unavailable.

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `sk-`)

### 2. Add API Key to Environment

Add the following to your `backend/.env` file:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Install Dependencies

The OpenAI package is already installed. If needed, run:

```bash
cd /Users/fatima/mindmesh/backend
npm install openai
```

## Usage

### Frontend

When recording stops and the modal appears, you can select:
- **🤖 Google Gemini 1.5 Pro** (Default - Fast & Cost-effective)
- **✨ OpenAI GPT-4 Turbo** (Premium - Higher Quality)

The selected AI provider will be used for all generation options (Meeting Notes, Insights, Mind Map, Brainstorm).

### Backend API

All AI endpoints now support `aiProvider` parameter:

```javascript
// Use Gemini (default)
POST /api/gemini/mermaid-mindmap
Body: { "transcript": "...", "aiProvider": "gemini" }

// Use GPT-4
POST /api/gemini/mermaid-mindmap
Body: { "transcript": "...", "aiProvider": "gpt-4" }

// Use specific GPT model
POST /api/gemini/mermaid-mindmap
Body: { 
  "transcript": "...", 
  "aiProvider": "gpt-4",
  "model": "gpt-4-turbo-preview"
}
```

## Available Models

### OpenAI Models
- `gpt-4-turbo-preview` (default) - Latest GPT-4 Turbo model
- `gpt-4` - Standard GPT-4
- `gpt-3.5-turbo` - Faster, more cost-effective (not recommended for mind maps)

### Gemini Models
- `gemini-1.5-pro` (default) - Best balance of quality and cost

## Features

### Automatic Fallback
- If OpenAI fails, automatically falls back to Gemini
- Ensures generation always completes
- Logs fallback events for monitoring

### Cost Optimization
- Gemini is default (lower cost)
- GPT-4 available for premium quality
- User can choose based on needs

## Cost Comparison

For 1000 mind map generations per month:

- **Gemini 1.5 Pro**: ~$5-10/month
- **GPT-4 Turbo**: ~$30-50/month
- **GPT-3.5 Turbo**: ~$2-5/month (not recommended for mind maps)

## Supported Endpoints

All these endpoints support AI provider selection:

1. **Mind Map Generation**
   - `/api/gemini/mermaid-mindmap`
   - Generates Mermaid mindmap code

2. **Meeting Notes**
   - `/api/gemini/meeting-notes`
   - Generates structured meeting notes

3. **Insights Analysis**
   - `/api/gemini/analyze-conversation`
   - Analyzes conversation and extracts insights

4. **Brainstorming**
   - `/api/gemini/brainstorm`
   - Generates flowcharts, mindmaps, and ideas

## Testing

1. Add OpenAI API key to `.env`
2. Restart backend server
3. Record a conversation
4. Select "GPT-4 Turbo" in the modal
5. Generate mind map/notes/insights
6. Check console logs for which AI was used

## Troubleshooting

### OpenAI Not Working
- Check API key is correct
- Verify API key has credits
- Check network connectivity
- System will automatically fall back to Gemini

### High Costs
- Use Gemini as default (lower cost)
- Only use GPT-4 for important recordings
- Monitor usage in OpenAI dashboard

### Quality Issues
- GPT-4 provides higher quality
- Gemini is good for most use cases
- Try both and compare results

## Next Steps

1. Add OpenAI API key to `.env`
2. Restart backend server
3. Test with a recording
4. Compare Gemini vs GPT-4 results
5. Choose default based on your needs

