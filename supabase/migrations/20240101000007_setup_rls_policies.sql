-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.key_inventory enable row level security;
alter table public.lootlabs_tasks enable row level security;
alter table public.key_claims enable row level security;

-- ============================================================
-- profiles
-- ============================================================

-- SELECT: all authenticated users can read profiles (display usernames)
create policy "authenticated can view all profiles"
on public.profiles for select
using (auth.role() = 'authenticated');

-- UPDATE: users can only update their own profile (username only — column-level)
create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- INSERT: blocked for clients (profiles created by trigger)
create policy "no client-side insert on profiles"
on public.profiles for insert
to authenticated
with check (false);

-- DELETE: blocked for clients
create policy "no client-side delete on profiles"
on public.profiles for delete
to authenticated
using (false);

-- ============================================================
-- key_inventory
-- NO client access at all — all operations via Edge Functions
-- ============================================================

create policy "no client select on key_inventory"
on public.key_inventory for select
to authenticated
using (false);

create policy "no client insert on key_inventory"
on public.key_inventory for insert
to authenticated
with check (false);

create policy "no client update on key_inventory"
on public.key_inventory for update
to authenticated
using (false);

create policy "no client delete on key_inventory"
on public.key_inventory for delete
to authenticated
using (false);

-- ============================================================
-- lootlabs_tasks
-- ============================================================

-- SELECT: users can only see their own tasks
create policy "users can view own lootlabs tasks"
on public.lootlabs_tasks for select
using (auth.uid() = user_id);

-- INSERT: blocked for clients (tasks created by Edge Function)
create policy "no client insert on lootlabs_tasks"
on public.lootlabs_tasks for insert
to authenticated
with check (false);

-- UPDATE: blocked for clients
create policy "no client update on lootlabs_tasks"
on public.lootlabs_tasks for update
to authenticated
using (false);

-- DELETE: blocked for clients
create policy "no client delete on lootlabs_tasks"
on public.lootlabs_tasks for delete
to authenticated
using (false);

-- ============================================================
-- key_claims
-- ============================================================

-- SELECT: users can only see their own claims
create policy "users can view own key claims"
on public.key_claims for select
using (auth.uid() = user_id);

-- INSERT: blocked for clients (claims created atomically by Edge Function)
create policy "no client insert on key_claims"
on public.key_claims for insert
to authenticated
with check (false);

-- UPDATE: blocked for clients
create policy "no client update on key_claims"
on public.key_claims for update
to authenticated
using (false);

-- DELETE: blocked for clients
create policy "no client delete on key_claims"
on public.key_claims for delete
to authenticated
using (false);
