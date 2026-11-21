import { AlertCircle, BriefcaseBusiness, CheckCircle2, FileUp, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/useAuth'

const emptyEmployerProfile = { displayName: '', description: '', website: '' }
const postingPaymentInstructions = {
  telebirr: '0962514217',
  cbe: '1000326722158',
  abyssinia: '250497072',
}

function readReceipt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function SeekerDashboard() {
  const [applications, setApplications] = useState([])
  const [savedOpportunities, setSavedOpportunities] = useState([])
  const [error, setError] = useState('')
  const [withdrawing, setWithdrawing] = useState('')
  const [savedError, setSavedError] = useState('')

  useEffect(() => {
    api.get('/applications/mine')
      .then(({ data }) => setApplications(data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load applications.'))
    api.get('/saved-opportunities')
      .then(({ data }) => setSavedOpportunities(data.data))
      .catch((requestError) => setSavedError(requestError.response?.data?.message || 'Unable to load saved opportunities.'))
  }, [])

  async function withdraw(applicationId) {
    if (!window.confirm('Withdraw this application?')) return
    setWithdrawing(applicationId)
    setError('')
    try {
      await api.patch(`/applications/${applicationId}/withdraw`)
      setApplications((items) => items.map((item) => item._id === applicationId ? { ...item, status: 'withdrawn' } : item))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to withdraw application.')
    } finally {
      setWithdrawing('')
    }
  }

  return (
    <>
      <DashboardPanel title="My applications" subtitle="Track every opportunity you have applied for.">
      {error && <ErrorMessage message={error} />}
      {!error && applications.length === 0 && <EmptyPanel text="You have not submitted any applications yet." />}
      <div className="dashboard-list">
        {applications.map((application) => (
          <div className="dashboard-list-item" key={application._id}>
            <div>
              <strong>{application.opportunity?.title || 'Opportunity'}</strong>
              <span>{application.opportunity?.type || 'Application'} · {new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="application-actions">
              <span className={`status-badge status-${application.status}`}>{application.status}</span>
              {!['rejected', 'accepted', 'withdrawn'].includes(application.status) && <button className="button button-small button-danger" type="button" disabled={withdrawing === application._id} onClick={() => withdraw(application._id)}>Withdraw</button>}
            </div>
          </div>
        ))}
      </div>
      </DashboardPanel>
      <SavedOpportunities savedOpportunities={savedOpportunities} setSavedOpportunities={setSavedOpportunities} error={savedError} setError={setSavedError} />
    </>
  )
}

function SavedOpportunities({ savedOpportunities, setSavedOpportunities, error, setError }) {
  async function removeSaved(id) {
    try {
      await api.delete(`/saved-opportunities/${id}`)
      setSavedOpportunities((items) => items.filter((item) => item.opportunity?._id !== id))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove saved opportunity.')
    }
  }

  return (
    <DashboardPanel title="Saved opportunities" subtitle="Keep interesting opportunities for later.">
      {error && <ErrorMessage message={error} />}
      {!error && savedOpportunities.length === 0 && <EmptyPanel text="You have not saved any opportunities yet." />}
      <div className="dashboard-list">
        {savedOpportunities.map((saved) => <div className="dashboard-list-item" key={saved._id}><div><strong>{saved.opportunity?.title}</strong><span>{saved.opportunity?.type} · Deadline: {new Date(saved.opportunity?.deadline).toLocaleDateString()}</span></div><button className="button button-small button-danger" type="button" onClick={() => removeSaved(saved.opportunity?._id)}>Remove</button></div>)}
      </div>
    </DashboardPanel>
  )
}

function EmployerDashboard() {
  const [profile, setProfile] = useState(emptyEmployerProfile)
  const [opportunity, setOpportunity] = useState({
    title: '', description: '', type: 'job', category: '', deadline: '', location: '',
    remote: false, applicationMethod: 'platform', officialUrl: '', requirements: '', skills: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [opportunityMessage, setOpportunityMessage] = useState('')
  const [opportunityError, setOpportunityError] = useState('')
  const [applications, setApplications] = useState([])
  const [applicationsError, setApplicationsError] = useState('')
  const [updatingApplication, setUpdatingApplication] = useState('')
  const [payments, setPayments] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('telebirr')
  const [receiptFile, setReceiptFile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/employers/profile')
      .then(({ data }) => setProfile(data.data || emptyEmployerProfile))
      .catch((requestError) => {
        if (requestError.response?.status !== 404) setError(requestError.response?.data?.message || 'Unable to load employer profile.')
      })
      .finally(() => setLoading(false))
    api.get('/applications/employer/mine')
      .then(({ data }) => setApplications(data.data))
      .catch((requestError) => setApplicationsError(requestError.response?.data?.message || 'Unable to load applications.'))
    api.get('/payments/mine')
      .then(({ data }) => setPayments(data.data))
      .catch((requestError) => setOpportunityError(requestError.response?.data?.message || 'Unable to load payment history.'))
  }, [])

  async function saveProfile(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await api.post('/employers/profile', profile)
      setMessage('Employer profile saved and submitted for verification.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save employer profile.')
    }
  }

  async function createOpportunity(event) {
    event.preventDefault()
    setOpportunityMessage('')
    setOpportunityError('')
    try {
      const approvedPayment = payments.find((payment) => payment.status === 'approved' && !payment.usedAt)
      if (!approvedPayment) {
        if (!receiptFile) throw new Error('Upload your payment receipt before submitting the opportunity.')
        if (receiptFile.size > 700000) throw new Error('Receipt must be smaller than 700 KB.')
        const receiptData = await readReceipt(receiptFile)
        const { data } = await api.post('/payments/opportunity-fee', {
          method: paymentMethod,
          receiptData,
          receiptName: receiptFile.name,
          receiptMimeType: receiptFile.type,
        })
        setPayments((items) => [data.data, ...items])
        setOpportunityMessage('Receipt submitted. Wait for admin approval, then submit the opportunity.')
        setReceiptFile(null)
        event.target.reset()
        return
      }

      const payload = {
        ...opportunity,
        paymentId: approvedPayment._id,
        requirements: opportunity.requirements.split('\n').map((item) => item.trim()).filter(Boolean),
        skills: opportunity.skills.split(',').map((item) => item.trim()).filter(Boolean),
      }
      await api.post('/opportunities', payload)
      setOpportunityMessage('Opportunity submitted for admin approval.')
      setOpportunity({
        title: '', description: '', type: 'job', category: '', deadline: '', location: '',
        remote: false, applicationMethod: 'platform', officialUrl: '', requirements: '', skills: '',
      })
    } catch (requestError) {
      setOpportunityError(requestError.response?.data?.message || 'Unable to submit opportunity.')
    }
  }

  return (
    <div className="dashboard-columns">
      <DashboardPanel title="Employer profile">
        {message && <div className="success-message"><CheckCircle2 size={17} /> {message}</div>}
        {error && <ErrorMessage message={error} />}
        {!loading && <div className={`status-badge status-${profile.verificationStatus || 'pending'}`}>
          Profile status: {profile.verificationStatus === 'verified' ? 'Verified' : profile.verificationStatus === 'rejected' ? 'Rejected' : 'Pending admin verification'}
        </div>}
        {loading ? <Loading /> : (
          <form className="dashboard-form" onSubmit={saveProfile}>
            <label>Organization name<input value={profile.displayName || ''} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} required /></label>
            <label>Website <span className="optional-label">(optional)</span><input type="url" value={profile.website || ''} onChange={(event) => setProfile({ ...profile, website: event.target.value })} placeholder="https://example.com" /></label>
            <label>Description<textarea value={profile.description || ''} onChange={(event) => setProfile({ ...profile, description: event.target.value })} rows="5" required /></label>
            <button className="button button-primary" type="submit">Save profile</button>
          </form>
        )}
      </DashboardPanel>
      <DashboardPanel title="Post an opportunity">
        {opportunityMessage && <div className="success-message"><CheckCircle2 size={17} /> {opportunityMessage}</div>}
        {opportunityError && <ErrorMessage message={opportunityError} />}
        {profile.verificationStatus !== 'verified' && <div className="info-message">
          Save your employer profile and wait for an admin to verify it before publishing an opportunity. You may submit the 500 ETB receipt below while verification is pending.
        </div>}
        <div className="payment-instructions">
          <strong>Posting fee: 500 ETB</strong>
          <span>Pay using the selected account, then upload your receipt. Admin approval is required before posting.</span>
          <label>Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="telebirr">Telebirr: {postingPaymentInstructions.telebirr}</option><option value="cbe">CBE: {postingPaymentInstructions.cbe}</option><option value="abyssinia">Abyssinia Bank: {postingPaymentInstructions.abyssinia}</option></select></label>
          <label className="receipt-upload">Payment receipt <span className="optional-label">(required before posting)</span>
            <span className="receipt-upload-box"><FileUp size={22} /><span>{receiptFile ? receiptFile.name : 'Choose a JPG, PNG, or PDF receipt'}</span><small>Maximum size: 700 KB</small></span>
            <input className="receipt-input" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => setReceiptFile(event.target.files?.[0] || null)} />
          </label>
          {payments.some((payment) => payment.status === 'pending') && <span className="status-badge status-pending">Payment pending admin review</span>}
          {payments.some((payment) => payment.status === 'rejected') && <span className="form-error">A payment was rejected. Upload a new receipt.</span>}
        </div>
        <form className="dashboard-form" onSubmit={createOpportunity}>
          <label>Title<input value={opportunity.title} onChange={(event) => setOpportunity({ ...opportunity, title: event.target.value })} required maxLength="180" /></label>
          <div className="form-row">
            <label>Type<select value={opportunity.type} onChange={(event) => setOpportunity({ ...opportunity, type: event.target.value })}><option value="job">Job</option><option value="internship">Internship</option><option value="freelance">Freelance</option><option value="scholarship">Scholarship</option></select></label>
            <label>Category<input value={opportunity.category} onChange={(event) => setOpportunity({ ...opportunity, category: event.target.value })} required /></label>
          </div>
          <label>Description<textarea value={opportunity.description} onChange={(event) => setOpportunity({ ...opportunity, description: event.target.value })} rows="6" required /></label>
          <div className="form-row">
            <label>Deadline<input type="date" value={opportunity.deadline} onChange={(event) => setOpportunity({ ...opportunity, deadline: event.target.value })} required /></label>
            <label>Location<input value={opportunity.location} onChange={(event) => setOpportunity({ ...opportunity, location: event.target.value })} placeholder="Addis Ababa" /></label>
          </div>
          <label className="checkbox-label"><input type="checkbox" checked={opportunity.remote} onChange={(event) => setOpportunity({ ...opportunity, remote: event.target.checked })} /> Remote opportunity</label>
          <label>Requirements<textarea value={opportunity.requirements} onChange={(event) => setOpportunity({ ...opportunity, requirements: event.target.value })} rows="4" placeholder="One requirement per line" /></label>
          <label>Skills<input value={opportunity.skills} onChange={(event) => setOpportunity({ ...opportunity, skills: event.target.value })} placeholder="React, Communication, Excel" /></label>
          <label>Application method<select value={opportunity.applicationMethod} onChange={(event) => setOpportunity({ ...opportunity, applicationMethod: event.target.value })}><option value="platform">Apply on E-DIL</option><option value="external">External website</option><option value="both">Both</option></select></label>
          {opportunity.applicationMethod !== 'platform' && <label>Official application URL<input type="url" value={opportunity.officialUrl} onChange={(event) => setOpportunity({ ...opportunity, officialUrl: event.target.value })} required placeholder="https://..." /></label>}
          <button className="button button-primary" type="submit">Submit opportunity</button>
        </form>
      </DashboardPanel>
      <DashboardPanel title="Applicant management" subtitle="Review candidates and update application status.">
        {applicationsError && <ErrorMessage message={applicationsError} />}
        {!applicationsError && applications.length === 0 && <EmptyPanel text="No applications have been received yet." />}
        <div className="dashboard-list">
          {applications.map((application) => (
            <div className="dashboard-list-item" key={application._id}>
              <div><strong>{application.seeker?.name || 'Applicant'}</strong><span>{application.seeker?.email} · {application.opportunity?.title}</span></div>
              <select className="status-select" value={application.status} disabled={updatingApplication === application._id} onChange={async (event) => {
                const status = event.target.value
                setUpdatingApplication(application._id)
                try {
                  await api.patch(`/applications/${application._id}/status`, { status })
                  setApplications((items) => items.map((item) => item._id === application._id ? { ...item, status } : item))
                } catch (requestError) {
                  setApplicationsError(requestError.response?.data?.message || 'Unable to update application status.')
                } finally {
                  setUpdatingApplication('')
                }
              }}>
                <option value="submitted">Submitted</option><option value="reviewing">Reviewing</option><option value="shortlisted">Shortlisted</option><option value="rejected">Rejected</option><option value="accepted">Accepted</option>
              </select>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  )
}

function AdminDashboard() {
  const [employers, setEmployers] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/employer-verifications'),
      api.get('/admin/opportunities/pending'),
      api.get('/payments/pending'),
    ])
      .then(([employerResponse, opportunityResponse, paymentResponse]) => {
        setEmployers(employerResponse.data.data)
        setOpportunities(opportunityResponse.data.data)
        setPayments(paymentResponse.data.data)
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load moderation queues.'))
  }, [])

  async function reviewEmployer(id, status) {
    setBusyId(id)
    setError('')
    try {
      const reason = status === 'rejected' ? window.prompt('Reason for rejection:') || 'Profile did not meet verification requirements.' : undefined
      await api.patch(`/admin/employer-verifications/${id}`, { status, reason })
      setEmployers((items) => items.filter((item) => item._id !== id))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to review employer.')
    } finally {
      setBusyId('')
    }
  }

  async function reviewPayment(id, status) {
    setBusyId(id)
    setError('')
    try {
      const reason = status === 'rejected' ? window.prompt('Reason for rejection:') || 'Receipt could not be verified.' : undefined
      await api.patch(`/payments/${id}/review`, { status, reason })
      setPayments((items) => items.filter((item) => item._id !== id))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to review payment.')
    } finally {
      setBusyId('')
    }
  }

  async function reviewOpportunity(id, action) {
    const reason = action === 'reject' ? window.prompt('Reason for rejection:') : undefined
    if (action === 'reject' && !reason) return
    setBusyId(id)
    setError('')
    try {
      await api.patch(`/admin/opportunities/${id}/review`, { action, reason })
      setOpportunities((items) => items.filter((item) => item._id !== id))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to review opportunity.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="dashboard-columns">
      <DashboardPanel title="Employer verification" subtitle="Review organizations waiting for approval.">
        {employers.length === 0 && <EmptyPanel text="No employer profiles are waiting for review." />}
        {employers.map((employer) => <div className="moderation-item" key={employer._id}>
          <div><strong>{employer.displayName}</strong><span>{employer.owner?.email}</span></div>
          <div className="moderation-actions"><button className="button button-small button-primary" type="button" disabled={busyId === employer._id} onClick={() => reviewEmployer(employer._id, 'verified')}>Approve</button><button className="button button-small button-danger" type="button" disabled={busyId === employer._id} onClick={() => reviewEmployer(employer._id, 'rejected')}>Reject</button></div>
        </div>)}
      </DashboardPanel>
      <DashboardPanel title="Posting fee payments" subtitle="Verify the 500 ETB receipt before allowing an opportunity to be posted.">
        {payments.length === 0 && <EmptyPanel text="No payments are waiting for review." />}
        {payments.map((payment) => <div className="moderation-item" key={payment._id}>
          <div><strong>{payment.employer?.name || payment.employer?.email}</strong><span>{payment.method} · {payment.amount} {payment.currency} · {payment.receiptName}</span></div>
          <div className="moderation-actions"><a className="button button-small button-outline" href={payment.receiptData} target="_blank" rel="noreferrer">View receipt</a><button className="button button-small button-primary" type="button" disabled={busyId === payment._id} onClick={() => reviewPayment(payment._id, 'approved')}>Approve</button><button className="button button-small button-danger" type="button" disabled={busyId === payment._id} onClick={() => reviewPayment(payment._id, 'rejected')}>Reject</button></div>
        </div>)}
      </DashboardPanel>
      <DashboardPanel title="Opportunity moderation" subtitle="Review newly submitted opportunities.">
        {opportunities.length === 0 && <EmptyPanel text="No opportunities are waiting for review." />}
        {opportunities.map((opportunity) => <div className="moderation-item" key={opportunity._id}>
          <div><strong>{opportunity.title}</strong><span>{opportunity.employer?.displayName || opportunity.owner?.email}</span></div>
          <div className="moderation-actions"><button className="button button-small button-primary" type="button" disabled={busyId === opportunity._id} onClick={() => reviewOpportunity(opportunity._id, 'approve')}>Approve</button><button className="button button-small button-danger" type="button" disabled={busyId === opportunity._id} onClick={() => reviewOpportunity(opportunity._id, 'reject')}>Reject</button><button className="button button-small button-outline" type="button" disabled={busyId === opportunity._id} onClick={() => reviewOpportunity(opportunity._id, 'archive')}>Archive</button></div>
        </div>)}
      </DashboardPanel>
      {error && <ErrorMessage message={error} />}
    </div>
  )
}

function DashboardPanel({ title, subtitle, children }) {
  return <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</section>
}

function EmptyPanel({ text }) {
  return <div className="dashboard-empty">{text}</div>
}

function ErrorMessage({ message }) {
  return <div className="form-error"><AlertCircle size={17} /> {message}</div>
}

function Loading() {
  return <div className="dashboard-loading"><LoaderCircle className="spin" size={20} /> Loading...</div>
}

function Dashboard() {
  const { user, logout, updateUser } = useAuth()
  const title = user?.role === 'admin' ? 'Admin dashboard' : user?.role === 'employer' ? 'Employer dashboard' : 'My dashboard'
  const Icon = user?.role === 'admin' ? ShieldCheck : BriefcaseBusiness

  return (
    <section className="section dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div><span className="eyebrow">E-DIL Ethiopia</span><h1><Icon size={34} /> {title}</h1><p>Welcome back, {user?.name}.</p></div>
          <button className="button button-outline" type="button" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
        {user?.role === 'admin' && <AdminDashboard />}
        {user?.role === 'employer' && <EmployerDashboard />}
        {user?.role === 'seeker' && <SeekerDashboard />}
        <NotificationsPanel />
        <AccountSettings user={user} updateUser={updateUser} />
        <Link className="dashboard-link" to="/opportunities">Browse opportunities →</Link>
      </div>
    </section>
  )
}

function NotificationsPanel() {
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/notifications')
      .then(({ data }) => setNotifications(data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load notifications.'))
  }, [])

  async function markRead(notification) {
    if (notification.readAt) return
    try {
      await api.patch(`/notifications/${notification._id}/read`)
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update notification.')
    }
  }

  return (
    <section className="settings-panel">
      <div className="dashboard-panel-heading"><h2>Notifications</h2><p>Updates about your applications and opportunities.</p></div>
      {error && <ErrorMessage message={error} />}
      {!error && notifications.length === 0 && <EmptyPanel text="You have no notifications." />}
      <div className="dashboard-list">
        {notifications.map((notification) => <button className={`notification-item ${notification.readAt ? '' : 'is-unread'}`} type="button" key={notification._id} onClick={() => markRead(notification)}><strong>{notification.title}</strong><span>{notification.message}</span><small>{new Date(notification.createdAt).toLocaleString()}</small></button>)}
      </div>
    </section>
  )
}

function AccountSettings({ user, updateUser }) {
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function saveName(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const { data } = await api.patch('/auth/profile', { name })
      updateUser(data.user)
      setMessage('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update profile.')
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await api.patch('/auth/password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Password changed successfully.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to change password.')
    }
  }

  return (
    <section className="settings-panel">
      <div className="dashboard-panel-heading"><h2>Account settings</h2><p>Manage your personal information and security.</p></div>
      {message && <div className="success-message"><CheckCircle2 size={17} /> {message}</div>}
      {error && <ErrorMessage message={error} />}
      <div className="settings-grid">
        <form className="dashboard-form" onSubmit={saveName}><label>Name<input value={name} onChange={(event) => setName(event.target.value)} minLength="2" required /></label><label>Email<input value={user?.email || ''} disabled /></label><button className="button button-outline" type="submit">Update profile</button></form>
        <form className="dashboard-form" onSubmit={savePassword}><label>Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength="8" required /></label><button className="button button-outline" type="submit">Change password</button></form>
      </div>
    </section>
  )
}

export default Dashboard
