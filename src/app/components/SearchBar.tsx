import { useState } from 'react';
import { Search, X, RefreshCcw, Download } from 'lucide-react';
import { RefreshIntervalModal } from './RefreshIntervalModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { TableRowData } from './TableRow';
import { forwardRef } from 'react';

// Wrapper component to filter out Figma inspector props
const CleanButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  const { _fgT, _fgt, _fgS, _fgs, _fgB, _fgb, ...cleanProps } = props as any;
  return <button ref={ref} {...cleanProps} />;
});
CleanButton.displayName = 'CleanButton';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  sidebarWidth?: number;
  filterDrawerOpen?: boolean;
  hasFilterChips?: boolean;
  filteredData?: TableRowData[];
}

export function SearchBar({ value, onChange, sidebarWidth = 235, filterDrawerOpen = false, hasFilterChips = false, filteredData = [] }: SearchBarProps) {
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const handleClear = () => {
    onChange('');
  };

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Status',
      'Type',
      'Order',
      'Goods No',
      'Date',
      'Description',
      'Transport ID',
      'Sender',
      'Consignee',
      'Owner',
      'Customs Receipt',
      'Customs Officer',
      'Case Manager',
      'Drawn',
      'Stored Packages',
      'Stored Weight',
      'Withdrawal Packages',
      'Withdrawal Weight'
    ];

    // Create CSV rows
    const rows = filteredData.map(row => [
      row.status,
      row.type,
      row.order,
      row.goodsNo,
      row.date,
      row.description,
      row.transportId,
      row.sender.name,
      row.consignee.name,
      row.owner.name,
      row.customsReceipt,
      row.customsOfficer.name,
      row.caseManager,
      row.drawnPackages,
      row.storedPackages,
      row.storedWeight,
      row.withdrawalPackages,
      row.withdrawalWeight
    ]);

    // Escape CSV fields that contain commas, quotes, or newlines
    const escapeCSVField = (field: string): string => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `customs_warehouse_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveInterval = (interval: number) => {
    setRefreshInterval(interval);
    // Note: Actual auto-refresh functionality not implemented
    console.log('Refresh interval set to:', interval, 'seconds');
  };

  const filterDrawerWidth = filterDrawerOpen ? 340 : 0;
  const topPosition = hasFilterChips ? 180 : 130;

  return (
    <>
      <div 
        className="fixed bg-white box-border flex items-center gap-[10px] h-[60px] px-[10px] py-[15px] border-b border-neutral-200 transition-all duration-300 z-10"
        style={{ left: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px - ${filterDrawerWidth}px)`, top: `${topPosition}px` }}
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search assignments (Order, Goods No, Description, Transport ID, Case Manager...)"
            className="w-full pl-[10px] pr-[40px] py-[8px] border border-neutral-300 rounded-[4px] bg-white font-['Inter'] text-[12px] text-[#003160] placeholder:text-neutral-400 focus:outline-none focus:border-[#003160] transition-colors pt-[8px] pb-[8px]"
          />
          {value ? (
            <button
              onClick={handleClear}
              className="absolute right-[12px] top-1/2 transform -translate-y-1/2 p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
            >
              <X className="size-[18px] text-[#003160]" strokeWidth={2} />
            </button>
          ) : (
            <Search className="absolute right-[12px] top-1/2 transform -translate-y-1/2 size-[18px] text-neutral-400" />
          )}
        </div>

        {/* Action Icons */}
        <TooltipProvider>
          <div className="flex items-center gap-[10px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <CleanButton
                  onClick={() => setShowRefreshModal(true)}
                  className="p-[6px] hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer"
                  aria-label="Configure auto-refresh interval"
                >
                  <RefreshCcw className="size-[20px] text-[#003160]" />
                </CleanButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure auto-refresh interval</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <CleanButton
                  onClick={handleDownloadCSV}
                  className="p-[6px] hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer"
                  aria-label="Export table to CSV"
                >
                  <Download className="size-[20px] text-[#003160]" />
                </CleanButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export table to CSV</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {showRefreshModal && (
        <RefreshIntervalModal
          onClose={() => setShowRefreshModal(false)}
          currentInterval={refreshInterval}
          onSave={handleSaveInterval}
        />
      )}
    </>
  );
}