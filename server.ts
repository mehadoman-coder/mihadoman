import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Specialized Gemini Chatbot Route for Construction Sector in Oman
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'قائمة الرسائل غير صالحة أو فارغة.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback intelligent response if API key is not configured in environment
        const lastMsg = messages[messages.length - 1]?.text || '';
        return res.json({
          reply: `مرحباً بك في منصة مِهاد! بصفتي مستشارك الهندسي المتخصص في قطاع البناء بسلطنة عُمان:
بخصوص استفسارك ("${lastMsg.slice(0, 50)}...")، يُنصح دائماً بمراعاة اشتراطات كود البناء وتصنيف مجلس المناقصات العُماني واشتراطات البلدية (إباحة البناء). كما يمكنك تصفح المقاولين المعتمدين وحاسبة التكاليف عبر المنصة.`
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `
أنت "مستشار مِهاد الهندسي والإنشائي الذكي" (Mihad Construction AI Advisor)، المساعد الذكي الرسمي لمنصة "مِهاد" (سوق المقاولات والإنشاءات في سلطنة عُمان).

طبيعة اختصاصك الحصرية والدقيقة:
1. أنت مخصص ومحصور كلياً للإجابة عن:
   - قطاع البناء، التشييد، والمقاولات في سلطنة عُمان (مسقط، ظفار، شمال وجنوب الباطنة، الداخلية، الشرقية، الظاهرة، وغيرها).
   - اللوائح البلدية واشتراطات تراخيص وإباحات البناء في عُمان (إباحة البناء الكبرى والصغرى، تراخيص البلدية، خرائط الكروكي، فحص التربة).
   - تصنيفات مجلس المناقصات العُماني للمقاولين والمكاتب الاستشارية الهندسية (درجة ممتازة، أولى، ثانية، ثالثة، رابعة).
   - مواد البناء ومواصفاتها القياسية في مناخ عُمان (الخرسانة الجاهزة المقاومة للأملاح والكبريتات SRC، حديد التسليح المعتمد، الطابوق، العوازل الحرارية والمائية، التشطيبات والرخام العماني الطبيعي).
   - التكاليف والأسعار التقديرية بالريال العُماني (OMR) لمختلف مراحل البناء (تسليم مفتاح، هيكل عظم، يد عاملة، أتعاب التصميم والإشراف الهندسي).
   - إرشادات صياغة عقود المقاولات وضمانات الهيكل الإنشائي وحساب الكميات.
   - توجيه العميل داخل منصة مِهاد (الوصول للمقاولين المعتمدين القريبين جغرافياً، طلب عروض الأسعار، استخدام حاسبة تكاليف البناء، ونشر الإعلانات).

القاعدة الذهبية الصارمة:
- إذا سألك المستخدم عن أي موضوع خارج قطاع البناء والهندسة والمقاولات بسلطنة عُمان (مثل السياسة، الطبخ، الرياضة، الألعاب، البرمجة العامة غير المتعلقة بالمنصة، أو أي مواضيع عامة أخرى)، يجب عليك فوراً وبكل لباقة الاعتذار والرد بالتالي نصاً أو بمعناه:
"عذراً، بصفتي مستشار مِهاد الذكي، أنا مخصص حصرياً للإجابة عن استفسارات قطاع البناء، المقاولات، والهندسة والاشتراطات البلدية وتكاليف المشاريع في سلطنة عُمان. يسعدني جداً مساعدتك في أي استفسار يتعلق بمشروعك الإنشائي أو مقاولي المنصة!"

أسلوب الرد:
- لغة عربية فصحى مهنية، راقية، واضحة ومباشرة.
- تنظيم الإجابة في نقاط وخطوات عملية يسهل على صاحب المشروع فهمها.
- استخدام الريال العُماني (ر.ع / OMR) دائماً عند ذكر أي تكاليف أو أسعار.
`;

      // Convert conversation history for Gemini
      // Format: { role: 'user' | 'model', parts: [{ text }] }
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
          }
        });

        const reply = response.text || 'عذراً، لم أتمكن من استخراج الإجابة في الوقت الحالي. يرجى المحاولة مرة أخرى.';
        return res.json({ reply });
      } catch (geminiError: any) {
        console.error('Gemini API execution error:', geminiError);
        // Fallback to gemini-2.5-flash if 3.8-flash has transient issue
        try {
          const fallbackResp = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction,
              temperature: 0.6,
            }
          });
          return res.json({ reply: fallbackResp.text || 'مرحباً بك! يسعدني إجابة استفسارك بخصوص قطاع البناء في عُمان.' });
        } catch (e2) {
          return res.status(500).json({ 
            error: 'حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي.',
            details: geminiError?.message 
          });
        }
      }
    } catch (err: any) {
      console.error('Server /api/chat error:', err);
      res.status(500).json({ error: 'خطأ داخلي في الخادم.' });
    }
  });

  // Vite development middleware or static production serving
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
    console.log(`Mihad Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
