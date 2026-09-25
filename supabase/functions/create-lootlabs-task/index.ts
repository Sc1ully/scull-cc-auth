import { serve } from 'https://deno.land/x/sift@0.0.7/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  createUserClient,
  verifyUser,
  corsHeaders,
} from '../_shared/createServerSupabaseClient.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createUserClient(req)
    const { user, profile } = await verifyUser(supabase)

    // Check if user already has a key
    const { data: existingClaim } = await supabase
      .from('key_claims')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingClaim) {
      return new Response(
        JSON.stringify({
          status: 'key_assigned',
          message: 'You already have a key assigned to your account.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has a completed or pending task
    const { data: existingTask } = await supabase
      .from('lootlabs_tasks')
      .select('id, status')
      .eq('user_id', user.id)
      .not('status', 'in', '(failed)')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingTask && existingTask.status === 'completed') {
      return new Response(
        JSON.stringify({
          status: 'verification_pending',
          message: 'Your LootLabs task is completed. The server is processing your key claim.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingTask && existingTask.status === 'pending') {
      return new Response(
        JSON.stringify({
          status: 'task_required',
          message: 'Please complete the LootLabs tasks.',
          task_id: existingTask.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if any keys are available (using anon client — RLS blocks this,
    // so we use a simple count via the admin client)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { count, error: countError } = await supabaseAdmin
      .from('key_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available')

    if (countError) throw countError

    if (count === null || count === 0) {
      return new Response(
        JSON.stringify({
          status: 'no_keys',
          message: 'No keys are currently available. Please check back later.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a cryptographically random puid
    const puid = crypto.randomUUID()

    // Create LootLabs link
    const tierId = Number(Deno.env.get('LOOTLABS_TIER_ID') ?? '2')
    const numberOfTasks = Number(Deno.env.get('LOOTLABS_NUM_TASKS') ?? '3')
    const theme = Number(Deno.env.get('LOOTLABS_THEME') ?? '1')
    const returnUrl = `${Deno.env.get('SITE_URL') ?? ''}/dashboard`

    const lootlabsRes = await fetch(
      'https://creators.lootlabs.gg/api/public/content_locker',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('LOOTLABS_API_KEY') ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Scull.cc-Auth',
          url: returnUrl,
          tier_id: tierId,
          number_of_tasks: numberOfTasks,
          theme: theme,
        }),
      }
    )

    const lootlabsData = await lootlabsRes.json()

    if (lootlabsData.type === 'error') {
      throw new Error(`LootLabs API error: ${lootlabsData.message}`)
    }

    const lootUrl = `${lootlabsData.message.loot_url}&puid=${puid}`

    // Store the task record
    const { data: task, error: taskError } = await supabaseAdmin
      .from('lootlabs_tasks')
      .insert({
        user_id: user.id,
        puid: puid,
        lootlabs_short: lootlabsData.message.short ?? null,
        lootlabs_url: lootUrl,
        status: 'pending',
      })
      .select('id')
      .single()

    if (taskError) throw taskError

    return new Response(
      JSON.stringify({
        status: 'task_created',
        message: 'LootLabs task created successfully.',
        loot_url: lootUrl,
        task_id: task.id,
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
