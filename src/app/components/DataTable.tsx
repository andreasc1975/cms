import { useRef, useEffect } from 'react';
import { TableHeader } from './TableHeader';
import { TableRow, type TableRowData } from './TableRow';
import type { ColumnVisibility } from './ColumnVisibilityModal';
import { Columns3, Plus, FileText } from 'lucide-react';
import { getSectionIcon } from '../config/sectionIcons';

interface DataTableProps {
  data: TableRowData[];
  onSort?: (column: string) => void;
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc';
  sidebarWidth?: number;
  filterDrawerOpen?: boolean;
  selectedRows?: Set<string>;
  onRowSelect?: (id: string, selected: boolean) => void;
  isSelectAllChecked?: boolean;
  onSelectAll?: (selected: boolean) => void;
  columnVisibility?: ColumnVisibility;
  onOpenColumnVisibility?: () => void;
  hasFilterChips?: boolean;
  onRowClick?: (id: string) => void;
  onCreateNew?: () => void;
  currentSection?: string;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function DataTable({ 
  data, 
  onSort, 
  sortColumn, 
  sortDirection, 
  sidebarWidth = 235, 
  filterDrawerOpen = false,
  selectedRows = new Set(),
  onRowSelect,
  isSelectAllChecked = false,
  onSelectAll,
  columnVisibility,
  onOpenColumnVisibility,
  hasFilterChips = false,
  onRowClick,
  onCreateNew,
  currentSection,
  onEdit,
  onRemove
}: DataTableProps) {
  const filterDrawerWidth = filterDrawerOpen ? 340 : 0;
  const topPosition = hasFilterChips ? 240 : 190;
  
  // Ref for the create button
  const createButtonRef = useRef<HTMLButtonElement>(null);
  
  // Ref for the select all checkbox
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  
  // Focus the create button when empty state is shown
  useEffect(() => {
    if (data.length === 0 && createButtonRef.current) {
      createButtonRef.current.focus();
    }
  }, [data.length]);
  
  // Set indeterminate state for select all checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const allSelected = data.length > 0 && selectedRows.size === data.length;
      const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;
      selectAllCheckboxRef.current.indeterminate = someSelected;
    }
  }, [selectedRows, data.length]);
  
  // Default visibility if not provided
  const visibility = columnVisibility || {
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
    completion: true,
    actions: true
  };
  
  return (
    <div 
      className="absolute content-stretch flex flex-col items-start overflow-auto transition-all duration-300"
      style={{ 
        left: `${sidebarWidth}px`, 
        width: `calc(100% - ${sidebarWidth}px - ${filterDrawerWidth}px)`,
        top: `${topPosition}px`,
        height: `calc(100% - ${topPosition}px)`
      }}
    >
      {/* Table Header */}
      <div className="bg-white content-stretch flex h-[50px] items-center relative shrink-0 w-full sticky top-0 z-10">
        <div className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none" />
        
        {/* Checkbox Header */}
        {visibility.checkbox && (
          <div className="box-border content-stretch flex h-[50px] items-center justify-center px-[10px] py-[5px] relative shrink-0 w-[50px]">
            <input
              type="checkbox"
              checked={isSelectAllChecked}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              className="size-[16px] cursor-pointer checkbox-light"
              ref={selectAllCheckboxRef}
            />
          </div>
        )}

        {/* Status Header */}
        {visibility.status && (
          <TableHeader 
            label="STATUS" 
            width="w-[70px]" 
            align="center"
            sortable={true}
            sortDirection={sortColumn === 'status' ? sortDirection : null}
            onSort={() => onSort?.('status')}
          />
        )}

        {visibility.typeBadge && (
          <TableHeader 
            label="TYPE" 
            width="w-[60px]" 
            align="center"
            sortable={true}
            sortDirection={sortColumn === 'typeBadge' ? sortDirection : null}
            onSort={() => onSort?.('typeBadge')}
          />
        )}

        {visibility.customsNo && (
          <TableHeader 
            label="CUSTOMS NO" 
            flexGrow={11}
            minWidth="110px"
            sortable={true}
            sortDirection={sortColumn === 'customsNo' ? sortDirection : null}
            onSort={() => onSort?.('customsNo')}
          />
        )}

        {visibility.declared && (
          <TableHeader 
            label="DECLARED" 
            flexGrow={10}
            minWidth="100px"
            sortable={true}
            sortDirection={sortColumn === 'declared' ? sortDirection : null}
            onSort={() => onSort?.('declared')}
          />
        )}

        {visibility.processed && (
          <TableHeader 
            label="PROCESSED" 
            flexGrow={10}
            minWidth="100px"
            sortable={true}
            sortDirection={sortColumn === 'processed' ? sortDirection : null}
            onSort={() => onSort?.('processed')}
          />
        )}

        {visibility.referenceDeclaration && (
          <TableHeader 
            label="REFERENCE DECLARATION" 
            flexGrow={18}
            minWidth="180px"
            sortable={true}
            sortDirection={sortColumn === 'referenceDeclaration' ? sortDirection : null}
            onSort={() => onSort?.('referenceDeclaration')}
          />
        )}

        {visibility.recalculatedFrom && (
          <TableHeader 
            label="RECALCULATED FROM" 
            flexGrow={16}
            minWidth="160px"
            sortable={true}
            sortDirection={sortColumn === 'recalculatedFrom' ? sortDirection : null}
            onSort={() => onSort?.('recalculatedFrom')}
          />
        )}

        {visibility.invoiceNo && (
          <TableHeader 
            label="INVOICE NO" 
            flexGrow={10}
            minWidth="100px"
            sortable={true}
            sortDirection={sortColumn === 'invoiceNo' ? sortDirection : null}
            onSort={() => onSort?.('invoiceNo')}
          />
        )}

        {visibility.consignorName && (
          <TableHeader 
            label="CONSIGNOR" 
            flexGrow={14}
            minWidth="140px"
            sortable={true}
            sortDirection={sortColumn === 'consignorName' ? sortDirection : null}
            onSort={() => onSort?.('consignorName')}
          />
        )}

        {visibility.consigneeName && (
          <TableHeader 
            label="CONSIGNEE" 
            flexGrow={14}
            minWidth="140px"
            sortable={true}
            sortDirection={sortColumn === 'consigneeName' ? sortDirection : null}
            onSort={() => onSort?.('consigneeName')}
          />
        )}

        {visibility.value && (
          <TableHeader 
            label="VALUE" 
            flexGrow={12}
            minWidth="120px"
            align="right"
            sortable={true}
            sortDirection={sortColumn === 'value' ? sortDirection : null}
            onSort={() => onSort?.('value')}
          />
        )}

        {visibility.currency && (
          <TableHeader 
            label="CURRENCY" 
            width="w-[80px]" 
            align="center"
            sortable={true}
            sortDirection={sortColumn === 'currency' ? sortDirection : null}
            onSort={() => onSort?.('currency')}
          />
        )}

        {visibility.netWeight && (
          <TableHeader 
            label="NET WEIGHT" 
            flexGrow={12}
            minWidth="120px"
            align="right"
            sortable={true}
            sortDirection={sortColumn === 'netWeight' ? sortDirection : null}
            onSort={() => onSort?.('netWeight')}
          />
        )}

        {visibility.grossWeight && (
          <TableHeader 
            label="GROSS WEIGHT" 
            flexGrow={12}
            minWidth="120px"
            align="right"
            sortable={true}
            sortDirection={sortColumn === 'grossWeight' ? sortDirection : null}
            onSort={() => onSort?.('grossWeight')}
          />
        )}

        {visibility.completion && (
          <TableHeader 
            label="COMPLETION" 
            flexGrow={8}
            minWidth="100px"
            align="center"
            sortable={false}
          />
        )}

        {/* Column Visibility Button */}
        {visibility.actions && (
          <div className="box-border content-stretch flex items-center justify-center px-0 py-[5px] relative shrink-0 size-[35px] sticky right-0 bg-white z-10">
            <button 
              onClick={onOpenColumnVisibility}
              className="relative shrink-0 size-[20px] cursor-pointer hover:opacity-70 transition-opacity"
            >
              <Columns3 className="size-full text-[#003160]" />
            </button>
          </div>
        )}
      </div>

      {/* Table Rows */}
      <div className="w-full">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <FileText className="size-[100px] text-[#d3d3d3] mb-6" strokeWidth={1} />
            <button
              ref={createButtonRef}
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-[#446BF9] text-white rounded-[2px] font-['Inter'] text-[12px] font-semibold hover:bg-[#3557d9] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#446BF9]"
            >
              <Plus className="w-4 h-4" />
              Create Customs Declaration
            </button>
          </div>
        ) : (
          data.map((row) => (
            <TableRow 
              key={row.id}
              data={row}
              isSelected={selectedRows.has(row.id)}
              onSelect={(checked) => onRowSelect?.(row.id, checked)}
              visibility={visibility}
              onRowClick={onRowClick}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    </div>
  );
}