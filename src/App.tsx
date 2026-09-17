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
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from './lib/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CurrencySelector } from './components/CurrencySelector';
import { Contractor, Consultant, Advertisement } from './types';
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

  // Navigation View Tabs
  const [activeTab, setActiveTab] = useState<'contractors' | 'consultants' | 'ads' | 'calculator' | 'register' | 'admin'>('contractors');
  
  // Mobile nav state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // State data for Firestore sync
  const [contractors, setContractors] = useState<Contractor[]>(() => dedupeById(initialContractors));
  const [consultants, setConsultants] = useState<Consultant[]>(() => dedupeById(initialConsultants));
  const [ads, setAds] = useState<Advertisement[]>(() => dedupeById(initialAdvertisements));
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
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
    const id = `ad-${Date.now()}`;
    const newAd: Advertisement = {
      id,
      title: newAdData.title || 'إعلان جديد',
      description: newAdData.description || '',
      category: newAdData.category || 'residential',
      location: newAdData.location || 'الرياض',
      budgetRange: newAdData.budgetRange || 'حسب الاتفاق',
      projectArea: newAdData.projectArea || 500,
      authorName: user?.name || newAdData.authorName || 'عميل المنصة',
      authorType: user?.role || newAdData.authorType || 'client',
      contactPhone: newAdData.contactPhone || user?.phone || '+966 50 000 0000',
      status: 'active',
      urgency: 'high',
      featured: false,
      createdAt: new Date().toISOString(),
      bidsCount: 0
    };

    try {
      await setDoc(doc(db, 'advertisements', id), newAd);
      setAds(prev => dedupeById([newAd, ...prev]));
      showToast('تم نشر الإعلان بنجاح في المنصة ولوحة المشاريع!');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e: any) {
      setAds(prev => dedupeById([newAd, ...prev]));
      showToast('تم حفظ الإعلان محلياً وبنجاح!');
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'advertisements', id));
      setAds(prev => prev.filter(a => a.id !== id));
      showToast('تم حذف الإعلان بنجاح من قاعدة البيانات.');
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

  return (
    <div className="min-h-screen bg-[#070e1f] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 glass-card px-5 py-3 rounded-2xl border border-blue-400 text-white shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-xs md:text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0a1428]/90 backdrop-blur-xl border-b border-slate-700/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo - MIHAD */}
          <div 
            onClick={() => setActiveTab('contractors')}
            className="flex items-center cursor-pointer group"
          >
            <MihadLogo variant="horizontal" size="md" inverted />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl glass-card border border-slate-700/70">
            <button
              type="button"
              onClick={() => setActiveTab('contractors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'contractors'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HardHat className="w-4 h-4 text-amber-300" />
              <span>المقاولون ({contractors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('consultants')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'consultants'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-300" />
              <span>الاستشاريون ({consultants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ads')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'ads'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>لوحة الإعلانات والمناقصات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4 text-yellow-300" />
              <span>حاسبة تكاليف البناء</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/30'
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
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

          {/* Right Action Bar (User Profile, Currency Selector & Login Button) */}
          <div className="flex items-center gap-2.5">
            {/* Currency Selector */}
            <CurrencySelector />

            {user ? (
              <div className="flex items-center gap-3 p-1.5 px-3 rounded-2xl glass-card border border-slate-700/80">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {isAdmin && <Shield className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="text-xs font-bold text-white truncate max-w-[140px]">{user.name}</span>
                  </div>
                  <span className={`block text-[10px] font-semibold ${isAdmin ? 'text-amber-300' : 'text-blue-300'}`}>
                    {isAdmin ? 'صاحب المنصة - إدارة عامة' : user.role === 'contractor' ? 'مقاول معتمد' : user.role === 'consultant' ? 'مكتب استشاري' : 'عميل المنصة'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 hover:bg-red-900/60 hover:text-white cursor-pointer transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`hidden sm:flex px-3.5 py-2 rounded-xl text-xs font-bold items-center gap-1.5 cursor-pointer transition-all border ${
                    activeTab === 'register'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'glass-card border-slate-700 text-slate-200 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>إنشاء حساب</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl royal-gradient-btn text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-blue-600/30 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl glass-icon-btn text-white cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-4 bg-slate-900/95 border-b border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => { setActiveTab('contractors'); setMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-sm font-bold flex items-center gap-3 ${
                activeTab === 'contractors' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              <HardHat className="w-5 h-5 text-amber-400" />
              <span>سوق المقاولين</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('consultants'); setMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-sm font-bold flex items-center gap-3 ${
                activeTab === 'consultants' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              <Compass className="w-5 h-5 text-blue-300" />
              <span>المكاتب الاستشارية</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('ads'); setMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-sm font-bold flex items-center gap-3 ${
                activeTab === 'ads' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>لوحة الإعلانات والمناقصات</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('calculator'); setMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-sm font-bold flex items-center gap-3 ${
                activeTab === 'calculator' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              <Calculator className="w-5 h-5 text-yellow-400" />
              <span>حاسبة تكاليف البناء</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setMobileMenuOpen(false); }}
              className={`w-full p-3 rounded-xl text-sm font-bold flex items-center gap-3 ${
                activeTab === 'register' ? 'bg-emerald-600 text-white' : 'text-emerald-300'
              }`}
            >
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>إنشاء حساب جديد (مقاول / عميل / استشاري)</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`w-full p-3 rounded-xl text-sm font-bold flex items-center gap-3 ${
                  activeTab === 'admin' ? 'bg-amber-600 text-white' : 'text-amber-300'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>لوحة تحكم رئيس المنصة</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {activeTab === 'contractors' && (
          <ContractorsList
            contractors={dedupeById(contractors)}
            onRequestQuote={(c) => {
              showToast(`تم فتح قناة تواصل مع شركة "${c.companyName}"`);
            }}
          />
        )}

        {activeTab === 'consultants' && (
          <ConsultantsList
            consultants={dedupeById(consultants)}
            onRequestConsultation={(cons) => {
              showToast(`تم إرسال طلب استشارة لـ "${cons.officeName}"`);
            }}
          />
        )}

        {activeTab === 'ads' && (
          <AdsBoard
            ads={dedupeById(ads)}
            onAddAd={handleAddAd}
          />
        )}

        {activeTab === 'calculator' && (
          <CostCalculator
            onFindContractors={() => setActiveTab('contractors')}
            onFindConsultants={() => setActiveTab('consultants')}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage
            onSuccess={() => {
              setActiveTab('contractors');
              showToast('تم إنشاء الحساب بنجاح، ومرحباً بك في منصة مِهاد!');
            }}
            onSwitchToLogin={() => setIsAuthModalOpen(true)}
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
      <footer className="bg-[#050b17] border-t border-slate-800/80 pt-12 pb-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center">
                <MihadLogo variant="horizontal" size="sm" inverted />
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                المنصة الرائدة لقطاع المقاولات والإنشاءات في سلطنة عُمان ودول الخليج العربي. نربط أصحاب المشاريع بنخبة المقاولين والمكاتب الهندسية المعتمدة لضمان أعلى مستويات الإتقان والسلامة.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">أقسام المنصة</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setActiveTab('contractors')} className="hover:text-blue-300 cursor-pointer">سوق المقاولين المعتمدين</button></li>
                <li><button onClick={() => setActiveTab('consultants')} className="hover:text-blue-300 cursor-pointer">المكاتب الاستشارية والهندسية</button></li>
                <li><button onClick={() => setActiveTab('ads')} className="hover:text-blue-300 cursor-pointer">لوحة الإعلانات والمناقصات</button></li>
                <li><button onClick={() => setActiveTab('calculator')} className="hover:text-blue-300 cursor-pointer">حاسبة تكاليف البناء المعتمدة</button></li>
                <li><button onClick={() => setActiveTab('register')} className="hover:text-emerald-300 text-emerald-400 cursor-pointer">إنشاء حساب (مقاول / عميل / استشاري)</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">حوكمة وموثوقية</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> مطابقة المواصفات الإنشائية القياسية</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> اعتمادات المكاتب الهندسية والاستشارية المعتمدة</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> تصنيف مقدمي الخدمة المعتمد في عُمان (مجلس المناقصات)</li>
                <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> نظام حماية وتشفير متقدم لكافة الصفقات</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">الأمان والخصوصية</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">
                تلتزم منصة مِهاد بأعلى معايير حماية البيانات وسرية التعاملات والمناقصات لكافة المقاولين والمكاتب الاستشارية وأصحاب المشاريع.
              </p>
              <div className="flex items-center gap-2 text-slate-300 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                <span>نظام حماية وسرية متقدم</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 منصة مِهَاد (MIHAD) لسوق المقاولات والإنشاءات. جميع الحقوق محفوظة.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>خوادم المنصة وقواعد البيانات تعمل بأعلى كفاءة وأمان مشفر</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenRegisterPage={() => setActiveTab('register')}
        onAdminLoginSuccess={() => {
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
    <CurrencyProvider>
      <AuthProvider>
        <MarketplaceApp />
      </AuthProvider>
    </CurrencyProvider>
  );
}
