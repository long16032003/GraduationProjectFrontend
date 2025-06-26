import { useList, useUpdate } from '@refinedev/core';
import { useEffect, useState } from 'react';

interface UploadFileData {
  uid: string;
  name: string;
  url?: string;
  status?: string;
}

export interface SiteSettingsData {
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  openingHours: string;
  facebookUrl: string;
  zaloUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  fontSize: string;
  logo: UploadFileData[];
  favicon: UploadFileData[];
  bannerImages: UploadFileData[];
}

const defaultSettings: SiteSettingsData = {
  siteName: 'Nhà hàng Việt Nam',
  siteTagline: 'Hương vị truyền thống - Phục vụ chuyên nghiệp',
  contactEmail: 'contact@restaurant.com',
  contactPhone: '0901234567',
  address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
  openingHours: '08:00 - 22:00 (Thứ 2 - Chủ nhật)',
  facebookUrl: 'https://facebook.com/restaurant',
  zaloUrl: 'https://zalo.com/restaurant',
  primaryColor: '#e53935',
  secondaryColor: '#4caf50',
  accentColor: '#ff9800',
  headingFont: 'Montserrat, sans-serif',
  bodyFont: 'Roboto, sans-serif',
  fontSize: 'medium',
  logo: [],
  favicon: [],
  bannerImages: []
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);

  // Fetch settings from API
  const { data: settingsData, isLoading, refetch } = useList({
    resource: 'site-settings',
    pagination: { mode: 'off' },
  });

  // Update settings mutation
  const { mutate: updateSettings, isLoading: isUpdating } = useUpdate();

  // Process settings data from API
  useEffect(() => {
    if (settingsData?.data && Array.isArray(settingsData.data)) {
      const settingsMap: { [key: string]: string } = {};
      settingsData.data.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });

      const processedSettings: SiteSettingsData = {
        siteName: settingsMap['site_name'] || defaultSettings.siteName,
        siteTagline: settingsMap['site_tagline'] || defaultSettings.siteTagline,
        contactEmail: settingsMap['contact_email'] || defaultSettings.contactEmail,
        contactPhone: settingsMap['contact_phone'] || defaultSettings.contactPhone,
        address: settingsMap['address'] || defaultSettings.address,
        openingHours: settingsMap['opening_hours'] || defaultSettings.openingHours,
        facebookUrl: settingsMap['facebook_url'] || defaultSettings.facebookUrl,
        zaloUrl: settingsMap['zalo_url'] || defaultSettings.zaloUrl,
        primaryColor: settingsMap['primary_color'] || defaultSettings.primaryColor,
        secondaryColor: settingsMap['secondary_color'] || defaultSettings.secondaryColor,
        accentColor: settingsMap['accent_color'] || defaultSettings.accentColor,
        headingFont: settingsMap['heading_font'] || defaultSettings.headingFont,
        bodyFont: settingsMap['body_font'] || defaultSettings.bodyFont,
        fontSize: settingsMap['font_size'] || defaultSettings.fontSize,
        logo: settingsMap['logo'] ? JSON.parse(settingsMap['logo']) : [],
        favicon: settingsMap['favicon'] ? JSON.parse(settingsMap['favicon']) : [],
        bannerImages: settingsMap['banner_images'] ? JSON.parse(settingsMap['banner_images']) : [],
      };

      setSettings(processedSettings);
    } else if (settingsData?.data) {
      // Log unexpected data structure for debugging
      console.log('Unexpected settings data structure:', settingsData);
    }
  }, [settingsData]);

  const saveSettings = (newSettings: SiteSettingsData) => {
    // Convert to API format
    const settingsToUpdate = {
      site_name: newSettings.siteName,
      site_tagline: newSettings.siteTagline,
      contact_email: newSettings.contactEmail,
      contact_phone: newSettings.contactPhone,
      address: newSettings.address,
      opening_hours: newSettings.openingHours,
      facebook_url: newSettings.facebookUrl,
      zalo_url: newSettings.zaloUrl,
      primary_color: newSettings.primaryColor,
      secondary_color: newSettings.secondaryColor,
      accent_color: newSettings.accentColor,
      heading_font: newSettings.headingFont,
      body_font: newSettings.bodyFont,
      font_size: newSettings.fontSize,
      logo: JSON.stringify(newSettings.logo),
      favicon: JSON.stringify(newSettings.favicon),
      banner_images: JSON.stringify(newSettings.bannerImages),
    };

    return new Promise((resolve, reject) => {
      updateSettings(
        {
          resource: 'site-settings',
          id: '1',
          values: { settings: settingsToUpdate },
        },
        {
          onSuccess: (data) => {
            setSettings(newSettings);
            refetch();
            resolve(data);
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

  return {
    settings,
    isLoading,
    isUpdating,
    saveSettings,
    refetch,
  };
}; 