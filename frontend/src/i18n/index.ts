import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr'
import en from './locales/en'
import ar from './locales/ar'

i18n.use(initReactI18next).init({
  resources: { fr, en, ar },
  lng: localStorage.getItem('gc_lang') || 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n
