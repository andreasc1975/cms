import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import svgPaths from "../imports/svg-pw63lxz1i1";
import { Search, Check, Building2, X, Loader2, Plus, ShieldCheck } from 'lucide-react';

interface CustomDropdownProps {
  label?: string;
  numberPrefix?: string;
  value?: string;
  defaultValue?: string;
  options: string[];
  className?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void; // New prop for blur event
  onFocus?: () => void; // New prop for focus event
  tabIndex?: number;
  placeholder?: string;
  autoFocus?: boolean;
  isInlineTable?: boolean;
  isProposed?: boolean; // New prop for proposed styling
  verifiedOptions?: Record<string, boolean>; // Map of option names to verification status
  onVerifiedClick?: (optionName: string) => void; // Callback when Building2 icon is clicked
  enableApiSearch?: boolean; // Enable Brreg API search
  onApiResultSelect?: (result: BrregCompany) => void; // Callback when API result is selected
  onAddToDatabase?: (company: BrregCompany) => void; // Callback to add company to database
}

// Brreg API response types
export interface BrregCompany {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: {
    adresse?: string[];
    postnummer?: string;
    poststed?: string;
    kommune?: string;
    land?: string;
    landkode?: string;
  };
  postadresse?: {
    adresse?: string[];
    postnummer?: string;
    poststed?: string;
    kommune?: string;
    land?: string;
    landkode?: string;
  };
}

interface BrregApiResponse {
  _embedded?: {
    enheter: BrregCompany[];
  };
}

export interface CustomDropdownRef {
  focus: () => void;
}

