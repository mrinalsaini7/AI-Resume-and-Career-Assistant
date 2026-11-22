/**
 * Serverless JavaScript API Proxy for Google Gemini
 * Path: /api/gemini.js
 * Security: Reads GEMINI_API_KEY from server environment variables so it is never exposed to the client.
 */

export default async function handler(req, res) {
    // 1. Allow only POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }
  
    // 2. Verify server API key configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Server Error: GEMINI_API_KEY environment variable is missing.');
      return res.status(500).json({
        error: 'Server configuration error: Gemini API key is not configured.'
      });
    }
  
    try {
      const { prompt, systemInstruction, history } = req.body;
  
      // 3. Validate incoming payload
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'A valid non-empty prompt is required.' });
      }
  
      if (prompt.length > 15000) {
        return res.status(400).json({ error: 'Input exceeds maximum allowed character limit (15,000).' });
      }
  
      // 4. Build contents array (supports both single-turn tools and multi-turn chatbot)
      const contents = [];
  
      if (Array.isArray(history)) {
        history.forEach((turn) => {
          if (turn.role && turn.text) {
            contents.push({
              role: turn.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(turn.text) }]
            });
          }
        });
      }
  
      contents.push({
        role: 'user',
        parts: [{ text: prompt.trim() }]
      });
  
      // 5. Construct Gemini REST API request payload
      const geminiPayload = {
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048
        }
      };
  
      if (systemInstruction && typeof systemInstruction === 'string') {
        geminiPayload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }
  
      // Using Google's fast, general-purpose Gemini 4 Hydrogen model
      const model = 'gemini-4-hydrogen';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        const apiErrorMessage = data?.error?.message || 'Failed to communicate with Gemini API.';
        return res.status(response.status).json({ error: apiErrorMessage });
      }
  
      // 6. Extract generated text safely
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
      if (!generatedText) {
        return res.status(502).json({ error: 'Gemini returned an empty or blocked response.' });
      }
  
      return res.status(200).json({ reply: generatedText });
  
    } catch (error) {
      console.error('Gemini Proxy Exception:', error);
      return res.status(500).json({ error: 'Internal server error while processing AI request.' });
    }
  }