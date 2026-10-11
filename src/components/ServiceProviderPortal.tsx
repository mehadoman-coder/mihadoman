import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  LocateFixed, 
  Navigation, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  Save, 
  MessageSquare, 
  Eye, 
  Award, 
  DollarSign, 
  TrendingUp,
  Layers,
  Compass,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Contractor, Consultant } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { PRESET_LOCATIONS, getCoordinatesForLocationText } from '../lib/geoUtils';
import { ContractorsMapView } from './ContractorsMapView';

interface ServiceProviderPortalProps {
  contractors: Contractor[];
  consultants: Consultant[];
  onUpdateLocation: (contractorId: string, coordinates: { lat: number; lng: number }, locationText: string) => void;
  onOpenChatWithProvider?: (provider: any) => void;
}

export const ServiceProviderPortal: React.FC<ServiceProviderPortalProps> = ({
  contractors,
  consultants,
  onUpdateLocation,
  onOpenChatWithProvider
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // Find matching contractor or pick first
  const myContractor = contractors.find(
    c => (user && (c.name === user.name || c.email === user.email || c.companyName === user.companyName))
  ) || contractors[0];

  const [selectedContractorId, setSelectedContractorId] = useState<string>(myContractor?.id || contractors[0]?.id || '');
  const activeContractor = contractors.find(c => c.id === selectedContractorId) || myContractor;

  // Location Form state
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>(
    activeContractor?.location?.split('،')[0]?.split('-')[0]?.trim() || 'مسقط'
  );
  const [districtText, setDistrictText] = useState<string>(
    activeContractor?.location?.includes('،') 
      ? activeContractor.location.split('،')[1]?.trim() 
      : activeContractor?.location?.includes('-') 
        ? activeContractor.location.split('-')[1]?.trim() 
        : 'الخوير'
  );
  const [lat, setLat] = useState<number>(activeContractor?.coordinates?.lat || 23.6143);
  const [lng, setLng] = useState<number>(activeContractor?.coordinates?.lng || 58.4559);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync state when selecting different contractor
  const handleSelectContractor = (id: string) => {
    setSelectedContractorId(id);
    const found = contractors.find(c => c.id === id);
    if (found) {
      if (found.coordinates) {
        setLat(found.coordinates.lat);
        setLng(found.coordinates.lng);
      }
      setSelectedGovernorate(found.location.split('،')[0]?.trim() || 'مسقط');
    }
  };

  // Preset location handler
  const handleGovernorateChange = (govName: string) => {
    setSelectedGovernorate(govName);
    const coords = getCoordinatesForLocationText(govName);
    setLat(coords.lat);
    setLng(coords.lng);
  };

  // GPS Auto-detect
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد المواقع GPS غير مدعومة في متصفحك.');
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        setLat(Number(latitude.toFixed(6)));
        setLng(Number(longitude.toFixed(6)));
        setSaveSuccessMsg(`تم التقاط إحداثيات موقع مقر الشركة بنجاح عبر GPS: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      },
      (err) => {
        setIsGpsLoading(false);
        alert('تعذر الوصول إلى GPS. يمكنك اختيار المدينة وإدخال الإحداثيات يدوياً.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Submit Location Update
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContractor) return;

    const fullLocationText = districtText.trim() 
      ? `${selectedGovernorate}، ${districtText.trim()}`
      : selectedGovernorate;

    onUpdateLocation(activeContractor.id, { lat, lng }, fullLocationText);
    setSaveSuccessMsg(`تم تثبيت موقع مقر شركة "${activeContractor.companyName}" بنجاح على الخريطة والرادار!`);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Portal Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-r from-[#0c244d] via-[#091b38] to-[#06142e] border-white/20 text-white' 
          : 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border-slate-700 text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
              <Building2 className="w-4 h-4" />
              <span>{t('provider.portalTitle', 'بوابة مقدّمي الخدمات (المقاولون والاستشاريون)')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              لوحة إعدادات وتحديد مواقع الشركات والمقاولين
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
              {t('provider.portalSubtitle', 'إدارة بيانات المنشأة وتحديد موقع المقر على خريطة سلطنة عُمان ورادار المنصة الجغرافي ليظهر للعملاء القريبين')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right">
              <span className="block text-[11px] text-blue-200">الشركات المسجلة</span>
              <span className="text-2xl font-black text-white">{contractors.length} مقاول</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-right">
              <span className="block text-[11px] text-emerald-300">نظام الرادار</span>
              <span className="text-xs font-black text-emerald-200 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                تثبيت حي مباشر
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-sm font-bold flex items-center gap-3 shadow-xl animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Location Setting Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Edit Location */}
        <div className={`lg:col-span-6 rounded-3xl p-6 sm:p-7 border shadow-xl space-y-6 ${
          isDark ? 'bg-[#081836] border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="border-b pb-4 flex items-center justify-between gap-3 border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black">
                  {t('provider.locationSection', 'تحديد وتعديل موقع مقر المقاول على الخريطة الجغرافية')}
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('provider.onlyProvidersNotice', 'ملاحظة: هذا التعديل خاص فقط بصفحة مقدم الخدمة لتحديد مقره على الخريطة')}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveLocation} className="space-y-5">
            {/* Choose Contractor to modify */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                اختر شركة المقاولات أو المكتب المراد تحديث موقعه:
              </label>
              <select
                value={selectedContractorId}
                onChange={(e) => handleSelectContractor(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border font-semibold focus:outline-none transition-all ${
                  isDark 
                    ? 'bg-[#050f24] border-white/20 text-white focus:border-blue-400' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              >
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.location}) - {c.classificationGrade}
                  </option>
                ))}
              </select>
            </div>

            {/* Current details preview */}
            {activeContractor && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isDark ? 'bg-blue-950/30 border-blue-500/30' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400">الاسم والمسؤول:</span>
                  <span className="font-semibold">{activeContractor.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400">الموقع الحالي:</span>
                  <span className="font-bold text-amber-400">{activeContractor.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400">الإحداثيات الحالية:</span>
                  <span className="font-mono">{activeContractor.coordinates?.lat.toFixed(4)}, {activeContractor.coordinates?.lng.toFixed(4)}</span>
                </div>
              </div>
            )}

            {/* Step 1: Choose City / Governorate */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                1. المحافظة أو المدينة الرئيسية في سلطنة عُمان:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Object.keys(PRESET_LOCATIONS).map((cityName) => (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => handleGovernorateChange(cityName)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border text-center ${
                      selectedGovernorate === cityName
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : isDark 
                          ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cityName}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: District or Street */}
            <div>
              <label className="block text-xs font-bold mb-1.5">
                2. الحي أو المنطقة التفصيلية (مثال: شاطئ القرم، مرتفعات بوشر، المعبيلة، صحار الصناعية):
              </label>
              <input
                type="text"
                value={districtText}
                onChange={(e) => setDistrictText(e.target.value)}
                placeholder="أدخل اسم الحي أو الشارع..."
                className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none transition-all ${
                  isDark 
                    ? 'bg-[#050f24] border-white/20 text-white placeholder-slate-400 focus:border-blue-400' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-600'
                }`}
              />
            </div>

            {/* Step 3: Exact GPS coordinates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold">
                  3. إحداثيات خط العرض والطول (GPS Lat / Lng):
                </label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isGpsLoading}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>{isGpsLoading ? 'جاري الالتقاط...' : 'التقاط GPS مقري الآن'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">خط العرض (Latitude):</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border font-mono ${
                      isDark ? 'bg-[#050f24] border-white/20 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">خط الطول (Longitude):</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border font-mono ${
                      isDark ? 'bg-[#050f24] border-white/20 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ وتثبيت موقع المقاول على خريطة ورادار المنصة</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview: Live Radar & Map Verification */}
        <div className={`lg:col-span-6 rounded-3xl p-6 sm:p-7 border shadow-xl flex flex-col justify-between ${
          isDark ? 'bg-[#081836] border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4 border-white/10">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">معاينة رادار التغطية الجغرافية المباشر</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                تحديث لحظي
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              isDark ? 'bg-[#040c1e] border-white/10 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}>
              <p>
                <strong>كيف يستفيد عملاء المنصة؟</strong> عندما يحدد مقدم الخدمة موقعه الجغرافي هنا، ترتب خوارزمية مِهاد قائمة المقاولين للعميل حسب <strong>الأقرب مسافة بالكيلومتر</strong>، مما يزيد من فرص حصول شركتك على استفسارات وعقود مشاريع في نطاقك الجغرافي.
              </p>
            </div>

            {/* Target Contractor Card Mini Preview */}
            {activeContractor && (
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                isDark ? 'bg-white/5 border-white/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-cover bg-center shrink-0 border border-white/20 shadow-md"
                  style={{ backgroundImage: `url(${activeContractor.avatarUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=200&auto=format&fit=crop&q=80'})` }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{activeContractor.companyName}</h4>
                  <p className="text-xs text-blue-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{districtText ? `${selectedGovernorate}، ${districtText}` : selectedGovernorate}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    GPS: ({lat.toFixed(4)}, {lng.toFixed(4)})
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 text-center">
            <span className="text-xs text-slate-400">
              جميع التحديثات تُحفظ فورياً وتنعكس على رادار الخريطة لكافة العملاء والزوار.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
