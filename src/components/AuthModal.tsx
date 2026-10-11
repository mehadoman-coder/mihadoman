import React, { useState } from 'react';
import { 
  LogIn, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { MihadLogo } from './MihadLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess?: () => void;
  onLoginSuccess?: (role: string) => void;
  onOpenRegisterPage?: () => void;
  actionPromptMessage?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
  onLoginSuccess,
  onOpenRegisterPage,
  actionPromptMessage
}) => {
  const { authenticateWithCredentials, signInWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoadingGoogle(true);
    try {
      const res = await signInWithGoogle();
      setIsLoadingGoogle(false);
      if (res.success) {
        onClose();
        if (onLoginSuccess && res.role) {
          onLoginSuccess(res.role);
        } else if (res.role === 'admin' && onAdminLoginSuccess) {
          onAdminLoginSuccess();
        }
      } else {
        setErrorMessage(res.message || 'فشل تسجيل الدخول بواسطة جوجل.');
      }
    } catch (e: any) {
      setIsLoadingGoogle(false);
      setErrorMessage(e.message || 'حدث خطأ غير متوقع أثناء الاتصال بجوجل.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateWithCredentials(identifier, password);
      if (result.success) {
        setIsLoading(false);
        onClose();
        if (onLoginSuccess && result.role) {
          onLoginSuccess(result.role);
        } else if (result.role === 'admin' && onAdminLoginSuccess) {
          onAdminLoginSuccess();
        }
      } else {
        setIsLoading(false);
        setErrorMessage(result.message || 'بيانات الدخول غير صحيحة.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className={`max-w-md w-full rounded-3xl p-6 md:p-8 border shadow-2xl relative space-y-6 ${
        isDark ? 'bg-[#081836] border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 left-5 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
            isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          aria-label="إغلاق"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center">
            <MihadLogo variant="horizontal" size="md" inverted={isDark} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">
              {t('nav.login', 'تسجيل الدخول')}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              أدخل بيانات حسابك للمتابعة والوصول إلى كافة خدمات المنصة
            </p>
          </div>
        </div>

        {/* Action Prompt Banner if client tried an action while logged out */}
        {actionPromptMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2.5 shadow-sm">
            <Info className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <strong className="block text-amber-200">إجراء يتطلب تسجيل الدخول:</strong>
              <span>{actionPromptMessage}</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Google Sign In (Primary for Client) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle || isLoading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-300 disabled:opacity-60"
          >
            {isLoadingGoogle ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            )}
            <span>تسجيل الدخول الفوري بحساب Google</span>
          </button>

          <div className="relative flex items-center justify-center pt-1">
            <div className={`border-t w-full ${isDark ? 'border-white/10' : 'border-slate-300'}`} />
            <span className={`px-3 text-[11px] font-bold uppercase tracking-wider shrink-0 ${
              isDark ? 'bg-[#081836] text-slate-400' : 'bg-white text-slate-500'
            }`}>
              أو تسجيل الدخول اليدوي
            </span>
            <div className={`border-t w-full ${isDark ? 'border-white/10' : 'border-slate-300'}`} />
          </div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className={`font-bold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              اسم المستخدم، الهاتف أو البريد الإلكتروني
            </label>
            <input
              type="text"
              required
              placeholder="مثال: user@domain.com أو اسم المستخدم"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                isDark 
                  ? 'bg-[#050f24] border-white/20 text-white placeholder-slate-400 focus:border-blue-400' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-600'
              }`}
            />
          </div>

          <div>
            <label className={`font-bold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all font-mono ${
                  isDark 
                    ? 'bg-[#050f24] border-white/20 text-white placeholder-slate-400 focus:border-blue-400' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-blue-600/30 transition-all mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>دخول يدوي</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Detailed Registration Page */}
        <div className={`pt-4 text-center border-t space-y-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            ليس لديك حساب بعد؟
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenRegisterPage) onOpenRegisterPage();
            }}
            className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isDark 
                ? 'bg-white/5 border-white/10 text-blue-300 hover:text-white hover:bg-white/10' 
                : 'bg-slate-100 border-slate-300 text-blue-700 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>إنشاء حساب جديد (مقاول / عميل / استشاري)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
