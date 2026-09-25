-- Auto-update updated_at column on profile changes
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

-- Create profile on new auth user (username passed via sign-up metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
    insert into public.profiles (id, username, email)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'username', ''),
        new.email
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Sync email changes from auth.users to profiles
create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
as $$
begin
    update public.profiles
    set email = new.email
    where id = new.id;
    return new;
end;
$$;

create trigger on_auth_user_updated
    after update of email on auth.users
    for each row
    execute function public.handle_user_updated();
