import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route for Gemini
  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt, systemInstruction, customApiKey, model } = req.body;
      const apiKey = customApiKey || req.headers['x-api-key'] || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(401).json({ 
          error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng nhập API Key trong phần Cài đặt.' 
        });
      }

      let modelName = model || 'gemini-2.0-flash';
      if (modelName === 'gemini-3-flash-preview' || modelName === 'gemini-2.5-flash') modelName = 'gemini-2.0-flash';
      if (modelName === 'gemini-3-pro-preview' || modelName === 'gemini-2.5-pro') modelName = 'gemini-1.5-pro';

      const apiVersions = ['v1beta', 'v1'];
      let lastErrorMsg = '';

      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      for (const version of apiVersions) {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();

          if (response.ok) {
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return res.json({ text: generatedText });
          } else {
            lastErrorMsg = data.error?.message || `Lỗi API (${response.status}): ${response.statusText}`;
          }
        } catch (err: any) {
          lastErrorMsg = err.message || String(err);
        }
      }

      return res.status(400).json({ error: lastErrorMsg });

    } catch (error: any) {
      console.error('Error generating content:', error);
      res.status(500).json({ error: error.message || 'Lỗi khi kết nối với máy chủ AI Gemini.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server EduPlan AI running on port ${PORT}`);
  });
}

startServer();
