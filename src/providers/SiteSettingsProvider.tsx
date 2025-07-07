import React, { createContext, useContext, type ReactNode } from 'react';
import { useSiteSettings, type SiteSettingsType } from '@/hooks/useSiteSettings';

interface SiteSettingsContextType {
  settings: SiteSettingsType;
  isLoading: boolean;
  error: string | null;
  getSetting: (key: keyof SiteSettingsType, fallback?: string) => string;
  getJsonSetting: (key: keyof SiteSettingsType, fallback?: any) => any;
  applySettings: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

interface SiteSettingsProviderProps {
  children: ReactNode;
}

export const SiteSettingsProvider: React.FC<SiteSettingsProviderProps> = ({ children }) => {
  const siteSettings = useSiteSettings();

  return (
    <SiteSettingsContext.Provider value={siteSettings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettingsContext = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettingsContext must be used within a SiteSettingsProvider');
  }
  return context;
}; 