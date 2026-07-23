create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum (
  'Admin',
  'Director',
  'Estimating Manager',
  'Senior Estimator',
  'Estimator'
);

create type public.membership_status as enum ('invited', 'active', 'deactivated');
create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  legal_name text not null check (char_length(legal_name) between 2 and 160),
  trading_name text,
  address text not null default '',
  city text not null default '',
  postcode text not null default '',
  country_code text not null default 'GB' check (char_length(country_code) = 2),
  phone text not null default '',
  email citext not null,
  website text,
  vat_number text not null default '',
  company_number text not null default '',
  logo_url text,
  quote_prefix text not null default 'QTE' check (quote_prefix ~ '^[A-Z0-9-]{2,10}$'),
  quote_start_number integer not null default 1 check (quote_start_number > 0),
  default_overhead_percent numeric(6,3) not null default 0 check (default_overhead_percent between 0 and 100),
  default_margin_percent numeric(6,3) not null default 0 check (default_margin_percent between 0 and 100),
  default_contingency_percent numeric(6,3) not null default 0 check (default_contingency_percent between 0 and 100),
  default_payment_terms text not null default '30 days net from invoice date',
  default_quote_validity text not null default '30 days from issue date',
  vat_rate numeric(6,3) not null default 20 check (vat_rate between 0 and 100),
  default_inclusions jsonb not null default '[]'::jsonb check (jsonb_typeof(default_inclusions) = 'array'),
  default_exclusions jsonb not null default '[]'::jsonb check (jsonb_typeof(default_exclusions) = 'array'),
  default_assumptions jsonb not null default '[]'::jsonb check (jsonb_typeof(default_assumptions) = 'array'),
  timezone text not null default 'Europe/London',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null default 'Estimator',
  status public.membership_status not null default 'invited',
  invited_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz,
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  unique (organization_id, user_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email citext not null,
  role public.app_role not null default 'Estimator',
  status public.invitation_status not null default 'pending',
  auth_user_id uuid references auth.users(id) on delete set null,
  invited_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create unique index invitations_one_pending_per_email
  on public.invitations (organization_id, email)
  where status = 'pending';

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  previous_data jsonb,
  new_data jsonb,
  occurred_at timestamptz not null default now()
);

create index organization_memberships_user_idx
  on public.organization_memberships (user_id, status);
create index organization_memberships_org_idx
  on public.organization_memberships (organization_id, status);
create index invitations_org_idx
  on public.invitations (organization_id, status);
create index audit_events_org_time_idx
  on public.audit_events (organization_id, occurred_at desc);

create or replace function public.set_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.updated_by = coalesce(auth.uid(), new.updated_by, old.updated_by);
  return new;
end;
$$;

create trigger organizations_set_audit_fields
before update on public.organizations
for each row execute function public.set_audit_fields();

create trigger profiles_set_audit_fields
before update on public.profiles
for each row execute function public.set_audit_fields();

create trigger memberships_set_audit_fields
before update on public.organization_memberships
for each row execute function public.set_audit_fields();

create trigger invitations_set_audit_fields
before update on public.invitations
for each row execute function public.set_audit_fields();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, created_by, updated_by)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.id,
    new.id
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  );
$$;

create or replace function public.has_organization_role(
  target_organization_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and membership.role = any(allowed_roles)
  );
$$;

revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.has_organization_role(uuid, public.app_role[]) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_organization_role(uuid, public.app_role[]) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_events enable row level security;

create policy organizations_select_member
on public.organizations for select
to authenticated
using (public.is_organization_member(id));

create policy organizations_update_leadership
on public.organizations for update
to authenticated
using (
  public.has_organization_role(
    id,
    array['Admin', 'Director']::public.app_role[]
  )
)
with check (
  public.has_organization_role(
    id,
    array['Admin', 'Director']::public.app_role[]
  )
);

create policy profiles_select_self_or_colleague
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.organization_memberships mine
    join public.organization_memberships theirs
      on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and theirs.user_id = profiles.id
      and theirs.status in ('active', 'invited')
  )
);

create policy profiles_update_self
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy memberships_select_colleagues
on public.organization_memberships for select
to authenticated
using (public.is_organization_member(organization_id));

create policy memberships_insert_admin
on public.organization_memberships for insert
to authenticated
with check (
  public.has_organization_role(
    organization_id,
    array['Admin']::public.app_role[]
  )
  and role <> 'Admin'
);

create policy memberships_update_admin
on public.organization_memberships for update
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['Admin']::public.app_role[]
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array['Admin']::public.app_role[]
  )
  and role <> 'Admin'
);

create policy invitations_select_admin
on public.invitations for select
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['Admin']::public.app_role[]
  )
);

create policy invitations_manage_admin
on public.invitations for all
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['Admin']::public.app_role[]
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array['Admin']::public.app_role[]
  )
  and role <> 'Admin'
);

create policy audit_events_select_member
on public.audit_events for select
to authenticated
using (public.is_organization_member(organization_id));

create or replace function public.record_organization_audit_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_org_id uuid;
  target_entity_id text;
begin
  if tg_table_name = 'organizations' then
    target_org_id := coalesce(new.id, old.id);
    target_entity_id := target_org_id::text;
  else
    target_org_id := coalesce(new.organization_id, old.organization_id);
    target_entity_id := coalesce(new.id, old.id)::text;
  end if;

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    previous_data,
    new_data
  )
  values (
    target_org_id,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    target_entity_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger organizations_audit
after insert or update or delete on public.organizations
for each row execute function public.record_organization_audit_event();

create trigger memberships_audit
after insert or update or delete on public.organization_memberships
for each row execute function public.record_organization_audit_event();

create trigger invitations_audit
after insert or update or delete on public.invitations
for each row execute function public.record_organization_audit_event();

grant usage on schema public to authenticated;
grant select on public.organizations to authenticated;
grant update (
  legal_name,
  trading_name,
  address,
  city,
  postcode,
  country_code,
  phone,
  email,
  website,
  vat_number,
  company_number,
  logo_url,
  quote_prefix,
  quote_start_number,
  default_overhead_percent,
  default_margin_percent,
  default_contingency_percent,
  default_payment_terms,
  default_quote_validity,
  vat_rate,
  default_inclusions,
  default_exclusions,
  default_assumptions,
  timezone,
  updated_at,
  updated_by
) on public.organizations to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, updated_at, updated_by)
  on public.profiles to authenticated;
grant select, insert on public.organization_memberships to authenticated;
grant update (role, status, joined_at, deactivated_at, updated_at, updated_by)
  on public.organization_memberships to authenticated;
grant select, insert, update, delete on public.invitations to authenticated;
grant select on public.audit_events to authenticated;

comment on table public.organizations is
  'Tenant boundary. Every Phase 2+ business table must reference organization_id.';
comment on table public.audit_events is
  'Append-only organisation audit history. UPDATE and DELETE are intentionally not granted.';
