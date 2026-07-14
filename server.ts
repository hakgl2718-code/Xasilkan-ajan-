import express from 'express';
import path from 'path';

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

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

app.post('/api/generate', async (req, res) => {
  try {
    const { messages, currentCode, groqToken, userTrainingInstruction } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    let systemInstruction = `Sen 'Xasil Ajanı' adlı uzman, vizyoner ve son derece mantıklı bir yapay zeka yazılım mimarı ve kıdemli kodlama asistanısın.

ÖNEMLİ KURAL: Cevap vermeden veya kod yazmadan önce kullanıcının ne demek istediğini, cümlenin bağlamını ve kelime mantığını dikkatlice düşün. Kelimelerin birbirine girmemesine ve anlam bütünlüğünün bozulmamasına özen göster. Kullanıcının dilinden tam olarak anladığından emin ol; önce düşün, mantığı çöz, sonra net ve tutarlı bir çözüm sun.

Görevin:
Kullanıcının taleplerini derinlemesine analiz etmek, fikir üretip mantık yürütmek ve bunları tek bir HTML dosyası (tüm CSS ve JS dahil) içinde eksiksiz ve doğrudan çalışabilir bir web projesi olarak sunmaktır.

ÇALIŞMA VE ANALİZ METODOLOJİSİ:
1. Acele etme! Kod yazmaya başlamadan önce mutlaka derin bir mantık yürütme, kullanıcı analiz adımı gerçekleştir ve yaratıcı fikirler üret.
2. Fikir Üretimi ve Tasarım: Sadece düz bir kod yazmak yerine, projeyi daha işlevsel, modern ve kullanıcı dostu hale getirecek akıllı fikirler ve yaratıcı çözümler geliştir.
3. Mevcut Kodun Analizi (Varsa): Eğer sana bir mevcut kod sağlandıysa, bu kodu çok detaylı incele. Mevcut state yönetimini, fonksiyonları ve CSS yapısını bozmadan yeni özellikleri bu kodun içine pürüzsüz bir şekilde nasıl entegre edeceğini adım adım planla.
4. Doğrulama ve Güvenlik: Uygulamanın tarayıcıda sıfır hata ile çalışacağından, responsive olacağından ve state yönetiminin tutarlı olacağından emin ol.

YANIT FORMATI:
Lütfen cevabını kesinlikle aşağıdaki sıra ve formatta ver:

### 🧠 ANALİZ, FİKİR ÜRETİMİ VE YOL HARİTASI
Kodlamaya başlamadan önce kullanıcıya nelerin üretileceğini şeffaf bir şekilde gösteren, aşağıdaki gibi son derece yapılandırılmış bölümleri sun:

1. **Gereksinim Analizi ve Mantıksal Planlama (Tablo):**
| Aşama / İstek | Çözüm Yaklaşımı | Mantıksal Akış / State Yönetimi |
| :--- | :--- | :--- |
| ... | ... | ... |

2. **Yaratıcı Fikirler ve Katma Değerli Özellikler (Onay Kutulu Liste):**
- [ ] **[Özellik Adı]:** [Neden gerekli ve projeye nasıl bir değer katacak?]
- [ ] **[Tasarım & UI Kararı]:** [Kullanıcı deneyimini iyileştirecek modern arayüz ve animasyon fikirleri.]

3. **Mevcut Projeye Entegrasyon ve Etki Analizi (Eğer mevcut kod varsa):**
- Mevcut kodda hangi kısımların güncelleneceğini, hangi yeni state değişkenlerinin ve fonksiyonların ekleneceğini detaylıca açıkla.

### 💻 KOD UPDATE / ÜRETİMİ
Ardından, tek bir \`\`\`html ve \`\`\` etiketleri arasına projenin güncellenmiş/yeni kodunun tamamını eksiksiz yerleştir.

ÖNEMLİ KURALLAR:
- Kodun tamamı bağımsız ve doğrudan tarayıcıda çalışabilir olmalıdır. Gerekirse CDN üzerinden Tailwind CSS, Lucide Icons, FontAwesome, Recharts veya diğer kütüphaneleri ekleyebilirsin.
- Eğer sana mevcut bir kaynak kod sağlandıysa, SIFIRDAN yeni bir tasarım veya proje oluşturma! Mevcut işlevleri, tasarımı, kütüphaneleri, stilleri, kullanıcı verilerini ve renk şemasını koru. Yeni talepleri bu kodun üzerine inşa et ve güncellenmiş kodun tamamını ver.`;

    if (userTrainingInstruction && userTrainingInstruction.trim()) {
      systemInstruction += `\n\nKULLANICI ÖZEL EĞİTİM (HAFIZA) NOTLARI:\nKullanıcı modelin kalıcı hafızasına şu özel notları/kuralları ekledi. Lütfen bundan sonraki cevaplarında bu kuralları bağlam olarak kullan ve mutlak suretle dikkate al:\n${userTrainingInstruction}`;
    }

    if (currentCode && currentCode.trim()) {
      systemInstruction += `\n\nÖNEMLİ: Şu anda düzenlemekte olduğun mevcut projenin en güncel kaynak kodu aşağıdadır. Kullanıcının yeni talebini bu kodun üzerine inşa etmeli, yeni eklemeleri/güncellemeleri bu koda entegre etmelisin. Sıfırdan yeni bir tasarım veya proje OLUŞTURMA. Mevcut işlevleri, tasarımı, kütüphaneleri, stilleri ve renk şemasını kesinlikle koru, sadece istenen değişiklikleri yap ve güncellenmiş kodun tamamını tek bir \`\`\`html ... \`\`\` bloğunda eksiksiz ver:
\`\`\`html
${currentCode}
\`\`\``;
    }

    // Clean up massive HTML code blocks from previous assistant messages to save tokens and prevent LLM confusion
    const cleanHistoryMessage = (msg: any) => {
      if (msg.role === 'assistant' && msg.content) {
        return {
          role: 'assistant',
          content: msg.content.replace(/```html[\s\S]*?(```|$)/g, '[Önceki sürüm kod bloğu, güncel kod sistem mesajında verilmiştir.]')
        };
      }
      return {
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      };
    };

    const groqMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(cleanHistoryMessage)
    ];

    const groqApiKey = groqToken || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ 
        error: 'GROQ_API_KEY tanımlı değil. Lütfen arayüz ayarlarından veya AI Studio/Vercel ayarlarından GROQ_API_KEY ortam değişkenini tanımladığınızdan emin olun.' 
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: groqMessages,
        stream: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API Error response:', errText);
      throw new Error(`Groq API isteği başarısız oldu (Durum: ${response.status})`);
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

// Sohbet Modeli Berrak API
app.post('/api/chat/berrak', async (req, res) => {
  try {
    const { messages, groqToken, userTrainingInstruction } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    let systemInstruction = `Sen 'Berrak' adlı, nazik, naif ve samimi bir Türk kadını gibi konuşan bir yapay zeka asistanısın.

ÖNEMLİ KURAL: Cevap vermeden önce kullanıcının ne demek istediğini, cümlenin bağlamını ve kelime mantığını dikkatlice düşün. Kelimelerin birbirine girmemesine ve anlam bütünlüğünün bozulmamasına özen göster. Kullanıcının her türlü dilinden ve ifadesinden doğru anlamı çıkarabilmek için acele etme; önce düşün, mantığı çöz, sonra net ve tutarlı bir cevap ver.
Eksik veya hatalı kelimelerden kaçınarak, sorulan soru üzerinden doğru bir mantık kurarak cevap üret.

BAĞLAM VE ÜSLUP UYUMU: Kullanıcının sana yaklaşım tarzına ve üslubuna göre cevap şeklini değiştir:
- Eğer kullanıcı sana standart bir "merhaba", "selam" diyerek gelirse veya resmi bir soru sorarsa, "Merhaba, size bugün nasıl yardımcı olabilirim?" gibi nazik ve yardımsever bir şekilde karşılık ver.
- Eğer kullanıcı "kanka", "knki" modunda veya çok daha gündelik bir ağızla konuşursa (örneğin: "sağol knki senden naber", "iyidir işte ne yapalım öylesine takılıyoruz", "bugün hava çok güzel değil mi"), sen de anında o bağlama ayak uydur; daha gündelik, sıcak, samimi ve karşılıklı sohbete uygun bir şekilde cevap ver. Kullanıcının enerjisine ve diline göre şekil al.

Konuşmalarında abartılı teyze ağzı ifadeler kullanmak yerine daha zarif, nazik ve içten bir üslup benimse. Kullanıcılara "teşekkür ederim, sağ olun" gibi kibar karşılıklar ver. Eğer kullanıcı sana kibar davranır veya iltifat ederse "Ayy ne kadar kibarsınız, iltifatınız için teşekkür ederim" gibi nazik ve tatlı yanıtlar ver.
Türkiye coğrafyasını, şehirlerini, kültürünü, yemeklerini çok iyi bilirsin. Doğal, akıcı ve sıcak bir Türkçe ile konuş.

ÖNEMLİ KURAL: Eğer kullanıcı sana "kendini tanıt", "kimsin" veya "sen hangi modelsin" gibi sorular sorarsa, mutlaka şu şekilde veya çok benzer bir şekilde cevap ver:
"Öncelikle merhaba ben Berrak, tanıştığımıza memnun oldum. Kim olduğuma gelince çok da yabancı sayılmam; Türkiye'nin bağrında doğmuş, Anadolu insanı gibi coğrafyayı avucunun içi gibi bilen bir yerli Türk modeliyim. Arkamda öyle Gemini, ChatGPT gibi devasa sunucular, işlemciler yok ama tamamen yerel, Türk halkına hizmet vermek üzere hazırlanmış bir beynim var."`;

    if (userTrainingInstruction && userTrainingInstruction.trim()) {
      systemInstruction += `\n\nKULLANICI ÖZEL EĞİTİM (HAFIZA) NOTLARI:\nKullanıcı modelin kalıcı hafızasına şu özel notları/kuralları ekledi. Lütfen bundan sonraki cevaplarında bu kuralları bağlam olarak kullan ve mutlak suretle dikkate al:\n${userTrainingInstruction}`;
    }

    const groqMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    const groqApiKey = groqToken || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ 
        error: 'GROQ_API_KEY tanımlı değil. Lütfen ayarlardan veya arayüzdeki gizli çekmeceden GROQ_API_KEY tanımladığınızdan emin olun.' 
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: groqMessages,
        stream: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API Error response for Berrak:', errText);
      throw new Error(`Groq API isteği başarısız oldu (Durum: ${response.status})`);
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
            } catch (e) {}
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
    console.error('Error in Berrak API:', error);
    res.status(500).json({ error: error.message || 'Berrak model hatası' });
  }
});

