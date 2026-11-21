import { useMemo, useState } from 'react'
import { LanguageContext, translations } from './languageContext'

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('edil-language') || 'en')

  const value = useMemo(() => ({
    language,
    setLanguage: (nextLanguage) => {
      localStorage.setItem('edil-language', nextLanguage)
      setLanguage(nextLanguage)
    },
    t: translations[language],
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
