-- HealthiestFood private account-scoped state sync
-- Install ONLY in a dedicated HealthiestFood Supabase project after the project/organisation and cost are approved.
-- No data is made public. Do not reuse unrelated client or personal-health databases.
create table if not exists public.healthiestfood_snapshots (
  owner_id uuid not null references auth.users(id) on delete cascade,
  doc_key text not null default 'primary' check (doc_key = 'primary'),
  snapshot jsonb not null check(
    jsonb_typeof(snapshot)='object'
    and snapshot->>'schema' = 'healthiestfood-local-backup-v1'
    and jsonb_typeof(snapshot->'records')='object'
    and octet_length(snapshot::text) <= 1024000
  ),
  revision bigint not null default 1 check(revision > 0),
  updated_at timestamptz not null default now(),
  primary key(owner_id,doc_key)
);
alter table public.healthiestfood_snapshots enable row level security;
revoke all on public.healthiestfood_snapshots from public,anon;
grant select,insert,update on public.healthiestfood_snapshots to authenticated;
drop policy if exists "owner can read their snapshot" on public.healthiestfood_snapshots;
create policy "owner can read their snapshot" on public.healthiestfood_snapshots for select to authenticated
 using ((select auth.uid()) = owner_id);
drop policy if exists "owner can create their snapshot" on public.healthiestfood_snapshots;
create policy "owner can create their snapshot" on public.healthiestfood_snapshots for insert to authenticated
 with check ((select auth.uid()) = owner_id);
drop policy if exists "owner can update their snapshot" on public.healthiestfood_snapshots;
create policy "owner can update their snapshot" on public.healthiestfood_snapshots for update to authenticated
 using ((select auth.uid()) = owner_id)
 with check ((select auth.uid()) = owner_id);

-- Optimistic concurrency: prevent stale clients overwriting another device's revision.
-- SECURITY INVOKER is deliberate; it enforces existing RLS and does not elevate user privileges.
create or replace function public.save_healthiestfood_snapshot(
  expected_revision bigint, new_snapshot jsonb
)
returns table(saved_revision bigint, was_conflict boolean)
language plpgsql security invoker set search_path = ''
as $$
declare
  who uuid := (select auth.uid());
  result_revision bigint;
begin
  if who is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if expected_revision is null or expected_revision < 0 then
    raise exception 'Invalid revision' using errcode='22023';
  end if;
  if new_snapshot is null or jsonb_typeof(new_snapshot)<>'object'
    or new_snapshot->>'schema'<>'healthiestfood-local-backup-v1'
    or jsonb_typeof(new_snapshot->'records')<>'object'
    or octet_length(new_snapshot::text)>1024000 then
    raise exception 'Invalid HealthiestFood backup' using errcode='22023';
  end if;
  if expected_revision=0 then
    insert into public.healthiestfood_snapshots(owner_id,doc_key,snapshot,revision)
    values(who,'primary',new_snapshot,1)
    on conflict (owner_id,doc_key) do nothing
    returning revision into result_revision;
  else
    update public.healthiestfood_snapshots
      set snapshot=new_snapshot, revision=revision+1, updated_at=now()
      where owner_id=who and doc_key='primary' and revision=expected_revision
      returning revision into result_revision;
  end if;
  if result_revision is null then
    saved_revision:=0;was_conflict:=true;
  else
    saved_revision:=result_revision;was_conflict:=false;
  end if;
  return next;
end
$$;
revoke all on function public.save_healthiestfood_snapshot(bigint,jsonb) from public,anon;
grant execute on function public.save_healthiestfood_snapshot(bigint,jsonb) to authenticated;

-- Owner isolation sanity checks (run using distinct authenticated test users):
-- SELECT / UPDATE / INSERT for another owner must be denied by RLS;
-- save with expected_revision=0 must succeed once, then conflict;
-- save with the returned revision must advance exactly one;
-- saving the stale revision must return was_conflict=true without overwriting content.
