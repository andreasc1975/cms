// The 15 fields with an orange box number in the Details tab — the same
// list "Validate and Send" checks before allowing a declaration to be sent.
// Shared here so the main table's completion ring and DetailView's own
// validation always agree on exactly what "complete" means.
export const REQUIRED_GENERAL_FIELD_KEYS: string[] = [
  'controlNo', 'declarationType', 'transactionType', 'referenceNo', 'container',
  'goodsPositionNo', 'noOfParcels', 'countryDispatch', 'countryDestination',
  'deliveryTerms', 'deliveryPlace', 'nationality', 'customsOffice', 'transportMode', 'locationGoods'
];

// Matches DetailView's own GENERAL_FIELD_LABELS — kept in sync manually
// since GeneralFormData itself is a DetailView-local interface.
export const REQUIRED_GENERAL_FIELD_LABELS: Record<string, string> = {
  controlNo: 'Control No (48)',
  declarationType: 'Declaration (1)',
  transactionType: 'Transaction Type (26)',
  referenceNo: 'Reference No (7)',
  container: 'Container (18)',
  goodsPositionNo: 'Goods+ Position No (44)',
  noOfParcels: 'No of Parcels (6)',
  countryDispatch: 'Country of Dispatch (15A)',
  countryDestination: 'Country of Destination (17A)',
  deliveryTerms: 'Delivery Terms (20)',
  deliveryPlace: 'Delivery Place (25)',
  nationality: 'Nationality at Border Crossing (21)',
  customsOffice: 'Customs Office of Exit (29)',
  transportMode: 'Mode of Transport at the Border (25)',
  locationGoods: 'Location of Goods (30)'
};

export interface CompletionInfo {
  filled: number;
  total: number;
  percent: number;
  missingLabels: string[];
}
/**
 * How complete a declaration's required GENERAL fields are, based on the
 * raw general_form_data JSONB blob (already fetched for every row in the
 * main table, so this costs nothing extra to compute there). Doesn't
 * account for the invoice-vs-Items match — that's a separate, heavier
 * check that would need item_lines totals aggregated per declaration.
 */
export function getCompletionInfo(generalFormData: Record<string, any> | null | undefined): CompletionInfo {
  const total = REQUIRED_GENERAL_FIELD_KEYS.length;
  if (!generalFormData) {
    return { filled: 0, total, percent: 0, missingLabels: REQUIRED_GENERAL_FIELD_KEYS.map((k) => REQUIRED_GENERAL_FIELD_LABELS[k]) };
  }
  const missing = REQUIRED_GENERAL_FIELD_KEYS.filter((key) => !generalFormData[key] || !String(generalFormData[key]).trim());
  const filled = total - missing.length;
  return {
    filled,
    total,
    percent: Math.round((filled / total) * 100),
    missingLabels: missing.map((k) => REQUIRED_GENERAL_FIELD_LABELS[k])
  };
}

/**
 * Same "proposed values from the Create modal" seed DetailView computes for
 * a freshly-opened record with no saved GENERAL data yet — extracted here
 * so App.tsx can retroactively seed existing declarations that have never
 * actually been opened (and so never got this far) without needing
 * DetailView to mount for each one.
 */
export function getProposedGeneralFormData(record: {
  declarationType?: string;
  messageDeclarationType?: string;
  internalReference?: string;
}): Record<string, string> {
  return {
    declarationType: record.declarationType || '',
    declarationStatus: record.messageDeclarationType || '',
    internalReference: record.internalReference || ''
  };
}