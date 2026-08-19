import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, CirclePlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  'data-row-index'?: number;
  'data-column-key'?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onSelectComplete?: () => void;
  autoOpenOnFocus?: boolean;
  enableAddNew?: boolean;
  onAddNew?: (searchQuery: string) => void;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  itemClassName = '',
  'data-row-index': dataRowIndex,
  'data-column-key': dataColumnKey,
  tabIndex,
  onKeyDown,
  onSelectComplete,
  autoOpenOnFocus = false,
  enableAddNew = false,
  onAddNew,
}: SearchableSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousValueRef = useRef(value);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset search when component unmounts or value changes
  useEffect(() => {
    setSearchQuery('');
    previousValueRef.current = value;
  }, [value]);

  // Intercept typing at the content level to force focus to input
  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    // If user is typing any character, focus the input and let it handle the event
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      e.stopPropagation();
      
      // Force focus to input if it's not already focused
      if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
        searchInputRef.current.focus();
      }
      
      // Manually handle the key press for the input
      if (e.key.length === 1) {
        setSearchQuery(prev => prev + e.key);
      } else if (e.key === 'Backspace') {
        setSearchQuery(prev => prev.slice(0, -1));
      } else if (e.key === 'Delete') {
        setSearchQuery('');
      }
    }
    
    // Allow ArrowUp to navigate back to input from options
    if (e.key === 'ArrowUp') {
      // Check if any SelectItem is currently focused
      const activeElement = document.activeElement;
      const firstOption = activeElement?.closest('[role="option"]');
      
      // If we're on an option and it's the first one (or getting close to the top)
      if (firstOption) {
        const allOptions = document.querySelectorAll('[role="option"]');
        if (allOptions[0] === firstOption) {
          // We're on the first option, navigate back to input
          e.preventDefault();
          e.stopPropagation();
          searchInputRef.current?.focus();
        }
      }
    }
  };

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        // Only call onValueChange if the value actually changed
        if (newValue !== previousValueRef.current) {
          previousValueRef.current = newValue;
          onValueChange(newValue);
          // Call the completion callback after value changes
          if (onSelectComplete) {
            onSelectComplete();
          }
        }
      }}
    >
      <SelectTrigger
        ref={triggerRef}
        data-row-index={dataRowIndex}
        data-column-key={dataColumnKey}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        className={triggerClassName}
      >
        <SelectValue placeholder={placeholder} className="truncate" />
      </SelectTrigger>
      <SelectContent 
        className={contentClassName}
        onCloseAutoFocus={(e) => {
          // Prevent default behavior and manually focus the trigger
          e.preventDefault();
          // Focus the trigger after the dropdown closes
          setTimeout(() => {
            triggerRef.current?.focus();
          }, 0);
        }}
        onKeyDown={handleContentKeyDown}
      >
        {/* Search Box */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] p-2">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-2 pr-8 py-1.5 border-0 font-['Inter'] text-[12px] text-[#000] focus:outline-none placeholder:text-[#999]\\"
              autoFocus
              onPointerDown={(e) => {
                // Prevent the select from handling this event
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                // Prevent the select from handling this event
                e.stopPropagation();
              }}
              onClick={(e) => {
                // Prevent the select from handling this event
                e.stopPropagation();
              }}
              onBlur={(e) => {
                // Don't refocus - allow arrow key navigation to work
                // The search will still be available when typing starts
              }}
              onKeyDown={(e) => {
                // For typing keys, stop all propagation to keep focus in input
                if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                  e.stopPropagation();
                  return;
                }
                
                // Allow arrow keys to propagate for navigation ONLY if there are options to navigate
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && filteredOptions.length > 0) {
                  // Don't stop propagation for arrow keys - let them navigate the options
                  return;
                }
                
                // Stop propagation for all other keys to prevent Select from handling them
                e.stopPropagation();
                
                // Handle Enter key for adding new article
                if (e.key === 'Enter' && enableAddNew && searchQuery.trim() && onAddNew) {
                  e.preventDefault();
                  onAddNew(searchQuery);
                  return;
                }
                // Prevent select from closing on Enter
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
            {enableAddNew ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (searchQuery.trim() && onAddNew) {
                    onAddNew(searchQuery);
                  }
                }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                  searchQuery.trim() ? 'text-[#446BF9]' : 'text-[#d3d3d3] cursor-not-allowed'
                }`}
                disabled={!searchQuery.trim()}
                tabIndex={-1}
              >
                <CirclePlus className="h-[14px] w-[14px]" strokeWidth={2} />
              </button>
            ) : (
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#999]" strokeWidth={2} />
            )}
          </div>
        </div>
        
        {/* Options */}
        <div className="max-h-[200px] overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <SelectItem
                key={option}
                value={option}
                className={itemClassName}
                onClick={onSelectComplete}
              >
                {option}
              </SelectItem>
            ))
          ) : (
            <div className="px-3 py-2 font-['Inter'] text-[12px] text-[#999] text-center">
              No results found
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}