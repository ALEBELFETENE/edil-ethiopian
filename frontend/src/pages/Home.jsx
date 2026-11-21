import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/useLanguage'

const categories = [
  { key: 'jobs', icon: BriefcaseBusiness, color: 'green' },
  { key: 'internships', icon: GraduationCap, color: 'blue' },
  { key: 'freelance', icon: Sparkles, color: 'orange' },
  { key: 'scholarships', icon: BookOpen, color: 'purple' },
]

function Home() {
  const { t } = useLanguage()

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{t.hero.eyebrow}</span>
            <h1>{t.hero.title}</h1>
            <p>{t.hero.description}</p>
            <form className="search-bar" onSubmit={(event) => event.preventDefault()}>
              <Search size={20} />
              <input aria-label={t.hero.searchPlaceholder} placeholder={t.hero.searchPlaceholder} />
              <Link className="button button-primary" to="/opportunities">{t.actions.search}</Link>
            </form>
            <div className="trust-row">
              <span>✓ {t.trust.verified}</span>
              <span>✓ {t.trust.bilingual}</span>
              <span>✓ {t.trust.free}</span>
            </div>
          </div>
          <div className="hero-card" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="floating-card card-top"><span className="status-dot" /> New opportunity</div>
            <div className="hero-stat"><strong>Find your next step</strong><span>Jobs • Internships • More</span></div>
            <div className="floating-card card-bottom"><span className="check-mark">✓</span> Build your future</div>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">Explore</span><h2>{t.categories.title}</h2></div>
            <p>{t.categories.subtitle}</p>
          </div>
          <div className="category-grid">
            {categories.map(({ key, icon: Icon, color }) => (
              <Link className="category-card" to={`/opportunities?type=${key}`} key={key}>
                <span className={`category-icon ${color}`}><Icon size={24} /></span>
                <span className="category-name">{t.categories[key]}</span>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="container about-content">
          <span className="eyebrow">{t.about.eyebrow}</span>
          <h2>{t.about.title}</h2>
          <p>{t.about.description}</p>
        </div>
      </section>
    </>
  )
}

export default Home
