import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Search, UserCheck, UserX, RefreshCw } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setUsers((data || []) as Profile[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search])

  const formatDate = (date: string) => new Date(date).toLocaleString()

  if (loading) return <p>Loading users...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Users</h1>
        <Button onClick={fetchUsers} variant="secondary" size="sm">
          <RefreshCw size={14} />
        </Button>
      </div>

      {error && (
        <div className="toast error" style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: 'var(--radius)' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: '250px' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Key</th>
              <th>Task</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username || '-'}</td>
                <td>{u.email || '-'}</td>
                <td>
                  <span className={`badge badge-${u.role}`}>
                    {u.role === 'admin' ? <UserCheck size={12} /> : <UserX size={12} />} {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.status === 'active' ? 'badge-available' : 'badge-disabled'}`}>
                    {u.status}
                  </span>
                </td>
                <td><UserKeyStatus userId={u.id} /></td>
                <td><UserTaskStatus userId={u.id} /></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {formatDate(u.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>
            No users found.
          </p>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Note: Role and status changes require admin Edge Functions.
          Passwords and auth tokens are never exposed.
        </p>
      </div>
    </div>
  )
}

function UserKeyStatus({ userId }: { userId: string }) {
  const [hasKey, setHasKey] = useState<boolean | null>(null)

  useEffect(() => {
    supabase
      .from('key_claims')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .then(({ count }) => setHasKey(count !== null && count > 0))
  }, [userId])

  if (hasKey === null) return <span style={{ color: 'var(--text-tertiary)' }}>…</span>
  return hasKey ? (
    <span className="badge badge-issued">Has Key</span>
  ) : (
    <span style={{ color: 'var(--text-secondary)' }}>No Key</span>
  )
}

function UserTaskStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('lootlabs_tasks')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setStatus(data?.status || null))
  }, [userId])

  if (!status) return <span style={{ color: 'var(--text-tertiary)' }}>—</span>
  return (
    <span className={`badge ${status === 'completed' ? 'badge-available' : 'badge-disabled'}`}>
      {status}
    </span>
  )
}