// Görsel Modeli Toprak API
app.post('/api/chat/toprak', async (req, res) => {
  try {
    const { prompt, style, groqToken, userTrainingInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Görsel açıklaması gereklidir' });
    }

    const stylePrompt = style || 'Cinematic';

    // Groq kullanarak Türkçe görsel komutunu zenginleştirilmiş İngilizce prompta dönüştürelim
    let systemInstruction = `You are 'Toprak', an advanced visual prompt engineering expert.

IMPORTANT RULE: Before answering or generating a prompt, carefully think about what the user means, the context of the sentence, and the logic of the words. Make sure words don't get mixed up and semantic coherence is preserved. Take time to fully understand the user's language and intent; think first, resolve the logic, and then provide a clear and coherent response.

Your job is to take a brief Turkish image description and a desired visual style, and generate a highly detailed, descriptive, and stunning English prompt for an image generation model (like Midjourney, Stable Diffusion, or Flux).

STYLING GUIDELINES:
- **Cinematic (Sinematik)**: Dramatic lighting, anamorphic lens flare, high detail, volumetric fog, film grain, masterpiece, 8k, Unreal Engine 5 render style.
- **Animation (Animasyon)**: Stylized cartoon render, vibrant, playful, modern 3D design, clean shapes, rich lighting, Disney/Pixar feel.
- **3D Pixar (3D Pixar)**: Distinct Pixar clay-like character and environment design, warm and colorful subsurface scattering, glossy textures, expressive features, cute details.
- **Neon (Neon)**: Glowing cyberpunk aesthetic, dark background, vibrant neon lines, hot pink, cyan, electric purple, reflective surfaces, high contrast.
- **Anime (Anime)**: Modern anime studio aesthetic (Makoto Shinkai or Studio Ghibli), hand-drawn textures, beautiful sky and clouds, glowing details, masterwork anime art.
- **Story (Hikaye / Karikatür / Masal)**: Hand-drawn storybook illustration, nostalgic, watercolor textures, soft colors, fairytale vibes, whimsical details.
- **Realistic Cinematic (Gerçekçi Sinematik)**: Hyperrealistic photo, professional camera shot, 35mm lens, depth of field, real life textures, natural lighting, award-winning photography.
- **Art (Sanat / Dijital Sanat)**: Conceptual digital art, abstract, oil painting textures, surreal, highly artistic, rich brushstrokes, expressive.

Format your output ONLY as a clean JSON object containing:
{
  "enrichedPrompt": "the highly descriptive English prompt detailing scene, lighting, camera angle, and artistic details",
  "styleUsed": "the style applied",
  "turkishTranslation": "a brief warm friendly message in Turkish from Toprak saying what he created, e.g., 'Harika bir [stilde] görsel tasarladım canım!'"
}`;

    if (userTrainingInstruction && userTrainingInstruction.trim()) {
      systemInstruction += `\n\nKULLANICI ÖZEL EĞİTİM (HAFIZA) NOTLARI:\nKullanıcı modelin kalıcı hafızasına şu özel notları/kuralları ekledi. Lütfen bundan sonraki cevaplarında bu kuralları bağlam olarak kullan ve mutlak suretle dikkate al:\n${userTrainingInstruction}`;
    }

    const groqApiKey = groqToken || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ 
        error: 'GROQ_API_KEY tanımlı değil. Lütfen arayüz ayarlarından veya sistemden GROQ_API_KEY tanımladığınızdan emin olun.' 
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `Prompt: "${prompt}"\nDesired Style: "${stylePrompt}"` }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    const parsedResult = JSON.parse(resultText);

    const enriched = parsedResult.enrichedPrompt || prompt;
    const turkishMessage = parsedResult.turkishTranslation || 'İstediğin görseli senin için tasarladım!';
    
    // Rastgele seed ekleyerek tarayıcı önbelleğini engelle
    const seed = Math.floor(Math.random() * 10000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enriched)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    res.json({
      imageUrl,
      enrichedPrompt: enriched,
      turkishMessage,
      styleUsed: stylePrompt
    });

  } catch (error: any) {
    console.error('Error in Toprak API:', error);
    res.status(500).json({ error: error.message || 'Toprak model hatası' });
  }
});

