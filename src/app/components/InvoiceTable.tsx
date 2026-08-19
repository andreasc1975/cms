import { useState } from 'react';
import { CirclePlus, Trash2, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { CustomDropdown } from './CustomDropdown';

export interface InvoiceRow {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  currency: string;
  totalAmount: string;
  grossWeight: string;
  netWeight: string;
  noOfParcels: string;
}

interface InvoiceTableProps {
  invoices: InvoiceRow[];
  onChange: (invoices: InvoiceRow[]) => void;
  currencies?: string[];
  tabIndexStart?: number;
  title?: string;
}

const DEFAULT_CURRENCIES = ['NOK', 'EUR', 'USD', 'GBP', 'SEK', 'DKK'];

export function InvoiceTable({ 
  invoices, 
  onChange, 
  currencies = DEFAULT_CURRENCIES,
  tabIndexStart = 60,
  title = 'INVOICE/S'
}: InvoiceTableProps) {
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [openDatePickerId, setOpenDatePickerId] = useState<string | null>(null);

  const parseNumber = (str: string) => {
    // Remove spaces and commas (thousand separators) — dot stays as the decimal
    // separator, matching the format used everywhere else in the app (TopBar,
    // DataTable, GenericEditableTable).
    return parseFloat(str.replace(/\s/g, '').replace(/,/g, '')) || 0;
  };

  const formatNumber = (value: string | number, decimals: number = 2): string => {
    const num = typeof value === 'string' ? parseNumber(value) : value;
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatInputOnBlur = (value: string): string => {
    if (!value || value.trim() === '') return '';
    const num = parseNumber(value);
    return formatNumber(num, 2);
  };

  const handleInvoiceChange = (id: string, field: keyof InvoiceRow, value: string) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === id ? { ...inv, [field]: value } : inv
    );
    onChange(updatedInvoices);
  };

  const handleAddInvoice = () => {
    const newInvoiceId = Date.now().toString();
    const newInvoices = [
      ...invoices,
      {
        id: newInvoiceId,
        invoiceNo: '',
        invoiceDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
        currency: currencies[0],
        totalAmount: '',
        grossWeight: '',
        netWeight: '',
        noOfParcels: ''
      }
    ];
    onChange(newInvoices);

    // Focus on Invoice No of the new row
    setTimeout(() => {
      const invoiceNoInput = document.querySelector(
        `input[data-row-id="${newInvoiceId}"][data-field="invoiceNo"]`
      ) as HTMLInputElement;
      if (invoiceNoInput) {
        invoiceNoInput.focus();
        invoiceNoInput.select();
      }
    }, 0);
  };

  const handleDeleteInvoice = (id: string) => {
    if (invoices.length > 1) {
      const filteredInvoices = invoices.filter(inv => inv.id !== id);
      onChange(filteredInvoices);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-[8px]">
        <label className="font-['Inter'] text-[14px] text-[#003160] font-semibold uppercase">
          {title}
        </label>
      </div>

      <div className="w-full border border-[#e5e5e5] rounded-[2px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#e5e5e5]">
              <th className="px-2 py-2 text-left font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[16%]">INVOICE NO</th>
              <th className="px-2 py-2 text-left font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[12%]">DATE</th>
              <th className="px-2 py-2 text-left font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[10%]">CURRENCY</th>
              <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[14%]">TOTAL AMOUNT</th>
              <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[14%]">GROSS WEIGHT</th>
              <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[14%]">NET WEIGHT</th>
              <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[12%]">NO OF PARCELS</th>
              <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[8%]">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => {
              const baseTabIndex = tabIndexStart + (index * 10);
              const isActiveInvoice = activeInvoiceId === invoice.id;
              return (
                <tr 
                  key={invoice.id} 
                  className={`border-b border-[#e5e5e5] transition-colors ${
                    isActiveInvoice ? 'bg-[#DFE5EB]' : 'hover:bg-[#f9f9f9]'
                  }`} 
                  style={{ height: '40px' }}
                >
                  {/* Invoice No */}
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={invoice.invoiceNo}
                      onChange={(e) => handleInvoiceChange(invoice.id, 'invoiceNo', e.target.value)}
                      onFocus={(e) => {
                        setActiveInvoiceId(invoice.id);
                        e.target.select();
                      }}
                      placeholder="Add"
                      tabIndex={baseTabIndex}
                      className="w-full border-0 border-b border-b-black px-0 py-1 font-['Inter'] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer truncate selection:bg-[#446BF9] selection:text-[#ffffff] tracking-[0] text-[#000] placeholder:text-[#999] bg-transparent"
                      data-row-id={invoice.id}
                      data-field="invoiceNo"
                    />
                  </td>
                  {/* Date */}
                  <td className="px-2 py-1">
                    <Popover 
                      open={openDatePickerId === invoice.id} 
                      onOpenChange={(open) => setOpenDatePickerId(open ? invoice.id : null)}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={invoice.invoiceDate}
                          onChange={(e) => {
                            const filtered = e.target.value.replace(/[^\d./]/g, '');
                            handleInvoiceChange(invoice.id, 'invoiceDate', filtered);
                          }}
                          onFocus={(e) => {
                            setActiveInvoiceId(invoice.id);
                            e.target.select();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setOpenDatePickerId(invoice.id);
                            }
                          }}
                          placeholder="DD/MM/YYYY"
                          tabIndex={baseTabIndex + 1}
                          className="w-full pr-6 border-0 border-b border-b-black px-0 py-1 font-['Inter'] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer truncate selection:bg-[#446BF9] selection:text-[#ffffff] tracking-[0] text-[#000] placeholder:text-[#999] bg-transparent"
                        />
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setOpenDatePickerId(invoice.id)}
                            onFocus={() => setActiveInvoiceId(invoice.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setOpenDatePickerId(invoice.id);
                              }
                            }}
                            tabIndex={baseTabIndex + 2}
                            className="absolute right-0 p-0.5 hover:bg-gray-100 rounded cursor-pointer transition-colors border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#446BF9]"
                            title="Select date"
                          >
                            <Calendar className="w-3.5 h-3.5 text-[#446BF9]" />
                          </button>
                        </PopoverTrigger>
                      </div>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={(() => {
                            const parts = invoice.invoiceDate.split(/[./]/);
                            if (parts.length === 3) {
                              const day = parseInt(parts[0], 10);
                              const month = parseInt(parts[1], 10) - 1;
                              const year = parseInt(parts[2], 10);
                              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                return new Date(year, month, day);
                              }
                            }
                            return undefined;
                          })()}
                          onSelect={(date) => {
                            if (date) {
                              const formatted = date.toLocaleDateString('en-GB').replace(/\//g, '.');
                              handleInvoiceChange(invoice.id, 'invoiceDate', formatted);
                              setOpenDatePickerId(null);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </td>
                  {/* Currency */}
                  <td className="px-2 py-1">
                    <CustomDropdown
                      value={invoice.currency}
                      options={currencies}
                      onChange={(value) => handleInvoiceChange(invoice.id, 'currency', value)}
                      tabIndex={baseTabIndex + 3}
                      isInlineTable={true}
                      onFocus={() => setActiveInvoiceId(invoice.id)}
                    />
                  </td>
                  {/* Total Amount */}
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={invoice.totalAmount}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^\d.]/g, '');
                        handleInvoiceChange(invoice.id, 'totalAmount', filtered);
                      }}
                      onBlur={(e) => {
                        const formatted = formatInputOnBlur(e.target.value);
                        handleInvoiceChange(invoice.id, 'totalAmount', formatted);
                      }}
                      onFocus={(e) => {
                        setActiveInvoiceId(invoice.id);
                        e.target.select();
                      }}
                      placeholder="0.00"
                      tabIndex={baseTabIndex + 4}
                      className="w-full border-0 border-b border-b-black px-0 py-1 font-['Roboto_Mono'] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer text-right selection:bg-[#446BF9] selection:text-[#ffffff] tracking-[0] text-[#000] placeholder:text-[#999] bg-transparent"
                    />
                  </td>
                  {/* Gross Weight */}
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={invoice.grossWeight}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^\d.]/g, '');
                        handleInvoiceChange(invoice.id, 'grossWeight', filtered);
                      }}
                      onBlur={(e) => {
                        const formatted = formatInputOnBlur(e.target.value);
                        handleInvoiceChange(invoice.id, 'grossWeight', formatted);
                      }}
                      onFocus={(e) => {
                        setActiveInvoiceId(invoice.id);
                        e.target.select();
                      }}
                      placeholder="0.00"
                      tabIndex={baseTabIndex + 5}
                      className="w-full border-0 border-b border-b-black px-0 py-1 font-['Roboto_Mono'] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer text-right selection:bg-[#446BF9] selection:text-[#ffffff] tracking-[0] text-[#000] placeholder:text-[#999] bg-transparent"
                    />
                  </td>
                  {/* Net Weight */}
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={invoice.netWeight}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^\d.]/g, '');
                        handleInvoiceChange(invoice.id, 'netWeight', filtered);
                      }}
                      onBlur={(e) => {
                        const formatted = formatInputOnBlur(e.target.value);
                        handleInvoiceChange(invoice.id, 'netWeight', formatted);
                      }}
                      onFocus={(e) => {
                        setActiveInvoiceId(invoice.id);
                        e.target.select();
                      }}
                      placeholder="0.00"
                      tabIndex={baseTabIndex + 6}
                      className="w-full border-0 border-b border-b-black px-0 py-1 font-['Roboto_Mono'] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer text-right selection:bg-[#446BF9] selection:text-[#ffffff] tracking-[0] text-[#000] placeholder:text-[#999] bg-transparent"
                    />
                  </td>
                  {/* No of Parcels */}
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={invoice.noOfParcels}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^\d]/g, '');
                        handleInvoiceChange(invoice.id, 'noOfParcels', filtered);
                      }}
                      onFocus={(e) => {
                        setActiveInvoiceId(invoice.id);
                        e.target.select();
                      }}
                      placeholder="0"
                      tabIndex={baseTabIndex + 7}
                      className="w-full border-0 border-b border-b-black px-0 py-1 font-['Roboto_Mono'] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer text-right selection:bg-[#446BF9] selection:text-[#ffffff] tracking-[0] text-[#000] placeholder:text-[#999] bg-transparent"
                    />
                  </td>
                  {/* Actions */}
                  <td className="pr-2 py-1">
                    <div className="flex items-center justify-end gap-2 w-[56px] ml-auto">
                      {index === invoices.length - 1 ? (
                        <>
                          <button
                            onClick={handleAddInvoice}
                            onFocus={() => setActiveInvoiceId(invoice.id)}
                            tabIndex={baseTabIndex + 8}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded cursor-pointer border-0 bg-transparent transition-colors flex-shrink-0"
                            title="Add invoice"
                          >
                            <CirclePlus className="w-4 h-4 text-[#446BF9]" strokeWidth={2} />
                          </button>
                          {invoices.length > 1 && (
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              onFocus={() => setActiveInvoiceId(invoice.id)}
                              tabIndex={baseTabIndex + 9}
                              className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded cursor-pointer border-0 bg-transparent transition-colors flex-shrink-0"
                              title="Delete invoice"
                            >
                              <Trash2 className="w-4 h-4 text-[#E63946]" strokeWidth={2} />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 flex-shrink-0"></div>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            onFocus={() => setActiveInvoiceId(invoice.id)}
                            tabIndex={baseTabIndex + 8}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded cursor-pointer border-0 bg-transparent transition-colors flex-shrink-0"
                            title="Delete invoice"
                          >
                            <Trash2 className="w-4 h-4 text-[#E63946]" strokeWidth={2} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}