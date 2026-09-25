import { useEffect, useState } from 'react'
import { callFunction } from '@/lib/api'
import {
  Users,
  Key,
  Clock,
  CheckCircle,
  BarChart3,
  Calendar,
} from 'lucide-react'

interface Stats {
  users: { total: number }
  keys: { total: number; available: number; issued: number; disabled: number }
  tasks: { pending: number; completed: number }
  recent_claims: Array<{
    id: string
    claimed_at: string
    user_id: string
    key_id: string
  }>
  recent_users: Array<{
    id: string
    username: string
    email: string
    role: string
    status: string
    created_at: string
  }>
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await callFunction('admin-dashboard', { method: 'GET' })
      setStats(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) return <p>Loading overview...</p>
  if (error) return <p style={{ color: 'var(--error)' }}>{error}</p>
  if (!stats) return null

  const statCards = [
    { label: 'Total Users', value: stats.users.total, icon: <Users size={20} />, color: 'var(--accent)' },
    { label: 'Total Keys', value: stats.keys.total, icon: <Key size={20} />, color: 'var(--accent)' },
    { label: 'Available Keys', value: stats.keys.available, icon: <Key size={20} />, color: 'var(--success)' },
    { label: 'Issued Keys', value: stats.keys.issued, icon: <Key size={20} />, color: 'var(--warning)' },
    { label: 'Disabled Keys', value: stats.keys.disabled, icon: <Key size={20} />, color: 'var(--error)' },
    { label: 'Pending Tasks', value: stats.tasks.pending, icon: <Clock size={20} />, color: 'var(--warning)' },
    { label: 'Completed Tasks', value: stats.tasks.completed, icon: <CheckCircle size={20} />, color: 'var(--success)' },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(({ label, value, icon, color }) => (
          <div className="card" key={label} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ color }}>{icon}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}><BarChart3 size={16} /> Recent Key Claims</h3>
          {stats.recent_claims.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No claims yet</p>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Claimed</th><th>User ID</th><th>Key ID</th></tr>
              </thead>
              <tbody>
                {stats.recent_claims.map((claim) => (
                  <tr key={claim.id}>
                    <td>{new Date(claim.claimed_at).toLocaleString()}</td>
                    <td>{claim.user_id.slice(0, 8)}…</td>
                    <td>{claim.key_id.slice(0, 8)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}><Calendar size={16} /> Recent Users</h3>
          {stats.recent_users.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No users yet</p>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {stats.recent_users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.status === 'active' ? 'badge-available' : 'badge-disabled'}`}>{u.status}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
