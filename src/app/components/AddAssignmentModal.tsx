import { useState, useRef, useEffect } from 'react';
import type { TableRowData } from './TableRow';
import { X, CirclePlus, Trash2, CircleHelp, Calendar, ChevronDown, Pencil, TriangleAlert } from 'lucide-react';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { CustomDropdown, type CustomDropdownRef, type BrregCompany } from './CustomDropdown';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { ConfirmationDialog } from './ConfirmationDialog';
import { OrganizationDetailModal } from './OrganizationDetailModal';
import { InvoiceTable, type InvoiceRow } from './InvoiceTable';
import { CreateOrganizationModal, type OrganizationFormData, countryNameFromCode } from './CreateOrganizationModal';
import { fetchAddresses, createAddress, seedAddressesIfEmpty, type AddressEntry } from '../lib/addressesApi';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAssignment: Omit<TableRowData, 'id'>) => string;
  onNavigateToDetail?: (declarationNo: string) => void;
  editingRecord?: TableRowData | null;
  onUpdate?: (id: string, assignment: Omit<TableRowData, 'id'>) => string;
}

// Company database with addresses — same shape the rest of this file already
// works with; populated from Supabase's `addresses` table (see addressesApi),
// not hardcoded, so foreign entries can be managed centrally.
interface CompanyData {
  name: string;
  address: string;
  verified?: boolean; // Whether the address is verified
  orgName?: string; // Organization name
  orgNo?: string; // Organization number
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

function addressEntryToCompanyData(entry: AddressEntry): CompanyData {
  return {
    name: entry.name,
    address: entry.address,
    verified: entry.verified,
    orgName: entry.associatedOrganization || entry.name,
    orgNo: entry.orgNo || undefined,
    city: entry.city,
    state: entry.state,
    postcode: entry.postCode,
    country: entry.country
  };
}

// EU member states (excluding Norway, which is EEA but not EU) — used to
// classify a declaration as "EU" trade when Norway trades with one of these,
// as opposed to "Export"/"Import" for trade with the rest of the world.
const EU_COUNTRIES = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
  'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'
]);

/**
 * Automatically classifies a declaration's direction based on the Consignor
 * and Consignee countries — replaces the old manual Import/Export picker.
 *   - Norway -> EU country (or vice versa)      => 'EU'
 *   - Norway -> anywhere else (or vice versa)    => 'EX' (outbound) / 'IM' (inbound)
 *   - Neither side is Norway, or both are        => can't classify (null)
 */
function classifyDeclarationDirection(consignorCountry: string | undefined, consigneeCountry: string | undefined): { declarationType: 'EX' | 'IM' | 'EU'; typeBadge: 'E' | 'C' } | null {
  const NORWAY = 'Norway';
  const consignorIsNorway = consignorCountry === NORWAY;
  const consigneeIsNorway = consigneeCountry === NORWAY;

  if (consignorIsNorway && !consigneeIsNorway) {
    // Outbound from Norway
    return { declarationType: consigneeCountry && EU_COUNTRIES.has(consigneeCountry) ? 'EU' : 'EX', typeBadge: 'E' };
  }
  if (consigneeIsNorway && !consignorIsNorway) {
    // Inbound to Norway
    return { declarationType: consignorCountry && EU_COUNTRIES.has(consignorCountry) ? 'EU' : 'IM', typeBadge: 'C' };
  }
  return null; // both Norway, both foreign, or unknown — nothing sensible to classify
}

/** Looks up a selected company's country by name; Brreg-verified companies
 * (not in the local address book) are always Norwegian, since Brreg only
 * covers Norwegian entities. */
function getCompanyCountry(companies: CompanyData[], name: string): string | undefined {
  if (!name) return undefined;
  const match = companies.find((c) => c.name === name);
  return match?.country ?? 'Norway';
}

const CURRENCIES = ['NOK', 'EUR', 'USD', 'GBP', 'SEK', 'DKK'];
const MESSAGE_DECLARATION_TYPE_OPTIONS = [
  'FU - Complete',
  'KO - Correction',
  'MA - Manual',
  'FO - Temporary',
  'EN - Final',
  'EB - Recalculation',
  'RE - Refund RE',
  'SO - Consolidated Customs Clearance'
];
const MANAGED_BY_OPTIONS = [
  'Andreas Karlsson',
  'Marit Sætran Krog',
  'Hanne Askestad',
  'Kari Johansen',
  'Ola Nordmann',
  'Ingrid Haugen',
  'Erik Solberg',
  'Anne Larsen',
  'Per Kristiansen',
  'Silje Bakke'
];
const CUSTOMS_UNITS = [
  'Mariesch-P6-Sky',
  'Oslo-Central',
  'Bergen-Port',
  'Stavanger-Unit',
  'Trondheim-Central',
  'Kristiansand-Port',
  'Tromsø-Unit',
  'Ålesund-Port',
  'Drammen-Central',
  'Fredrikstad-Unit'
];

// Historical exchange rate table (mirrors Norges Bank's currency rate list:
// Valuta / Valutakode / F.o.m dato / T.o.m dato / Myntenhet / NOK). Used to
// populate the "pick a historical rate" dropdown next to the Rate field.
interface CurrencyRatePeriod {
  fromDate: string;
  toDate: string;
  unit: number;
  rate: number;
}

