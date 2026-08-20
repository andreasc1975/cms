import { useState, forwardRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

interface FormInputProps {
  label: string;
  numberPrefix?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  type?: 'text' | 'number' | 'date';
  className?: string;
  isMonospace?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void; // New prop for blur event
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // New prop for key events
  readOnly?: boolean;
  tabIndex?: number;
  isProposed?: boolean; // New prop for proposed styling
  required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ 
  label, 
  numberPrefix, 
  placeholder = 'Add', 
  value, 
  defaultValue,
  type = 'text',
  className = '',
  isMonospace = false,
  onChange,
  onBlur, // Add onBlur to the function parameters
  onKeyDown, // Add onKeyDown to the function parameters
  readOnly = false,
  tabIndex,
  isProposed = false, // Default to false
  required = false
}, ref) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Parse DD/MM/YYYY string to Date object
  const parseDate = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined;
    
    // Try DD/MM/YYYY format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    
    return undefined;
  };

  // Format Date to DD/MM/YYYY string
  const formatDateToString = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle date input change (manual typing)
  const handleDateInputChange = (inputValue: string) => {
    // Allow only numbers and slashes
    const filtered = inputValue.replace(/[^\d/]/g, '');
    onChange?.(filtered);
  };

  // Date picker rendering
  if (type === 'date') {
    const dateValue = parseDate(value);

    return (
      <div className="relative h-[54px] w-full">
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
        
        <div className={`absolute bottom-0 box-border left-0 right-0 top-[31.48%] rounded-[2px] group ${readOnly ? 'bg-[#f5f5f5]' : 'bg-white'}`}>
          <div aria-hidden="true" className="absolute border border-[#e0e0e0] group-focus-within:border-[#446BF9] border-solid inset-0 pointer-events-none rounded-[2px] transition-colors" />
          <Popover 
            open={isDatePickerOpen} 
            onOpenChange={setIsDatePickerOpen}
          >
            <div className="relative flex items-center h-full">
              <input
                type="text"
                placeholder={placeholder}
                value={value || ''}
                onChange={(e) => handleDateInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setIsDatePickerOpen(true);
                  }
                }}
                readOnly={readOnly}
                tabIndex={tabIndex}
                style={readOnly ? { WebkitTextFillColor: '#000', color: '#000' } : undefined}
                className={`relative z-10 w-full h-full px-[10px] pr-[34px] bg-transparent border-none outline-none text-[12px] text-black placeholder:text-[#9e9e9e] font-[Inter] ${readOnly ? 'cursor-not-allowed' : ''} ${className}`}
              />
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsDatePickerOpen(true);
                    }
                  }}
                  tabIndex={tabIndex ? tabIndex + 1 : undefined}
                  className="absolute right-[10px] p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center group focus:outline-none focus:ring-1 focus:ring-[#446BF9] focus:rounded z-20"
                >
                  <CalendarDays className="h-[14px] w-[14px] text-[#999] group-hover:text-[#446BF9] transition-colors" strokeWidth={2} />
                </button>
              </PopoverTrigger>
            </div>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => {
                  if (date) {
                    onChange?.(formatDateToString(date));
                    setIsDatePickerOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

  // Default text/number input rendering
  return (
    <div className="relative h-[54px] w-full">
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
      
      <div className={`absolute bottom-0 box-border left-0 right-0 top-[31.48%] rounded-[2px] group ${readOnly ? 'bg-[#f5f5f5]' : isProposed ? 'bg-[rgba(82,184,156,0.2)]' : 'bg-white'}`}>
        <div aria-hidden="true" className={`absolute border ${isProposed ? 'border-[#52B89C]' : 'border-[#e0e0e0]'} group-focus-within:border-[#446BF9] border-solid inset-0 pointer-events-none rounded-[2px] transition-colors`} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur} // Add onBlur to the input
          onKeyDown={onKeyDown} // Add onKeyDown to the input
          readOnly={readOnly}
          tabIndex={tabIndex}
          style={readOnly ? { WebkitTextFillColor: '#000', color: '#000' } : undefined}
          className={`relative z-10 w-full h-full px-[10px] bg-transparent border-none outline-none text-[12px] text-black placeholder:text-[#9e9e9e] ${readOnly ? 'cursor-not-allowed' : ''} ${isMonospace ? 'font-[Roboto_Mono]' : 'font-[Inter]'} ${className}`}
          ref={ref}
          required={required}
        />
      </div>
    </div>
  );
});

FormInput.displayName = 'FormInput';