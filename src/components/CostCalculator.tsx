import React, { useState } from 'react';
import { 
  Calculator, 
  Layers, 
  Home, 
  Building, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  FileSpreadsheet, 
  ArrowRight, 
  Coins, 
  Clock, 
  ShieldAlert,
  HardHat,
  Compass,
  Briefcase
} from 'lucide-react';
import { GlassIcon } from './GlassIcon';
import { CostCalculationResult } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencySelector } from './CurrencySelector';

interface CostCalculatorProps {
  onFindContractors?: () => void;
  onFindConsultants?: () => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  onFindContractors,
  onFindConsultants
}) => {
  const { formatPrice, currentCurrencyConfig } = useCurrency();

  // Inputs
  const [buildingType, setBuildingType] = useState<'villa' | 'duplex' | 'building' | 'commercial'>('villa');
  const [landArea, setLandArea] = useState<number>(450);
  const [floorsCount, setFloorsCount] = useState<number>(2.5);
  const [constructionType, setConstructionType] = useState<'skeleton' | 'turnkey_standard' | 'turnkey_luxury' | 'turnkey_royal'>('turnkey_luxury');
  const [basement, setBasement] = useState<boolean>(false);
  const [poolAndGarden, setPoolAndGarden] = useState<boolean>(true);
  const [smartHome, setSmartHome] = useState<boolean>(true);
  const [elevator, setElevator] = useState<boolean>(true);
  const [city, setCity] = useState<'muscat' | 'salalah' | 'sohar' | 'nizwa' | 'riyadh' | 'dubai' | 'other'>('muscat');

  // Calculation logic based on base OMR rates (Omani Rial as primary standard)
  const calculateCosts = (): CostCalculationResult => {
    // Built up area calculation (Ground + First + Roof Annex)
    const footprintRatio = buildingType === 'villa' ? 0.60 : buildingType === 'commercial' ? 0.70 : 0.65;
    const baseFloorArea = landArea * footprintRatio;
    
    let totalBuiltArea = baseFloorArea * floorsCount;
    if (basement) {
      totalBuiltArea += baseFloorArea * 0.95;
    }

    // Base rates per m2 in OMR (الريال العماني)
    let baseRateSkeleton = 65; // العظم بالمواد (حوالي 65 ر.ع. / م²)
    let baseRateFinishing = 90; // التشطيب

    if (constructionType === 'skeleton') {
      baseRateFinishing = 0;
    } else if (constructionType === 'turnkey_standard') {
      baseRateFinishing = 70;
    } else if (constructionType === 'turnkey_luxury') {
      baseRateFinishing = 115;
    } else if (constructionType === 'turnkey_royal') {
      baseRateFinishing = 175;
    }

    // Regional multiplier
    const cityMultiplier = 
      city === 'muscat' ? 1.05 : 
      city === 'salalah' ? 1.02 : 
      city === 'sohar' ? 0.98 : 
      city === 'nizwa' ? 0.96 :
      city === 'riyadh' ? 1.08 :
      city === 'dubai' ? 1.10 : 1.00;

    // Direct skeleton cost (in OMR)
    const skeletonCost = totalBuiltArea * baseRateSkeleton * cityMultiplier;

    // Direct finishing cost (in OMR)
    let finishingCost = totalBuiltArea * baseRateFinishing * cityMultiplier;

    // Addons in OMR
    if (elevator) finishingCost += 8500;
    if (smartHome) finishingCost += 4200;
    if (poolAndGarden) finishingCost += 7500;
    if (basement) finishingCost += 9000; // Extra isolation & tanking

    // MEP / HVAC (التكييف المركزي والكهرباء والسباكة) in OMR
    const hvacAndElectricalCost = totalBuiltArea * (constructionType === 'turnkey_royal' ? 24 : 18);

    // Engineering Consultancy & Supervision (المخططات والتراخيص والإشراف الدوري) in OMR
    const consultancyAndPermitsCost = Math.round(totalBuiltArea * 6.5 + 1800);

    // Contingency 5%
    const subtotal = skeletonCost + finishingCost + hvacAndElectricalCost + consultancyAndPermitsCost;
    const contingencyReserve = Math.round(subtotal * 0.05);

    const totalEstimatedCost = Math.round(subtotal + contingencyReserve);
    const costPerMeter = Math.round(totalEstimatedCost / totalBuiltArea);

    // Estimated duration
    const estimatedDurationMonths = buildingType === 'villa' 
      ? (basement ? 16 : 12) 
      : (basement ? 24 : 18);

    const breakdown = [
      {
        item: 'الهيكل الإنشائي (عظم بالمواد)',
        cost: Math.round(skeletonCost),
        percentage: Math.round((skeletonCost / totalEstimatedCost) * 100),
        details: 'حفر، خرسانات مسلحة مقاومة، حديد تسليح معتمد، وبلوك معزول ومقاوم للحرارة والرطوبة'
      },
      {
        item: 'أعمال التشطيب والديكور والواجهات',
        cost: Math.round(finishingCost),
        percentage: Math.round((finishingCost / totalEstimatedCost) * 100),
        details: 'رخام طبيعي/بورسلان، دهانات فائقة الجودة، أبواب خشبية راقية، وألمنيوم قطاع حراري دبل جلاس'
      },
      {
        item: 'الأعمال الكهروميكانيكية والتكييف (MEP)',
        cost: Math.round(hvacAndElectricalCost),
        percentage: Math.round((hvacAndElectricalCost / totalEstimatedCost) * 100),
        details: 'تكييف مركزي وكونسيلد، تمديدات صحية حرارية معتمدة، وقواطع وكابلات كهربائية مطابقة للمواصفات'
      },
      {
        item: 'الاستشارات الهندسية والإشراف والتراخيص',
        cost: Math.round(consultancyAndPermitsCost),
        percentage: Math.round((consultancyAndPermitsCost / totalEstimatedCost) * 100),
        details: 'مخططات معمارية وإنشائية تنفيذية، إباحات وتراخيص البناء، إشراف هندسي مستمر وتقارير جودة'
      },
      {
        item: 'احتياطي الطوارئ وتذبذب الأسعار (5%)',
        cost: contingencyReserve,
        percentage: 5,
        details: 'هامش أمان مالي معتمد لتغطية أي تعديلات معمارية أو تغيرات طارئة في أسعار المواد'
      }
    ];

    return {
      totalEstimatedCost,
      costPerMeter,
      skeletonCost,
      finishingCost,
      consultancyAndPermitsCost,
      hvacAndElectricalCost,
      contingencyReserve,
      estimatedDurationMonths,
      breakdown
    };
  };

  const result = calculateCosts();
  const builtAreaApprox = Math.round(landArea * (buildingType === 'villa' ? 0.6 : 0.65) * floorsCount + (basement ? landArea * 0.55 : 0));

  return (
    <div id="calculator-section" className="relative space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-icon-badge text-blue-200 text-sm font-semibold border border-blue-400/30">
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span>حاسبة تكاليف البناء والإنشاءات الذكية 2026</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold silver-gradient-text tracking-tight">
          حاسبة تكاليف البناء والمشاريع الإنشائية
        </h2>
        <p className="text-slate-300 text-base md:text-lg leading-relaxed">
          احسب تقدير تكلفة مشروعك بدقة فورية وفق أسعار السوق والمواصفات القياسية المعتمدة، مع إمكانية عرض التكلفة بالريال العماني أو العملات الخليجية والدولار.
        </p>

        {/* Currency Switcher in Header for Quick Access */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <span className="text-xs text-slate-400 font-medium">العملة المعروضة:</span>
          <CurrencySelector />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 space-y-6 border border-slate-700/50">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <GlassIcon icon={Calculator} size="md" variant="royal" />
              <div>
                <h3 className="text-lg font-bold text-white">بيانات ومعايير المشروع</h3>
                <p className="text-xs text-slate-400">حدد مواصفات العقار لاحتساب التكلفة التقديرية</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              دقة الحساب: ~95%
            </span>
          </div>

          {/* Building Type Selector */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-200 block">نوع المبنى والنشاط</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'villa', label: 'فيلا سكنية مستقلة', icon: Home },
                { id: 'duplex', label: 'دوبلكس / تاون هاوس', icon: Building },
                { id: 'building', label: 'عمارة سكنية / شقق', icon: Layers },
                { id: 'commercial', label: 'مبنى تجاري / مكاتب', icon: Briefcase }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBuildingType(item.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      buildingType === item.id
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg ring-1 ring-blue-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-blue-300" />
                    <span className="text-xs font-bold text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Land Area and Floors Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-200">
                <span>مساحة الأرض</span>
                <span className="text-blue-300 font-bold">{landArea} م²</span>
              </div>
              <input
                type="range"
                min={200}
                max={2500}
                step={25}
                value={landArea}
                onChange={(e) => setLandArea(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>200 م²</span>
                <span>1200 م²</span>
                <span>2500 م²</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-200">
                <span>عدد الأدوار والارتفاع</span>
                <span className="text-blue-300 font-bold">
                  {floorsCount === 1 ? 'دور أرضي' : floorsCount === 2 ? 'دوران' : floorsCount === 2.5 ? 'دوران وملحق' : `${floorsCount} أدوار`}
                </span>
              </div>
              <select
                value={floorsCount}
                onChange={(e) => setFloorsCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white border border-slate-700 text-sm"
              >
                <option value={1} className="bg-slate-900">دور أرضي فقط (1 دور)</option>
                <option value={2} className="bg-slate-900">دوران (أرضي + أول)</option>
                <option value={2.5} className="bg-slate-900">دوران وملحق علوي (2.5 دور)</option>
                <option value={3} className="bg-slate-900">3 أدوار كاملة</option>
                <option value={4} className="bg-slate-900">4 أدوار (عمارة سكنية)</option>
                <option value={5} className="bg-slate-900">5 أدوار تجارية</option>
              </select>
            </div>
          </div>

          {/* Construction & Finish Type */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-slate-200 block">مستوى ومرحلة التنفيذ المطلوبة</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'skeleton', title: 'هيكل عظم بالمواد فقط', desc: 'خرسانات مسلحة وحديد وبلوك عازل' },
                { id: 'turnkey_standard', title: 'تسليم مفتاح قياسي اقتصادي', desc: 'تشطيب أساسي ومواد مطابقة للمواصفات' },
                { id: 'turnkey_luxury', title: 'تسليم مفتاح ديلوكس فاخر', desc: 'بورسلان فاخر، جبس مودرن، ألمنيوم دبل' },
                { id: 'turnkey_royal', title: 'تشطيب ملكي فائق الفخامة VIP', desc: 'رخام طبيعي، واجهات حجر، أنظمة ذكية' }
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setConstructionType(tier.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    constructionType === tier.id
                      ? 'bg-blue-900/40 border-blue-400 shadow-md ring-1 ring-blue-400/50'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${constructionType === tier.id ? 'text-white' : 'text-slate-300'}`}>
                      {tier.title}
                    </span>
                    {constructionType === tier.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-xs text-slate-400">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* City Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-200 block mb-1.5">المدينة أو المحافظة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white border border-slate-700 text-sm"
              >
                <option value="muscat" className="bg-slate-900">محافظة مسقط (السيب، بوشر، القرم)</option>
                <option value="salalah" className="bg-slate-900">صلالة ومحافظة ظفار</option>
                <option value="sohar" className="bg-slate-900">صحار وشمال الباطنة</option>
                <option value="nizwa" className="bg-slate-900">نزوى ومحافظة الداخلية</option>
                <option value="riyadh" className="bg-slate-900">الرياض (المملكة العربية السعودية)</option>
                <option value="dubai" className="bg-slate-900">دبي (دولة الإمارات)</option>
                <option value="other" className="bg-slate-900">بقية المناطق والمحافظات</option>
              </select>
            </div>

            {/* Approximate Built Area summary */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-300 block">إجمالي مسطحات البناء التقريبية</span>
                <span className="text-lg font-bold text-white">{builtAreaApprox.toLocaleString()} م²</span>
              </div>
              <Info className="w-5 h-5 text-blue-400/70" />
            </div>
          </div>

          {/* Addons Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              إضافات وتجهيزات تكميلية متقدمة
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'بدروم (قبو كامل)', val: basement, setter: setBasement },
                { label: 'مصعد راكب ميتسوبيشي', val: elevator, setter: setElevator },
                { label: 'نظام المنازل الذكية', val: smartHome, setter: setSmartHome },
                { label: 'مسبح وحديقة خارجية', val: poolAndGarden, setter: setPoolAndGarden }
              ].map((item, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    item.val ? 'bg-blue-900/30 border-blue-500/50 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="accent-blue-500 rounded w-4 h-4 cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results & Financial Summary Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Total Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-blue-500/40 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-52 h-52 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200">
                  التقدير المالي الإجمالي الشامل
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>المدة المتوقعة: ~{result.estimatedDurationMonths} شهر</span>
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">التكلفة التقديرية لكامل المشروع</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {formatPrice(result.totalEstimatedCost)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>متوسط تكلفة المتر المسطح: </span>
                  <strong className="text-white font-bold">{formatPrice(result.costPerMeter)} / م²</strong>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>توزيع الميزانية الإنشائية</span>
                  <span>100%</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-700/70">
                  <div style={{ width: `${result.breakdown[0].percentage}%` }} className="bg-blue-600" title="عظم" />
                  <div style={{ width: `${result.breakdown[1].percentage}%` }} className="bg-sky-400" title="تشطيب" />
                  <div style={{ width: `${result.breakdown[2].percentage}%` }} className="bg-indigo-400" title="كهروميكانيك" />
                  <div style={{ width: `${result.breakdown[3].percentage}%` }} className="bg-amber-400" title="استشارات" />
                  <div style={{ width: `${result.breakdown[4].percentage}%` }} className="bg-slate-400" title="طوارئ" />
                </div>
              </div>

              {/* Items Breakdown List */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">{item.item}</span>
                      <span className="font-mono font-bold text-blue-300">{formatPrice(item.cost)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{item.details}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="pt-2 space-y-2.5">
                {onFindContractors && (
                  <button
                    type="button"
                    onClick={onFindContractors}
                    className="w-full py-3 px-4 rounded-xl royal-gradient-btn text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <HardHat className="w-4 h-4" />
                    <span>طلب عروض أسعار من المقاولين المعتمدين</span>
                  </button>
                )}
                {onFindConsultants && (
                  <button
                    type="button"
                    onClick={onFindConsultants}
                    className="w-full py-2.5 px-4 rounded-xl silver-btn text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-blue-300" />
                    <span>تعيين مكتب استشاري للإشراف والمخططات</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
