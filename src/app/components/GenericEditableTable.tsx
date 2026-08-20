import { useState, useMemo, ReactNode, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, Columns3, MoreVertical, MoveRight, Pen, X, ChevronRight, ChevronDown, CirclePlus, Trash2, CalendarIcon, CalendarDays } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SearchableSelect } from './SearchableSelect';
import { format } from 'date-fns';

// Generic types
export interface GenericColumn<T = any> {
  key: string;
  label: string;
  type: 'text' | 'select' | 'readonly' | 'checkbox' | 'link' | 'number' | 'date';
  minWidth?: string;
  options?: string[]; // For select type
  editable?: boolean;
  sortable?: boolean;
  defaultVisible?: boolean;
  onLinkClick?: (row: T) => void; // For link type
  numberPrefix?: string; // Orange number above column header
  enableAddNew?: boolean; // For select type with add new functionality
  onAddNew?: (searchQuery: string) => void; // Callback when adding new item
  isAmount?: boolean; // For link type: renders as right-aligned Roboto Mono (use for monetary/numeric link columns like Fees)
  emptyLabel?: string; // For link type: text shown when there's no value yet, instead of the default '—'
}

export interface GenericTableConfig<T = any> {
  columns: GenericColumn<T>[];
  data: T[];
  idField?: keyof T; // Which field to use as unique ID
  onDataChange?: (newData: T[]) => void;
  onSave?: (data: T[]) => void;
  enableColumnChooser?: boolean;
  enableSorting?: boolean;
  enableTabNavigation?: boolean;
  rowHeight?: string;
}

interface GenericEditableTableProps<T = any> extends GenericTableConfig<T> {
  className?: string;
}

interface EditableHeaderProps {
  field: string;
  children: ReactNode;
  className?: string;
  isHovered: boolean;
  onHover: (field: string | null) => void;
  onEditAll?: (field: string, value: string) => void;
  onClear?: (field: string) => void;
  onSort?: (field: string) => void;
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc';
  isIconToggled?: boolean;
  onToggleIcon?: (field: string) => void;
  isEditMenuOpen?: boolean;
  onToggleEditMenu?: (field: string) => void;
  columnOptions?: string[];
}