const CURRENCY_RATE_HISTORY: Record<string, CurrencyRatePeriod[]> = {
  EUR: [
    { fromDate: '10.08.2026', toDate: '16.08.2026', unit: 1, rate: 10.992 },
    { fromDate: '03.08.2026', toDate: '09.08.2026', unit: 1, rate: 10.965 },
    { fromDate: '27.07.2026', toDate: '02.08.2026', unit: 1, rate: 10.940 },
    { fromDate: '20.07.2026', toDate: '26.07.2026', unit: 1, rate: 10.918 },
    { fromDate: '13.07.2026', toDate: '19.07.2026', unit: 1, rate: 10.895 },
    { fromDate: '06.07.2026', toDate: '12.07.2026', unit: 1, rate: 10.872 },
    { fromDate: '29.06.2026', toDate: '05.07.2026', unit: 1, rate: 10.850 },
    { fromDate: '22.06.2026', toDate: '28.06.2026', unit: 1, rate: 10.831 },
    { fromDate: '15.06.2026', toDate: '21.06.2026', unit: 1, rate: 10.809 },
    { fromDate: '08.06.2026', toDate: '14.06.2026', unit: 1, rate: 10.788 }
  ],
  USD: [
    { fromDate: '10.08.2026', toDate: '16.08.2026', unit: 1, rate: 9.845 },
    { fromDate: '03.08.2026', toDate: '09.08.2026', unit: 1, rate: 9.812 },
    { fromDate: '27.07.2026', toDate: '02.08.2026', unit: 1, rate: 9.780 },
    { fromDate: '20.07.2026', toDate: '26.07.2026', unit: 1, rate: 9.756 },
    { fromDate: '13.07.2026', toDate: '19.07.2026', unit: 1, rate: 9.730 },
    { fromDate: '06.07.2026', toDate: '12.07.2026', unit: 1, rate: 9.705 },
    { fromDate: '29.06.2026', toDate: '05.07.2026', unit: 1, rate: 9.682 },
    { fromDate: '22.06.2026', toDate: '28.06.2026', unit: 1, rate: 9.660 },
    { fromDate: '15.06.2026', toDate: '21.06.2026', unit: 1, rate: 9.635 },
    { fromDate: '08.06.2026', toDate: '14.06.2026', unit: 1, rate: 9.610 }
  ],
  GBP: [
    { fromDate: '10.08.2026', toDate: '16.08.2026', unit: 1, rate: 12.734 },
    { fromDate: '03.08.2026', toDate: '09.08.2026', unit: 1, rate: 12.698 },
    { fromDate: '27.07.2026', toDate: '02.08.2026', unit: 1, rate: 12.671 },
    { fromDate: '20.07.2026', toDate: '26.07.2026', unit: 1, rate: 12.648 },
    { fromDate: '13.07.2026', toDate: '19.07.2026', unit: 1, rate: 12.622 },
    { fromDate: '06.07.2026', toDate: '12.07.2026', unit: 1, rate: 12.599 },
    { fromDate: '29.06.2026', toDate: '05.07.2026', unit: 1, rate: 12.575 },
    { fromDate: '22.06.2026', toDate: '28.06.2026', unit: 1, rate: 12.552 },
    { fromDate: '15.06.2026', toDate: '21.06.2026', unit: 1, rate: 12.528 },
    { fromDate: '08.06.2026', toDate: '14.06.2026', unit: 1, rate: 12.505 }
  ],
  SEK: [
    { fromDate: '10.08.2026', toDate: '16.08.2026', unit: 10, rate: 9.611 },
    { fromDate: '03.08.2026', toDate: '09.08.2026', unit: 10, rate: 9.598 },
    { fromDate: '27.07.2026', toDate: '02.08.2026', unit: 10, rate: 9.585 },
    { fromDate: '20.07.2026', toDate: '26.07.2026', unit: 10, rate: 9.572 },
    { fromDate: '13.07.2026', toDate: '19.07.2026', unit: 10, rate: 9.559 },
    { fromDate: '06.07.2026', toDate: '12.07.2026', unit: 10, rate: 9.546 },
    { fromDate: '29.06.2026', toDate: '05.07.2026', unit: 10, rate: 9.533 },
    { fromDate: '22.06.2026', toDate: '28.06.2026', unit: 10, rate: 9.520 },
    { fromDate: '15.06.2026', toDate: '21.06.2026', unit: 10, rate: 9.507 },
    { fromDate: '08.06.2026', toDate: '14.06.2026', unit: 10, rate: 9.494 }
  ],
  DKK: [
    { fromDate: '10.08.2026', toDate: '16.08.2026', unit: 1, rate: 1.474 },
    { fromDate: '03.08.2026', toDate: '09.08.2026', unit: 1, rate: 1.471 },
    { fromDate: '27.07.2026', toDate: '02.08.2026', unit: 1, rate: 1.468 },
    { fromDate: '20.07.2026', toDate: '26.07.2026', unit: 1, rate: 1.465 },
    { fromDate: '13.07.2026', toDate: '19.07.2026', unit: 1, rate: 1.462 },
    { fromDate: '06.07.2026', toDate: '12.07.2026', unit: 1, rate: 1.459 },
    { fromDate: '29.06.2026', toDate: '05.07.2026', unit: 1, rate: 1.456 },
    { fromDate: '22.06.2026', toDate: '28.06.2026', unit: 1, rate: 1.453 },
    { fromDate: '15.06.2026', toDate: '21.06.2026', unit: 1, rate: 1.450 },
    { fromDate: '08.06.2026', toDate: '14.06.2026', unit: 1, rate: 1.447 }
  ],
  NOK: [
    { fromDate: '10.08.2026', toDate: '16.08.2026', unit: 1, rate: 1 }
  ]
};

