import { GoogleGenAI } from '@google/genai';
import { AppSettings } from '../types';

export type AiActionType =
  | 'improve'
  | 'expand'
  | 'shorten'
  | 'suggest_variables'
  | 'fix_clarity'
  | 'alternatives';

export interface AiActionResult {
  success: boolean;
  result?: string;
  error?: string;
}

export async function requestAiAssist(
  action: AiActionType,
  prompt: string,
  settings: AppSettings
): Promise<AiActionResult> {
  if (!settings.enableAiFeatures) {
    return {
      success: false,
      error: 'AI assistance is currently disabled. You can re-enable it in Settings.',
    };
  }

  if (!prompt || !prompt.trim()) {
    return {
      success: false,
      error: 'Please enter some prompt text first before requesting AI assistance.',
    };
  }

  // 1. First attempt: call local backend server proxy (/api/gemini/assist)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const res = await fetch('/api/gemini/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        prompt,
        customApiKey: settings.geminiApiKey || undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        return { success: true, result: data.result };
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      // If error is about missing key and user has no custom key, provide helpful message
      if (res.status === 400 && !settings.geminiApiKey) {
        return {
          success: false,
          error:
            errData.error ||
            'Gemini API key is not configured. Add your free key in Settings > Gemini AI.',
        };
      }
      if (res.status >= 500) {
        // If server failed, fall back to direct client call if key is present
      }
    }
  } catch (_fetchErr) {
    // Server route unreachable (e.g., running packaged offline APK or pure client)
  }

  // 2. Client-side direct fallback if user specified a custom key in Settings
  if (settings.geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: settings.geminiApiKey });
      let instruction = '';

      switch (action) {
        case 'improve':
          instruction =
            'You are an expert prompt engineer. Improve and polish the following prompt for an AI model. Enhance clarity, sensory or technical specificity, and structure while preserving the core intent. If helpful, use uppercase variable placeholders formatted strictly as {{VARIABLE_NAME}}. Return ONLY the revised prompt text without preamble or code blocks.';
          break;
        case 'expand':
          instruction =
            'Expand the following prompt into a detailed, comprehensive prompt with vivid descriptions, step-by-step guidance, and quality modifiers. Return ONLY the expanded prompt text.';
          break;
        case 'shorten':
          instruction =
            'Condense the following prompt to its most concise, high-impact essence. Remove redundant filler while keeping crucial parameters. Return ONLY the shortened prompt text.';
        break;
        case 'suggest_variables':
          instruction =
            'Analyze the following prompt and replace specific values, topics, names, or styles with clean reusable template placeholders using the syntax {{VARIABLE_NAME}}. Return ONLY the parameterized prompt text.';
          break;
        case 'fix_clarity':
          instruction =
            'Refine the prompt for maximum clarity, unambiguous instructions, and logical sequencing. Return ONLY the improved prompt text.';
          break;
        case 'alternatives':
          instruction =
            'Provide 2 high-performing alternative variations of this prompt (Variation A & Variation B). Separate them clearly with "---". Return ONLY the alternative prompt versions.';
          break;
        default:
          instruction =
            'Improve and refine this prompt for optimal results. Return ONLY the refined prompt text.';
      }

      const response = await ai.models.generateContent({
        model: settings.geminiModel || 'gemini-2.5-flash',
        contents: `${instruction}\n\n[USER PROMPT]:\n${prompt}`,
      });

      const result = response.text ? response.text.trim() : '';
      if (result) {
        return { success: true, result };
      }
      return { success: false, error: 'Empty response received from Gemini.' };
    } catch (directErr: any) {
      return {
        success: false,
        error: directErr?.message || 'Gemini API call failed. Please check your key or connection.',
      };
    }
  }

  return {
    success: false,
    error:
      'Gemini AI features are optional. To enable them, enter your Gemini API key in Settings > Gemini AI.',
  };
}

export async function testGeminiConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Please enter an API key to test.' };
  }
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping test. Reply with: OK',
    });
    if (res.text) {
      return { success: true, message: 'Connection successful! Gemini API is active and ready.' };
    }
    return { success: false, message: 'Received unexpected response format.' };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to connect. Please verify your API key.',
    };
  }
}
