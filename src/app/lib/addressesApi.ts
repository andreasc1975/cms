import { supabase } from './supabase';

// The address book entry shape used throughout the app (Consignor/Consignee
// pickers, Organization Details modal, etc). Matches the "addresses" table
// in Supabase 1-to-1 (camelCase here, snake_case in the DB).
export interface AddressEntry {
  id: string;
  name: string;
  alias: string;
  associatedOrganization: string;
  address: string;
  address2: string;
  address3: string;
  countryCode: string;
  country: string;
  postCode: string;
  city: string;
  state: string;
  contactPerson: string;
  phoneNo: string;
  emailAddress: string;
  associatedCustomer: string;
  orgNo: string;
  verified: boolean;
}

function dbToAddressEntry(row: any): AddressEntry {
  return {
    id: row.id,
    name: row.name ?? '',
    alias: row.alias ?? '',
    associatedOrganization: row.associated_organization ?? '',
    address: row.address ?? '',
    address2: row.address_2 ?? '',
    address3: row.address_3 ?? '',
    countryCode: row.country_code ?? '',
    country: row.country ?? 'Norway',
    postCode: row.post_code ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    contactPerson: row.contact_person ?? '',
    phoneNo: row.phone_no ?? '',
    emailAddress: row.email_address ?? '',
    associatedCustomer: row.associated_customer ?? '',
    orgNo: row.org_no ?? '',
    verified: row.verified ?? false
  };
}

function addressEntryToDb(entry: Omit<AddressEntry, 'id'>) {
  return {
    name: entry.name,
    alias: entry.alias,
    associated_organization: entry.associatedOrganization,
    address: entry.address,
    address_2: entry.address2,
    address_3: entry.address3,
    country_code: entry.countryCode,
    country: entry.country,
    post_code: entry.postCode,
    city: entry.city,
    state: entry.state,
    contact_person: entry.contactPerson,
    phone_no: entry.phoneNo,
    email_address: entry.emailAddress,
    associated_customer: entry.associatedCustomer,
    org_no: entry.orgNo,
    verified: entry.verified
  };
}

export async function fetchAddresses(): Promise<AddressEntry[]> {
  const { data, error } = await supabase.from('addresses').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(dbToAddressEntry);
}

export async function createAddress(entry: Omit<AddressEntry, 'id'>): Promise<AddressEntry> {
  const { data, error } = await supabase.from('addresses').insert(addressEntryToDb(entry)).select().single();
  if (error) throw error;
  return dbToAddressEntry(data);
}

/**
 * Seed data for a fresh `addresses` table — 20 Norwegian companies plus 10
 * foreign ones (5 EU, 5 non-EU), so the automatic Import/Export/EU
 * classification actually has something to differentiate in a demo.
 */
