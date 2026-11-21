import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { AuthContext } from './authContext'

const publicAuthPages = ['/signin', '/register', '/verify-email']

function saveSession(data) {
  localStorage.setItem('edil-token', data.token)
  localStorage.setItem('edil-user', JSON.stringify(data.user))
}

function clearSession() {
  localStorage.removeItem('edil-token')
  localStorage.removeItem('edil-user')
}

export function AuthProvider({ children }) {
  const shouldValidateSession = !publicAuthPages.includes(window.location.pathname)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('edil-user')
    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      clearSession()
      return null
    }
  })
  const [isInitializing, setIsInitializing] = useState(() => Boolean(
    shouldValidateSession
    &&
    localStorage.getItem('edil-token') && localStorage.getItem('edil-user'),
  ))

  useEffect(() => {
    function invalidateSession() {
      setUser(null)
    }

    window.addEventListener('edil-auth-invalid', invalidateSession)
    const token = localStorage.getItem('edil-token')
    const validateSession = !publicAuthPages.includes(window.location.pathname)
    if (!validateSession || !token || !localStorage.getItem('edil-user')) {
      return () => window.removeEventListener('edil-auth-invalid', invalidateSession)
    }

    api.get('/auth/me')
      .then(({ data }) => {
        localStorage.setItem('edil-user', JSON.stringify(data.user))
        setUser(data.user)
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          clearSession()
          setUser(null)
        }
      })
      .finally(() => setIsInitializing(false))

    return () => window.removeEventListener('edil-auth-invalid', invalidateSession)
  }, [])

  const value = useMemo(() => ({
    user,
    isInitializing,
    isAuthenticated: Boolean(user),
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials)
      saveSession(data)
      setUser(data.user)
      return data.user
    },
    async register(details) {
      const { data } = await api.post('/auth/register', details)
      saveSession(data)
      setUser(data.user)
      return data.user
    },
    logout() {
      clearSession()
      setUser(null)
    },
    updateUser(nextUser) {
      localStorage.setItem('edil-user', JSON.stringify(nextUser))
      setUser(nextUser)
    },
  }), [isInitializing, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
