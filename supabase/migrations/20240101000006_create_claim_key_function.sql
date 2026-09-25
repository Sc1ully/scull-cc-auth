-- Atomic key claiming function
-- Called by Edge Functions (which use the service_role key)
-- Uses UPDATE ... RETURNING inside a single transaction to prevent race conditions
create or replace function public.claim_available_key(p_user_id uuid, p_task_id uuid)
returns table(key_value text, claim_id uuid)
language plpgsql
security definer
as $$
declare
    v_key_id uuid;
    v_key_value text;
    v_claim_id uuid;
begin
    -- Atomically claim one available key (oldest first)
    -- UPDATE ... RETURNING is atomic at the row level
    update public.key_inventory
    set status = 'issued',
        issued_to = p_user_id,
        issued_at = now()
    where status = 'available'
    order by added_at asc
    limit 1
    returning id, key_value
    into v_key_id, v_key_value;

    -- If no key was available, return empty
    if v_key_id is null then
        return;
    end if;

    -- Create the claim record
    insert into public.key_claims (user_id, key_id, lootlabs_task_id, claimed_at)
    values (p_user_id, v_key_id, p_task_id, now())
    returning id
    into v_claim_id;

    -- Link the key to the task
    update public.lootlabs_tasks
    set key_id = v_key_id
    where id = p_task_id;

    -- Return the key value so the caller can associate it
    return query
    select v_key_value, v_claim_id;
end;
$$;
