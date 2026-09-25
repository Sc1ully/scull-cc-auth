import { supabase } from '@/lib/supabaseClient'

export async function callFunction(
  functionName: string,
  options: RequestInit = {}
) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const url = `${
    import.meta.env.VITE_SUPABASE_URL
  }/functions/v1/${functionName}`

  const res = await fetch(url, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error || 'Request failed')
  }

  return data
}

export interface LootlabsTaskResponse {
  status: 'task_created' | 'already_claimed' | 'task_pending' | 'no_keys' | 'error'
  message?: string
  loot_url?: string
  task_id?: string
}

export interface KeyClaimResponse {
  status: 'success' | 'no_keys' | 'error'
  key_value?: string
  claim_id?: string
  message?: string
}

export interface KeyInventoryResponse {
  keys: Array<{
    id: string
    key_value: string
    status: string
    issued_to: string | null
    added_at: string
    issued_at: string | null
  }>
  count: number
}

export interface KeyStatsResponse {
  total: number
  available: number
  issued: number
  disabled: number
}

export interface KeyImportResult {
  added: number
  skipped: number
  duplicates: string[]
}

export async function createLootlabsTask(): Promise<LootlabsTaskResponse> {
  return callFunction('create-lootlabs-task', { method: 'POST' })
}

export async function getKeyClaim(): Promise<KeyClaimResponse> {
  return callFunction('claim-key', { method: 'POST' })
}

export async function getAdminKeys(
  params: Record<string, string> = {}
): Promise<KeyInventoryResponse> {
  const query = new URLSearchParams(params).toString()
  return callFunction(`admin-key-management?action=list${query ? `&${query}` : ''}`, {
    method: 'GET',
  })
}

export async function getAdminKeyStats(): Promise<KeyStatsResponse> {
  return callFunction('admin-key-management?action=stats', { method: 'GET' })
}

export async function importKeys(
  keys: string,
  notes?: string
): Promise<KeyImportResult> {
  return callFunction('admin-key-import', {
    method: 'POST',
    body: JSON.stringify({ keys, notes }),
  })
}

export async function adminKeyAction(
  action: 'disable' | 'delete' | 'reveal',
  keyId: string
): Promise<{ message?: string; key?: unknown }> {
  const method = action === 'delete' ? 'DELETE' : action === 'disable' ? 'PATCH' : 'GET'
  return callFunction(`admin-key-management?action=${action}&id=${keyId}`, { method })
}
