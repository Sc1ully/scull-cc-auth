import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createAdminClient, corsHeaders } from '../_shared/createServerSupabaseClient.ts'
import { verifyAdmin } from '../_shared/createServerSupabaseClient.ts'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createAdminClient()
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const jwt = authHeader.replace('Bearer ', '')
    const userClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: `Bearer ${jwt}` } }
    })
    await verifyAdmin(userClient)

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'

    if (req.method === 'GET' && action === 'list') {
      const { data, error } = await supabaseAdmin
        .from('app_settings')
        .select('key, value, description')
        .order('key')
      if (error) throw error
      return new Response(JSON.stringify({ settings: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT' && action === 'update') {
      const body = await req.json()
      const { key, value } = body
      if (!key || value === undefined) {
        return new Response(JSON.stringify({ error: 'key and value required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const { error } = await supabaseAdmin
        .from('app_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
      if (error) throw error
      return new Response(JSON.stringify({ message: 'Setting updated' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
