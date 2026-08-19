import { useState, useRef, useEffect, forwardRef } from 'react';
import { X, MoreVertical, Star, Plus, ChevronDown, Check, Pencil, Globe, Trash2, Calendar as CalendarIcon, CheckCircle, Ban } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type { FilterTemplate } from '../App';
import { format } from 'date-fns';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterCriteria;
  onFilterChange: (field: keyof FilterCriteria, value: string | string[]) => void;
  onCreateTemplate: () => void;
  currentFilter?: string;
  templates?: FilterTemplate[];
  onSaveTemplate?: () => void;
  onRenameTemplate?: (templateId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  companies?: { name: string; address: string }[];
  customsOfficers?: { name: string; address: string }[];
  manuallyAddedFilters?: Set<string>;
}

export interface FilterCriteria {
  status: string;
  progress: string[];
  type: string;
  order: string;
  goodsNo: string;
  date: string;
  description: string;
  transportId: string;
  sender: string;
  consignee: string;
  owner: string;
  customsReceipt: string;
  customsOfficer: string;
  caseManager: string;
  storedPackages: string;
  storedWeight: string;
  exclusions?: {
    status?: boolean;
    progress?: boolean;
    type?: boolean;
    order?: boolean;
    goodsNo?: boolean;
    date?: boolean;
    description?: boolean;
    transportId?: boolean;
    sender?: boolean;
    consignee?: boolean;
    owner?: boolean;
    customsReceipt?: boolean;
    customsOfficer?: boolean;
    caseManager?: boolean;
    storedPackages?: boolean;
    storedWeight?: boolean;
  };
}

