import svgPaths from "../imports/svg-b75trn6pxk";

interface TableHeaderProps {
  label: string;
  width?: string;
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  children?: React.ReactNode;
  showColumnVisibility?: boolean;
  onOpenColumnVisibility?: () => void;
  align?: 'left' | 'right' | 'center';
  /** When set, column grows/shrinks proportionally instead of staying at a fixed width. */
  flexGrow?: number;
  /** Minimum width (e.g. '110px') the column won't shrink below. Used together with flexGrow. */
  minWidth?: string;
}

export function TableHeader({ 
  label, 
  width = '', 
  className = '', 
  sortable = false,
  sortDirection = null,
  onSort,
  children,
  showColumnVisibility = false,
  onOpenColumnVisibility,
  align = 'left',
  flexGrow,
  minWidth
}: TableHeaderProps) {
  const responsiveStyle = flexGrow
    ? { flexGrow, flexShrink: 1, flexBasis: 0, minWidth: minWidth || width }
    : undefined;
  // Handle column visibility button
  if (showColumnVisibility && onOpenColumnVisibility) {
    return (
      <div className={`box-border content-stretch flex items-center justify-center px-0 py-[5px] relative shrink-0 ${width || 'w-[40px]'} ${className}`}>
        <button 
          onClick={onOpenColumnVisibility}
          className="relative shrink-0 size-[20px] cursor-pointer hover:opacity-70 transition-opacity"
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
            <g id="view_week">
              <path d={svgPaths.p2ac66800} fill="#003160" />
            </g>
          </svg>
        </button>
      </div>
    );
  }

  // Handle children (e.g., checkbox)
  if (children) {
    return (
      <div className={`box-border content-stretch flex items-center justify-center px-0 py-[5px] relative shrink-0 ${width || 'w-[40px]'} ${className}`}>
        {children}
      </div>
    );
  }

  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  // For flex-grow columns, match the row structure exactly
  if (className?.includes('grow')) {
    return (
      <div 
        className={`h-[50px] min-h-px min-w-px relative shrink-0 ${className} ${sortable ? 'cursor-pointer hover:bg-neutral-50' : ''}`}
        onClick={handleClick}
      >
        <div className="flex flex-row items-center relative size-full">
          <div className="box-border content-stretch flex h-[50px] items-center justify-between pl-[10px] pr-0 py-[5px] relative w-full">
            <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[12px] text-nowrap tracking-[0.7px] uppercase font-semibold`}>
              <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px]">{label}</p>
            </div>
            {sortable && (
              <div className="ml-1 flex flex-col flex-shrink-0">
                <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent ${sortDirection === 'asc' ? 'border-b-[#003160]' : 'border-b-gray-300'}`} 
                     style={{ borderBottomWidth: '3px', borderLeftColor: 'transparent', borderRightColor: 'transparent', marginBottom: '1px' }} />
                <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent ${sortDirection === 'desc' ? 'border-t-[#003160]' : 'border-t-gray-300'}`}
                     style={{ borderTopWidth: '3px', borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For fixed-width columns
  const justifyClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  const textAlignClass = `text-${align}`;
  
  return (
    <div 
      className={`box-border content-stretch flex h-[50px] items-center ${justifyClass} px-[10px] py-[5px] relative ${flexGrow ? '' : `shrink-0 ${width || ''}`} ${className} ${sortable ? 'cursor-pointer hover:bg-neutral-50' : ''}`}
      style={responsiveStyle}
      onClick={handleClick}
    >
      <div className={`font-['Inter'] leading-[0] not-italic text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase font-semibold overflow-hidden text-ellipsis ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}>
        <p className={`leading-[normal] overflow-ellipsis overflow-hidden ${textAlignClass}`}>
          {label}
        </p>
      </div>
      {sortable && (
        <div className="ml-1 flex flex-col flex-shrink-0">
          <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent ${sortDirection === 'asc' ? 'border-b-[#003160]' : 'border-b-gray-300'}`} 
               style={{ borderBottomWidth: '3px', borderLeftColor: 'transparent', borderRightColor: 'transparent', marginBottom: '1px' }} />
          <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent ${sortDirection === 'desc' ? 'border-t-[#003160]' : 'border-t-gray-300'}`}
               style={{ borderTopWidth: '3px', borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
        </div>
      )}
    </div>
  );
}