import { Link } from 'react-router-dom'
import { Key, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="page">
      <div className="container" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '3rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Scull.cc-<span style={{ color: 'var(--accent)' }}>Auth</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Access portal for free Windows application license keys.
            Complete LootLabs tasks to receive your KeyAuth authorization key.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          <div className="card" style={{ textAlign: 'left' }}>
            <Key size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ margin: '0.7rem 0 0.3rem' }}>Free Keys</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get license keys at no cost</p>
          </div>
          <div className="card" style={{ textAlign: 'left' }}>
            <Shield size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ margin: '0.7rem 0 0.3rem' }}>Secure</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Built with Supabase Auth + RLS</p>
          </div>
          <div className="card" style={{ textAlign: 'left' }}>
            <Zap size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ margin: '0.7rem 0 0.3rem' }}>Instant</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Access keys immediately after completion</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            Login
          </Link>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          The application itself is free. Keys are distributed via LootLabs reward tasks.
          One key per account. No automatic key generation.
        </p>
      </div>
    </main>
  )
}
