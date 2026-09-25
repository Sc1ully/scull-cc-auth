import { serve } from 'https://deno.land/x/sift@0.0.7/mod.ts'
import { createAdminClient, corsHeaders } from '../_shared/createServerSupabaseClient.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createAdminClient()
    const body = await req.json()

    const { user_id, task_id } = body

    if (!user_id || !task_id) {
      return new Response(
        JSON.stringify({ error: 'user_id and task_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
