import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Lock } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstilePassed, setTurnstilePassed] = useState(false)
  const [siteKey, setSiteKey] = useState('')

  useEffect(() => {
    return () => {
      document.head.removeChild(document.querySelector('script[src*="turnstile"]') as HTMLScriptElement)
    }
  }, [])

  useEffect(() => {
    const fetchSiteKey = async () => {
      // We'll need an endpoint to get the site key, or use a static env var
      // For now, read from env
      setSiteKey(import.meta.env.VITE_TURNSTILE_SITE_KEY || '')
    }
    fetchSiteKey()
  }, [])

  const handleTurnstileSuccess = () => {
    setTurnstilePassed(true)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!turnstilePassed) {
      setError('Please complete the CAPTCHA')
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: window.location.origin + '/login',
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Check if email confirmation is required
    const { data: { user } } = await supabase.auth.getUser()
    if (user && !user.email_confirmed_at) {
      // Email confirmation required — redirect to a notice page
      navigate('/login')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Register for <span style={{ color: 'var(--accent)' }}>Scull.cc-Auth</span>
        </h1>

        <form className="form" onSubmit={handleRegister}>
          <Input
            label="Username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User size={16} />}
            required
            minLength={3}
            maxLength={20}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
            minLength={8}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
            minLength={8}
          />

          {error && (
            <div className="toast error" style={{ padding: '0.6rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {siteKey && (
            <div className="cf-turnstile" data-sitekey={siteKey} data-callback={handleTurnstileSuccess} />
          )}

          <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}
