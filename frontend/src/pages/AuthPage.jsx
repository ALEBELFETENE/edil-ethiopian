import { AlertCircle, ArrowLeft, BriefcaseBusiness, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useLanguage } from '../context/useLanguage'

function dashboardPathForRole(role) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'employer') return '/employer/dashboard'
  return '/seeker/dashboard'
}

function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { language } = useLanguage()
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const copy = language === 'am'
    ? {
      registerTitle: 'መለያ ይፍጠሩ', loginTitle: 'ወደ መለያዎ ይግቡ',
      registerSubtitle: 'የሚቀጥለውን ዕድልዎን ዛሬ ያግኙ።', loginSubtitle: 'ወደ E-DIL Ethiopia እንኳን ደህና መጡ።',
      name: 'ሙሉ ስም', email: 'Email', password: 'Password', submitRegister: 'መለያ ይፍጠሩ', submitLogin: 'ግባ',
      switchRegister: 'መለያ የለዎትም? ይፍጠሩ', switchLogin: 'መለያ አለዎት? ይግቡ', back: 'ወደ መነሻ ተመለስ',
    }
    : {
      registerTitle: 'Create your account', loginTitle: 'Sign in to your account',
      registerSubtitle: 'Start finding your next opportunity today.', loginSubtitle: 'Welcome back to E-DIL Ethiopia.',
      name: 'Full name', email: 'Email address', password: 'Password', submitRegister: 'Create account', submitLogin: 'Sign in',
      switchRegister: "Don't have an account? Create one", switchLogin: 'Already have an account? Sign in', back: 'Back to home',
    }

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const authenticatedUser = isRegister
        ? await register(form)
        : await login({ email: form.email, password: form.password })
      navigate(location.state?.from || dashboardPathForRole(authenticatedUser.role))
    } catch (requestError) {
      setError(requestError.response?.status === 409
        ? 'An account with this email already exists. Please sign in instead.'
        : requestError.response?.data?.message || 'Unable to complete this request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <Link className="auth-back" to="/"><ArrowLeft size={16} /> {copy.back}</Link>
        <div className="auth-brand"><span className="brand-mark"><BriefcaseBusiness size={20} /></span><strong>E-DIL Ethiopia</strong></div>
        <h1>{isRegister ? copy.registerTitle : copy.loginTitle}</h1>
        <p className="auth-subtitle">{isRegister ? copy.registerSubtitle : copy.loginSubtitle}</p>
        {error && <div className="form-error" role="alert"><AlertCircle size={17} /> {error}</div>}
        <form className="auth-form" onSubmit={submit}>
          {isRegister && <label>{copy.name}<input name="name" value={form.name} onChange={updateField} required minLength="2" autoComplete="name" /></label>}
          <label>{copy.email}<input type="email" name="email" value={form.email} onChange={updateField} required autoComplete="email" /></label>
          <label>{copy.password}<input type="password" name="password" value={form.password} onChange={updateField} required minLength="8" autoComplete={isRegister ? 'new-password' : 'current-password'} /></label>
          {isRegister && <label>Account type<select name="role" value={form.role} onChange={updateField}><option value="seeker">Job seeker</option><option value="employer">Employer</option></select></label>}
          <button className="button button-primary auth-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {isRegister ? copy.submitRegister : copy.submitLogin}
          </button>
        </form>
        <Link className="auth-switch" to={isRegister ? '/signin' : '/register'}>{isRegister ? copy.switchLogin : copy.switchRegister}</Link>
      </div>
    </section>
  )
}

export default AuthPage
