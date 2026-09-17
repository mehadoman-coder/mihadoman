import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle, 
  ExternalLink, 
  Search, 
  Award, 
  Calendar,
  Layers,
  FileCheck2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { GlassIcon } from './GlassIcon';
import { Consultant } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface ConsultantsListProps {
  consultants: Consultant[];
  onRequestConsultation?: (consultant: Consultant) => void;
}

export const ConsultantsList: React.FC<ConsultantsListProps> = ({
  consultants,
  onRequestConsultation
}) => {
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedConsultantDetail, setSelectedConsultantDetail] = useState<Consultant | null>(null);

  const specialties = [
    { id: 'all', label: 'جميع المكاتب والاستشاريين' },
    { id: 'architectural', label: 'تصميم معماري وتراخيص معتمدة' },
    { id: 'structural', label: 'حسابات وتدقيق إنشائي معتمد' },
    { id: 'cost_control', label: 'إدارة مشاريع وضبط تكاليف BOQ' },
    { id: 'interior_design', label: 'تصميم داخلي وديكور' }
  ];

  const filteredConsultants = consultants.filter((c) => {
    const matchQuery =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSpecialty = selectedSpecialty === 'all' || c.specialty === selectedSpecialty;
    const matchCity = selectedCity === 'all' || c.location.includes(selectedCity);

    return matchQuery && matchSpecialty && matchCity;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-icon-badge text-blue-200 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-blue-300" />
            <span>المكاتب الهندسية المعتمدة لدى هيئة المهندسين</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold silver-gradient-text">
            سوق الاستشاريين والمكاتب الهندسية
          </h2>
          <p className="text-sm text-slate-400">
            اختر أفضل المكاتب الاستشارية لإصدار رخص البناء، إعداد المخططات المعمارية والإنشائية والإشراف الميداني
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto px-3.5 py-2 rounded-xl glass-card text-xs text-slate-300 border border-slate-700/60">
          <FileCheck2 className="w-4 h-4 text-blue-400" />
          <span>الاستشاريون المتاحون:</span>
          <span className="font-bold text-white text-sm">{filteredConsultants.length} مكتب</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card rounded-2xl p-4 md:p-5 space-y-4 border border-slate-700/60 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث باسم الاستشاري، المكتب الهندسي، الاعتماد أو الخدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl glass-input text-white placeholder-slate-500 text-sm border border-slate-700"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-white border border-slate-700 text-sm"
            >
              <option value="all" className="bg-slate-900">جميع المناطق والمدن</option>
              <option value="مسقط" className="bg-slate-900">مسقط (الخوير / القرم / بوشر)</option>
              <option value="صلالة" className="bg-slate-900">صلالة ومحافظة ظفار</option>
              <option value="صحار" className="bg-slate-900">صحار وشمال الباطنة</option>
              <option value="الرياض" className="bg-slate-900">الرياض</option>
              <option value="جدة" className="bg-slate-900">جدة</option>
              <option value="دبي" className="bg-slate-900">دبي والإمارات</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center justify-end">
            {(searchTerm || selectedSpecialty !== 'all' || selectedCity !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('all');
                  setSelectedCity('all');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Specialty Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {specialties.map((spec) => (
            <button
              key={spec.id}
              type="button"
              onClick={() => setSelectedSpecialty(spec.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedSpecialty === spec.id
                  ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400'
                  : 'bg-slate-900/50 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {spec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Consultants */}
      {filteredConsultants.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3">
          <GlassIcon icon={Compass} size="lg" variant="silver" className="mx-auto" />
          <h3 className="text-lg font-bold text-white">لم يتم العثور على مكاتب تطابق البحث</h3>
          <p className="text-sm text-slate-400">يرجى تعديل مصطلحات البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultants.map((consultant, idx) => (
            <div
              key={`consultant-${consultant.id}-${idx}`}
              className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-700/70 relative group"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={consultant.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
                      alt={consultant.officeName}
                      className="w-13 h-13 rounded-xl object-cover border border-slate-600 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                          {consultant.officeName}
                        </h3>
                        {consultant.verified && (
                          <span title="معتمد لدى هيئة المهندسين">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{consultant.name}</p>
                    </div>
                  </div>
                </div>

                {/* Rating and Accreditation Body */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">{consultant.rating}</span>
                    <span className="text-slate-400">({consultant.reviewsCount} تقييم)</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span className="line-clamp-1">{consultant.location}</span>
                  </div>
                </div>

                <div className="text-[11px] px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-slate-300">
                  <span className="text-blue-300 font-bold">الاعتماد: </span>
                  <span>{consultant.accreditationBody}</span>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {consultant.bio}
                </p>

                {/* Services */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {consultant.services.slice(0, 3).map((service, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                {/* Experience & stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="block text-slate-400 text-[10px]">الخبرة الهندسية</span>
                    <span className="font-bold text-white">{consultant.experienceYears} عام</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="block text-slate-400 text-[10px]">مشاريع معتمدة</span>
                    <span className="font-bold text-emerald-300">{consultant.accreditedProjectsCount}+ مشروع</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="block text-[10px] text-slate-400">جلسة استشارية</span>
                  <span className="text-sm font-extrabold text-white">
                    {formatPrice(consultant.consultationFeePerHour)} <span className="text-[10px] font-normal text-slate-400">/ ساعة</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedConsultantDetail(consultant)}
                    className="p-2 rounded-lg glass-icon-btn text-slate-300 hover:text-white cursor-pointer"
                    title="ملف الاستشاري والمخططات"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestConsultation) onRequestConsultation(consultant);
                    }}
                    className="px-3.5 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>حجز استشارة أو إشراف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultant Modal Detail */}
      {selectedConsultantDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-card max-w-2xl w-full rounded-2xl p-6 md:p-8 border border-slate-600 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-700 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedConsultantDetail.avatarUrl}
                  alt={selectedConsultantDetail.officeName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedConsultantDetail.officeName}</h3>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{selectedConsultantDetail.name}</p>
                  <p className="text-xs text-blue-300 mt-0.5">{selectedConsultantDetail.accreditationBody}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConsultantDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-blue-300 mb-1.5">الرؤية الهندسية والخبرات</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedConsultantDetail.bio}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-blue-300 mb-2">خدمات المكتب المعتمدة</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedConsultantDetail.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedConsultantDetail.portfolioImages && selectedConsultantDetail.portfolioImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-blue-300 mb-2">معرض تصاميم ومخططات المكتب</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedConsultantDetail.portfolioImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Design Portfolio"
                        className="rounded-xl h-36 w-full object-cover border border-slate-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-blue-300 block">الهاتف المباشر للمكتب</span>
                  <span className="text-base font-bold text-white font-mono">{selectedConsultantDetail.phone}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${selectedConsultantDetail.phone}`}
                    className="px-4 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>اتصال</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestConsultation) onRequestConsultation(selectedConsultantDetail);
                      setSelectedConsultantDetail(null);
                    }}
                    className="px-4 py-2 rounded-xl silver-btn text-xs font-bold"
                  >
                    طلب موعد استشارة
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
