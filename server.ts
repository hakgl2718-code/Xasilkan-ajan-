import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization,Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Vercel Serverless Function Simulators for local development
import generateHandler from './api/generate';
import chatBerrakHandler from './api/chat/berrak';
import chatToprakHandler from './api/chat/toprak';
import dubbingTranscribeHandler from './api/dubbing/transcribe';
import dubbingTranslateHandler from './api/dubbing/translate';
import dubbingSynthesizeHandler from './api/dubbing/synthesize';

// Mock Vercel Request/Response objects for Express
const wrapVercelHandler = (handler: any) => async (req: express.Request, res: express.Response) => {
  try {
    // Basic shim to adapt Express req/res to Vercel Request/Response types if needed.
    // In most simple cases they are compatible enough for this use case.
    await handler(req as any, res as any);
  } catch (error) {
    console.error('Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

app.post('/api/generate', wrapVercelHandler(generateHandler));
app.post('/api/chat/berrak', wrapVercelHandler(chatBerrakHandler));
app.post('/api/chat/toprak', wrapVercelHandler(chatToprakHandler));
app.post('/api/dubbing/transcribe', wrapVercelHandler(dubbingTranscribeHandler));
app.post('/api/dubbing/translate', wrapVercelHandler(dubbingTranslateHandler));
app.post('/api/dubbing/synthesize', wrapVercelHandler(dubbingSynthesizeHandler));


async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
