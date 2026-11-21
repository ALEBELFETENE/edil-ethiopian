import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const currentYear = new Date().getFullYear()

function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <span><strong>E-DIL Ethiopia</strong> — Find Opportunities. Build Your Future.</span>
          <span>© {currentYear} E-DIL Ethiopia</span>
        </div>
      </footer>
    </div>
  )
}

export default Layout
