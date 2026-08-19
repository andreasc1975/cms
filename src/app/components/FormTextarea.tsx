interface FormTextareaProps {
  label: string;
  numberPrefix?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  className?: string;
  rows?: number;
}

export function FormTextarea({ 
  label, 
  numberPrefix, 
  placeholder = 'Add', 
  value, 
  defaultValue,
  className = '',
  rows = 3
}: FormTextareaProps) {
  return (
    <div className="relative w-full" style={{ height: `${17 + (rows * 20)}px` }}>
      <div className="absolute left-0 top-0 content-stretch flex items-start justify-between w-full">
        <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic text-[12px] text-nowrap tracking-[0.7px] uppercase">
          {numberPrefix && (
            <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#ff8f00]">
              <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-nowrap whitespace-pre font-bold">{numberPrefix}</p>
            </div>
          )}
          <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
            <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-nowrap whitespace-pre font-bold">{label}</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bg-white bottom-0 box-border left-0 right-0 top-[31.48%] rounded-[2px]">
        <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[2px]" />
        <textarea
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          rows={rows}
          className={`w-full h-full px-[10px] py-[8px] bg-transparent border-none outline-none font-['Calibre:Regular',sans-serif] text-[14px] text-black placeholder:text-[#9e9e9e] resize-none ${className}`}
        />
      </div>
    </div>
  );
}
