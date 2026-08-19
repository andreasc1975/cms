import { useState, forwardRef } from 'react';
import svgPaths from "../imports/svg-b75trn6pxk";
import { Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ActionButtonProps {
  onEdit?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  isSelected?: boolean;
}

// Clean button component that filters out Figma props
const CleanActionButton = forwardRef<HTMLButtonElement, any>((props, ref) => {
  const {
    _fgT, _fgt, _fgS, _fgs, _fgB, _fgb,
    disabled,
    onMouseEnter,
    onMouseLeave,
    className,
    children,
    ...cleanProps
  } = props;

  return (
    <button
      ref={ref}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      {...cleanProps}
    >
      {children}
    </button>
  );
});

CleanActionButton.displayName = 'CleanActionButton';

export function ActionButton({ onEdit, onRemove, disabled = false, className = "", isSelected = false }: ActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`box-border content-stretch flex items-center justify-center px-0 py-[5px] relative shrink-0 size-[35px] sticky right-0 z-10 border-b border-solid ${
        isSelected ? 'bg-[#DFE5EB] border-[#C8D3DC]' : 'bg-white border-neutral-200'
      } ${className}`}
      onClick={handleClick}
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <CleanActionButton
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative shrink-0 size-[20px] transition-all duration-150 ${
              isHovered && !disabled ? 'scale-105 opacity-80' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <g id="more_vert">
                <mask height="20" id="mask0_1_2860" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
                  <rect fill="#D9D9D9" height="20" id="Bounding box" width="20" />
                </mask>
                <g mask="url(#mask0_1_2860)">
                  <path d={svgPaths.p24802500} fill="#003160" />
                </g>
              </g>
            </svg>
          </CleanActionButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem 
            onClick={onEdit}
            className="cursor-pointer font-['Inter'] text-[12px] flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onRemove}
            className="cursor-pointer text-destructive focus:text-destructive font-['Inter'] text-[12px] flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Remove</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}