create table public.lootlabs_tasks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    puid text unique not null,
    lootlabs_short text,
    lootlabs_url text,
    status task_status default 'pending' not null,
    created_at timestamptz default now() not null,
    completed_at timestamptz,
    completion_unique_id text unique,
    completion_ip text,
    lootlabs_unique_id text,
    key_id uuid references public.key_inventory(id) on delete set null
);

create index if not exists lootlabs_tasks_user_id_idx on public.lootlabs_tasks (user_id);
create index if not exists lootlabs_tasks_puid_idx on public.lootlabs_tasks (puid);
create index if not exists lootlabs_tasks_status_idx on public.lootlabs_tasks (status);
create index if not exists lootlabs_tasks_completion_unique_id_idx on public.lootlabs_tasks (completion_unique_id);
