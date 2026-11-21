import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanguage } from '../context/useLanguage'
import api from '../services/api'
import { Link } from 'react-router-dom'

function BrowseOpportunities() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
      api.get('/opportunities', { params: { q: query || undefined, type: type || undefined } })
        .then(({ data }) => setOpportunities(data.data))
        .catch((requestError) => {
          setOpportunities([])
          setError(requestError.response?.data?.message || 'Unable to load opportunities.')
        })
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timer)
  }, [query, type])

  return (
    <section className="section browse-page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">{t.browse.all}</span>
          <h1>{t.browse.title}</h1>
          <p>{t.browse.subtitle}</p>
        </div>
        <div className="browse-toolbar">
          <div className="browse-input"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.hero.searchPlaceholder} /></div>
          <label className="filter-button"><SlidersHorizontal size={17} /><span>Type</span>
            <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by opportunity type">
              <option value="">All</option>
              <option value="job">Jobs</option>
              <option value="internship">Internships</option>
              <option value="freelance">Freelance</option>
              <option value="scholarship">Scholarships</option>
            </select>
          </label>
        </div>
        {loading && <div className="empty-state"><p>Loading opportunities...</p></div>}
        {!loading && error && <div className="empty-state"><h2>Unable to load opportunities</h2><p>{error}</p></div>}
        {!loading && !error && opportunities.length === 0 && <div className="empty-state">
          <span className="empty-icon"><Search size={28} /></span>
          <h2>{t.browse.empty}</h2>
          <p>We are preparing trusted opportunities for you.</p>
        </div>}
        {!loading && !error && opportunities.length > 0 && <div className="opportunity-grid">
          {opportunities.map((opportunity) => (
            <Link className="opportunity-card" to={`/opportunities/${opportunity._id}`} key={opportunity._id}>
              <div className="opportunity-card-top"><span className="opportunity-type">{opportunity.type}</span><span>{opportunity.remote ? 'Remote' : opportunity.location || 'Ethiopia'}</span></div>
              <h2>{opportunity.title}</h2>
              <p>{opportunity.employer?.displayName || 'Verified employer'}</p>
              <div className="opportunity-card-bottom"><span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span><span className="card-arrow">→</span></div>
            </Link>
          ))}
        </div>}
      </div>
    </section>
  )
}

export default BrowseOpportunities
