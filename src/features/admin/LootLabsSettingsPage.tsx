import { useEffect, useState } from 'react'
import { callFunction } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings, Save, RefreshCw } from 'lucide-react'

interface Setting {
  key: string
  value: string | null
  description: string
}

export default function LootLabsSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await callFunction('admin-settings', { method: 'GET' })
      setSettings(data.settings || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      for (const s of settings) {
        await callFunction('admin-settings?action=update', {
          method: 'PUT',
          body: JSON.stringify({ key: s.key, value: s.value }),
        })
      }
      setSuccess('Settings saved successfully')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value } : s))
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) return <p>Loading settings...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '0.25rem' }}>
            <Settings size={20} style={{ marginRight: '0.5rem' }} />
            LootLabs Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Configure the LootLabs task flow. The API key is stored as a project secret.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={fetchSettings} variant="secondary" size="sm">
            <RefreshCw size={14} />
          </Button>
          <Button onClick={handleSave} variant="primary" loading={saving}>
            <Save size={16} /> Save
          </Button>
        </div>
      </div>

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

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>LootLabs Configuration</h3>
        <div className="form">
          {settings.map((s) => (
            <div key={s.key}>
              <label className="input-label">{s.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              <Input
                value={s.value || ''}
                onChange={(e) => updateSetting(s.key, e.target.value)}
                placeholder={s.description || undefined}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Important Notes</h3>
        <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <li>• LootLabs API key is stored as a Supabase project secret (LOOTLABS_API_KEY)</li>
          <li>• The postback URL must be configured in the LootLabs Advanced panel</li>
          <li style={{ wordBreak: 'break-all' }}>Postback URL: https://[PROJECT_REF].supabase.co/functions/v1/lootlabs-postback</li>
        </ul>
      </div>
    </div>
  )
}
