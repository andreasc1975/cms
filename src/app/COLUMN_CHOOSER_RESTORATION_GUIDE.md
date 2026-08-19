# Column Chooser Restoration Guide

## Overview
This guide explains how to add column visibility/chooser functionality to your restored application.
The column visibility icon will be placed on the RIGHT side of the table header, aligned with the action ellipsis.

## Files Created
✅ `/components/ColumnVisibilityModal.tsx` - Modal with checkboxes for showing/hiding columns

## Files That Need Updates

### 1. App.tsx

**Add import:**
```tsx
import { ColumnVisibilityModal, type ColumnVisibility } from './components/ColumnVisibilityModal';
```

**Add state (after navigation state, around line 380):**
```tsx
// Column visibility state
const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => {
  const saved = localStorage.getItem('warehouseApp_columnVisibility');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return {
    checkbox: true,
    status: true,
    progress: true,
    type: true,
    order: true,
    date: true,
    description: true,
    transportId: true,
    customsOfficer: true,
    caseManager: true,
    customsReceipt: true,
    withdrawals: true,
    packages: true,
    weight: true,
    actions: true
  };
});

const [columnVisibilityModalOpen, setColumnVisibilityModalOpen] = useState(false);
```

**Add persistence (near other useEffect hooks, around line 900):**
```tsx
// Persist column visibility
useEffect(() => {
  localStorage.setItem('warehouseApp_columnVisibility', JSON.stringify(columnVisibility));
}, [columnVisibility]);

const handleColumnVisibilityChange = useCallback((column: keyof ColumnVisibility, visible: boolean) => {
  setColumnVisibility(prev => ({
    ...prev,
    [column]: visible
  }));
}, []);
```

**Add props to DataTable (around line 1108):**
```tsx
<DataTable
  data={sortedData}
  onRowClick={handleRowClick}
  onSort={handleSort}
  sortColumn={sortColumn}
  sortDirection={sortDirection}
  sidebarWidth={sidebarWidth}
  filterDrawerOpen={filterDrawerOpen}
  selectedRows={selectedRows}
  onRowSelect={handleRowSelect}
  isSelectAllChecked={isSelectAllChecked}
  onSelectAll={handleSelectAll}
  columnVisibility={columnVisibility}  // ADD THIS
  onOpenColumnVisibility={() => setColumnVisibilityModalOpen(true)}  // ADD THIS
/>
```

**Add modal before closing div (around line 1174):**
```tsx
<ColumnVisibilityModal
  isOpen={columnVisibilityModalOpen}
  onClose={() => setColumnVisibilityModalOpen(false)}
  columnVisibility={columnVisibility}
  onColumnVisibilityChange={handleColumnVisibilityChange}
/>
```

### 2. components/DataTable.tsx

**Add import:**
```tsx
import type { ColumnVisibility } from './ColumnVisibilityModal';
```

**Update interface (around line 5):**
```tsx
interface DataTableProps {
  data: TableRowData[];
  onDataUpdate: (updatedData: TableRowData[]) => void;
  onRowClick?: (id: string) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  sidebarWidth?: number;
  filterDrawerOpen?: boolean;
  hasFilterChips?: boolean;
  columnVisibility: ColumnVisibility;  // ADD THIS
  onOpenColumnVisibility: () => void;  // ADD THIS
}
```

**Update function signature (around line 19):**
```tsx
export function DataTable({ 
  data, 
  onDataUpdate, 
  onRowClick, 
  selectedIds, 
  onSelectionChange, 
  sidebarWidth, 
  filterDrawerOpen, 
  hasFilterChips,
  columnVisibility,  // ADD THIS
  onOpenColumnVisibility  // ADD THIS
}: DataTableProps) {
```

**Wrap the Checkbox header with visibility check (around line 262):**
```tsx
{/* Checkbox Header - WRAP WITH VISIBILITY CHECK */}
{columnVisibility.checkbox && (
  <div className="box-border content-stretch flex h-[50px] items-center justify-center px-[10px] py-[5px] relative shrink-0 w-[50px]">
    <input
      type="checkbox"
      checked={allSelected}
      ref={(input) => {
        if (input) {
          input.indeterminate = someSelected;
        }
      }}
      onChange={(e) => handleSelectAll(e.target.checked)}
      className="size-[16px] cursor-pointer checkbox-light"
    />
  </div>
)}
```

**Wrap each column header with visibility check** - Wrap every `<TableHeader` element like this:
```tsx
{columnVisibility.status && (
  <TableHeader 
    label="STATUS" 
    width="w-[70px]" 
    align="center"
    sortable={true}
    sortDirection={sortField === 'status' ? sortDirection : null}
    onSort={() => handleSort('status')}
  />
)}
```