export const CustomDropdown = forwardRef<CustomDropdownRef, CustomDropdownProps>(({ 
  label, 
  numberPrefix, 
  value, 
  defaultValue,
  options,
  className = '',
  onChange,
  onBlur,
  onFocus,
  tabIndex,
  placeholder = 'Select...',
  autoFocus = false,
  isInlineTable = false,
  isProposed = false,
  verifiedOptions,
  onVerifiedClick,
  enableApiSearch = false,
  onApiResultSelect,
  onAddToDatabase
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResults, setApiResults] = useState<BrregCompany[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (isInlineTable) {
        buttonRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }));

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setIsSearching(false);
        setApiResults([]); // Clear API results when closing
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // API Search with debouncing
  useEffect(() => {
    if (!enableApiSearch || !searchQuery || searchQuery.length < 2) {
      setApiResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(searchQuery)}&size=10`
        );
        
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        const data: BrregApiResponse = await response.json();
        const companies = data._embedded?.enheter || [];
        setApiResults(companies);
      } catch (error) {
        console.error('Brreg API error:', error);
        setApiResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, enableApiSearch]);

  const handleApiResultSelect = (company: BrregCompany) => {
    console.log('handleApiResultSelect called with company:', company);
    const displayName = company.navn;
    
    setSelectedValue(displayName);
    setSearchQuery('');
    setIsSearching(false);
    setApiResults([]); // Clear API results
    setIsOpen(false); // Close dropdown
    onChange?.(displayName);
    
    // Call the callback with full company data
    console.log('Calling onApiResultSelect callback...');
    onApiResultSelect?.(company);
    
    // Trigger onBlur after selection
    setTimeout(() => onBlur?.(), 0);
  };

  const handleSelect = (option: string) => {
    setSelectedValue(option);
    setSearchQuery('');
    setIsSearching(false);
    onChange?.(option);
    setIsOpen(false);
    // Deferred: calling focus() synchronously here re-triggers handleInputFocus
    // with the *stale* pre-update closure values (selectedValue still empty,
    // isSearching still true), which re-opens the dropdown right after we
    // just closed it. Running it on the next tick lets React commit the
    // state above first, so handleInputFocus sees the real, updated values.
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    // Trigger onBlur after selection
    setTimeout(() => onBlur?.(), 0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedValue('');
    setSearchQuery('');
    setIsSearching(true);
    onChange?.('');
    setIsOpen(true);
    // Focus the input to allow immediate search
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);
    setIsOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
      setSearchQuery('');
      setIsSearching(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Focus first filtered option
      const firstOption = dropdownRef.current?.querySelector('[role="option"]') as HTMLElement;
      firstOption?.focus();
    } else if (e.key === 'Enter' && filteredOptions.length === 1) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    } else if (e.key === 'Enter' && filteredOptions.length === 0) {
      e.preventDefault();
    }
  };

  const handleInputFocus = () => {
    onFocus?.();
    if (!selectedValue || isSearching) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    if (!isOpen) {
      setIsSearching(true);
      setSearchQuery('');
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation(); // Only prevent modal close if dropdown is open
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      // Focus search input first
      searchInputRef.current?.focus();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // Prevent modal from closing
      setIsOpen(false);
      setSearchQuery('');
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Focus first filtered option
      const firstOption = dropdownRef.current?.querySelector('[role="option"]') as HTMLElement;
      firstOption?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      buttonRef.current?.focus();
    } else if (e.key === 'Enter' && filteredOptions.length === 1) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, option: string, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(option);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // Prevent modal from closing
      setIsOpen(false);
      setSearchQuery('');
      if (isInlineTable) {
        buttonRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextOption = dropdownRef.current?.querySelectorAll('[role="option"]')[index + 1] as HTMLElement;
      if (nextOption) {
        nextOption.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        if (isInlineTable) {
          searchInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      } else {
        const prevOption = dropdownRef.current?.querySelectorAll('[role="option"]')[index - 1] as HTMLElement;
        prevOption?.focus();
      }
    }
  };

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Inline table version (minimal styling for table cells)
  if (isInlineTable) {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          tabIndex={tabIndex}
          className={`w-full border-0 border-b border-b-black px-0 py-1 pr-5 font-['Inter'] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer bg-transparent tracking-[0] text-left appearance-none ${
            selectedValue ? 'text-[#000]' : 'text-[#999]'
          } ${className}`}
          autoFocus={autoFocus}
        >
          {selectedValue || placeholder}
        </button>
        
        {/* Chevron Icon */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[9px] h-[5px] pointer-events-none">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
            <path d={svgPaths.p601ad80} className="fill-[#003160]" />
          </svg>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white border border-[#e0e0e0] rounded-[2px] shadow-[0px_3px_10px_0px_rgba(0,0,0,0.12)] max-h-[240px] overflow-hidden z-[9999] flex flex-col">
            {/* Search Input */}
            <div className="relative px-[10px] py-[8px] bg-[#f5f5f5] border-b border-[#e0e0e0]">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search..."
                className="w-full pr-[24px] bg-transparent border-none outline-none font-[Inter] text-[12px] text-black placeholder:text-[#999]"
              />
              <Search className="absolute right-[10px] top-[50%] -translate-y-1/2 w-[14px] h-[14px] text-[#999] pointer-events-none" />
            </div>
            {/* Options List */}
            <div className="overflow-y-auto max-h-[192px]">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option}
                    role="option"
                    tabIndex={0}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option, index)}
                    className={`px-[10px] py-[8px] font-[Inter] text-[12px] cursor-pointer focus:outline-none flex items-center justify-between gap-2 ${
                      selectedValue === option 
                        ? 'bg-[#DFE5EB] text-[#003160] hover:bg-[#CDD6E0] focus:bg-[#CDD6E0]' 
                        : 'text-black hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]'
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {enableApiSearch && (
                        <span
                          className="flex items-center gap-1 bg-neutral-100 text-neutral-500 px-[6px] py-[2px] rounded-full"
                          title="From your local address book, not Brønnøysundregistrene"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">Address book</span>
                        </span>
                      )}
                      {verifiedOptions?.[option] && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerifiedClick?.(option);
                          }}
                          className="p-0.5 hover:bg-[#003160]/10 rounded transition-colors cursor-pointer border-0 bg-transparent"
                          title="View organization details"
                        >
                          <Building2 className="w-[14px] h-[14px] text-[#003160] flex-shrink-0" />
                        </button>
                      )}
                      {selectedValue === option && (
                        <Check className="w-[14px] h-[14px] text-[#003160] flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-[10px] py-[8px] font-[Inter] text-[12px] text-[#999] text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard form field version
  return (
    <div 
      className="relative h-[54px] w-full" 
      ref={dropdownRef}
      onMouseDown={(e) => {
        console.log('CustomDropdown CONTAINER mousedown!', e.target, e.currentTarget);
      }}
    >
      <div className="absolute left-0 top-0 content-stretch flex items-start justify-between w-full pointer-events-none">
        <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic text-[12px] text-nowrap tracking-[0.7px] uppercase">
          {numberPrefix && (
            <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#ff8f00]">
              <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-nowrap whitespace-pre font-bold">{numberPrefix}</p>
            </div>
          )}
          <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden text-nowrap whitespace-pre font-bold text-[11px]">{label}</p>
          </div>
        </div>
      </div>
      
      <div className={`absolute bottom-0 box-border left-0 right-0 top-[31.48%] rounded-[2px] flex items-center group ${isProposed ? 'bg-[rgba(82,184,156,0.2)]' : 'bg-white'}`}>
        <div aria-hidden="true" className={`absolute border ${isProposed ? 'border-[#52B89C]' : 'border-[#e0e0e0]'} group-focus-within:border-[#446BF9] border-solid inset-0 pointer-events-none rounded-[2px] transition-colors`} />
        
        <input
          ref={inputRef}
          type="text"
          value={isSearching ? searchQuery : selectedValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          tabIndex={tabIndex}
          placeholder={placeholder}
          className={`relative z-10 w-full h-full pl-[10px] ${selectedValue && !isSearching ? 'pr-[76px]' : 'pr-[46px]'} bg-transparent border-none appearance-none cursor-text font-[Inter] text-[12px] text-left outline-none ${
            (selectedValue && !isSearching) ? 'text-black' : 'text-[#999]'
          } ${className}`}
          autoFocus={autoFocus}
        />
        
        {/* Clear button - only shown when there's a value */}
        {selectedValue && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[36px] top-0 bottom-0 w-[40px] h-full flex items-center justify-center hover:bg-gray-100 rounded-bl-[2px] rounded-tl-[2px] cursor-pointer border-0 bg-transparent transition-colors z-20 pointer-events-auto"
            title="Clear selection"
          >
            <X className="w-[14px] h-[14px] text-[#003160]" />
          </button>
        )}
        
        <div className="absolute right-0 top-0 bottom-0 bg-[#e0e0e0] group-focus-within:bg-[#446BF9] rounded-br-[2px] rounded-tr-[2px] w-[36px] h-full flex items-center justify-center pointer-events-none transition-colors">
          <div className="relative w-[9px] h-[5px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
              <path d={svgPaths.p601ad80} className="fill-[#003160] group-focus-within:fill-white transition-colors" />
            </svg>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white border border-[#e0e0e0] rounded-[2px] shadow-[0px_3px_10px_0px_rgba(0,0,0,0.12)] max-h-[240px] overflow-hidden z-[9999]">
            {/* Options List - No separate search input */}
            <div className="overflow-y-auto max-h-[240px]">
              {isLoading ? (
                <div className="px-[10px] py-[16px] font-[Inter] text-[12px] text-[#999] text-center flex items-center justify-center gap-2">
                  <Loader2 className="w-[14px] h-[14px] animate-spin" />
                  <span>Searching Brønnøysundregistrene...</span>
                </div>
              ) : enableApiSearch && searchQuery.length >= 2 && apiResults.length > 0 ? (
                // Show API results
                <>
                  {apiResults.map((company) => {
                    const address = company.forretningsadresse || company.postadresse;
                    const addressLine = address?.adresse?.join(', ') || '';
                    const city = address?.poststed || '';
                    const postalCode = address?.postnummer || '';
                    const fullAddress = [addressLine, postalCode, city].filter(Boolean).join(', ');
                    
                    return (
                      <div
                        key={company.organisasjonsnummer}
                        role="option"
                        tabIndex={0}
                        onClick={() => handleApiResultSelect(company)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleApiResultSelect(company);
                          }
                        }}
                        className="px-[10px] py-[8px] font-[Inter] text-[12px] cursor-pointer focus:outline-none hover:bg-[#f5f5f5] focus:bg-[#f5f5f5] border-b border-[#f0f0f0] last:border-b-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[#003160] truncate">{company.navn}</div>
                            {fullAddress && (
                              <div className="text-[11px] text-[#666] truncate mt-0.5">{fullAddress}</div>
                            )}
                            <div className="text-[11px] text-[#999] mt-0.5">Org.nr: {company.organisasjonsnummer}</div>
                          </div>
                          <div
                            className="flex items-center gap-1 shrink-0 mt-0.5 bg-[#E1F5EE] text-[#0F6E56] px-[6px] py-[2px] rounded-full"
                            title="From Brønnøysundregistrene (live lookup)"
                          >
                            <ShieldCheck className="w-[12px] h-[12px]" />
                            <span className="text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">Brreg</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : enableApiSearch && searchQuery.length >= 2 && apiResults.length === 0 && !isLoading ? (
                <div className="px-[10px] py-[8px] font-[Inter] text-[12px] text-[#999] text-center">
                  No companies found in Brønnøysundregistrene
                </div>
              ) : enableApiSearch && searchQuery.length > 0 && searchQuery.length < 2 ? (
                <div className="px-[10px] py-[8px] font-[Inter] text-[12px] text-[#999] text-center">
                  Type at least 2 characters to search
                </div>
              ) : filteredOptions.length > 0 ? (
                // Show static options
                filteredOptions.map((option, index) => (
                  <div
                    key={option}
                    role="option"
                    tabIndex={0}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option, index)}
                    className={`px-[10px] py-[8px] font-[Inter] text-[12px] cursor-pointer focus:outline-none flex items-center justify-between ${
                      selectedValue === option 
                        ? 'bg-[#DFE5EB] text-[#003160] hover:bg-[#CDD6E0] focus:bg-[#CDD6E0]' 
                        : 'text-black hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]'
                    }`}
                  >
                    <span>{option}</span>
                    <div className="flex items-center gap-2">
                      {verifiedOptions?.[option] && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerifiedClick?.(option);
                          }}
                          className="p-0.5 hover:bg-[#003160]/10 rounded transition-colors cursor-pointer border-0 bg-transparent"
                          title="View organization details"
                        >
                          <Building2 className="w-[14px] h-[14px] text-[#003160] flex-shrink-0" />
                        </button>
                      )}
                      {selectedValue === option && (
                        <Check className="w-[14px] h-[14px] text-[#003160] flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-[10px] py-[8px] font-[Inter] text-[12px] text-[#999] text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CustomDropdown.displayName = 'CustomDropdown';