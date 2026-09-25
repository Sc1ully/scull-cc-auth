import { serve } from 'https://deno.land/x/sift@0.0.7/mod.ts'
import { createAdminClient, corsHeaders } from '../_shared/createServerSupabaseClient.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createAdminClient()

    // Verify admin via JWT in the request
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

    // Check admin role
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

    // Parse the keys from request body
    const body = await req.json()
    const { keys, notes } = body

    if (!keys || typeof keys !== 'string' || keys.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'No keys provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Split input into individual keys, trim whitespace, remove empty lines
    const keyLines = keys
      .split('\n')
      .map((k: string) => k.trim())
      .filter((k: string) => k !== '')

    if (keyLines.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid keys found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find duplicates (keys already in the database)
    const existingKeys: string[] = []
    for (const key of keyLines) {
      const { data: existing } = await supabaseAdmin
        .from('key_inventory')
        .select('key_value')
        .eq('key_value', key)
        .maybeSingle()

      if (existing) {
        existingKeys.push(key)
      }
    }

    const newKeys = keyLines.filter((k: string) => !existingKeys.includes(k))

    // Insert new keys in batch
    if (newKeys.length > 0) {
      const keysToInsert = newKeys.map((key: string) => ({
        key_value: key,
        status: 'available',
        added_by: user.id,
        notes: notes || null,
      }))

      const { error: insertError } = await supabaseAdmin
        .from('key_inventory')
        .insert(keysToInsert)

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({
        added: newKeys.length,
        skipped: existingKeys.length,
        duplicates: existingKeys,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Key import error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
