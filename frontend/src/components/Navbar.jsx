import { BriefcaseBusiness, Globe2, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../context/useLanguage'
import { useAuth } from '../context/useAuth'

function Navbar() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <NavLink className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark"><BriefcaseBusiness size={20} /></span>
          <span>E-DIL <strong>Ethiopia</strong></span>
        </NavLink>

        <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav className={`main-nav ${open ? 'is-open' : ''}`}>
          <NavLink to="/opportunities" onClick={() => setOpen(false)}>{t.nav.opportunities}</NavLink>
          <a href="/#how-it-works" onClick={() => setOpen(false)}>{t.nav.howItWorks}</a>
          <a href="/#about" onClick={() => setOpen(false)}>{t.nav.about}</a>
          <button className="language-toggle" type="button" onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}>
            <Globe2 size={16} /> {language === 'en' ? 'አማ' : 'EN'}
          </button>
          {user ? (
            <>
              <NavLink className="button button-outline" to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLink>
              <button className="button button-primary" type="button" onClick={() => { logout(); setOpen(false) }}>Sign out</button>
            </>
          ) : (
            <>
              <NavLink className="button button-outline" to="/signin">{t.actions.signIn}</NavLink>
              <NavLink className="button button-primary" to="/register">{t.actions.getStarted}</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