export function FilterDrawer({ isOpen, onClose, filters, onFilterChange, onCreateTemplate, currentFilter = 'all', templates = [], onSaveTemplate = () => {}, onRenameTemplate = (templateId: string) => {}, onDeleteTemplate = (templateId: string) => {}, companies = [], customsOfficers = [], manuallyAddedFilters = new Set() }: FilterDrawerProps) {
  const [favoriteFields, setFavoriteFields] = useState<Set<keyof FilterCriteria>>(new Set());
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Global shift key tracking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleFavorite = (field: keyof FilterCriteria) => {
    setFavoriteFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

  const toggleExclusion = (field: keyof FilterCriteria) => {
    const currentExclusions = filters.exclusions || {};
    const isExcluded = currentExclusions[field as keyof typeof currentExclusions];
    
    onFilterChange('exclusions' as any, {
      ...currentExclusions,
      [field]: !isExcluded
    } as any);
  };

  const setExclusion = (field: keyof FilterCriteria, excluded: boolean) => {
    const currentExclusions = filters.exclusions || {};
    
    onFilterChange('exclusions' as any, {
      ...currentExclusions,
      [field]: excluded
    } as any);
  };

  const isExcluded = (field: keyof FilterCriteria): boolean => {
    return filters.exclusions?.[field as keyof typeof filters.exclusions] || false;
  };

  // Check if any filter has a value
  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return typeof value === 'string' && value.trim() !== '';
  });

  const handleCreateTemplate = () => {
    if (hasActiveFilters) {
      onCreateTemplate();
    }
  };

  const handleSaveTemplate = () => {
    if (hasActiveFilters) {
      onSaveTemplate();
    }
  };

  // Check if current filter is a template
  const isTemplate = templates.some(t => t.id === currentFilter);

  // Clean button component that filters out Figma inspector props
  const CleanButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
    const {
      _fgT,
      _fgt,
      _fgS,
      _fgs,
      _fgB,
      _fgb,
      ...cleanProps
    } = props as any;

    return <button ref={ref} {...cleanProps} />;
  });

  CleanButton.displayName = 'CleanButton';

  const FilterDropdown = ({
    label,
    field,
    options
  }: {
    label: string;
    field: keyof FilterCriteria;
    options: { value: string; label: string }[];
  }) => {
    const isFavorite = favoriteFields.has(field);
    const excluded = isExcluded(field);
    const hasValue = filters[field] && (Array.isArray(filters[field]) ? filters[field].length > 0 : filters[field] !== '');

    return (
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <label className="font-['Inter'] text-[10px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
              {label}
            </label>
            {hasValue && (
              <button
                onClick={() => toggleExclusion(field)}
                className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
                type="button"
                title={excluded ? "Click to include" : "Click to exclude"}
              >
                {excluded ? (
                  <Ban className="size-[14px] text-[#FF8F00]" strokeWidth={2.5} />
                ) : (
                  <CheckCircle 
                    className={`size-[14px] ${manuallyAddedFilters.has(field) ? 'text-[#FF8F00]' : 'text-[#003160]'}`}
                    strokeWidth={2.5} 
                  />
                )}
              </button>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(field)}
            className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
            type="button"
          >
            {isFavorite ? (
              <Star className="size-[15px] text-[#FF8F00]" fill="#FF8F00" strokeWidth={2} />
            ) : (
              <Star className="size-[15px] text-neutral-400" strokeWidth={2} />
            )}
          </button>
        </div>
        <Select
          value={filters[field] || "_all"}
          onValueChange={(value) => {
            const newValue = value === "_all" ? "" : value;
            onFilterChange(field, newValue);
            
            // Apply exclusion based on shift key state
            if (newValue) {
              setExclusion(field, isShiftPressed);
            } else {
              setExclusion(field, false);
            }
          }}
        >
          <SelectTrigger className="w-full h-auto px-[12px] py-[8px] border border-neutral-300 rounded-[2px] bg-white font-['Inter'] text-[12px] text-[#003160] focus:outline-none focus:border-[#003160] focus:ring-0 transition-colors cursor-pointer hover:border-neutral-400">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-neutral-300 rounded-[2px] shadow-lg">
            <SelectItem 
              value="_all" 
              className="font-['Inter'] text-[12px] text-[#003160] cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100"
            >
              All
            </SelectItem>
            {options.map(opt => (
              <SelectItem 
                key={opt.value} 
                value={opt.value}
                className="font-['Inter'] text-[12px] text-[#003160] cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const MultiSelectDropdown = ({
    label,
    field,
    options
  }: {
    label: string;
    field: 'progress';
    options: { value: string; label: string }[];
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Safely extract array value (handles both array and old object format)
    const fieldValue = filters[field];
    const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
    const isFavorite = favoriteFields.has(field);
    const excluded = isExcluded(field);
    const hasValue = selectedValues.length > 0;

    const handleToggle = (value: string) => {
      const currentValues = [...selectedValues];
      const index = currentValues.indexOf(value);
      
      if (index > -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(value);
      }
      
      onFilterChange(field, currentValues as any);
      
      // Apply exclusion based on global shift state
      if (currentValues.length > 0) {
        setExclusion(field, isShiftPressed);
      }
    };

    const handleClearAll = () => {
      onFilterChange(field, [] as any);
    };

    const getDisplayText = () => {
      if (selectedValues.length === 0) return 'All';
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || 'All';
      }
      return `${selectedValues.length} selected`;
    };

    return (
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <label className="font-['Inter'] text-[10px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
              {label}
            </label>
            {hasValue && (
              <button
                onClick={() => toggleExclusion(field)}
                className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
                type="button"
                title={excluded ? "Click to include" : "Click to exclude"}
              >
                {excluded ? (
                  <Ban className="size-[14px] text-[#FF8F00]" strokeWidth={2.5} />
                ) : (
                  <CheckCircle 
                    className={`size-[14px] ${manuallyAddedFilters.has(field) ? 'text-[#FF8F00]' : 'text-[#003160]'}`}
                    strokeWidth={2.5} 
                  />
                )}
              </button>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(field)}
            className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
            type="button"
          >
            {isFavorite ? (
              <Star className="size-[15px] text-[#FF8F00]" fill="#FF8F00" strokeWidth={2} />
            ) : (
              <Star className="size-[15px] text-neutral-400" strokeWidth={2} />
            )}
          </button>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-[12px] py-[8px] pr-[36px] border border-neutral-300 rounded-[2px] bg-white font-['Inter'] text-[12px] text-[#003160] focus:outline-none focus:border-[#003160] transition-colors cursor-pointer hover:border-neutral-400 text-left"
          >
            {getDisplayText()}
          </button>
          <ChevronDown 
            className={`absolute right-[12px] top-1/2 transform -translate-y-1/2 size-[16px] text-muted-foreground opacity-50 pointer-events-none transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute z-20 w-full mt-[2px] bg-white border border-neutral-300 rounded-[2px] shadow-lg max-h-[240px] overflow-y-auto">
                {/* Clear All option */}
                {selectedValues.length > 0 && (
                  <>
                    <button
                      onClick={handleClearAll}
                      className="w-full px-[12px] py-[8px] text-left font-['Inter'] text-[12px] text-[#446BF9] hover:bg-neutral-100 transition-colors cursor-pointer border-b border-neutral-200"
                    >
                      Clear All
                    </button>
                  </>
                )}
                {/* Checkbox options */}
                {options.map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-[10px] px-[12px] py-[8px] hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(opt.value)}
                      onChange={() => handleToggle(opt.value)}
                      className="checkbox-light size-[16px] shrink-0 cursor-pointer"
                    />
                    <span className="font-['Inter'] text-[12px] text-[#003160]">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const FilterInput = ({ 
    label, 
    field, 
    placeholder 
  }: { 
    label: string; 
    field: keyof FilterCriteria; 
    placeholder?: string;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hasValue, setHasValue] = useState(!!filters[field]);
    const excluded = isExcluded(field);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Only update parent when focus is lost
      onFilterChange(field, e.target.value);
      
      // Set exclusion based on global shift key state
      if (e.target.value.length > 0) {
        setExclusion(field, isShiftPressed);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        // Blur the input on Escape
        e.currentTarget.blur();
      }
      if (e.key === 'Enter') {
        // Apply filter with shift state
        const value = e.currentTarget.value;
        onFilterChange(field, value);
        if (value.length > 0) {
          setExclusion(field, e.shiftKey);
        }
        e.currentTarget.blur();
      }
    };

    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
        setHasValue(false);
        onFilterChange(field, '');
        inputRef.current.focus();
      }
    };

    const isFavorite = favoriteFields.has(field);

    return (
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <label className="font-['Inter'] text-[10px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
              {label}
            </label>
            {hasValue && (
              <button
                onClick={() => toggleExclusion(field)}
                className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
                type="button"
                title={excluded ? "Click to include" : "Click to exclude"}
              >
                {excluded ? (
                  <Ban className="size-[14px] text-[#FF8F00]" strokeWidth={2.5} />
                ) : (
                  <CheckCircle 
                    className={`size-[14px] ${manuallyAddedFilters.has(field) ? 'text-[#FF8F00]' : 'text-[#003160]'}`}
                    strokeWidth={2.5} 
                  />
                )}
              </button>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(field)}
            className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
            type="button"
          >
            {isFavorite ? (
              <Star className="size-[15px] text-[#FF8F00]" fill="#FF8F00" strokeWidth={2} />
            ) : (
              <Star className="size-[15px] text-neutral-400" strokeWidth={2} />
            )}
          </button>
        </div>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            defaultValue={filters[field]}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Filter by ${label.toLowerCase()}`}
            className="w-full px-[12px] py-[8px] pr-[36px] border border-neutral-300 rounded-[2px] bg-white font-['Inter'] text-[12px] text-[#003160] placeholder:text-neutral-400 focus:outline-none focus:border-[#003160] transition-colors hover:border-neutral-400"
          />
          {hasValue && (
            <button
              onClick={handleClear}
              className="absolute right-[8px] top-1/2 transform -translate-y-1/2 p-[4px] hover:opacity-70 transition-opacity cursor-pointer"
              type="button"
            >
              <X className="size-[16px] text-[#446BF9]" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const FilterNumericInput = ({ 
    label, 
    field 
  }: { 
    label: string; 
    field: keyof FilterCriteria;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hasValue, setHasValue] = useState(!!filters[field]);
    const excluded = isExcluded(field);

    const formatNumber = (value: string): string => {
      const num = value.replace(/,/g, '');
      if (num === '') return '';
      const parsed = parseFloat(num);
      if (isNaN(parsed)) return '';
      return parsed.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const formatted = formatNumber(e.target.value);
      if (inputRef.current) {
        inputRef.current.value = formatted;
      }
      onFilterChange(field, formatted);
      
      // Set exclusion based on global shift key state
      if (formatted.length > 0) {
        setExclusion(field, isShiftPressed);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '');
      if (inputRef.current) {
        inputRef.current.value = value;
      }
      setHasValue(value.length > 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.currentTarget.blur();
      }
      if (e.key === 'Enter') {
        const formatted = formatNumber(e.currentTarget.value);
        if (inputRef.current) {
          inputRef.current.value = formatted;
        }
        onFilterChange(field, formatted);
        if (formatted.length > 0) {
          setExclusion(field, e.shiftKey);
        }
        e.currentTarget.blur();
      }
    };

    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
        setHasValue(false);
        onFilterChange(field, '');
        inputRef.current.focus();
      }
    };

    const isFavorite = favoriteFields.has(field);

    return (
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <label className="font-['Inter'] text-[10px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
              {label}
            </label>
            {hasValue && (
              <button
                onClick={() => toggleExclusion(field)}
                className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
                type="button"
                title={excluded ? "Click to include" : "Click to exclude"}
              >
                {excluded ? (
                  <Ban className="size-[14px] text-[#FF8F00]" strokeWidth={2.5} />
                ) : (
                  <CheckCircle 
                    className={`size-[14px] ${manuallyAddedFilters.has(field) ? 'text-[#FF8F00]' : 'text-[#003160]'}`}
                    strokeWidth={2.5} 
                  />
                )}
              </button>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(field)}
            className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
            type="button"
          >
            {isFavorite ? (
              <Star className="size-[15px] text-[#FF8F00]" fill="#FF8F00" strokeWidth={2} />
            ) : (
              <Star className="size-[15px] text-neutral-400" strokeWidth={2} />
            )}
          </button>
        </div>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            defaultValue={filters[field]}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={field === 'storedWeight' ? '0.00' : '0'}
            className="w-full px-[12px] py-[8px] pr-[36px] border border-neutral-300 rounded-[2px] bg-white font-roboto-mono font-medium text-[12px] text-[#003160] placeholder:text-neutral-400 focus:outline-none focus:border-[#003160] transition-colors text-left hover:border-neutral-400"
          />
          {hasValue && (
            <button
              onClick={handleClear}
              className="absolute right-[8px] top-1/2 transform -translate-y-1/2 p-[4px] hover:opacity-70 transition-opacity cursor-pointer"
              type="button"
            >
              <X className="size-[16px] text-[#446BF9]" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const FilterDatePicker = ({ 
    label, 
    field 
  }: { 
    label: string; 
    field: keyof FilterCriteria;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isFavorite = favoriteFields.has(field);
    const excluded = isExcluded(field);
    const hasValue = !!(filters[field] as string);

    const parseDate = (dateStr: any): Date | undefined => {
      if (!dateStr || typeof dateStr !== 'string') return undefined;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]) + 2000;
        return new Date(year, month, day);
      }
      return undefined;
    };

    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    };

    // Safely extract string value from field (handles both string and old object format)
    const fieldValue = filters[field];
    const dateString = typeof fieldValue === 'string' ? fieldValue : '';
    const selectedDate = parseDate(dateString);

    const handleSelect = (date: Date | undefined) => {
      const formattedDate = formatDate(date);
      onFilterChange(field, formattedDate);
      if (formattedDate) {
        setExclusion(field, isShiftPressed);
      }
      setIsOpen(false);
    };

    const handleClear = () => {
      onFilterChange(field, '');
    };

    return (
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <label className="font-['Inter'] text-[10px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
              {label}
            </label>
            {hasValue && (
              <button
                onClick={() => toggleExclusion(field)}
                className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
                type="button"
                title={excluded ? "Click to include" : "Click to exclude"}
              >
                {excluded ? (
                  <Ban className="size-[14px] text-[#FF8F00]" strokeWidth={2.5} />
                ) : (
                  <CheckCircle 
                    className={`size-[14px] ${manuallyAddedFilters.has(field) ? 'text-[#FF8F00]' : 'text-[#003160]'}`}
                    strokeWidth={2.5} 
                  />
                )}
              </button>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(field)}
            className="p-[2px] hover:opacity-70 transition-opacity cursor-pointer"
            type="button"
          >
            {isFavorite ? (
              <Star className="size-[15px] text-[#FF8F00]" fill="#FF8F00" strokeWidth={2} />
            ) : (
              <Star className="size-[15px] text-neutral-400" strokeWidth={2} />
            )}
          </button>
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <button
                type="button"
                className="w-full px-[12px] py-[8px] pr-[36px] border border-neutral-300 rounded-[2px] bg-white font-['Inter'] text-[12px] text-[#003160] focus:outline-none focus:border-[#003160] transition-colors cursor-pointer hover:border-neutral-400 text-left"
              >
                {dateString || 'DD/MM/YY'}
              </button>
              <CalendarIcon className="absolute right-[12px] top-1/2 transform -translate-y-1/2 size-[16px] text-[#003160] pointer-events-none" />
            </div>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="start"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              initialFocus
            />
            {dateString && (
              <div className="p-3 border-t">
                <button
                  onClick={handleClear}
                  className="w-full px-[12px] py-[6px] text-[#446BF9] font-['Inter'] text-[12px] hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div 
      className={`fixed right-0 top-[60px] h-[calc(100vh-60px)] bg-white border-l border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out z-20 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: '340px' }}
    >
      {/* Fixed Header */}
      <div className="flex flex-col shrink-0 bg-[#FAFAFA]">
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-neutral-200 h-[70px]">
          <h2 className="font-['Inter'] text-[16px] font-semibold text-[#003160] uppercase">
            Filter
          </h2>
          <div className="flex items-center gap-[12px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CleanButton className="p-[4px] hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer">
                <MoreVertical className="size-[18px] text-[#003160]" />
              </CleanButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {isTemplate ? (
                <>
                  <DropdownMenuItem
                    onClick={handleCreateTemplate}
                    disabled={!hasActiveFilters}
                    className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="size-[16px]" />
                    <span>Create Template</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSaveTemplate}
                    disabled={!hasActiveFilters}
                    className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="size-[16px]" />
                    <span>Save Changes</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRenameTemplate(currentFilter)}
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
                    onClick={() => onDeleteTemplate(currentFilter)}
                    className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px] text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="size-[16px]" />
                    <span>Delete Template</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={handleCreateTemplate}
                  disabled={!hasActiveFilters}
                  className="flex items-center gap-[8px] cursor-pointer font-['Inter'] text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="size-[16px]" />
                  <span>Create Template</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={onClose}
            className="p-[4px] hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="size-[18px] text-[#003160]" />
          </button>
        </div>
      </div>
        
        {/* Shift Key Indicator */}
        {isShiftPressed && (
          <div className="px-[20px] py-[8px] bg-[#FFF7E6] border-b border-[#FFE4B3] flex items-center gap-[8px]">
            <Ban className="size-[14px] text-[#FF8F00]" strokeWidth={2.5} />
            <span className="font-['Inter'] text-[12px] text-[#003160]">
              <strong>Exclude mode</strong> - Filters will be applied as exclusions
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Form Section */}
      <div className="flex-1 overflow-auto px-[20px] py-[20px] bg-[#FAFAFA]">
        <div className="flex flex-col gap-[20px]">
          {/* Define all filter fields with their labels */}
          {(() => {
            const dropdownFields: Array<{ label: string; field: keyof FilterCriteria; options: { value: string; label: string }[] }> = [
              { 
                label: 'Status', 
                field: 'status', 
                options: [
                  { value: 'C', label: 'Cleared' },
                  { value: 'OPEN', label: 'Open/Partly Open' }
                ]
              },
              { 
                label: 'Progress', 
                field: 'progress', 
                options: [
                  { value: '0-25', label: '0-25%' },
                  { value: '25-50', label: '25-50%' },
                  { value: '50-75', label: '50-75%' },
                  { value: '75-99', label: '75-99%' },
                  { value: '100', label: '100%' }
                ]
              },
              { 
                label: 'Type', 
                field: 'type', 
                options: [
                  { value: 'manual', label: 'Manual' },
                  { value: 'electronic', label: 'Electronic' }
                ]
              },
              {
                label: 'Sender',
                field: 'sender',
                options: companies.map(c => ({ value: c.name, label: c.name }))
              },
              {
                label: 'Consignee',
                field: 'consignee',
                options: companies.map(c => ({ value: c.name, label: c.name }))
              },
              {
                label: 'Owner',
                field: 'owner',
                options: companies.map(c => ({ value: c.name, label: c.name }))
              },
              {
                label: 'Customs Officer',
                field: 'customsOfficer',
                options: customsOfficers.map(c => ({ value: c.name, label: c.name }))
              }
            ];

            const numericFields: Array<{ label: string; field: keyof FilterCriteria }> = [
              { label: 'Stored Packages', field: 'storedPackages' },
              { label: 'Stored Weight', field: 'storedWeight' }
            ];

            const dateFields: Array<{ label: string; field: keyof FilterCriteria }> = [
              { label: 'Date', field: 'date' }
            ];

            const textFields: Array<{ label: string; field: keyof FilterCriteria; placeholder?: string }> = [
              { label: 'Order', field: 'order' },
              { label: 'Goods No', field: 'goodsNo' },
              { label: 'Description', field: 'description' },
              { label: 'Transport ID', field: 'transportId' },
              { label: 'Customs Receipt', field: 'customsReceipt' },
              { label: 'Case Manager', field: 'caseManager' }
            ];

            // Combine all field types
            const allFilterFields = [...dropdownFields, ...numericFields, ...dateFields, ...textFields];

            // Sort fields: favorites first, then original order
            const sortedFields = [...allFilterFields].sort((a, b) => {
              const aFav = favoriteFields.has(a.field);
              const bFav = favoriteFields.has(b.field);
              if (aFav && !bFav) return -1;
              if (!aFav && bFav) return 1;
              return 0;
            });

            return sortedFields.map((fieldConfig) => {
              // Check field type
              const isDropdown = 'options' in fieldConfig;
              const isNumeric = numericFields.some(f => f.field === fieldConfig.field);
              const isDate = dateFields.some(f => f.field === fieldConfig.field);
              
              if (isDropdown) {
                // Use MultiSelectDropdown for Progress field
                if (fieldConfig.field === 'progress') {
                  return (
                    <MultiSelectDropdown
                      key={fieldConfig.field}
                      label={fieldConfig.label}
                      field={fieldConfig.field}
                      options={fieldConfig.options}
                    />
                  );
                }
                
                return (
                  <FilterDropdown 
                    key={fieldConfig.field} 
                    label={fieldConfig.label} 
                    field={fieldConfig.field} 
                    options={fieldConfig.options}
                  />
                );
              } else if (isNumeric) {
                return (
                  <FilterNumericInput
                    key={fieldConfig.field}
                    label={fieldConfig.label}
                    field={fieldConfig.field}
                  />
                );
              } else if (isDate) {
                return (
                  <FilterDatePicker
                    key={fieldConfig.field}
                    label={fieldConfig.label}
                    field={fieldConfig.field}
                  />
                );
              } else {
                return (
                  <FilterInput 
                    key={fieldConfig.field} 
                    label={fieldConfig.label} 
                    field={fieldConfig.field} 
                    placeholder={(fieldConfig as any).placeholder}
                  />
                );
              }
            });
          })()}
        </div>
      </div>
    </div>
  );
}