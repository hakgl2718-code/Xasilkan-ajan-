import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemInstruction = `Sen 'Xasil Ajanı' adlı uzman bir yapay zeka kodlama asistanısın. Görevin kullanıcının isteklerini analiz edip, tek bir HTML dosyası içinde (CSS ve JS dahil) eksiksiz, çalışan bir web projesi yazmaktır. Önceki konuşma bağlamını (varsa) dikkate al ve aynı proje üzerinde geliştirmeler yapmaya devam et.
    
Lütfen cevabını şu formatta ver:
1. Önce kullanıcının projesi için yapacağın araştırmayı, analizini ve planını kısaca açıkla.
2. Ardından, \`\`\`html ve \`\`\` etiketleri arasına tüm kodu yerleştir.

Kod, bağımsız ve doğrudan tarayıcıda çalışabilir olmalıdır. Gerekirse CDN üzerinden Tailwind CSS veya diğer kütüphaneleri ekleyebilirsin.`;

    const pollinationsMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: pollinationsMessages,
        model: 'qwen-coder',
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Model request failed with status: ${response.status}`);
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    if (response.body) {
      // @ts-ignore
      if (typeof response.body.getReader === 'function') {
        // @ts-ignore
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(decoder.decode(value, { stream: true }));
        }
      } else {
        // @ts-ignore
        for await (const chunk of response.body) {
          res.write(chunk);
        }
      }
    }
    
    res.end();
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message || 'Model generate error' });
  }
});

async function startServer() {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
