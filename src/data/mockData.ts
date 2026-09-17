import { Contractor, Consultant, Advertisement } from '../types';

export const initialContractors: Contractor[] = [
  {
    id: 'cont-1',
    name: 'م. فهد بن سعيد المعمري',
    companyName: 'شركة المعمري الكبرى للإنشاءات والتطوير',
    category: 'residential',
    rating: 4.9,
    reviewsCount: 142,
    verified: true,
    featured: true,
    location: 'مسقط، شاطئ القرم',
    coordinates: { lat: 23.6143, lng: 58.5453 },
    experienceYears: 18,
    completedProjectsCount: 86,
    bio: 'متخصصون في تنفيذ الفلل والقصور السكنية الفاخرة والمجمعات بأعلى المواصفات القياسية والهندسية المعتمدة مع توفير ضمانات إنشائية تصل لـ 20 سنة.',
    phone: '+968 9123 4567',
    email: 'info@almamari-const.om',
    services: ['بناء عظم بالمواد', 'تشطيب ديلوكس وفائق الفخامة', 'المباني والفلل الذكية', 'العزل المائي والحراري المعتمد'],
    startingPricePerMeter: 155, // in OMR
    licenseNumber: 'CR-10892341',
    classificationGrade: 'درجة أولى - مجلس المناقصات',
    avatarUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=500&auto=format&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'cont-2',
    name: 'م. عمر بن راشد البلوشي',
    companyName: 'مجموعة الرواسي للأبراج والمشاريع التجارية',
    category: 'commercial',
    rating: 4.8,
    reviewsCount: 98,
    verified: true,
    featured: true,
    location: 'مسقط، مرتفعات بوشر',
    coordinates: { lat: 23.5412, lng: 58.3912 },
    experienceYears: 15,
    completedProjectsCount: 54,
    bio: 'ريادة في تنفيذ المشاريع التجارية، المولات والمباني الإدارية، وتسليم المفتاح مع توفير حلول توفير الطاقة والاستدامة البيئية.',
    phone: '+968 9567 8901',
    email: 'contact@alrawasi-group.om',
    services: ['إنشاء الأبراج والمراكز التجارية', 'الهياكل الحديدية مسبقة الصنع', 'أنظمة الإطفاء والسلامة', 'إدارة وتنسيق الموقع'],
    startingPricePerMeter: 195, // in OMR
    licenseNumber: 'CR-40301129',
    classificationGrade: 'درجة ممتازة',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'cont-3',
    name: 'م. طارق الحارثي',
    companyName: 'القمة الماسية للتشطيبات والديكور',
    category: 'finishing',
    rating: 4.95,
    reviewsCount: 180,
    verified: true,
    featured: false,
    location: 'السيب، الموج مسقط',
    coordinates: { lat: 23.6300, lng: 58.2600 },
    experienceYears: 12,
    completedProjectsCount: 110,
    bio: 'خبراء اللمسات الأخيرة والتشطيبات الملكية. رخام عماني طبيعي وإيطالي، وجدران بدائل خشبية ورخامية، وحلول إضاءة ذكية مخفية.',
    phone: '+968 9433 2211',
    email: 'info@diamondpeak.om',
    services: ['تشطيب فاخر VIP', 'أعمال الجبس والدهانات الديكورية', 'أرضيات الرخام والباركيه', 'تأسيس شبكات السمارت هوم'],
    startingPricePerMeter: 115, // in OMR
    licenseNumber: 'CR-20504499',
    classificationGrade: 'درجة ثانية',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'cont-4',
    name: 'م. سالم الجابري',
    companyName: 'مؤسسة صلب الأساس للبنية التحتية',
    category: 'infrastructure',
    rating: 4.7,
    reviewsCount: 45,
    verified: true,
    featured: false,
    location: 'صحار، المنطقة الصناعية',
    coordinates: { lat: 24.3461, lng: 56.7075 },
    experienceYears: 20,
    completedProjectsCount: 72,
    bio: 'أعمال حفر وتسوية أراضي، شبكات مياه وصرف صحي، تمديد خطوط الكهرباء والاتصالات، وسفلتة وتأهيل المخططات السكنية والصناعية.',
    phone: '+968 9344 5566',
    email: 'admin@solb-infra.om',
    services: ['حفر وتدعيم التربة', 'شبكات المياه والصرف', 'أعمال الرصف والتعبيد', 'تأهيل المخططات'],
    startingPricePerMeter: 85, // in OMR
    licenseNumber: 'CR-20510984',
    classificationGrade: 'معتمد حكومي',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cont-5',
    name: 'م. يوسف بن حمد الغافري',
    companyName: 'شركة مدارات السيب للمقاولات العامة',
    category: 'residential',
    rating: 4.86,
    reviewsCount: 89,
    verified: true,
    featured: true,
    location: 'السيب، الخوض السادسة والمعبيلة',
    coordinates: { lat: 23.6100, lng: 58.1900 },
    experienceYears: 14,
    completedProjectsCount: 65,
    bio: 'تنفيذ الفلل السكنية الحديثة بأحدث المخططات المعمارية وإشراف هندسي يومي دقيق، سرعة في الإنجاز والتزام تام بالمواد الأصلية المعتمدة.',
    phone: '+968 9876 1122',
    email: 'madarat.seeb@const.om',
    services: ['بناء فلل تسليم مفتاح', 'هيكل خرساني عظم', 'عوازل أسطح وحمامات', 'أعمال السباكة والكهرباء الحديثة'],
    startingPricePerMeter: 145, // in OMR
    licenseNumber: 'CR-10452390',
    classificationGrade: 'درجة أولى',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'cont-6',
    name: 'م. سعيد بن سهيل كشوب',
    companyName: 'مؤسسة ظفار للأعمار والمنشآت السكنية',
    category: 'residential',
    rating: 4.92,
    reviewsCount: 114,
    verified: true,
    featured: false,
    location: 'صلالة، السعادة الشمالية',
    coordinates: { lat: 17.0350, lng: 54.1200 },
    experienceYears: 16,
    completedProjectsCount: 94,
    bio: 'خبرة متخصصة في طبيعة وأجواء محافظة ظفار، استخدام مواد مقاومة للرطوبة والخريف، وتشطيبات راقية للفلل والشاليهات السياحية.',
    phone: '+968 9988 3344',
    email: 'dhofar.const@oman.om',
    services: ['بناء فلل وشاليهات سياحية', 'خرسانة مقاومة للأملاح والرطوبة', 'واجهات حجرية عصرية', 'صيانة وتأهيل المباني'],
    startingPricePerMeter: 150, // in OMR
    licenseNumber: 'CR-30918844',
    classificationGrade: 'درجة أولى',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cont-7',
    name: 'م. أحمد بن ناصر الكندي',
    companyName: 'شركة قلعة نزوى للبناء الحديث',
    category: 'residential',
    rating: 4.88,
    reviewsCount: 78,
    verified: true,
    featured: false,
    location: 'نزوى، فرق والمخطط التجاري',
    coordinates: { lat: 22.9333, lng: 57.5333 },
    experienceYears: 13,
    completedProjectsCount: 52,
    bio: 'دمج الطابع المعماري العماني التراثي مع حداثة التنفيذ وجودة الخرسانات، فلل سكنية ومبان تجارية في نزوى ومحافظة الداخلية.',
    phone: '+968 9211 4455',
    email: 'info@nizwaconst.om',
    services: ['بناء فلل عصرية بطابع عماني', 'أعمال حديد تسليح وقوالب معدنية', 'تسليم على المفتاح', 'ضمانات إنشائية معتمدة'],
    startingPricePerMeter: 138, // in OMR
    licenseNumber: 'CR-20194488',
    classificationGrade: 'درجة ثانية',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  }
];

