import React, { useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Review, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'contractor' | 'consultant';
  targetTitle: string; // Company Name or Office Name
  targetAvatar?: string;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
  targetAvatar,
  reviews,
  onAddReview
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!user) {
      setValidationError('يرجى تسجيل الدخول أولاً للتمكن من إضافة تقييمك وتعليقك المعتمد.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setValidationError('يرجى كتابة تعليق مفصل يصف تجربتك (5 أحرف على الأقل).');
      return;
    }

    onAddReview({
      targetId,
      targetType,
      userName: user.name || 'عميل مسجل',
      userRole: user.role === 'client' ? 'صاحب مشروع / عميل' : user.role === 'contractor' ? 'مقاول زميل' : 'مكتب استشاري',
      userAvatar: user.avatarUrl,
      rating: rating,
      comment: comment.trim()
    });

    setComment('');
    setSubmittedMessage('شكراً لك! تم نشر تقييمك وتجربتك بنجاح لتعزيز الشفافية والموثوقية.');
    setTimeout(() => {
      setSubmittedMessage(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-2xl w-full rounded-3xl p-5 sm:p-7 border border-slate-700/80 shadow-2xl max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            {targetAvatar ? (
              <img 
                src={targetAvatar} 
                alt={targetTitle} 
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/40 shadow"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center text-blue-300 font-bold">
                {targetTitle.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-[220px] sm:max-w-xs">
                  {targetTitle}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {targetType === 'contractor' ? 'مقاول معتمد' : 'مكتب استشاري'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="mr-1 font-bold text-white">{avgRating}</span>
                </div>
                <span>•</span>
                <span>{reviews.length} تقييم وتعليق موثق</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Reviews List & New Review Form */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 pl-1">
          {/* New Review Submission Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>أضف تقييمك وتجربتك المهنية</span>
              </span>
              {user ? (
                <span className="text-[11px] text-slate-400">
                  مشارك باسم: <span className="text-white font-medium">{user.name}</span>
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>يتطلب تسجيل الدخول</span>
                </span>
              )}
            </div>

            {submittedMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submittedMessage}</span>
              </div>
            )}

            {validationError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Star Rating Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">التقييم العام:</span>
                <div className="flex items-center gap-1" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-300 mr-2">
                  {rating === 5 ? 'ممتاز جداً (5/5)' : rating === 4 ? 'جيد جداً (4/5)' : rating === 3 ? 'جيد (3/5)' : rating === 2 ? 'مقبول (2/5)' : 'سيء (1/5)'}
                </span>
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={user ? "صف جودة التنفيذ، الالتزام بالجدول الزمني، التعامل، والمطابقة للمواصفات..." : "يرجى تسجيل الدخول أولاً للمشاركة بالتقييم..."}
                  disabled={!user}
                  className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!user || !comment.trim()}
                  className="px-4 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                  <span>نشر التقييم المعتمد</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Previous Reviews */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>آراء وتجارب العملاء السابقة ({reviews.length})</span>
            </h4>

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                لا توجد تقييمات سابقة بعد. كن أول من يقيّم تجربته مع هذا المكتب/الشركة!
              </div>
            ) : (
              reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.userAvatar ? (
                        <img 
                          src={rev.userAvatar} 
                          alt={rev.userName} 
                          className="w-7 h-7 rounded-full object-cover border border-slate-700" 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-900/40 text-blue-300 border border-blue-800/50 flex items-center justify-center text-xs font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{rev.userName}</span>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            <span>موثق</span>
                          </span>
                        </div>
                        {rev.userRole && (
                          <span className="text-[10px] text-slate-400 block">{rev.userRole}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white">{rev.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed pr-2 pl-2">
                    {rev.comment}
                  </p>

                  <div className="text-[10px] text-slate-500 text-left pt-1">
                    {rev.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
