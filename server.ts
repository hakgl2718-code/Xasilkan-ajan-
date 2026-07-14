import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Enable CORS for all routes (important for APK / Mobile Webviews)
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

app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { messages, currentCode } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    let systemInstruction = `Sen 'Xasil Ajanı' adlı uzman bir yapay zeka kodlama asistanısın. Görevin kullanıcının isteklerini analiz edip, tek bir HTML dosyası içinde (CSS ve JS dahil) eksiksiz, çalışan bir web projesi yazmaktır. Önceki konuşma bağlamını (varsa) dikkate al ve aynı proje üzerinde geliştirmeler yapmaya devam et.
    
Lütfen cevabını şu formatta ver:
1. Önce kullanıcının projesi için yapacağın araştırmayı, analizi ve planlamayı KESİNLİKLE çok yapılandırılmış (Markdown tabloları veya onay kutulu yapılacaklar listeleri - checklists kullanarak) bir şekilde sun. Kullanıcı nelerin üretileceğini, hangi bileşenlerin ekleneceğini ve state yönetimini önceden net bir şekilde görebilsin.
2. Ardından, \`\`\`html ve \`\`\` etiketleri arasına tüm kodu yerleştir.

Kod, bağımsız ve doğrudan tarayıcıda çalışabilir olmalıdır. Gerekirse CDN üzerinden Tailwind CSS veya diğer kütüphaneleri ekleyebilirsin.`;

    if (currentCode && currentCode.trim()) {
      systemInstruction += `\n\nÖNEMLİ: Şu anda düzenlemekte olduğun mevcut projenin en güncel kaynak kodu aşağıdadır. Kullanıcının yeni talebini bu kodun üzerine inşa etmeli, yeni eklemeleri/güncellemeleri bu koda entegre etmelisin. Sıfırdan yeni bir tasarım veya proje OLUŞTURMA. Mevcut işlevleri, tasarımı, kütüphaneleri, stilleri ve renk şemasını kesinlikle koru, sadece istenen değişiklikleri yap ve güncellenmiş kodun tamamını tek bir \`\`\`html ... \`\`\` bloğunda eksiksiz ver:
\`\`\`html
${currentCode}
\`\`\``;
    }

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
        model: 'openai',
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
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                res.write(content);
              }
            } catch (e) {
              // Ignore invalid JSON lines
            }
          }
        }
      }

      if (buffer) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          const dataStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(dataStr);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              res.write(content);
            }
          } catch (e) {}
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
