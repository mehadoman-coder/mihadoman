import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Trash2, 
  HelpCircle,
  FileText,
  Calculator,
  Compass,
  CornerDownLeft,
  ChevronDown,
  Layers,
  Award
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  'ما هي شروط وإجراءات استخراج إباحة البناء في مسقط؟',
  'كم التكلفة التقديرية لبناء فيلا تسليم مفتاح (ر.ع/م²)؟',
  'احسب لي احتياجات فيلا 400 م² من الحديد والإسمنت والخرسانة',
  'ما الفرق بين درجات تصنيف المقاولين في مجلس المناقصات العُماني؟',
  'ما هي أفضل الخرسانات المقاومة للأملاح والرطوبة (SRC) في عُمان؟',
  'كيف أضمن حقوقي في العقد مع المقاول الإنشائي؟'
];

// Robust local knowledge responses for Oman construction
function getOmanLocalAnswer(query: string): string | null {
  const q = query.toLowerCase();

  if (q.includes('احتياجات') || q.includes('احسب') || q.includes('كمية') || q.includes('حديد') || q.includes('اسمنت') || q.includes('خرسانة')) {
    return `بصفتي مستشارك الهندسي بسلطنة عُمان 🇴🇲، إليك المعايير الهندسية لتقدير احتياجات البناء الإنشائي (لكل 100 م² مسطح بناء):

1. **حديد التسليح (عُمان ستيل / صحار للصلب):**
   - المعدل الهندسي: 3.2 إلى 3.6 طن لكل 100 م² مسطح.
   - لفيلا 400 م²: تحتاج تقريباً **14 إلى 15 طن** حديد تسليح مشوه عالي المقاومة (Grade 60).

2. **الخرسانة الجاهزة (Ready-Mix):**
   - المعدل الهندسي: 38 إلى 42 م³ لكل 100 م².
   - للقواعد والرقاب والأساسات: خرسانة مقاومة للكبريتات والأملاح (SRC) عيار C30/C35.
   - للأعمدة والأسقف: خرسانة بورتلاندي عادي (OPC).
   - لفيلا 400 م²: تحتاج حوالي **160 م³ خرسانة مسلحة**.

3. **الإسمنت (إسمنت عُمان / إسمنت ريسوت):**
   - لأعمال البناء والصب اليدوي والبلستر: تحتاج حوالي **300 - 350 كيس لكل 100 م²**.

4. **الطابوق الأسمنتي المعتمد (20 سم):**
   - يحتاج المشروع تقريباً **26 - 30 طابوقة لكل متر مربع مسطح** (حوالي 11,000 طابوقة لفيلا 400 م² مع طابوق عازل للواجهات).

5. **العوازل (المعتمدة ببلدية مسقط):**
   - عزل مائي بالبيتومين السائل والممبرين 4 ملم للأساسات والسطح ودورات المياه، مع عزل حراري فوم (XPS) بكثافة لا تقل عن 32 كجم/م³.`;
  }

  if (q.includes('إباحة') || q.includes('بلدية') || q.includes('ترخيص') || q.includes('تصريح')) {
    return `📋 **إجراءات واشتراطات إباحة البناء في سلطنة عُمان (بلدية مسقط وبلديات المحافظات):**

1. **المرحلة الأولى: الكروكي والمكتب الاستشاري:**
   - تجهيز الرسم المساحي (الكروكي) ساري المفعول والملكية.
   - التعاقد مع مكتب استشاري هندسي معتمد ومصنف لإعداد الخرائط المعمارية والإنشائية والكهربائية (MEP).

2. **المرحلة الثانية: فحص التربة (Soil Investigation):**
   - إلزامي في معظم مناطق مسقط والمحافظات للتأكد من قدرة تحمل التربة وتصميم الأساسات (قواعد منفصلة، لبشة، أو ميدات).

3. **المرحلة الثالثة: تقديم المعاملة عبر البوابة البلدية:**
   - يقوم الاستشاري برفع المخططات عبر نظام تراخيص البناء الإلكتروني.
   - مراجعة الارتدادات: ارتداد أمامي (لا يقل عن 3 إلى 5 أمتار حسب المخطط)، جانبي وخلفي (لا يقل عن 1.5 - 2 متر).
   - نسبة البناء المسموح بها للمباني السكنية (غالباً 60% من مساحة الأرض).

4. **المرحلة الرابعة: إباحة البناء والبدء:**
   - سداد الرسوم البلدية والتأمين واستخراج الإباحة الكبرى، وتعيين مقاول معتمد يحمل سجل تجاري نشط.`;
  }

  if (q.includes('تكلفة') || q.includes('سعر') || q.includes('بكم') || q.includes('متر') || q.includes('مفتاح') || q.includes('عظم')) {
    return `💰 **الأسعار والتقديرات الاسترشادية للبناء في سلطنة عُمان لعام 2026 (بالريال العُماني OMR):**

- **هيكل عظم بالمواد (Skeleton with materials):**
  - يتراوح بين **45 إلى 60 ر.ع / م²** حسب مواصفات الخرسانة والحديد.

- **تسليم مفتاح (تشطيب قياسي ممتاز):**
  - يتراوح بين **125 إلى 155 ر.ع / م²** (أرضيات بورسلان، نوافذ دبل جلاس، أطقم صحية معتمدة).

- **تسليم مفتاح (تشطيب ديلوكس وفائق الفخامة):**
  - يتراوح بين **160 إلى 220+ ر.ع / م²** (رخام عُماني طبيعي، حجر خارجي، تكييف مركزي VRF، أنظمة سمارت هوم).

- **أتعاب الاستشاري (تصميم وإشراف):**
  - التصميم والخرائط: **300 إلى 800 ر.ع**، والإشراف الدوري: **40 إلى 70 ر.ع شهرياً** أو نسبة 2.5% - 4% من كلفة المشروع.`;
  }

  if (q.includes('مناقصات') || q.includes('درجة') || q.includes('تصنيف') || q.includes('مجلس')) {
    return `🏆 **درجات تصنيف المقاولين المعتمدة لدى مجلس المناقصات بسلطنة عُمان:**

1. **الدرجة الممتازة:**
   - للشركات الكبرى ذات الملاءة المالية العالية، تنفذ مشاريع البنية التحتية، الأبراج والمجمعات بملايين الريالات.
2. **الدرجة الأولى:**
   - شركات رائدة مؤهلة للمشاريع التجارية والفلل الضخمة والمباني المتعددة الأدوار.
3. **الدرجة الثانية والثالثة:**
   - الأنسب للفلل السكنية، العمارات المتوسطة، والمشاريع الاستثمارية الشخصية.
4. **الدرجة الرابعة:**
   - للمشاريع الصغرى وأعمال الصيانة والترميم والإضافات.

💡 *نصيحة مِهاد:* عند بناء فيلا سكنية، يُنصح باختيار مقاول مصنف (درجة أولى أو ثانية) ومسجل بانتظام لضمان تواجد عمالة ماهرة وضمان 10 سنوات على الهيكل الإنشائي.`;
  }

  return null;
}

