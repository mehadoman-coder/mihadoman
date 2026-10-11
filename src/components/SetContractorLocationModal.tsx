import React, { useState } from 'react';
import { 
  MapPin, 
  X, 
  CheckCircle2, 
  Crosshair, 
  Navigation, 
  Building2, 
  Sparkles, 
  AlertCircle,
  LocateFixed
} from 'lucide-react';
import { Contractor } from '../types';
import { useAuth } from '../context/AuthContext';
import { PRESET_LOCATIONS, getCoordinatesForLocationText } from '../lib/geoUtils';

interface SetContractorLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractors: Contractor[];
  onUpdateLocation: (contractorId: string, coordinates: { lat: number; lng: number }, locationText: string) => void;
  preselectedContractor?: Contractor | null;
}

export const SetContractorLocationModal: React.FC<SetContractorLocationModalProps> = ({
  isOpen,
  onClose,
  contractors,
  onUpdateLocation,
  preselectedContractor
}) => {
  const { user } = useAuth();
  
  // Choose default contractor
  const defaultContractor = preselectedContractor || 
    (user && user.role === 'contractor' 
      ? contractors.find(c => c.name === user.name || c.email === user.email) || contractors[0]
      : contractors[0]);

  const [selectedContractorId, setSelectedContractorId] = useState<string>(defaultContractor?.id || '');
  const [selectedCity, setSelectedCity] = useState<string>(defaultContractor?.location || 'مسقط');
  const [districtText, setDistrictText] = useState<string>('');
  const [lat, setLat] = useState<number>(defaultContractor?.coordinates?.lat || 23.6143);
  const [lng, setLng] = useState<number>(defaultContractor?.coordinates?.lng || 58.4559);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Set coordinates when a preset city is selected
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const coords = getCoordinatesForLocationText(cityName);
    setLat(coords.lat);
    setLng(coords.lng);
  };

  // Detect current GPS position for the office
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setToastMessage('خاصية تحديد المواقع الجغرافية غير مدعومة في متصفحك.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        setLat(Number(latitude.toFixed(6)));
        setLng(Number(longitude.toFixed(6)));
        setToastMessage(`تم التقاط إحداثيات GPS بنجاح (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setTimeout(() => setToastMessage(null), 3500);
      },
      (err) => {
        setIsDetectingGps(false);
        setToastMessage('تعذر جلب موقع GPS تلقائياً. يمكنك اختيار المدينة أو إدخال الإحداثيات يدوياً.');
        setTimeout(() => setToastMessage(null), 3500);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractorId) return;

    const fullLocationName = districtText.trim() 
      ? `${selectedCity} - ${districtText.trim()}`
      : selectedCity;

    onUpdateLocation(selectedContractorId, { lat, lng }, fullLocationName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl glass-card border border-white/20 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-blue-900/60 to-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-300">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>تحديد وتثبيت مقر الشركة على الخريطة</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  خاص بالمقاولين
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                ضع مقر شركتك أو مكتبك الهندسي ليظهر لجميع العملاء بدقة على الرادار الجغرافي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Message */}
        {toastMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-950/90 border border-blue-400/50 text-blue-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Select Contractor Company */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              اختر شركة المقاولات المراد تحديد موقعها:
            </label>
            <div className="relative">
              <select
                value={selectedContractorId}
                onChange={(e) => {
                  setSelectedContractorId(e.target.value);
                  const cont = contractors.find(c => c.id === e.target.value);
                  if (cont) {
                    if (cont.location) setSelectedCity(cont.location.split(' - ')[0] || cont.location);
                    if (cont.coordinates) {
                      setLat(cont.coordinates.lat);
                      setLng(cont.coordinates.lng);
                    }
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs border border-white/20 focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                {contractors.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.companyName} ({c.name}) - {c.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Preset Location in Oman & Gulf */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                المدينة أو المحافظة:
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs border border-white/20 focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={loc.name} className="bg-slate-900 text-white">
                    {loc.name}
                  </option>
                ))}
                <option value="صحار" className="bg-slate-900 text-white">صحار - شمال الباطنة</option>
                <option value="صلالة" className="bg-slate-900 text-white">صلالة - ظفار</option>
                <option value="نزوى" className="bg-slate-900 text-white">نزوى - الداخلية</option>
                <option value="صور" className="bg-slate-900 text-white">صور - جنوب الشرقية</option>
                <option value="بركاء" className="bg-slate-900 text-white">بركاء - جنوب الباطنة</option>
                <option value="الرياض" className="bg-slate-900 text-white">الرياض - المملكة العربية السعودية</option>
                <option value="دبي" className="bg-slate-900 text-white">دبي - الإمارات العربية المتحدة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                الحي / الشارع / المعلم القريب (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثال: مرتفعات المطار، قرب بنك مسقط"
                value={districtText}
                onChange={(e) => setDistrictText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs border border-white/20 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Coordinates & GPS Detection */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>إحداثيات الموقع الدقيقة (خط الطول والعرض):</span>
              </span>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingGps}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>{isDetectingGps ? 'جارِ الرصد...' : 'رصد موقع مكتبي عبر GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">خط العرض (Latitude):</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-white text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">خط الطول (Longitude):</span>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-white text-xs font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>
                سيظهر موقع شركتك فوراً للعملاء ضمن نتائج البحث والرادار الجغرافي وحساب المسافات.
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>تثبيت الموقع على الخريطة الآن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
