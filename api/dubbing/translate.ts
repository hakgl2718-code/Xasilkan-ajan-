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
    const { text, targetLanguage, groqToken } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Çevrilecek metin bulunamadı' });
    }

    const targetLangName = targetLanguage === 'en' ? 'English' : targetLanguage === 'de' ? 'German' : 'Turkish';
    const systemInstruction = `You are a professional video translator and dubbing writer. Your goal is to translate the user's transcript into highly natural, clear, and perfectly spoken ${targetLangName}. Make sure the translated text is extremely natural for text-to-speech engine to speak.
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

    return res.status(200).json({
      translatedText: translatedText.trim()
    });
  } catch (error: any) {
    console.error('Dubbing translate error:', error);
    return res.status(500).json({ error: error.message || 'Çeviri hatası oluştu' });
  }
}
