import { useState, useEffect, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { GenericEditableTable } from './GenericEditableTable';
import type { GenericColumn } from './GenericEditableTable';
import type { TableRowData } from './TableRow';
import type { InvoiceRow } from './InvoiceTable';
import {
  fetchGeneralFormData,
  saveGeneralFormData,
  saveProposedFields,
  fetchItemLines,
  saveItemLines
} from '../lib/declarationsApi';
import { fetchLogs, addLog, type LogEntry } from '../lib/logsApi';
import { listDocuments, uploadDocument, deleteDocument, type DocumentFile } from '../lib/documentsApi';
import { generateCmrPdf } from '../lib/cmrPdf';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { FormTextarea } from './FormTextarea';
import { CustomDropdown, CustomDropdownRef } from './CustomDropdown';
import { AddArticleModal, type ArticleData } from './AddArticleModal';
import { Calculator, ListPlus, Pencil, X, FileText, Upload, Trash2 } from 'lucide-react';

// 45 Random Countries for dropdowns
const COUNTRIES = [
  'NO | Norway',
  'SE | Sweden',
  'DK | Denmark',
  'FI | Finland',
  'IS | Iceland',
  'DE | Germany',
  'FR | France',
  'IT | Italy',
  'ES | Spain',
  'PT | Portugal',
  'GB | United Kingdom',
  'IE | Ireland',
  'NL | Netherlands',
  'BE | Belgium',
  'LU | Luxembourg',
  'CH | Switzerland',
  'AT | Austria',
  'PL | Poland',
  'CZ | Czech Republic',
  'HU | Hungary',
  'RO | Romania',
  'BG | Bulgaria',
  'GR | Greece',
  'HR | Croatia',
  'SI | Slovenia',
  'SK | Slovakia',
  'EE | Estonia',
  'LV | Latvia',
  'LT | Lithuania',
  'US | United States',
  'CA | Canada',
  'MX | Mexico',
  'BR | Brazil',
  'AR | Argentina',
  'CL | Chile',
  'CN | China',
  'JP | Japan',
  'KR | South Korea',
  'TW | Taiwan',
  'IN | India',
  'AU | Australia',
  'NZ | New Zealand',
  'ZA | South Africa',
  'EG | Egypt',
  'TR | Turkey',
];

export interface DetailViewProps {
  record: TableRowData;
  onBack: () => void;
  sidebarWidth: number;
  onItemsSummaryChange?: (summary: { totalAmount: number; totalNetWeight: number; totalGrossWeight: number; totalNoOfParcels: number }) => void;
  /** Actual measured height of the fixed TopBar above this page, so the gap between them stays correct as the header's content changes. */
  headerHeight?: number;
  /** Opens the same edit view used when creating a declaration, pre-filled with this record's data. */
  onEditClick?: () => void;
  /** Patches specific fields on the record directly — used by the Freight/Invoices panel to remove an invoice or clear the freight cost without opening the full edit modal. */
  onUpdateRecord?: (updates: Partial<TableRowData>) => void;
  /** Whether the document-preview side panel is open (state lives in App.tsx since the toggle icon sits in TopBar). */
  pdfPreviewOpen?: boolean;
  onClosePdfPreview?: () => void;
}

/** Imperative handle exposed via ref — lets TopBar's "Validate and Send"
 * button trigger the send flow, even though the data it needs to validate
 * (GENERAL form fields, Items totals) only exists inside this component. */
export interface DetailViewRef {
  validateAndSend: () => void;
}

interface ItemLineRow {
  id: string;
  itemLineNo: string;
  article: string;
  description: string;
  marksAndNumbers: string;
  packaging: string;
  noOfParcels: string;
  statisticalNo: string;
  dutyReduction: string;
  foodstuff: boolean;
  origin: string;
  city: string;
  preferences: string;
  procedure: string;
  amount: string;
  netWeight: string;
  grossWeight: string;
  otherQuantity: string;
  valuationCode: string;
  reference: string;
  statisticalValue: string;
  adjustment: string;
  fees: string;
}

interface GeneralFormData {
  controlNo: string;
  controlNoExtra: string;
  declarationType: string;
  declarationStatus: string;
  exportType: string;
  referenceNo: string;
  internalReference: string;
  countryDispatch: string;
  countryDestination: string;
  container: string;
  deliveryTerms: string;
  deliveryPlace: string;
  nationality: string;
  identityTransport: string;
  transactionType: string;
  customsOffice: string;
  transportMode: string;
  locationGoods: string;
  goodsPositionNo: string;
  noOfParcels: string;
}

export const DetailView = forwardRef<DetailViewRef, DetailViewProps>(function DetailView({ record, onBack, sidebarWidth, onItemsSummaryChange, headerHeight = 0, onEditClick, onUpdateRecord, pdfPreviewOpen = false, onClosePdfPreview }, ref) {
  // Height of the fixed Details/Items tab bar rendered below the TopBar.
  const TAB_BAR_HEIGHT = 60;

  // Safety net: force the browser viewport back to the top whenever this
  // page mounts (e.g. opening a declaration). The root cause of the page
  // opening "scrolled down" was a missing min-h-0 on the internal
  // overflow-auto containers (without it, flex items refuse to shrink below
  // their content's natural height, so the *window* ends up scrolling
  // instead of the intended internal container) — that's fixed below, but
  // this stays as a cheap extra guarantee.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Recomputes the record's aggregate fields (value/currency/weights/parcels)
  // from its invoices — used whenever an invoice is removed from the Freight
  // & Invoices panel, so the header's totals and progress bars stay correct
  // without needing to reopen the edit modal.
  const recomputeInvoiceAggregates = (invoices: InvoiceRow[]): Partial<TableRowData> => {
    const parseNum = (v: string) => parseFloat((v || '').replace(/,/g, '')) || 0;
    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const totalAmount = invoices.reduce((sum, inv) => sum + parseNum(inv.totalAmount), 0);
    const totalNetWeight = invoices.reduce((sum, inv) => sum + parseNum(inv.netWeight), 0);
    const totalGrossWeight = invoices.reduce((sum, inv) => sum + parseNum(inv.grossWeight), 0);
    const totalNoOfParcels = invoices.reduce((sum, inv) => sum + parseNum(inv.noOfParcels), 0);

    return {
      invoices,
      value: fmt(totalAmount),
      netWeight: fmt(totalNetWeight),
      grossWeight: fmt(totalGrossWeight),
      noOfParcels: totalNoOfParcels.toString(),
      invoiceNo: invoices[0]?.invoiceNo || '',
      currency: invoices[0]?.currency || 'NOK'
    };
  };
  // Width of the document-preview side panel when open.
  // Width of the document-preview side panel. Draggable via a handle on its
  // left edge, clamped between a sensible minimum and 50% of the available
  // width (viewport minus the left sidebar).
  const PANEL_MIN_WIDTH = 360;
  const PANEL_DEFAULT_WIDTH = 420;
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT_WIDTH);
  const [isResizingPanel, setIsResizingPanel] = useState(false);

  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const panelMaxWidth = Math.max(PANEL_MIN_WIDTH, Math.floor((viewportWidth - sidebarWidth) * 0.5));

  const handlePanelResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingPanel(true);
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Handle sits on the panel's left edge — dragging left (negative delta) grows it.
      const delta = startX - moveEvent.clientX;
      const nextWidth = Math.min(panelMaxWidth, Math.max(PANEL_MIN_WIDTH, startWidth + delta));
      setPanelWidth(nextWidth);
    };
    const handleMouseUp = () => {
      setIsResizingPanel(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Keep the panel within the (possibly resized) max width, e.g. after a
  // browser window resize shrinks the available space.
  useEffect(() => {
    setPanelWidth((w) => Math.min(w, panelMaxWidth));
  }, [panelMaxWidth]);

  // Ref for Control No dropdown
  const controlNoRef = useRef<CustomDropdownRef>(null);

  // Default initial data structure — 10 empty rows to start with
  const emptyItemLineRow = (id: string): ItemLineRow => ({
    id,
    itemLineNo: '',
    article: '',
    description: '',
    marksAndNumbers: '',
    packaging: '',
    noOfParcels: '',
    statisticalNo: '',
    dutyReduction: '',
    foodstuff: false,
    origin: '',
    city: '',
    preferences: '',
    procedure: '',
    amount: '',
    netWeight: '',
    grossWeight: '',
    otherQuantity: '',
    valuationCode: '',
    reference: '',
    statisticalValue: '',
    adjustment: '',
    fees: ''
  });

  const defaultDetailData: ItemLineRow[] = Array.from({ length: 10 }, (_, i) => emptyItemLineRow(String(i + 1)));

  // Default form data
  const defaultFormData: GeneralFormData = {
    controlNo: '',
    controlNoExtra: '',
    declarationType: '',
    declarationStatus: '',
    exportType: '',
    referenceNo: '',
    internalReference: '',
    countryDispatch: '',
    countryDestination: '',
    container: '',
    deliveryTerms: '',
    deliveryPlace: '',
    nationality: '',
    identityTransport: '',
    transactionType: '',
    customsOffice: '',
    transportMode: '',
    locationGoods: '',
    goodsPositionNo: '',
    noOfParcels: ''
  };

  // Data carried over from the Create Customs Declaration modal — these are
  // the fields the user just entered, offered here as "proposed" values they
  // can accept or clear before the rest of GENERAL is filled in.
  const proposedData = {
    declarationType: record.declarationType || '',
    declarationStatus: record.messageDeclarationType || '',
    internalReference: record.internalReference || ''
  };

  // State to track which fields are proposed — loaded from Supabase below.
  const [proposedFields, setProposedFields] = useState<Set<string>>(new Set());

  // State to track if user has made any changes
  const [hasUserChanges, setHasUserChanges] = useState(false);

  // Which of the two pages (Details / Items) is currently shown. The header
  // and this tab bar stay fixed on both.
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'log' | 'documents'>('details');

  // GENERAL form data — loaded from Supabase (shared across visitors, not
  // per-browser localStorage). `formDataLoaded` gates the save-effects below
  // so we never write back the still-loading default values over real data.
  const [formData, setFormData] = useState<GeneralFormData>(defaultFormData);
  const [formDataLoaded, setFormDataLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchGeneralFormData(record.id)
      .then(({ formData: stored, proposedFields: storedProposed }) => {
        if (cancelled) return;
        if (stored) {
          setFormData(stored as unknown as GeneralFormData);
          setProposedFields(new Set(storedProposed));
        } else {
          // New record — seed from what was entered in the Create modal,
          // offered here as "proposed" values to accept or clear.
          const proposedKeys = (Object.keys(proposedData) as (keyof typeof proposedData)[])
            .filter((key) => proposedData[key]);
          setProposedFields(new Set(proposedKeys));
          setFormData({ ...defaultFormData, ...proposedData });
        }
      })
      .catch((err) => console.error('Error loading GENERAL form data from Supabase:', err))
      .finally(() => {
        if (!cancelled) setFormDataLoaded(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id]);

  // Save form data to Supabase (debounced — this fires on every keystroke
  // otherwise) once loaded, and only if the user has actually changed something.
  useEffect(() => {
    if (!hasUserChanges || !formDataLoaded) return;
    const timeout = setTimeout(() => {
      saveGeneralFormData(record.id, formData).catch((err) => {
        console.error('Error saving GENERAL form data to Supabase:', err);
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [formData, record.id, hasUserChanges, formDataLoaded]);

  // Save proposed fields to Supabase whenever they change
  useEffect(() => {
    if (!formDataLoaded) return;
    saveProposedFields(record.id, Array.from(proposedFields)).catch((err) => {
      console.error('Error saving proposed fields to Supabase:', err);
    });
  }, [proposedFields, record.id, formDataLoaded]);


  // State for the Brønnøysundregistrene lookup, plus the consignee's org
  // number (persisted per-declaration only implicitly for now — the lookup
  // itself is stateless and re-runs on mount).
  const [orgNoConsignee] = useState(() => Math.floor(100000000 + Math.random() * 900000000).toString());

  // Check whether the consignee's org number is registered in Brønnøysundregistrene
  // (Norway's official business register) via their public, unauthenticated API.
  const [brregStatus, setBrregStatus] = useState<'loading' | 'found' | 'not-found' | 'error'>('loading');
  const [brregName, setBrregName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBrregStatus('loading');
    setBrregName(null);

    fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgNoConsignee}`)
      .then((res) => {
        if (cancelled) return null;
        if (res.status === 404) {
          setBrregStatus('not-found');
          return null;
        }
        if (!res.ok) throw new Error('Brreg lookup failed');
        return res.json();
      })
      .then((json) => {
        if (cancelled || !json) return;
        setBrregStatus('found');
        setBrregName(json.navn ?? null);
      })
      .catch(() => {
        if (!cancelled) setBrregStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [orgNoConsignee]);

  // Items rows — loaded from Supabase (shared across visitors).
  const [detailData, setDetailData] = useState<ItemLineRow[]>(defaultDetailData);
  const [itemsLoaded, setItemsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchItemLines(record.id)
      .then((items) => {
        if (cancelled) return;
        setDetailData(items.length > 0 ? items : defaultDetailData);
      })
      .catch((err) => console.error('Error loading item lines from Supabase:', err))
      .finally(() => {
        if (!cancelled) setItemsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id]);

  // Save items to Supabase (debounced) once loaded — every row edit
  // triggers this, so debounce avoids a write on every keystroke.
  useEffect(() => {
    if (!itemsLoaded) return;
    const timeout = setTimeout(() => {
      saveItemLines(record.id, detailData).catch((err) => {
        console.error('Error saving item lines to Supabase:', err);
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [detailData, record.id, itemsLoaded]);

  // Log tab — loaded fresh each time it's opened (no live editing here, so
  // no debounced save needed, just a straightforward fetch).
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'log') return;
    let cancelled = false;
    setLogsLoading(true);
    fetchLogs(record.id)
      .then((entries) => {
        if (!cancelled) setLogs(entries);
      })
      .catch((err) => console.error('Error loading logs from Supabase:', err))
      .finally(() => {
        if (!cancelled) setLogsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, record.id]);

  // Documents tab — files live in Supabase Storage, listed fresh whenever
  // the tab opens (and after an upload/delete).
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const refreshDocuments = () => {
    setDocumentsLoading(true);
    listDocuments(record.id)
      .then(setDocuments)
      .catch((err) => {
        console.error('Error listing documents from Supabase Storage:', err);
        setDocumentError('Could not load documents.');
      })
      .finally(() => setDocumentsLoading(false));
  };

  useEffect(() => {
    if (activeTab !== 'documents') return;
    refreshDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, record.id]);

  const handleUploadDocument = (file: File) => {
    setDocumentUploading(true);
    setDocumentError(null);
    uploadDocument(record.id, file)
      .then(() => refreshDocuments())
      .catch((err) => {
        console.error('Error uploading document to Supabase Storage:', err);
        setDocumentError('Upload failed. If this is the first upload, make sure the "declaration-documents" storage bucket exists (see supabase/schema.sql).');
      })
      .finally(() => setDocumentUploading(false));
  };

  const handleDeleteDocument = (path: string) => {
    deleteDocument(path)
      .then(() => refreshDocuments())
      .catch((err) => console.error('Error deleting document from Supabase Storage:', err));
  };

  // Handle data changes from the table
  const handleDataChange = (newData: ItemLineRow[]) => {
    setDetailData(newData);
  };

  // Sum the Items rows so the header's "used"/"remains" figures reflect what's
  // actually been entered, instead of a static placeholder.
  const itemsSummary = useMemo(() => {
    const toNumber = (v: string) => parseFloat(v) || 0;
    return detailData.reduce(
      (acc, row) => ({
        totalAmount: acc.totalAmount + toNumber(row.amount),
        totalNetWeight: acc.totalNetWeight + toNumber(row.netWeight),
        totalGrossWeight: acc.totalGrossWeight + toNumber(row.grossWeight),
        totalNoOfParcels: acc.totalNoOfParcels + toNumber(row.noOfParcels)
      }),
      { totalAmount: 0, totalNetWeight: 0, totalGrossWeight: 0, totalNoOfParcels: 0 }
    );
  }, [detailData]);

  // "Validate and Send" — triggered from TopBar via the ref exposed below,
  // since the data it needs to check only lives here (GENERAL form fields,
  // the Items totals).
  const REQUIRED_GENERAL_FIELDS: (keyof GeneralFormData)[] = [
    'controlNo', 'declarationType', 'transactionType', 'referenceNo', 'container',
    'goodsPositionNo', 'noOfParcels', 'countryDispatch', 'countryDestination',
    'deliveryTerms', 'deliveryPlace', 'nationality', 'customsOffice', 'transportMode', 'locationGoods'
  ];

  const [sendState, setSendState] = useState<'idle' | 'sending'>('idle');
  const [sendError, setSendError] = useState<string | null>(null);

  const validateAndSend = useCallback(() => {
    setSendError(null);

    // 1. Every field with an orange declaration-form box number must be filled in.
    const missing = REQUIRED_GENERAL_FIELDS.filter((key) => !formData[key] || !formData[key].trim());
    if (missing.length > 0) {
      setSendError(`${missing.length} required field${missing.length > 1 ? 's' : ''} still empty — every orange box-numbered field in Details must be filled in before sending.`);
      setActiveTab('details');
      return;
    }

    // 2. Invoice totals must match what's actually been itemized in Items.
    const closeEnough = (a: number, b: number) => Math.abs(a - b) < 0.01;
    const parseAmount = (v: string | undefined) => parseFloat((v || '0').replace(/,/g, '')) || 0;
    const invoiceAmount = parseAmount(record.value);
    const invoiceNetWeight = parseAmount(record.netWeight);
    const invoiceGrossWeight = parseAmount(record.grossWeight);
    const invoiceParcels = parseAmount(record.noOfParcels);

    if (
      !closeEnough(invoiceAmount, itemsSummary.totalAmount) ||
      !closeEnough(invoiceNetWeight, itemsSummary.totalNetWeight) ||
      !closeEnough(invoiceGrossWeight, itemsSummary.totalGrossWeight) ||
      !closeEnough(invoiceParcels, itemsSummary.totalNoOfParcels)
    ) {
      setSendError('Invoice totals (amount, weight, parcels) don\u2019t match what\u2019s itemized in Items — every invoiced unit must be fully accounted for before sending.');
      setActiveTab('items');
      return;
    }

    // 3. Show the sending animation, then actually "send".
    setSendState('sending');

    setTimeout(() => {
      try {
        const blob = generateCmrPdf(record, formData, detailData);
        const file = new File([blob], `CMR-Waybill-${record.customsNo || record.id}.pdf`, { type: 'application/pdf' });
        uploadDocument(record.id, file)
          .then(() => {
            if (activeTab === 'documents') refreshDocuments();
          })
          .catch((err) => console.error('Error uploading generated CMR document:', err));
      } catch (err) {
        console.error('Error generating CMR PDF:', err);
      }

      const today = new Date();
      const formattedToday = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
      onUpdateRecord?.({ stage: 'sent', sentDate: formattedToday });

      addLog(record.id, 'sent', 'Declaration sent to customs').catch((err) => {
        console.error('Error writing log entry:', err);
      });

      setSendState('idle');
    }, 1800);
  }, [formData, record, itemsSummary, detailData, onUpdateRecord, activeTab]);

  useImperativeHandle(ref, () => ({ validateAndSend }), [validateAndSend]);

  useEffect(() => {
    onItemsSummaryChange?.(itemsSummary);
  }, [itemsSummary, onItemsSummaryChange]);

  // Helper function to update form field
  const updateFormField = (field: keyof GeneralFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUserChanges(true);
  };

  // Handle blur (when leaving a field) - remove from proposed if changed
  const handleFieldBlur = (field: keyof GeneralFormData) => {
    if (proposedFields.has(field)) {
      setProposedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  // Handle submit all proposals
  const handleSubmitProposals = () => {
    setProposedFields(new Set());
    setHasUserChanges(true); // Mark as user change when accepting proposals
    // Focus on Control No after submitting
    setTimeout(() => {
      controlNoRef.current?.focus();
    }, 0);
  };

  // Handle cancel all proposals
  const handleCancelProposals = () => {
    // Reset proposed fields to empty
    const resetData = { ...formData };
    proposedFields.forEach(field => {
      resetData[field as keyof GeneralFormData] = '';
    });
    setFormData(resetData);
    setProposedFields(new Set());
  };

  // State for Add Article Modal
  const [isAddArticleModalOpen, setIsAddArticleModalOpen] = useState(false);
  const [newArticleSearchQuery, setNewArticleSearchQuery] = useState('');
  const [articleOptions, setArticleOptions] = useState(['Article 1', 'Article 2', 'Article 3']);

  // Handle opening the Add Article Modal (memoized to prevent column recreation)
  const handleOpenAddArticleModal = useCallback((searchQuery: string) => {
    setNewArticleSearchQuery(searchQuery);
    setIsAddArticleModalOpen(true);
  }, []);

  // Handle saving new article
  const handleSaveArticle = (articleData: ArticleData) => {
    // Add the new article to the options list
    setArticleOptions(prev => [...prev, articleData.articleName]);
    setIsAddArticleModalOpen(false);
  };

  // Define columns for the editable table (updated structure)
  const columns: GenericColumn<ItemLineRow>[] = useMemo(() => [
    {
      key: 'itemLineNo',
      label: 'Item Line No',
      numberPrefix: '32',
      type: 'link',
      minWidth: '120px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'article',
      label: 'Article',
      numberPrefix: '31',
      type: 'select',
      minWidth: '140px',
      options: articleOptions,
      editable: true,
      sortable: true,
      defaultVisible: true,
      enableAddNew: true,
      onAddNew: handleOpenAddArticleModal
    },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      minWidth: '180px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'marksAndNumbers',
      label: 'Marks and Numbers',
      type: 'text',
      minWidth: '150px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'packaging',
      label: 'Packaging',
      type: 'select',
      minWidth: '140px',
      options: ['Box', 'Pallet', 'Container', 'Crate'],
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'noOfParcels',
      label: 'No of Parcels',
      type: 'number',
      minWidth: '120px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'statisticalNo',
      label: 'Statistical No',
      numberPrefix: '33',
      type: 'select',
      minWidth: '140px',
      options: ['12345678', '87654321', '11223344'],
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'dutyReduction',
      label: 'Duty Reduction',
      type: 'readonly',
      minWidth: '130px',
      editable: false,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'foodstuff',
      label: 'Foodstuff',
      type: 'checkbox',
      minWidth: '100px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'origin',
      label: 'Origin',
      numberPrefix: '34',
      type: 'select',
      minWidth: '140px',
      options: COUNTRIES,
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'city',
      label: 'City',
      type: 'select',
      minWidth: '140px',
      options: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'preferences',
      label: 'Preferences',
      numberPrefix: '36',
      type: 'select',
      minWidth: '140px',
      options: [
        'A - EEA Agreement',
        'B - Free Trade Agreement EC-Norway',
        'C - Free Trade Agreement EFTA-Turkey',
        'D - Pan-European cumulation',
        'E - Bilateral cumulation',
        'F - PEM convention',
        'G - Other preferences',
        'H - No preference'
      ],
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'procedure',
      label: 'Procedure',
      numberPrefix: '37',
      type: 'select',
      minWidth: '140px',
      options: ['10 00', '40 00', '51 00'],
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'number',
      minWidth: '140px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'netWeight',
      label: 'Net Weight',
      numberPrefix: '38',
      type: 'number',
      minWidth: '140px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'grossWeight',
      label: 'Gross Weight',
      numberPrefix: '35',
      type: 'number',
      minWidth: '140px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'otherQuantity',
      label: 'Other Quantity',
      numberPrefix: '41',
      type: 'number',
      minWidth: '130px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'valuationCode',
      label: 'Valuation Code',
      numberPrefix: '43',
      type: 'select',
      minWidth: '140px',
      options: ['Code A', 'Code B', 'Code C'],
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'reference',
      label: 'Reference',
      numberPrefix: '44',
      type: 'link',
      minWidth: '130px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'statisticalValue',
      label: 'Statistical Value',
      numberPrefix: '46',
      type: 'number',
      minWidth: '150px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'adjustment',
      label: 'Adjustment',
      numberPrefix: '45',
      type: 'number',
      minWidth: '130px',
      editable: true,
      sortable: true,
      defaultVisible: true
    },
    {
      key: 'fees',
      label: 'Fees',
      type: 'link',
      isAmount: true,
      minWidth: '100px',
      editable: true,
      sortable: true,
      defaultVisible: true
    }
  ], [articleOptions, handleOpenAddArticleModal]);

  // Grouping of GENERAL fields into logical sections, each tracked for completion
  const groupDefs = useMemo(() => ([
    {
      id: 'classification',
      title: 'Classification & Procedure',
      requiredKeys: ['controlNo', 'declarationType', 'declarationStatus', 'transactionType'] as (keyof GeneralFormData)[]
    },
    {
      id: 'references',
      title: 'References & Goods',
      requiredKeys: ['referenceNo', 'container', 'goodsPositionNo', 'noOfParcels'] as (keyof GeneralFormData)[]
    },
    {
      id: 'transport',
      title: 'Transport & Route',
      requiredKeys: ['countryDispatch', 'countryDestination', 'deliveryTerms', 'deliveryPlace', 'nationality', 'transportMode', 'customsOffice', 'locationGoods'] as (keyof GeneralFormData)[]
    }
  ]), []);

  const groupStatus = useMemo(() => groupDefs.map((g) => {
    const filled = g.requiredKeys.filter((k) => (formData[k] || '').trim() !== '').length;
    return { ...g, filled, total: g.requiredKeys.length, complete: filled === g.requiredKeys.length };
  }), [groupDefs, formData]);

  return (
    <>
      {/* "Sending to Customs" overlay — shown while validateAndSend runs */}
      {sendState === 'sending' && (
        <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-[6px] px-[32px] py-[28px] flex flex-col items-center gap-[16px] shadow-lg">
            <div className="size-[36px] border-[3px] border-[#e0e0e0] border-t-[#446BF9] rounded-full animate-spin" />
            <p className="text-[#003160] text-[14px] font-semibold">Sending to Customs…</p>
          </div>
        </div>
      )}

    <div 
      className={`flex flex-col bg-white ${isResizingPanel ? 'select-none' : ''}`} 
      style={{ 
        marginLeft: `${sidebarWidth}px`,
        marginTop: `${headerHeight + TAB_BAR_HEIGHT}px`,
        height: `calc(100vh - ${headerHeight + TAB_BAR_HEIGHT}px)`
      }}
    >
      {/* Section tab bar — fixed below the TopBar on both pages */}
      <div
        className="fixed bg-[#E4E7F0] content-stretch flex items-center justify-center gap-[8px] px-[20px] z-30"
        style={{
          top: `${headerHeight}px`,
          left: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px - ${pdfPreviewOpen ? panelWidth : 0}px)`,
          height: `${TAB_BAR_HEIGHT}px`,
          transition: 'width 300ms'
        }}
      >
        <button
          onClick={() => setActiveTab('details')}
          className={`px-[16px] py-[8px] rounded-[2px] font-['Calibre:SemiBold',sans-serif] text-[12px] font-bold uppercase tracking-[0.7px] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#446BF9] ${
            activeTab === 'details' ? 'bg-[#003160] text-white' : 'text-[#003160] hover:bg-[#CDD6E0]'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-[16px] py-[8px] rounded-[2px] font-['Calibre:SemiBold',sans-serif] text-[12px] font-bold uppercase tracking-[0.7px] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#446BF9] ${
            activeTab === 'items' ? 'bg-[#003160] text-white' : 'text-[#003160] hover:bg-[#CDD6E0]'
          }`}
        >
          Items
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`px-[16px] py-[8px] rounded-[2px] font-['Calibre:SemiBold',sans-serif] text-[12px] font-bold uppercase tracking-[0.7px] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#446BF9] ${
            activeTab === 'log' ? 'bg-[#003160] text-white' : 'text-[#003160] hover:bg-[#CDD6E0]'
          }`}
        >
          Log
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-[16px] py-[8px] rounded-[2px] font-['Calibre:SemiBold',sans-serif] text-[12px] font-bold uppercase tracking-[0.7px] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#446BF9] ${
            activeTab === 'documents' ? 'bg-[#003160] text-white' : 'text-[#003160] hover:bg-[#CDD6E0]'
          }`}
        >
          Documents
        </button>
      </div>

      {/* Validation error from "Validate and Send" — fixed just below the tab bar so it's visible regardless of scroll position */}
      {sendError && (
        <div
          className="fixed z-[60] bg-[#FDECEA] border border-[#F5C2C0] text-[#7A271A] text-[13px] px-[16px] py-[10px] rounded-[4px] shadow-md flex items-center gap-[12px]"
          style={{ top: `${headerHeight + TAB_BAR_HEIGHT + 12}px`, left: `${sidebarWidth + 20}px`, right: '20px' }}
        >
          <span className="flex-1">{sendError}</span>
          <button onClick={() => setSendError(null)} className="cursor-pointer hover:opacity-70">
            <X className="size-[14px]" />
          </button>
        </div>
      )}

      {/* Main content (Details/Items). Margin-right makes room for the panel
          so it genuinely pushes/resizes the content instead of overlaying it. */}
      <div
        className="flex-1 min-w-0 min-h-0 flex flex-col"
        style={{
          marginRight: `${pdfPreviewOpen ? panelWidth : 0}px`,
          transition: isResizingPanel ? 'none' : 'margin-right 300ms'
        }}
      >
      {activeTab === 'details' && (
      <div className="flex-1 min-h-0 overflow-auto">
      {/* Form Section */}
      <div className="flex-shrink-0 px-[10px] pb-[20px] bg-white pr-[20px] pl-[20px]">
        <div className="px-[0px] py-[20px] pt-[20px] pr-[0px] pb-[0px] pl-[0px]">
          <div className="flex gap-[24px]">
              {/* Freight & Invoices panel — compact, left side */}
              <div className="w-[260px] shrink-0">
                {/* Card: Fraktkostnader */}
                <div className="border border-gray-200 rounded-[6px] p-[12px] mb-[16px]">
                  <div className="flex items-center justify-between mb-[8px]">
                    <h3 className="text-[#003160] text-[13px] font-bold uppercase">Fraktkostnader</h3>
                    <div className="flex items-center gap-[6px] shrink-0">
                      {onEditClick && (
                        <button
                          onClick={onEditClick}
                          className="cursor-pointer hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#446BF9] rounded"
                          title="Edit"
                        >
                          <Pencil className="size-[13px] text-[#003160]" strokeWidth={2} />
                        </button>
                      )}
                      {!!record.freightAndCosts && (
                        <button
                          onClick={() => onUpdateRecord?.({ freightAndCosts: '' })}
                          className="cursor-pointer hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#446BF9] rounded"
                          title="Clear freight cost"
                        >
                          <X className="size-[13px] text-gray-400" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[12px] text-black font-[Roboto_Mono]">{record.freightAndCosts || '—'}</p>
                </div>

                {/* Card: Registrerade fakturor */}
                <div className="border border-gray-200 rounded-[6px] p-[12px] mb-[16px]">
                  <div className="flex items-center justify-between mb-[8px]">
                    <h3 className="text-[#003160] text-[13px] font-bold uppercase">Registrerade fakturor</h3>
                    {onEditClick && (
                      <button
                        onClick={onEditClick}
                        className="cursor-pointer hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#446BF9] rounded shrink-0"
                        title="Edit"
                      >
                        <Pencil className="size-[13px] text-[#003160]" strokeWidth={2} />
                      </button>
                    )}
                  </div>

                  {(!record.invoices || record.invoices.length === 0) && (
                    <p className="text-[11px] text-gray-400">No invoices registered</p>
                  )}

                  <div className="flex flex-col gap-[8px]">
                    {(record.invoices || []).map((invoice) => (
                      <div key={invoice.id} className="border border-gray-100 rounded-[4px] p-[8px] relative">
                        <button
                          onClick={() => {
                            const updatedInvoices = (record.invoices || []).filter((i) => i.id !== invoice.id);
                            onUpdateRecord?.(recomputeInvoiceAggregates(updatedInvoices));
                          }}
                          className="absolute top-[6px] right-[6px] cursor-pointer hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#446BF9] rounded"
                          title="Remove invoice"
                        >
                          <X className="size-[12px] text-gray-400" strokeWidth={2} />
                        </button>
                        <p className="text-[11px] font-semibold text-black pr-[16px] truncate">{invoice.invoiceNo || 'No number'}</p>
                        <p className="text-[10px] text-gray-500 mb-[4px]">{invoice.invoiceDate || '—'}</p>
                        <div className="grid grid-cols-2 gap-x-[8px] gap-y-[2px] text-[10px]">
                          <span className="text-gray-500">Currency</span>
                          <span className="text-right text-black">{invoice.currency || '—'}</span>
                          <span className="text-gray-500">Tot Amount</span>
                          <span className="text-right font-[Roboto_Mono] text-black">{invoice.totalAmount || '0.00'}</span>
                          <span className="text-gray-500">Gross Weight</span>
                          <span className="text-right font-[Roboto_Mono] text-black">{invoice.grossWeight || '0.00'}</span>
                          <span className="text-gray-500">Net Weight</span>
                          <span className="text-right font-[Roboto_Mono] text-black">{invoice.netWeight || '0.00'}</span>
                          <span className="text-gray-500">No of Parcels</span>
                          <span className="text-right font-[Roboto_Mono] text-black">{invoice.noOfParcels || '0'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grouped cards */}
              <div className="flex-1 min-w-0">
                {/* Card: Parties (read-only reference data set at creation, not tracked for completion) */}
                <div className="border border-gray-200 rounded-[6px] p-[16px] mb-[16px]">
                  <div className="mb-[12px] flex items-center justify-between">
                    <h3 className="text-[#003160] text-[15px] font-bold uppercase">Parties</h3>
                    {onEditClick && (
                      <button
                        onClick={onEditClick}
                        className="cursor-pointer hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#446BF9] rounded"
                        title="Edit declaration"
                      >
                        <Pencil className="size-[16px] text-[#003160]" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-x-[16px] gap-y-[12px]">
                    <div>
                      <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic text-[12px] text-nowrap tracking-[0.7px] uppercase mb-[4px]">
                        <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#ff8f00]">
                          <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-nowrap whitespace-pre font-bold">2</p>
                        </div>
                        <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
                          <p className="leading-[normal] overflow-ellipsis overflow-hidden text-nowrap whitespace-pre font-bold text-[11px]">Consignor</p>
                        </div>
                      </div>
                      <p className="text-[12px] text-black">{record.consignorName || 'Not specified'}</p>
                      <p className="text-[12px] text-black">{record.sender?.address || '—'}</p>
                    </div>
                    <div>
                      <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic text-[12px] text-nowrap tracking-[0.7px] uppercase mb-[4px]">
                        <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#ff8f00]">
                          <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-nowrap whitespace-pre font-bold">8</p>
                        </div>
                        <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
                          <p className="leading-[normal] overflow-ellipsis overflow-hidden text-nowrap whitespace-pre font-bold text-[11px]">Consignee</p>
                        </div>
                      </div>
                      <p className="text-[12px] text-black">{record.consigneeName || 'Not specified'}</p>
                      <p className="text-[12px] text-black">{record.consignee?.address || '—'}</p>
                    </div>
                    <div>
                      <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic text-[12px] text-nowrap tracking-[0.7px] uppercase mb-[4px]">
                        <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
                          <p className="leading-[normal] overflow-ellipsis overflow-hidden text-nowrap whitespace-pre font-bold text-[11px]">Org. No Consignee</p>
                        </div>
                      </div>
                      <p className="text-[12px] text-black mb-[4px]">{orgNoConsignee}</p>

                      {brregStatus === 'loading' && (
                        <span className="text-[11px] text-gray-400">Sjekker Brønnøysundregistrene…</span>
                      )}
                      {brregStatus === 'found' && (
                        <span className="inline-flex items-center gap-[4px] text-[11px] text-[#0F6E56] font-semibold">
                          <span className="w-[6px] h-[6px] rounded-full bg-[#52B89C] shrink-0" />
                          Registrert{brregName ? ` – ${brregName}` : ''}
                        </span>
                      )}
                      {brregStatus === 'not-found' && (
                        <span className="inline-flex items-center gap-[4px] text-[11px] text-[#854F0B] font-semibold">
                          <span className="w-[6px] h-[6px] rounded-full bg-[#F0997B] shrink-0" />
                          Ikke funnet i Brønnøysundregistrene
                        </span>
                      )}
                      {brregStatus === 'error' && (
                        <span className="text-[11px] text-gray-400">Kunne ikke sjekke registrering</span>
                      )}

                      <div className="mt-[4px]">
                        <a
                          href={`https://virksomhet.brreg.no/nb/oppslag/enheter/${orgNoConsignee}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#446BF9] hover:underline"
                        >
                          Se i Brønnøysundregistrene ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card: Klassificering & procedur */}
                <div className="border border-gray-200 rounded-[6px] p-[16px] mb-[16px]">
                  <div className="flex items-center justify-between mb-[12px]">
                    <h3 className="text-[#003160] text-[15px] font-bold uppercase">Classification &amp; Procedure</h3>
                    <span className={`text-[11px] font-semibold px-[8px] py-[2px] rounded-full ${groupStatus[0].complete ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAEEDA] text-[#854F0B]'}`}>
                      {groupStatus[0].filled}/{groupStatus[0].total}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-[16px] gap-y-[12px]">
                    <div className="flex gap-[8px]">
                      <CustomDropdown
                        label="Control No"
                        numberPrefix="48"
                        value={formData.controlNo}
                        options={['DailySettlement', 'Other']}
                        onChange={(value) => updateFormField('controlNo', value)}
                        tabIndex={1}
                        ref={controlNoRef}
                      />
                      <FormInput
                        label=""
                        numberPrefix=""
                        value={formData.controlNoExtra}
                        onChange={(value) => updateFormField('controlNoExtra', value)}
                        tabIndex={2}
                      />
                    </div>
                    <div className="flex gap-[8px]">
                      <CustomDropdown
                        label="Declaration"
                        numberPrefix="1"
                        value={formData.declarationType}
                        options={['EX', 'IM', 'EU', 'TR']}
                        onChange={(value) => updateFormField('declarationType', value)}
                        onBlur={() => handleFieldBlur('declarationType')}
                        isProposed={proposedFields.has('declarationType')}
                        tabIndex={3}
                      />
                      <CustomDropdown
                        label=""
                        numberPrefix=""
                        value={formData.exportType}
                        options={['t-Regular export', 'Other type']}
                        onChange={(value) => updateFormField('exportType', value)}
                        tabIndex={4}
                      />
                    </div>
                    <div>
                      <CustomDropdown
                        label="Message / Declaration Type"
                        numberPrefix=""
                        value={formData.declarationStatus}
                        options={['FU - Complete', 'KO - Correction', 'MA - Manual', 'FO - Temporary', 'EN - Final', 'EB - Recalculation', 'RE - Refund RE', 'SO - Consolidated Customs Clearance']}
                        onChange={(value) => updateFormField('declarationStatus', value)}
                        onBlur={() => handleFieldBlur('declarationStatus')}
                        isProposed={proposedFields.has('declarationStatus')}
                        tabIndex={5}
                      />
                    </div>
                    <div>
                      <CustomDropdown
                        label="Transaction Type"
                        numberPrefix="26"
                        value={formData.transactionType}
                        options={['01-Sale for compensation, financial leasing', '02-Return of goods', '03-Other']}
                        onChange={(value) => updateFormField('transactionType', value)}
                        onBlur={() => handleFieldBlur('transactionType')}
                        isProposed={proposedFields.has('transactionType')}
                        tabIndex={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Card: Referenser & gods */}
                <div className="border border-gray-200 rounded-[6px] p-[16px] mb-[16px]">
                  <div className="flex items-center justify-between mb-[12px]">
                    <h3 className="text-[#003160] text-[15px] font-bold uppercase">References &amp; Goods</h3>
                    <span className={`text-[11px] font-semibold px-[8px] py-[2px] rounded-full ${groupStatus[1].complete ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAEEDA] text-[#854F0B]'}`}>
                      {groupStatus[1].filled}/{groupStatus[1].total}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-[16px] gap-y-[12px]">
                    <FormInput
                      label="Reference No"
                      numberPrefix="7"
                      value={formData.referenceNo}
                      onChange={(value) => updateFormField('referenceNo', value)}
                      tabIndex={7}
                    />
                    <FormInput
                      label="Internal Reference"
                      numberPrefix=""
                      value={formData.internalReference}
                      onChange={(value) => updateFormField('internalReference', value)}
                      onBlur={() => handleFieldBlur('internalReference')}
                      isProposed={proposedFields.has('internalReference')}
                      tabIndex={8}
                    />
                    <div>
                      <CustomDropdown
                        label="Container"
                        numberPrefix="18"
                        value={formData.container}
                        options={['No', 'Yes']}
                        onChange={(value) => updateFormField('container', value)}
                        tabIndex={9}
                      />
                    </div>
                    <FormInput
                      label="Goods+ Position No"
                      numberPrefix="44"
                      value={formData.goodsPositionNo}
                      onChange={(value) => updateFormField('goodsPositionNo', value)}
                      tabIndex={10}
                    />
                    <FormInput
                      label="No of Parcels"
                      numberPrefix="6"
                      value={formData.noOfParcels}
                      onChange={(value) => updateFormField('noOfParcels', value)}
                      tabIndex={11}
                    />
                  </div>
                </div>

                {/* Card: Transport & rutt */}
                <div className="border border-gray-200 rounded-[6px] p-[16px] mb-[16px]">
                  <div className="flex items-center justify-between mb-[12px]">
                    <h3 className="text-[#003160] text-[15px] font-bold uppercase">Transport &amp; Route</h3>
                    <span className={`text-[11px] font-semibold px-[8px] py-[2px] rounded-full ${groupStatus[2].complete ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAEEDA] text-[#854F0B]'}`}>
                      {groupStatus[2].filled}/{groupStatus[2].total}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-[16px] gap-y-[12px]">
                    <CustomDropdown
                      label="Country of Dispatch"
                      numberPrefix="15A"
                      value={formData.countryDispatch}
                      options={COUNTRIES}
                      onChange={(value) => updateFormField('countryDispatch', value)}
                      tabIndex={12}
                    />
                    <CustomDropdown
                      label="Country of Destination"
                      numberPrefix="17A"
                      value={formData.countryDestination}
                      options={COUNTRIES}
                      onChange={(value) => updateFormField('countryDestination', value)}
                      onBlur={() => handleFieldBlur('countryDestination')}
                      isProposed={proposedFields.has('countryDestination')}
                      tabIndex={13}
                    />
                    <div className="flex gap-[8px]">
                      <CustomDropdown
                        label="Delivery Terms"
                        numberPrefix="20"
                        value={formData.deliveryTerms}
                        options={['FCA', 'FOB', 'CIF', 'EXW', 'DDP']}
                        onChange={(value) => updateFormField('deliveryTerms', value)}
                        tabIndex={14}
                      />
                      <FormInput
                        label="Delivery Place"
                        numberPrefix="25"
                        value={formData.deliveryPlace}
                        onChange={(value) => updateFormField('deliveryPlace', value)}
                        tabIndex={15}
                      />
                    </div>
                    <div className="flex gap-[8px]">
                      <CustomDropdown
                        label="Nationality at Border Crossing"
                        numberPrefix="21"
                        value={formData.nationality}
                        options={COUNTRIES}
                        onChange={(value) => updateFormField('nationality', value)}
                        tabIndex={16}
                      />
                      <FormInput
                        label=""
                        numberPrefix=""
                        value={formData.identityTransport}
                        onChange={(value) => updateFormField('identityTransport', value)}
                        tabIndex={17}
                      />
                    </div>
                    <CustomDropdown
                      label="Customs Office of Exit"
                      numberPrefix="29"
                      value={formData.customsOffice}
                      options={['0101 - Oslo - Tast', '0102 - Bergen', '0103 - Stavanger']}
                      onChange={(value) => updateFormField('customsOffice', value)}
                      tabIndex={18}
                    />
                    <CustomDropdown
                      label="Mode of Transport at the Border"
                      numberPrefix="25"
                      value={formData.transportMode}
                      options={['Mode of Transport At the Border', '2-Rail', '3-Road', '4-Air', '5-Sea']}
                      onChange={(value) => updateFormField('transportMode', value)}
                      tabIndex={19}
                    />
                    <CustomDropdown
                      label="Location of Goods"
                      numberPrefix="30"
                      value={formData.locationGoods}
                      options={['A - Tollager A', 'B - Tollager B', 'C - Tollager C']}
                      onChange={(value) => updateFormField('locationGoods', value)}
                      onBlur={() => handleFieldBlur('locationGoods')}
                      isProposed={proposedFields.has('locationGoods')}
                      tabIndex={20}
                    />
                  </div>
                </div>

                {/* Proposal Action Buttons */}
                {proposedFields.size > 0 && (
                  <div className="flex gap-[12px] mt-[8px] justify-end">
                    <button
                      onClick={handleCancelProposals}
                      tabIndex={21}
                      className="h-[36px] px-[24px] rounded-[2px] bg-white border border-[#e0e0e0] text-[#003160] font-['Inter'] font-semibold text-[12px] cursor-pointer hover:bg-[#f5f5f5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9]"
                    >
                      Cancel All
                    </button>
                    <button
                      onClick={handleSubmitProposals}
                      tabIndex={22}
                      autoFocus={proposedFields.size > 0}
                      className="h-[36px] px-[24px] rounded-[2px] bg-[#52B89C] text-white font-['Inter'] font-semibold text-[12px] cursor-pointer hover:bg-[#469c85] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9]"
                    >
                      Submit All Proposed
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
      </div>
      )}

      {activeTab === 'items' && (
      <div className="flex-1 min-h-0 overflow-auto">
      {/* Detail Table */}
      <div className="flex-1 px-[10px] pt-[20px] pb-[15px]">
        <div className="flex items-center justify-end gap-2 mb-[8px]">
          <ListPlus className="w-5 h-5 text-[#446BF9] cursor-pointer" strokeWidth={2} />
          <Calculator className="w-5 h-5 text-[#446BF9] cursor-pointer" strokeWidth={2} />
        </div>
        <GenericEditableTable
          columns={columns}
          data={detailData}
          idField="id"
          enableColumnChooser={true}
          enableSorting={true}
          enableTabNavigation={true}
          rowHeight="40px"
          onDataChange={handleDataChange}
        />
      </div>
      </div>
      )}

      {activeTab === 'log' && (
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex-1 px-[10px] pt-[20px] pb-[15px]">
          <h2 className="text-[#003160] text-[15px] font-bold uppercase mb-[16px]">Log</h2>
          {logsLoading ? (
            <p className="text-[13px] text-gray-400">Loading…</p>
          ) : logs.length === 0 ? (
            <p className="text-[13px] text-gray-400">No activity recorded yet.</p>
          ) : (
            <div className="flex flex-col">
              {logs.map((entry) => (
                <div key={entry.id} className="flex items-start gap-[16px] border-b border-gray-100 py-[10px]">
                  <p className="text-[11px] text-gray-400 font-[Roboto_Mono] whitespace-nowrap shrink-0 w-[160px]">
                    {new Date(entry.createdAt).toLocaleString('en-GB')}
                  </p>
                  <p className="text-[13px] text-black">{entry.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'documents' && (
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex-1 px-[10px] pt-[20px] pb-[15px]">
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="text-[#003160] text-[15px] font-bold uppercase">Documents</h2>
            <label className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[#446BF9] text-white text-[12px] font-semibold rounded-[2px] cursor-pointer hover:bg-[#3557d9] transition-colors">
              <Upload className="w-[14px] h-[14px]" />
              {documentUploading ? 'Uploading…' : 'Upload document'}
              <input
                type="file"
                className="hidden"
                disabled={documentUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadDocument(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          {documentError && (
            <p className="text-[12px] text-[#D0021B] mb-[12px]">{documentError}</p>
          )}

          {documentsLoading ? (
            <p className="text-[13px] text-gray-400">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="text-[13px] text-gray-400">No documents uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {documents.map((doc) => (
                <div key={doc.path} className="flex items-center justify-between border border-gray-200 rounded-[4px] px-[12px] py-[10px]">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#446BF9] text-[13px] hover:underline truncate flex items-center gap-[8px]"
                  >
                    <FileText className="w-[14px] h-[14px] shrink-0" />
                    {doc.name}
                  </a>
                  <div className="flex items-center gap-[16px] shrink-0">
                    <span className="text-[11px] text-gray-400 font-[Roboto_Mono]">{(doc.size / 1024).toFixed(1)} KB</span>
                    <button
                      onClick={() => handleDeleteDocument(doc.path)}
                      className="cursor-pointer hover:opacity-70 transition-opacity"
                      title="Delete document"
                    >
                      <Trash2 className="w-[14px] h-[14px] text-gray-400 hover:text-[#D0021B]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
      </div>

      {/* Document-preview panel — fixed independently of the tab bar's height
          reservation (it has no tab bar of its own), so it starts right below
          the header with a clean, small top gap instead of inheriting the
          tab bar's 60px band. Pushes content via the margin-right set above,
          rather than overlaying it. No real PDF template is wired up yet, so
          this renders a placeholder mockup using the actual record data. */}
      <div
        className="fixed overflow-hidden border-l border-gray-200 bg-neutral-50 z-40"
        style={{
          top: `${headerHeight}px`,
          right: 0,
          bottom: 0,
          width: `${pdfPreviewOpen ? panelWidth : 0}px`,
          transition: isResizingPanel ? 'none' : 'width 300ms'
        }}
      >
        <div className="h-full flex flex-col relative" style={{ width: `${panelWidth}px` }}>
          {/* Drag handle — grab the left edge to resize, up to 50% of the available width */}
          <div
            onMouseDown={handlePanelResizeStart}
            className="absolute left-0 top-0 bottom-0 w-[6px] -translate-x-1/2 cursor-col-resize z-10 group"
            title="Drag to resize"
          >
            <div className={`h-full w-[2px] mx-auto transition-colors ${isResizingPanel ? 'bg-[#446BF9]' : 'bg-transparent group-hover:bg-[#446BF9]'}`} />
          </div>

          <div className="flex items-center justify-between px-[16px] border-b border-gray-200 shrink-0 bg-neutral-50" style={{ height: '60px' }}>
            <h3 className="text-[#003160] text-[13px] font-bold uppercase">Document Preview</h3>
            <button
              onClick={onClosePdfPreview}
              className="cursor-pointer hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#446BF9] rounded"
              title="Close preview"
            >
              <X className="size-[18px] text-[#003160]" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-[16px]">
            <div className="bg-white border border-gray-300 shadow-sm mx-auto p-[20px]" style={{ maxWidth: Math.max(280, panelWidth - 72) }}>
              <div className="flex items-center justify-center gap-[8px] mb-[16px]">
                <FileText className="size-[16px] text-gray-400" strokeWidth={2} />
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.7px]">Single Administrative Document</p>
              </div>
              <p className="text-[14px] font-bold text-[#003160] text-center mb-[16px]">Customs Declaration</p>

              <div className="grid grid-cols-2 gap-[12px] text-[11px]">
                <div>
                  <p className="text-[9px] text-[#ff8f00] font-bold uppercase">1. Declaration</p>
                  <p className="text-black">{formData.declarationType || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#003160] font-bold uppercase">Declaration No</p>
                  <p className="text-black">{record.customsNo || '—'}</p>
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-[8px]">
                  <p className="text-[9px] text-[#ff8f00] font-bold uppercase">2. Consignor</p>
                  <p className="text-black">{record.consignorName || '—'}</p>
                  <p className="text-black">{record.sender?.address || ''}</p>
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-[8px]">
                  <p className="text-[9px] text-[#ff8f00] font-bold uppercase">8. Consignee</p>
                  <p className="text-black">{record.consigneeName || '—'}</p>
                  <p className="text-black">{record.consignee?.address || ''}</p>
                </div>
                <div className="border-t border-gray-100 pt-[8px]">
                  <p className="text-[9px] text-[#ff8f00] font-bold uppercase">48. Control No</p>
                  <p className="text-black">{formData.controlNo || '—'}</p>
                </div>
                <div className="border-t border-gray-100 pt-[8px]">
                  <p className="text-[9px] text-[#003160] font-bold uppercase">Date</p>
                  <p className="text-black">{record.declared || '—'}</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-[16px] px-[8px]">
              Placeholder preview — connect a real PDF template to replace this mockup with the actual declaration document layout.
            </p>
          </div>
        </div>
      </div>

      {/* Add Article Modal */}
      <AddArticleModal
        isOpen={isAddArticleModalOpen}
        onClose={() => setIsAddArticleModalOpen(false)}
        initialArticleName={newArticleSearchQuery}
        onSave={handleSaveArticle}
      />
    </div>
    </>
  );
});

DetailView.displayName = 'DetailView';