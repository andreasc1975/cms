import { StatusBadge } from './StatusBadge';
import { ActionButton } from './ActionButton';
import type { ColumnVisibility } from './ColumnVisibilityModal';
import type { InvoiceRow } from './InvoiceTable';

export interface WithdrawalEntry {
  id: string;
  packages: string;
  weight: string;
  customsReceipt: string;
  goodsNo: string;
  extGoodsNo: string;
  extCustomsReceipt: string;
}

export interface TableRowData {
  id: string;
  status: 'C' | 'PO' | 'O';

  goodsNo: string;

  // New columns
  typeBadge: 'C' | 'E' | 'P';
  customsNo: string;
  declared: string;

  // Fields collected in the "Create Customs Declaration" modal, wired through
  // to the TopBar and DetailView's GENERAL section.
  declarationType?: 'EX' | 'IM' | 'EU'; // box 1 on the declaration form — 'EU' when trading with an EU country
  messageDeclarationType?: string;
  managedBy?: string;
  customsClearanceUnit?: string;
  internalReference?: string;
  noOfParcels?: string;
  // Itemized invoices and freight cost, as entered in the Create/Edit modal —
  // used by DetailView's Freight/Invoices panel. The aggregate fields above
  // (value, netWeight, grossWeight, noOfParcels, invoiceNo, currency) remain
  // the sums of these, for anything that only needs the totals.
  invoices?: InvoiceRow[];
  freightAndCosts?: string;
  currencyRate?: string;
  processed: string;
  referenceDeclaration: string;
  recalculatedFrom: string;
  invoiceNo: string;
  consignorName: string;
  consigneeName: string;
  value: string;
  currency: string;
  netWeight: string;
  grossWeight: string;

  sender: {
    name: string;
    address: string;
  };
  consignee: {
    name: string;
    address: string;
  };
  owner: {
    name: string;
    address: string;
  };

  withdrawals?: WithdrawalEntry[];
}

/**
 * Fills in sensible defaults for any fields that were added to TableRowData
 * after a record was first created — without this, records saved to
 * localStorage (or generated as mock data) before a given field existed
 * would silently lack it forever, causing inconsistent shapes across the
 * app instead of a clean "empty" state.
 *
 * Safe to run on already-complete records too (defaults are only applied
 * when the corresponding field is missing/undefined).
 */
export function migrateRecord(raw: Partial<TableRowData> & { id: string }): TableRowData {
  return {
    id: raw.id,
    status: raw.status ?? 'O',
    goodsNo: raw.goodsNo ?? '',
    typeBadge: raw.typeBadge ?? 'C',
    customsNo: raw.customsNo ?? '',
    declared: raw.declared ?? '',
    declarationType: raw.declarationType,
    messageDeclarationType: raw.messageDeclarationType ?? '',
    managedBy: raw.managedBy ?? '',
    customsClearanceUnit: raw.customsClearanceUnit ?? '',
    internalReference: raw.internalReference ?? '',
    noOfParcels: raw.noOfParcels ?? '',
    invoices: Array.isArray(raw.invoices) ? raw.invoices : [],
    freightAndCosts: raw.freightAndCosts ?? '',
    currencyRate: raw.currencyRate ?? '1',
    processed: raw.processed ?? '',
    referenceDeclaration: raw.referenceDeclaration ?? '',
    recalculatedFrom: raw.recalculatedFrom ?? '',
    invoiceNo: raw.invoiceNo ?? '',
    consignorName: raw.consignorName ?? '',
    consigneeName: raw.consigneeName ?? '',
    value: raw.value ?? '',
    currency: raw.currency ?? 'NOK',
    netWeight: raw.netWeight ?? '',
    grossWeight: raw.grossWeight ?? '',
    sender: raw.sender ?? { name: '', address: '' },
    consignee: raw.consignee ?? { name: '', address: '' },
    owner: raw.owner ?? { name: '', address: '' },
    withdrawals: raw.withdrawals
  };
}

/** Runs migrateRecord across a whole array, dropping anything without an id. */
export function migrateRecords(raw: unknown): TableRowData[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is Partial<TableRowData> & { id: string } => !!r && typeof r.id === 'string').map(migrateRecord);
}

interface TableRowProps {
  data: TableRowData;
  onUpdate?: (id: string, field: string, value: string) => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  visibility?: ColumnVisibility;
  onRowClick?: (id: string) => void;
}

