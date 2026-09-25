import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export function createAdminClient(): SupabaseClient {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
  return supabaseAdmin
}

export function createUserClient(request: Request): SupabaseClient {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') ?? '',
        },
      },
    }
  )
  return supabase
}

export async function verifyAdmin(supabase: SupabaseClient) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Profile not found')
  }

  if (profile.status === 'disabled') {
    throw new Error('Account is disabled')
  }

  if (profile.role !== 'admin') {
    throw new Error('Forbidden: admin access required')
  }

  return { user, profile }
}

export async function verifyUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Profile not found')
  }

  if (profile.status === 'disabled') {
    throw new Error('Account is disabled')
  }

  return { user, profile }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}