export function AddAssignmentModal({ isOpen, onClose, onSave, onNavigateToDetail, editingRecord, onUpdate }: AddAssignmentModalProps) {
  // Address book — loaded from Supabase (seeded once if empty) instead of a
  // hardcoded array, so it's shared and can grow over time.
  const [companies, setCompanies] = useState<CompanyData[]>([]);

  useEffect(() => {
    let cancelled = false;
    seedAddressesIfEmpty()
      .then((entries) => {
        if (!cancelled) setCompanies(entries.map(addressEntryToCompanyData));
      })
      .catch((err) => console.error('Error loading address book from Supabase:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const companyNames = companies.map((c) => c.name);
  const verifiedCompanies = Object.fromEntries(companies.map((c) => [c.name, c.verified || false]));

  const [formData, setFormData] = useState({
    messageDeclarationType: '',
    managedBy: 'Andreas Karlsson',
    customsClearanceUnit: '',
    declarationDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
    internalReference: '',
    consignorName: '',
    consignorAddress: '',
    consigneeName: '',
    consigneeAddress: ''
  });

  // Import/Export/EU is derived automatically from the Consignor/Consignee
  // countries (see classifyDeclarationDirection) — no manual picker anymore.
  const [autoClassification, setAutoClassification] = useState<{ declarationType: 'EX' | 'IM' | 'EU'; typeBadge: 'E' | 'C' } | null>(null);

  useEffect(() => {
    const consignorCountry = getCompanyCountry(companies, formData.consignorName);
    const consigneeCountry = getCompanyCountry(companies, formData.consigneeName);
    setAutoClassification(classifyDeclarationDirection(consignorCountry, consigneeCountry));
  }, [formData.consignorName, formData.consigneeName, companies]);

  const [invoices, setInvoices] = useState<InvoiceRow[]>([
    {
      id: '1',
      invoiceNo: '',
      invoiceDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      currency: 'NOK',
      totalAmount: '',
      grossWeight: '',
      netWeight: '',
      noOfParcels: ''
    }
  ]);

  const [freightAndCosts, setFreightAndCosts] = useState('');
  const [currencyRate, setCurrencyRate] = useState('1');
  const [rateDropdownOpen, setRateDropdownOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [openDatePickerId, setOpenDatePickerId] = useState<string | null>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrgData, setSelectedOrgData] = useState<CompanyData | null>(null);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [pendingBrregCompany, setPendingBrregCompany] = useState<BrregCompany | null>(null);
  // Which field triggered the Brreg selection — the Create Organization
  // confirmation modal needs this to know whether to fill Consignor or
  // Consignee once the user confirms, instead of always assuming Consignor.
  const [pendingBrregTarget, setPendingBrregTarget] = useState<'consignor' | 'consignee' | null>(null);

  const originalFormDataRef = useRef(formData);
  const originalInvoicesRef = useRef(invoices);
  const originalFreightAndCostsRef = useRef(freightAndCosts);
  const originalCurrencyRateRef = useRef(currencyRate);
  const messageDeclarationTypeRef = useRef<CustomDropdownRef>(null);

  // Load data when editing
  useEffect(() => {
    if (editingRecord && isOpen) {
      // Map the record data to form fields
      const newFormData = {
        messageDeclarationType: editingRecord.messageDeclarationType || '',
        managedBy: editingRecord.managedBy || 'Andreas Karlsson',
        customsClearanceUnit: editingRecord.customsClearanceUnit || '',
        declarationDate: editingRecord.declared,
        internalReference: editingRecord.internalReference || '',
        consignorName: editingRecord.consignorName,
        consignorAddress: editingRecord.sender.address,
        consigneeName: editingRecord.consigneeName,
        consigneeAddress: editingRecord.consignee.address
      };
      
      // Restore the actual itemized invoices if we have them (records saved
      // since invoices/freightAndCosts were persisted); otherwise fall back
      // to synthesizing one row from the aggregate totals (older records).
      const newInvoices: InvoiceRow[] = editingRecord.invoices && editingRecord.invoices.length > 0
        ? editingRecord.invoices
        : [{
            id: '1',
            invoiceNo: editingRecord.invoiceNo,
            invoiceDate: editingRecord.declared,
            currency: editingRecord.currency,
            totalAmount: editingRecord.value,
            grossWeight: editingRecord.grossWeight,
            netWeight: editingRecord.netWeight,
            noOfParcels: editingRecord.noOfParcels || ''
          }];

      setFormData(newFormData);
      setInvoices(newInvoices);
      setFreightAndCosts(editingRecord.freightAndCosts || '');
      setCurrencyRate(editingRecord.currencyRate || '1');
      
      // Update refs for change detection
      originalFormDataRef.current = newFormData;
      originalInvoicesRef.current = newInvoices;
      originalFreightAndCostsRef.current = editingRecord.freightAndCosts || '';
      originalCurrencyRateRef.current = editingRecord.currencyRate || '1';
      setHasChanges(false);
    } else if (!editingRecord && isOpen) {
      // Reset to defaults for create mode
      const defaultFormData = {
        messageDeclarationType: '',
        managedBy: 'Andreas Karlsson',
        customsClearanceUnit: '',
        declarationDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
        internalReference: '',
        consignorName: '',
        consignorAddress: '',
        consigneeName: '',
        consigneeAddress: ''
      };
      
      const defaultInvoices = [{
        id: '1',
        invoiceNo: '',
        invoiceDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
        currency: 'NOK',
        totalAmount: '',
        grossWeight: '',
        netWeight: '',
        noOfParcels: ''
      }];
      
      setFormData(defaultFormData);
      setInvoices(defaultInvoices);
      setFreightAndCosts('');
      
      originalFormDataRef.current = defaultFormData;
      originalInvoicesRef.current = defaultInvoices;
      originalFreightAndCostsRef.current = '';
      setCurrencyRate('1');
      originalCurrencyRateRef.current = '1';
      setHasChanges(false);
    }
  }, [editingRecord, isOpen]);

  // Detect changes
  useEffect(() => {
    const changed = 
      JSON.stringify(formData) !== JSON.stringify(originalFormDataRef.current) ||
      JSON.stringify(invoices) !== JSON.stringify(originalInvoicesRef.current) ||
      freightAndCosts !== originalFreightAndCostsRef.current ||
      currencyRate !== originalCurrencyRateRef.current;
    setHasChanges(changed);
  }, [formData, invoices, freightAndCosts, currencyRate]);
  
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (hasChanges) {
          setShowCloseConfirmation(true);
        } else {
          onClose();
        }
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, hasChanges, onClose]);
  
  if (!isOpen) return null;

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

  // Calculate totals
  const calculateTotals = () => {
    const totalAmount = invoices.reduce((sum, inv) => sum + parseNumber(inv.totalAmount), 0);
    const totalGrossWeight = invoices.reduce((sum, inv) => sum + parseNumber(inv.grossWeight), 0);
    const totalNetWeight = invoices.reduce((sum, inv) => sum + parseNumber(inv.netWeight), 0);
    const totalNoOfParcels = invoices.reduce((sum, inv) => sum + parseNumber(inv.noOfParcels), 0);
    const freightCosts = parseNumber(freightAndCosts);
    // Total Amount is in the invoice's own currency; Freight and Costs is
    // already entered in NOK (per the column label). Convert the amount to
    // NOK using the Rate before subtracting freight, so Total Statistical
    // Value is a real NOK figure rather than mixing two currencies.
    const rate = parseNumber(currencyRate) || 1;
    const totalAmountInNOK = totalAmount * rate;
    const totalMinusFreight = totalAmountInNOK - freightCosts;
    
    return {
      totalAmount: formatNumber(totalAmount),
      totalGrossWeight: formatNumber(totalGrossWeight),
      totalNetWeight: formatNumber(totalNetWeight),
      totalNoOfParcels: totalNoOfParcels.toString(),
      totalMinusFreight: formatNumber(totalMinusFreight)
    };
  };

  const totals = calculateTotals();

  const handleSave = () => {
    // Fallback ('EX'/'E') covers the edge case where direction couldn't be
    // classified yet (e.g. Consignor/Consignee not both selected) — Save is
    // already disabled in that state via isSaveDisabled below, so this only
    // matters as a defensive default, never the normal path.
    const classification = autoClassification ?? { declarationType: 'EX' as const, typeBadge: 'E' as const };
    const assignmentData: Omit<TableRowData, 'id'> = {
      status: editingRecord?.status || 'O',
      typeBadge: classification.typeBadge,
      declarationType: classification.declarationType,
      messageDeclarationType: formData.messageDeclarationType,
      managedBy: formData.managedBy,
      customsClearanceUnit: formData.customsClearanceUnit,
      internalReference: formData.internalReference,
      noOfParcels: totals.totalNoOfParcels,
      customsNo: editingRecord?.customsNo || String(12879 + Math.floor(Math.random() * 1000)),
      declared: formData.declarationDate,
      processed: editingRecord?.processed || '',
      referenceDeclaration: editingRecord?.referenceDeclaration || '',
      recalculatedFrom: editingRecord?.recalculatedFrom || '',
      invoiceNo: invoices[0]?.invoiceNo || '',
      consignorName: formData.consignorName,
      consigneeName: formData.consigneeName,
      value: totals.totalAmount,
      currency: invoices[0]?.currency || 'NOK',
      netWeight: totals.totalNetWeight,
      grossWeight: totals.totalGrossWeight,
      invoices: invoices,
      freightAndCosts: freightAndCosts,
      currencyRate: currencyRate,
      goodsNo: editingRecord?.goodsNo || '',
      sender: {
        name: formData.consignorName,
        address: formData.consignorAddress
      },
      consignee: {
        name: formData.consigneeName,
        address: formData.consigneeAddress
      },
      owner: editingRecord?.owner || {
        name: '',
        address: ''
      },
      withdrawals: editingRecord?.withdrawals
    };

    if (editingRecord && onUpdate) {
      // Update existing record
      const declarationNo = onUpdate(editingRecord.id, assignmentData);
      onClose();
    } else {
      // Create new record
      const declarationNo = onSave(assignmentData);
      onClose();
      if (onNavigateToDetail && declarationNo) {
        onNavigateToDetail(declarationNo);
      }
    }
  };

  const handleInvoicesChange = (newData: InvoiceRow[]) => {
    setInvoices(newData);
  };

  const handleAddInvoice = () => {
    const newInvoiceId = Date.now().toString();
    setInvoices([
      ...invoices,
      {
        id: newInvoiceId,
        invoiceNo: '',
        invoiceDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
        currency: 'NOK',
        totalAmount: '',
        grossWeight: '',
        netWeight: '',
        noOfParcels: ''
      }
    ]);

    // Focus on Invoice No of the new row
    setTimeout(() => {
      const newRowIndex = invoices.length; // Since we just added one, this is the index of the new row
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
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handleInvoiceChange = (id: string, field: keyof InvoiceRow, value: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  };

  const handleVerifiedClick = (companyName: string) => {
    const company = companies.find(c => c.name === companyName);
    if (company) {
      setSelectedOrgData(company);
      setShowOrgModal(true);
    }
  };

  const isSaveDisabled = !hasChanges || 
    !formData.consignorName ||
    !formData.consigneeName ||
    !autoClassification ||
    !invoices.some(inv => inv.totalAmount && parseNumber(inv.totalAmount) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white relative rounded-[4px] shadow-[0px_3px_10px_0px_rgba(0,0,0,0.12)] w-[95%] max-w-[1200px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Section */}
        <div className="sticky top-0 bg-white z-10 px-[24px] pt-[24px] pr-[24px] pb-[0px] pl-[24px] m-[0px]">
          {/* Header */}
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full py-[0px] p-[0px] m-[0px]">
            <div className="font-['Inter'] text-[#003160] text-[16px] font-semibold uppercase flex items-center gap-2">
              {editingRecord ? 'Edit Customs Declaration' : 'Create Customs Declaration'}
              <a 
                href="https://www.toll.no/no/bedrift/eksport/eksportguide/hjelp-til-utfylling-av-utforselsdeklarasjon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <CircleHelp className="w-4 h-4 text-[#446BF9]" />
              </a>
            </div>
            <button
              onClick={() => {
                if (hasChanges) {
                  setShowCloseConfirmation(true);
                } else {
                  onClose();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  messageDeclarationTypeRef.current?.focus();
                }
              }}
              tabIndex={103}
              className="p-[6px] rounded-[2px] hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="size-[20px] text-[#003160]" />
            </button>
          </div>
          {/* Divider */}
          <div className="h-[1px] bg-gray-200 w-full mt-[24px]"></div>
        </div>

        {/* Scrollable Content */}
        <div className="relative size-full overflow-auto">
          <div className="box-border content-stretch flex flex-col gap-[24px] items-start relative size-full pt-[20px] pr-[24px] pb-[0px] pl-[24px]">

            {/* Top Fields - 3 columns x 2 rows (Import/Export removed — now
                derived automatically from Consignor/Consignee countries) */}
            <div className="grid grid-cols-3 gap-[16px] w-full">
              <CustomDropdown
                label="MESSAGE / DECLARATION TYPE"
                value={formData.messageDeclarationType}
                options={MESSAGE_DECLARATION_TYPE_OPTIONS}
                onChange={(value) => setFormData({ ...formData, messageDeclarationType: value })}
                placeholder="Select type"
                tabIndex={1}
                autoFocus={true}
                ref={messageDeclarationTypeRef}
              />

              <CustomDropdown
                label="MANAGED BY"
                value={formData.managedBy}
                options={MANAGED_BY_OPTIONS}
                onChange={(value) => setFormData({ ...formData, managedBy: value })}
                placeholder="Select person"
                tabIndex={2}
              />

              <CustomDropdown
                label="CUSTOMS CLEARANCE UNIT"
                value={formData.customsClearanceUnit}
                options={CUSTOMS_UNITS}
                onChange={(value) => setFormData({ ...formData, customsClearanceUnit: value })}
                placeholder="Select unit"
                tabIndex={3}
              />

              <FormInput
                label="DECLARATION DATE"
                type="date"
                value={formData.declarationDate}
                placeholder="DD/MM/YYYY"
                onChange={(value) => setFormData({ ...formData, declarationDate: value })}
                tabIndex={4}
              />

              <FormInput
                label="INTERNAL REFERENCE"
                value={formData.internalReference}
                placeholder="Add"
                onChange={(value) => setFormData({ ...formData, internalReference: value })}
                tabIndex={5}
              />
            </div>

            {/* Consignor and Consignee Section - Side by Side */}
            <div className="w-full grid grid-cols-2 gap-[16px]">
              {/* Consignor Section */}
              <div className="flex flex-col gap-[2px]">
                <CustomDropdown
                  label="Consignor"
                  numberPrefix="3"
                  value={formData.consignorName}
                  options={companyNames}
                  onChange={(value) => {
                    const company = companies.find(c => c.name === value);
                    setFormData({ 
                      ...formData, 
                      consignorName: value,
                      consignorAddress: company?.address || ''
                    });
                  }}
                  placeholder="Search Norwegian companies..."
                  tabIndex={50}
                  verifiedOptions={verifiedCompanies}
                  onVerifiedClick={handleVerifiedClick}
                  enableApiSearch={true}
                  onApiResultSelect={(company: BrregCompany) => {
                    console.log('Consignor onApiResultSelect triggered with:', company);
                    const address = company.forretningsadresse || company.postadresse;
                    const addressLine = address?.adresse?.join(', ') || '';
                    const city = address?.poststed || '';
                    const postalCode = address?.postnummer || '';
                    const fullAddress = [addressLine, postalCode, city].filter(Boolean).join(', ');
                    
                    setFormData({
                      ...formData,
                      consignorName: company.navn,
                      consignorAddress: fullAddress
                    });
                    
                    // Open modal to save to database
                    console.log('Setting pending company and opening modal...');
                    setPendingBrregCompany(company);
                    setPendingBrregTarget('consignor');
                    setShowCreateOrgModal(true);
                    console.log('Modal should now be shown');
                  }}
                />
                {formData.consignorName && (() => {
                  const company = companies.find(c => c.name === formData.consignorName);
                  if (!company) return null;
                  
                  const isVerified = company.verified === true;
                  const hasIncompleteData = !company.orgNo || !company.city || !company.state || !company.postcode || !company.country;
                  
                  return (
                    <div className={`w-full px-[10px] py-[8px] border rounded-[2px] relative ${ isVerified ? 'border-gray-300 bg-gray-100' : 'border-[#D0021B] bg-red-50' } mx-[0px] my-[5px]`}>
                      <div className={`grid grid-cols-[auto_1fr] gap-x-[8px] gap-y-[4px] font-['Inter'] text-[12px] pr-[30px] ${
                        isVerified ? 'text-[rgb(0,0,0)]' : 'text-[#D0021B]'
                      }`}>
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Org No:</span>
                        <span>{company.orgNo || 'N/A'}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Name:</span>
                        <span>{company.name}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Address:</span>
                        <span>{company.address}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>City / State:</span>
                        <span>{company.city || 'N/A'} / {company.state || 'N/A'}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Postcode:</span>
                        <span>{company.postcode || 'N/A'}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Country:</span>
                        <span>{company.country || 'N/A'}</span>
                      </div>
                      <div className="absolute top-[8px] right-[8px] flex items-center gap-1">
                        {!isVerified && (
                          <div className="p-1" title="Unverified organization - data may be incomplete">
                            <TriangleAlert className="w-4 h-4 text-[#D0021B]" />
                          </div>
                        )}
                        <div className="p-1">
                          <Pencil className={`w-4 h-4 ${isVerified ? 'text-[#446BF9]' : 'text-[#D0021B]'}`} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Consignee Section */}
              <div className="flex flex-col gap-[2px]">
                <CustomDropdown
                  label="Consignee"
                  numberPrefix="8"
                  value={formData.consigneeName}
                  options={companyNames}
                  onChange={(value) => {
                    const company = companies.find(c => c.name === value);
                    setFormData({ 
                      ...formData, 
                      consigneeName: value,
                      consigneeAddress: company?.address || ''
                    });
                  }}
                  placeholder="Search Norwegian companies..."
                  tabIndex={51}
                  verifiedOptions={verifiedCompanies}
                  onVerifiedClick={handleVerifiedClick}
                  enableApiSearch={true}
                  onApiResultSelect={(company: BrregCompany) => {
                    const address = company.forretningsadresse || company.postadresse;
                    const addressLine = address?.adresse?.join(', ') || '';
                    const city = address?.poststed || '';
                    const postalCode = address?.postnummer || '';
                    const fullAddress = [addressLine, postalCode, city].filter(Boolean).join(', ');
                    
                    setFormData({
                      ...formData,
                      consigneeName: company.navn,
                      consigneeAddress: fullAddress
                    });
                    
                    // Open modal to save to database
                    setPendingBrregCompany(company);
                    setPendingBrregTarget('consignee');
                    setShowCreateOrgModal(true);
                  }}
                />
                {formData.consigneeName && (() => {
                  const company = companies.find(c => c.name === formData.consigneeName);
                  if (!company) return null;
                  
                  const isVerified = company.verified === true;
                  const hasIncompleteData = !company.orgNo || !company.city || !company.state || !company.postcode || !company.country;
                  
                  return (
                    <div className={`w-full px-[10px] py-[8px] border rounded-[2px] relative ${ isVerified ? 'border-gray-300 bg-gray-100' : 'border-[#D0021B] bg-red-50' } mx-[0px] my-[5px]`}>
                      <div className={`grid grid-cols-[auto_1fr] gap-x-[8px] gap-y-[4px] font-['Inter'] text-[12px] pr-[30px] ${
                        isVerified ? 'text-[rgb(0,0,0)]' : 'text-[#D0021B]'
                      }`}>
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Org No:</span>
                        <span>{company.orgNo || 'N/A'}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Name:</span>
                        <span>{company.name}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Address:</span>
                        <span>{company.address}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>City / State:</span>
                        <span>{company.city || 'N/A'} / {company.state || 'N/A'}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Postcode:</span>
                        <span>{company.postcode || 'N/A'}</span>
                        
                        <span className={`font-bold uppercase text-[10px] tracking-[0.7px] text-right ${
                          isVerified ? 'text-[#003160]' : 'text-[#D0021B]'
                        }`}>Country:</span>
                        <span>{company.country || 'N/A'}</span>
                      </div>
                      <div className="absolute top-[8px] right-[8px] flex items-center gap-1">
                        {!isVerified && (
                          <div className="p-1" title="Unverified organization - data may be incomplete">
                            <TriangleAlert className="w-4 h-4 text-[#D0021B]" />
                          </div>
                        )}
                        <div className="p-1">
                          <Pencil className={`w-4 h-4 ${isVerified ? 'text-[#446BF9]' : 'text-[#D0021B]'}`} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Auto-derived direction, shown for confirmation — no manual override */}
            {autoClassification && (
              <div className="w-full flex items-center gap-[8px] -mt-[8px]">
                <span
                  className="bg-[#003160] text-white text-[10px] font-bold uppercase tracking-[0.7px] px-[8px] py-[3px] rounded-[2px]"
                >
                  {autoClassification.declarationType}
                </span>
                <span className="text-[11px] text-gray-500 font-['Inter']">
                  {autoClassification.declarationType === 'EU'
                    ? 'Classified as EU trade, based on Consignor/Consignee countries'
                    : autoClassification.declarationType === 'IM'
                      ? 'Classified as Import, based on Consignor/Consignee countries'
                      : 'Classified as Export, based on Consignor/Consignee countries'}
                </span>
              </div>
            )}
            {!autoClassification && formData.consignorName && formData.consigneeName && (() => {
              const consignorCountry = getCompanyCountry(companies, formData.consignorName);
              const consigneeCountry = getCompanyCountry(companies, formData.consigneeName);
              const bothNorway = consignorCountry === 'Norway' && consigneeCountry === 'Norway';
              return (
                <div className="w-full flex items-center gap-[8px] -mt-[8px]">
                  <TriangleAlert className="w-[14px] h-[14px] text-[#D0021B] shrink-0" />
                  <span className="text-[11px] text-[#D0021B] font-['Inter']">
                    {bothNorway
                      ? "Can't determine Import/Export/EU — Consignor and Consignee are both in Norway, this looks like a domestic shipment, not a customs declaration."
                      : "Can't determine Import/Export/EU — exactly one side (Consignor or Consignee) must be in Norway."}
                  </span>
                </div>
              );
            })()}

            {/* Invoice/s Section with Custom Table */}
            <InvoiceTable
              invoices={invoices}
              onChange={handleInvoicesChange}
              currencies={CURRENCIES}
              tabIndexStart={60}
            />

            {/* Summary Section */}
            <div className="w-full">
              <div className="font-['Inter'] text-[14px] text-[#003160] font-semibold uppercase mb-[8px]">
                SUMMARY
              </div>
              
              <div className="w-full">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-[#e5e5e5]">
                      <th className="px-2 py-2 text-left font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[10%]">CURRENCY</th>
                      <th className="px-2 py-2 text-left font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[8%]">RATE</th>
                      <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[14%]">TOTAL AMOUNT</th>
                      <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[20%]">FREIGHT AND COSTS IN NOK(-)</th>
                      <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[18%]">TOTAL STATISTICAL VALUE</th>
                      <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[14%]">TOTAL GROSS WEIGHT</th>
                      <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[12%]">TOTAL NET WEIGHT</th>
                      <th className="px-2 py-2 text-right font-['Inter'] text-[10px] font-bold text-[#003160] uppercase tracking-[0.7px] bg-white w-[12%]">TOTAL NO OF PARCELS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#e5e5e5] hover:bg-[#f9f9f9]" style={{ height: '40px' }}>
                      <td className="px-2 py-1">
                        <span className="font-['Inter'] text-[12px] text-[#000] tracking-[0]">{invoices[0]?.currency || 'NOK'}</span>
                      </td>
                      <td className="px-2 py-1 relative">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={currencyRate}
                            onChange={(e) => {
                              const filtered = e.target.value.replace(/[^\d.]/g, '');
                              setCurrencyRate(filtered);
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim() === '') return;
                              const num = parseFloat(e.target.value) || 0;
                              setCurrencyRate(num.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''));
                            }}
                            onFocus={(e) => e.target.select()}
                            placeholder="1"
                            className="w-full min-w-0 border-0 border-b border-b-black px-0 py-1 font-[Roboto_Mono] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer text-right selection:bg-[#446BF9] selection:text-[#ffffff] bg-transparent tracking-[0] text-[#000] placeholder:text-[#999]"
                          />
                          <Popover open={rateDropdownOpen} onOpenChange={setRateDropdownOpen}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="p-0.5 hover:bg-gray-100 rounded cursor-pointer transition-colors border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#446BF9] shrink-0"
                                title="Pick a historical rate"
                              >
                                <ChevronDown className="w-3.5 h-3.5 text-[#446BF9]" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[220px] p-1.5" align="end">
                              {(() => {
                                const currency = invoices[0]?.currency || 'NOK';
                                const periods = CURRENCY_RATE_HISTORY[currency] || [];
                                if (periods.length === 0) {
                                  return (
                                    <p className="px-2 py-2 text-center font-['Inter'] text-[11px] text-gray-400">
                                      No historical rates for {currency}
                                    </p>
                                  );
                                }
                                return (
                                  <div className="flex flex-col gap-0.5 max-h-[280px] overflow-auto">
                                    {periods.map((period, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                          setCurrencyRate(period.rate.toString());
                                          setRateDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[2px] hover:bg-[#DFE5EB] transition-colors cursor-pointer border-0 bg-transparent text-left"
                                      >
                                        <span className="font-['Inter'] text-[11px] text-gray-600 leading-tight break-words">
                                          {period.fromDate}–{period.toDate}
                                        </span>
                                        <span className="font-[Roboto_Mono] text-[12px] text-black font-semibold shrink-0">
                                          {period.rate.toFixed(3)}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                );
                              })()}
                            </PopoverContent>
                          </Popover>
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        <span className="font-[Roboto_Mono] text-[12px] text-[#000] tracking-[0] block text-right">{totals.totalAmount}</span>
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={freightAndCosts}
                          onChange={(e) => {
                            const filtered = e.target.value.replace(/[^\d.]/g, '');
                            setFreightAndCosts(filtered);
                          }}
                          onBlur={(e) => {
                            const formatted = formatInputOnBlur(e.target.value);
                            setFreightAndCosts(formatted);
                          }}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                          tabIndex={100}
                          className="w-full border-0 border-b border-b-black px-0 py-1 font-[Roboto_Mono] text-[12px] focus:outline-none focus:border-b-2 focus:border-b-[#446BF9] cursor-pointer text-right selection:bg-[#446BF9] selection:text-[#ffffff] bg-transparent tracking-[0] text-[#000] placeholder:text-[#999]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <span className="font-[Roboto_Mono] text-[12px] text-[#000] tracking-[0] block text-right">{totals.totalMinusFreight}</span>
                      </td>
                      <td className="px-2 py-1">
                        <span className="font-[Roboto_Mono] text-[12px] text-[#000] tracking-[0] block text-right">{totals.totalGrossWeight}</span>
                      </td>
                      <td className="px-2 py-1">
                        <span className="font-[Roboto_Mono] text-[12px] text-[#000] tracking-[0] block text-right">{totals.totalNetWeight}</span>
                      </td>
                      <td className="px-2 py-1">
                        <span className="font-[Roboto_Mono] text-[12px] text-[#000] tracking-[0] block text-right">{totals.totalNoOfParcels}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action buttons */}
            <div className="content-stretch flex gap-[12px] items-center justify-end shrink-0 w-full border-t border-[#E0E0E0] sticky bottom-0 bg-white z-10 py-[8px] py-[20px] px-[0px]">
              <button
                onClick={onClose}
                tabIndex={101}
                className="h-[36px] px-[20px] rounded transition-all cursor-pointer font-['Inter'] text-[12px] text-[#446bf9] font-semibold hover:bg-blue-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                tabIndex={102}
                className={`h-[36px] px-[24px] rounded-[2px] text-white font-['Inter'] font-semibold text-[12px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9] ${
                  isSaveDisabled
                    ? 'bg-[#446bf9] opacity-50 cursor-not-allowed'
                    : 'bg-[#446bf9] cursor-pointer hover:bg-[#3557d9]'
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      {showCloseConfirmation && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" 
          onClick={() => setShowCloseConfirmation(false)}
        >
          <div 
            className="bg-white relative rounded-[4px] shadow-[0px_3px_10px_0px_rgba(0,0,0,0.12)] w-[450px] flex flex-col p-[24px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Message */}
            <div className="font-['Inter'] text-[14px] text-[#003160] mb-[24px]">
              Are you sure you want to close? You have unsaved changes.
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[12px] justify-end">
              <button
                onClick={() => setShowCloseConfirmation(false)}
                autoFocus
                className="h-[36px] px-[24px] rounded-[2px] bg-white text-[#446bf9] border border-[#446bf9] font-['Inter'] font-semibold text-[12px] cursor-pointer hover:bg-[#f5f5f5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCloseConfirmation(false);
                  onClose();
                }}
                className="h-[36px] px-[24px] rounded-[2px] bg-[#446bf9] text-white font-['Inter'] font-semibold text-[12px] cursor-pointer hover:bg-[#3557d9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9] focus:ring-offset-2"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {selectedOrgData && (
        <OrganizationDetailModal
          isOpen={showOrgModal}
          onClose={() => setShowOrgModal(false)}
          organizationData={{
            orgName: selectedOrgData.orgName || '',
            orgNo: selectedOrgData.orgNo || '',
            name: selectedOrgData.name,
            address: selectedOrgData.address,
            city: selectedOrgData.city || '',
            state: selectedOrgData.state || '',
            postcode: selectedOrgData.postcode || '',
            country: selectedOrgData.country || ''
          }}
        />
      )}

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={showCreateOrgModal}
        onClose={() => {
          setShowCreateOrgModal(false);
          setPendingBrregCompany(null);
          setPendingBrregTarget(null);
        }}
        prefillData={pendingBrregCompany}
        onSave={(organizationData: OrganizationFormData) => {
          // Use the real country from the form (which itself now reflects
          // Brreg's actual address data), instead of assuming Norway —
          // Brreg only requires a Norwegian org number, not a Norwegian
          // business address (e.g. NUF entities can be based abroad).
          const countryName = countryNameFromCode(organizationData.countryCode);
          const newCompany: CompanyData = {
            name: organizationData.organizationName,
            address: organizationData.address,
            verified: true, // Mark as verified since it came from Brreg
            orgName: organizationData.organizationName,
            orgNo: organizationData.organizationNumber,
            city: organizationData.city,
            state: organizationData.state,
            postcode: organizationData.postCode,
            country: countryName
          };

          // Reflect it immediately in this session's dropdown...
          setCompanies((prev) => [...prev, newCompany]);

          // ...and persist it to Supabase so it's there for everyone next time.
          createAddress({
            name: newCompany.name,
            alias: '',
            associatedOrganization: newCompany.orgName || '',
            address: newCompany.address,
            address2: '',
            address3: '',
            countryCode: organizationData.countryCode,
            country: countryName,
            postCode: newCompany.postcode || '',
            city: newCompany.city || '',
            state: newCompany.state || '',
            contactPerson: '',
            phoneNo: '',
            emailAddress: '',
            associatedCustomer: '',
            orgNo: newCompany.orgNo || '',
            verified: true
          }).catch((err) => console.error('Error saving new address to Supabase:', err));
          
          // Fill in whichever field (Consignor or Consignee) actually
          // triggered this Brreg selection — not always Consignor.
          const fullAddress = `${organizationData.address}, ${organizationData.postCode} ${organizationData.city}`;
          if (pendingBrregTarget === 'consignee') {
            setFormData({
              ...formData,
              consigneeName: newCompany.name,
              consigneeAddress: fullAddress
            });
          } else {
            setFormData({
              ...formData,
              consignorName: newCompany.name,
              consignorAddress: fullAddress
            });
          }
          
          setShowCreateOrgModal(false);
          setPendingBrregCompany(null);
          setPendingBrregTarget(null);
        }}
      />
    </div>
  );
}