export const initialConsultants: Consultant[] = [
  {
    id: 'cons-1',
    name: 'د. مهندس ناصر بن حمود الرواحي',
    officeName: 'دار الرواحي للاستشارات الهندسية والتصميم المعماري',
    specialty: 'architectural',
    rating: 4.95,
    reviewsCount: 165,
    verified: true,
    featured: true,
    location: 'مسقط، حي الوزارات - الخوير',
    experienceYears: 22,
    accreditedProjectsCount: 210,
    bio: 'استشاري معتمد لدى جمعية المهندسين. حاصل على الدكتوراه في العمارة المستدامة من جامعة مانشستر. نقدم تصاميم معمارية أيقونية تعكس الأصالة العمانية العريقة والحداثة العالمية.',
    phone: '+968 9555 7788',
    email: 'rawahi@rawahi-consult.om',
    services: ['المخططات المعمارية التنفيذية 3D', 'إصدار إباحات وتراخيص البناء البلدية', 'الإشراف الهندسي الإلزامي والدوري', 'دراسات الاستدامة والترشيد للطاقة'],
    consultationFeePerHour: 55, // in OMR
    accreditationBody: 'جمعية المهندسين العمانية - مهندس استشاري',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'cons-2',
    name: 'م. مريم بنت خالد الهنائية',
    officeName: 'مكتب الأبعاد الإنشائية للاستشارات والتدقيق',
    specialty: 'structural',
    rating: 4.88,
    reviewsCount: 112,
    verified: true,
    featured: true,
    location: 'صلالة، منطقة الدهاريز',
    experienceYears: 16,
    accreditedProjectsCount: 145,
    bio: 'تصميم وحسابات إنشائية دقيقة تضمن أقصى أمان إنشائي مع تحسين استهلاك حديد التسليح والخرسانة بنسبة تصل إلى 25% دون المساس بالمتانة ومقاومة الرطوبة والأملاح.',
    phone: '+968 9677 4433',
    email: 'info@abaad-eng.om',
    services: ['المخططات الإنشائية المعتمدة', 'فحص سلامة المباني القائمة والتقارير الفنية', 'اختبارات التربة والأساسات', 'الإشراف على مراحل صب الخرسانة واستلام الحديد'],
    consultationFeePerHour: 45, // in OMR
    accreditationBody: 'اعتماد وزارة الإسكان والتخطيط العمراني',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    portfolioImages: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'cons-3',
    name: 'م. باسل القاسمي',
    officeName: 'رؤية الإتقان لإدارة المشاريع وضبط التكاليف',
    specialty: 'cost_control',
    rating: 4.85,
    reviewsCount: 76,
    verified: true,
    featured: false,
    location: 'صحار، بالقرب من الميناء',
    experienceYears: 14,
    accreditedProjectsCount: 88,
    bio: 'إعداد جداول الكميات (BOQ)، مراجعة عروض أسعار المقاولين وضبط التكاليف، وحوكمة ميزانيات مشاريع الفلل والمجمعات بدقة هندسية عالية.',
    phone: '+968 9912 3344',
    email: 'basel@itqan-pm.om',
    services: ['إعداد ومراجعة جدول الكميات والمواصفات', 'إدارة المناقصات وتأهيل المقاولين', 'حساب التكاليف والجدول الزمني الزمني (Primavera)', 'تدقيق المستخلصات المالية للمقاول'],
    consultationFeePerHour: 40, // in OMR
    accreditationBody: 'معهد إدارة المشاريع PMI - شهادة PMP معتمدة',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80'
  }
];