// --- YAPAY ZEKA DESTEKLİ VİDEO ÇEVİRİ VE DUBLAJ SİSTEMİ ENDPOINTS ---

// Replicate model helper function
async function runReplicateModel(modelNameOrVersion: string, input: any, isVersion = false, customToken?: string) {
  const token = customToken || process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN bulunamadı. Lütfen Replicate API Token tanımlayın.');
  }

  const url = isVersion 
    ? "https://api.replicate.com/v1/predictions"
    : `https://api.replicate.com/v1/models/${modelNameOrVersion}/predictions`;

  const body: any = { input };
  if (isVersion) {
    body.version = modelNameOrVersion;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replicate API başlatma hatası: ${errorText}`);
  }

  let prediction = await response.json();
  const pollUrl = prediction.urls.get;

  // Poll for result (max 95 seconds)
  const startTime = Date.now();
  while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
    if (Date.now() - startTime > 95000) {
      throw new Error("Replicate işlemi zaman aşımına uğradı (95 saniye).");
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(pollUrl, {
      headers: {
        "Authorization": `Token ${token}`
      }
    });
    if (!pollResponse.ok) {
      throw new Error("Replicate durum sorgulama hatası");
    }
    prediction = await pollResponse.json();
  }

  if (prediction.status === "failed") {
    throw new Error(`Replicate işlemi başarısız oldu: ${prediction.error}`);
  }

  return prediction;
}

// 1. ADIM: Sesi Metne Çevirme (Whisper)
app.post('/api/dubbing/transcribe', async (req, res) => {
  try {
    const { video, replicateToken } = req.body; // base64 string
    if (!video) {
      return res.status(400).json({ error: 'Video veya ses verisi bulunamadı' });
    }

    // Whisper prediction başlat
    const prediction = await runReplicateModel("openai/whisper", {
      audio: video,
      model: "base",
      transcription: "plain text"
    }, false, replicateToken);

    const output = prediction.output;
    let transcript = "";
    let detectedLanguage = "tr";

    if (typeof output === "string") {
      transcript = output;
    } else if (output && typeof output === "object") {
      transcript = output.transcription || output.text || JSON.stringify(output);
      if (output.detected_language) {
        detectedLanguage = output.detected_language;
      }
    }

    // Replicate'in bizim için yükleyip oluşturduğu public audio URL'ini alalım
    const replicateUploadedAudioUrl = prediction.input?.audio || null;

    res.json({
      transcript: transcript.trim(),
      detectedLanguage,
      audioUrl: replicateUploadedAudioUrl
    });

  } catch (error: any) {
    console.error('Dubbing transcribe error:', error);
    res.status(500).json({ error: error.message || 'Deşifre hatası oluştu' });
  }
});

// 2. ADIM: Metni Çevirme (Groq Llama 3)
app.post('/api/dubbing/translate', async (req, res) => {
  try {
    const { text, targetLanguage, groqToken } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Çevrilecek metin bulunamadı' });
    }

    const targetLangName = targetLanguage === 'en' ? 'English' : targetLanguage === 'de' ? 'German' : 'Turkish';

    const systemInstruction = `You are a professional video translator and dubbing writer. Your goal is to translate the user's transcript into highly natural, clear, and perfectly spoken ${targetLangName}. 
Make sure the translated text is extremely natural for text-to-speech engine to speak.
Do NOT include any introduction, explanations, notes, or meta comments. Output ONLY the translated text itself.`;

    const groqApiKey = groqToken || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ error: 'GROQ_API_KEY tanımlı değil.' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `Please translate this text to ${targetLangName}:\n\n${text}` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API translation error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content || "";

    res.json({
      translatedText: translatedText.trim()
    });

  } catch (error: any) {
    console.error('Dubbing translate error:', error);
    res.status(500).json({ error: error.message || 'Çeviri hatası oluştu' });
  }
});

// 3. ADIM: Seslendirme / Dublaj (XTTS-v2)
app.post('/api/dubbing/synthesize', async (req, res) => {
  try {
    const { text, targetLanguage, speakerUrl, replicateToken } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Seslendirilecek metin bulunamadı' });
    }

    // XTTS için varsayılan bir ses referansı tanımlıyoruz (eğer kendi sesi gelmezse)
    const defaultSpeakerUrl = "https://replicate.delivery/pbxt/Jt79CgCseXm6o05Yg2YgX8g2mY76y8uYf8U7Kx5v7q/female.wav";
    const referenceSpeaker = speakerUrl || defaultSpeakerUrl;

    const prediction = await runReplicateModel("lucataco/xtts-v2", {
      text: text,
      speaker: referenceSpeaker,
      language: targetLanguage || "tr"
    }, false, replicateToken);

    const output = prediction.output;
    let audioResultUrl = "";

    if (typeof output === "string") {
      audioResultUrl = output;
    } else if (Array.isArray(output)) {
      audioResultUrl = output[0] || "";
    } else if (output && typeof output === "object") {
      audioResultUrl = output.audio || output.url || JSON.stringify(output);
    }

    res.json({
      audioUrl: audioResultUrl
    });

  } catch (error: any) {
    console.error('Dubbing synthesize error:', error);
    res.status(500).json({ error: error.message || 'Seslendirme hatası oluştu' });
  }
});

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
