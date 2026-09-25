import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createAdminClient, corsHeaders } from '../_shared/createServerSupabaseClient.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createAdminClient()
    const body = await req.json().catch(() => ({}))

    const { user_id, task_id } = body

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already has a key
    const { data: existingClaim, error: claimError } = await supabaseAdmin
      .from('key_claims')
      .select('key_id, key_inventory!inner(key_value)')
      .eq('user_id', user_id)
      .maybeSingle()

    if (!claimError && existingClaim?.key_inventory) {
      return new Response(
        JSON.stringify({
          status: 'success',
          key_value: existingClaim.key_inventory.key_value,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // No existing key — need task_id to claim a new one
    if (!task_id) {
      return new Response(
        JSON.stringify({
          status: 'no_claim',
          message: 'No key claim found and no task_id provided',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atomically claim a key via the RPC function
    const { data, error } = await supabaseAdmin.rpc('claim_available_key', {
      p_user_id: user_id,
      p_task_id: task_id,
    })

    if (error) throw error

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ status: 'no_keys', message: 'No keys available' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        key_value: data[0].key_value,
        claim_id: data[0].claim_id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
