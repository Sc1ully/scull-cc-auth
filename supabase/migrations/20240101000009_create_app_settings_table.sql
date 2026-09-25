-- App-level settings (non-sensitive configuration)
-- Sensitive values (like LootLabs API key) are stored as project secrets, NOT here
create table if not exists app_settings (
    key text primary key,
    value text,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Insert default settings
insert into app_settings (key, value, description) values
    ('lootlabs_tier_id', '2', 'LootLabs tier ID (1-4)'),
    ('lootlabs_number_of_tasks', '3', 'Number of tasks required in LootLabs (1-5)'),
    ('lootlabs_theme', '1', 'LootLabs theme (1-5)'),
    ('lootlabs_link_title', 'Scull.cc-Auth Free Key', 'Title for LootLabs links')
on conflict (key) do nothing;
