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
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const groqApiKey = groqToken || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ error: 'GROQ_API_KEY ortam değişkeni tanımlı değil veya token gönderilmedi.' });
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
        temperature: 0.6,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API isteği başarısız oldu (Durum: ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "";
    return res.status(200).send(assistantMessage);
  } catch (error: any) {
    console.error('Berrak Chat Hatası:', error);
    return res.status(500).json({ error: error.message || 'Sunucu hatası oluştu' });
  }
}
