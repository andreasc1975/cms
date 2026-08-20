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
    created: number;
    error: number;
    message: number;
    sent: number;
    processed: number;
    temporary: number;
    draft: number;
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

    // Status filter (multi-select array)
    const statusLabels: Record<string, string> = { O: 'Open', PO: 'Partly Open', C: 'Cleared' };
    if (filterCriteria.status && filterCriteria.status.length > 0) {
      chips.push({ 
        key: 'status', 
        label: `STATUS: ${filterCriteria.status.map((s: string) => statusLabels[s] || s).join(', ')}`, 
        field: 'status',
        isManual: isManualFilter('status', filterCriteria.status),
        isExcluded: isExcluded('status')
      });
    }

    // Type filter (multi-select array — Export/Import/EU classification)
    const typeLabels: Record<string, string> = { EX: 'Export', IM: 'Import', EU: 'EU Trade' };
    if (filterCriteria.type && filterCriteria.type.length > 0) {
      chips.push({ 
        key: 'type', 
        label: `TYPE: ${filterCriteria.type.map((t: string) => typeLabels[t] || t).join(', ')}`, 
        field: 'type',
        isManual: isManualFilter('type', filterCriteria.type),
        isExcluded: isExcluded('type')
      });
    }

    // Text filters
    if (filterCriteria.goodsNo) {
      chips.push({ 
        key: 'goodsNo', 
        label: `GOODS NO: ${filterCriteria.goodsNo}`, 
        field: 'goodsNo',
        isManual: isManualFilter('goodsNo', filterCriteria.goodsNo),
        isExcluded: isExcluded('goodsNo')
      });
    }

    // Date range filters
    if (filterCriteria.declaredFrom || filterCriteria.declaredTo) {
      const from = filterCriteria.declaredFrom || '…';
      const to = filterCriteria.declaredTo || '…';
      chips.push({ 
        key: 'declaredRange', 
        label: `DECLARATION DATE: ${from} – ${to}`, 
        field: filterCriteria.declaredFrom ? 'declaredFrom' : 'declaredTo',
        isManual: isManualFilter('declaredFrom', filterCriteria.declaredFrom) || isManualFilter('declaredTo', filterCriteria.declaredTo),
        isExcluded: isExcluded('declaredFrom') || isExcluded('declaredTo')
      });
    }
    if (filterCriteria.processedFrom || filterCriteria.processedTo) {
      const from = filterCriteria.processedFrom || '…';
      const to = filterCriteria.processedTo || '…';
      chips.push({ 
        key: 'processedRange', 
        label: `PROCESSED DATE: ${from} – ${to}`, 
        field: filterCriteria.processedFrom ? 'processedFrom' : 'processedTo',
        isManual: isManualFilter('processedFrom', filterCriteria.processedFrom) || isManualFilter('processedTo', filterCriteria.processedTo),
        isExcluded: isExcluded('processedFrom') || isExcluded('processedTo')
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
              open: { label: 'Open', count: counts.open },
              created: { label: 'Created', count: counts.created },
              error: { label: 'Error', count: counts.error },
              message: { label: 'Message', count: counts.message },
              sent: { label: 'Sent', count: counts.sent },
              processed: { label: 'Processed', count: counts.processed },
              temporary: { label: 'Temporary', count: counts.temporary },
              draft: { label: 'Draft', count: counts.draft }
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
              label="Open"
              count={counts.open}
              isActive={activeFilter === 'open'}
              showModifiedIndicator={currentFilter === 'open' && hasModifiedFilters}
            />
            <FilterButton 
              id="created"
              label="Created"
              count={counts.created}
              isActive={activeFilter === 'created'}
              showModifiedIndicator={currentFilter === 'created' && hasModifiedFilters}
            />
            <FilterButton 
              id="error"
              label="Error"
              count={counts.error}
              isActive={activeFilter === 'error'}
              showModifiedIndicator={currentFilter === 'error' && hasModifiedFilters}
            />
            <FilterButton 
              id="message"
              label="Message"
              count={counts.message}
              isActive={activeFilter === 'message'}
              showModifiedIndicator={currentFilter === 'message' && hasModifiedFilters}
            />
            <FilterButton 
              id="sent"
              label="Sent"
              count={counts.sent}
              isActive={activeFilter === 'sent'}
              showModifiedIndicator={currentFilter === 'sent' && hasModifiedFilters}
            />
            <FilterButton 
              id="processed"
              label="Processed"
              count={counts.processed}
              isActive={activeFilter === 'processed'}
              showModifiedIndicator={currentFilter === 'processed' && hasModifiedFilters}
            />
            <FilterButton 
              id="temporary"
              label="Temporary"
              count={counts.temporary}
              isActive={activeFilter === 'temporary'}
              showModifiedIndicator={currentFilter === 'temporary' && hasModifiedFilters}
            />
            <FilterButton 
              id="draft"
              label="Draft"
              count={counts.draft}
              isActive={activeFilter === 'draft'}
              showModifiedIndicator={currentFilter === 'draft' && hasModifiedFilters}
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