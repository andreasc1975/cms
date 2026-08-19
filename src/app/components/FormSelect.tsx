import svgPaths from "../imports/svg-pw63lxz1i1";

interface FormSelectProps {
  label: string;
  numberPrefix?: string;
  value?: string;
  defaultValue?: string;
  options: string[];
  className?: string;
  onChange?: (value: string) => void;
  tabIndex?: number;
  required?: boolean;
}

export function FormSelect({ 
  label, 
  numberPrefix, 
  value, 
  defaultValue,
  options,
  className = '',
  onChange,
  tabIndex,
  required = false
}: FormSelectProps) {
  return (
    <div className="relative h-[54px] w-full">
      <div className="absolute left-0 top-0 content-stretch flex items-start justify-between w-full">
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
      
      <div className="absolute bg-white bottom-0 box-border left-0 right-0 top-[31.48%] rounded-[2px] flex items-center">
        <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[2px]" />
        
        <select
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          tabIndex={tabIndex}
          required={required}
          className={`w-full h-full pl-[10px] pr-[46px] bg-transparent border-none outline-none font-[Inter] text-[12px] text-black appearance-none cursor-pointer focus:outline-[#446BF9] focus:outline-2 focus:shadow-[0_0_0_3px_rgba(68,107,249,0.1)] ${className}`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        
        <div className="absolute right-0 top-0 bottom-0 bg-[#e0e0e0] rounded-br-[2px] rounded-tr-[2px] w-[36px] h-full flex items-center justify-center pointer-events-none">
          <div className="relative w-[9px] h-[5px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
              <path d={svgPaths.p601ad80} fill="#003160" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}