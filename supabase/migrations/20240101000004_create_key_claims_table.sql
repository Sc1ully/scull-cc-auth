create table public.key_claims (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    key_id uuid references public.key_inventory(id) on delete restrict not null,
    lootlabs_task_id uuid references public.lootlabs_tasks(id) on delete set null,
    claimed_at timestamptz default now() not null
);

create index if not exists key_claims_user_id_idx on public.key_claims (user_id);
create index if not exists key_claims_key_id_idx on public.key_claims (key_id);
create index if not exists key_claims_lootlabs_task_id_idx on public.key_claims (lootlabs_task_id);
