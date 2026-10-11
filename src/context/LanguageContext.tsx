import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'ar' | 'en' | 'ur';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isRtl: boolean;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<LanguageCode, Record<string, string>> = {
  ar: {
    // Nav
    'nav.contractors': 'المقاولون المعتمدون',
    'nav.consultants': 'المكاتب الاستشارية',
    'nav.ads': 'سوق المناقصات والمواد',
    'nav.calculator': 'حاسبة التكاليف',
    'nav.register': 'تسجيل جديد',
    'nav.admin': 'لوحة الإدارة',
    'nav.providerPortal': 'بوابة مقدم الخدمة',
    'nav.messages': 'الرسائل والمحادثات',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'خروج',
    'nav.myAccount': 'حسابي',
    
    // Day/Night & Lang
    'theme.day': 'الوضع الصباحي',
    'theme.night': 'الوضع الليلي',
    'lang.ar': 'العربية',
    'lang.en': 'English',
    'lang.ur': 'اردو',

    // Client notice
    'client.badge': 'واجهة العميل الرسمية',
    'client.authNotice': 'مرحباً بك! لتنفيذ أي إجراء (مراسلة، طلب تسعيرة، حجز استشارة أو نشر مناقصة) يلزم تسجيل الدخول عبر حساب Google أو الدخول اليدوي.',
    'client.loginPromptBtn': 'تسجيل الدخول للمتابعة',

    // Provider portal
    'provider.portalTitle': 'بوابة مقدّمي الخدمات (المقاولون والاستشاريون)',
    'provider.portalSubtitle': 'إدارة بيانات المنشأة وتحديد موقع المقر على خريطة سلطنة عُمان ورادار المنصة',
    'provider.locationSection': 'تحديد وتعديل موقع مقر المقاول على الخريطة الجغرافية',
    'provider.locationDesc': 'يتيح لمقدم الخدمة فقط تثبيت موقع شركته على الخريطة ليظهر للعملاء القريبين جغرافياً بدقة عالية.',
    'provider.btnSetLocation': 'تحديد موقع المقر الآن (GPS والخريطة)',
    'provider.currentLocation': 'الموقع الحالي المسجل:',
    'provider.onlyProvidersNotice': 'ملاحظة: تعديل وتحديد المواقع مخصص حصرياً لمقدمي الخدمة والشركات.',

    // In-platform chat
    'chat.platformOnly': 'التواصل محمي وحصري عبر منصة مِهاد فقط',
    'chat.platformOnlyDesc': 'لضمان حقوق الطرفين وتوثيق كافة عروض الأسعار والاتفاقيات، يتم التواصل حصرياً داخل المنصة.',
    'chat.btnMessage': 'مراسلة عبر المنصة فقط',
    'chat.btnQuote': 'طلب تسعيرة عبر المنصة',
    'chat.inboxTitle': 'صندوق محادثات المنصة',
    'chat.startConversation': 'بدء محادثة رسمية مع:',
    'chat.typePlaceholder': 'اكتب رسالتك أو استفسارك هنا...',
    'chat.send': 'إرسال',

    // Auth gate
    'auth.gateTitle': 'يلزم تسجيل الدخول لإتمام هذا الإجراء',
    'auth.gateDesc': 'لضمان أمان الصفقات وخصوصية التعامل، يرجى تسجيل الدخول بحساب Google أو بالبريد وكلمة المرور.',
    'auth.googleBtn': 'متابعة عبر حساب Google',
    'auth.manualBtn': 'تسجيل الدخول اليدوي',
    'auth.createNew': 'إنشاء حساب جديد',

    // Chatbot
    'bot.title': 'مرشد البناء والإنشاءات العُماني الذكي',
    'bot.subtitle': 'استشارات متخصصة حصرياً في كود البناء واشتراطات البلديات والمقاولات في سلطنة عُمان',
    'bot.askBtn': 'مرشد البناء العُماني 🇴🇲',
    'bot.calculateNeeds': 'حساب الاحتياجات الإنشائية',
  },
  en: {
    // Nav
    'nav.contractors': 'Certified Contractors',
    'nav.consultants': 'Engineering Consultants',
    'nav.ads': 'Tenders & Materials Board',
    'nav.calculator': 'Cost Calculator',
    'nav.register': 'New Account',
    'nav.admin': 'Admin Panel',
    'nav.providerPortal': 'Service Provider Portal',
    'nav.messages': 'Messages & Chats',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    'nav.myAccount': 'My Account',

    // Day/Night & Lang
    'theme.day': 'Day Mode',
    'theme.night': 'Night Mode',
    'lang.ar': 'العربية',
    'lang.en': 'English',
    'lang.ur': 'اردو',

    // Client notice
    'client.badge': 'Client Marketplace Portal',
    'client.authNotice': 'Welcome! To perform any action (messaging, quotation, consultation, or publishing tenders), please sign in with Google or manually.',
    'client.loginPromptBtn': 'Sign In to Proceed',

    // Provider portal
    'provider.portalTitle': 'Service Provider Portal (Contractors & Consultants)',
    'provider.portalSubtitle': 'Manage company profile and pinpoint your headquarters location on the Oman radar & map',
    'provider.locationSection': 'Set & Pin Company Headquarters on the Map',
    'provider.locationDesc': 'Only service providers can set and edit their office location so clients nearby can discover them with accurate distance.',
    'provider.btnSetLocation': 'Set Office Location (GPS & Map)',
    'provider.currentLocation': 'Current Registered Location:',
    'provider.onlyProvidersNotice': 'Notice: Location editing is exclusively reserved for verified service providers.',

    // In-platform chat
    'chat.platformOnly': 'Communication Protected & Exclusive via Mihad Platform',
    'chat.platformOnlyDesc': 'To guarantee consumer rights and document all proposals, all communications are strictly handled inside the platform.',
    'chat.btnMessage': 'Message via Platform Only',
    'chat.btnQuote': 'Request Quote via Platform',
    'chat.inboxTitle': 'Platform Messages & Inquiries',
    'chat.startConversation': 'Start Official Chat with:',
    'chat.typePlaceholder': 'Type your message or project inquiry here...',
    'chat.send': 'Send',

    // Auth gate
    'auth.gateTitle': 'Sign In Required for this Action',
    'auth.gateDesc': 'To safeguard transactions and client privacy, please sign in using Google or your email credentials.',
    'auth.googleBtn': 'Continue with Google Account',
    'auth.manualBtn': 'Manual Sign In',
    'auth.createNew': 'Create New Account',

    // Chatbot
    'bot.title': 'Oman Construction AI Advisor',
    'bot.subtitle': 'Specialized exclusively in building codes, municipal permits, and engineering in the Sultanate of Oman',
    'bot.askBtn': 'Oman Construction Advisor 🇴🇲',
    'bot.calculateNeeds': 'Calculate Material Needs',
  },
  ur: {
    // Nav
    'nav.contractors': 'تصدیق شدہ ٹھیکیدار',
    'nav.consultants': 'انجینئرنگ کنسلٹنٹس',
    'nav.ads': 'ٹینڈرز اور میٹریل بورڈ',
    'nav.calculator': 'لاگت کا کیلکولیٹر',
    'nav.register': 'نیا اکاؤنٹ',
    'nav.admin': 'ایڈمن پینل',
    'nav.providerPortal': 'سروس فراہم کنندہ پورٹل',
    'nav.messages': 'پیغامات اور چیٹ',
    'nav.login': 'لاگ ان کریں',
    'nav.logout': 'لاگ آؤٹ',
    'nav.myAccount': 'میرا اکاؤنٹ',

    // Day/Night & Lang
    'theme.day': 'دن کا موڈ',
    'theme.night': 'رات کا موڈ',
    'lang.ar': 'العربية',
    'lang.en': 'English',
    'lang.ur': 'اردو',

    // Client notice
    'client.badge': 'کسٹمر پورٹل',
    'client.authNotice': 'خوش آمدید! کسی بھی کارروائی (پیغامات، کوٹیشن، یا ٹینڈر شائع کرنا) کے لیے گوگل یا دستی طور پر لاگ ان کریں۔',
    'client.loginPromptBtn': 'جاری رکھنے کے لیے لاگ ان کریں',

    // Provider portal
    'provider.portalTitle': 'سروس فراہم کنندہ پورٹل (ٹھیکیدار اور کنسلٹنٹس)',
    'provider.portalSubtitle': 'عمان نقشے پر اپنے دفتر کا مقام مقرر کریں',
    'provider.locationSection': 'نقشے پر کمپنی کا مقام مقرر کریں',
    'provider.locationDesc': 'صرف سروس فراہم کنندگان ہی اپنے دفتر کے مقام کی ترمیم کر سکتے ہیں۔',
    'provider.btnSetLocation': 'مقام کا تعین کریں (GPS اور نقشہ)',
    'provider.currentLocation': 'موجودہ درج مقام:',
    'provider.onlyProvidersNotice': 'نوٹ: مقام کی تبدیلی صرف تصدیق شدہ سروس فراہم کنندگان کے لیے مخصوص ہے۔',

    // In-platform chat
    'chat.platformOnly': 'صرف میہاد پلیٹ فارم کے ذریعے محفوظ رابطہ',
    'chat.platformOnlyDesc': 'حقوق کے تحفظ کے لیے، تمام پیغامات اور رابطے صرف پلیٹ فارم کے اندر ہوتے ہیں۔',
    'chat.btnMessage': 'صرف پلیٹ فارم کے ذریعے رابطہ کریں',
    'chat.btnQuote': 'پلیٹ فارم کے ذریعے کوٹیشن مانگیں',
    'chat.inboxTitle': 'پلیٹ فارم چیٹ باکس',
    'chat.startConversation': 'بات چیت شروع کریں:',
    'chat.typePlaceholder': 'اپنا پیغام یہاں لکھیں...',
    'chat.send': 'ارسال کریں',

    // Auth gate
    'auth.gateTitle': 'اس کارروائی کے لیے لاگ ان درکار ہے',
    'auth.gateDesc': 'معاہدات کی حفاظت کے لیے براہ کرم گوگل یا ای میل سے لاگ ان کریں۔',
    'auth.googleBtn': 'گوگل کے ساتھ لاگ ان کریں',
    'auth.manualBtn': 'دستی لاگ ان',
    'auth.createNew': 'نیا اکاؤنٹ بنائیں',

    // Chatbot
    'bot.title': 'عمان تعمیراتی مشیر بوٹ',
    'bot.subtitle': 'سلطنت عمان میں تعمیرات، بلدیاتی اجازت ناموں اور قوانین میں خصوصی مشیر',
    'bot.askBtn': 'عمان تعمیراتی مشیر 🇴🇲',
    'bot.calculateNeeds': 'تعمیراتی سامان کا حساب لگائیں',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('mihad_lang');
    if (saved === 'ar' || saved === 'en' || saved === 'ur') return saved;
    return 'ar'; // Default Arabic
  });

  const isRtl = language === 'ar' || language === 'ur';

  useEffect(() => {
    localStorage.setItem('mihad_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[language]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
