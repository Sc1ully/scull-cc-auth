-- Migration 10: Fix SECURITY DEFINER view
-- Replaces the blocking SELECT policy on key_inventory with a user-scoped
-- RLS policy, allowing the user_keys view to be a regular SECURITY INVOKER view.

-- Step 1: Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS public.user_keys;

-- Step 2: Replace the blocking SELECT policy with a safe user-scoped one
-- Previously: "no client select on key_inventory" (using false) — blocks ALL client SELECT
-- Now: "users can view their own claimed key" — allows SELECT for the user's own key only
DROP POLICY IF EXISTS "no client select on key_inventory" ON public.key_inventory;

CREATE POLICY "users can view their own claimed key"
ON public.key_inventory
FOR SELECT
TO authenticated
USING (issued_to = auth.uid());

-- Step 3: Recreate the view as a regular (SECURITY INVOKER) view
-- RLS on key_claims (auth.uid() = user_id) and key_inventory (issued_to = auth.uid())
-- now handle the filtering — no SECURITY DEFINER needed
CREATE VIEW public.user_keys AS
SELECT
    kc.id          AS claim_id,
    kc.claimed_at  AS claimed_at,
    kc.lootlabs_task_id,
    ki.key_value   AS key_value,
    ki.issued_at   AS issued_at,
    ki.status      AS key_status
FROM key_claims kc
JOIN key_inventory ki ON kc.key_id = ki.id
WHERE kc.user_id = auth.uid();

-- Allow authenticated users to read their own key through this view
-- (RLS on underlying tables enforces row-level filtering)
GRANT SELECT ON public.user_keys TO authenticated;
