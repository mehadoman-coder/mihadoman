import React, { useState } from 'react';
import { 
  FileText, 
  MapPin, 
  Plus, 
  Clock, 
  Coins, 
  Send, 
  Building, 
  User, 
  AlertCircle, 
  Sparkles, 
  Phone, 
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { GlassIcon } from './GlassIcon';
import { Advertisement } from '../types';

interface AdsBoardProps {
  ads: Advertisement[];
  onAddAd: (newAd: Partial<Advertisement>) => void;
  onApplyBid?: (ad: Advertisement) => void;
}

export const AdsBoard: React.FC<AdsBoardProps> = ({
  ads,
  onAddAd,
  onApplyBid
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAdDetail, setSelectedAdDetail] = useState<Advertisement | null>(null);

  // Form State for new project Ad
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'residential' | 'commercial' | 'industrial' | 'renovation' | 'tender'>('residential');
  const [location, setLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [projectArea, setProjectArea] = useState<number>(500);
  const [authorName, setAuthorName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const categories = [
    { id: 'all', label: 'كافة الإعلانات والمناقصات' },
    { id: 'residential', label: 'مشاريع وفلل سكنية' },
    { id: 'commercial', label: 'مشاريع تجارية وأبراج' },
    { id: 'renovation', label: 'ترميم وإعادة تأهيل' },
    { id: 'tender', label: 'مناقصات مقاولي باطن' }
  ];

  // Deduplicate ads to guarantee unique items and keys
  const uniqueAds = React.useMemo(() => {
    const seen = new Set<string>();
    return ads.filter((ad) => {
      if (!ad || !ad.id || seen.has(ad.id)) return false;
      seen.add(ad.id);
      return true;
    });
  }, [ads]);

  const filteredAds = uniqueAds.filter((ad) => {
    return selectedCategory === 'all' || ad.category === selectedCategory;
  });

  const handleSubmitNewAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !contactPhone) return;

    onAddAd({
      title,
      description,
      category,
      location: location || 'الرياض',
      budgetRange: budgetRange || 'يحدد لاحقاً بناء على العروض',
      projectArea: Number(projectArea) || 400,
      authorName: authorName || 'صاحب المشروع',
      authorType: 'client',
      contactPhone,
      status: 'active',
      urgency: 'high',
      featured: false,
      bidsCount: 0
    });

    // Reset
    setTitle('');
    setDescription('');
    setLocation('');
    setBudgetRange('');
    setAuthorName('');
    setContactPhone('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header with Call to Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-icon-badge text-blue-200 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5 text-blue-300" />
            <span>لوحة الإعلانات والمناقصات المباشرة</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold silver-gradient-text">
            لوحة مشاريع البناء والمناقصات المفتوحة
          </h2>
          <p className="text-sm text-slate-400">
            اطرح مشروعك الخاص لتلقي عروض الأسعار من المقاولين والاستشاريين، أو تقدم لتنفيذ المشاريع المطروحة
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="self-start md:self-auto px-5 py-3 rounded-xl royal-gradient-btn text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-900/30"
        >
          <Plus className="w-5 h-5" />
          <span>نشر إعلان / طلب مقاول أو استشاري</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Ads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAds.map((ad, idx) => (
          <div
            key={`ad-card-${ad.id}-${idx}`}
            className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-700/70 flex flex-col justify-between space-y-4 relative group"
          >
            <div className="space-y-3">
              {/* Badges row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300">
                  {ad.category === 'residential' ? 'سكني' : ad.category === 'commercial' ? 'تجاري' : ad.category === 'tender' ? 'مناقصة' : 'ترميم'}
                </span>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>نشط الآن</span>
                  {ad.bidsCount !== undefined && (
                    <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded text-[11px]">
                      {ad.bidsCount} عروض مقدمة
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base md:text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                {ad.title}
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed line-clamp-3">
                {ad.description}
              </p>

              {/* Meta information tags */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">الموقع</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate">{ad.location}</span>
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">الميزانية التقديرية</span>
                  <span className="font-semibold text-amber-300 truncate block">{ad.budgetRange}</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">مسطح البناء</span>
                  <span className="font-semibold text-white">{ad.projectArea} م²</span>
                </div>
              </div>
            </div>

            {/* Footer author & actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-xs text-blue-200 font-bold">
                  {ad.authorName.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{ad.authorName}</span>
                  <span className="text-[10px] text-slate-400">صاحب الإعلان</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdDetail(ad)}
                  className="px-3 py-2 rounded-xl silver-btn text-xs font-bold cursor-pointer"
                >
                  التفاصيل
                </button>
                <a
                  href={`tel:${ad.contactPhone}`}
                  className="px-3.5 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>تواصل</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedAdDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 border border-slate-600 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs text-blue-300 font-bold block mb-1">تفاصيل طلب المشروع الكاملة</span>
                <h3 className="text-lg font-bold text-white">{selectedAdDetail.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <p className="leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                {selectedAdDetail.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">المدينة والحي</span>
                  <span className="font-bold text-white">{selectedAdDetail.location}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">الميزانية المستهدفة</span>
                  <span className="font-bold text-amber-300">{selectedAdDetail.budgetRange}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">مسطح البناء</span>
                  <span className="font-bold text-white">{selectedAdDetail.projectArea} متر مربع</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">رقم الاتصال المباشر</span>
                  <span className="font-bold text-blue-300 font-mono">{selectedAdDetail.contactPhone}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <a
                href={`tel:${selectedAdDetail.contactPhone}`}
                className="flex-1 py-2.5 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                <Phone className="w-4 h-4" />
                <span>الاتصال بصاحب الإعلان</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedAdDetail(null)}
                className="px-4 py-2.5 rounded-xl silver-btn text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Ad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-2xl w-full rounded-2xl p-6 md:p-8 border border-slate-600 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <GlassIcon icon={Plus} size="md" variant="royal" />
                <div>
                  <h3 className="text-lg font-bold text-white">نشر إعلان أو طلب مقاول / استشاري جديد</h3>
                  <p className="text-xs text-slate-400">سيتم نشره مباشرة في لوحة المشاريع وتحديثه فورياً لجميع المقاولين والاستشاريين</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewAd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">عنوان الإعلان أو المشروع *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طلب مقاول لتنفيذ فيلا عظم وتشطيب بحي الملقا"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">نوع المشروع</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-sm border border-slate-700"
                  >
                    <option value="residential" className="bg-slate-900">فيلا أو مشروع سكني</option>
                    <option value="commercial" className="bg-slate-900">مبنى أو مجمع تجاري</option>
                    <option value="renovation" className="bg-slate-900">أعمال ترميم وديكور</option>
                    <option value="tender" className="bg-slate-900">مناقصة مقاولات باطن</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الموقع / الحي والمدينة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مسقط - السيب أو الرياض أو دبي"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الميزانية التقديرية أو نطاق السعر</label>
                  <input
                    type="text"
                    placeholder="مثال: 95,000 - 130,000 ر.ع."
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm border border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">مسطح البناء التقريبي (م²)</label>
                  <input
                    type="number"
                    value={projectArea}
                    onChange={(e) => setProjectArea(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">تفاصيل ومواصفات المشروع والشروط *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اشرح نطاق العمل، حالة التراخيص والمخططات، والمواصفات المطلوبة لتسهيل تقديم العروض..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm border border-slate-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">اسمك أو اسم المؤسسة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: م. فهد الشمري"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm border border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">رقم الهاتف أو الواتساب للتواصل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 0501234567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm border border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl silver-btn text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>نشر الإعلان فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
