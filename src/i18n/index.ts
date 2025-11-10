// src/i18n/index.ts
// Internationalization system

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './locales/en.json';
import pt from './locales/pt.json';

// Get device language
const deviceLanguage = RNLocalize.getLocales()[0]?.languageCode || 'en';

// Supported languages
const resources = {
  en: { translation: en },
  pt: { translation: pt }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage === 'pt' ? 'pt' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

// Helper function to get character name translation
export const getCharacterName = (character: string): string => {
  return i18n.t(`characters.${character}`);
};

// Helper function to get action name translation
export const getActionName = (action: string): string => {
  return i18n.t(`actions.${action}`);
};

