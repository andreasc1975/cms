import { supabase } from './supabase';
import { migrateRecord, type TableRowData } from '../components/TableRow';
import type { InvoiceRow } from '../components/InvoiceTable';

// This module is the one place that knows how the app's camelCase shapes
// (TableRowData / InvoiceRow / ItemLineRow) map onto the snake_case columns
// in Supabase. Nothing outside this file should talk to `supabase` directly
// for declaration data — keeps the mapping consistent in one spot.

export interface ItemLineRow {
  id: string;
  itemLineNo: string;
  article: string;
  description: string;
  marksAndNumbers: string;
  packaging: string;
  noOfParcels: string;
  statisticalNo: string;
  dutyReduction: string;
  foodstuff: boolean;
  origin: string;
  city: string;
  preferences: string;
  procedure: string;
  amount: string;
  netWeight: string;
  grossWeight: string;
  otherQuantity: string;
  valuationCode: string;
  reference: string;
  statisticalValue: string;
  adjustment: string;
  fees: string;
}

// ---------------------------------------------------------------------------
// declarations <-> TableRowData
// ---------------------------------------------------------------------------

function declarationRowToTableRowData(row: any, invoices: InvoiceRow[]): TableRowData {
  return migrateRecord({
    id: row.id,
    status: row.status,
    goodsNo: row.goods_no,
    typeBadge: row.type_badge,
    customsNo: row.customs_no,
    declared: row.declared,
    declarationType: row.declaration_type,
    messageDeclarationType: row.message_declaration_type,
    managedBy: row.managed_by,
    customsClearanceUnit: row.customs_clearance_unit,
    internalReference: row.internal_reference,
    noOfParcels: row.no_of_parcels,
    invoices,
    freightAndCosts: row.freight_and_costs,
    currencyRate: row.currency_rate,
    stage: row.stage,
    sentDate: row.sent_date,
    generalFormData: row.general_form_data,
    processed: row.processed,
    referenceDeclaration: row.reference_declaration,
    recalculatedFrom: row.recalculated_from,
    invoiceNo: row.invoice_no,
    consignorName: row.consignor_name,
    consigneeName: row.consignee_name,
    value: row.value,
    currency: row.currency,
    netWeight: row.net_weight,
    grossWeight: row.gross_weight,
    sender: row.sender,
    consignee: row.consignee,
    owner: row.owner,
    withdrawals: row.withdrawals ?? undefined
  });
}

function tableRowDataToDeclarationRow(data: Omit<TableRowData, 'id'> | TableRowData) {
  return {
    status: data.status,
    goods_no: data.goodsNo,
    type_badge: data.typeBadge,
    customs_no: data.customsNo,
    declared: data.declared,
    declaration_type: data.declarationType ?? null,
    message_declaration_type: data.messageDeclarationType ?? '',
    managed_by: data.managedBy ?? '',
    customs_clearance_unit: data.customsClearanceUnit ?? '',
    internal_reference: data.internalReference ?? '',
    no_of_parcels: data.noOfParcels ?? '',
    freight_and_costs: data.freightAndCosts ?? '',
    currency_rate: data.currencyRate ?? '1',
    stage: data.stage ?? 'created',
    sent_date: data.sentDate ?? '',
    processed: data.processed,
    reference_declaration: data.referenceDeclaration,
    recalculated_from: data.recalculatedFrom,
    invoice_no: data.invoiceNo,
    consignor_name: data.consignorName,
    consignee_name: data.consigneeName,
    value: data.value,
    currency: data.currency,
    net_weight: data.netWeight,
    gross_weight: data.grossWeight,
    sender: data.sender,
    consignee: data.consignee,
    owner: data.owner,
    withdrawals: data.withdrawals ?? null
  };
}

function invoiceRowToDb(inv: InvoiceRow, declarationId: string, sortOrder: number) {
  return {
    declaration_id: declarationId,
    invoice_no: inv.invoiceNo,
    invoice_date: inv.invoiceDate,
    currency: inv.currency,
    total_amount: inv.totalAmount,
    gross_weight: inv.grossWeight,
    net_weight: inv.netWeight,
    no_of_parcels: inv.noOfParcels,
    sort_order: sortOrder
  };
}

