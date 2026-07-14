import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, groqToken, userTrainingInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Görsel açıklaması gereklidir' });
    }

    const stylePrompt = style || 'Cinematic';

    let systemInstruction = `You are 'Toprak', an advanced visual prompt engineering expert.

IMPORTANT RULE: Before answering or generating a prompt, carefully think about what the user means, the context of the sentence, and the logic of the words. Make sure words don't get mixed up and semantic coherence is preserved. Take time to fully understand the user's language and intent; think first, resolve the logic, and then provide a clear and coherent response.

Your job is to take a brief Turkish image description and a desired visual style, and generate a highly detailed, descriptive, and stunning English prompt for an image generation model (like Midjourney, Stable Diffusion, or Flux).

STYLING GUIDELINES:
The user has requested the following style: "${stylePrompt}". 
You MUST incorporate elements, lighting, camera angles, and artistic techniques that perfectly match this style.

OUTPUT FORMAT:
You MUST return your response as a valid JSON object with EXACTLY these two keys:
{
  "enrichedPrompt": "the highly detailed english prompt here",
  "turkishTranslation": "a brief warm friendly message in Turkish from Toprak saying what he created, e.g., 'Harika bir [stilde] görsel tasarladım canım!'"
}`;

    if (userTrainingInstruction && userTrainingInstruction.trim()) {
      systemInstruction += `\n\nKULLANICI ÖZEL EĞİTİM (HAFIZA) NOTLARI:\nKullanıcı modelin kalıcı hafızasına şu özel notları/kuralları ekledi. Lütfen bundan sonraki cevaplarında bu kuralları bağlam olarak kullan ve mutlak suretle dikkate al:\n${userTrainingInstruction}`;
    }

    const groqApiKey = groqToken || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ 
        error: 'GROQ_API_KEY ortam değişkeni tanımlı değil veya token gönderilmedi.' 
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
    
    const seed = Math.floor(Math.random() * 10000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enriched)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    return res.status(200).json({
      imageUrl,
      enrichedPrompt: enriched,
      turkishMessage,
      styleUsed: stylePrompt
    });
  } catch (error: any) {
    console.error('Error in Toprak API:', error);
    return res.status(500).json({ error: error.message || 'Toprak model hatası' });
  }
}
