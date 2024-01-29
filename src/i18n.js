import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation files
import translationEN from './locales/en.json';
import translationZH from './locales/zh.json';

const resources = {
  en: {
    translation: translationEN
  },
  zh: {
    translation: translationZH
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh', // Set the default language
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
