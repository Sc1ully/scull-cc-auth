import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
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

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') || 'list'
    const keyId = searchParams.get('id')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = Number(searchParams.get('limit') || '50')
    const offset = Number(searchParams.get('offset') || '0')

    // Action: list keys
    if (action === 'list' && req.method === 'GET') {
      let query = supabaseAdmin
        .from('key_inventory')
        .select('id, key_value, status, issued_to, added_at, issued_at', {
          count: 'exact',
        })

      if (status) query = query.eq('status', status)
      if (search) query = query.ilike('key_value', `%${search}%`)

      const { data: keys, count, error: listError } = await query
        .order('added_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (listError) throw listError

      return new Response(
        JSON.stringify({ keys, count }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: get key stats
    if (action === 'stats' && req.method === 'GET') {
      const { count: total } = await supabaseAdmin
        .from('key_inventory')
        .select('*', { count: 'exact', head: true })

      const { count: available } = await supabaseAdmin
        .from('key_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available')

      const { count: issued } = await supabaseAdmin
        .from('key_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'issued')

      const { count: disabled } = await supabaseAdmin
        .from('key_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disabled')

      return new Response(
        JSON.stringify({ total, available, issued, disabled }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: disable key
    if (action === 'disable' && keyId && req.method === 'PATCH') {
      const { data, error } = await supabaseAdmin
        .from('key_inventory')
        .update({ status: 'disabled' })
        .eq('id', keyId)
        .neq('status', 'issued')
        .select('id, status')

      if (error) throw error
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Key not found or already issued (cannot disable issued keys)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Key disabled', key: data[0] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: delete key (only available or disabled, not issued)
    if (action === 'delete' && keyId && req.method === 'DELETE') {
      const { data, error } = await supabaseAdmin
        .from('key_inventory')
        .delete()
        .eq('id', keyId)
        .in('status', ['available', 'disabled'])
        .select('id')

      if (error) throw error
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Key not found or currently issued (cannot delete issued keys)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Key deleted', id: keyId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: reveal key
    if (action === 'reveal' && keyId && req.method === 'GET') {
      const { data: key, error } = await supabaseAdmin
        .from('key_inventory')
        .select('id, key_value, status, issued_to, issued_at')
        .eq('id', keyId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ key }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Admin key management error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
