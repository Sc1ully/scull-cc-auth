-- Create a view that lets users securely retrieve their own claimed key
-- The view filters by auth.uid() so users only see their own key
-- Owned by postgres (bypasses RLS on underlying tables safely due to auth.uid() filter)
create or replace view user_keys as
select
    kc.id          as claim_id,
    kc.claimed_at  as claimed_at,
    kc.lootlabs_task_id,
    ki.key_value   as key_value,
    ki.issued_at   as issued_at,
    ki.status      as key_status
from key_claims kc
join key_inventory ki on kc.key_id = ki.id
where kc.user_id = auth.uid();

-- Allow authenticated users to read their own key through this view
grant select on user_keys to authenticated;
