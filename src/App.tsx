import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Compass, 
  HardHat, 
  Calculator, 
  FileText, 
  Shield, 
  UserCheck, 
  LogIn, 
  LogOut, 
  Plus, 
  Sparkles, 
  Menu, 
  X, 
  Phone, 
  Search,
  Award,
  Layers,
  CheckCircle,
  Database,
  ArrowLeft,
  Moon,
  Sun,
  Globe,
  MapPin,
  MessageSquare,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, collection, doc, setDoc, deleteDoc, onSnapshot } from './lib/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LogoProvider } from './context/LogoContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage, LanguageCode } from './context/LanguageContext';
import { CurrencySelector } from './components/CurrencySelector';
import { Contractor, Consultant, Advertisement, Review } from './types';
import { initialContractors, initialConsultants, initialAdvertisements } from './data/mockData';
import { GlassIcon } from './components/GlassIcon';
import { CostCalculator } from './components/CostCalculator';
import { ContractorsList } from './components/ContractorsList';
import { ConsultantsList } from './components/ConsultantsList';
import { AdsBoard } from './components/AdsBoard';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { MihadLogo } from './components/MihadLogo';
import { RegisterPage } from './components/RegisterPage';
import { ServiceProviderPortal } from './components/ServiceProviderPortal';
import { PlatformChatModal } from './components/PlatformChatModal';
import { OmanConstructionChatbot } from './components/OmanConstructionChatbot';
import { getCoordinatesForLocationText } from './lib/geoUtils';

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

