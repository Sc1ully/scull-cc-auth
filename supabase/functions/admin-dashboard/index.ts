import { serve } from 'https://deno.land/x/sift@0.0.7/mod.ts'
import { createAdminClient, corsHeaders } from '../_shared/createServerSupabaseClient.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createAdminClient()

    // Verify admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gather dashboard stats
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: totalKeys } = await supabaseAdmin
      .from('key_inventory')
      .select('*', { count: 'exact', head: true })

    const { count: availableKeys } = await supabaseAdmin
      .from('key_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available')

    const { count: issuedKeys } = await supabaseAdmin
      .from('key_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'issued')

    const { count: disabledKeys } = await supabaseAdmin
      .from('key_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'disabled')

    const { count: pendingTasks } = await supabaseAdmin
      .from('lootlabs_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: completedTasks } = await supabaseAdmin
      .from('lootlabs_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Recent key claims (last 10)
    const { data: recentClaims } = await supabaseAdmin
      .from('key_claims')
      .select('id, claimed_at, user_id, key_id, lootlabs_task_id')
      .order('claimed_at', { ascending: false })
      .limit(10)

    // Recent users (last 10)
    const { data: recentUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, role, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    return new Response(
      JSON.stringify({
        users: { total: totalUsers ?? 0 },
        keys: {
          total: totalKeys ?? 0,
          available: availableKeys ?? 0,
          issued: issuedKeys ?? 0,
          disabled: disabledKeys ?? 0,
        },
        tasks: {
          pending: pendingTasks ?? 0,
          completed: completedTasks ?? 0,
        },
        recent_claims: recentClaims ?? [],
        recent_users: recentUsers ?? [],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Admin dashboard error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
