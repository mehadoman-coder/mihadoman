import React, { createContext, useContext, useState, useEffect } from 'react';

interface LogoSettings {
  logoUrl: string | null;
  platformName: string;
}

interface LogoContextType {
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  resetLogo: () => void;
}

const DEFAULT_LOGO_KEY = 'mihad_custom_logo_url';

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export const LogoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrlState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(DEFAULT_LOGO_KEY) || null;
    } catch {
      return null;
    }
  });

  const setLogoUrl = (url: string | null) => {
    setLogoUrlState(url);
    if (url) {
      localStorage.setItem(DEFAULT_LOGO_KEY, url);
    } else {
      localStorage.removeItem(DEFAULT_LOGO_KEY);
    }
  };

  const resetLogo = () => {
    setLogoUrlState(null);
    localStorage.removeItem(DEFAULT_LOGO_KEY);
  };

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl, resetLogo }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};
