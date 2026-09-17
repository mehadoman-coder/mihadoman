import React, { useState } from 'react';
import { 
  Shield, 
  Trash2, 
  Plus, 
  CheckCircle, 
  HardHat, 
  Compass, 
  FileText, 
  Users, 
  TrendingUp, 
  Settings, 
  Database,
  Search,
  ExternalLink,
  Edit,
  Sparkles,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { GlassIcon } from './GlassIcon';
import { Contractor, Consultant, Advertisement } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface AdminPanelProps {
  contractors: Contractor[];
  consultants: Consultant[];
  ads: Advertisement[];
  onDeleteContractor: (id: string) => void;
  onAddContractor: (c: Partial<Contractor>) => void;
  onDeleteConsultant: (id: string) => void;
  onAddConsultant: (c: Partial<Consultant>) => void;
  onDeleteAd: (id: string) => void;
  onAddAd: (ad: Partial<Advertisement>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  contractors,
  consultants,
  ads,
  onDeleteContractor,
  onAddContractor,
  onDeleteConsultant,
  onAddConsultant,
  onDeleteAd,
  onAddAd
}) => {
  const { formatPrice, currentCurrencyConfig } = useCurrency();
  const [activeTab, setActiveTab] = useState<'ads' | 'contractors' | 'consultants'>('ads');
  
  // Modals
  const [showAddContractorModal, setShowAddContractorModal] = useState(false);
  const [showAddConsultantModal, setShowAddConsultantModal] = useState(false);
  const [showAddAdModal, setShowAddAdModal] = useState(false);

  // New Contractor Form
  const [cName, setCName] = useState('');
  const [cCompanyName, setCCompanyName] = useState('');
  const [cCategory, setCCategory] = useState<'residential' | 'commercial' | 'finishing' | 'infrastructure'>('residential');
  const [cPhone, setCPhone] = useState('');
  const [cLocation, setCLocation] = useState('');
  const [cPrice, setCPrice] = useState(140);
  const [cLicense, setCLicense] = useState('');
  const [cServices, setCServices] = useState('بناء عظم بالمواد، تشطيب ديلوكس، تسليم مفتاح');
  const [cBio, setCBio] = useState('');

  // New Consultant Form
  const [consName, setConsName] = useState('');
  const [consOffice, setConsOffice] = useState('');
  const [consSpecialty, setConsSpecialty] = useState<'architectural' | 'structural' | 'cost_control'>('architectural');
  const [consPhone, setConsPhone] = useState('');
  const [consLocation, setConsLocation] = useState('');
  const [consFee, setConsFee] = useState(45);
  const [consAccreditation, setConsAccreditation] = useState('مكتب هندسي استشاري معتمد - تصنيف أول');
  const [consBio, setConsBio] = useState('');

  // New Ad Form
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adCategory, setAdCategory] = useState<'residential' | 'commercial' | 'tender'>('residential');
  const [adLocation, setAdLocation] = useState('');
  const [adBudget, setAdBudget] = useState('95,000 ر.ع.');
  const [adArea, setAdArea] = useState(600);
  const [adPhone, setAdPhone] = useState('');
  const [adAuthor, setAdAuthor] = useState('إدارة المنصة');

  const handleCreateContractor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCompanyName || !cPhone) return;

    onAddContractor({
      name: cName || 'المدير التنفيذي',
      companyName: cCompanyName,
      category: cCategory,
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      featured: true,
      location: cLocation || 'الرياض',
      experienceYears: 10,
      completedProjectsCount: 20,
      bio: cBio || 'شركة مقاولات معتمدة متخصصة في تنفيذ المشاريع بأعلى جودة.',
      phone: cPhone,
      email: 'info@contractor.sa',
      services: cServices.split('،').map(s => s.trim()).filter(Boolean),
      startingPricePerMeter: Number(cPrice),
      licenseNumber: cLicense || `CR-${Date.now().toString().slice(-8)}`,
      classificationGrade: 'درجة أولى',
      avatarUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=500'
    });

    setCName('');
    setCCompanyName('');
    setCPhone('');
    setCBio('');
    setShowAddContractorModal(false);
  };

  const handleCreateConsultant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consOffice || !consPhone) return;

    onAddConsultant({
      name: consName || 'المهندس الاستشاري الرئيسي',
      officeName: consOffice,
      specialty: consSpecialty,
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      featured: true,
      location: consLocation || 'مسقط',
      experienceYears: 15,
      accreditedProjectsCount: 40,
      bio: consBio || 'مكتب استشارات هندسية معتمد لإعداد المخططات والتراخيص والإشراف الهندسي.',
      phone: consPhone,
      email: 'office@consult.om',
      services: ['مخططات معمارية وإنشائية', 'إباحات وتراخيص البناء', 'إشراف دوري'],
      consultationFeePerHour: Number(consFee),
      accreditationBody: consAccreditation,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500'
    });

    setConsName('');
    setConsOffice('');
    setConsPhone('');
    setConsBio('');
    setShowAddConsultantModal(false);
  };

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adDesc) return;

    onAddAd({
      title: adTitle,
      description: adDesc,
      category: adCategory,
      location: adLocation || 'مسقط',
      budgetRange: adBudget || '95,000 ر.ع.',
      projectArea: Number(adArea),
      authorName: adAuthor,
      authorType: 'platform',
      contactPhone: adPhone || '+968 9123 4567',
      status: 'active',
      urgency: 'high',
      featured: true,
      bidsCount: 0
    });

    setAdTitle('');
    setAdDesc('');
    setShowAddAdModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Admin Title Bar */}
      <div className="glass-card rounded-2xl p-6 md:p-8 border border-blue-500/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <GlassIcon icon={Shield} size="lg" variant="royal" glow />
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-400/40 text-blue-300 text-xs font-bold mb-1">
                <span>لوحة قيادة رئيس المنصة الحصرية</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                إدارة السوق والمقاولين والاستشاريين والإعلانات
              </h2>
              <p className="text-xs md:text-sm text-slate-300">
                تحكم كامل وفوري بإضافة وحذف وتعديل الإعلانات، ملفات المقاولين، والمكاتب الاستشارية مع الحفظ السحابي الفوري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40 font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>نظام البيانات السحابي متصل ومزامن</span>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('ads')}
          className={`glass-card p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'ads' ? 'border-blue-400 bg-blue-900/30 ring-1 ring-blue-400' : 'border-slate-700/60 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <GlassIcon icon={FileText} size="sm" variant="royal" />
            <span className="text-2xl font-black text-white">{ads.length}</span>
          </div>
          <span className="block text-xs text-slate-400 mt-2 font-bold">إعلانات المشاريع والمناقصات</span>
          <span className="text-[11px] text-blue-400">انقر للإدارة والحذف أو الإضافة</span>
        </div>

        <div 
          onClick={() => setActiveTab('contractors')}
          className={`glass-card p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'contractors' ? 'border-blue-400 bg-blue-900/30 ring-1 ring-blue-400' : 'border-slate-700/60 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <GlassIcon icon={HardHat} size="sm" variant="amber" />
            <span className="text-2xl font-black text-white">{contractors.length}</span>
          </div>
          <span className="block text-xs text-slate-400 mt-2 font-bold">شركات ومؤسسات المقاولين</span>
          <span className="text-[11px] text-amber-400">انقر لإدارة المقاولين</span>
        </div>

        <div 
          onClick={() => setActiveTab('consultants')}
          className={`glass-card p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'consultants' ? 'border-blue-400 bg-blue-900/30 ring-1 ring-blue-400' : 'border-slate-700/60 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <GlassIcon icon={Compass} size="sm" variant="silver" />
            <span className="text-2xl font-black text-white">{consultants.length}</span>
          </div>
          <span className="block text-xs text-slate-400 mt-2 font-bold">المكاتب الهندسية والاستشارية</span>
          <span className="text-[11px] text-slate-300">انقر لإدارة الاستشاريين</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ads' ? 'royal-gradient-btn text-white' : 'glass-icon-btn text-slate-300'
            }`}
          >
            إدارة الإعلانات ({ads.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contractors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'contractors' ? 'royal-gradient-btn text-white' : 'glass-icon-btn text-slate-300'
            }`}
          >
            إدارة المقاولين ({contractors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('consultants')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'consultants' ? 'royal-gradient-btn text-white' : 'glass-icon-btn text-slate-300'
            }`}
          >
            إدارة الاستشاريين ({consultants.length})
          </button>
        </div>

        <div>
          {activeTab === 'ads' && (
            <button
              type="button"
              onClick={() => setShowAddAdModal(true)}
              className="px-4 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إعلان كـ (رئيس المنصة)</span>
            </button>
          )}

          {activeTab === 'contractors' && (
            <button
              type="button"
              onClick={() => setShowAddContractorModal(true)}
              className="px-4 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مقاول جديد في المنصة</span>
            </button>
          )}

          {activeTab === 'consultants' && (
            <button
              type="button"
              onClick={() => setShowAddConsultantModal(true)}
              className="px-4 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل استشاري جديد في المنصة</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: ADS MANAGEMENT */}
      {activeTab === 'ads' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-700">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-300">
              <span>قائمة الإعلانات المطروحة في السوق</span>
              <span className="text-slate-400">إجمالي {ads.length} إعلان</span>
            </div>

            <div className="divide-y divide-slate-800">
              {ads.map((ad, idx) => (
                <div key={`admin-ad-${ad.id}-${idx}`} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-300 px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30">
                        {ad.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">{ad.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{ad.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>المعلن: <strong className="text-slate-200">{ad.authorName}</strong></span>
                      <span>الموقع: {ad.location}</span>
                      <span>الميزانية: <strong className="text-amber-300">{ad.budgetRange}</strong></span>
                      <span>الهاتف: <strong className="text-slate-200 font-mono">{ad.contactPhone}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف الإعلان "${ad.title}"؟`)) {
                          onDeleteAd(ad.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="حذف هذا الإعلان فورياً من قاعدة البيانات"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الإعلان</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRACTORS MANAGEMENT */}
      {activeTab === 'contractors' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-700">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-300">
              <span>قائمة المقاولين المسجلين في منصة مِهاد</span>
              <span className="text-slate-400">إجمالي {contractors.length} مقاول</span>
            </div>

            <div className="divide-y divide-slate-800">
              {contractors.map((c, idx) => (
                <div key={`admin-cont-${c.id}-${idx}`} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={c.avatarUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=100'}
                      alt={c.companyName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{c.companyName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-600/40 text-blue-300">
                          {c.classificationGrade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">المسؤول: {c.name} | السجل: {c.licenseNumber}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>الموقع: {c.location}</span>
                        <span>سعر المتر يبدأ: <strong className="text-white">{formatPrice(c.startingPricePerMeter)} / م²</strong></span>
                        <span>الهاتف: <strong className="text-slate-200 font-mono">{c.phone}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من رغبتك في حذف المقاول "${c.companyName}" من المنصة؟`)) {
                          onDeleteContractor(c.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="حذف هذا المقاول من المنصة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف المقاول</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONSULTANTS MANAGEMENT */}
      {activeTab === 'consultants' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-700">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-300">
              <span>قائمة المكاتب الاستشارية والهندسية</span>
              <span className="text-slate-400">إجمالي {consultants.length} استشاري</span>
            </div>

            <div className="divide-y divide-slate-800">
              {consultants.map((cons, idx) => (
                <div key={`admin-cons-${cons.id}-${idx}`} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={cons.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'}
                      alt={cons.officeName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{cons.officeName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-blue-300">
                          {cons.accreditationBody}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">المهندس: {cons.name} | الهاتف: {cons.phone}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>الموقع: {cons.location}</span>
                        <span>أجر الاستشارة: <strong className="text-white">{formatPrice(cons.consultationFeePerHour)} / ساعة</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف الاستشاري "${cons.officeName}"؟`)) {
                          onDeleteConsultant(cons.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="حذف هذا الاستشاري"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الاستشاري</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CONTRACTOR */}
      {showAddContractorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 border border-slate-600 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white">إضافة مقاول جديد من قبل رئيس المنصة</h3>
              <button
                type="button"
                onClick={() => setShowAddContractorModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >✕</button>
            </div>

            <form onSubmit={handleCreateContractor} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">اسم شركة المقاولات *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة صروح المملكة للإنشاءات"
                  value={cCompanyName}
                  onChange={(e) => setCCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">اسم المدير / المهندس المسؤول</label>
                  <input
                    type="text"
                    placeholder="م. خالد الحربي"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">التصنيف</label>
                  <select
                    value={cCategory}
                    onChange={(e) => setCCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  >
                    <option value="residential" className="bg-slate-900">فلل ومشاريع سكنية</option>
                    <option value="commercial" className="bg-slate-900">أبراج ومباني تجارية</option>
                    <option value="finishing" className="bg-slate-900">تشطيبات وديكورات</option>
                    <option value="infrastructure" className="bg-slate-900">بنية تحتية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">رقم الهاتف للتواصل *</label>
                  <input
                    type="text"
                    required
                    placeholder="+966 50 000 1122"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">المدينة والمقر</label>
                  <input
                    type="text"
                    placeholder="مسقط - السيب"
                    value={cLocation}
                    onChange={(e) => setCLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">سعر المتر المبدئي ({currentCurrencyConfig.symbol})</label>
                  <input
                    type="number"
                    value={cPrice}
                    onChange={(e) => setCPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">رقم السجل التجاري</label>
                  <input
                    type="text"
                    placeholder="CR-1010..."
                    value={cLicense}
                    onChange={(e) => setCLicense(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">الخدمات المقدمة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={cServices}
                  onChange={(e) => setCServices(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">نبذة عن الشركة</label>
                <textarea
                  rows={3}
                  value={cBio}
                  onChange={(e) => setCBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddContractorModal(false)}
                  className="px-3 py-2 rounded-xl silver-btn font-bold cursor-pointer"
                >إلغاء</button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl royal-gradient-btn text-white font-bold cursor-pointer"
                >حفظ المقاول في المنصة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CONSULTANT */}
      {showAddConsultantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 border border-slate-600 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white">إضافة مكتب استشاري جديد</h3>
              <button
                type="button"
                onClick={() => setShowAddConsultantModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >✕</button>
            </div>

            <form onSubmit={handleCreateConsultant} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">اسم المكتب الاستشاري الهندسي *</label>
                <input
                  type="text"
                  required
                  placeholder="دار الهندسة المعمارية الحديثة"
                  value={consOffice}
                  onChange={(e) => setConsOffice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">اسم المهندس المسؤول</label>
                  <input
                    type="text"
                    placeholder="د. مهندس راشد التميمي"
                    value={consName}
                    onChange={(e) => setConsName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">التخصص</label>
                  <select
                    value={consSpecialty}
                    onChange={(e) => setConsSpecialty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  >
                    <option value="architectural" className="bg-slate-900">معماري وتراخيص معتمدة</option>
                    <option value="structural" className="bg-slate-900">إنشائي ومواصفات قياسية</option>
                    <option value="cost_control" className="bg-slate-900">إدارة مشاريع وتكاليف</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="+968 9234 5678"
                    value={consPhone}
                    onChange={(e) => setConsPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">سعر الاستشارة / ساعة ({currentCurrencyConfig.symbol})</label>
                  <input
                    type="number"
                    value={consFee}
                    onChange={(e) => setConsFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">الاعتماد المهني</label>
                <input
                  type="text"
                  value={consAccreditation}
                  onChange={(e) => setConsAccreditation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">نبذة عن المكتب</label>
                <textarea
                  rows={3}
                  value={consBio}
                  onChange={(e) => setConsBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddConsultantModal(false)}
                  className="px-3 py-2 rounded-xl silver-btn font-bold cursor-pointer"
                >إلغاء</button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl royal-gradient-btn text-white font-bold cursor-pointer"
                >حفظ الاستشاري في المنصة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD AD (ADMIN) */}
      {showAddAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 border border-slate-600 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white">نشر إعلان رسمي باسم رئيس المنصة</h3>
              <button
                type="button"
                onClick={() => setShowAddAdModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >✕</button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">عنوان الإعلان *</label>
                <input
                  type="text"
                  required
                  placeholder="طرح مناقصة عامة لبناء..."
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">نص وتفاصيل الإعلان *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="تفاصيل المشروع والشروط المطلوبة..."
                  value={adDesc}
                  onChange={(e) => setAdDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">الموقع</label>
                  <input
                    type="text"
                    placeholder="مسقط - الخوض"
                    value={adLocation}
                    onChange={(e) => setAdLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">الميزانية</label>
                  <input
                    type="text"
                    placeholder="90,000 ر.ع."
                    value={adBudget}
                    onChange={(e) => setAdBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAdModal(false)}
                  className="px-3 py-2 rounded-xl silver-btn font-bold cursor-pointer"
                >إلغاء</button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl royal-gradient-btn text-white font-bold cursor-pointer"
                >نشر الإعلان الآن</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
