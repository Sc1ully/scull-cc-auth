import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { callFunction } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Copy, ExternalLink, RefreshCw, Clock, CheckCircle } from 'lucide-react'
import type { LootlabsTask, Profile } from '@/lib/types'

type KeyStatus = 'no_key' | 'task_required' | 'pending' | 'verification_pending' | 'key_assigned'

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [keyStatus, setKeyStatus] = useState<KeyStatus>('no_key')
  const [task, setTask] = useState<LootlabsTask | null>(null)
  const [keyValue, setKeyValue] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileError && profileData) {
      setProfile(profileData as Profile)
    }
  }

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check for existing key claim
    const { data: existingClaim, error: claimError } = await supabase
      .from('key_claims')
      .select('*, key_inventory!inner(key_value)')
      .eq('user_id', user.id)
      .single()

    if (!claimError && existingClaim) {

      // Try to get the key value through the user_keys view
      const { data: userKey, error: keyError } = await supabase
        .from('user_keys')
        .select('key_value')
        .single()

      if (!keyError && userKey) {
        setKeyValue(userKey.key_value)
        setKeyStatus('key_assigned')
      } else {
        setKeyStatus('key_assigned')
      }
      setLoading(false)
      return
    }

    // Check for LootLabs tasks
    const { data: tasks, error: taskError } = await supabase
      .from('lootlabs_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!taskError && tasks && tasks.length > 0) {
      const latestTask = tasks[0] as LootlabsTask
      setTask(latestTask)

      if (latestTask.status === 'completed') {
        // Check if key was claimed
        const { data: taskClaim } = await supabase
          .from('key_claims')
          .select('*')
          .eq('lootlabs_task_id', latestTask.id)
          .single()

        if (taskClaim) {
const { data: userKey } = await supabase
            .from('user_keys')
            .select('key_value')
            .single()
          if (userKey) setKeyValue(userKey.key_value)
          setKeyStatus('key_assigned')
        } else {
          setKeyStatus('verification_pending')
        }
      } else if (latestTask.status === 'pending') {
        setKeyStatus('task_required')
      } else {
        setKeyStatus('no_key')
      }
    } else {
      setKeyStatus('no_key')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProfile()
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStatus])

  const handleGetKey = async () => {
    setActionLoading(true)
    setError(null)

    try {
      const result = await callFunction('create-lootlabs-task', { method: 'POST' })

      if (result.status === 'already_claimed') {
        setSuccess(result.message || 'You already have a key.')
        await fetchStatus()
      } else if (result.status === 'task_pending') {
        setSuccess('You have a pending task. Please complete it.')
        await fetchStatus()
      } else if (result.status === 'no_keys') {
        setError(result.message || 'No keys are currently available.')
      } else if (result.status === 'task_created' && result.loot_url) {
        // Open LootLabs in a new tab
        if (result.loot_url) window.open(result.loot_url, '_blank')
        setSuccess('LootLabs task created. Complete the tasks to receive your key.')
        await fetchStatus()
      } else if (result.status === 'error') {
        setError(result.message || 'Something went wrong.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create LootLabs task.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    await fetchStatus()
  }

  const handleCopyKey = () => {
    if (keyValue) {
      navigator.clipboard.writeText(keyValue)
      setSuccess('Key copied to clipboard!')
    }
  }

  const renderKeyStatus = () => {
    switch (keyStatus) {
      case 'no_key':
        return (
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Get Your Free Key</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Complete a LootLabs task to receive your free KeyAuth authorization key.
            </p>
            <Button onClick={handleGetKey} loading={actionLoading} style={{ width: '100%' }}>
              Get Free Key
            </Button>
          </div>
        )

      case 'task_required':
        return (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={20} style={{ color: 'var(--warning)' }} />
              <h3 style={{ margin: 0 }}>Complete Tasks</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              You have a pending LootLabs task. Complete the required tasks to receive your key.
            </p>
            {task?.lootlabs_url && (
              <Button
                onClick={() => task && task.lootlabs_url && window.open(task.lootlabs_url, '_blank')}
                variant="outline"
                style={{ marginBottom: '1rem' }}
              >
                Open LootLabs Task <ExternalLink size={16} />
              </Button>
            )}
            <Button onClick={handleCheckStatus} variant="secondary" style={{ width: '100%' }}>
              Check Status
            </Button>
          </div>
        )

      case 'verification_pending':
        return (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={20} style={{ color: 'var(--warning)' }} />
              <h3 style={{ margin: 0 }}>Verification Pending</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your LootLabs task has been completed. We are processing your key claim.
              This usually takes a few moments.
            </p>
            <Button onClick={handleCheckStatus} variant="secondary" style={{ width: '100%' }}>
              <RefreshCw size={16} /> Check Status
            </Button>
          </div>
        )

      case 'key_assigned':
        return (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <h3 style={{ margin: 0 }}>Your Key</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You have been assigned a KeyAuth authorization key.
            </p>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', fontFamily: 'var(--font-mono)', marginBottom: '1rem', wordBreak: 'break-all' }}>
              {keyValue || '••••••••••••'}
            </div>
            {keyValue && (
              <Button onClick={handleCopyKey} variant="secondary">
                <Copy size={16} /> Copy Key
              </Button>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Dashboard
          </h1>
          {profile && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome, <strong>{profile.username}</strong> • {profile.role}
            </p>
          )}
        </div>

        {error && (
          <div className="toast error" style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: 'var(--radius)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="toast-success" style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--success-border)', background: 'var(--success-bg)' }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {/* Left column - Key status */}
          <div>{renderKeyStatus()}</div>

          {/* Right column - Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Account Info</h3>
              {profile && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <p><strong style={{ color: 'var(--text-primary)' }}>Username:</strong> {profile.username}</p>
                  <p><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {profile.email}</p>
                  <p><strong style={{ color: 'var(--text-primary)' }}>Status:</strong> {profile.status}</p>
                  <p><strong style={{ color: 'var(--text-primary)' }}>Role:</strong> {profile.role}</p>
                </div>
              )}
            </div>

            {profile && profile.role === 'admin' && (
              <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Admin Access</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  You have administrator privileges.
                </p>
                <Button onClick={() => window.location.href = '/admin'} variant="secondary" size="sm">
                  Go to Admin Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
