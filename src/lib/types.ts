export interface Profile {
  id: string
  username: string
  email: string | null
  role: 'user' | 'admin'
  status: 'active' | 'disabled'
  created_at: string
  updated_at: string
}

export interface KeyInventoryItem {
  id: string
  key_value: string
  status: 'available' | 'issued' | 'disabled'
  issued_to: string | null
  added_by: string | null
  added_at: string
  issued_at: string | null
  notes: string | null
  profiles?: Profile | null
}

export interface LootlabsTask {
  id: string
  user_id: string
  puid: string
  lootlabs_short: string | null
  lootlabs_url: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
  completion_unique_id: string | null
  completion_ip: string | null
  lootlabs_unique_id: string | null
  key_id: string | null
}

export interface KeyClaim {
  id: string
  user_id: string
  key_id: string
  lootlabs_task_id: string | null
  claimed_at: string
}

export interface KeyStatsResponse {
  total: number
  available: number
  issued: number
  disabled: number
}

export type KeyStatus = 'no_key' | 'task_required' | 'pending' | 'key_assigned'
export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'disabled'
