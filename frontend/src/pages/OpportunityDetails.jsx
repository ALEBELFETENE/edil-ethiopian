import { AlertCircle, ArrowLeft, Bookmark, CheckCircle2, LoaderCircle, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/useAuth'

function OpportunityDetails() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [opportunity, setOpportunity] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get(`/opportunities/${id}`)
      .then(({ data }) => setOpportunity(data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load this opportunity.'))
      .finally(() => setLoading(false))
  }, [id])

  async function saveOpportunity() {
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: `/opportunities/${id}` } })
      return
    }
    if (user.role !== 'seeker') {
      setError('Only job seekers can save opportunities.')
      return
    }
    try {
      if (saved) {
        await api.delete(`/saved-opportunities/${id}`)
        setSaved(false)
      } else {
        await api.post(`/saved-opportunities/${id}`)
        setSaved(true)
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save this opportunity.')
    }
  }

  async function apply(event) {
    event.preventDefault()
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: `/opportunities/${id}` } })
      return
    }
    if (user.role !== 'seeker') {
      setError('Only job seekers can submit applications.')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/applications', { opportunityId: id, coverLetter, resumeUrl })
      setSuccess('Your application was submitted successfully.')
      setCoverLetter('')
      setResumeUrl('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit your application.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <section className="section details-page"><div className="container"><div className="empty-state"><LoaderCircle className="spin" size={22} /> Loading opportunity...</div></div></section>
  if (error && !opportunity) return <section className="section details-page"><div className="container"><div className="empty-state"><AlertCircle size={28} /><h2>Opportunity unavailable</h2><p>{error}</p><Link className="dashboard-link" to="/opportunities">← Back to opportunities</Link></div></div></section>

  return (
    <section className="section details-page">
      <div className="container">
        <Link className="auth-back" to="/opportunities"><ArrowLeft size={16} /> Back to opportunities</Link>
        <div className="details-layout">
          <article className="details-card">
            <div className="opportunity-card-top"><span className="opportunity-type">{opportunity.type}</span><span><MapPin size={14} /> {opportunity.remote ? 'Remote' : opportunity.location || 'Ethiopia'}</span></div>
            <h1>{opportunity.title}</h1>
            <p className="details-employer">{opportunity.employer?.displayName || 'Verified employer'}</p>
            <button className="button button-outline save-button" type="button" onClick={saveOpportunity}><Bookmark size={16} /> {saved ? 'Saved' : 'Save opportunity'}</button>
            <div className="details-meta"><span>Category: {opportunity.category}</span><span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span></div>
            <h2>About this opportunity</h2>
            <p className="details-description">{opportunity.description}</p>
            {opportunity.requirements?.length > 0 && <><h2>Requirements</h2><ul className="details-list">{opportunity.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></>}
            {opportunity.skills?.length > 0 && <><h2>Skills</h2><div className="skill-list">{opportunity.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></>}
          </article>
          <aside className="apply-card">
            <h2>Apply for this opportunity</h2>
            <p>Applications through E-DIL are free.</p>
            {success && <div className="success-message"><CheckCircle2 size={17} /> {success}</div>}
            {error && <div className="form-error"><AlertCircle size={17} /> {error}</div>}
            {opportunity.applicationMethod === 'external' ? (
              <a className="button button-primary apply-button" href={opportunity.officialUrl} target="_blank" rel="noreferrer">Apply on official website</a>
            ) : (
              <form className="dashboard-form" onSubmit={apply}>
                <label>Cover letter<textarea value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} rows="6" placeholder="Tell the employer why you are a good fit." /></label>
                <label>Resume URL<input type="url" value={resumeUrl} onChange={(event) => setResumeUrl(event.target.value)} placeholder="https://..." /></label>
                <button className="button button-primary apply-button" type="submit" disabled={submitting}>{submitting && <LoaderCircle className="spin" size={17} />} {isAuthenticated ? 'Submit application' : 'Sign in to apply'}</button>
              </form>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}

export default OpportunityDetails
