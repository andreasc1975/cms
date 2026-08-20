-- CMS Customs Declarations — Supabase schema
--
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor
-- → New query → paste this whole file → Run).
--
-- Three real tables, not a single JSON blob:
--   declarations  — one row per customs declaration (the top-level record)
--   invoices      — one row per invoice line on a declaration (1-to-many)
--   item_lines    — one row per Items-table row on a declaration (1-to-many)
--
-- Two fields on `declarations` (general_form_data, proposed_fields) stay as
-- JSONB rather than their own columns — they're edited together as a single
-- form object in the app and aren't queried individually, so normalizing
-- them further wouldn't earn its complexity for this demo.
--
-- Access is fully open (no login), per your choice — anon key can read/write
-- everything. Fine for a demo; if this ever needs to be more than that,
-- swap the "USING (true)" policies below for real auth-based checks.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- declarations
-- ---------------------------------------------------------------------------
create table if not exists declarations (
  id uuid primary key default gen_random_uuid(),

  status text not null default 'O',                 -- 'C' | 'PO' | 'O'
  goods_no text not null default '',
  type_badge text not null default 'C',              -- 'C' | 'E' | 'P'
  customs_no text not null default '',
  declared text not null default '',

  declaration_type text,                             -- 'EX' | 'IM' (box 1)
  message_declaration_type text default '',
  managed_by text default '',
  customs_clearance_unit text default '',
  internal_reference text default '',
  no_of_parcels text default '',
  freight_and_costs text default '',
  currency_rate text default '1',

  processed text not null default '',
  reference_declaration text not null default '',
  recalculated_from text not null default '',
  invoice_no text not null default '',
  consignor_name text not null default '',
  consignee_name text not null default '',
  value text not null default '',
  currency text not null default 'NOK',
  net_weight text not null default '',
  gross_weight text not null default '',

  sender jsonb not null default '{"name":"","address":""}',
  consignee jsonb not null default '{"name":"","address":""}',
  owner jsonb not null default '{"name":"","address":""}',
  withdrawals jsonb,

  -- The Details tab's GENERAL form (box 48, 1, 7, 15A, ... fields) and which
  -- of those are currently shown as "proposed" (accept/reject) values.
  general_form_data jsonb not null default '{}',
  proposed_fields jsonb not null default '[]',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table declarations is 'One row per customs declaration.';

-- ---------------------------------------------------------------------------
-- invoices  (the "Registrerade fakturor" rows, one-to-many per declaration)
-- ---------------------------------------------------------------------------
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  declaration_id uuid not null references declarations(id) on delete cascade,

  invoice_no text default '',
  invoice_date text default '',
  currency text default 'NOK',
  total_amount text default '',
  gross_weight text default '',
  net_weight text default '',
  no_of_parcels text default '',

  sort_order integer not null default 0
);

comment on table invoices is 'Invoice line rows belonging to a declaration.';

-- ---------------------------------------------------------------------------
-- item_lines  (the Items-tab rows, one-to-many per declaration)
-- ---------------------------------------------------------------------------
create table if not exists item_lines (
  id uuid primary key default gen_random_uuid(),
  declaration_id uuid not null references declarations(id) on delete cascade,

  item_line_no text default '',
  article text default '',
  description text default '',
  marks_and_numbers text default '',
  packaging text default '',
  no_of_parcels text default '',
  statistical_no text default '',
  duty_reduction text default '',
  foodstuff boolean not null default false,
  origin text default '',
  city text default '',
  preferences text default '',
  procedure text default '',
  amount text default '',
  net_weight text default '',
  gross_weight text default '',
  other_quantity text default '',
  valuation_code text default '',
  reference text default '',
  statistical_value text default '',
  adjustment text default '',
  fees text default '',

  sort_order integer not null default 0
);

comment on table item_lines is 'Items-tab rows belonging to a declaration.';

-- ---------------------------------------------------------------------------
-- Helpful indexes for the foreign keys (Postgres doesn't add these for you)
-- ---------------------------------------------------------------------------
create index if not exists invoices_declaration_id_idx on invoices(declaration_id);
create index if not exists item_lines_declaration_id_idx on item_lines(declaration_id);

-- ---------------------------------------------------------------------------
-- Keep updated_at fresh automatically
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists declarations_set_updated_at on declarations;
create trigger declarations_set_updated_at
  before update on declarations
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — fully open, no login (per your choice)
-- ---------------------------------------------------------------------------
alter table declarations enable row level security;
alter table invoices enable row level security;
alter table item_lines enable row level security;

drop policy if exists "public read/write" on declarations;
create policy "public read/write" on declarations
  for all using (true) with check (true);

drop policy if exists "public read/write" on invoices;
create policy "public read/write" on invoices
  for all using (true) with check (true);

drop policy if exists "public read/write" on item_lines;
create policy "public read/write" on item_lines
  for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- addresses  (the Consignor/Consignee address book — local entries, distinct
-- from live Brønnøysundregistrene search results which are never stored here)
-- ---------------------------------------------------------------------------
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  alias text default '',
  associated_organization text default '',
  address text default '',
  address_2 text default '',
  address_3 text default '',
  country_code text default '',           -- e.g. 'NO' — ISO 3166-1 alpha-2
  country text not null default 'Norway', -- full name, used for EU/non-EU classification
  post_code text default '',
  city text default '',
  state text default '',
  contact_person text default '',
  phone_no text default '',
  email_address text default '',
  associated_customer text default '',

  org_no text default '',        -- Norwegian org number, if applicable
  verified boolean not null default false,

  created_at timestamptz not null default now()
);

comment on table addresses is 'Consignor/Consignee address book — separate from live Brreg search results.';
create index if not exists addresses_name_idx on addresses(name);

alter table addresses enable row level security;
drop policy if exists "public read/write" on addresses;
create policy "public read/write" on addresses
  for all using (true) with check (true);