function dbToInvoiceRow(row: any): InvoiceRow {
  return {
    id: row.id,
    invoiceNo: row.invoice_no ?? '',
    invoiceDate: row.invoice_date ?? '',
    currency: row.currency ?? 'NOK',
    totalAmount: row.total_amount ?? '',
    grossWeight: row.gross_weight ?? '',
    netWeight: row.net_weight ?? '',
    noOfParcels: row.no_of_parcels ?? ''
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetches every declaration, each with its invoices attached. */
export async function fetchDeclarations(): Promise<TableRowData[]> {
  const { data: declarationRows, error: declErr } = await supabase
    .from('declarations')
    .select('*')
    .order('created_at', { ascending: false });
  if (declErr) throw declErr;

  const { data: invoiceRows, error: invErr } = await supabase
    .from('invoices')
    .select('*')
    .order('sort_order', { ascending: true });
  if (invErr) throw invErr;

  const invoicesByDeclaration = new Map<string, InvoiceRow[]>();
  for (const row of invoiceRows ?? []) {
    const list = invoicesByDeclaration.get(row.declaration_id) ?? [];
    list.push(dbToInvoiceRow(row));
    invoicesByDeclaration.set(row.declaration_id, list);
  }

  return (declarationRows ?? []).map((row) =>
    declarationRowToTableRowData(row, invoicesByDeclaration.get(row.id) ?? [])
  );
}

/** Creates a new declaration (plus its invoices), returns the saved record. */
export async function createDeclaration(data: Omit<TableRowData, 'id'>): Promise<TableRowData> {
  const { data: inserted, error } = await supabase
    .from('declarations')
    .insert(tableRowDataToDeclarationRow(data))
    .select()
    .single();
  if (error) throw error;

  const invoices = data.invoices ?? [];
  if (invoices.length > 0) {
    const { error: invErr } = await supabase
      .from('invoices')
      .insert(invoices.map((inv, i) => invoiceRowToDb(inv, inserted.id, i)));
    if (invErr) throw invErr;
  }

  return declarationRowToTableRowData(inserted, invoices);
}

/**
 * Updates a declaration's own fields and fully replaces its invoices (delete
 * + reinsert is simplest and fine at this scale — a handful of rows per
 * declaration, not thousands).
 */
export async function updateDeclaration(id: string, updates: Partial<TableRowData>): Promise<void> {
  const dbUpdates: Record<string, any> = {};
  const map = tableRowDataToDeclarationRow({ ...updates, id } as TableRowData);
  // Only send the columns that were actually part of `updates`, so a partial
  // patch (e.g. just freightAndCosts) doesn't overwrite everything else with
  // defaults from tableRowDataToDeclarationRow's fallbacks.
  const keyMap: Record<string, string> = {
    status: 'status', goodsNo: 'goods_no', typeBadge: 'type_badge', customsNo: 'customs_no',
    declared: 'declared', declarationType: 'declaration_type', messageDeclarationType: 'message_declaration_type',
    managedBy: 'managed_by', customsClearanceUnit: 'customs_clearance_unit', internalReference: 'internal_reference',
    noOfParcels: 'no_of_parcels', freightAndCosts: 'freight_and_costs', currencyRate: 'currency_rate', stage: 'stage', sentDate: 'sent_date',
    processed: 'processed', referenceDeclaration: 'reference_declaration', recalculatedFrom: 'recalculated_from',
    invoiceNo: 'invoice_no', consignorName: 'consignor_name', consigneeName: 'consignee_name',
    value: 'value', currency: 'currency', netWeight: 'net_weight', grossWeight: 'gross_weight',
    sender: 'sender', consignee: 'consignee', owner: 'owner', withdrawals: 'withdrawals'
  };
  for (const key of Object.keys(updates)) {
    if (key === 'invoices') continue; // handled separately below
    const dbKey = keyMap[key];
    if (dbKey) dbUpdates[dbKey] = (map as any)[dbKey];
  }

  if (Object.keys(dbUpdates).length > 0) {
    const { error } = await supabase.from('declarations').update(dbUpdates).eq('id', id);
    if (error) throw error;
  }

  if (updates.invoices) {
    const { error: delErr } = await supabase.from('invoices').delete().eq('declaration_id', id);
    if (delErr) throw delErr;
    if (updates.invoices.length > 0) {
      const { error: insErr } = await supabase
        .from('invoices')
        .insert(updates.invoices.map((inv, i) => invoiceRowToDb(inv, id, i)));
      if (insErr) throw insErr;
    }
  }
}

export async function deleteDeclaration(id: string): Promise<void> {
  // invoices/item_lines cascade-delete via the FK, no need to delete them separately.
  const { error } = await supabase.from('declarations').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// GENERAL form data + proposed fields (Details tab)
// ---------------------------------------------------------------------------

export async function fetchGeneralFormData(declarationId: string): Promise<{ formData: Record<string, string> | null; proposedFields: string[] }> {
  const { data, error } = await supabase
    .from('declarations')
    .select('general_form_data, proposed_fields')
    .eq('id', declarationId)
    .single();
  if (error) throw error;
  return {
    formData: data?.general_form_data && Object.keys(data.general_form_data).length > 0 ? data.general_form_data : null,
    proposedFields: data?.proposed_fields ?? []
  };
}

export async function saveGeneralFormData(declarationId: string, formData: Record<string, any>): Promise<void> {
  const { error } = await supabase
    .from('declarations')
    .update({ general_form_data: formData })
    .eq('id', declarationId);
  if (error) throw error;
}

export async function saveProposedFields(declarationId: string, proposedFields: string[]): Promise<void> {
  const { error } = await supabase
    .from('declarations')
    .update({ proposed_fields: proposedFields })
    .eq('id', declarationId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Item lines (Items tab)
// ---------------------------------------------------------------------------

function dbToItemLineRow(row: any): ItemLineRow {
  return {
    id: row.id,
    itemLineNo: row.item_line_no ?? '',
    article: row.article ?? '',
    description: row.description ?? '',
    marksAndNumbers: row.marks_and_numbers ?? '',
    packaging: row.packaging ?? '',
    noOfParcels: row.no_of_parcels ?? '',
    statisticalNo: row.statistical_no ?? '',
    dutyReduction: row.duty_reduction ?? '',
    foodstuff: row.foodstuff ?? false,
    origin: row.origin ?? '',
    city: row.city ?? '',
    preferences: row.preferences ?? '',
    procedure: row.procedure ?? '',
    amount: row.amount ?? '',
    netWeight: row.net_weight ?? '',
    grossWeight: row.gross_weight ?? '',
    otherQuantity: row.other_quantity ?? '',
    valuationCode: row.valuation_code ?? '',
    reference: row.reference ?? '',
    statisticalValue: row.statistical_value ?? '',
    adjustment: row.adjustment ?? '',
    fees: row.fees ?? ''
  };
}

function itemLineRowToDb(item: ItemLineRow, declarationId: string, sortOrder: number) {
  return {
    declaration_id: declarationId,
    item_line_no: item.itemLineNo,
    article: item.article,
    description: item.description,
    marks_and_numbers: item.marksAndNumbers,
    packaging: item.packaging,
    no_of_parcels: item.noOfParcels,
    statistical_no: item.statisticalNo,
    duty_reduction: item.dutyReduction,
    foodstuff: item.foodstuff,
    origin: item.origin,
    city: item.city,
    preferences: item.preferences,
    procedure: item.procedure,
    amount: item.amount,
    net_weight: item.netWeight,
    gross_weight: item.grossWeight,
    other_quantity: item.otherQuantity,
    valuation_code: item.valuationCode,
    reference: item.reference,
    statistical_value: item.statisticalValue,
    adjustment: item.adjustment,
    fees: item.fees
  };
}

export async function fetchItemLines(declarationId: string): Promise<ItemLineRow[]> {
  const { data, error } = await supabase
    .from('item_lines')
    .select('*')
    .eq('declaration_id', declarationId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(dbToItemLineRow);
}

/** Full replace, same reasoning as invoices — simplest at this scale. */
export async function saveItemLines(declarationId: string, items: ItemLineRow[]): Promise<void> {
  const { error: delErr } = await supabase.from('item_lines').delete().eq('declaration_id', declarationId);
  if (delErr) throw delErr;
  if (items.length > 0) {
    const { error: insErr } = await supabase
      .from('item_lines')
      .insert(items.map((item, i) => itemLineRowToDb(item, declarationId, i)));
    if (insErr) throw insErr;
  }
}