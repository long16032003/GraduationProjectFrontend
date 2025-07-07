import { useState, useEffect } from 'react';
import { useList } from '@refinedev/core';

export interface SiteSettingsType {
  site_name?: string;
  site_tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  opening_hours?: string;
  facebook_url?: string;
  zalo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  heading_font?: string;
  body_font?: string;
  font_size?: string;
  logo?: string;
  favicon?: string;
  banner_images?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettingsType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from API
  const { data: settingsData, isLoading: apiLoading, error: apiError } = useList({
    resource: 'site-settings',
    pagination: { mode: 'off' },
  });

  useEffect(() => {
    setIsLoading(apiLoading);
    
    if (apiError) {
      setError(apiError.message || 'Failed to fetch site settings');
      setIsLoading(false);
      return;
    }

    if (settingsData?.data) {
      // The API returns settings as key-value pairs in an object
      const processedSettings = settingsData.data as SiteSettingsType;
      setSettings(processedSettings);
      setError(null);
    }
    
    setIsLoading(false);
  }, [settingsData, apiLoading, apiError]);

  // Helper function to get a specific setting with fallback
  const getSetting = (key: keyof SiteSettingsType, fallback: string = ''): string => {
    return settings[key] || fallback;
  };

  // Helper function to get parsed JSON setting
  const getJsonSetting = (key: keyof SiteSettingsType, fallback: any = null): any => {
    const value = settings[key];
    if (!value) return fallback;
    
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  // Apply settings to document (for fonts, colors, etc.)
  const applySettings = () => {
    const root = document.documentElement;
    
    // Apply color variables
    if (settings.primary_color) {
      root.style.setProperty('--primary-color', settings.primary_color);
    }
    if (settings.secondary_color) {
      root.style.setProperty('--secondary-color', settings.secondary_color);
    }
    if (settings.accent_color) {
      root.style.setProperty('--accent-color', settings.accent_color);
    }
    
    // Apply font variables
    if (settings.heading_font) {
      root.style.setProperty('--heading-font', settings.heading_font);
    }
    if (settings.body_font) {
      root.style.setProperty('--body-font', settings.body_font);
    }
    
    // Apply font size
    if (settings.font_size) {
      let fontSize = '16px';
      switch (settings.font_size) {
        case 'small':
          fontSize = '14px';
          break;
        case 'large':
          fontSize = '18px';
          break;
        default:
          fontSize = '16px';
      }
      root.style.setProperty('--base-font-size', fontSize);
    }
    
    // Apply favicon
    if (settings.favicon) {
      try {
        const faviconData = JSON.parse(settings.favicon);
        if (faviconData.length > 0 && faviconData[0].url) {
          const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (favicon) {
            favicon.href = faviconData[0].url;
          }
        }
      } catch (e) {
        // Ignore favicon parsing errors
      }
    }
    
    // Apply title
    if (settings.site_name) {
      document.title = settings.site_name;
    }
  };

  // Apply settings when they change
  useEffect(() => {
    if (!isLoading && settings) {
      applySettings();
    }
  }, [settings, isLoading]);

  return {
    settings,
    isLoading,
    error,
    getSetting,
    getJsonSetting,
    applySettings,
  };
}; 