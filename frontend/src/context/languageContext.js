import { createContext } from 'react'

export const translations = {
  en: {
    nav: { opportunities: 'Opportunities', howItWorks: 'How it works', about: 'About' },
    actions: { signIn: 'Sign in', getStarted: 'Get started', browse: 'Browse opportunities', search: 'Search' },
    hero: {
      eyebrow: 'Your next opportunity starts here',
      title: 'Find opportunities. Build your future.',
      description: 'Discover trusted jobs, internships, freelance projects, and scholarships built for Ethiopia.',
      searchPlaceholder: 'Search by title, skill, or keyword',
    },
    categories: { title: 'Explore by category', subtitle: 'Find the path that fits your next step.', jobs: 'Jobs', internships: 'Internships', freelance: 'Freelance', scholarships: 'Scholarships' },
    about: { eyebrow: 'About E-DIL Ethiopia', title: 'A trusted bridge between people and opportunity.', description: 'E-DIL Ethiopia helps opportunity seekers discover trusted jobs, internships, freelance projects, and scholarships while helping employers reach the right candidates.' },
    browse: { title: 'Browse opportunities', subtitle: 'Explore verified opportunities from across Ethiopia.', all: 'All opportunities', empty: 'Opportunities will appear here soon.' },
    trust: { label: 'Built for opportunity seekers in Ethiopia', verified: 'Verified listings', bilingual: 'Amharic and English', free: 'Free to get started' },
  },
  am: {
    nav: { opportunities: 'ዕድሎች', howItWorks: 'እንዴት ይሰራል', about: 'ስለ እኛ' },
    actions: { signIn: 'ግባ', getStarted: 'ጀምር', browse: 'ዕድሎችን ይመልከቱ', search: 'ፈልግ' },
    hero: {
      eyebrow: 'ቀጣዩ ዕድልዎ እዚህ ይጀምራል',
      title: 'ዕድሎችን ያግኙ። የወደፊትዎን ይገንቡ።',
      description: 'በኢትዮጵያ የተረጋገጡ የሥራ፣ internship፣ freelance እና scholarship ዕድሎችን ያግኙ።',
      searchPlaceholder: 'በርዕስ፣ ችሎታ ወይም keyword ይፈልጉ',
    },
    categories: { title: 'በምድብ ይፈልጉ', subtitle: 'ለቀጣዩ እርምጃዎ የሚስማማውን መንገድ ያግኙ።', jobs: 'ሥራዎች', internships: 'Internships', freelance: 'Freelance', scholarships: 'Scholarships' },
    about: { eyebrow: 'ስለ E-DIL Ethiopia', title: 'ሰዎችን ከዕድል ጋር የሚያገናኝ የታመነ መድረክ።', description: 'E-DIL Ethiopia የሥራ ፈላጊዎችን ከተረጋገጡ የሥራ፣ internship፣ freelance እና scholarship ዕድሎች ጋር ያገናኛል።' },
    browse: { title: 'ዕድሎችን ይመልከቱ', subtitle: 'ከመላው ኢትዮጵያ የተረጋገጡ ዕድሎችን ያግኙ።', all: 'ሁሉም ዕድሎች', empty: 'ዕድሎች በቅርቡ እዚህ ይታያሉ።' },
    trust: { label: 'በኢትዮጵያ ላሉ ዕድል ፈላጊዎች የተሰራ', verified: 'የተረጋገጡ ማስታወቂያዎች', bilingual: 'አማርኛ እና English', free: 'ለመጀመር ነፃ' },
  },
}

export const LanguageContext = createContext(null)