Do this for: status, progress, type, order, date, description, transportId, customsOfficer, caseManager, customsReceipt, withdrawals, packages, weight

**REPLACE the last header (showIcon) with column visibility button (around line 360):**

REMOVE THIS:
```tsx
<TableHeader showIcon className="size-[35px]" label="" />
```

REPLACE WITH THIS:
```tsx
{/* Column Visibility Button - RIGHT SIDE */}
{columnVisibility.actions && (
  <div className="box-border content-stretch flex items-center justify-center px-0 py-[5px] relative shrink-0 size-[35px]">
    <button 
      onClick={onOpenColumnVisibility}
      className="relative shrink-0 size-[20px] cursor-pointer hover:opacity-70 transition-opacity"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="view_week">
          <path d="M2 7h4V5H2v2zm0 6h4v-2H2v2zm0 6h4v-2H2v2zm16-10v2h4V7h-4zm0 6h4v-2h-4v2zm0 6h4v-2h-4v2zM8 7h8V5H8v2zm0 6h8v-2H8v2zm0 6h8v-2H8v2z" fill="#003160" />
        </g>
      </svg>
    </button>
  </div>
)}
```

**Update TableRow calls (around line 365):**
```tsx
<TableRow 
  key={row.id}
  data={row}
  onUpdate={handleRowUpdate}
  onEdit={handleEdit}
  onRemove={handleRemove}
  onClick={onRowClick}
  isSelected={selectedIds.has(row.id)}
  onSelect={(checked) => handleSelectRow(row.id, checked)}
  columnVisibility={columnVisibility}  // ADD THIS
/>
```

### 3. components/TableRow.tsx

**Add import:**
```tsx
import type { ColumnVisibility } from './ColumnVisibilityModal';
```

**Update interface (around line 56):**
```tsx
interface TableRowProps {
  data: TableRowData;
  onUpdate: (id: string, field: string, value: string) => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  onClick?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  columnVisibility: ColumnVisibility;  // ADD THIS
}
```

**Update function signature:**
```tsx
export function TableRow({ 
  data, 
  onUpdate, 
  onEdit, 
  onRemove, 
  onClick, 
  isSelected, 
  onSelect,
  columnVisibility  // ADD THIS
}: TableRowProps) {
```

**Wrap the Checkbox cell with visibility check (around line 121):**
```tsx
{/* Checkbox - WRAP WITH VISIBILITY CHECK */}
{columnVisibility.checkbox && (
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
```

**Wrap each cell with visibility check** - Wrap every column cell like this:
```tsx
{columnVisibility.status && (
  <div className="box-border content-stretch flex gap-[2px] h-[35px] items-center px-[10px] py-[5px] relative shrink-0 w-[70px]">
    <StatusBadge status={data.status} />
  </div>
)}
```

Do this for all columns: status, progress, type, order, date, description, transportId, customsOfficer, caseManager, customsReceipt, withdrawals, packages, weight

**Wrap the Action Button with visibility check (around line 260):**
```tsx
{/* Action Button - WRAP WITH VISIBILITY CHECK */}
{columnVisibility.actions && (
  <ActionButton 
    onEdit={onEdit ? () => onEdit(data.id) : undefined}
    onRemove={onRemove ? () => onRemove(data.id) : undefined}
    disabled={!canShowActions}
  />
)}
```

### 4. components/TableHeader.tsx

The file has been updated - no changes needed if you use the version I created.

## Key Points

- ✅ Column visibility icon is on the RIGHT side, replacing the old showIcon
- ✅ Aligned with the action ellipsis button  
- ✅ No placeholder columns needed on the left
- ✅ Icon only shows when actions column is visible

## Testing

1. Click the column visibility icon (rightmost in header, where the view_week icon is)
2. Toggle columns on/off
3. Verify table adjusts layout
4. Refresh page - settings should persist
5. If you hide "Actions" column, the column chooser icon will also be hidden (intentional)

## Backdrop Update (Optional)

To update all modal backdrops to #003160 at 50% opacity, replace any:
```tsx
className="fixed inset-0 bg-black/50 z-50"
```

With:
```tsx
className="fixed inset-0 bg-[#003160] opacity-50 z-50"
```

In: CreateTemplateModal.tsx, ReorderTabsModal.tsx, AddAssignmentModal.tsx

## Status

- ✅ ColumnVisibilityModal component created
- ✅ TableHeader component updated
- ⚠️ App.tsx - needs manual integration
- ⚠️ DataTable.tsx - needs manual integration  
- ⚠️ TableRow.tsx - needs manual integration

Follow the steps above to complete the integration.
