import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'OMR' | 'SAR' | 'AED' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rateFromOMR: number; // 1 OMR = X Currency
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  OMR: {
    code: 'OMR',
    name: 'ريال عُماني',
    symbol: 'ر.ع.',
    rateFromOMR: 1.0,
    flag: '🇴🇲'
  },
  SAR: {
    code: 'SAR',
    name: 'ريال سعودي',
    symbol: 'ر.س.',
    rateFromOMR: 9.75,
    flag: '🇸🇦'
  },
  AED: {
    code: 'AED',
    name: 'درهم إماراتي',
    symbol: 'د.إ.',
    rateFromOMR: 9.54,
    flag: '🇦🇪'
  },
  USD: {
    code: 'USD',
    name: 'دولار أمريكي',
    symbol: '$',
    rateFromOMR: 2.60,
    flag: '🇺🇸'
  }
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInOMR: number, options?: { showCode?: boolean; decimals?: number }) => string;
  convertFromOMR: (amountInOMR: number) => number;
  currentCurrencyConfig: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to OMR (Omani Rial)
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('mihad_currency') as CurrencyCode | null;
    if (saved && CURRENCIES[saved]) {
      return saved;
    }
    return 'OMR';
  });

  useEffect(() => {
    localStorage.setItem('mihad_currency', currency);
  }, [currency]);

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
    }
  };

  const currentCurrencyConfig = CURRENCIES[currency];

  const convertFromOMR = (amountInOMR: number): number => {
    if (!amountInOMR || isNaN(amountInOMR)) return 0;
    return amountInOMR * currentCurrencyConfig.rateFromOMR;
  };

  const formatPrice = (
    amountInOMR: number, 
    options?: { showCode?: boolean; decimals?: number }
  ): string => {
    if (amountInOMR === undefined || amountInOMR === null || isNaN(amountInOMR)) return '0 ' + currentCurrencyConfig.symbol;
    
    const converted = amountInOMR * currentCurrencyConfig.rateFromOMR;
    const decimals = options?.decimals !== undefined 
      ? options.decimals 
      : (currency === 'OMR' ? 1 : 0);

    const formattedNumber = converted.toLocaleString('ar-OM', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    const symbol = options?.showCode ? currentCurrencyConfig.code : currentCurrencyConfig.symbol;
    return `${formattedNumber} ${symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatPrice,
      convertFromOMR,
      currentCurrencyConfig
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
