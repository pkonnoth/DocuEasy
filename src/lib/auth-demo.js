// Simple demo auth - no external dependencies
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@emr.com',
  role: 'admin',
  name: 'Dr. Demo User'
}

const DEMO_CREDENTIALS = {
  email: 'demo@emr.com',
  password: 'demo123'
}

export function login(email, password) {
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo-user', JSON.stringify(DEMO_USER))
    }
    return { success: true, user: DEMO_USER }
  }
  return { success: false, error: 'Invalid credentials. Use demo@emr.com / demo123' }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo-user')
  }
  return { success: true }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('demo-user')
  return user ? JSON.parse(user) : null
}

export function isAuthenticated() {
  return getCurrentUser() !== null
}

export function isAdmin() {
  const user = getCurrentUser()
  return user?.role === 'admin'
}