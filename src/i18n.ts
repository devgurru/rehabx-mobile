import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enProfile from './locales/en/profile.json';
import arProfile from './locales/ar/profile.json';
import enAssessment from './locales/en/assessment.json';
import arAssessment from './locales/ar/assessment.json';
import enMilestones from './locales/en/milestones.json';
import arMilestones from './locales/ar/milestones.json';
import enTimeline from './locales/en/timeline.json';
import arTimeline from './locales/ar/timeline.json';
import enProgram from './locales/en/program.json';
import arProgram from './locales/ar/program.json';
import enExercises from './locales/en/exercises.json';
import arExercises from './locales/ar/exercises.json';
import enHome from './locales/en/home.json';
import arHome from './locales/ar/home.json';
import enProgress from './locales/en/progress.json';
import arProgress from './locales/ar/progress.json';
import enLogin from './locales/en/login.json';
import arLogin from './locales/ar/login.json';

const resources = {
  en: { 
    profile: enProfile,
    assessment: enAssessment,
    milestones: enMilestones,
    timeline: enTimeline,
    program: enProgram,
    exercises: enExercises,
    home: enHome,
    progress: enProgress,
    login: enLogin,
  },
  ar: { 
    profile: arProfile,
    assessment: arAssessment,
    milestones: arMilestones,
    timeline: arTimeline,
    program: arProgram,
    exercises: arExercises,
    home: arHome,
    progress: arProgress,
    login: arLogin,
  },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLang = await AsyncStorage.getItem('appLanguage');
      if (storedLang) {
        const isRTL = storedLang === 'ar';
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        return callback(storedLang);
      }
    } catch (error) {
      // Ignore
    }
    let currentLanguage = 'en';
    try {
      const deviceLocales = getLocales();
      if (deviceLocales && deviceLocales.length > 0) {
        const code = deviceLocales[0].languageCode;
        if (code === 'ar') currentLanguage = 'ar';
      }
    } catch (e) {}

    const isRTL = currentLanguage === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    callback(currentLanguage);
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    AsyncStorage.setItem('appLanguage', lng).catch(() => {});
  },
};

void i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'profile',
    fallbackNS: ['profile', 'assessment', 'program', 'milestones', 'timeline', 'exercises', 'home', 'progress', 'login'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