function MarketplaceApp() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t, isRtl } = useLanguage();

  // Navigation View Tabs
  const [activeTab, setActiveTab] = useState<'contractors' | 'consultants' | 'ads' | 'calculator' | 'provider_portal' | 'register' | 'admin'>('contractors');
  
  // Mobile nav state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth modal state & action protection prompt
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [actionPromptMessage, setActionPromptMessage] = useState<string | null>(null);

  // In-platform chat modal state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeChatTarget, setActiveChatTarget] = useState<any>(null);

  // State data for Firestore sync
  const [contractors, setContractors] = useState<Contractor[]>(() => dedupeById(initialContractors));
  const [consultants, setConsultants] = useState<Consultant[]>(() => dedupeById(initialConsultants));
  const [ads, setAds] = useState<Advertisement[]>(() => dedupeById(initialAdvertisements));
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Require login to perform any action on the platform
  const handleRequireAuth = (actionName: string) => {
    setActionPromptMessage(actionName);
    setIsAuthModalOpen(true);
  };

  // Start in-platform chat with contractor, consultant, or project owner
  const handleStartPlatformChat = (target: any) => {
    if (!user) {
      handleRequireAuth(`مراسلة "${target.companyName || target.officeName || target.name}" عبر المنصة`);
      return;
    }

    const isConsultant = !!target.specialty || !!target.officeName;
    setActiveChatTarget({
      id: target.id,
      name: target.name || target.companyName || target.officeName || 'مقدم الخدمة',
      companyName: target.companyName || target.officeName || target.name || 'المنشأة المعتمدة',
      role: isConsultant ? 'consultant' : 'contractor',
      location: target.location || 'سلطنة عُمان',
      rating: target.rating || 5.0,
      verified: target.verified ?? true,
      licenseNumber: target.licenseNumber,
      startingPrice: target.startingPricePerMeter || target.consultationFeePerHour
    });
    setIsChatModalOpen(true);
  };

  // Firebase Realtime Listeners & Seeding
  useEffect(() => {
    let unsubscribeContractors = () => {};
    let unsubscribeConsultants = () => {};
    let unsubscribeAds = () => {};

    const syncFirebase = async () => {
      try {
        // 1. Contractors sync
        const contractorsCol = collection(db, 'contractors');
        unsubscribeContractors = onSnapshot(contractorsCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: Contractor[] = [];
            snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Contractor));
            setContractors(dedupeById(list));
          } else {
            // Seed initial data to Firebase
            initialContractors.forEach(async (c) => {
              await setDoc(doc(db, 'contractors', c.id), c);
            });
          }
        }, (error) => {
          console.warn('Firestore contractors offline/fallback mode:', error.message);
        });

        // 2. Consultants sync
        const consultantsCol = collection(db, 'consultants');
        unsubscribeConsultants = onSnapshot(consultantsCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: Consultant[] = [];
            snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Consultant));
            setConsultants(dedupeById(list));
          } else {
            initialConsultants.forEach(async (c) => {
              await setDoc(doc(db, 'consultants', c.id), c);
            });
          }
        }, (error) => {
          console.warn('Firestore consultants offline/fallback mode:', error.message);
        });

        // 3. Advertisements sync
        const adsCol = collection(db, 'advertisements');
        unsubscribeAds = onSnapshot(adsCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: Advertisement[] = [];
            snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Advertisement));
            setAds(dedupeById(list));
          } else {
            initialAdvertisements.forEach(async (a) => {
              await setDoc(doc(db, 'advertisements', a.id), a);
            });
          }
        }, (error) => {
          console.warn('Firestore ads offline/fallback mode:', error.message);
        });

      } catch (err) {
        console.error('Firebase initialization error:', err);
      }
    };

    syncFirebase();

    return () => {
      unsubscribeContractors();
      unsubscribeConsultants();
      unsubscribeAds();
    };
  }, []);

  // CRUD Handler for Advertisements
  const handleAddAd = async (newAdData: Partial<Advertisement>) => {
    if (!user) {
      handleRequireAuth('نشر إعلان أو مشروع في لوحة المناقصات');
      return;
    }

    const id = `ad-${Date.now()}`;
    const newAd: Advertisement = {
      id,
      title: newAdData.title || 'طلب مشروع إنشائي جديد',
      description: newAdData.description || '',
      category: newAdData.category || 'residential',
      location: newAdData.location || 'مسقط',
      budgetRange: newAdData.budgetRange || 'حسب الاتفاق',
      projectArea: newAdData.projectArea || 500,
      authorName: user?.name || newAdData.authorName || 'عميل المنصة',
      authorType: user?.role || newAdData.authorType || 'client',
      contactPhone: newAdData.contactPhone || user?.phone || '+968 9000 0000',
      status: 'active',
      urgency: 'high',
      featured: false,
      createdAt: new Date().toISOString(),
      bidsCount: 0
    };

    try {
      await setDoc(doc(db, 'advertisements', id), newAd);
      setAds(prev => dedupeById([newAd, ...prev]));
      showToast('تم نشر مشروعك بنجاح في المنصة وتحديثه للمقاولين!');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e: any) {
      setAds(prev => dedupeById([newAd, ...prev]));
      showToast('تم حفظ الإعلان بنجاح!');
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'advertisements', id));
      setAds(prev => prev.filter(a => a.id !== id));
      showToast('تم حذف الإعلان بنجاح.');
    } catch (e: any) {
      setAds(prev => prev.filter(a => a.id !== id));
      showToast('تم حذف الإعلان محلياً.');
    }
  };

  // CRUD Handler for Contractors
  const handleAddContractor = async (contractorData: Partial<Contractor>) => {
    const id = `cont-${Date.now()}`;
    const newContractor: Contractor = {
      id,
      name: contractorData.name || 'المهندس المسؤول',
      companyName: contractorData.companyName || 'شركة مقاولات',
      category: contractorData.category || 'residential',
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      featured: true,
      location: contractorData.location || 'مسقط',
      coordinates: getCoordinatesForLocationText(contractorData.location || 'مسقط'),
      experienceYears: contractorData.experienceYears || 10,
      completedProjectsCount: contractorData.completedProjectsCount || 15,
      bio: contractorData.bio || 'شركة مقاولات معتمدة متخصصة في البناء والتشطيب ومطابقة المواصفات القياسية.',
      phone: contractorData.phone || '+968 9123 4567',
      email: contractorData.email || 'info@contractor.om',
      services: contractorData.services || ['بناء عظم بالمواد', 'تشطيب ديلوكس فاخر'],
      startingPricePerMeter: contractorData.startingPricePerMeter || 140,
      licenseNumber: contractorData.licenseNumber || 'CR-10892341',
      classificationGrade: contractorData.classificationGrade || 'درجة أولى - مجلس المناقصات',
      avatarUrl: contractorData.avatarUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=500'
    };

    try {
      await setDoc(doc(db, 'contractors', id), newContractor);
      setContractors(prev => dedupeById([newContractor, ...prev]));
      showToast('تمت إضافة المقاول بنجاح إلى المنصة!');
    } catch (e) {
      setContractors(prev => dedupeById([newContractor, ...prev]));
      showToast('تمت إضافة المقاول محلياً.');
    }
  };

  const handleDeleteContractor = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contractors', id));
      setContractors(prev => prev.filter(c => c.id !== id));
      showToast('تم حذف المقاول من المنصة بنجاح.');
    } catch (e) {
      setContractors(prev => prev.filter(c => c.id !== id));
      showToast('تم حذف المقاول محلياً.');
    }
  };

  // CRUD Handler for Consultants
  const handleAddConsultant = async (consData: Partial<Consultant>) => {
    const id = `cons-${Date.now()}`;
    const newConsultant: Consultant = {
      id,
      name: consData.name || 'المهندس الاستشاري',
      officeName: consData.officeName || 'دار الاستشارات الهندسية',
      specialty: consData.specialty || 'architectural',
      rating: 5.0,
      reviewsCount: 1,
      verified: true,
      featured: true,
      location: consData.location || 'مسقط',
      coordinates: getCoordinatesForLocationText(consData.location || 'مسقط'),
      experienceYears: consData.experienceYears || 15,
      accreditedProjectsCount: consData.accreditedProjectsCount || 30,
      bio: consData.bio || 'مكتب استشارات هندسية معتمد لإصدار رخص البناء والإشراف الدوري ومطابقة المواصفات.',
      phone: consData.phone || '+968 9234 5678',
      email: consData.email || 'info@consult.om',
      services: consData.services || ['مخططات معمارية وإنشائية', 'رخص وإباحات البناء البلدية', 'إشراف دوري'],
      consultationFeePerHour: consData.consultationFeePerHour || 45,
      accreditationBody: consData.accreditationBody || 'مكتب استشاري هندسي معتمد',
      avatarUrl: consData.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500'
    };

    try {
      await setDoc(doc(db, 'consultants', id), newConsultant);
      setConsultants(prev => dedupeById([newConsultant, ...prev]));
      showToast('تمت إضافة المكتب الاستشاري بنجاح!');
    } catch (e) {
      setConsultants(prev => dedupeById([newConsultant, ...prev]));
      showToast('تمت إضافة المكتب محلياً.');
    }
  };

  const handleDeleteConsultant = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'consultants', id));
      setConsultants(prev => prev.filter(c => c.id !== id));
      showToast('تم حذف الاستشاري بنجاح.');
    } catch (e) {
      setConsultants(prev => prev.filter(c => c.id !== id));
      showToast('تم حذف الاستشاري محلياً.');
    }
  };

  // Add Review handler for both contractors and consultants
  const handleAddReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    if (!user) {
      handleRequireAuth('إضافة تقييم وتقييم تجربة الخدمة');
      return;
    }

    const revId = `rev-${Date.now()}`;
    const newReview: Review = {
      ...reviewData,
      id: revId,
      userName: user?.name || reviewData.userName || 'عميل معتمد',
      createdAt: 'الآن'
    };

    if (reviewData.targetType === 'contractor') {
      setContractors(prev => prev.map(c => {
        if (c.id === reviewData.targetId) {
          const currentReviews = c.reviews || [];
          const updatedReviews = [newReview, ...currentReviews];
          const newAvg = Number(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          const updatedContractor = {
            ...c,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: newAvg
          };
          setDoc(doc(db, 'contractors', c.id), updatedContractor).catch(() => {});
          return updatedContractor;
        }
        return c;
      }));
      showToast('تمت إضافة تقييمك لشركة المقاولات بنجاح!');
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
    } else {
      setConsultants(prev => prev.map(c => {
        if (c.id === reviewData.targetId) {
          const currentReviews = c.reviews || [];
          const updatedReviews = [newReview, ...currentReviews];
          const newAvg = Number(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          const updatedConsultant = {
            ...c,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: newAvg
          };
          setDoc(doc(db, 'consultants', c.id), updatedConsultant).catch(() => {});
          return updatedConsultant;
        }
        return c;
      }));
      showToast('تمت إضافة تقييمك للمكتب الاستشاري بنجاح!');
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
    }
  };

  // Update Contractor Office Location on Map (Exclusively via ServiceProviderPortal)
  const handleUpdateContractorLocation = async (contractorId: string, coordinates: { lat: number; lng: number }, locationText: string) => {
    setContractors(prev => prev.map(c => {
      if (c.id === contractorId) {
        const updated = { ...c, coordinates, location: locationText };
        setDoc(doc(db, 'contractors', c.id), updated).catch(() => {});
        return updated;
      }
      return c;
    }));
    showToast(`تم تثبيت موقع مقر المنشأة (${locationText}) بنجاح على الخريطة والرادار!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-blue-600 selection:text-white relative transition-colors duration-200 ${
      isDark ? 'royal-navy-bg text-slate-100' : 'bg-[#f4f7fb] text-slate-900'
    }`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 glass-card px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/30 text-white shadow-2xl flex items-center gap-2.5 sm:gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs md:text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* Top Navbar with Royal Navy & Crisp White Aesthetics */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-[#081836]/95 border-white/15' : 'bg-white/95 border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo - MIHAD */}
          <div 
            onClick={() => setActiveTab('contractors')}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <MihadLogo variant="horizontal" size="sm" inverted={isDark} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className={`hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl border ${
            isDark ? 'glass-card border-white/15' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('contractors')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'contractors'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-blue-900 hover:bg-slate-200'
              }`}
            >
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>{t('contractors')} ({contractors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('consultants')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'consultants'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-blue-900 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-400" />
              <span>{t('consultants')} ({consultants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ads')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ads'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-blue-900 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{t('tenders')} ({ads.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-blue-900 hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4 text-yellow-400" />
              <span>{t('calculator')}</span>
            </button>

            {/* Dedicated Service Provider Portal Tab (The ONLY place where provider specifies their location) */}
            <button
              type="button"
              onClick={() => setActiveTab('provider_portal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'provider_portal'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/50 ring-1 ring-amber-300'
                  : isDark 
                    ? 'text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/30' 
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300'
              }`}
              title="صفحة مقدم الخدمة - تحديد موقع المقر على الخريطة واستقبال طلبات المنصة"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>صفحة مقدم الخدمة (الموقع)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                  : isDark
                    ? 'text-emerald-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/30'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>تسجيل جديد</span>
            </button>

            {/* Admin Panel Tab - ONLY rendered when owner is logged in */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 border border-amber-500/30'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>لوحة الإدارة</span>
              </button>
            )}
          </nav>

          {/* Right Action Bar (Day/Night mode, Language Switcher, Currency & Auth) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Day / Night Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-1 text-xs font-bold ${
                isDark 
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-yellow-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
              title={isDark ? 'التحويل للوضع الصباحي' : 'التحويل للوضع الليلي'}
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4 text-blue-900" />}
              <span className="hidden md:inline text-[11px]">{isDark ? 'صباحي' : 'ليلي'}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-1 text-xs font-bold ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] uppercase font-bold">{language}</span>
              </button>
              <div className={`absolute top-full left-0 mt-1 hidden group-hover:block p-1 rounded-xl shadow-2xl border text-xs z-50 min-w-[120px] ${
                isDark ? 'bg-[#081836] border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`w-full text-right px-3 py-1.5 rounded-lg flex items-center justify-between ${
                    language === 'ar' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-500/20'
                  }`}
                >
                  <span>العربية 🇴🇲</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`w-full text-right px-3 py-1.5 rounded-lg flex items-center justify-between ${
                    language === 'en' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-500/20'
                  }`}
                >
                  <span>English 🇬🇧</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ur')}
                  className={`w-full text-right px-3 py-1.5 rounded-lg flex items-center justify-between ${
                    language === 'ur' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-500/20'
                  }`}
                >
                  <span>اردو 🇵🇰</span>
                </button>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="hidden xs:block">
              <CurrencySelector />
            </div>

            {user ? (
              <div className={`flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 px-2 sm:px-3 rounded-2xl border ${
                isDark ? 'royal-card border-white/20' : 'bg-slate-100 border-slate-300'
              }`}>
                <div className="text-right">
                  <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
                    {isAdmin && <Shield className="w-3.5 h-3.5 text-amber-400" />}
                    <span className={`text-[11px] sm:text-xs font-bold truncate max-w-[80px] sm:max-w-[130px] ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>{user.name}</span>
                  </div>
                  <span className={`block text-[9px] sm:text-[10px] font-semibold ${isAdmin ? 'text-amber-400' : 'text-blue-400'}`}>
                    {isAdmin ? 'رئيس المنصة' : user.role === 'contractor' ? 'مقاول معتمد' : user.role === 'consultant' ? 'مكتب استشاري' : 'عميل'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 hover:bg-red-900/60 hover:text-white cursor-pointer transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`hidden sm:flex px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold items-center gap-1.5 cursor-pointer transition-all border ${
                    activeTab === 'register'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : isDark
                        ? 'royal-card border-white/20 text-slate-200 hover:text-white hover:border-white/40'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>حساب جديد</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionPromptMessage(null);
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl pure-white-btn text-xs font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-lg hover:shadow-white/20 transition-all shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#071633]" />
                  <span className="text-[#071633]">دخول</span>
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 sm:p-2.5 rounded-xl cursor-pointer border ${
                isDark ? 'royal-card text-white border-white/30' : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className={`lg:hidden p-3 sm:p-4 border-b space-y-2 animate-fade-in shadow-2xl ${
            isDark ? 'bg-[#081836]/98 backdrop-blur-2xl border-white/20' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>عملة الأسعار:</span>
              <CurrencySelector compact />
            </div>

            <button
              type="button"
              onClick={() => { setActiveTab('contractors'); setMobileMenuOpen(false); }}
              className={`w-full p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between ${
                activeTab === 'contractors' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <HardHat className="w-5 h-5 text-amber-400" />
                <span>سوق شركات ومؤسسات المقاولين</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                {contractors.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('consultants'); setMobileMenuOpen(false); }}
              className={`w-full p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between ${
                activeTab === 'consultants' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-blue-300" />
                <span>المكاتب الهندسية والاستشارية</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                {consultants.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('ads'); setMobileMenuOpen(false); }}
              className={`w-full p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between ${
                activeTab === 'ads' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>لوحة الإعلانات والمناقصات</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                {ads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('calculator'); setMobileMenuOpen(false); }}
              className={`w-full p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 ${
                activeTab === 'calculator' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-5 h-5 text-yellow-400" />
              <span>حاسبة تكاليف البناء المعتمدة</span>
            </button>

            {/* Service Provider Mobile Link */}
            <button
              type="button"
              onClick={() => { setActiveTab('provider_portal'); setMobileMenuOpen(false); }}
              className={`w-full p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 ${
                activeTab === 'provider_portal' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-amber-950/20'
              }`}
            >
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>صفحة مقدم الخدمة (تحديد وتعديل الموقع)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('register'); setMobileMenuOpen(false); }}
              className={`w-full p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 ${
                activeTab === 'register' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>إنشاء حساب جديد (مقاول / عميل / استشاري)</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`w-full p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 ${
                  activeTab === 'admin' ? 'bg-amber-600 text-white' : 'text-amber-300 hover:bg-white/10'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>لوحة تحكم رئيس المنصة (الإدارة وتغيير الشعار)</span>
              </button>
            )}
          </div>
        )}

        {/* Seamless Interactive Zero-Void Status Ticker Ribbon */}
        <div className={`w-full border-t py-1.5 px-3 sm:px-6 overflow-x-auto no-scrollbar ${
          isDark 
            ? 'bg-gradient-to-r from-[#071733] via-[#0d2857] to-[#071733] border-white/10' 
            : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white border-blue-800'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[11px] whitespace-nowrap font-bold text-slate-200">
            <div className="flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-blue-200">منظومة مِهَاد المعتمدة بسلطنة عُمان</span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-slate-300">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('contractors')}>
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                <span>{contractors.length} مقاول معتمد</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('consultants')}>
                <Compass className="w-3.5 h-3.5 text-blue-300" />
                <span>{consultants.length} مكتب استشاري</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('ads')}>
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ads.length} مناقصة ومشروع</span>
              </span>
              <span className="hidden md:flex items-center gap-1.5 text-white">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>تواصل حصري ومحمي عبر المنصة فقط</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-5 lg:px-8 py-4 sm:py-6 md:py-8 pb-24 lg:pb-12">
        {activeTab === 'contractors' && (
          <ContractorsList
            contractors={dedupeById(contractors)}
            onStartPlatformChat={handleStartPlatformChat}
            onRequireAuth={handleRequireAuth}
            onRequestQuote={(c) => handleStartPlatformChat(c)}
            onAddReview={handleAddReview}
            onUpdateContractorLocation={handleUpdateContractorLocation}
          />
        )}

        {activeTab === 'consultants' && (
          <ConsultantsList
            consultants={dedupeById(consultants)}
            onStartPlatformChat={handleStartPlatformChat}
            onRequireAuth={handleRequireAuth}
            onRequestConsultation={(cons) => handleStartPlatformChat(cons)}
            onAddReview={handleAddReview}
          />
        )}

        {activeTab === 'ads' && (
          <AdsBoard
            ads={dedupeById(ads)}
            onAddAd={handleAddAd}
            onRequireAuth={handleRequireAuth}
            onStartPlatformChat={handleStartPlatformChat}
          />
        )}

        {activeTab === 'calculator' && (
          <CostCalculator
            onFindContractors={() => setActiveTab('contractors')}
            onFindConsultants={() => setActiveTab('consultants')}
          />
        )}

        {/* Dedicated Service Provider Portal - The Only Place Provider Sets Their Location */}
        {activeTab === 'provider_portal' && (
          <ServiceProviderPortal
            contractors={dedupeById(contractors)}
            consultants={dedupeById(consultants)}
            onUpdateLocation={handleUpdateContractorLocation}
            onOpenChatWithProvider={handleStartPlatformChat}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage
            onSuccess={() => {
              setActiveTab('contractors');
              showToast('تم إنشاء الحساب بنجاح، ومرحباً بك في منصة مِهاد!');
            }}
            onSwitchToLogin={() => {
              setActionPromptMessage(null);
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            contractors={dedupeById(contractors)}
            consultants={dedupeById(consultants)}
            ads={dedupeById(ads)}
            onDeleteContractor={handleDeleteContractor}
            onAddContractor={handleAddContractor}
            onDeleteConsultant={handleDeleteConsultant}
            onAddConsultant={handleAddConsultant}
            onDeleteAd={handleDeleteAd}
            onAddAd={handleAddAd}
          />
        )}
      </main>

      {/* Luxury Footer */}
      <footer className={`border-t pt-12 pb-8 text-xs transition-colors duration-200 ${
        isDark ? 'bg-[#050b17] border-slate-800/80 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center">
                <MihadLogo variant="horizontal" size="sm" inverted />
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                المنصة الرائدة لقطاع المقاولات والإنشاءات في سلطنة عُمان. نربط أصحاب المشاريع بنخبة المقاولين والمكاتب الهندسية المعتمدة لضمان أعلى مستويات الإتقان والسلامة.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">أقسام المنصة</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setActiveTab('contractors')} className="hover:text-blue-300 cursor-pointer">سوق المقاولين المعتمدين</button></li>
                <li><button onClick={() => setActiveTab('consultants')} className="hover:text-blue-300 cursor-pointer">المكاتب الاستشارية والهندسية</button></li>
                <li><button onClick={() => setActiveTab('ads')} className="hover:text-blue-300 cursor-pointer">لوحة الإعلانات والمناقصات</button></li>
                <li><button onClick={() => setActiveTab('calculator')} className="hover:text-blue-300 cursor-pointer">حاسبة تكاليف البناء المعتمدة</button></li>
                <li><button onClick={() => setActiveTab('provider_portal')} className="hover:text-amber-300 text-amber-400 cursor-pointer">صفحة مقدم الخدمة وتحديد الموقع</button></li>
                <li><button onClick={() => setActiveTab('register')} className="hover:text-emerald-300 text-emerald-400 cursor-pointer">إنشاء حساب (مقاول / عميل / استشاري)</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">حوكمة وموثوقية</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> مطابقة المواصفات الإنشائية القياسية العُمانية</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> اعتمادات المكاتب الهندسية والاستشارية المعتمدة</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> تصنيف مقدمي الخدمة المعتمد في عُمان (مجلس المناقصات)</li>
                <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> تواصل وتفاوض حصري عبر المنصة لحماية الحقوق</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">الأمان والخصوصية</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">
                تلتزم منصة مِهاد بأعلى معايير حماية البيانات وسرية التعاملات والمناقصات لكافة المقاولين والمكاتب الاستشارية وأصحاب المشاريع عبر نظام تواصل مشفر بالكامل.
              </p>
              <div className="flex items-center gap-2 text-slate-300 text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>نظام حماية وتواصل موثق ومحمي</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 منصة مِهَاد (MIHAD) لسوق المقاولات والإنشاءات بسلطنة عُمان. جميع الحقوق محفوظة.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>خوادم المنصة وقواعد البيانات تعمل بأعلى كفاءة وأمان مشفر</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation Bar (Ultra-responsive on all phone screens) */}
      <nav 
        aria-label="التنقل السريع للهواتف" 
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-2xl border-t px-2 py-1.5 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.5)] ${
          isDark ? 'bg-[#071633]/96 border-white/20' : 'bg-white/95 border-slate-300 shadow-slate-300/60'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('contractors')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'contractors'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/60 font-bold scale-105'
              : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-blue-900'
          }`}
        >
          <HardHat className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="text-[10px]">المقاولون</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('consultants')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'consultants'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/60 font-bold scale-105'
              : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-blue-900'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5 text-blue-400" />
          <span className="text-[10px]">الاستشاريون</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ads')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ads'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/60 font-bold scale-105'
              : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-blue-900'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span className="text-[10px]">المناقصات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('provider_portal')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'provider_portal'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-900/60 font-bold scale-105'
              : isDark ? 'text-amber-400 hover:text-white' : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="text-[10px]">مقدم الخدمة</span>
        </button>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-md font-bold scale-105'
                : 'text-amber-400 hover:text-amber-200'
            }`}
          >
            <Shield className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">الإدارة</span>
          </button>
        ) : user ? (
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md font-bold scale-105'
                : 'text-emerald-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">حسابي</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setActionPromptMessage(null);
              setIsAuthModalOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4 mb-0.5 text-blue-400" />
            <span className="text-[10px]">دخول</span>
          </button>
        )}
      </nav>

      {/* In-Platform Protected Chat Modal (Exclusive Communication Channel) */}
      <PlatformChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        targetProvider={activeChatTarget}
        onRequireAuth={() => handleRequireAuth('مراسلة مقدم الخدمة عبر المنصة')}
      />

      {/* Oman Construction AI Consultant Bot with Needs Estimator */}
      <OmanConstructionChatbot />

      {/* Auth Modal with Strict Google / Manual Credential Authentication & Action Prompt */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setActionPromptMessage(null);
        }}
        actionPromptMessage={actionPromptMessage}
        onOpenRegisterPage={() => {
          setIsAuthModalOpen(false);
          setActiveTab('register');
        }}
        onLoginSuccess={(role) => {
          setIsAuthModalOpen(false);
          if (role === 'admin') {
            setActiveTab('admin');
            showToast('مرحباً بك يا صاحب المنصة! تم فتح لوحة الإدارة العامة.');
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
          } else if (role === 'contractor' || role === 'consultant') {
            setActiveTab('provider_portal');
            showToast('مرحباً بك في صفحة مقدم الخدمة! يمكنك الآن تحديد موقع مقرك وإدارة خدماتك.');
          } else {
            setActiveTab('contractors');
            showToast('مرحباً بك! تم تسجيل الدخول بنجاح، يمكنك الآن طلب عروض الأسعار والتواصل.');
          }
        }}
        onAdminLoginSuccess={() => {
          setIsAuthModalOpen(false);
          setActiveTab('admin');
          showToast('مرحباً بك يا صاحب المنصة! تم فتح لوحة الإدارة.');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LogoProvider>
          <CurrencyProvider>
            <AuthProvider>
              <MarketplaceApp />
            </AuthProvider>
          </CurrencyProvider>
        </LogoProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
