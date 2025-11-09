import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiService = {
  async analyzeText(text) {
    try {
      // Use Gemini 1.5 Pro for better analysis
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });
      
      const prompt = `You are an expert AI assistant analyzing conversation transcripts for a collaborative mind mapping platform.

Analyze the following text and provide a comprehensive analysis in JSON format with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the main content",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "topics": ["topic 1", "topic 2"],
  "sentiment": "positive/neutral/negative",
  "actionItems": ["action 1", "action 2"],
  "decisions": ["decision 1", "decision 2"],
  "questions": ["question 1", "question 2"]
}

Text to analyze:
${text}

Return ONLY valid JSON, no markdown formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Parse JSON response
      let analysis;
      try {
        // Remove markdown code blocks if present
        const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                         analysisText.match(/```\n([\s\S]*?)\n```/) ||
                         analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0].replace(/```json\n?|```\n?/g, ''));
        } else {
          analysis = JSON.parse(analysisText);
        }
      } catch (parseError) {
        // Fallback to text-based response
        analysis = {
          summary: analysisText.substring(0, 200),
          keyPoints: analysisText.split('\n').filter(line => line.trim().length > 0).slice(0, 5),
          topics: [],
          sentiment: 'neutral',
          actionItems: [],
          decisions: [],
          questions: []
        };
      }
      
      return {
        ...analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
  },

  async generateMindMap(text) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        }
      });
      
      const prompt = `Generate a hierarchical mind map structure from the following text. 

Return a JSON object with this exact structure:
{
  "nodes": [
    {
      "id": "1",
      "label": "Main Topic",
      "level": 0,
      "children": ["2", "3"],
      "description": "Brief description"
    },
    {
      "id": "2",
      "label": "Sub-topic 1",
      "level": 1,
      "children": [],
      "description": "Brief description"
    }
  ],
  "connections": [
    {"from": "1", "to": "2"}
  ]
}

Create a logical hierarchy with:
- 1 root node (level 0)
- 3-7 main branches (level 1)
- 2-4 sub-branches per main branch (level 2)
- Each node should have a clear, concise label

Text to analyze:
${text}

Return ONLY valid JSON, no markdown formatting.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const mindMapText = response.text();
      
      // Try to extract JSON from the response
      let mindMap;
      try {
        // Remove markdown code blocks if present
        const jsonMatch = mindMapText.match(/```json\n([\s\S]*?)\n```/) || 
                         mindMapText.match(/```\n([\s\S]*?)\n```/) ||
                         mindMapText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0].replace(/```json\n?|```\n?/g, '');
          mindMap = JSON.parse(jsonStr);
        } else {
          mindMap = JSON.parse(mindMapText);
        }
        
        // Validate structure
        if (!mindMap.nodes || !Array.isArray(mindMap.nodes)) {
          throw new Error('Invalid mind map structure');
        }
      } catch (parseError) {
        console.error('Error parsing mind map:', parseError);
        // Return a simple structure as fallback
        mindMap = {
          nodes: [
            { 
              id: '1', 
              label: 'Main Topic', 
              level: 0,
              children: [],
              description: 'Generated from text'
            }
          ],
          connections: [],
          rawResponse: mindMapText
        };
      }
      
      return mindMap;
    } catch (error) {
      console.error('Gemini mind map generation error:', error);
      throw new Error(`Failed to generate mind map: ${error.message}`);
    }
  },

  async analyzeConversation(transcript) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      });
      
      const prompt = `You are an expert AI assistant analyzing a collaborative conversation transcript for a mind mapping platform.

Analyze the following conversation transcript and extract structured insights in JSON format:
{
  "summary": "A 2-3 sentence summary of the conversation",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "actionItems": [
    {
      "task": "Task description",
      "priority": "high/medium/low",
      "assignee": "Person name if mentioned"
    }
  ],
  "topics": ["topic 1", "topic 2", "topic 3"],
  "decisions": ["decision 1", "decision 2"],
  "questions": ["question 1", "question 2"],
  "sentiment": "positive/neutral/negative",
  "nextSteps": ["step 1", "step 2"]
}

Transcript:
${transcript}

Return ONLY valid JSON, no markdown formatting.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Parse JSON response
      let analysis;
      try {
        const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                         analysisText.match(/```\n([\s\S]*?)\n```/) ||
                         analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0].replace(/```json\n?|```\n?/g, '');
          analysis = JSON.parse(jsonStr);
        } else {
          analysis = JSON.parse(analysisText);
        }
      } catch (parseError) {
        // Fallback to text-based response
        const lines = analysisText.split('\n').filter(line => line.trim().length > 0);
        analysis = {
          summary: lines[0] || 'Analysis completed',
          keyInsights: lines.slice(1, 4),
          actionItems: [],
          topics: [],
          decisions: [],
          questions: [],
          sentiment: 'neutral',
          nextSteps: []
        };
      }
      
      return {
        ...analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini conversation analysis error:', error);
      throw new Error(`Failed to analyze conversation: ${error.message}`);
    }
  },

  // Transcribe audio using Gemini (if audio file is provided)
  async transcribeAudio(audioBase64, mimeType = 'audio/webm') {
    try {
      // Try different models in order of preference
      const modelsToTry = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro-latest'];
      let lastError = null;
      
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
          });
          
          // Convert base64 to File-like object
          const audioData = {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType
            }
          };
          
          const prompt = `Transcribe the following audio recording. Provide a verbatim transcript with speaker identification if multiple speakers are detected. Format as:
      
