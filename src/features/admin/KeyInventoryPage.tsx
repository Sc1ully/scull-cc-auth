import { useEffect, useState } from 'react'
import { callFunction } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { Key, Search, Plus, Eye, EyeOff, Trash2, Save, RefreshCw } from 'lucide-react'
import type { KeyInventoryItem, KeyStatsResponse } from '@/lib/types'

interface RevealedKeys {
  [key: string]: string
}

export default function KeyInventoryPage() {
  const [keys, setKeys] = useState<KeyInventoryItem[]>([])
    const [stats, setStats] = useState<KeyStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddKeys, setShowAddKeys] = useState(false)
  const [newKeys, setNewKeys] = useState('')
  const [notes, setNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null)
  const [revealedKeys, setRevealedKeys] = useState<RevealedKeys>({})

  const fetchKeys = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter

      const data = await callFunction('admin-key-management?action=list&search=' + encodeURIComponent(search) + (statusFilter !== 'all' ? '&status=' + statusFilter : ''), {
        method: 'GET',
      })
      setKeys(data.keys || [])
      
      const statsData = await callFunction('admin-key-management?action=stats', { method: 'GET' })
      setStats(statsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load keys')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [search, statusFilter])

  const handleAddKeys = async () => {
    setActionLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await callFunction('admin-key-import', {
        method: 'POST',
        body: JSON.stringify({ keys: newKeys, notes: notes || undefined }),
      })
      setSuccess(`${result.added} keys added, ${result.skipped} duplicates skipped`)
      setNewKeys('')
      setNotes('')
      setShowAddKeys(false)
      fetchKeys()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import keys')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisableKey = async (keyId: string) => {
    setActionLoading(true)
    try {
      await callFunction(`admin-key-management?action=disable&id=${keyId}`, { method: 'PATCH' })
      fetchKeys()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disable key')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure? This cannot be undone for available/disabled keys.')) return
    setActionLoading(true)
    try {
      await callFunction(`admin-key-management?action=delete&id=${keyId}`, { method: 'DELETE' })
      fetchKeys()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete key')
    } finally {
      setActionLoading(false)
    }
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return key.replace(/^(.{2}).*(.{2})$/, '$1****$2')
    return key.replace(/^(.{4}).*(.{4})$/, '$1••••••$2')
  }

  const handleRevealKey = async (keyId: string) => {
    if (revealedKeyId === keyId) {
      setRevealedKeyId(null)
      return
    }
    setActionLoading(true)
    try {
      const data = await callFunction(`admin-key-management?action=reveal&id=${keyId}`, { method: 'GET' })
      setRevealedKeyId(keyId)
      setRevealedKeys({ ...revealedKeys, [keyId]: data.key.key_value })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reveal key')
    } finally {
      setActionLoading(false)
    }
  }

  const getDisplayValue = (key: KeyInventoryItem): string => {
    if (revealedKeyId === key.id && revealedKeys[key.id]) {
      return revealedKeys[key.id]
    }
    return maskKey(key.key_value)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Key Inventory</h1>
        <Button onClick={() => setShowAddKeys(true)} variant="primary">
          <Plus size={16} /> Add Keys
        </Button>
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ minWidth: '120px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</p>
          </div>
          <div className="card" style={{ minWidth: '120px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{stats.available}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Available</p>
          </div>
          <div className="card" style={{ minWidth: '120px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{stats.issued}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Issued</p>
          </div>
          <div className="card" style={{ minWidth: '120px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error)' }}>{stats.disabled}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Disabled</p>
          </div>
        </div>
      )}

      {error && (
        <div className="toast error" style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: 'var(--radius)' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--success-border)', background: 'var(--success-bg)', color: 'var(--success)' }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Search keys..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: '250px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="issued">Issued</option>
          <option value="disabled">Disabled</option>
        </select>
        <Button onClick={fetchKeys} variant="secondary" size="sm">
          <RefreshCw size={14} />
        </Button>
      </div>

      {showAddKeys && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Add New Keys</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Paste keys one per line. Duplicates are automatically detected and skipped.
          </p>
          <Textarea
            label="Keys"
            placeholder={"KEY-1234\nKEY-5678\nKEY-9012"}
            value={newKeys}
            onChange={(e) => setNewKeys(e.target.value)}
            required
          />
          <Input
            label="Notes (optional)"
            placeholder="e.g., Batch from supplier"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ marginTop: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button onClick={handleAddKeys} variant="primary" loading={actionLoading}>
              <Save size={16} /> Save Keys
            </Button>
            <Button onClick={() => setShowAddKeys(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading keys...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Key</th><th>Status</th><th>User</th><th>Added</th><th>Issued</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {getDisplayValue(key)}
                  </td>
                  <td><span className={`badge badge-${key.status}`}>{key.status}</span></td>
                  <td>{key.issued_to ? key.issued_to.slice(0, 8) + '…' : '-'}</td>
                  <td>{new Date(key.added_at).toLocaleString()}</td>
                  <td>{key.issued_at ? new Date(key.issued_at).toLocaleString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => handleRevealKey(key.id)} className="btn btn-secondary btn-sm" title={revealedKeyId === key.id ? 'Hide' : 'Reveal'}>
                        {revealedKeyId === key.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      {key.status === 'available' && (
                        <button onClick={() => handleDisableKey(key.id)} className="btn btn-secondary btn-sm" title="Disable">
                          <Key size={14} />
                        </button>
                      )}
                      {key.status === 'disabled' && (
                        <button onClick={() => handleDeleteKey(key.id)} className="btn btn-secondary btn-sm" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {keys.length === 0 && (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>
              No keys in inventory. Add keys to get started.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