export const OmanConstructionChatbot: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRtl } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNeedsCalc, setShowNeedsCalc] = useState(false);
  const [calcArea, setCalcArea] = useState<number>(400);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `مرحباً بك في منصة مِهاد! 🇴🇲\n\nأنا **مرشد ومستشار مِهاد الهندسي والإنشائي الذكي**، ومساعدك المتخصص **حصرياً في عالم البناء، المقاولات، وتحديد الاحتياجات في سلطنة عُمان**.\n\nيمكنني إرشادك في:\n- 📐 حساب احتياجات مشروعك (حديد، إسمنت، خرسانة، طابوق، عوازل).\n- 🏛️ اشتراطات وتراخيص بلدية مسقط وبلديات المحافظات وإباحات البناء.\n- 🏆 اختيار درجات تصنيف المقاولين المعتمدين بمجلس المناقصات.\n- 💰 تقدير التكاليف الدقيقة بالريال العُماني (OMR).\n- 📝 عقود المقاولات وضمانات الهيكل الإنشائي.\n\nكيف يمكنني مساعدتك في مشروعك اليوم؟`,
      timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    // 1. Try server Gemini endpoint
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setMessages(prev => [
            ...prev,
            {
              id: `model-${Date.now()}`,
              role: 'model',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Chat API offline/fallback, using local Oman expert engine:', e);
    }

    // 2. Intelligent local fallback specifically for Oman construction
    setTimeout(() => {
      const localAnswer = getOmanLocalAnswer(query) || 
        `مرحباً بك! بصفتي مستشار مِهاد الهندسي والإنشائي بسلطنة عُمان 🇴🇲:
بخصوص استفسارك حول ("${query.slice(0, 45)}..."):
يُنصح دائماً في مشاريع البناء بسلطنة عُمان بمطابقة الخرائط مع اشتراطات البلدية المعنية وإجراء فحص التربة المعتمد، واستخدام الخرسانة المقاومة للأملاح والكبريتات (SRC) في الأساسات، والتعاقد مع مقاول معتمد عبر منصة مِهاد لضمان التوثيق وجودة التنفيذ.
يمكنك أيضاً استخدام أداة "حساب الاحتياجات الإنشائية" أعلاه للحصول على كميات الحديد والإسمنت فوراً!`;

      setMessages(prev => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: localAnswer,
          timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsLoading(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCalculateNeedsSubmit = () => {
    const text = `احسب لي احتياجات فيلا سكنية بمساحة ${calcArea} م² في سلطنة عُمان بالتفصيل من حديد وإسمنت وخرسانة وتكلفة تقريبية.`;
    setShowNeedsCalc(false);
    handleSendMessage(text);
  };

  return (
    <>
      {/* Floating Trigger Button with Oman Badge */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 lg:bottom-7 left-4 sm:left-7 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white shadow-2xl border border-white/20 hover:scale-105 transition-all cursor-pointer shadow-blue-900/60"
          aria-label="فتح مرشد البناء العُماني"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-blue-950 animate-pulse" />
          </div>

          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black">مرشد البناء العُماني</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-blue-950 font-bold">🇴🇲 حصري</span>
            </div>
            <span className="text-[10px] text-blue-200 block">مستشارك الهندسي الذكي</span>
          </div>
        </button>
      )}

      {/* Main Bot Drawer / Modal */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col overflow-hidden ${
          isExpanded 
            ? 'inset-3 sm:inset-6 rounded-3xl' 
            : 'bottom-4 sm:bottom-6 left-3 sm:left-6 w-[95vw] sm:w-[480px] h-[85vh] max-h-[640px] rounded-3xl'
        } ${
          isDark 
            ? 'bg-[#071633] border border-white/20 text-white' 
            : 'bg-white border border-slate-200 text-slate-900'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
            isDark 
              ? 'bg-gradient-to-r from-[#0d2757] via-[#091e42] to-[#071633] border-white/10' 
              : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">مرشد البناء والإنشاءات العُماني</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                    🇴🇲 سلطنة عُمان فقط
                  </span>
                </div>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  تحديد الاحتياجات، الكود العُماني، التكاليف وتراخيص البلدية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title={isExpanded ? 'تصغير' : 'توسيع'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Needs Calculator Toggle Bar */}
          <div className={`px-4 py-2 border-b flex items-center justify-between text-xs ${
            isDark ? 'bg-blue-950/40 border-white/10' : 'bg-blue-50 border-blue-200'
          }`}>
            <button
              type="button"
              onClick={() => setShowNeedsCalc(!showNeedsCalc)}
              className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>أداة حاسبة الاحتياجات الإنشائية (حديد، إسمنت، خرسانة)</span>
            </button>
            <span className="text-[10px] text-slate-400">انقر للتفعيل</span>
          </div>

          {/* Collapsible Needs Calculator Box */}
          {showNeedsCalc && (
            <div className={`p-4 border-b space-y-3 animate-fade-in ${
              isDark ? 'bg-[#050f24] border-white/10' : 'bg-slate-100 border-slate-300'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">مساحة البناء الإجمالية لمشروعك:</span>
                <span className="font-black text-blue-400 font-mono text-sm">{calcArea} م²</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                step="25"
                value={calcArea}
                onChange={(e) => setCalcArea(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
                  <span className="block text-slate-400 text-[10px]">الحديد المتوقع</span>
                  <span className="font-bold text-blue-400 font-mono">{(calcArea * 0.035).toFixed(1)} طن</span>
                </div>
                <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
                  <span className="block text-slate-400 text-[10px]">الخرسانة الجاهزة</span>
                  <span className="font-bold text-blue-400 font-mono">{(calcArea * 0.4).toFixed(0)} م³</span>
                </div>
                <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
                  <span className="block text-slate-400 text-[10px]">أكياس الإسمنت</span>
                  <span className="font-bold text-blue-400 font-mono">{(calcArea * 3.2).toFixed(0)} كيس</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCalculateNeedsSubmit}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                اطلب من المرشد تفصيل خطة الاحتياجات والميزانية بالكامل
              </button>
            </div>
          )}

          {/* Quick Questions Pills */}
          <div className={`p-2.5 border-b overflow-x-auto flex items-center gap-1.5 no-scrollbar text-xs ${
            isDark ? 'bg-[#040c1e] border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] font-bold text-blue-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              أسئلة شائعة:
            </span>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition-colors text-[10px] font-semibold border ${
                  isDark ? 'bg-white/5 hover:bg-blue-600/30 border-white/10 text-slate-300' : 'bg-white hover:bg-blue-50 border-slate-300 text-slate-800'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-blue-400">
                      {isUser ? 'أنت' : 'مرشد مِهاد العُماني 🇴🇲'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className={`max-w-[90%] sm:max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : isDark
                        ? 'bg-[#0a1e45] text-slate-100 border border-white/10 rounded-bl-xs'
                        : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-blue-400 text-xs p-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>المرشد يحلل الاشتراطات والاحتياجات الهندسية لسلطنة عُمان...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className={`p-3 border-t flex items-end gap-2 ${
            isDark ? 'bg-[#081836] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <textarea
              ref={inputRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل المرشد عن تراخيص البناء، تكلفة المتر، المواد أو احتياجات فيلتك..."
              className={`flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm border resize-none focus:outline-none transition-all ${
                isDark 
                  ? 'bg-[#050f24] border-white/15 text-white placeholder-slate-400 focus:border-blue-400' 
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-600'
              }`}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white cursor-pointer shadow-lg transition-all shrink-0"
              title="إرسال"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