Speaker 1: [transcript]
Speaker 2: [transcript]

If only one speaker, just provide the transcript without speaker labels.`;
          
          const result = await model.generateContent([prompt, audioData]);
          const response = await result.response;
          const transcript = response.text();
          
          console.log(`Successfully transcribed audio using ${modelName}`);
          return {
            transcript: transcript.trim(),
            timestamp: new Date().toISOString()
          };
        } catch (modelError) {
          console.log(`Model ${modelName} failed, trying next...`, modelError.message);
          lastError = modelError;
          continue;
        }
      }
      
      // If all models failed, throw the last error
      throw lastError || new Error('All Gemini models failed for audio transcription');
    } catch (error) {
      console.error('Gemini audio transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  },

  // Generate Mermaid mindmap from transcript
  async generateMermaidMindmap(transcript) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });
      
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let mindmapText = response.text();
      
      // Clean up the response - remove markdown code blocks if present
      mindmapText = mindmapText.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Ensure it starts with "mindmap"
      if (!mindmapText.toLowerCase().startsWith('mindmap')) {
        mindmapText = 'mindmap\n' + mindmapText;
      }
      
      return {
        mindmap: mindmapText,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini mindmap generation error:', error);
      throw new Error(`Failed to generate mindmap: ${error.message}`);
    }
  },

  // Generate meeting notes from transcript
  async generateMeetingNotes(transcript) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });
      
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const notes = response.text();
      
      return {
        notes: notes.trim(),
        formattedNotes: notes.trim(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini meeting notes generation error:', error);
      throw new Error(`Failed to generate meeting notes: ${error.message}`);
    }
  },

  // Generate brainstorm/visualization (flowcharts, whiteboarding)
  async generateBrainstorm(transcript) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      });
      
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Parse JSON response
      let brainstorm;
      try {
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                         responseText.match(/```\n([\s\S]*?)\n```/) ||
                         responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0].replace(/```json\n?|```\n?/g, '');
          brainstorm = JSON.parse(jsonStr);
        } else {
          brainstorm = JSON.parse(responseText);
        }
      } catch (parseError) {
        // Fallback: generate flowchart and ideas separately
        const flowchartModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const flowchartPrompt = `Create a Mermaid flowchart from this transcript:\n\n${transcript}\n\nReturn ONLY Mermaid flowchart code starting with 'flowchart'`;
        const flowchartResult = await flowchartModel.generateContent(flowchartPrompt);
        const flowchartText = flowchartResult.response.text().replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
        
        brainstorm = {
          flowchart: flowchartText.startsWith('flowchart') ? flowchartText : 'flowchart TD\n' + flowchartText,
          ideas: 'Key ideas extracted from the conversation',
          mindmap: null
        };
      }
      
      return {
        ...brainstorm,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini brainstorm generation error:', error);
      throw new Error(`Failed to generate brainstorm: ${error.message}`);
    }
  }
};
