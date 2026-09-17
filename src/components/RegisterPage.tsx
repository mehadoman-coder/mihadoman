import React, { useState } from 'react';
import { 
  Building2, 
  HardHat, 
  Compass, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileCheck,
  Building,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth, RegistrationData } from '../context/AuthContext';
import { GlassIcon } from './GlassIcon';
import { MihadLogo } from './MihadLogo';

interface RegisterPageProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const { registerDetailedUser } = useAuth();
  
  // Selected account type: strictly client, contractor, or consultant (NO admin option)
  const [selectedRole, setSelectedRole] = useState<'client' | 'contractor' | 'consultant'>('client');
  
  // Common Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('الرياض');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Contractor Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [classificationGrade, setClassificationGrade] = useState('درجة ثانية');
  const [specialtyCategory, setSpecialtyCategory] = useState('general');
  const [startingPricePerMeter, setStartingPricePerMeter] = useState('140');

  // Consultant Specific Fields
  const [officeName, setOfficeName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [consultantSpecialty, setConsultantSpecialty] = useState('architectural');
  const [consultationFeePerHour, setConsultationFeePerHour] = useState('45');
  const [bio, setBio] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const citiesList = [
    'مسقط',
    'السيب',
    'بوشر',
    'القرم والخوير',
    'صلالة',
    'صحار',
    'نزوى',
    'العامرات',
    'بركاء',
    'صور',
    'الرياض',
    'جدة',
    'دبي',
    'أبوظبي'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('يرجى إدخال الاسم بالكامل.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('يرجى إدخال رقم الجوال للتواصل.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('كلمة المرور يجب ألا تقل عن 6 خانات.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين.');
      return;
    }

    if (selectedRole === 'contractor') {
      if (!companyName.trim()) {
        setErrorMessage('يرجى إدخال اسم شركة أو مؤسسة المقاولات.');
        return;
      }
      if (!crNumber.trim()) {
        setErrorMessage('يرجى إدخال رقم السجل التجاري أو الترخيص المعتمد.');
        return;
      }
    }

    if (selectedRole === 'consultant') {
      if (!officeName.trim()) {
        setErrorMessage('يرجى إدخال اسم المكتب الهندسي أو الاستشاري.');
        return;
      }
      if (!licenseNumber.trim()) {
        setErrorMessage('يرجى إدخال رقم الاعتماد أو الترخيص الهندسي والاستشاري.');
        return;
      }
    }

    setLoading(true);

    const regData: RegistrationData = {
      role: selectedRole,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city,
      password,
      // Contractor
      companyName: selectedRole === 'contractor' ? companyName.trim() : undefined,
      crNumber: selectedRole === 'contractor' ? crNumber.trim() : undefined,
      classificationGrade: selectedRole === 'contractor' ? classificationGrade : undefined,
      specialtyCategory: selectedRole === 'contractor' ? specialtyCategory : undefined,
      startingPricePerMeter: selectedRole === 'contractor' ? Number(startingPricePerMeter) : undefined,
      // Consultant
      officeName: selectedRole === 'consultant' ? officeName.trim() : undefined,
      licenseNumber: selectedRole === 'consultant' ? licenseNumber.trim() : undefined,
      consultantSpecialty: selectedRole === 'consultant' ? consultantSpecialty : undefined,
      consultationFeePerHour: selectedRole === 'consultant' ? Number(consultationFeePerHour) : undefined,
      bio: selectedRole === 'consultant' ? bio.trim() : undefined
    };

    const res = await registerDetailedUser(regData);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || 'تم إنشاء الحساب بنجاح!');
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 900);
    } else {
      setErrorMessage(res.message || 'حدث خطأ أثناء إتمام عملية التسجيل.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <MihadLogo variant="full" size="lg" inverted />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight silver-gradient-text">
          إنشاء حساب جديد في منصة مِهاد
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          انضم إلى الشبكة الوطنية الرائدة لقطاع البناء والإنشاءات بالمملكة، واختر نوع الحساب الذي يمثل نشاطك.
        </p>
      </div>

      {/* STEP 1: CHOOSE ACCOUNT TYPE (3 Clean, Professional Options) */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-300 mb-3 text-center sm:text-right">
          اختر نوع الحساب المناسب لك:
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Client Card */}
          <div
            onClick={() => setSelectedRole('client')}
            className={`p-5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'client'
                ? 'bg-blue-900/40 border-blue-400 shadow-xl shadow-blue-950/60 ring-2 ring-blue-500/30'
                : 'glass-card border-slate-700/70 hover:border-slate-500/80 bg-slate-900/40 opacity-90 hover:opacity-100'
            }`}
          >
            {selectedRole === 'client' && (
              <div className="absolute top-3 left-3">
                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
            <div>
              <div className="mb-3.5">
                <GlassIcon icon={UserCheck} size="md" variant={selectedRole === 'client' ? 'royal' : 'silver'} />
              </div>
              <h3 className="text-base font-black text-white mb-1">عميل / صاحب مشروع</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                للأفراد والشركات الراغبين في بناء، تشطيب أو ترميم عقاراتهم، والبحث عن أفضل عروض الأسعار من المقاولين والاستشاريين.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-[11px] font-semibold text-blue-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>طرح مناقصات وحساب التكاليف مجاناً</span>
            </div>
          </div>

          {/* 2. Contractor Card */}
          <div
            onClick={() => setSelectedRole('contractor')}
            className={`p-5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'contractor'
                ? 'bg-blue-900/40 border-amber-400 shadow-xl shadow-amber-950/40 ring-2 ring-amber-500/30'
                : 'glass-card border-slate-700/70 hover:border-slate-500/80 bg-slate-900/40 opacity-90 hover:opacity-100'
            }`}
          >
            {selectedRole === 'contractor' && (
              <div className="absolute top-3 left-3">
                <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
            <div>
              <div className="mb-3.5">
                <GlassIcon icon={HardHat} size="md" variant={selectedRole === 'contractor' ? 'amber' : 'silver'} />
              </div>
              <h3 className="text-base font-black text-white mb-1">مقاول معتمد</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                لشركات ومؤسسات المقاولات العامة والتخصصية الراغبة في عرض خدماتها ومشاريعها واستقبال طلبات التنفيذ المباشرة.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-[11px] font-semibold text-amber-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>ملف تعريفي معتمد وتلقي عروض المشاريع</span>
            </div>
          </div>

          {/* 3. Engineering Consultant Card */}
          <div
            onClick={() => setSelectedRole('consultant')}
            className={`p-5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden flex flex-col justify-between ${
              selectedRole === 'consultant'
                ? 'bg-blue-900/40 border-cyan-400 shadow-xl shadow-cyan-950/40 ring-2 ring-cyan-500/30'
                : 'glass-card border-slate-700/70 hover:border-slate-500/80 bg-slate-900/40 opacity-90 hover:opacity-100'
            }`}
          >
            {selectedRole === 'consultant' && (
              <div className="absolute top-3 left-3">
                <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
            <div>
              <div className="mb-3.5">
                <GlassIcon icon={Compass} size="md" variant={selectedRole === 'consultant' ? 'royal' : 'silver'} />
              </div>
              <h3 className="text-base font-black text-white mb-1">استشاري هندسي</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                للمكاتب الهندسية المعتمدة والمهندسين الاستشاريين لتقديم خدمات التصميم المعماري والإنشائي والإشراف الفني.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-[11px] font-semibold text-cyan-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>اعتماد هندسي وإشراف فني معتمد</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* REGISTRATION FORM */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/80 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>
              بيانات التسجيل: {selectedRole === 'client' ? 'حساب عميل / صاحب مشروع' : selectedRole === 'contractor' ? 'حساب مقاول معتمد' : 'حساب استشاري هندسي'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            جميع البيانات مشفرة ومحمية وفق أنظمة أمن المعلومات في المملكة العربية السعودية.
          </p>
        </div>

        {/* 1. CONTRACTOR SPECIFIC FIELDS */}
        {selectedRole === 'contractor' && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-4">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              <span>بيانات المنشأة وتصنيف المقاول</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم شركة / مؤسسة المقاولات *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة الرواسي للمقاولات العامة"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رقم السجل التجاري / رخصة النشاط *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: CR-10892341"
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">تصنيف المقاول المعتمد</label>
                <select
                  value={classificationGrade}
                  onChange={(e) => setClassificationGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="درجة أولى">درجة أولى - معتمد (مجلس المناقصات)</option>
                  <option value="درجة ثانية">درجة ثانية (مشاريع تجارية وسكنية)</option>
                  <option value="درجة ثالثة">درجة ثالثة (فلل ومباني متوسطة)</option>
                  <option value="درجة ممتازة">درجة ممتازة (أبراج ومشاريع كبرى)</option>
                  <option value="معتمد">تصنيف مقدمي الخدمة المعتمد</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">التخصص الإنشائي الأساسي</label>
                <select
                  value={specialtyCategory}
                  onChange={(e) => setSpecialtyCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="general">مقاولات عامة وتسليم مفتاح</option>
                  <option value="residential">إنشاءات الفلل والمباني السكنية</option>
                  <option value="commercial">مباني ومجمعات تجارية</option>
                  <option value="finishing">تشطيبات وديكورات متقدمة</option>
                  <option value="steel">هياكل حديدية ومستودعات</option>
                  <option value="infrastructure">أعمال حفر وبنية تحتية</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">سعر المتر المبدئي التقريبي (بالريال / م²)</label>
                <input
                  type="number"
                  placeholder="140"
                  value={startingPricePerMeter}
                  onChange={(e) => setStartingPricePerMeter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. CONSULTANT SPECIFIC FIELDS */}
        {selectedRole === 'consultant' && (
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              <span>بيانات المكتب الهندسي والاعتماد</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم المكتب الهندسي أو الاستشاري *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مكتب دار العمارة للاستشارات الهندسية"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الاعتماد أو الترخيص الهندسي والاستشاري *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ترخيص وزارة الإسكان / جمعية المهندسين"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">التخصص الاستشاري</label>
                <select
                  value={consultantSpecialty}
                  onChange={(e) => setConsultantSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="architectural">تصميم معماري وتراخيص معتمدة</option>
                  <option value="structural">تصميم إنشائي وتدقيق مخططات</option>
                  <option value="project_management">إشراف دوري وإدارة مشاريع</option>
                  <option value="mep">كهروميكانيك وتكييف (MEP)</option>
                  <option value="interior_design">تصميم داخلي وحدائق</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">أتعاب الاستشارة بالساعة (بالريال / ساعة)</label>
                <input
                  type="number"
                  placeholder="45"
                  value={consultationFeePerHour}
                  onChange={(e) => setConsultationFeePerHour(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">نبذة عن المكتب وسابقة الأعمال</label>
                <textarea
                  rows={2}
                  placeholder="خبرة أكثر من 10 سنوات في تصميم والإشراف على الفلل والمشاريع السكنية والتجارية ومطابقة أعلى المواصفات القياسية..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. COMMON USER PROFILE FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {selectedRole === 'client' ? 'الاسم الكامل *' : 'اسم المفوض / مسؤول الحساب *'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="مثال: م. فهد الشمري"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-400"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">البريد الإلكتروني *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-400"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الجوال للتواصل *</label>
            <div className="relative">
              <input
                type="tel"
                required
                dir="ltr"
                placeholder="05XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-right rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-400"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">المدينة ومقر النشاط *</label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-400"
              >
                {citiesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">كلمة المرور *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">تأكيد كلمة المرور *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Commitment Badge */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            بالتسجيل، أنت توافق على شروط وسياسات منصة مِهاد والالتزام بأعلى معايير الجودة والسلامة ومطابقة المواصفات الإنشائية القياسية المعتمدة.
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl royal-gradient-btn text-white text-sm font-black flex items-center justify-center gap-2 shadow-xl hover:shadow-blue-600/30 cursor-pointer disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>إتمام تسجيل الحساب والبدء فوراً</span>
              </>
            )}
          </button>
        </div>

        {/* Switch to Login */}
        <div className="text-center pt-2 text-xs text-slate-400">
          <span>لديك حساب بالفعل في المنصة؟ </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-400 font-bold hover:underline cursor-pointer"
          >
            تسجيل الدخول مباشرة
          </button>
        </div>
      </form>
    </div>
  );
};
