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
  CornerDownLeft
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  'ما هي شروط وإجراءات استخراج إباحة البناء في مسقط؟',
  'كم التكلفة التقديرية لبناء فيلا تسليم مفتاح (ر.ع/م²)؟',
  'ما الفرق بين درجات تصنيف المقاولين في مجلس المناقصات العُماني؟',
  'ما هي أفضل الخرسانات المقاومة للأملاح والرطوبة (SRC)؟',
  'كيف أضمن حقوقي في العقد مع المقاول الإنشائي؟'
];

export const OmanConstructionChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `مرحباً بك في منصة مِهاد! 🇴🇲\n\nأنا **مستشار مِهاد الهندسي والإنشائي الذكي**، ومساعدك المتخصص **حصرياً في قطاع البناء، المقاولات، والاشتراطات البلدية في سلطنة عُمان**.\n\nيمكنني إرشادك في:\n- تراخيص وإباحات البناء البلدية وخرائط الكروكي.\n- تصنيفات المقاولين المعتمدة لدى مجلس المناقصات.\n- تكاليف المتر المربع التقديرية بالريال العُماني.\n- جودة المواد، الخرسانات المقاومة، والعوازل المعتمدة.\n- عقود المقاولات وضمانات الهيكل الإنشائي.\n\nكيف يمكنني مساعدتك في مشروعك اليوم؟`,
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error(`خطأ في استجابة الخادم: ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || 'عذراً، لم أتمكن من الحصول على الإجابة. يرجى إعادة المحاولة.';

      setMessages(prev => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: `عذراً، حدث خطأ مؤقت أثناء معالجة الطلب. يرجى التحقق من اتصال الإنترنت أو إعادة إرسال السؤال.\n(ملاحظة: أنا مخصص حصرياً للإجابة عن قطاع البناء والمقاولات بسلطنة عُمان).`,
          timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: 'تمت إعادة ضبط المحادثة. أنا جاهز لإجابة أي استفسار يتعلق بقطاع البناء والإنشاءات والمقاولين في سلطنة عُمان 🇴🇲.',
        timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl royal-gradient-btn text-white font-bold shadow-2xl hover:scale-105 transition-all cursor-pointer border border-blue-400/40"
            title="مستشار مِهاد الإنشائي الذكي (عُمان)"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                <span>مستشار البناء الذكي</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-mono">عُمان 🇴🇲</span>
              </div>
              <div className="text-[10px] text-blue-200 font-normal">استشر الذكاء الاصطناعي مجاناً</div>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 flex flex-col bg-slate-950/95 border border-blue-500/40 shadow-2xl backdrop-blur-xl transition-all duration-200 overflow-hidden ${
            isExpanded 
              ? 'inset-4 md:inset-10 rounded-3xl' 
              : 'bottom-4 left-4 right-4 sm:right-auto sm:w-[460px] h-[580px] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg border border-blue-400/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">مستشار مِهاد الإنشائي الذكي</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>متصل</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>مخصص لقطاع الإنشاءات والمقاولات بسلطنة عُمان 🇴🇲</span>
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="مسح المحادثة"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
                title={isExpanded ? 'تصغير' : 'تكبير النافذة'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs md:text-sm">
            {messages.map((msg) => {
              const isModel = msg.role === 'model';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isModel ? 'justify-start' : 'justify-end'}`}
                >
                  {isModel && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                    isModel 
                      ? 'bg-slate-900 border border-slate-800 text-slate-200' 
                      : 'royal-gradient-btn text-white rounded-br-none'
                  }`}>
                    {/* Message Text with simple line break and markdown bold parsing */}
                    <div className="whitespace-pre-line">
                      {msg.text.split('\n').map((line, lIdx) => {
                        return (
                          <span key={lIdx} className="block mb-1">
                            {line.startsWith('**') && line.endsWith('**') ? (
                              <strong className="text-blue-300 font-bold">{line.replace(/\*\*/g, '')}</strong>
                            ) : line.includes('**') ? (
                              line.split('**').map((seg, sIdx) => 
                                sIdx % 2 === 1 ? <strong key={sIdx} className="text-blue-300 font-bold">{seg}</strong> : seg
                              )
                            ) : (
                              line
                            )}
                          </span>
                        );
                      })}
                    </div>

                    <div className={`text-[10px] mt-1.5 text-right opacity-60 ${isModel ? 'text-slate-400' : 'text-blue-200'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 pr-10">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-blue-300 mr-2 font-medium">جارِ استشارة الذكاء الاصطناعي وفق المعايير العمانية...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <span className="text-[10px] font-bold text-blue-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>مقترحات:</span>
              </span>
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors border border-slate-700/80 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <div className="relative flex items-center gap-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب استفسارك عن البناء، التراخيص، أو أسعار المقاولين في عُمان..."
                rows={1}
                className="w-full resize-none py-2.5 pr-3 pl-12 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 max-h-24"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute left-2 w-8 h-8 rounded-lg royal-gradient-btn text-white flex items-center justify-center disabled:opacity-40 transition-opacity cursor-pointer shadow"
                title="إرسال"
              >
                <Send className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
              <span>مدعوم بـ Google Gemini • مخصص حصرياً لقطاع البناء في سلطنة عُمان</span>
              <span className="hidden sm:inline">اضغط Enter للإرسال</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
