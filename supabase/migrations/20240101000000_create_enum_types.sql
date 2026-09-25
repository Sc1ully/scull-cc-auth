create type user_role as enum ('user', 'admin');
create type user_status as enum ('active', 'disabled');
create type key_status as enum ('available', 'issued', 'disabled');
create type task_status as enum ('pending', 'completed', 'failed');