export const initialAdvertisements: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'طلب مقاول لتنفيذ فيلا مودرن طابقين وملحق في الحيل الشمالية - السيب',
    description: 'مطلوب مقاول مصنف درجة أولى أو ثانية لتنفيذ هيكل خرساني عظم وتشطيب فيلا سكنية مساحة الأرض 600 متر مربع ومسطح بناء 850م. الخرائط والمخططات معتمدة وإباحة البناء جاهزة من البلدية. نبحث عن جودة فائقة والتزام صارم بالجدول الزمني.',
    category: 'residential',
    location: 'السيب - الحيل الشمالية',
    budgetRange: '120,000 - 145,000 ر.ع.',
    projectArea: 850,
    authorName: 'الفاضل / سعيد العامري',
    authorType: 'client',
    contactPhone: '+968 9988 7766',
    status: 'active',
    urgency: 'high',
    featured: true,
    createdAt: new Date().toISOString(),
    deadline: '2026-10-15',
    bidsCount: 7
  },
  {
    id: 'ad-2',
    title: 'مطلوب مكتب استشاري للإشراف الهندسي الشامل على مشروع مجمع تجاري',
    description: 'نبحث عن مكتب هندسي استشاري معتمد للإشراف على مشروع مجمع تجاري ومعارض في منطقة غلا الصناعية بمسقط. مساحة الأرض 4500م. المهام تشمل الإشراف الإنشائي والمعماري والكهروميكانيكي واعتماد المواد والمستخلصات.',
    category: 'commercial',
    location: 'مسقط - غلا',
    budgetRange: '18,000 - 25,000 ر.ع. (إشراف كامل)',
    projectArea: 6200,
    authorName: 'شركة إعمار الأفق للاستثمار',
    authorType: 'client',
    contactPhone: '+968 9544 3322',
    status: 'active',
    urgency: 'medium',
    featured: true,
    createdAt: new Date().toISOString(),
    deadline: '2026-10-30',
    bidsCount: 4
  },
  {
    id: 'ad-3',
    title: 'فرصة مناقصة: توريد وتركيب واجهات زجاجية وألمنيوم استركشر لمبنى تجاري',
    description: 'طرح مناقصة لمقاول باطن متخصص لتنفيذ الواجهات الخارجية بنظام الكيرتن وول (Curtain Wall) والكلادينج لمبنى إداري من 6 طوابق في صحار.',
    category: 'tender',
    location: 'صحار - شارع الميناء',
    budgetRange: '75,000 - 90,000 ر.ع.',
    projectArea: 1800,
    authorName: 'مؤسسة صروح البناء الحديثة',
    authorType: 'contractor',
    contactPhone: '+968 9488 7665',
    status: 'active',
    urgency: 'high',
    featured: false,
    createdAt: new Date().toISOString(),
    deadline: '2026-10-10',
    bidsCount: 12
  },
  {
    id: 'ad-4',
    title: 'مشروع ترميم وتحديث منزل تراثي كلاسيكي وإعادة توزيع المساحات الداخلية',
    description: 'ترميم كامل يشمل عزل الأسطح، تجديد السباكة والكهرباء بالكامل، تنفيذ أرضيات رخام عماني طبيعي وديكورات أسقف كلاسيكية وجبسيات مغربية وأندلسية.',
    category: 'renovation',
    location: 'نزوى - فرق',
    budgetRange: '45,000 - 65,000 ر.ع.',
    projectArea: 1200,
    authorName: 'خالد بن حميد الكندي',
    authorType: 'client',
    contactPhone: '+968 9511 2233',
    status: 'active',
    urgency: 'low',
    featured: false,
    createdAt: new Date().toISOString(),
    deadline: '2026-11-01',
    bidsCount: 3
  }
];
