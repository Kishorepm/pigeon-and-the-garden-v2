-- Run once in a dedicated Supabase project. No existing app tables are modified.
create table if not exists public.kingdom_states (
  id uuid primary key default gen_random_uuid(),
  revision bigint not null default 0,
  state jsonb not null default '{}'::jsonb
);
create table if not exists public.kingdom_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kingdom_id uuid not null references public.kingdom_states(id),
  home text not null check (home in ('north','south')),
  unique (kingdom_id,home)
);
alter table public.kingdom_states enable row level security;
alter table public.kingdom_members enable row level security;
revoke all on public.kingdom_states,public.kingdom_members from anon,authenticated;
grant select,insert,update,delete on public.kingdom_states,public.kingdom_members to service_role;
-- Server validates identity and every action. Clients never receive raw sealed capsules.
create or replace function public.commit_kingdom(kingdom uuid,expected_revision bigint,next_state jsonb)
returns boolean language plpgsql set search_path='' as $$
declare affected integer;
begin
  update public.kingdom_states set state=next_state,revision=revision+1
  where id=kingdom and revision=expected_revision;
  get diagnostics affected=row_count;
  return affected=1;
end;
$$;
revoke all on function public.commit_kingdom(uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.commit_kingdom(uuid,bigint,jsonb) to service_role;
