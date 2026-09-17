import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Filter,
  Award,
  Calendar,
  Layers,
  HardHat,
  ChevronRight,
  MessageSquare,
  Crosshair,
  Compass,
  Navigation,
  Map as MapIcon,
  LayoutGrid,
  SlidersHorizontal,
  LocateFixed,
  AlertCircle
} from 'lucide-react';
import { GlassIcon } from './GlassIcon';
import { Contractor } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { 
  PRESET_LOCATIONS, 
  calculateDistanceKm, 
  formatDistance, 
  getCoordinatesForLocationText,
  getGoogleMapsDirectionsUrl 
} from '../lib/geoUtils';
import { ContractorsMapView } from './ContractorsMapView';

interface ContractorsListProps {
  contractors: Contractor[];
  onSelectContractor?: (contractor: Contractor) => void;
  onRequestQuote?: (contractor: Contractor) => void;
}

export const ContractorsList: React.FC<ContractorsListProps> = ({
  contractors,
  onSelectContractor,
  onRequestQuote
}) => {
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedContractorDetail, setSelectedContractorDetail] = useState<Contractor | null>(null);

  // Client Location & Proximity State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string } | null>({
    lat: 23.6143,
    lng: 58.5453,
    name: 'مسقط - شاطئ القرم'
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'nearby' | 'rating' | 'price' | 'experience'>('nearby');

  const categories = [
    { id: 'all', label: 'كافة المقاولين' },
    { id: 'residential', label: 'فلل ومجمعات سكنية' },
    { id: 'commercial', label: 'أبراج ومباني تجارية' },
    { id: 'finishing', label: 'تشطيبات وديكورات فاخرة' },
    { id: 'infrastructure', label: 'بنية تحتية وتسوية أراضي' }
  ];

  // Auto GPS Location Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationToast('خاصية تحديد المواقع الجغرافية غير مدعومة في متصفحك. يرجى اختيار منطقتك يدوياً.');
      setTimeout(() => setLocationToast(null), 4000);
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = position.coords;
        
        // Find closest preset name for nice display
        let closest = PRESET_LOCATIONS[0];
        let minD = 999999;
        for (const loc of PRESET_LOCATIONS) {
          const d = calculateDistanceKm(latitude, longitude, loc.lat, loc.lng);
          if (d < minD) {
            minD = d;
            closest = loc;
          }
        }
        
        const detectedName = minD < 20 
          ? `بالقرب من ${closest.name}` 
          : `موقعي الجغرافي (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;

        setUserLocation({
          lat: latitude,
          lng: longitude,
          name: detectedName
        });
        setSortBy('nearby');
        setLocationToast(`تم تحديد موقعك بدقة: ${detectedName}`);
        setTimeout(() => setLocationToast(null), 4500);
      },
      (error) => {
        setIsDetectingLocation(false);
        console.warn('Geolocation error:', error);
        // Fallback gracefully to first preset
        setUserLocation(PRESET_LOCATIONS[0]);
        setSortBy('nearby');
        setLocationToast('تم تعيين موقعك تلقائياً إلى "مسقط - شاطئ القرم". يمكنك تغييره يدوياً من القائمة.');
        setTimeout(() => setLocationToast(null), 4500);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Compute distances for all contractors
  const contractorsWithDistance = useMemo(() => {
    return contractors.map((c) => {
      const coords = c.coordinates || getCoordinatesForLocationText(c.location);
      let distanceKm: number | undefined = undefined;
      if (userLocation) {
        distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
      }
      return {
        ...c,
        coordinates: coords,
        distanceKm
      };
    });
  }, [contractors, userLocation]);

  // Filter and Sort Contractors
  const filteredAndSortedContractors = useMemo(() => {
    const list = contractorsWithDistance.filter((c) => {
      const matchQuery = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchCity = selectedCity === 'all' || c.location.includes(selectedCity);
      const matchRadius = selectedRadiusKm === 0 || (c.distanceKm !== undefined && c.distanceKm <= selectedRadiusKm);

      return matchQuery && matchCategory && matchCity && matchRadius;
    });

    return list.sort((a, b) => {
      if (sortBy === 'nearby') {
        const distA = a.distanceKm ?? 99999;
        const distB = b.distanceKm ?? 99999;
        return distA - distB;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'price') {
        return a.startingPricePerMeter - b.startingPricePerMeter;
      }
      if (sortBy === 'experience') {
        return b.experienceYears - a.experienceYears;
      }
      return 0;
    });
  }, [contractorsWithDistance, searchTerm, selectedCategory, selectedCity, selectedRadiusKm, sortBy]);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {locationToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-950/95 text-emerald-200 border border-emerald-500/50 shadow-2xl flex items-center gap-2.5 text-xs md:text-sm font-bold backdrop-blur-md animate-fade-in">
          <Crosshair className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{locationToast}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-icon-badge text-blue-200 text-xs font-semibold mb-2">
            <HardHat className="w-3.5 h-3.5 text-blue-300" />
            <span>نخبة المقاولين المعتمدين والمصنفين</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold silver-gradient-text">
            سوق شركات ومؤسسات المقاولات
          </h2>
          <p className="text-sm text-slate-400">
            استعرض المقاولين الأقرب جغرافياً إلى موقع مشروعك مع حساب دقيق للمسافة وسابقة الأعمال والأسعار
          </p>
        </div>

        {/* View Switcher & Total Count */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Grid vs Map Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700 shadow-md">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>عرض البطاقات</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>الخريطة والرادار الجغرافي</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card text-xs text-slate-300 border border-slate-700/60">
            <Award className="w-4 h-4 text-amber-400" />
            <span>المقاولون:</span>
            <span className="font-bold text-white text-sm">{filteredAndSortedContractors.length}</span>
          </div>
        </div>
      </div>

      {/* Proximity & Nearby Bar (Client Location Hub) */}
      <div className="glass-card rounded-2xl p-4 md:p-5 border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900/70 to-slate-900/50 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Location Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">موقع مشروعك الحالي:</span>
                <span className="text-sm font-black text-white bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                  {userLocation ? userLocation.name : 'لم يتم التحديد'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                يتم حساب المسافة بالكيلومترات وترتيب المقاولين تلقائياً حسب الأقرب جغرافياً إليك
              </p>
            </div>
          </div>

          {/* Quick Location Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* GPS Detection Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="px-3.5 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
              title="جلب موقعي الجغرافي عبر إحداثيات GPS بالمتصفح"
            >
              <LocateFixed className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'جارِ رصد GPS...' : 'تحديد موقعي التلقائي (GPS)'}</span>
            </button>

            {/* Manual Preset Location Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">أو اختر منطقتك:</span>
              <select
                value={userLocation?.name || ''}
                onChange={(e) => {
                  const found = PRESET_LOCATIONS.find(loc => loc.name === e.target.value);
                  if (found) {
                    setUserLocation(found);
                    setSortBy('nearby');
                    setLocationToast(`تم تعيين موقعك إلى: ${found.name}`);
                    setTimeout(() => setLocationToast(null), 3000);
                  }
                }}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={loc.name} className="bg-slate-900 text-white">
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Distance Radius Quick Filters */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>نطاق المسافة:</span>
            </span>

            {[
              { id: 0, label: 'كافة المسافات' },
              { id: 15, label: 'ضمن 15 كم (الأقرب)' },
              { id: 30, label: 'ضمن 30 كم' },
              { id: 50, label: 'ضمن 50 كم' },
              { id: 100, label: 'ضمن 100 كم' },
            ].map((radius) => (
              <button
                key={radius.id}
                type="button"
                onClick={() => setSelectedRadiusKm(radius.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedRadiusKm === radius.id
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400 shadow-sm'
                    : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {radius.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400">ترتيب النتائج:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-white font-bold px-2.5 py-1.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="nearby">الأقرب مسافةً من موقعك 📍</option>
              <option value="rating">الأعلى تقييماً ⭐</option>
              <option value="price">الأقل سعراً للمتر 💰</option>
              <option value="experience">الأكثر خبرة بالمشاريع 🏆</option>
            </select>
          </div>
        </div>
      </div>

      {/* Standard Search and Categories Bar */}
      <div className="glass-card rounded-2xl p-4 md:p-5 space-y-4 border border-slate-700/60 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث باسم المقاول، الشركة، التخصص، أو الخدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl glass-input text-white placeholder-slate-500 text-sm border border-slate-700"
            />
          </div>

          {/* City filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-white border border-slate-700 text-sm"
            >
              <option value="all" className="bg-slate-900">جميع المدن والمحافظات</option>
              <option value="مسقط" className="bg-slate-900">مسقط (القرم / الخوير / بوشر)</option>
              <option value="السيب" className="bg-slate-900">السيب (الموج / الخوض / المعبيلة)</option>
              <option value="صلالة" className="bg-slate-900">صلالة ومحافظة ظفار</option>
              <option value="صحار" className="bg-slate-900">صحار وشمال الباطنة</option>
              <option value="نزوى" className="bg-slate-900">نزوى والداخلية</option>
              <option value="الرياض" className="bg-slate-900">الرياض</option>
              <option value="دبي" className="bg-slate-900">دبي والإمارات</option>
            </select>
          </div>

          {/* Reset filter button */}
          <div className="md:col-span-3 flex items-center justify-end">
            {(searchTerm || selectedCategory !== 'all' || selectedCity !== 'all' || selectedRadiusKm !== 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedCity('all');
                  setSelectedRadiusKm(0);
                  setSortBy('nearby');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                إعادة ضبط كافة الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400'
                  : 'bg-slate-900/50 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map View Mode */}
      {viewMode === 'map' ? (
        <ContractorsMapView
          contractors={filteredAndSortedContractors}
          userLocation={userLocation}
          onSelectContractor={onSelectContractor}
          onRequestQuote={onRequestQuote}
          onDetectLocation={handleDetectLocation}
          isDetectingLocation={isDetectingLocation}
          selectedRadiusKm={selectedRadiusKm}
          onSelectRadiusKm={setSelectedRadiusKm}
        />
      ) : (
        /* Grid of Contractors Mode */
        <div>
          {filteredAndSortedContractors.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <GlassIcon icon={Building2} size="lg" variant="royal" className="mx-auto" />
              <h3 className="text-lg font-bold text-white">لم نجد مقاولين يطابقون معايير البحث أو النطاق الجغرافي المحدد</h3>
              <p className="text-sm text-slate-400">جرب توسيع نطاق المسافة (مثلاً: كافة المسافات) أو تغيير المدينة</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedRadiusKm(0);
                  setSelectedCity('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 rounded-xl silver-btn text-xs font-bold cursor-pointer inline-block mt-2"
              >
                عرض كافة المقاولين دون قيود
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedContractors.map((contractor, idx) => {
                const isVeryClose = (contractor.distanceKm ?? 999) < 20;

                return (
                  <div
                    key={`contractor-${contractor.id}-${idx}`}
                    className={`glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border relative group ${
                      isVeryClose
                        ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                        : 'border-slate-700/70'
                    }`}
                  >
                    {/* Card Top Information */}
                    <div className="p-5 space-y-4">
                      {/* Avatar, Company Name, Grade */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={contractor.avatarUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=150'}
                            alt={contractor.companyName}
                            className="w-13 h-13 rounded-xl object-cover border border-slate-600 shadow-md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                                {contractor.companyName}
                              </h3>
                              {contractor.verified && (
                                <span title="معتمد وموثق تجارياً">
                                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium">{contractor.name}</p>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold px-2 py-1 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 shrink-0">
                          {contractor.classificationGrade}
                        </span>
                      </div>

                      {/* Distance Badge & Location */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                        {contractor.distanceKm !== undefined ? (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${
                            isVeryClose
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                          }`}>
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>على بعد {formatDistance(contractor.distanceKm)} منك</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span>{contractor.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-amber-300">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-white">{contractor.rating}</span>
                          <span className="text-slate-400">({contractor.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Exact Area Location if distance badge is shown */}
                      {contractor.distanceKm !== undefined && (
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            <span>المقر: {contractor.location}</span>
                          </span>

                          {contractor.coordinates && (
                            <a
                              href={getGoogleMapsDirectionsUrl(
                                contractor.coordinates.lat,
                                contractor.coordinates.lng,
                                contractor.companyName
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                              title="فتح الاتجاهات عبر Google Maps"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>المسار</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Bio snippet */}
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {contractor.bio}
                      </p>

                      {/* Services Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {contractor.services.slice(0, 3).map((service, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300"
                          >
                            {service}
                          </span>
                        ))}
                        {contractor.services.length > 3 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                            +{contractor.services.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Experience & Projects count */}
                      <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                          <span className="block text-slate-400 text-[10px]">الخبرة المعتمدة</span>
                          <span className="font-bold text-white">{contractor.experienceYears} عام</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                          <span className="block text-slate-400 text-[10px]">مشاريع منجزة</span>
                          <span className="font-bold text-blue-300">{contractor.completedProjectsCount}+ مشروع</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer with Price & Actions */}
                    <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="block text-[10px] text-slate-400">يبدأ من</span>
                        <span className="text-sm font-extrabold text-white">
                          {formatPrice(contractor.startingPricePerMeter)} <span className="text-[10px] font-normal text-slate-400">/ م²</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedContractorDetail(contractor)}
                          className="p-2 rounded-lg glass-icon-btn text-slate-300 hover:text-white cursor-pointer"
                          title="التفاصيل وسابقة الأعمال"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onRequestQuote) onRequestQuote(contractor);
                          }}
                          className="px-3.5 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>تواصل واطلب عرض</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Contractor Modal Detail */}
      {selectedContractorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-card max-w-2xl w-full rounded-2xl p-6 md:p-8 border border-slate-600 max-h-[90vh] overflow-y-auto space-y-6 animate-scale-up">
            <div className="flex items-start justify-between border-b border-slate-700 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedContractorDetail.avatarUrl}
                  alt={selectedContractorDetail.companyName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedContractorDetail.companyName}</h3>
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{selectedContractorDetail.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">رقم السجل التجاري / الترخيص: {selectedContractorDetail.licenseNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContractorDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Proximity Distance in Modal */}
              {selectedContractorDetail.distanceKm !== undefined && (
                <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs text-slate-400 block">المسافة المقدرة من موقعك:</span>
                      <span className="text-sm font-bold text-white">
                        يبعد عن موقعك مسافة {formatDistance(selectedContractorDetail.distanceKm)} ({selectedContractorDetail.location})
                      </span>
                    </div>
                  </div>

                  {selectedContractorDetail.coordinates && (
                    <a
                      href={getGoogleMapsDirectionsUrl(
                        selectedContractorDetail.coordinates.lat,
                        selectedContractorDetail.coordinates.lng,
                        selectedContractorDetail.companyName
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>الاتجاهات عبر الخريطة</span>
                    </a>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-blue-300 mb-1.5">نبذة عن الشركة والخبرة</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedContractorDetail.bio}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-blue-300 mb-2">الخدمات المعتمدة</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedContractorDetail.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedContractorDetail.portfolioImages && selectedContractorDetail.portfolioImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-blue-300 mb-2">نماذج من سابقة الأعمال</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedContractorDetail.portfolioImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Project"
                        className="rounded-xl h-36 w-full object-cover border border-slate-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Contact Options */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-blue-300 block">رقم الاتصال المباشر للمقاول</span>
                  <span className="text-base font-bold text-white font-mono">{selectedContractorDetail.phone}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${selectedContractorDetail.phone}`}
                    className="px-4 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Phone className="w-4 h-4" />
                    <span>اتصال فوري</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestQuote) onRequestQuote(selectedContractorDetail);
                      setSelectedContractorDetail(null);
                    }}
                    className="px-4 py-2 rounded-xl silver-btn text-xs font-bold"
                  >
                    طلب تسعيرة رسمية
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
