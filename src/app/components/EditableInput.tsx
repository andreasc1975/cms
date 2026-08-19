import { useState } from 'react';

interface EditableInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function EditableInput({ value, onChange, disabled = false, className = "" }: EditableInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const baseClasses = "box-border content-stretch flex h-[37px] items-center justify-between px-[10px] py-0 relative rounded-[2px] shrink-0 w-[100px]";
  const bgClasses = disabled ? "bg-neutral-100" : "bg-white";
  const borderClasses = "border border-[#e0e0e0] border-solid";

  return (
    <div className={`${baseClasses} ${bgClasses} ${className}`} onClick={handleClick}>
      <div className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[2px]" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        className="basis-0 font-['Roboto_Mono'] font-medium grow leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-black text-nowrap text-right bg-transparent border-none outline-none"
      />
    </div>
  );
}