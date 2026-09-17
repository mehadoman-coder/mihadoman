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
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MihadLogo } from './MihadLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess?: () => void;
  onOpenRegisterPage?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
  onOpenRegisterPage
}) => {
  const { authenticateWithCredentials, signInWithGoogle } = useAuth();

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
        if (res.role === 'admin' && onAdminLoginSuccess) {
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
        if (result.role === 'admin' && onAdminLoginSuccess) {
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
      <div className="glass-card max-w-md w-full rounded-3xl p-6 md:p-8 border border-slate-700/80 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          aria-label="إغلاق"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center">
            <MihadLogo variant="horizontal" size="md" inverted />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              تسجيل الدخول
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              أدخل بيانات حسابك للمتابعة والوصول إلى لوحة التحكم
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form - Clean Single Input Interface (No Role Selector on login) */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="أدخل اسم المستخدم أو البريد"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white border border-slate-700 text-sm focus:border-blue-500 transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl glass-input text-white border border-slate-700 text-sm focus:border-blue-500 transition-colors font-mono"
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
            className="w-full py-3 rounded-xl royal-gradient-btn text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-blue-600/30 transition-all mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Google Sign In */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-700/80 w-full" />
            <span className="bg-slate-900/90 px-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
              أو تسجيل سريع عبر
            </span>
            <div className="border-t border-slate-700/80 w-full" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle || isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-200 disabled:opacity-60"
          >
            {isLoadingGoogle ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            )}
            <span>الدخول السريع باستخدام حساب Google</span>
          </button>
        </div>

        {/* Switch to Detailed Registration Page */}
        <div className="pt-4 text-center border-t border-slate-800/80 space-y-2">
          <p className="text-xs text-slate-400">
            ليس لديك حساب بعد؟
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenRegisterPage) onOpenRegisterPage();
            }}
            className="w-full py-2.5 px-4 rounded-xl glass-icon-btn text-blue-300 hover:text-white hover:border-blue-500/50 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>إنشاء حساب جديد (مقاول / عميل / استشاري)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
