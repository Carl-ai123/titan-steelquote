begin;
select plan(6);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'admin-a@example.test', '',
    now(), '{}', '{"full_name":"Admin A"}', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'estimator-a@example.test', '',
    now(), '{}', '{"full_name":"Estimator A"}', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'admin-b@example.test', '',
    now(), '{}', '{"full_name":"Admin B"}', now(), now()
  );

insert into public.organizations (id, slug, legal_name, email)
values
  ('30000000-0000-0000-0000-000000000001', 'org-a', 'Organisation A', 'a@example.test'),
  ('30000000-0000-0000-0000-000000000002', 'org-b', 'Organisation B', 'b@example.test');

insert into public.organization_memberships (
  organization_id, user_id, role, status, joined_at
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Admin', 'active', now()
  ),
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'Estimator', 'active', now()
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    'Admin', 'active', now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000001',
  true
);

select results_eq(
  $$ select slug::text from public.organizations order by slug $$,
  $$ values ('org-a'::text) $$,
  'an administrator can only read their own organisation'
);

select results_eq(
  $$ select count(*)::bigint from public.organization_memberships $$,
  $$ values (2::bigint) $$,
  'an administrator can only read colleagues in their organisation'
);

select results_eq(
  $$
    update public.organizations
    set trading_name = 'Changed A'
    where id = '30000000-0000-0000-0000-000000000001'
    returning trading_name
  $$,
  $$ values ('Changed A'::text) $$,
  'an administrator can update their organisation'
);

select results_eq(
  $$
    update public.organizations
    set trading_name = 'Leaked change'
    where id = '30000000-0000-0000-0000-000000000002'
    returning trading_name
  $$,
  $$ select null::text where false $$,
  'an administrator cannot update another organisation'
);

select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000002',
  true
);

select results_eq(
  $$
    update public.organizations
    set trading_name = 'Estimator change'
    where id = '30000000-0000-0000-0000-000000000001'
    returning trading_name
  $$,
  $$ select null::text where false $$,
  'an estimator cannot update organisation settings'
);

select results_eq(
  $$ select email::text from public.profiles order by email $$,
  $$ values ('admin-a@example.test'::text), ('estimator-a@example.test'::text) $$,
  'users cannot read profiles from another organisation'
);

select * from finish();
rollback;
