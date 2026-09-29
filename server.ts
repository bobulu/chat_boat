import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI with server-side apiKey and telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    storage: 'browser-local-storage-only',
    privacy: 'zero-server-storage',
  });
});

// SSE Streaming chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, systemInstruction, temperature } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    // Transform messages to Gemini format
    // Map 'assistant' to 'model', 'user' to 'user'
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const config: Record<string, any> = {};
    if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
      config.systemInstruction = systemInstruction.trim();
    }
    if (typeof temperature === 'number') {
      config.temperature = Math.max(0, Math.min(2, temperature));
    }

    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config,
    });

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Gemini chat streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error?.message || 'Error generating AI response.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Fast title generation endpoint
app.post('/api/title', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message string is required' });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate a short, concise 3 to 5 word title for a conversation that starts with: "${message.slice(0, 300)}". Do not include quotes, markdown, or punctuation. Keep it under 30 characters.`,
    });

    const title = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : 'New Conversation';
    res.json({ title: title || 'New Conversation' });
  } catch (error: any) {
    console.error('Title generation error:', error);
    // Fallback gracefully
    const fallbackTitle = message.slice(0, 28).trim() + (message.length > 28 ? '...' : '');
    res.json({ title: fallbackTitle || 'New Conversation' });
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
