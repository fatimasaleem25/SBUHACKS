import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export const openAIService = {
  // Generate Mermaid mindmap from transcript using GPT-4
  async generateMermaidMindmap(transcript, model = 'gpt-4-turbo-preview') {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      console.log(`Generating mindmap with ${model}...`);

      const prompt = `Create a Mermaid mindmap diagram from this meeting transcript:

Transcript:
${transcript}

Create a hierarchical mindmap with:
- Central topic (main theme of the conversation)
- 3-5 main branches (key themes or topics)
- 2-4 sub-branches per main branch (important details)

Return ONLY the Mermaid code starting with "mindmap" and nothing else. No markdown formatting, no explanations, just the Mermaid code.

Example format:
mindmap
  root((Central Topic))
    Main Branch 1
      Sub-branch 1.1
      Sub-branch 1.2
    Main Branch 2
      Sub-branch 2.1
      Sub-branch 2.2`;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating structured mind maps from conversation transcripts. Always return valid Mermaid mindmap syntax.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'text' }
      });

      let mindmapText = response.choices[0].message.content.trim();
      
      // Clean up the response - remove markdown code blocks if present
      mindmapText = mindmapText.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Ensure it starts with "mindmap"
      if (!mindmapText.toLowerCase().startsWith('mindmap')) {
        mindmapText = 'mindmap\n' + mindmapText;
      }

      console.log(`✅ Mindmap generated with ${model}`);

      return {
        mindmap: mindmapText,
        timestamp: new Date().toISOString(),
        model: model
      };
    } catch (error) {
      console.error('OpenAI mindmap generation error:', error);
      throw new Error(`Failed to generate mindmap: ${error.message}`);
    }
  },

  // Generate meeting notes using GPT-4
  async generateMeetingNotes(transcript, model = 'gpt-4-turbo-preview') {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `Create comprehensive meeting notes from this transcript. Format as a well-structured document with:

1. Meeting Title/Summary
2. Date and Participants (if mentioned)
3. Agenda Items
4. Discussion Points (organized by topic)
5. Key Decisions
6. Action Items (with owners if mentioned)
7. Next Steps
8. Open Questions

Transcript:
${transcript}

Return formatted meeting notes that are clear, organized, and professional. Use bullet points and sections for readability.`;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating comprehensive, well-structured meeting notes from transcripts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      });

      const notes = response.choices[0].message.content.trim();

      return {
        notes: notes,
        formattedNotes: notes,
        timestamp: new Date().toISOString(),
        model: model
      };
    } catch (error) {
      console.error('OpenAI meeting notes generation error:', error);
      throw new Error(`Failed to generate meeting notes: ${error.message}`);
    }
  },

  // Generate brainstorm/visualization using GPT-4
  async generateBrainstorm(transcript, model = 'gpt-4-turbo-preview') {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `Based on this conversation transcript, create brainstorming visualizations:

Transcript:
${transcript}

Generate:
1. A Mermaid flowchart showing the flow of ideas, processes, or concepts discussed
2. A list of key ideas and concepts that emerged
3. A Mermaid mindmap for visual brainstorming

Return a JSON object with this structure:
{
  "flowchart": "Mermaid flowchart code starting with 'flowchart'",
  "ideas": "List of key ideas and concepts (formatted text)",
  "mindmap": "Mermaid mindmap code starting with 'mindmap'"
}

For the flowchart, use Mermaid syntax like:
flowchart TD
  A[Start] --> B[Process 1]
  B --> C[Decision]
  C -->|Yes| D[Process 2]
  C -->|No| E[Process 3]

Return ONLY valid JSON, no markdown formatting.`;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating visual brainstorming diagrams and flowcharts. Always return valid JSON with Mermaid syntax.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      });

      const responseText = response.choices[0].message.content;
      let brainstorm;
      
      try {
        brainstorm = JSON.parse(responseText);
      } catch (parseError) {
        // Fallback: generate flowchart separately
        const flowchartResponse = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'user',
              content: `Create a Mermaid flowchart from this transcript:\n\n${transcript}\n\nReturn ONLY Mermaid flowchart code starting with 'flowchart'`
            }
          ],
          temperature: 0.7,
          max_tokens: 2048
        });
        
        const flowchartText = flowchartResponse.choices[0].message.content
          .replace(/```mermaid\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        brainstorm = {
          flowchart: flowchartText.startsWith('flowchart') ? flowchartText : 'flowchart TD\n' + flowchartText,
          ideas: 'Key ideas extracted from the conversation',
          mindmap: null
        };
      }

      return {
        ...brainstorm,
        timestamp: new Date().toISOString(),
        model: model
      };
    } catch (error) {
      console.error('OpenAI brainstorm generation error:', error);
      throw new Error(`Failed to generate brainstorm: ${error.message}`);
    }
  },

  // Analyze conversation using GPT-4
  async analyzeConversation(transcript, model = 'gpt-4-turbo-preview') {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `You are an expert AI assistant analyzing a collaborative conversation transcript for a mind mapping platform.

Analyze the following transcript and provide a comprehensive analysis in JSON format with this structure:
{
  "summary": "A concise 2-3 sentence summary of the main content",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "keyPoints": ["point 1", "point 2", "point 3"],
  "topics": ["topic 1", "topic 2"],
  "sentiment": "positive/neutral/negative",
  "actionItems": ["action 1", "action 2"],
  "decisions": ["decision 1", "decision 2"],
  "nextSteps": ["step 1", "step 2"],
  "questions": ["question 1", "question 2"]
}

Transcript:
${transcript}

Return ONLY valid JSON, no markdown formatting.`;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing conversations and extracting key insights, action items, and decisions. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      });

      const analysisText = response.choices[0].message.content;
      let analysis;
      
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        analysis = {
          summary: analysisText.substring(0, 200),
          keyInsights: [],
          keyPoints: [],
          topics: [],
          sentiment: 'neutral',
          actionItems: [],
          decisions: [],
          nextSteps: [],
          questions: []
        };
      }

      return {
        ...analysis,
        timestamp: new Date().toISOString(),
        model: model
      };
    } catch (error) {
      console.error('OpenAI conversation analysis error:', error);
      throw new Error(`Failed to analyze conversation: ${error.message}`);
    }
  }
};

