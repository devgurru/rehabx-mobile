import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import enCommon from './locales/en/common.json';
import arCommon from './locales/ar/common.json';

const resources = {
  en: { common: enCommon },
  ar: { common: arCommon },
};

// Fallback if no locale is detected
let currentLanguage = 'en';

try {
  const deviceLocales = getLocales();
  if (deviceLocales && deviceLocales.length > 0) {
    const code = deviceLocales[0].languageCode;
    if (code === 'ar') currentLanguage = 'ar';
  }
} catch (e) {
  // Ignore error
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: currentLanguage,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
