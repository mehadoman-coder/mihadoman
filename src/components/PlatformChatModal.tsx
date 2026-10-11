import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  X, 
  ShieldCheck, 
  CheckCheck, 
  Paperclip, 
  Building2, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Lock, 
  Clock, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Contractor, Consultant } from '../types';

export interface PlatformMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'contractor' | 'consultant' | 'system';
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: string;
  isQuoteRequest?: boolean;
  projectDetails?: {
    area?: number;
    budget?: string;
    city?: string;
  };
}

interface PlatformChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProvider: {
    id: string;
    name: string;
    companyName: string;
    role: 'contractor' | 'consultant';
    location: string;
    rating?: number;
    verified?: boolean;
    licenseNumber?: string;
    startingPrice?: number;
  } | null;
  onRequireAuth?: () => void;
}

export const PlatformChatModal: React.FC<PlatformChatModalProps> = ({
  isOpen,
  onClose,
  targetProvider,
  onRequireAuth
}) => {
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();
  const { isDark } = useTheme();

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<PlatformMessage[]>([]);
  const [quickActionSent, setQuickActionSent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Storage key based on current provider
  const storageKey = targetProvider && user 
    ? `mihad_chat_${user.uid}_${targetProvider.id}`
    : targetProvider ? `mihad_chat_guest_${targetProvider.id}` : null;

  useEffect(() => {
    if (!isOpen || !targetProvider) return;

    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
          return;
        } catch (e) {}
      }
    }

    // Default welcome message from provider
    const welcomeMsg: PlatformMessage = {
      id: `init-${Date.now()}`,
      senderId: targetProvider.id,
      senderName: targetProvider.companyName || targetProvider.name,
      senderRole: targetProvider.role,
      recipientId: user?.uid || 'client-guest',
      recipientName: user?.name || 'العميل',
      text: `مرحباً بك! يسعدنا في "${targetProvider.companyName}" تواصلك معنا عبر منصة مِهاد الرسمية. نضمن لك دراسة دقيقة لاحتياجات مشروعك وعرض سعر منافس وفق مواصفات كود البناء في سلطنة عُمان. كيف يمكننا خدمتك اليوم؟`,
      timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);
  }, [isOpen, targetProvider, storageKey, user]);

  useEffect(() => {
    if (storageKey && messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen || !targetProvider) return null;

  // If user is not authenticated, prompt auth
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className={`max-w-md w-full rounded-3xl p-6 md:p-8 border shadow-2xl relative space-y-5 text-center ${
          isDark ? 'bg-[#081836] border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black">
              {t('auth.gateTitle', 'يلزم تسجيل الدخول لإتمام هذا الإجراء')}
            </h3>
            <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              التواصل مع مقدمي الخدمة متاح حصرياً داخل منصة مِهاد لحماية حقوقك وتوثيق الصفقات. يرجى تسجيل الدخول بحساب Google أو الدخول اليدوي للمتابعة.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRequireAuth) onRequireAuth();
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>تسجيل الدخول الآن (Google أو يدوي)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                isDark ? 'border-white/10 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    const newMsg: PlatformMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.uid,
      senderName: user.name,
      senderRole: 'client',
      recipientId: targetProvider.id,
      recipientName: targetProvider.companyName,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate smart auto-acknowledgement from provider within platform
    setTimeout(() => {
      const ackMsg: PlatformMessage = {
        id: `ack-${Date.now()}`,
        senderId: targetProvider.id,
        senderName: targetProvider.companyName,
        senderRole: targetProvider.role,
        recipientId: user.uid,
        recipientName: user.name,
        text: `شكراً لتواصلك يا أستاذ ${user.name}. تم استلام طلبك ورسالتك بنجاح عبر النظام الداخلي لمنصة مِهاد. يقوم المهندس المسؤول حالياً بمراجعة التفاصيل وسيقوم بالرد عليك هنا فوراً بعرض السعر أو الرد الفني.`,
        timestamp: new Date().toLocaleTimeString('ar-OM', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, ackMsg]);
    }, 1200);
  };

  const sendQuickTemplate = (template: string) => {
    setQuickActionSent(template);
    handleSendMessage(template);
    setTimeout(() => setQuickActionSent(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl h-[90vh] max-h-[720px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden relative ${
        isDark ? 'bg-[#071633] border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
      }`}>
        {/* Top Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'bg-[#0a1e45] border-white/10' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
              {targetProvider.companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  {targetProvider.companyName}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  متصل بالمنصة
                </span>
              </div>
              <p className={`text-xs flex items-center gap-2 mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>{targetProvider.location}</span>
                {targetProvider.startingPrice && (
                  <span className="font-semibold text-amber-400">
                    • يبدأ من {targetProvider.startingPrice} ر.ع/م²
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Exclusivity Banner */}
        <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-blue-950/60 px-4 py-2 border-b border-blue-500/30 flex items-center justify-between text-[11px] text-blue-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>التواصل محمي عبر منصة مِهاد فقط:</strong> يتم توثيق الصفقات والاتفاقيات داخل المنصة لحماية حقوق العميل والمقاول.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-blue-700/40 text-[10px] font-mono border border-blue-400/30">
            تشفير موثق
          </span>
        </div>

        {/* Quick Message Actions */}
        <div className={`p-2.5 border-b overflow-x-auto flex items-center gap-2 no-scrollbar text-xs ${
          isDark ? 'bg-[#06122b]/80 border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className="text-[11px] font-bold text-blue-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            نماذج سريعة:
          </span>
          <button
            type="button"
            onClick={() => sendQuickTemplate('أرغب في طلب عرض سعر لتنفيذ فيلا سكنية (تسليم مفتاح) بمساحة 450 م²')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap cursor-pointer transition-colors text-[11px] font-semibold border ${
              isDark ? 'bg-white/5 hover:bg-blue-600/30 border-white/10 text-slate-200' : 'bg-white hover:bg-blue-50 border-slate-300 text-slate-800'
            }`}
          >
            📋 طلب عرض سعر فيلا 450م²
          </button>
          <button
            type="button"
            onClick={() => sendQuickTemplate('هل يمكن التنسيق لزيارة ومعاينة موقع المشروع في مسقط لمطابقة المخطط الهندسي؟')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap cursor-pointer transition-colors text-[11px] font-semibold border ${
              isDark ? 'bg-white/5 hover:bg-blue-600/30 border-white/10 text-slate-200' : 'bg-white hover:bg-blue-50 border-slate-300 text-slate-800'
            }`}
          >
            📍 طلب معاينة موقع المشروع
          </button>
          <button
            type="button"
            onClick={() => sendQuickTemplate('أرغب في الاستفسار عن كادر العمل المشرف ومدة الإنجاز المتوقعة.')}
            className={`px-3 py-1 rounded-xl whitespace-nowrap cursor-pointer transition-colors text-[11px] font-semibold border ${
              isDark ? 'bg-white/5 hover:bg-blue-600/30 border-white/10 text-slate-200' : 'bg-white hover:bg-blue-50 border-slate-300 text-slate-800'
            }`}
          >
            ⏱️ استفسار عن مدة الإنجاز
          </button>
        </div>

        {/* Message Thread List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className={`text-[10px] font-bold ${
                    isMe ? 'text-blue-400' : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {isMe ? 'أنت (العميل)' : msg.senderName}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                <div className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : isDark 
                      ? 'bg-[#0f2652] text-slate-100 border border-white/10 rounded-bl-xs' 
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-500">
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-400" />}
                  <span>{isMe ? 'مرسلة عبر مِهاد' : 'موثقة'}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className={`p-3 sm:p-4 border-t flex items-center gap-2 ${
            isDark ? 'bg-[#081836] border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.typePlaceholder', 'اكتب رسالتك أو استفسارك هنا عبر المنصة فقط...')}
            className={`flex-1 px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm border focus:outline-none transition-all ${
              isDark 
                ? 'bg-[#050f24] border-white/15 text-white placeholder-slate-400 focus:border-blue-400'
                : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-600'
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-2.5 sm:py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">إرسال</span>
          </button>
        </form>
      </div>
    </div>
  );
};