export const SEED_ADDRESSES: Omit<AddressEntry, 'id'>[] = [
  { name: 'Schenker Norge AS', alias: '', associatedOrganization: '', address: 'Alnabru Terminalgata 20', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0614', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88901', verified: true },
  { name: 'Norsk Hydro ASA', alias: '', associatedOrganization: '', address: 'Drammensveien 264', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0283', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88902', verified: true },
  { name: 'Equinor ASA', alias: '', associatedOrganization: '', address: 'Forusbeen 50', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '4035', city: 'Stavanger', state: 'Rogaland', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Orkla Foods Norge AS', alias: '', associatedOrganization: '', address: 'Karenslyst Allé 6', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0278', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88904', verified: true },
  { name: 'Rema 1000 Norge AS', alias: '', associatedOrganization: '', address: 'Drammensveien 149', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0277', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'NorgesGruppen ASA', alias: '', associatedOrganization: '', address: 'Industriveien 25', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '2069', city: 'Jessheim', state: 'Viken', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88906', verified: true },
  { name: 'Telenor ASA', alias: '', associatedOrganization: '', address: 'Snarøyveien 30', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '1360', city: 'Fornebu', state: 'Viken', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88907', verified: true },
  { name: 'DNB Bank ASA', alias: '', associatedOrganization: '', address: 'Dronning Eufemias gate 30', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0191', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Storebrand ASA', alias: '', associatedOrganization: '', address: 'Professor Kohtsvei 9', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '1366', city: 'Lysaker', state: 'Viken', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88909', verified: true },
  { name: 'Yara International ASA', alias: '', associatedOrganization: '', address: 'Drammensveien 131', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0277', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Aker Solutions ASA', alias: '', associatedOrganization: '', address: 'Oksenøyveien 10', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '1366', city: 'Lysaker', state: 'Viken', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88911', verified: true },
  { name: 'Kongsberg Gruppen ASA', alias: '', associatedOrganization: '', address: 'Kirkegårdsveien 45', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '3616', city: 'Kongsberg', state: 'Viken', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Mowi ASA', alias: '', associatedOrganization: '', address: 'Sandviksboder 77A', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '5035', city: 'Bergen', state: 'Vestland', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88913', verified: true },
  { name: 'Elkem ASA', alias: '', associatedOrganization: '', address: 'Drammensveien 167', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0277', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88914', verified: true },
  { name: 'Salmar ASA', alias: '', associatedOrganization: '', address: 'Industriveien 51', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '7266', city: 'Kverva', state: 'Trøndelag', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Atea ASA', alias: '', associatedOrganization: '', address: 'Grenseveien 88', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0663', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88916', verified: true },
  { name: 'TGS ASA', alias: '', associatedOrganization: '', address: 'Askekroken 11', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0277', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Autostore AS', alias: '', associatedOrganization: '', address: 'Stokkastrandvegen 85', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '5578', city: 'Nedre Vats', state: 'Rogaland', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88918', verified: true },
  { name: 'Statkraft AS', alias: '', associatedOrganization: '', address: 'Lilleakerveien 6', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0283', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '88919', verified: true },
  { name: 'Wilhelmsen Ship Management', alias: '', associatedOrganization: '', address: 'Strandveien 20', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '1366', city: 'Lysaker', state: 'Viken', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },

  // EU
  { name: 'Deutsche Bahn Cargo GmbH', alias: '', associatedOrganization: '', address: 'Mainzer Landstraße 185', address2: '', address3: '', countryCode: 'DE', country: 'Germany', postCode: '60327', city: 'Frankfurt', state: 'Hesse', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },
  { name: 'CMA CGM France', alias: '', associatedOrganization: '', address: '4 Quai d\u2019Arenc', address2: '', address3: '', countryCode: 'FR', country: 'France', postCode: '13002', city: 'Marseille', state: 'Provence', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },
  { name: 'Heineken Nederland B.V.', alias: '', associatedOrganization: '', address: 'Tweede Weteringplantsoen 21', address2: '', address3: '', countryCode: 'NL', country: 'Netherlands', postCode: '1017 ZD', city: 'Amsterdam', state: 'North Holland', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },
  { name: 'Volvo Group Sverige AB', alias: '', associatedOrganization: '', address: 'Gropegårdsgatan 2', address2: '', address3: '', countryCode: 'SE', country: 'Sweden', postCode: '405 08', city: 'Gothenburg', state: 'Västra Götaland', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },
  { name: 'Maersk Danmark A/S', alias: '', associatedOrganization: '', address: 'Esplanaden 50', address2: '', address3: '', countryCode: 'DK', country: 'Denmark', postCode: '1263', city: 'Copenhagen', state: 'Capital Region', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },

  // Non-EU
  { name: 'Maersk Line Limited', alias: '', associatedOrganization: '', address: 'Esplanaden 50', address2: '', address3: '', countryCode: 'GB', country: 'United Kingdom', postCode: 'EC3N 4AA', city: 'London', state: 'England', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },
  { name: 'Amazon.com Inc', alias: '', associatedOrganization: '', address: '410 Terry Ave N', address2: '', address3: '', countryCode: 'US', country: 'United States', postCode: '98109', city: 'Seattle', state: 'Washington', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },
  { name: 'Nestlé Suisse S.A.', alias: '', associatedOrganization: '', address: 'Avenue Nestlé 55', address2: '', address3: '', countryCode: 'CH', country: 'Switzerland', postCode: '1800', city: 'Vevey', state: 'Vaud', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },
  { name: 'Toyota Tsusho Corporation', alias: '', associatedOrganization: '', address: '9-8 Meieki 4-chome', address2: '', address3: '', countryCode: 'JP', country: 'Japan', postCode: '450-8575', city: 'Nagoya', state: 'Aichi', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true },
  { name: 'COSCO Shipping Lines Co., Ltd.', alias: '', associatedOrganization: '', address: '378 Dongdaming Road', address2: '', address3: '', countryCode: 'CN', country: 'China', postCode: '200002', city: 'Shanghai', state: 'Shanghai', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: true }
];

/** Seeds the addresses table once, only if it's currently empty. */
export async function seedAddressesIfEmpty(): Promise<AddressEntry[]> {
  const existing = await fetchAddresses();
  if (existing.length > 0) return existing;
  const created = await Promise.all(SEED_ADDRESSES.map((entry) => createAddress(entry)));
  return created;
}

/**
 * Private individuals — 10 Norwegian, 10 foreign (mix of EU/non-EU) — so
 * Consignor/Consignee can be a natural person, not just a company, while
 * still exercising the EX/IM/EU classification. No org number (individuals
 * don't have one) and never "verified" (Brreg only covers organizations).
 */
export const SEED_PRIVATE_INDIVIDUALS: Omit<AddressEntry, 'id'>[] = [
  // Norwegian
  { name: 'Kari Andersen', alias: '', associatedOrganization: '', address: 'Bygdøy Allé 14', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '0262', city: 'Oslo', state: 'Oslo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Ole Hansen', alias: '', associatedOrganization: '', address: 'Nordre gate 8', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '7011', city: 'Trondheim', state: 'Trøndelag', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Anna Johansen', alias: '', associatedOrganization: '', address: 'Strandgaten 25', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '5004', city: 'Bergen', state: 'Vestland', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Lars Pettersen', alias: '', associatedOrganization: '', address: 'Kongens gate 3', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '4005', city: 'Stavanger', state: 'Rogaland', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Ingrid Larsen', alias: '', associatedOrganization: '', address: 'Storgata 45', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '9008', city: 'Tromsø', state: 'Troms', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Erik Nilsen', alias: '', associatedOrganization: '', address: 'Møllergata 12', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '1530', city: 'Moss', state: 'Viken', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Mari Kristiansen', alias: '', associatedOrganization: '', address: 'Dronningens gate 7', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '4610', city: 'Kristiansand', state: 'Agder', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Thomas Berg', alias: '', associatedOrganization: '', address: 'Torggata 20', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '2317', city: 'Hamar', state: 'Innlandet', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Silje Haugen', alias: '', associatedOrganization: '', address: 'Rådhusgata 5', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '6003', city: 'Ålesund', state: 'Møre og Romsdal', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Jonas Solberg', alias: '', associatedOrganization: '', address: 'Prinsens gate 33', address2: '', address3: '', countryCode: 'NO', country: 'Norway', postCode: '3044', city: 'Drammen', state: 'Viken', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },

  // Foreign — EU
  { name: 'Emma Schmidt', alias: '', associatedOrganization: '', address: 'Friedrichstraße 55', address2: '', address3: '', countryCode: 'DE', country: 'Germany', postCode: '10117', city: 'Berlin', state: 'Berlin', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Lucas Dubois', alias: '', associatedOrganization: '', address: 'Rue de Rivoli 12', address2: '', address3: '', countryCode: 'FR', country: 'France', postCode: '75001', city: 'Paris', state: 'Île-de-France', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Sofia Lindgren', alias: '', associatedOrganization: '', address: 'Kungsgatan 8', address2: '', address3: '', countryCode: 'SE', country: 'Sweden', postCode: '111 43', city: 'Stockholm', state: 'Stockholm', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Anders Nielsen', alias: '', associatedOrganization: '', address: 'Nørrebrogade 22', address2: '', address3: '', countryCode: 'DK', country: 'Denmark', postCode: '2200', city: 'Copenhagen', state: 'Capital Region', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Maria Rossi', alias: '', associatedOrganization: '', address: 'Via del Corso 45', address2: '', address3: '', countryCode: 'IT', country: 'Italy', postCode: '00186', city: 'Rome', state: 'Lazio', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },

  // Foreign — non-EU
  { name: 'James Wilson', alias: '', associatedOrganization: '', address: 'Baker Street 42', address2: '', address3: '', countryCode: 'GB', country: 'United Kingdom', postCode: 'NW1 6XE', city: 'London', state: 'England', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Sarah Johnson', alias: '', associatedOrganization: '', address: '5th Avenue 350', address2: '', address3: '', countryCode: 'US', country: 'United States', postCode: '10118', city: 'New York', state: 'New York', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Hans Zimmermann', alias: '', associatedOrganization: '', address: 'Bahnhofstrasse 10', address2: '', address3: '', countryCode: 'CH', country: 'Switzerland', postCode: '8001', city: 'Zurich', state: 'Zurich', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Yuki Tanaka', alias: '', associatedOrganization: '', address: 'Shibuya 2-1', address2: '', address3: '', countryCode: 'JP', country: 'Japan', postCode: '150-0002', city: 'Tokyo', state: 'Tokyo', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false },
  { name: 'Wei Chen', alias: '', associatedOrganization: '', address: 'Nanjing Road 100', address2: '', address3: '', countryCode: 'CN', country: 'China', postCode: '200003', city: 'Shanghai', state: 'Shanghai', contactPerson: '', phoneNo: '', emailAddress: '', associatedCustomer: '', orgNo: '', verified: false }
];

/**
 * One-time addition of the private individuals above to an ALREADY-seeded
 * addresses table — seedAddressesIfEmpty only runs on a genuinely empty
 * table, so it wouldn't add these to a database that already has company
 * entries. Checks by name first so it's safe to call more than once.
 */
export async function addPrivateIndividualsIfMissing(): Promise<AddressEntry[]> {
  const existing = await fetchAddresses();
  const existingNames = new Set(existing.map((a) => a.name));
  const missing = SEED_PRIVATE_INDIVIDUALS.filter((p) => !existingNames.has(p.name));
  if (missing.length === 0) return existing;
  const created = await Promise.all(missing.map((entry) => createAddress(entry)));
  return [...existing, ...created];
}