import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

export interface ColumnVisibility {
  checkbox: boolean;
  status: boolean;
  typeBadge: boolean;
  customsNo: boolean;
  declared: boolean;
  processed: boolean;
  referenceDeclaration: boolean;
  recalculatedFrom: boolean;
  invoiceNo: boolean;
  consignorName: boolean;
  consigneeName: boolean;
  value: boolean;
  currency: boolean;
  netWeight: boolean;
  grossWeight: boolean;
  completion: boolean;
  actions: boolean;
}

interface ColumnVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (column: keyof ColumnVisibility, visible: boolean) => void;
}

export function ColumnVisibilityModal({
  isOpen,
  onClose,
  columnVisibility,
  onColumnVisibilityChange
}: ColumnVisibilityModalProps) {
  const columns: { key: keyof ColumnVisibility; label: string }[] = [
    { key: 'checkbox', label: 'Checkbox' },
    { key: 'status', label: 'Status' },
    { key: 'typeBadge', label: 'Type Badge' },
    { key: 'customsNo', label: 'Customs No' },
    { key: 'declared', label: 'Declared' },
    { key: 'processed', label: 'Processed' },
    { key: 'referenceDeclaration', label: 'Reference Declaration' },
    { key: 'recalculatedFrom', label: 'Recalculated From' },
    { key: 'invoiceNo', label: 'Invoice No' },
    { key: 'consignorName', label: 'Consignor' },
    { key: 'consigneeName', label: 'Consignee' },
    { key: 'value', label: 'Value' },
    { key: 'currency', label: 'Currency' },
    { key: 'netWeight', label: 'Net Weight' },
    { key: 'grossWeight', label: 'Gross Weight' },
    { key: 'completion', label: 'Completion' },
    { key: 'actions', label: 'Actions' }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#003160] opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[4px] shadow-xl z-50 w-[400px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-neutral-200">
          <h2 className="font-['Inter'] text-[15px] font-semibold text-[#003160] uppercase">
            Column Chooser
          </h2>
          <button
            onClick={onClose}
            className="p-[4px] hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer"
          >
            <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-[24px] py-[20px]">
          <div className="grid gap-4">
            {columns.filter((column) => column.key !== 'checkbox' && column.key !== 'actions').map((column) => (
              <div key={column.key} className="flex items-center space-x-3">
                <Checkbox
                  id={column.key}
                  checked={columnVisibility[column.key]}
                  onCheckedChange={(checked) => 
                    onColumnVisibilityChange(column.key, checked as boolean)
                  }
                  className="border-[#003160] data-[state=checked]:bg-[#003160] data-[state=checked]:text-white cursor-pointer"
                />
                <Label
                  htmlFor={column.key}
                  className="font-['Inter'] text-[12px] text-[#003160] cursor-pointer"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-[16px] py-[8px] bg-[rgb(68,107,249)] text-white rounded-[2px] font-['Inter'] text-[12px] font-semibold hover:opacity-75 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}