-- Migration 13: Fix performance advisors (RLS init plan + unindexed FKs)
-- 1. Update RLS policies to use (select auth.uid()) for init plan optimization
-- 2. Add indexes for unindexed foreign keys

-- 1a. Fix "authenticated can view all profiles" on profiles
-- Change from TO public USING (auth.role() = 'authenticated') to TO authenticated USING (true)
-- This eliminates per-row auth.role() calls; role grant handles filtering
DROP POLICY IF EXISTS "authenticated can view all profiles" ON public.profiles;
CREATE POLICY "authenticated can view all profiles"
ON public.profiles FOR SELECT TO authenticated USING (true);

-- 1b. Fix "users can update own profile" on profiles
DROP POLICY IF EXISTS "users can update own profile" ON public.profiles;
CREATE POLICY "users can update own profile"
ON public.profiles FOR UPDATE TO public
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- 1c. Fix "users can view own key claims" on key_claims
DROP POLICY IF EXISTS "users can view own key claims" ON public.key_claims;
CREATE POLICY "users can view own key claims"
ON public.key_claims FOR SELECT TO public
USING ((select auth.uid()) = user_id);

-- 1d. Fix "users can view their own claimed key" on key_inventory
DROP POLICY IF EXISTS "users can view their own claimed key" ON public.key_inventory;
CREATE POLICY "users can view their own claimed key"
ON public.key_inventory FOR SELECT TO authenticated
USING (issued_to = (select auth.uid()));

-- 1e. Fix "users can view own lootlabs tasks" on lootlabs_tasks
DROP POLICY IF EXISTS "users can view own lootlabs tasks" ON public.lootlabs_tasks;
CREATE POLICY "users can view own lootlabs tasks"
ON public.lootlabs_tasks FOR SELECT TO public
USING ((select auth.uid()) = user_id);

-- 2. Add indexes for unindexed foreign keys
CREATE INDEX IF NOT EXISTS key_inventory_added_by_idx ON public.key_inventory(added_by);
CREATE INDEX IF NOT EXISTS lootlabs_tasks_key_id_idx ON public.lootlabs_tasks(key_id);
