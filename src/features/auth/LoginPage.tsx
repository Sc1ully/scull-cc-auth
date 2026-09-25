import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    navigate('/dashboard')
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Login to <span style={{ color: 'var(--accent)' }}>Scull.cc-Auth</span>
        </h1>

        <form className="form" onSubmit={handleLogin}>
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />
          {error && (
            <div className="toast error" style={{ padding: '0.6rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
            {loading ? 'Signing In...' : 'Login'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}
