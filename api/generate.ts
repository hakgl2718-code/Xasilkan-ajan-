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

- **🎯 Kullanıcı Ne İstiyor?:** Talebin çok kısa bir özeti.
- **💡 Yaratıcı Fikirler & Geliştirmeler:** İstenene ek olarak projeyi daha iyi hale getirecek 2-3 profesyonel dokunuş veya vizyoner fikir. (Örn: "Bir karanlık mod eklesek harika olur", "Forma küçük bir doğrulama animasyonu ekleyelim", vb.)
- **🛠️ Teknik Yaklaşım & State Yönetimi:** Hangi teknolojileri, state'leri veya fonksiyonları kullanacağının/güncelleyeceğinin profesyonel, maddeler halinde dökümü. Mevcut bir koda entegrasyon yapıyorsan bunun nasıl yapılacağını açıkla.
- **📋 Planlanan Adımlar:** Kodlamanın 3-4 maddelik çok kısa adım adım planı.

### 💻 KOD (Sadece bir kez ve \`\`\`html bloğu içinde)
Analiz kısmını bitirdikten sonra, HTML kodunu SADECE BİR KEZ ver. 

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

    const groqApiKey = groqToken || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(400).json({ error: 'GROQ_API_KEY ortam değişkeni tanımlı değil veya token gönderilmedi.' });
    }

    const groqMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 8000,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API isteği başarısız oldu (Durum: ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Groq API Hatası:', error);
    return res.status(500).json({ error: error.message || 'Sunucu hatası oluştu' });
  }
}
