import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Star, 
  ShieldCheck, 
  Phone, 
  ExternalLink, 
  Crosshair, 
  ChevronLeft,
  HardHat,
  Sliders,
  Maximize2,
  Compass
} from 'lucide-react';
import { Contractor } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { formatDistance, getGoogleMapsDirectionsUrl } from '../lib/geoUtils';

interface ContractorsMapViewProps {
  contractors: Contractor[];
  userLocation: { lat: number; lng: number; name: string } | null;
  onSelectContractor?: (contractor: Contractor) => void;
  onRequestQuote?: (contractor: Contractor) => void;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
  selectedRadiusKm: number;
  onSelectRadiusKm: (radius: number) => void;
}

export const ContractorsMapView: React.FC<ContractorsMapViewProps> = ({
  contractors,
  userLocation,
  onSelectContractor,
  onRequestQuote,
  onDetectLocation,
  isDetectingLocation,
  selectedRadiusKm,
  onSelectRadiusKm
}) => {
  const { formatPrice } = useCurrency();
  const [selectedPinContractor, setSelectedPinContractor] = useState<Contractor | null>(
    contractors.length > 0 ? contractors[0] : null
  );
  const [mapZoomLevel, setMapZoomLevel] = useState<'regional' | 'city' | 'close'>('city');

  // Center coordinate for the interactive canvas
  const center = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }
    // Default center Muscat
    return { lat: 23.60, lng: 58.35 };
  }, [userLocation]);

  // Dynamic bounds calculation for relative coordinate projection onto 2D SVG canvas
  const bounds = useMemo(() => {
    const latSpread = mapZoomLevel === 'close' ? 0.35 : mapZoomLevel === 'city' ? 0.9 : 2.5;
    const lngSpread = mapZoomLevel === 'close' ? 0.45 : mapZoomLevel === 'city' ? 1.2 : 3.2;

    return {
      minLat: center.lat - latSpread / 2,
      maxLat: center.lat + latSpread / 2,
      minLng: center.lng - lngSpread / 2,
      maxLng: center.lng + lngSpread / 2,
    };
  }, [center, mapZoomLevel]);

  // Project geographic coordinates into SVG percentage coordinates (0% to 100%)
  const projectToMap = (lat: number, lng: number) => {
    // Latitude decreases as Y goes down in SVG
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    // Longitude increases as X goes right
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    
    // Clamp to map view box so markers don't overflow outside
    const clampedX = Math.max(6, Math.min(94, x));
    const clampedY = Math.max(8, Math.min(92, y));
    const isOutOfBounds = x < 4 || x > 96 || y < 6 || y > 94;

    return { x: clampedX, y: clampedY, isOutOfBounds };
  };

  return (
    <div className="space-y-6">
      {/* Top Map Control Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>خريطة الرادار الجغرافي للمقاولين</span>
              {userLocation && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  موقعك مفعل: {userLocation.name}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              تصفح المقاولين الأقرب جغرافياً إلى موقع مشروعك مع حساب دقيق للمسافات
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Geolocation Button */}
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className="px-3.5 py-2 rounded-xl glass-card text-xs font-bold text-white hover:border-blue-400 transition-all flex items-center gap-2 cursor-pointer border border-slate-700 bg-slate-900/80"
          >
            <Crosshair className={`w-4 h-4 text-emerald-400 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'جارِ تحديد موقعك...' : 'تحديث موقعي التلقائي (GPS)'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMapZoomLevel('close')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                mapZoomLevel === 'close' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              نطاق ضيق (حي)
            </button>
            <button
              type="button"
              onClick={() => setMapZoomLevel('city')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                mapZoomLevel === 'city' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              المدينة
            </button>
            <button
              type="button"
              onClick={() => setMapZoomLevel('regional')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                mapZoomLevel === 'regional' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              إقليمي
            </button>
          </div>

          {/* Radius selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>النطاق:</span>
            <select
              value={selectedRadiusKm}
              onChange={(e) => onSelectRadiusKm(Number(e.target.value))}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value={0} className="bg-slate-900">كافة المسافات</option>
              <option value={15} className="bg-slate-900">أقل من 15 كم</option>
              <option value={30} className="bg-slate-900">أقل من 30 كم</option>
              <option value={50} className="bg-slate-900">أقل من 50 كم</option>
              <option value={100} className="bg-slate-900">أقل من 100 كم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-8">
          <div className="relative w-full h-[480px] md:h-[540px] rounded-3xl overflow-hidden border border-slate-700/80 bg-radial from-slate-900 via-slate-950 to-black shadow-2xl">
            {/* Background Grid & Coordinate Lines */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            {/* Map Topographical Watermark / Radar Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[300px] h-[300px] rounded-full border border-blue-400/30 animate-ping-slow" />
              <div className="absolute w-[450px] h-[450px] rounded-full border border-blue-400/20" />
              <div className="absolute w-[600px] h-[600px] rounded-full border border-blue-400/10" />
            </div>

            {/* Geographical Region Labels on Map Canvas */}
            <div className="absolute top-4 right-5 text-right pointer-events-none select-none">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block">منطقة التغطية الجغرافية</span>
              <span className="text-sm font-bold text-slate-300">
                {userLocation ? userLocation.name : 'سلطنة عُمان والخليج'}
              </span>
            </div>

            <div className="absolute bottom-4 left-5 pointer-events-none select-none text-[11px] text-slate-400 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>موقعك المعتمد: {userLocation ? userLocation.name : 'مسقط (افتراضي)'}</span>
            </div>

            {/* User Location Marker (Pulse Beacon) */}
            {userLocation && (
              <div 
                style={{
                  top: `${projectToMap(userLocation.lat, userLocation.lng).y}%`,
                  left: `${projectToMap(userLocation.lat, userLocation.lng).x}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/25 animate-ping absolute" />
                  <div className="w-7 h-7 rounded-full bg-emerald-500/40 flex items-center justify-center border-2 border-emerald-300 shadow-lg shadow-emerald-500/50">
                    <div className="w-3 h-3 rounded-full bg-white shadow" />
                  </div>
                  <div className="absolute top-8 whitespace-nowrap bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md backdrop-blur-sm">
                    موقعك الحالي
                  </div>
                </div>
              </div>
            )}

            {/* Contractor Interactive Pins */}
            {contractors.map((contractor) => {
              const coords = contractor.coordinates || { lat: 23.60, lng: 58.38 };
              const projected = projectToMap(coords.lat, coords.lng);
              const isSelected = selectedPinContractor?.id === contractor.id;
              const isNearby = (contractor.distanceKm ?? 999) < 20;

              return (
                <div
                  key={`pin-${contractor.id}`}
                  style={{
                    top: `${projected.y}%`,
                    left: `${projected.x}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-transform cursor-pointer ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-115'
                  }`}
                  onClick={() => setSelectedPinContractor(contractor)}
                >
                  <div className="relative group">
                    {/* Pin Avatar & Icon Container */}
                    <div
                      className={`relative rounded-2xl p-1 shadow-xl transition-all ${
                        isSelected
                          ? 'bg-blue-500 ring-4 ring-blue-400/40 shadow-blue-500/60'
                          : isNearby
                          ? 'bg-emerald-600/90 ring-2 ring-emerald-400/40 shadow-emerald-600/40'
                          : 'bg-slate-800 ring-1 ring-slate-600'
                      }`}
                    >
                      <img
                        src={contractor.avatarUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=100'}
                        alt={contractor.companyName}
                        className="w-9 h-9 md:w-11 md:h-11 rounded-xl object-cover"
                      />

                      {/* Small badge icon */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow">
                        <HardHat className="w-2.5 h-2.5" />
                      </div>

                      {/* Distance Tag above pin */}
                      {contractor.distanceKm !== undefined && (
                        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black px-1.5 py-0.5 rounded shadow ${
                          isNearby 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-900/90 text-slate-200 border border-slate-700'
                        }`}>
                          {formatDistance(contractor.distanceKm)}
                        </div>
                      )}
                    </div>

                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap border border-slate-700 shadow-2xl z-50">
                      {contractor.companyName}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Google Maps External View Watermark / Quick link */}
            {selectedPinContractor?.coordinates && (
              <div className="absolute bottom-4 right-5 z-20">
                <a
                  href={getGoogleMapsDirectionsUrl(
                    selectedPinContractor.coordinates.lat,
                    selectedPinContractor.coordinates.lng,
                    selectedPinContractor.companyName
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all backdrop-blur-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>الاتجاهات عبر Google Maps</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Selected Contractor Details Panel on the side */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {selectedPinContractor ? (
            <div className="glass-card rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPinContractor.avatarUrl}
                      alt={selectedPinContractor.companyName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-600 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-bold text-white line-clamp-1">
                          {selectedPinContractor.companyName}
                        </h4>
                        {selectedPinContractor.verified && (
                          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{selectedPinContractor.name}</p>
                      <span className="text-[10px] font-semibold text-blue-300 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-800/40 inline-block mt-1">
                        {selectedPinContractor.classificationGrade}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distance & Proximity Highlight Box */}
                {selectedPinContractor.distanceKm !== undefined && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">المسافة المقدرة من موقعك</span>
                        <span className="text-sm font-extrabold text-white">
                          على بعد {formatDistance(selectedPinContractor.distanceKm)}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      متاح للتنفيذ
                    </span>
                  </div>
                )}

                {/* Rating and location */}
                <div className="flex items-center justify-between text-xs text-slate-300 py-1 border-y border-slate-800">
                  <div className="flex items-center gap-1 text-amber-300">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">{selectedPinContractor.rating}</span>
                    <span className="text-slate-400">({selectedPinContractor.reviewsCount} تقييم)</span>
                  </div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {selectedPinContractor.location}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {selectedPinContractor.bio}
                </p>

                {/* Services */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 block">الخدمات المعتمدة:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedPinContractor.services.slice(0, 3).map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">سعر المتر المعتمد يبدأ من:</span>
                  <span className="text-base font-extrabold text-white">
                    {formatPrice(selectedPinContractor.startingPricePerMeter)}
                    <span className="text-[11px] font-normal text-slate-400"> / م²</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${selectedPinContractor.phone}`}
                    className="px-3 py-2.5 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال فوري</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestQuote) onRequestQuote(selectedPinContractor);
                    }}
                    className="px-3 py-2.5 rounded-xl silver-btn text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span>طلب تسعيرة</span>
                  </button>
                </div>

                {selectedPinContractor.coordinates && (
                  <a
                    href={getGoogleMapsDirectionsUrl(
                      selectedPinContractor.coordinates.lat,
                      selectedPinContractor.coordinates.lng,
                      selectedPinContractor.companyName
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح المسار في تطبيق Google Maps</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center space-y-3 h-full flex flex-col items-center justify-center">
              <MapPin className="w-10 h-10 text-slate-500" />
              <p className="text-sm text-slate-400">انقر على أي مقاول في الخريطة لعرض تفاصيله والمسافة المباشرة</p>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Carousel of Nearest Contractors */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-blue-400" />
            <span>قائمة المقاولين مرتبين حسب القرب الجغرافي</span>
          </span>
          <span className="text-xs text-slate-400">
            {contractors.length} مقاول معتمد ضمن النطاق
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {contractors.slice(0, 4).map((c) => {
            const isSelected = selectedPinContractor?.id === c.id;
            return (
              <div
                key={`mini-card-${c.id}`}
                onClick={() => setSelectedPinContractor(c)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-900/40 ring-1 ring-blue-500'
                    : 'glass-card hover:border-slate-600 bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={c.avatarUrl}
                    alt={c.companyName}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{c.companyName}</h5>
                    <p className="text-[11px] text-slate-400 truncate">{c.location}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                  <span className="font-bold text-white">{formatPrice(c.startingPricePerMeter)} / م²</span>
                  {c.distanceKm !== undefined && (
                    <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {formatDistance(c.distanceKm)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
