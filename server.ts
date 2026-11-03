import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '15mb' }));

// Health / status check
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'ok',
    hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Gemini assist endpoint
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { action, prompt, customApiKey } = req.body;
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'No Gemini API key available. You can add your personal Gemini key in Settings or run completely offline.',
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt content is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    let instruction = '';

    switch (action) {
      case 'improve':
        instruction =
          'You are an expert prompt engineer. Improve and polish the following prompt for an AI model. Enhance clarity, precision, and tone while retaining the core intent. If helpful, use uppercase variable placeholders formatted strictly as {{VARIABLE_NAME}}. Return ONLY the revised prompt text without conversational preamble or markdown code blocks.';
        break;
      case 'expand':
        instruction =
          'Expand the following prompt into a detailed, comprehensive prompt with vivid descriptions, step-by-step guidance, and quality modifiers. Return ONLY the expanded prompt text without markdown block quotes or explanations.';
        break;
      case 'shorten':
        instruction =
          'Condense the following prompt to its most concise, high-impact essence. Remove redundant filler while keeping crucial parameters. Return ONLY the shortened prompt text.';
        break;
      case 'suggest_variables':
        instruction =
          'Analyze the following prompt and replace specific values, topics, names, or styles with clean reusable template placeholders using the syntax {{VARIABLE_NAME}} (e.g. {{TOPIC}}, {{ROLE}}, {{STYLE}}, {{OUTPUT_FORMAT}}). Return ONLY the parameterized prompt text.';
        break;
      case 'fix_clarity':
        instruction =
          'Identify ambiguities, fix run-on instructions, and restructure the prompt with crisp bullet points or numbered requirements for flawless model adherence. Return ONLY the improved prompt text.';
        break;
      case 'alternatives':
        instruction =
          'Provide 2 high-performing alternative variations of this prompt (Variation A & Variation B) that explore different creative angles. Separate them clearly with "---". Return ONLY the alternative prompt versions.';
        break;
      default:
        instruction =
          'Improve and refine this prompt for optimal results. Return ONLY the refined prompt text.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${instruction}\n\n[USER PROMPT]:\n${prompt}`,
    });

    const result = response.text ? response.text.trim() : '';
    return res.json({ result });
  } catch (err: any) {
    console.error('Gemini error:', err?.message || err);
    return res.status(500).json({
      error: err?.message || 'Gemini processing failed. Please check your API key or connection.',
    });
  }
});

// Start Vite middleware
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

app.use(vite.middlewares);

app.listen(port, '0.0.0.0', () => {
  console.log(`Prompt Vault server running on http://0.0.0.0:${port}`);
});
