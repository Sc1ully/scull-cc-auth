import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createAdminClient, corsHeaders } from '../_shared/createServerSupabaseClient.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const clickId = url.searchParams.get('click_id')
    const ip = url.searchParams.get('ip')
    const uniqueId = url.searchParams.get('unique_id')

    // Validate required parameters
    if (!clickId || !ip || !uniqueId) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters: click_id, ip, unique_id are required',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Find the task session by puid (click_id = puid)
    const { data: task, error: taskError } = await supabaseAdmin
      .from('lootlabs_tasks')
      .select('id, user_id, status, completion_unique_id')
      .eq('puid', clickId)
      .single()

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Invalid or unknown puid' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Idempotency: check if this unique_id has already been processed
    if (task.completion_unique_id) {
      // This task already has a completion recorded
      if (task.completion_unique_id === uniqueId) {
        // Same unique_id — already processed, return OK (idempotent)
        return new Response(
          JSON.stringify({ message: 'Postback already processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      // Different unique_id for same task — this shouldn't normally happen
      // but we allow it as long as the key hasn't been claimed yet
    }

    // Check if a key has already been claimed for this task
    const { data: existingClaim } = await supabaseAdmin
      .from('key_claims')
      .select('id')
      .eq('lootlabs_task_id', task.id)
      .maybeSingle()

    if (existingClaim) {
      // Key already claimed for this task — return OK (idempotent)
      return new Response(
        JSON.stringify({ message: 'Key already claimed for this task' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Record the completion and atomically claim a key
    const { data: claimResult, error: claimError } = await supabaseAdmin
      .rpc('claim_available_key', {
        p_user_id: task.user_id,
        p_task_id: task.id,
      })

    if (claimError) {
      // Rollback: mark task as failed since claiming failed
      await supabaseAdmin
        .from('lootlabs_tasks')
        .update({
          status: 'failed',
          completion_unique_id: uniqueId,
          completion_ip: ip,
          completed_at: new Date().toISOString(),
        })
        .eq('id', task.id)

      throw claimError
    }

    if (!claimResult || claimResult.length === 0) {
      // Key claimed returned empty — no keys were available
      // Mark task as completed but key claim failed
      await supabaseAdmin
        .from('lootlabs_tasks')
        .update({
          status: 'completed',
          completion_unique_id: uniqueId,
          completion_ip: ip,
          completed_at: new Date().toISOString(),
          lootlabs_unique_id: uniqueId,
        })
        .eq('id', task.id)

      // Notify: no keys available (could send to a log/queue)
      return new Response(
        JSON.stringify({
          message: 'Task completed but no keys available',
          status: 'no_keys_available',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Success: update the task with completion data
    await supabaseAdmin
      .from('lootlabs_tasks')
      .update({
        status: 'completed',
        completion_unique_id: uniqueId,
        completion_ip: ip,
        completed_at: new Date().toISOString(),
        lootlabs_unique_id: uniqueId,
      })
      .eq('id', task.id)

    // Log successful claim
    console.log(`Key claimed for user ${task.user_id}, task ${task.id}, puid ${clickId}`)

    return new Response(
      JSON.stringify({
        message: 'Postback processed successfully, key claimed',
        status: 'success',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Postback error:', message)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
