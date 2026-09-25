create table public.key_inventory (
    id uuid primary key default gen_random_uuid(),
    key_value text unique not null,
    status key_status default 'available' not null,
    issued_to uuid references public.profiles(id) on delete set null,
    added_by uuid references public.profiles(id) on delete set null,
    added_at timestamptz default now() not null,
    issued_at timestamptz,
    notes text
);

create index if not exists key_inventory_status_idx on public.key_inventory (status);
create index if not exists key_inventory_issued_to_idx on public.key_inventory (issued_to);
