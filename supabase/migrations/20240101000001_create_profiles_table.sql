create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    email text,
    role user_role default 'user' not null,
    status user_status default 'active' not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists profiles_email_idx on public.profiles (email);

-- Column-level: authenticated users can only update username, not role/status/email/etc
revoke update(role, status, created_at, updated_at, id, email) on public.profiles from authenticated;
grant update(username) on public.profiles to authenticated;
