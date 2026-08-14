import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr'
import en from './locales/en'
import ar from './locales/ar'

const lng = localStorage.getItem('gc_lang') || 'fr'

i18n.use(initReactI18next).init({
  resources: { fr, en, ar },
  lng,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

function applyDir(code: string) {
  const lang = code.split('-')[0]
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

applyDir(i18n.language)
i18n.on('languageChanged', (code) => {
  localStorage.setItem('gc_lang', code)
  applyDir(code)
})

export default i18n
