import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr'
import en from './locales/en'
import ar from './locales/ar'

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('fi2t_lang') : null
const initialLng = savedLang && ['fr', 'en', 'ar'].includes(savedLang) ? savedLang : 'fr'

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLng
  document.documentElement.dir = initialLng === 'ar' ? 'rtl' : 'ltr'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: initialLng,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  })

export default i18n
