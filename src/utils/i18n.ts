import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'; // https://react.i18next.com/latest/using-with-hooks
import Backend from 'i18next-http-backend'; // For lazy loading for translations: https://github.com/i18next/i18next-http-backend
import detector from 'i18next-browser-languagedetector'; // For auto detecting the user language: https://github.com/i18next/i18next-browser-languageDetector

// https://refine.dev/docs/guides-concepts/i18n/#translation-file

i18n
  .use(Backend)
  .use(detector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['vi', 'en'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // locale files path
    },
    ns: ['common', 'table'],
    defaultNS: 'common',
    fallbackLng: ['vi'],
    lng: 'vi', // Set Vietnamese as default language
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;