export function TableRow({ data, onUpdate, onEdit, onRemove, isSelected = false, onSelect, visibility, onRowClick }: TableRowProps) {
  const handleInputChange = (field: string, value: string) => {
    onUpdate?.(data.id, field, value);
  };
  
  // Default visibility if not provided
  const vis = visibility || {
    checkbox: true,
    status: true,
    typeBadge: true,
    customsNo: true,
    declared: true,
    processed: true,
    referenceDeclaration: true,
    recalculatedFrom: true,
    invoiceNo: true,
    consignorName: true,
    consigneeName: true,
    value: true,
    currency: true,
    netWeight: true,
    grossWeight: true,
    actions: true
  };

  const canShowActions = true; // Action button is always enabled for all statuses

  return (
    <div 
      className={`content-stretch flex h-[50px] items-center relative shrink-0 transition-colors cursor-pointer border-b border-solid ${
        isSelected ? 'bg-[#DFE5EB] border-t border-[#C8D3DC]' : 'bg-white hover:bg-neutral-50 border-neutral-200'
      }`}
      onClick={() => onRowClick?.(data.id)}
    >
      
      {/* Checkbox */}
      {vis.checkbox && (
        <div className="box-border content-stretch flex h-[50px] items-center justify-center px-[10px] py-[5px] relative shrink-0 w-[50px]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="size-[16px] cursor-pointer checkbox-light"
          />
        </div>
      )}

      {/* Status */}
      {vis.status && (
        <div className="box-border content-stretch flex gap-[2px] h-[35px] items-center px-[10px] py-[5px] relative shrink-0 w-[70px]">
          <StatusBadge status={data.status} />
        </div>
      )}

      {/* Type Badge */}
      {vis.typeBadge && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-center px-[10px] py-[5px] relative shrink-0 w-[60px] pt-[5px] pr-[10px] pb-[5px] pl-[0px]">
          <div className="flex items-center justify-center px-[8px] py-[2px] bg-[#E8EEF3] rounded-[3px]">
            <span className="font-['Inter'] text-[11px] text-[#003160] font-semibold uppercase">
              {data.typeBadge}
            </span>
          </div>
        </div>
      )}

      {/* Customs No */}
      {vis.customsNo && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-between pl-[10px] pr-0 py-[5px] relative min-w-0" style={{ flexGrow: 11, flexShrink: 1, flexBasis: 0, minWidth: '110px' }}>
          <div className="basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden">{data.customsNo}</p>
          </div>
        </div>
      )}

      {/* Declared */}
      {vis.declared && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-between pl-[10px] pr-0 py-[5px] relative min-w-0" style={{ flexGrow: 10, flexShrink: 1, flexBasis: 0, minWidth: '100px' }}>
          <div className="basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden">{data.declared}</p>
          </div>
        </div>
      )}

      {/* Processed */}
      {vis.processed && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-between pl-[10px] pr-0 py-[5px] relative min-w-0" style={{ flexGrow: 10, flexShrink: 1, flexBasis: 0, minWidth: '100px' }}>
          <div className="basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden">{data.processed}</p>
          </div>
        </div>
      )}

      {/* Reference Declaration */}
      {vis.referenceDeclaration && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-between pl-[10px] pr-0 py-[5px] relative min-w-0" style={{ flexGrow: 18, flexShrink: 1, flexBasis: 0, minWidth: '180px' }}>
          <div className="basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden">{data.referenceDeclaration}</p>
          </div>
        </div>
      )}

      {/* Recalculated From */}
      {vis.recalculatedFrom && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-between pl-[10px] pr-0 py-[5px] relative min-w-0" style={{ flexGrow: 16, flexShrink: 1, flexBasis: 0, minWidth: '160px' }}>
          <div className="basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden">{data.recalculatedFrom}</p>
          </div>
        </div>
      )}

      {/* Invoice No */}
      {vis.invoiceNo && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-between pl-[10px] pr-0 py-[5px] relative min-w-0" style={{ flexGrow: 10, flexShrink: 1, flexBasis: 0, minWidth: '100px' }}>
          <div className="basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden">{data.invoiceNo}</p>
          </div>
        </div>
      )}

      {/* Consignor */}
      {vis.consignorName && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-between pl-[10px] pr-0 py-[5px] relative min-w-0" style={{ flexGrow: 14, flexShrink: 1, flexBasis: 0, minWidth: '140px' }}>
          <div className="basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden">{data.consignorName}</p>
          </div>
        </div>
      )}

      {/* Consignee */}
      {vis.consigneeName && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-between pl-[10px] pr-0 py-[5px] relative min-w-0" style={{ flexGrow: 14, flexShrink: 1, flexBasis: 0, minWidth: '140px' }}>
          <div className="basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden">{data.consigneeName}</p>
          </div>
        </div>
      )}

      {/* Value */}
      {vis.value && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-end pl-[10px] pr-[15px] py-[5px] relative min-w-0 pt-[5px] pb-[5px]" style={{ flexGrow: 12, flexShrink: 1, flexBasis: 0, minWidth: '120px' }}>
          <div className="font-['Inter'] leading-[0] not-italic text-[12px] text-black text-right text-nowrap">
            <p className="font-['Roboto_Mono'] leading-[normal]">{data.value}</p>
          </div>
        </div>
      )}

      {/* Currency */}
      {vis.currency && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-center px-[10px] py-[5px] relative shrink-0 w-[80px]">
          <div className="font-['Inter'] leading-[0] not-italic text-[12px] text-black text-center text-nowrap">
            <p className="leading-[normal]">{data.currency}</p>
          </div>
        </div>
      )}

      {/* Net Weight */}
      {vis.netWeight && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-end pl-[10px] pr-[18px] py-[5px] relative min-w-0 pt-[5px] pb-[5px]" style={{ flexGrow: 12, flexShrink: 1, flexBasis: 0, minWidth: '120px' }}>
          <div className="font-['Inter'] leading-[0] not-italic text-[12px] text-black text-right text-nowrap">
            <p className="font-['Roboto_Mono'] leading-[normal]">{data.netWeight}</p>
          </div>
        </div>
      )}

      {/* Gross Weight */}
      {vis.grossWeight && (
        <div className="box-border content-stretch flex h-[35px] items-center justify-end pl-[10px] pr-[18px] py-[5px] relative min-w-0 pt-[5px] pb-[5px]" style={{ flexGrow: 12, flexShrink: 1, flexBasis: 0, minWidth: '120px' }}>
          <div className="font-['Inter'] leading-[0] not-italic text-[12px] text-black text-right text-nowrap">
            <p className="font-['Roboto_Mono'] leading-[normal]">{data.grossWeight}</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      {vis.actions && (
        <ActionButton 
          onEdit={onEdit ? () => onEdit(data.id) : undefined}
          onRemove={onRemove ? () => onRemove(data.id) : undefined}
          disabled={!canShowActions}
          isSelected={isSelected}
        />
      )}
    </div>
  );
}