function EditableHeader({
  field,
  children,
  className = '',
  isHovered,
  onHover,
  onEditAll,
  onClear,
  onSort,
  sortColumn,
  sortDirection,
  isIconToggled,
  onToggleIcon,
  isEditMenuOpen,
  onToggleEditMenu,
  columnOptions,
}: EditableHeaderProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showEditAllPanel, setShowEditAllPanel] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    if (!isEditMenuOpen) {
      setShowEditAllPanel(false);
      setSelectedValue('');
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggleEditMenu?.(field);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditMenuOpen, field, onToggleEditMenu]);

  const handleApply = () => {
    if (selectedValue && onEditAll) {
      onEditAll(field, selectedValue);
      onToggleEditMenu?.(field);
    }
  };

  return (
    <th
      className={`${className} align-top ${isEditMenuOpen ? 'z-50' : ''}`}
      onMouseEnter={() => onHover(field)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {onSort && (
              <button
                onClick={() => onSort(field)}
                className="flex items-center gap-1 p-0 border-0 bg-transparent cursor-pointer"
              >
                <span className="truncate uppercase">{children}</span>
                {sortColumn === field && (
                  sortDirection === 'asc' ? (
                    <ArrowUp className="size-3 text-[#446BF9] flex-shrink-0" strokeWidth={2} />
                  ) : (
                    <ArrowDown className="size-3 text-[#446BF9] flex-shrink-0" strokeWidth={2} />
                  )
                )}
              </button>
            )}
            {!onSort && <span className="truncate">{children}</span>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 relative">
            {onEditAll && (
              <>
                <button
                  onClick={() => onToggleEditMenu?.(field)}
                  className="p-0.5 border-0 bg-transparent cursor-pointer group"
                  title="Edit All"
                >
                  <Pen className="size-3 text-[#767676] group-hover:text-[#446BF9] transition-colors" strokeWidth={2} />
                </button>
                {isEditMenuOpen && (
                  <div 
                    ref={menuRef}
                    className="absolute top-full right-0 mt-1 bg-white border border-[#e5e5e5] rounded shadow-lg z-50 min-w-[120px]"
                  >
                    <button
                      onMouseEnter={() => setShowEditAllPanel(true)}
                      className="w-full flex items-center justify-between px-3 py-2 font-['Inter'] text-[12px] text-[#000] hover:bg-[#f0f0f0] cursor-pointer border-0 bg-transparent"
                    >
                      <span className="font-normal text-[12px] tracking-[0]">Edit all</span>
                      <ChevronRight className="size-3" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => {
                        onClear?.(field);
                        onToggleEditMenu?.(field);
                      }}
                      className="w-full text-left px-3 py-2 font-['Inter'] text-[12px] text-[#000] hover:bg-[#f0f0f0] cursor-pointer border-0 bg-transparent font-normal tracking-[0]"
                    >
                      Clear
                    </button>
                    
                    {showEditAllPanel && (
                      <div 
                        className="absolute left-full top-0 ml-1 bg-white border border-[#e5e5e5] rounded shadow-lg min-w-[200px] p-3"
                        onMouseLeave={() => setShowEditAllPanel(false)}
                      >
                        <div className="mb-2">
                          <input
                            type="text"
                            value={selectedValue}
                            onChange={(e) => setSelectedValue(e.target.value)}
                            placeholder="Enter value"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && selectedValue.trim()) {
                                handleApply();
                              } else if (e.key === 'Escape') {
                                onToggleEditMenu?.(field);
                              }
                            }}
                            className="w-full px-3 py-2 border border-[#e5e5e5] rounded font-['Inter'] text-[12px] text-[#000] cursor-text focus:outline-none focus:border-[#446BF9] focus:border-2 font-normal tracking-[0] placeholder:text-[#999]"
                          />
                        </div>
                        <button
                          onClick={handleApply}
                          disabled={!selectedValue.trim()}
                          className="w-full px-3 py-2 font-['Inter'] text-[12px] text-white bg-[#e5e5e5] rounded cursor-pointer border-0 disabled:cursor-not-allowed tracking-[0] font-semibold"
                          style={selectedValue.trim() ? { backgroundColor: '#446BF9' } : {}}
                        >
                          Apply to all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {onToggleIcon && (
          <button
            onClick={() => onToggleIcon(field)}
            className="p-0 border-0 bg-transparent cursor-pointer self-start transition-colors"
            title="Toggle tab navigation"
          >
            <MoveRight 
              className={`size-[10px] transition-colors ${
                isIconToggled ? 'text-[#52B89C]' : 'text-[#d1d5db]'
              }`} 
              strokeWidth={2} 
            />
          </button>
        )}
      </div>
    </th>
  );
}

export function GenericEditableTable<T extends Record<string, any>>({
  columns,
  data,
  idField = 'id' as keyof T,
  onDataChange,
  onSave,
  enableColumnChooser = true,
  enableSorting = true,
  enableTabNavigation = true,
  rowHeight = '36px',
  className = '',
}: GenericEditableTableProps<T>) {
  // State - REMOVE internal rows state, use data prop directly
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(col => col.defaultVisible !== false).map(col => col.key))
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [toggledIcons, setToggledIcons] = useState<Set<string>>(new Set());
  const [columnChooserOpen, setColumnChooserOpen] = useState(false);
  const [openEditMenu, setOpenEditMenu] = useState<string | null>(null);
  const [openDatePickers, setOpenDatePickers] = useState<Record<string, boolean>>({});
  const [activeRowId, setActiveRowId] = useState<any>(null);

  // Sorted rows - use data prop directly instead of internal state
  const sortedRows = useMemo(() => {
    if (!enableSorting || !sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, enableSorting]);

  // Handlers
  const handleSort = (columnKey: string) => {
    if (!enableSorting) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleCellChange = (rowId: any, columnKey: string, value: any) => {
    const newRows = data.map(row => 
      row[idField] === rowId ? { ...row, [columnKey]: value } : row
    );
    onDataChange?.(newRows);
  };

  const handleEditAll = (columnKey: string, value: string) => {
    if (value) {
      const newRows = data.map(row => ({ ...row, [columnKey]: value }));
      onDataChange?.(newRows);
    }
  };

  const handleClear = (columnKey: string) => {
    const newRows = data.map(row => ({ ...row, [columnKey]: '' }));
    onDataChange?.(newRows);
  };

  // Check if a row is empty (new)
  const isRowEmpty = (row: T): boolean => {
    return columns.every(col => {
      if (col.key === String(idField)) return true; // Skip ID field
      const value = row[col.key];
      return value === '' || value === null || value === undefined;
    });
  };

  // Add new row below current row
  const handleAddRow = (currentRowId: any) => {
    const currentIndex = data.findIndex(row => row[idField] === currentRowId);
    const newRowId = `new-${Date.now()}`;
    const newRow = {
      [idField]: newRowId,
      ...Object.fromEntries(columns.map(col => [col.key, '']))
    } as T;
    
    const newRows = [
      ...data.slice(0, currentIndex + 1),
      newRow,
      ...data.slice(currentIndex + 1)
    ];
    onDataChange?.(newRows);

    // Focus on the 'Article' column of the new row (or first editable column as fallback)
    setTimeout(() => {
      const articleColumn = columns.find(col => 
        col.key.toLowerCase() === 'article' || col.label.toLowerCase() === 'article'
      );
      const targetColumn = articleColumn || columns.find(col => col.editable !== false);
      
      if (targetColumn) {
        const newRowIndex = currentIndex + 1;
        const input = document.querySelector(
          `[data-row-index="${newRowIndex}"][data-column-key="${targetColumn.key}"]`
        ) as HTMLInputElement;
        
        if (input) {
          input.focus();
          input.select?.();
          
          // Scroll into view if not visible
          input.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'nearest' 
          });
        }
      }
    }, 0);
  };

  // Delete a row
  const handleDeleteRow = (rowId: any) => {
    // Don't allow deletion if it's the last row
    if (data.length <= 1) {
      return;
    }
    const newRows = data.filter(row => row[idField] !== rowId);
    onDataChange?.(newRows);
  };

  const handleToggleIcon = (columnKey: string) => {
    setToggledIcons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  const handleToggleEditMenu = (columnKey: string) => {
    setOpenEditMenu(prev => prev === columnKey ? null : columnKey);
  };

  // Get list of editable visible columns for tab navigation
  const getEditableVisibleColumns = () => {
    return columns
      .filter(col => {
        if (!col.editable || !visibleColumns.has(col.key)) return false;
        // Exclude "Item Line No" from tab order
        const isItemLineNo = col.key.toLowerCase().includes('itemlineno') || 
                             col.key.toLowerCase().includes('item_line_no') ||
                             col.label.toLowerCase().includes('item line no');
        // Exclude "Reference" from tab order
        const isReference = col.key.toLowerCase() === 'reference' ||
                           col.label.toLowerCase() === 'reference';
        return !isItemLineNo && !isReference;
      })
      .map(col => col.key);
  };

  // Handle natural sequential tab navigation through table cells
  const handleSequentialTabNavigation = (e: React.KeyboardEvent, rowIndex: number, columnKey: string) => {
    if (e.key !== 'Tab') return;

    const editableColumns = getEditableVisibleColumns();
    const toggledColumns = editableColumns.filter(col => toggledIcons.has(col));
    const totalRows = sortedRows.length;

    // If there are toggled columns, use vertical-first navigation
    if (toggledColumns.length > 0) {
      const currentToggledIndex = toggledColumns.indexOf(columnKey);
      
      // If current column is not toggled, find the first toggled column
      if (currentToggledIndex === -1) {
        e.preventDefault();
        const firstToggledColumn = toggledColumns[0];
        const nextCell = document.querySelector(
          `[data-row-index="0"][data-column-key="${firstToggledColumn}"]`
        ) as HTMLElement;
        
        if (nextCell) {
          nextCell.focus();
          if (nextCell instanceof HTMLInputElement) {
            nextCell.select();
          }
        }
        return;
      }

      if (e.shiftKey) {
        // Shift+Tab: go to previous row in same column, or previous column's last row
        if (rowIndex > 0) {
          e.preventDefault();
          const nextCell = document.querySelector(
            `[data-row-index="${rowIndex - 1}"][data-column-key="${columnKey}"]`
          ) as HTMLElement;
          
          if (nextCell) {
            nextCell.focus();
            if (nextCell instanceof HTMLInputElement) {
              nextCell.select();
            }
          }
        } else if (currentToggledIndex > 0) {
          e.preventDefault();
          // Move to previous toggled column's last row
          const prevToggledColumn = toggledColumns[currentToggledIndex - 1];
          const nextCell = document.querySelector(
            `[data-row-index="${totalRows - 1}"][data-column-key="${prevToggledColumn}"]`
          ) as HTMLElement;
          
          if (nextCell) {
            nextCell.focus();
            if (nextCell instanceof HTMLInputElement) {
              nextCell.select();
            }
          }
        } else {
          // First cell of first toggled column - let it tab out
          return;
        }
      } else {
        // Tab: go to next row in same column, or next column's first row
        if (rowIndex < totalRows - 1) {
          e.preventDefault();
          const nextCell = document.querySelector(
            `[data-row-index="${rowIndex + 1}"][data-column-key="${columnKey}"]`
          ) as HTMLElement;
          
          if (nextCell) {
            nextCell.focus();
            if (nextCell instanceof HTMLInputElement) {
              nextCell.select();
            }
          }
        } else if (currentToggledIndex < toggledColumns.length - 1) {
          e.preventDefault();
          // Move to next toggled column's first row
          const nextToggledColumn = toggledColumns[currentToggledIndex + 1];
          const nextCell = document.querySelector(
            `[data-row-index="0"][data-column-key="${nextToggledColumn}"]`
          ) as HTMLElement;
          
          if (nextCell) {
            nextCell.focus();
            if (nextCell instanceof HTMLInputElement) {
              nextCell.select();
            }
          }
        } else {
          // Last row of last toggled column - focus the Plus Icon button
          e.preventDefault();
          setTimeout(() => {
            const plusIconButton = document.querySelector(
              'button[title="Add row below"]'
            ) as HTMLButtonElement;
            if (plusIconButton) {
              plusIconButton.focus();
            }
          }, 0);
        }
      }
      return;
    }

    // Original horizontal navigation when no columns are toggled
    const currentColumnIndex = editableColumns.indexOf(columnKey);
    
    if (currentColumnIndex === -1) return;

    let nextRowIndex = rowIndex;
    let nextColumnKey = columnKey;

    if (e.shiftKey) {
      // Shift+Tab: go to previous column or previous row's last column
      if (currentColumnIndex > 0) {
        e.preventDefault();
        nextColumnKey = editableColumns[currentColumnIndex - 1];
      } else if (rowIndex > 0) {
        e.preventDefault();
        nextRowIndex = rowIndex - 1;
        nextColumnKey = editableColumns[editableColumns.length - 1];
      } else {
        // First cell - let it tab out to previous element
        return;
      }
    } else {
      // Tab: go to next column or next row's first column
      if (currentColumnIndex < editableColumns.length - 1) {
        e.preventDefault();
        nextColumnKey = editableColumns[currentColumnIndex + 1];
      } else if (rowIndex < totalRows - 1) {
        e.preventDefault();
        nextRowIndex = rowIndex + 1;
        nextColumnKey = editableColumns[0];
      } else {
        // Last cell of last row - focus the Plus Icon button
        e.preventDefault();
        setTimeout(() => {
          const plusIconButton = document.querySelector(
            'button[title="Add row below"]'
          ) as HTMLButtonElement;
          if (plusIconButton) {
            plusIconButton.focus();
          }
        }, 0);
        return;
      }
    }

    const nextCell = document.querySelector(
      `[data-row-index="${nextRowIndex}"][data-column-key="${nextColumnKey}"]`
    ) as HTMLElement;
    
    if (nextCell) {
      nextCell.focus();
      // For text inputs, select the content
      if (nextCell instanceof HTMLInputElement) {
        nextCell.select();
      }
    }
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  // Function to focus the next cell after select
  const focusNextCell = (rowIndex: number, columnKey: string) => {
    const editableColumns = columns
      .filter(col => visibleColumns.has(col.key) && col.editable !== false)
      .map(col => col.key);
    
    const currentColumnIndex = editableColumns.indexOf(columnKey);
    
    let nextRowIndex = rowIndex;
    let nextColumnKey: string | null = null;
    
    // Move to next column in same row
    if (currentColumnIndex < editableColumns.length - 1) {
      nextColumnKey = editableColumns[currentColumnIndex + 1];
    } else if (rowIndex < data.length - 1) {
      // Move to first column of next row
      nextRowIndex = rowIndex + 1;
      nextColumnKey = editableColumns[0];
    }
    
    if (nextColumnKey) {
      setTimeout(() => {
        // Try to find the next cell - could be an input, button (select trigger), or other element
        const nextCell = document.querySelector(
          `[data-row-index="${nextRowIndex}"][data-column-key="${nextColumnKey}"]`
        ) as HTMLElement;
        
        if (nextCell) {
          nextCell.focus();
          // For text inputs, select the content
          if (nextCell instanceof HTMLInputElement) {
            nextCell.select();
          }
          // For buttons (like SelectTrigger), also trigger click to open
          if (nextCell instanceof HTMLButtonElement && nextCell.getAttribute('role') === 'combobox') {
            nextCell.click();
          }
        }
      }, 150);
    }
  };

  const renderCell = (row: T, column: GenericColumn<T>, rowIndex: number) => {
    const value = row[column.key];

    // Link type (not editable, clickable)
    if (column.type === 'link') {
      // Check if this column should be excluded from tab order
      const isReference = column.key.toLowerCase() === 'reference' ||
                         column.label.toLowerCase() === 'reference';
      
      return (
        <td key={column.key} className="px-2 py-1">
          <button
            onClick={() => column.onLinkClick?.(row)}
            data-row-index={rowIndex}
            data-column-key={column.key}
            onFocus={() => setActiveRowId(row[idField])}
            onKeyDown={(e) => {
              // Allow tab navigation if editable and not excluded
              if (column.editable && !isReference) {
                handleSequentialTabNavigation(e, rowIndex, column.key);
              }
            }}
            className={
              column.isAmount
                ? "font-['Roboto_Mono'] text-[12px] text-[#446BF9] hover:underline cursor-pointer bg-transparent border-0 p-0 truncate block w-full text-right tracking-[0] font-semibold focus:outline-none focus:ring-2 focus:ring-[#446BF9]"
                : "font-['Inter'] text-[12px] text-[#446BF9] hover:underline cursor-pointer bg-transparent border-0 p-0 truncate block tracking-[0] font-bold focus:outline-none focus:ring-2 focus:ring-[#446BF9]"
            }
          >
            {value || column.emptyLabel || '—'}
          </button>
        </td>
      );
    }

    // Readonly type (not editable)
    if (column.type === 'readonly' || !column.editable) {
      return (
        <td key={column.key} className="px-2 py-1">
          <span className="font-[Roboto_Mono] text-[12px] text-[#000] truncate block tracking-[0] text-right">
            {value || '—'}
          </span>
        </td>
      );
    }

    // Checkbox type
    if (column.type === 'checkbox') {
      // Exclude "Item Line No" from tab order
      const isItemLineNo = column.key.toLowerCase().includes('itemlineno') || 
                           column.key.toLowerCase().includes('item_line_no') ||
                           column.label.toLowerCase().includes('item line no');
      const checkboxTabIndex = isItemLineNo ? -1 : undefined;
      
      return (
        <td key={column.key} className="px-2 py-1">
          <Checkbox
            checked={value === true || value === 'true'}
            onCheckedChange={(checked) => handleCellChange(row[idField], column.key, checked)}
            data-row-index={rowIndex}
            data-column-key={column.key}
            tabIndex={checkboxTabIndex}
            className="cursor-pointer border-[#d1d5db] data-[state=checked]:bg-[#446BF9] data-[state=checked]:border-[#446BF9]"
          />
        </td>
      );
    }

    // Select type
    if (column.type === 'select' && column.options) {
      // Check if this is the 'article' column to set specific tabIndex
      const isArticleColumn = column.key.toLowerCase() === 'article' || column.label.toLowerCase() === 'article';
      // Exclude "Item Line No" from tab order
      const isItemLineNo = column.key.toLowerCase().includes('itemlineno') || 
                           column.key.toLowerCase().includes('item_line_no') ||
                           column.label.toLowerCase().includes('item line no');
      
      let tabIndexValue: number | undefined = undefined;
      if (isItemLineNo) {
        tabIndexValue = -1;
      } else if (isArticleColumn && rowIndex === 0) {
        tabIndexValue = 23;
      }
      
      return (
        <td key={column.key} className="px-2 py-1 relative">
          <SearchableSelect
            value={value || ''}
            onValueChange={(newValue) => handleCellChange(row[idField], column.key, newValue)}
            options={column.options}
            placeholder="Select"
            data-row-index={rowIndex}
            data-column-key={column.key}
            tabIndex={tabIndexValue}
            onKeyDown={(e) => handleSequentialTabNavigation(e, rowIndex, column.key)}
            onSelectComplete={() => focusNextCell(rowIndex, column.key)}
            enableAddNew={column.enableAddNew}
            onAddNew={column.onAddNew}
            triggerClassName={`w-full h-auto border-0 border-b border-b-black rounded-none px-0 pb-0.5 pr-[20px] font-['Inter'] text-[12px] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-b-[#446BF9] cursor-pointer bg-transparent tracking-[0] ${value === '' ? 'text-[#999]' : 'text-[#000]'} [&>svg]:hidden gap-0 leading-none`}
            contentClassName="font-['Inter'] text-[12px] rounded-none border border-[#e5e5e5] [&>div]:p-0"
            itemClassName="cursor-pointer font-['Inter'] text-[12px] tracking-[0] rounded-none px-3 py-2 m-0 data-[highlighted]:bg-[#f5f5f5] data-[state=checked]:bg-[#DFE5EB] data-[state=checked]:data-[highlighted]:bg-[#CDD6E0] data-[state=checked]:text-[#003160]"
          />
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-[#999] pointer-events-none" strokeWidth={2} />
        </td>
      );
    }

    // Number type
    if (column.type === 'number') {
      // Exclude "Item Line No" from tab order
      const isItemLineNo = column.key.toLowerCase().includes('itemlineno') || 
                           column.key.toLowerCase().includes('item_line_no') ||
                           column.label.toLowerCase().includes('item line no');
      const numberTabIndex = isItemLineNo ? -1 : undefined;
      
      return (
        <td key={column.key} className="px-2 py-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => {
              // Only allow numbers and decimal point
              const newValue = e.target.value.replace(/[^\d.]/g, '');
              handleCellChange(row[idField], column.key, newValue);
            }}
            onFocus={(e) => {
              setActiveRowId(row[idField]);
              e.target.select();
            }}
            onKeyDown={(e) => handleSequentialTabNavigation(e, rowIndex, column.key)}
            data-row-index={rowIndex}
            data-column-key={column.key}
            tabIndex={numberTabIndex}
            placeholder="0.00"
            className="w-full border-0 border-b border-b-black px-0 py-1 font-['Roboto_Mono'] text-[12px] text-[#000] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer truncate selection:bg-[#DFE5EB] selection:text-[#000] text-right tracking-[0] placeholder:text-[#999]"
          />
        </td>
      );
    }

    // Date type
    if (column.type === 'date') {
      const datePickerKey = `${row[idField]}-${column.key}`;
      const dateValue = value ? new Date(value) : undefined;
      
      // Format date for display
      const formatDateValue = (val: string) => {
        if (!val) return '';
        try {
          const date = new Date(val);
          return format(date, 'MM/dd/yyyy');
        } catch {
          return val;
        }
      };

      // Validate and format date input
      const handleDateInputChange = (inputValue: string) => {
        // Allow only numbers and slashes
        const filtered = inputValue.replace(/[^\d/]/g, '');
        handleCellChange(row[idField], column.key, filtered);
      };
      
      return (
        <td key={column.key} className="px-2 py-1">
          <Popover 
            open={openDatePickers[datePickerKey] || false} 
            onOpenChange={(open) => {
              setOpenDatePickers(prev => ({ ...prev, [datePickerKey]: open }));
            }}
          >
            <div className="relative flex items-center border-b border-b-black focus-within:border-b-[#446BF9]">
              <input
                type="text"
                value={formatDateValue(value) || ''}
                onChange={(e) => handleDateInputChange(e.target.value)}
                onFocus={(e) => {
                  setActiveRowId(row[idField]);
                  e.target.select();
                }}
                data-row-index={rowIndex}
                data-column-key={column.key}
                placeholder="Select Date"
                className="w-full border-0 px-0 py-1 pr-[24px] font-[Inter] text-[12px] text-[#000] focus:outline-none cursor-pointer truncate selection:bg-[#DFE5EB] selection:text-[#000] tracking-[0] text-left placeholder:text-[#999] bg-transparent"
              />
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="absolute right-0 p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center group"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenDatePickers(prev => ({ ...prev, [datePickerKey]: true }));
                    }
                  }}
                  tabIndex={-1}
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
                    handleCellChange(row[idField], column.key, date.toISOString());
                    setOpenDatePickers(prev => ({ ...prev, [datePickerKey]: false }));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </td>
      );
    }

    // Default text type - check if this column should be a date picker
    const isDateColumn = column.label === 'Date' || column.key.toLowerCase().includes('date');
    
    if (isDateColumn) {
      const datePickerKey = `${row[idField]}-${column.key}`;
    }
    
    return (
      <td key={column.key} className="px-2 py-1">
        <div className="relative flex items-center">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => {
              handleCellChange(row[idField], column.key, e.target.value);
            }}
            onFocus={(e) => {
              setActiveRowId(row[idField]);
              e.target.select();
            }}
            onKeyDown={enableTabNavigation ? (e) => handleSequentialTabNavigation(e, rowIndex, column.key) : undefined}
            data-row-index={rowIndex}
            data-column-key={column.key}
            placeholder=""
            className="w-full border-0 border-b border-b-black px-0 py-1 font-['Inter'] text-[12px] text-[#000] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer truncate selection:bg-[#DFE5EB] selection:text-[#000] tracking-[0] placeholder:text-[#999]"
          />
        </div>
      </td>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div 
        className="overflow-auto h-fit pb-[10px]"
        onClick={(e) => {
          // Close any open edit menus when clicking in the table
          const target = e.target as HTMLElement;
          if (!target.closest('[data-slot="popover-content"]') && !target.closest('button[title="Actions"]')) {
            // Clicking outside popover - ensure focus is not trapped
            if (document.activeElement instanceof HTMLElement && 
                document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'BUTTON') {
              document.activeElement.blur();
            }
          }
        }}
      >
        <table className="w-full border-collapse">
          <thead>
            {/* Orange number row */}
            <tr className="bg-white">
              {columns.filter(col => visibleColumns.has(col.key)).map(column => (
                <th
                  key={`number-${column.key}`}
                  className={`px-2 pt-2 pb-0 text-left font-['Inter'] text-[10px] font-bold text-[#ff8f00] uppercase tracking-[0.7px] whitespace-nowrap bg-white sticky top-0 z-10 align-top ${column.minWidth ? `min-w-[${column.minWidth}]` : 'min-w-[80px]'}`}
                >
                  {column.numberPrefix || ''}
                </th>
              ))}
              {/* Action column header (empty for orange number row) */}
              <th className="px-2 pt-2 pb-0 bg-white sticky top-0 z-10 w-[50px]"></th>
              {enableColumnChooser && (
                <th className="px-2 pt-2 pb-0 bg-white sticky top-0 right-0 z-20 w-[50px]"></th>
              )}
            </tr>
            <tr className="border-b border-[#e5e5e5]">
              {columns.filter(col => visibleColumns.has(col.key)).map(column => {
                const isEditable = column.editable !== false;
                
                if (!isEditable) {
                  return (
                    <th
                      key={column.key}
                      className={`px-2 py-2 text-left font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] whitespace-nowrap bg-white sticky top-0 z-10 align-top ${column.minWidth ? `min-w-[${column.minWidth}]` : 'min-w-[80px]'}`}
                    >
                      {column.sortable !== false && enableSorting ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-1 p-0 border-0 bg-transparent cursor-pointer"
                        >
                          <span className="uppercase">{column.label}</span>
                          {sortColumn === column.key && (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="size-3 text-[#446BF9]" strokeWidth={2} />
                            ) : (
                              <ArrowDown className="size-3 text-[#446BF9]" strokeWidth={2} />
                            )
                          )}
                        </button>
                      ) : (
                        <span>{column.label}</span>
                      )}
                    </th>
                  );
                }

                return (
                  <EditableHeader
                    key={column.key}
                    field={column.key}
                    isHovered={hoveredColumn === column.key}
                    onHover={setHoveredColumn}
                    onEditAll={handleEditAll}
                    onClear={handleClear}
                    onSort={column.sortable !== false && enableSorting ? handleSort : undefined}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    className={`px-2 py-2 text-left font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] whitespace-nowrap bg-white sticky top-0 z-10 ${column.minWidth ? `min-w-[${column.minWidth}]` : 'min-w-[80px]'}`}
                    isIconToggled={enableTabNavigation ? toggledIcons.has(column.key) : undefined}
                    onToggleIcon={enableTabNavigation ? handleToggleIcon : undefined}
                    isEditMenuOpen={openEditMenu === column.key}
                    onToggleEditMenu={handleToggleEditMenu}
                    columnOptions={column.options}
                  >
                    {column.label}
                  </EditableHeader>
                );
              })}
              {/* Action column header */}
              <th className="px-2 py-2 text-center font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] whitespace-nowrap bg-white sticky top-0 z-10 w-[50px]">
                {/* Empty header for actions */}
              </th>
              {enableColumnChooser && (
                <th className="px-2 py-2 text-center font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] whitespace-nowrap bg-white sticky top-0 right-0 z-20 w-[50px] relative">
                  <div className="absolute top-0 bottom-0 right-full w-[10px] pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1))' }}></div>
                  <button
                    onClick={() => setColumnChooserOpen(true)}
                    className="p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center group mx-auto relative z-10"
                    title="Column Chooser"
                  >
                    <Columns3 className="h-[20px] w-[20px] text-[#446BF9] group-hover:text-[#3558d4] transition-colors" strokeWidth={2} />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => {
              const isActive = row[idField] === activeRowId;
              return (
                <tr 
                  key={row[idField]} 
                  className={`border-b border-[#e5e5e5] cursor-pointer transition-colors ${
                    isActive ? 'bg-[#DFE5EB]' : 'hover:bg-[#f9f9f9]'
                  }`}
                  style={{ height: rowHeight }}
                >
                  {columns
                    .filter(col => visibleColumns.has(col.key))
                    .map(column => renderCell(row, column, rowIndex))}
                  {/* Action column (Add/Delete) */}
                  <td className="px-2 py-1 text-center bg-white border-b border-[#e5e5e5]\" style={{ width: '60px' }}>
                    {rowIndex === data.length - 1 ? (
                      <div className="flex items-center justify-end gap-2 w-[40px] ml-auto">
                        <button
                          onClick={() => handleAddRow(row[idField])}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleAddRow(row[idField]);
                            }
                          }}
                          className="w-4 h-4 flex items-center justify-center border-0 bg-transparent cursor-pointer group flex-shrink-0"
                          title="Add row below"
                        >
                          <CirclePlus className="h-[16px] w-[16px] text-[#446BF9] group-hover:text-[#3558d4] transition-colors" strokeWidth={2} />
                        </button>
                        {data.length > 1 && (
                          <button
                            onClick={() => handleDeleteRow(row[idField])}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleDeleteRow(row[idField]);
                              }
                            }}
                            className="w-4 h-4 flex items-center justify-center border-0 bg-transparent cursor-pointer group flex-shrink-0"
                            title="Delete row"
                          >
                            <Trash2 className="h-[16px] w-[16px] text-[#D0021B] group-hover:text-[#a00116] transition-colors" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 w-[40px] ml-auto">
                        <div className="w-4 h-4 flex-shrink-0"></div>
                        <button
                          onClick={() => handleDeleteRow(row[idField])}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleDeleteRow(row[idField]);
                            }
                          }}
                          className="w-4 h-4 flex items-center justify-center border-0 bg-transparent cursor-pointer group flex-shrink-0"
                          title="Delete row"
                        >
                          <Trash2 className="h-[16px] w-[16px] text-[#D0021B] group-hover:text-[#a00116] transition-colors" strokeWidth={2} />
                        </button>
                      </div>
                    )}
                  </td>
                  {enableColumnChooser && (
                    <td className="px-2 py-1 text-center bg-white sticky right-0 z-10 relative border-b border-[#e5e5e5]">
                      <div className="absolute top-0 bottom-0 right-full w-[10px] pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1))' }}></div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center group mx-auto relative z-10"
                            title="Actions"
                          >
                            <MoreVertical className="h-[16px] w-[16px] text-[#767676] group-hover:text-[#446BF9] transition-colors" strokeWidth={2} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent 
                          align="end" 
                          className="w-[200px] p-0 font-['Inter'] text-[12px] rounded-[4px] border border-[#e5e5e5]"
                        >
                          <div className="flex flex-col">
                            <button
                              onClick={() => {
                                // TODO: Implement duplicate row functionality
                                console.log('Duplicate row', row[idField]);
                              }}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer border-0 bg-transparent text-left transition-colors"
                            >
                              <CirclePlus className="h-[14px] w-[14px] text-[#767676]" strokeWidth={2} />
                              <span className="font-['Inter'] text-[12px] text-[#000] tracking-[0]">Duplicate row</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this row?`)) {
                                  handleDeleteRow(row[idField]);
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer border-0 bg-transparent text-left transition-colors"
                            >
                              <Trash2 className="h-[14px] w-[14px] text-[#D0021B]" strokeWidth={2} />
                              <span className="font-['Inter'] text-[12px] text-[#000] tracking-[0]">Remove</span>
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement export row functionality
                                console.log('Export row(s)', row[idField]);
                              }}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] cursor-pointer border-0 bg-transparent text-left transition-colors"
                            >
                              <MoveRight className="h-[14px] w-[14px] text-[#767676]" strokeWidth={2} />
                              <span className="font-['Inter'] text-[12px] text-[#000] tracking-[0]">Export row(s)</span>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Simple Column Chooser Modal */}
      {enableColumnChooser && columnChooserOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setColumnChooserOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-['Inter'] font-bold text-[16px] mb-4 tracking-[0]">Show/Hide Columns</h3>
            <div className="space-y-2">
              {columns.map(column => (
                <label key={column.key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={visibleColumns.has(column.key)}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                    className="cursor-pointer border-[#d1d5db] data-[state=checked]:bg-[#446BF9] data-[state=checked]:border-[#446BF9]"
                  />
                  <span className="font-['Inter'] text-[12px] tracking-[0]">{column.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setColumnChooserOpen(false)}
                className="px-4 py-2 bg-[#446BF9] text-white rounded cursor-pointer font-['Inter'] text-[12px] tracking-[0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}