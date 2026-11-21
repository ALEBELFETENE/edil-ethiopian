import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import api from '../services/api'

function VerifyEmail() {
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const { data } = await api.post('/auth/verify-email', { token })
      setMessage(data.message)
      setToken('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to verify email.')
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <h1>Verify your email</h1>
        <p className="auth-subtitle">Enter the verification token from your email.</p>
        {message && <div className="success-message"><CheckCircle2 size={17} /> {message}</div>}
        {error && <div className="form-error"><AlertCircle size={17} /> {error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label>Verification token<input value={token} onChange={(event) => setToken(event.target.value)} required /></label>
          <button className="button button-primary auth-submit" type="submit">Verify email</button>
        </form>
      </div>
    </section>
  )
}

export default VerifyEmail
