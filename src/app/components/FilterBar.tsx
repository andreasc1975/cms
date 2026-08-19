import { useState, useEffect } from 'react';
import svgPaths from "../imports/svg-b75trn6pxk";
import type { FilterTemplate } from '../App';
import { MoreVertical, Check, Pencil, Globe, Trash2, Plus, ListOrdered, Minus, Ban, RotateCw, ListFilter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';

interface FilterBarProps {
  onFilterChange: (filter: string) => void;
  onFilterClick?: () => void;
  counts: {
    all: number;
    open: number;
    cleared: number;
    manual: number;
    electronic: number;
  };
  sidebarWidth?: number;
  filterDrawerOpen?: boolean;
  currentFilter?: string;
  hasModifiedFilters?: boolean;
  templates?: FilterTemplate[];
  templateCounts?: Map<string, number>;
  filterCriteria?: any;
  onRemoveFilter?: (field: string) => void;
  defaultCriteria?: any;
  onCreateTemplate?: () => void;
  onSaveTemplate?: () => void;
  onRenameTemplate?: (templateId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onClearFilters?: () => void;
  onReorderClick?: () => void;
  tabOrder?: string[];
  manuallyAddedFilters?: Set<string>;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function FilterBar({ onFilterChange, onFilterClick, counts, sidebarWidth = 235, filterDrawerOpen = false, currentFilter = 'all', hasModifiedFilters = false, templates = [], templateCounts = new Map(), filterCriteria = {}, onRemoveFilter = () => {}, defaultCriteria = {}, onCreateTemplate = () => {}, onSaveTemplate = () => {}, onRenameTemplate = (templateId: string) => {}, onDeleteTemplate = (templateId: string) => {}, onClearFilters = () => {}, onReorderClick = () => {}, tabOrder = [], manuallyAddedFilters = new Set(), searchQuery = '', onClearSearch = () => {} }: FilterBarProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Sync internal state with prop when it changes externally (e.g., when creating a template)
  useEffect(() => {
    setActiveFilter(currentFilter);
  }, [currentFilter]);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const FilterButton = ({ 
    id, 
    label, 
    count, 
    isActive,
    showModifiedIndicator,
    isTemplate = false
  }: { 
    id: string; 
    label: string; 
    count: number;
    isActive: boolean;
    showModifiedIndicator?: boolean;
    isTemplate?: boolean;
  }) => {
    const [contextMenuOpen, setContextMenuOpen] = useState(false);

    const handleContextMenu = (e: React.MouseEvent) => {
      if (isTemplate) {
        e.preventDefault();
        setContextMenuOpen(true);
      }
    };

    const TemplateContextMenu = () => (
      <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setContextMenuOpen(true);
            }}
            className="hover:bg-white/20 rounded-[2px] transition-colors cursor-pointer px-[5px] px-[0px] py-[4px]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setContextMenuOpen(true);
              }
            }}
          >
            <Pencil className="size-[14px]" style={{ color: isActive ? 'white' : '#003160' }} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {isActive ? (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateTemplate();
                  setContextMenuOpen(false);
                }}
                disabled={!hasModifiedFilters}
                className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="size-[16px]" />
                <span>Create Template</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveTemplate();
                  setContextMenuOpen(false);
                }}
                disabled={!hasModifiedFilters}
                className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="size-[16px]" />
                <span>Save Changes</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameTemplate(id);
                  setContextMenuOpen(false);
                }}
                className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px]"
              >
                <Pencil className="size-[16px]" />
                <span>Rename Template</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="flex items-center gap-[8px] font-['Inter'] text-[12px] opacity-50 cursor-not-allowed"
              >
                <Globe className="size-[16px]" />
                <span>Make Global</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTemplate(id);
                  setContextMenuOpen(false);
                }}
                className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px] text-red-600 focus:text-red-600"
              >
                <Trash2 className="size-[16px]" />
                <span>Delete Template</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameTemplate(id);
                  setContextMenuOpen(false);
                }}
                className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px]"
              >
                <Pencil className="size-[16px]" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTemplate(id);
                  setContextMenuOpen(false);
                }}
                className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px] text-red-600 focus:text-red-600"
              >
                <Trash2 className="size-[16px]" />
                <span>Remove</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );

    return (
      <button
        onClick={() => handleFilterClick(id)}
        onContextMenu={handleContextMenu}
        className={`box-border content-stretch flex gap-[10px] h-[40px] items-center p-[10px] relative rounded-[2px] shrink-0 transition-colors duration-150 ${
          isActive 
            ? 'bg-[#003160]' 
            : 'bg-[#e0e0e0] hover:bg-[#d0d0d0]'
        }`}
      >
        {/* Orange dot indicator for modified filters */}
        {showModifiedIndicator && (
          <div className="size-[8px] rounded-full shrink-0" style={{ backgroundColor: '#FF8F00' }} />
        )}
        <div className={`flex flex-col font-['Inter'] justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-nowrap tracking-[0.7px] uppercase font-semibold ${
          isActive ? 'text-white' : 'text-[#003160]'
        }`}>
          <p className="leading-[normal] overflow-ellipsis overflow-hidden whitespace-pre text-[10px] font-bold">
            {label}
          </p>
        </div>
        {/* Context menu icon for templates */}
        {isTemplate && <TemplateContextMenu />}
        {count > 0 ? (
          <div className={`bg-[#003160] ${isActive ? 'border border-white' : ''} box-border content-stretch flex gap-[10px] h-[20px] items-center justify-end px-[5px] py-[3px] relative rounded-[1px] shrink-0`}>
            <div className="flex flex-col font-['Inter'] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-right text-white tracking-[0.7px] uppercase font-semibold">
              <p className="leading-[normal] whitespace-pre text-[10px]">{count}</p>
            </div>
          </div>
        ) : (
          <div className={`${isActive ? 'bg-[#003160] border border-white' : 'bg-[#9E9E9E]'} box-border content-stretch flex gap-[10px] h-[20px] items-center justify-end px-[5px] py-[3px] relative rounded-[1px] shrink-0`}>
            <div className="flex flex-col font-['Inter'] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-right text-white tracking-[0.7px] uppercase font-semibold">
              <p className="leading-[normal] whitespace-pre">0</p>
            </div>
          </div>
        )}
      </button>
    );
  };

  const ActionButton = ({ 
    id, 
    path, 
    onClick 
  }: { 
    id: string; 
    path: string; 
    onClick?: () => void;
  }) => (
    <button
      onMouseEnter={() => setHoveredAction(id)}
      onMouseLeave={() => setHoveredAction(null)}
      onClick={onClick}
      className={`relative shrink-0 size-[24px] transition-all duration-150 ${
        hoveredAction === id ? 'scale-105 opacity-80' : ''
      }`}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <mask height="24" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="#D9D9D9" height="24" width="24" />
          </mask>
          <g mask="url(#mask0_filterbar)">
            <path d={path} fill="#003160" />
          </g>
        </g>
      </svg>
    </button>
  );

  const filterDrawerWidth = filterDrawerOpen ? 340 : 0;

  // Helper to check if a filter is manually added (not part of default/template)
  const isManualFilter = (field: string, value: any): boolean => {
    // Use the manuallyAddedFilters Set to determine if this filter was manually added
    return manuallyAddedFilters.has(field);
  };

  // Helper function to check if a field is excluded
  const isExcluded = (field: string): boolean => {
    return filterCriteria.exclusions?.[field as keyof typeof filterCriteria.exclusions] || false;
  };

  // Helper function to get active filter chips
  const getActiveFilterChips = () => {
    const chips: { key: string; label: string; field: string; isManual: boolean; isExcluded: boolean }[] = [];
    
    // Always show status chip if it exists (except on ALL tab when empty)
    const shouldShowStatusChip = () => {
      if (!filterCriteria.status) return false;
      return true;
    };
    
    // Always show type chip if it exists (except on ALL tab when empty)
    const shouldShowTypeChip = () => {
      if (!filterCriteria.type) return false;
      return true;
    };

    // Status filter
    if (shouldShowStatusChip()) {
      const statusLabel = filterCriteria.status === 'OPEN' ? 'Open/Partly Open' : 
                         filterCriteria.status === 'C' ? 'Cleared' : filterCriteria.status;
      chips.push({ 
        key: 'status', 
        label: `STATUS: ${statusLabel}`, 
        field: 'status',
        isManual: isManualFilter('status', filterCriteria.status),
        isExcluded: isExcluded('status')
      });
    }

    // Progress filter (multi-select)
    if (filterCriteria.progress && filterCriteria.progress.length > 0) {
      const progressLabels = filterCriteria.progress.map((p: string) => {
        if (p === '0-25') return '0-25%';
        if (p === '25-50') return '25-50%';
        if (p === '50-75') return '50-75%';
        if (p === '75-99') return '75-99%';
        if (p === '100') return '100%';
        return p;
      }).join(', ');
      chips.push({ 
        key: 'progress', 
        label: `PROGRESS: ${progressLabels}`, 
        field: 'progress',
        isManual: isManualFilter('progress', filterCriteria.progress),
        isExcluded: isExcluded('progress')
      });
    }

    // Type filter
    if (shouldShowTypeChip()) {
      const typeLabel = filterCriteria.type === 'manual' ? 'Manual' : 'Electronic';
      chips.push({ 
        key: 'type', 
        label: `TYPE: ${typeLabel}`, 
        field: 'type',
        isManual: isManualFilter('type', filterCriteria.type),
        isExcluded: isExcluded('type')
      });
    }

    // Text filters
    if (filterCriteria.order) {
      chips.push({ 
        key: 'order', 
        label: `ORDER: ${filterCriteria.order}`, 
        field: 'order',
        isManual: isManualFilter('order', filterCriteria.order),
        isExcluded: isExcluded('order')
      });
    }
    if (filterCriteria.goodsNo) {
      chips.push({ 
        key: 'goodsNo', 
        label: `GOODS NO: ${filterCriteria.goodsNo}`, 
        field: 'goodsNo',
        isManual: isManualFilter('goodsNo', filterCriteria.goodsNo),
        isExcluded: isExcluded('goodsNo')
      });
    }
    if (filterCriteria.date) {
      chips.push({ 
        key: 'date', 
        label: `DATE: ${filterCriteria.date}`, 
        field: 'date',
        isManual: isManualFilter('date', filterCriteria.date),
        isExcluded: isExcluded('date')
      });
    }
    if (filterCriteria.description) {
      chips.push({ 
        key: 'description', 
        label: `DESCRIPTION: ${filterCriteria.description}`, 
        field: 'description',
        isManual: isManualFilter('description', filterCriteria.description),
        isExcluded: isExcluded('description')
      });
    }
    if (filterCriteria.transportId) {
      chips.push({ 
        key: 'transportId', 
        label: `TRANSPORT ID: ${filterCriteria.transportId}`, 
        field: 'transportId',
        isManual: isManualFilter('transportId', filterCriteria.transportId),
        isExcluded: isExcluded('transportId')
      });
    }
    if (filterCriteria.sender) {
      chips.push({ 
        key: 'sender', 
        label: `SENDER: ${filterCriteria.sender}`, 
        field: 'sender',
        isManual: isManualFilter('sender', filterCriteria.sender),
        isExcluded: isExcluded('sender')
      });
    }
    if (filterCriteria.consignee) {
      chips.push({ 
        key: 'consignee', 
        label: `CONSIGNEE: ${filterCriteria.consignee}`, 
        field: 'consignee',
        isManual: isManualFilter('consignee', filterCriteria.consignee),
        isExcluded: isExcluded('consignee')
      });
    }
    if (filterCriteria.owner) {
      chips.push({ 
        key: 'owner', 
        label: `OWNER: ${filterCriteria.owner}`, 
        field: 'owner',
        isManual: isManualFilter('owner', filterCriteria.owner),
        isExcluded: isExcluded('owner')
      });
    }
    if (filterCriteria.customsReceipt) {
      chips.push({ 
        key: 'customsReceipt', 
        label: `CUSTOMS RECEIPT: ${filterCriteria.customsReceipt}`, 
        field: 'customsReceipt',
        isManual: isManualFilter('customsReceipt', filterCriteria.customsReceipt),
        isExcluded: isExcluded('customsReceipt')
      });
    }
    if (filterCriteria.customsOfficer) {
      chips.push({ 
        key: 'customsOfficer', 
        label: `CUSTOMS OFFICER: ${filterCriteria.customsOfficer}`, 
        field: 'customsOfficer',
        isManual: isManualFilter('customsOfficer', filterCriteria.customsOfficer),
        isExcluded: isExcluded('customsOfficer')
      });
    }
    if (filterCriteria.caseManager) {
      chips.push({ 
        key: 'caseManager', 
        label: `CASE MANAGER: ${filterCriteria.caseManager}`, 
        field: 'caseManager',
        isManual: isManualFilter('caseManager', filterCriteria.caseManager),
        isExcluded: isExcluded('caseManager')
      });
    }
    if (filterCriteria.storedPackages) {
      chips.push({ 
        key: 'storedPackages', 
        label: `STORED PACKAGES: ${filterCriteria.storedPackages}`, 
        field: 'storedPackages',
        isManual: isManualFilter('storedPackages', filterCriteria.storedPackages),
        isExcluded: isExcluded('storedPackages')
      });
    }
    if (filterCriteria.storedWeight) {
      chips.push({ 
        key: 'storedWeight', 
        label: `STORED WEIGHT: ${filterCriteria.storedWeight}`, 
        field: 'storedWeight',
        isManual: isManualFilter('storedWeight', filterCriteria.storedWeight),
        isExcluded: isExcluded('storedWeight')
      });
    }

    // Add search chip if search query exists
    if (searchQuery && searchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `SEARCH: ${searchQuery}`,
        field: 'search',
        isManual: true, // Always show as manual (orange)
        isExcluded: false
      });
    }

    // Sort chips: default (blue) chips first, then manual (orange) chips
    return chips.sort((a, b) => {
      if (a.isManual === b.isManual) return 0;
      return a.isManual ? 1 : -1; // false (blue) before true (orange)
    });
  };

  const FilterChip = ({ label, onRemove, isManual = false, isExcluded = false }: { label: string; onRemove: () => void; isManual?: boolean; isExcluded?: boolean }) => {
    const [prefix, value] = label.split(': ');
    
    // Determine background color based on exclusion and manual status
    let bgColor = '#003160'; // Default blue for included filters
    if (isExcluded) {
      bgColor = '#FF8F00'; // Orange for excluded filters
    } else if (isManual) {
      bgColor = '#FF8F00'; // Orange for manual included filters
    }
    
    return (
      <div 
        className="inline-flex items-center gap-[6px] h-[24px] rounded-[4px] shrink-0 px-[5px] pt-[0px] pr-[5px] pb-[0px] pl-[8px]"
        style={{ backgroundColor: bgColor }}
      >
        {isExcluded && (
          <Ban className="size-[12px] text-white" strokeWidth={2.5} />
        )}
        <span className="font-['Inter'] text-[10px] text-white tracking-[0.5px] uppercase">
          <span className="font-semibold">{prefix}:</span> {value}
        </span>
        <button
          onClick={onRemove}
          className="flex items-center justify-center size-[16px] hover:bg-white/20 rounded-[2px] transition-colors cursor-pointer"
        >
          <svg className="size-[12px]" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3L9 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  };

  const activeChips = getActiveFilterChips();
  const hasActiveChips = activeChips.length > 0;
  
  return (
    <>
      {/* Main Filter Bar */}
      <div 
        className="fixed bg-white box-border content-stretch flex gap-[50px] items-center p-[15px] top-[60px] transition-all duration-300 z-10"
        style={{ left: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px - ${filterDrawerWidth}px)` }}
      >
      <div className="absolute border-[#e0e0e0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      
      {/* Filter Buttons */}
      <div className="basis-0 content-stretch flex gap-[10px] grow items-center min-h-px min-w-px relative shrink-0 overflow-x-auto">
        {tabOrder.length > 0 ? (
          tabOrder.map((tabId) => {
            // Check if it's a template
            const template = templates.find(t => t.id === tabId);
            
            if (template) {
              // Render template tab
              return (
                <FilterButton 
                  key={template.id}
                  id={template.id}
                  label={template.name}
                  count={templateCounts.get(template.id) || 0}
                  isActive={activeFilter === template.id}
                  showModifiedIndicator={currentFilter === template.id && hasModifiedFilters}
                  isTemplate={true}
                />
              );
            }
            
            // Render default tab
            const tabConfig: { [key: string]: { label: string; count: number } } = {
              all: { label: 'All', count: counts.all },
              open: { label: 'open', count: counts.open },
              cleared: { label: 'Cleared', count: counts.cleared },
              manual: { label: 'Manual', count: counts.manual },
              electronic: { label: 'Electronic', count: counts.electronic }
            };
            
            const config = tabConfig[tabId];
            if (!config) return null;
            
            return (
              <FilterButton 
                key={tabId}
                id={tabId}
                label={config.label}
                count={config.count}
                isActive={activeFilter === tabId}
                showModifiedIndicator={currentFilter === tabId && hasModifiedFilters}
                isTemplate={false}
              />
            );
          })
        ) : (
          <>
            <FilterButton 
              id="all"
              label="All"
              count={counts.all}
              isActive={activeFilter === 'all'}
              showModifiedIndicator={currentFilter === 'all' && hasModifiedFilters}
            />
            <FilterButton 
              id="open"
              label="open"
              count={counts.open}
              isActive={activeFilter === 'open'}
              showModifiedIndicator={currentFilter === 'open' && hasModifiedFilters}
            />
            <FilterButton 
              id="cleared"
              label="Cleared"
              count={counts.cleared}
              isActive={activeFilter === 'cleared'}
              showModifiedIndicator={currentFilter === 'cleared' && hasModifiedFilters}
            />
            <FilterButton 
              id="manual"
              label="Manual"
              count={counts.manual}
              isActive={activeFilter === 'manual'}
              showModifiedIndicator={currentFilter === 'manual' && hasModifiedFilters}
            />
            <FilterButton 
              id="electronic"
              label="Electronic"
              count={counts.electronic}
              isActive={activeFilter === 'electronic'}
              showModifiedIndicator={currentFilter === 'electronic' && hasModifiedFilters}
            />
            {templates.map(template => (
              <FilterButton 
                key={template.id}
                id={template.id}
                label={template.name}
                count={templateCounts.get(template.id) || 0}
                isActive={activeFilter === template.id}
                showModifiedIndicator={currentFilter === template.id && hasModifiedFilters}
                isTemplate={true}
              />
            ))}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="content-stretch flex gap-[15px] items-center relative shrink-0">
        <button
          onClick={onReorderClick}
          onMouseEnter={() => setHoveredAction('reorder')}
          onMouseLeave={() => setHoveredAction(null)}
          className={`relative shrink-0 size-[20px] transition-all duration-150 cursor-pointer ${
            hoveredAction === 'reorder' ? 'scale-105 opacity-80' : ''
          }`}
          title="Reorder tabs"
        >
          <ListOrdered className="size-[20px] text-[#003160]" />
        </button>
        <button
          onClick={() => console.log('Refresh clicked')}
          onMouseEnter={() => setHoveredAction('refresh')}
          onMouseLeave={() => setHoveredAction(null)}
          className={`relative shrink-0 size-[20px] transition-all duration-150 cursor-pointer ${
            hoveredAction === 'refresh' ? 'scale-105 opacity-80' : ''
          }`}
          title="Refresh"
        >
          <RotateCw className="size-[20px] text-[#003160]" />
        </button>
        {!filterDrawerOpen && (
          <button
            onClick={onFilterClick}
            onMouseEnter={() => setHoveredAction('filter')}
            onMouseLeave={() => setHoveredAction(null)}
            className={`relative shrink-0 size-[20px] transition-all duration-150 cursor-pointer ${
              hoveredAction === 'filter' ? 'scale-105 opacity-80' : ''
            }`}
            title="Filter"
          >
            <ListFilter className="size-[20px] text-[#003160]" />
          </button>
        )}
      </div>
    </div>

    {/* Filter Chips Row */}
    {hasActiveChips && (() => {
      // Check if there are any orange (manual) chips
      const hasOrangeChips = activeChips.some(chip => chip.isManual);
      
      return (
        <div 
          className="absolute bg-white box-border flex items-center gap-[10px] px-[15px] py-[10px] top-[130px] transition-all duration-300 overflow-x-auto border-b border-[#e0e0e0]"
          style={{ left: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px - ${filterDrawerWidth}px)` }}
        >
          {activeChips.map(chip => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              onRemove={() => {
                if (chip.field === 'search') {
                  onClearSearch();
                } else {
                  onRemoveFilter(chip.field);
                }
              }}
              isManual={chip.isManual}
              isExcluded={chip.isExcluded}
            />
          ))}
          <button
            onClick={hasOrangeChips ? onClearFilters : undefined}
            disabled={!hasOrangeChips}
            onMouseEnter={() => hasOrangeChips && setHoveredAction('clear_chips')}
            onMouseLeave={() => setHoveredAction(null)}
            className={`relative shrink-0 size-[24px] ml-auto transition-all duration-150 ${
              hasOrangeChips 
                ? hoveredAction === 'clear_chips' ? 'scale-105 opacity-80 cursor-pointer' : 'cursor-pointer'
                : 'opacity-30 cursor-not-allowed'
            }`}
            title={hasOrangeChips ? "Clear manual filters" : "No manual filters to clear"}
          >
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <g>
                <mask height="24" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
                  <rect fill="#D9D9D9" height="24" width="24" />
                </mask>
                <g mask="url(#mask0_filterbar)">
                  <path d={svgPaths.p43893f0} fill="#003160" />
                </g>
              </g>
            </svg>
          </button>
        </div>
      );
    })()}
  </>
  );
}