/**
 * Geographic and Proximity Utilities for Mihad Platform
 */

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
  district?: string;
}

// Predefined key locations in Oman and neighboring regions
export const PRESET_LOCATIONS: GeoLocation[] = [
  { lat: 23.6143, lng: 58.5453, name: 'مسقط - شاطئ القرم', district: 'القرم' },
  { lat: 23.5859, lng: 58.4059, name: 'مسقط - الخوير وحي الوزارات', district: 'الخوير' },
  { lat: 23.5412, lng: 58.3912, name: 'مسقط - مرتفعات بوشر وغلا', district: 'بوشر' },
  { lat: 23.6300, lng: 58.2600, name: 'السيب - الموج مسقط والموالح', district: 'الموج' },
  { lat: 23.6100, lng: 58.1900, name: 'السيب - الخوض والمعبيلة', district: 'الخوض' },
  { lat: 17.0194, lng: 54.0900, name: 'صلالة - الدهاريز والسعادة', district: 'صلالة' },
  { lat: 24.3461, lng: 56.7075, name: 'صحار - المنطقة الصناعية والميناء', district: 'صحار' },
  { lat: 22.9333, lng: 57.5333, name: 'نزوى - فرق والشهباء', district: 'نزوى' },
  { lat: 23.7081, lng: 57.8864, name: 'بركاء - الرميس والصومحان', district: 'بركاء' },
  { lat: 22.5667, lng: 59.5289, name: 'صور - العيجة ومصيرة', district: 'صور' },
  { lat: 24.7136, lng: 46.6753, name: 'الرياض - العليا والنرجس', district: 'الرياض' },
  { lat: 25.2048, lng: 55.2708, name: 'دبي - الخليج التجاري', district: 'دبي' }
];

/**
 * Calculates Great-Circle distance using Haversine formula (in kilometers)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Format distance in Arabic
 */
export function formatDistance(km: number | undefined): string {
  if (km === undefined || km === null || isNaN(km)) return '';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} متر`;
  }
  return `${km.toFixed(1)} كم`;
}

/**
 * Guess coordinate from location text string
 */
export function getCoordinatesForLocationText(locationStr: string): { lat: number; lng: number } {
  const normalized = (locationStr || '').toLowerCase();
  
  if (normalized.includes('قرم') || normalized.includes('qurum')) {
    return { lat: 23.6143, lng: 58.5453 };
  }
  if (normalized.includes('بوشر') || normalized.includes('غلا') || normalized.includes('bowsher')) {
    return { lat: 23.5412, lng: 58.3912 };
  }
  if (normalized.includes('موج') || normalized.includes('سيب') || normalized.includes('موالح') || normalized.includes('mouj')) {
    return { lat: 23.6300, lng: 58.2600 };
  }
  if (normalized.includes('خوير') || normalized.includes('وزارات') || normalized.includes('khuwair')) {
    return { lat: 23.5859, lng: 58.4059 };
  }
  if (normalized.includes('خوض') || normalized.includes('معبيلة') || normalized.includes('khoudh')) {
    return { lat: 23.6100, lng: 58.1900 };
  }
  if (normalized.includes('صلالة') || normalized.includes('ظفار') || normalized.includes('دهاريز') || normalized.includes('salalah')) {
    return { lat: 17.0194, lng: 54.0900 };
  }
  if (normalized.includes('صحار') || normalized.includes('باطنة') || normalized.includes('sohar')) {
    return { lat: 24.3461, lng: 56.7075 };
  }
  if (normalized.includes('نزوى') || normalized.includes('داخلية') || normalized.includes('nizwa')) {
    return { lat: 22.9333, lng: 57.5333 };
  }
  if (normalized.includes('بركاء') || normalized.includes('barka')) {
    return { lat: 23.7081, lng: 57.8864 };
  }
  if (normalized.includes('صور') || normalized.includes('sur')) {
    return { lat: 22.5667, lng: 59.5289 };
  }
  if (normalized.includes('رياض') || normalized.includes('riyadh')) {
    return { lat: 24.7136, lng: 46.6753 };
  }
  if (normalized.includes('جدة') || normalized.includes('jeddah')) {
    return { lat: 21.5433, lng: 39.1728 };
  }
  if (normalized.includes('دبي') || normalized.includes('dubai')) {
    return { lat: 25.2048, lng: 55.2708 };
  }
  if (normalized.includes('أبوظبي') || normalized.includes('abu dhabi')) {
    return { lat: 24.4539, lng: 54.3773 };
  }
  
  // Default to Muscat central
  return { lat: 23.5880, lng: 58.3829 };
}

/**
 * Generates Google Maps Directions link
 */
export function getGoogleMapsDirectionsUrl(lat: number, lng: number, label?: string): string {
  const query = encodeURIComponent(label || `${lat},${lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${query}`;
}
