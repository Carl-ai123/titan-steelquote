-- Development-only seed. This file is never run against production automatically.
insert into public.organizations (
  id,
  slug,
  legal_name,
  trading_name,
  address,
  city,
  postcode,
  email,
  phone,
  website,
  vat_number,
  company_number,
  quote_start_number,
  default_overhead_percent,
  default_margin_percent,
  default_contingency_percent,
  default_inclusions,
  default_exclusions,
  default_assumptions
)
values (
  '10000000-0000-0000-0000-000000000001',
  'titan-steel-demo',
  'Titan Structural Steelwork Ltd',
  'Titan Steel',
  'Unit 4, Foundry Business Park, Steel Road',
  'Rotherham',
  'S60 5QT',
  'enquiries@titansteel.co.uk',
  '01709 823 400',
  'https://www.titansteel.co.uk',
  'GB 312 8841 22',
  '07418239',
  93,
  18,
  14.5,
  3,
  '["Supply and fabrication of structural steelwork","CE marking to execution class EXC2 per BS EN 1090-2"]',
  '["Cladding rails, purlins and sheeting","Concrete groundworks and foundations"]',
  '["Crane access available throughout erection period","Foundations provided by others"]'
)
on conflict (id) do nothing;

-- After creating a local Auth user, attach it as the development administrator:
-- insert into public.organization_memberships (
--   organization_id, user_id, role, status, joined_at
-- )
-- values (
--   '10000000-0000-0000-0000-000000000001',
--   '<local-auth-user-uuid>',
--   'Admin',
--   'active',
--   now()
-- );
