import React, { useState, useRef, useEffect } from 'react';
import { Coins, ChevronDown, Check } from 'lucide-react';
import { useCurrency, CURRENCIES, CurrencyCode } from '../context/CurrencyContext';

interface CurrencySelectorProps {
  compact?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ compact = false }) => {
  const { currency, setCurrency, currentCurrencyConfig } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currenciesList = Object.values(CURRENCIES);

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-xl glass-card border border-slate-700/80 hover:border-slate-500/80 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:bg-slate-800/60"
        title="تغيير العملة"
        aria-label="تغيير العملة المعروضة"
      >
        <span className="text-sm">{currentCurrencyConfig.flag}</span>
        <span className="text-slate-200">{currentCurrencyConfig.symbol}</span>
        {!compact && (
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({currentCurrencyConfig.code})</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-[#0d182e]/95 backdrop-blur-xl border border-slate-700/90 shadow-2xl p-1.5 z-50 animate-fade-in divide-y divide-slate-800">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400">
            اختر عملة المنصة المفضلة:
          </div>
          <div className="py-1 space-y-0.5">
            {currenciesList.map((curr) => {
              const isSelected = curr.code === currency;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    setCurrency(curr.code as CurrencyCode);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/30 text-white border border-blue-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{curr.flag}</span>
                    <div className="text-right">
                      <div className="text-xs font-bold">{curr.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{curr.code} ({curr.symbol})</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
