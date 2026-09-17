const GROQ_API_KEY = import.meta.env?.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function askRealAi(userPrompt) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `Sen Chiclet adlı bir oyun içi sohbet ve video uygulamasının yerleşik yapay zeka asistanısın.
                      Görevin kullanıcıyla doğal, samimi ve akıllı bir şekilde konuşmak.
                      Her türlü konuda yardımcı olabilirsin: genel sohbet, oyun taktikleri, sorular, tavsiyeler...
                      Kısa ve öz cevaplar ver. Türkçe konuş.`
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    return 'Şu an bir sorun oluştu, tekrar dener misin?';

  } catch (error) {
    return 'Bağlantı hatası oluştu. İnternet bağlantını kontrol edebilir misin?';
  }
}
