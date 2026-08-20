import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getSectionIcon } from './config/sectionIcons';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { FilterBar } from './components/FilterBar';
import { SearchBar } from './components/SearchBar';
import { DataTable } from './components/DataTable';
import { DetailView, type DetailViewRef } from './components/DetailView';

import { AddAssignmentModal } from './components/AddAssignmentModal';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { CreateTemplateModal } from './components/CreateTemplateModal';
import { ReorderTabsModal } from './components/ReorderTabsModal';
import { FilterDrawer, type FilterCriteria } from './components/FilterDrawer';
import { ColumnVisibilityModal, type ColumnVisibility } from './components/ColumnVisibilityModal';
import type { TableRowData } from './components/TableRow';
import { migrateRecords } from './components/TableRow';
import { fetchDeclarations, createDeclaration, updateDeclaration, deleteDeclaration } from './lib/declarationsApi';
import { addLog } from './lib/logsApi';

export interface FilterTemplate {
  id: string;
  name: string;
  criteria: FilterCriteria;
}

// Data for generating assignments - GENERIC COMPANIES
export const COMPANIES = [
  { name: 'Global Logistics Inc', address: '123 Harbor Street, Port City 12345' },
  { name: 'Tech Solutions Corp', address: '456 Innovation Drive, Tech Park 67890' },
  { name: 'Energy Systems Ltd', address: '789 Power Avenue, Energy District 11223' },
  { name: 'Food Distribution Co', address: '321 Supply Chain Road, Commerce Center 44556' },
  { name: 'Retail Network Group', address: '654 Market Street, Shopping District 77889' },
  { name: 'Wholesale Partners LLC', address: '987 Distribution Way, Logistics Hub 99001' },
  { name: 'Telecom Services Inc', address: '147 Network Boulevard, Communications Plaza 22334' },
  { name: 'Financial Services Group', address: '258 Banking Avenue, Finance District 55667' },
  { name: 'Insurance Holdings Corp', address: '369 Security Street, Insurance Plaza 88990' },
  { name: 'Chemical Industries Ltd', address: '741 Industrial Road, Chemical Park 11224' },
  { name: 'Engineering Solutions AS', address: '852 Technical Avenue, Engineering District 33445' },
  { name: 'Defense Systems Group', address: '963 Security Boulevard, Defense Complex 66778' },
  { name: 'Aquaculture International', address: '159 Ocean Drive, Marine District 99112' },
  { name: 'Materials Processing Inc', address: '267 Manufacturing Road, Industrial Zone 22335' },
  { name: 'Marine Products Corp', address: '378 Coastal Highway, Seafood District 55668' },
  { name: 'IT Services Network', address: '489 Technology Street, Digital Campus 88991' },
  { name: 'Geophysical Data Ltd', address: '591 Science Avenue, Research Park 11225' },
  { name: 'Automation Systems Co', address: '612 Robotics Road, Innovation Center 44558' },
  { name: 'Energy Resources Inc', address: '723 Power Street, Utility District 77881' },
  { name: 'Shipping Management Group', address: '834 Maritime Boulevard, Port Complex 99003' }
];

export const CUSTOMS_OFFICES = [
  { name: 'Central Processing Office', address: '100 Government Plaza, District A 10001' },
  { name: 'Northern Regional Office', address: '200 Civic Center, District B 20002' },
  { name: 'Southern Regional Office', address: '300 Administration Way, District C 30003' },
  { name: 'Eastern Processing Center', address: '400 Federal Building, District D 40004' },
  { name: 'Western Clearance Hub', address: '500 Customs Plaza, District E 50005' },
  { name: 'Coastal Processing Facility', address: '600 Border Street, District F 60006' }
];

const CASE_MANAGERS = [
  'Alex Thompson', 'Jordan Williams', 'Morgan Davis', 'Taylor Martinez', 'Casey Anderson',
  'Riley Johnson', 'Drew Wilson', 'Cameron Brown', 'Avery Garcia', 'Parker Rodriguez',
  'Quinn Martinez', 'Sage Lee', 'River White', 'Skyler Harris', 'Dakota Clark'
];

const DESCRIPTIONS = [
  'Electronic components', 'Food products and beverages', 'Telecommunications equipment',
  'Machinery and tools', 'Medical supplies', 'Textile products', 'Automotive parts',
  'Pharmaceutical products', 'Industrial chemicals', 'Construction materials',
  'Office equipment', 'Computer hardware', 'Sporting goods', 'Furniture and fixtures',
  'Plastic raw materials', 'Metal components', 'Paper products', 'Cosmetic products',
  'Agricultural equipment', 'Marine equipment'
];

const TRANSPORT_IDS = [
  'TS Northern Star', 'TS Pacific Wave', 'TS Atlantic Trader', 'TS Southern Cross', 'TS Arctic Express',
  'TS Global Carrier', 'TS Ocean Voyager', 'TS Coastal Runner', 'TS Maritime Pride', 'TS Harbor Master'
];

const CUSTOMS_RECEIPTS = [
  'Section 4-1-27 (3a) Standard Import Classification',
  'Section 4-1-27 (3b) Domestic Products',
  'Section 4-1-27 (3c) Foreign Goods Under Processing',
  'Section 4-1-27 (4a) Transit Merchandise',
  'Section 4-1-27 (4b) Temporary Import Status',
  'Section 4-1-27 (5a) Duty Applicable Goods',
  'Section 4-1-27 (5b) Tax Applicable Goods',
  'Section 4-1-27 (6a) Free Trade Agreement Category A',
  'Section 4-1-27 (6b) Free Trade Agreement Category B'
];

let orderCounter = 12876;

const generateAssignment = (status: 'C' | 'PO' | 'O', baseDate: number): TableRowData => {
  const goodsNoBase = 277650 + orderCounter++;
  
  const sender = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  const consignee = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  const owner = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  
  // Generate type badge (C, E, or P)
  const typeBadgeOptions: ('C' | 'E' | 'P')[] = ['C', 'E', 'P'];
  const typeBadge = typeBadgeOptions[Math.floor(Math.random() * typeBadgeOptions.length)];
  
  // Generate customs number
  const customsNo = `${Math.floor(Math.random() * 9000) + 1000}`;
  
  // Generate dates
  const declaredDate = new Date(baseDate);
  declaredDate.setDate(declaredDate.getDate() - Math.floor(Math.random() * 30));
  const declaredStr = Math.random() > 0.3 ? `${String(declaredDate.getDate()).padStart(2, '0')}/${String(declaredDate.getMonth() + 1).padStart(2, '0')}/${String(declaredDate.getFullYear()).slice(-2)}` : '';
  
  const processedDate = new Date(baseDate);
  processedDate.setDate(processedDate.getDate() - Math.floor(Math.random() * 20));
  const processedStr = Math.random() > 0.5 ? `${String(processedDate.getDate()).padStart(2, '0')}/${String(processedDate.getMonth() + 1).padStart(2, '0')}/${String(processedDate.getFullYear()).slice(-2)}` : '';
  
  // Generate other fields
  const referenceDeclaration = Math.random() > 0.6 ? `REF-${Math.floor(Math.random() * 10000)}` : '';
  const recalculatedFrom = Math.random() > 0.7 ? `${Math.floor(Math.random() * 90000) + 10000}` : '';
  const invoiceNo = Math.random() > 0.4 ? `INV-${Math.floor(Math.random() * 10000)}` : '';
  const value = `${(Math.random() * 100000 + 10000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  
  // Generate currency and weights
  const currencies = ['USD', 'EUR', 'GBP', 'NOK', 'SEK'];
  const currency = currencies[Math.floor(Math.random() * currencies.length)];
  const netWeight = `${(Math.random() * 10000 + 1000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  const grossWeight = `${(parseFloat(netWeight.replace(/,/g, '')) + Math.random() * 2000 + 500).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  
  return {
    id: `${Date.now()}-${Math.random()}`,
    status,
    goodsNo: `2025 ${String(Math.floor(goodsNoBase / 1000)).padStart(5, '0')} ${goodsNoBase}`,
    typeBadge,
    customsNo,
    declared: declaredStr,
    processed: processedStr,
    referenceDeclaration,
    recalculatedFrom,
    invoiceNo,
    consignorName: sender.name,
    consigneeName: consignee.name,
    value,
    currency,
    netWeight,
    grossWeight,
    sender,
    consignee,
    owner
  };
};

const generateInitialData = (): TableRowData[] => {
  const data: TableRowData[] = [];
  
  // Generate 5 sample records for demo purposes
  const statuses: ('C' | 'PO' | 'O')[] = ['C', 'PO', 'O', 'C', 'PO'];
  const baseDate = Date.now();
  
  for (let i = 0; i < 5; i++) {
    data.push(generateAssignment(statuses[i], baseDate - (i * 86400000)));
  }
  
  return data;
};

// Generic warehouse management data
const initialData: TableRowData[] = migrateRecords(generateInitialData());

// LocalStorage keys
const STORAGE_KEYS = {
  FILTER_TEMPLATES: 'warehouseApp_filterTemplates',
  CURRENT_FILTER: 'warehouseApp_currentFilter',
  FILTER_CRITERIA: 'warehouseApp_filterCriteria',
  TAB_ORDER: 'warehouseApp_tabOrder',
  FAVORITE_TAB: 'warehouseApp_favoriteTab',
  TABLE_DATA: 'warehouseApp_tableData'
};

// Default tab order
const DEFAULT_TAB_ORDER = ['all', 'open', 'created', 'error', 'message', 'sent', 'processed', 'temporary', 'draft'];

// Demo Personal tabs for prototype/demo purposes
const DEMO_PERSONAL_TABS: FilterTemplate[] = [
  {
    id: 'demo-open-eu-trade',
    name: 'Open EU Trade',
    criteria: {
      status: ['O', 'PO'],
      type: ['EU'],
      goodsNo: '',
      sender: '',
      consignee: '',
      owner: '',
      declaredFrom: '',
      declaredTo: '',
      processedFrom: '',
      processedTo: '',
      exclusions: {}
    }
  },
  {
    id: 'demo-cleared-exports',
    name: 'Cleared Exports',
    criteria: {
      status: ['C'],
      type: ['EX'],
      goodsNo: '',
      sender: '',
      consignee: '',
      owner: '',
      declaredFrom: '',
      declaredTo: '',
      processedFrom: '',
      processedTo: '',
      exclusions: {}
    }
  },
  {
    id: 'demo-pending-review',
    name: 'Pending Review',
    criteria: {
      status: ['O', 'PO'],
      type: [],
      goodsNo: '',
      sender: '',
      consignee: '',
      owner: '',
      declaredFrom: '',
      declaredTo: '',
      processedFrom: '',
      processedTo: '',
      exclusions: {}
    }
  }
];

function App() {
  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Navigation state
  const [activeMainTitle, setActiveMainTitle] = useState('Application');
  const [activeSubLink, setActiveSubLink] = useState('Sub Link 1');
  
  // Detail view state
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Live totals computed from the Items table inside DetailView, used to drive
  // the "...used" / "...remains" figures in the TopBar. Reset whenever the
  // open record changes so stale numbers from a previous record don't leak in.
  const [itemsSummary, setItemsSummary] = useState<{ totalAmount: number; totalNetWeight: number; totalGrossWeight: number; totalNoOfParcels: number } | null>(null);

  useEffect(() => {
    setItemsSummary(null);
  }, [selectedRecordId]);

  // Whether the document-preview side panel is open in DetailView. Lives here
  // (rather than inside DetailView) because the icon that toggles it sits in
  // TopBar, a sibling component.
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  // Lets TopBar's "Validate and Send" button trigger DetailView's own
  // validation/send logic, since the data it needs (GENERAL form, Items
  // totals) only lives inside DetailView.
  const detailViewRef = useRef<DetailViewRef>(null);

  useEffect(() => {
    setPdfPreviewOpen(false);
  }, [selectedRecordId]);

  // Actual measured height of the fixed TopBar, so DetailView can offset
  // itself correctly instead of relying on a hardcoded pixel value.
  const [topBarHeight, setTopBarHeight] = useState(0);
  
  // Confirmation dialog state
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [createdDeclarationNo, setCreatedDeclarationNo] = useState('');
  const [createdDeclarationId, setCreatedDeclarationId] = useState('');
  
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => {
    const saved = localStorage.getItem('warehouseApp_columnVisibility');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          checkbox: true,
          status: true,
          typeBadge: true,
          customsNo: true,
          declared: true,
          processed: true,
          referenceDeclaration: true,
          recalculatedFrom: true,
          invoiceNo: true,
          consignorName: true,
          consigneeName: true,
          value: true,
          currency: true,
          netWeight: true,
          grossWeight: true,
          actions: true
        };
      }
    }
    return {
      checkbox: true,
      status: true,
      typeBadge: true,
      customsNo: true,
      declared: true,
      processed: true,
      referenceDeclaration: true,
      recalculatedFrom: true,
      invoiceNo: true,
      consignorName: true,
      consigneeName: true,
      value: true,
      currency: true,
      netWeight: true,
      grossWeight: true,
      actions: true
    };
  });
  
  const [columnVisibilityModalOpen, setColumnVisibilityModalOpen] = useState(false);
  
  // Data state — loaded from Supabase (shared across everyone visiting the
  // demo URL, replacing the old per-browser localStorage store).
  const [data, setData] = useState<TableRowData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDataLoading(true);
    fetchDeclarations()
      .then((rows) => {
        if (cancelled) return;
        setData(rows);
        setDataError(null);
      })
      .catch((err) => {
        console.error('Error loading declarations from Supabase:', err);
        if (!cancelled) setDataError(err.message || 'Failed to load declarations');
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalKey, setAddModalKey] = useState(0); // Key to force modal reset
  const [editingRecord, setEditingRecord] = useState<TableRowData | null>(null); // For edit mode
  
  // Filter state
  const [currentFilter, setCurrentFilter] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_FILTER) || 'all';
  });
  
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const defaultCriteria: FilterCriteria = {
    status: [],
    type: [],
    goodsNo: '',
    sender: '',
    consignee: '',
    owner: '',
    declaredFrom: '',
    declaredTo: '',
    processedFrom: '',
    processedTo: '',
    exclusions: {}
  };
  
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FILTER_CRITERIA);
    return saved ? JSON.parse(saved) : defaultCriteria;
  });
  
  // Template state
  const [templates, setTemplates] = useState<FilterTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FILTER_TEMPLATES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : DEMO_PERSONAL_TABS;
      } catch {
        return DEMO_PERSONAL_TABS;
      }
    }
    return DEMO_PERSONAL_TABS;
  });
  
  const [createTemplateModalOpen, setCreateTemplateModalOpen] = useState(false);
  const [templateNameToCreate, setTemplateNameToCreate] = useState('');
  
  // Tab reordering
  const [tabOrder, setTabOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAB_ORDER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : DEFAULT_TAB_ORDER;
      } catch {
        return DEFAULT_TAB_ORDER;
      }
    }
    return DEFAULT_TAB_ORDER;
  });
  
  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  
  // Selection state for bulk operations
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  
  // Track manually added filters
  const [manuallyAddedFilters, setManuallyAddedFilters] = useState<Set<string>>(new Set());
  
  // Default criteria for each filter type — the 9 built-in tabs (All/Open/
  // Created/Error/Message/Sent/Processed/Temporary/Draft) filter directly
  // against stage/status/processed in filteredData below, not through the
  // detailed FilterCriteria panel, so they all just reset it to blank.
  // Only saved templates carry their own real criteria.
  const getDefaultCriteriaForFilter = useCallback((filterId: string): FilterCriteria => {
    const baseDefault: FilterCriteria = {
      status: [],
      type: [],
      goodsNo: '',
      sender: '',
      consignee: '',
      owner: '',
      declaredFrom: '',
      declaredTo: '',
      processedFrom: '',
      processedTo: '',
      exclusions: {}
    };
    
    const template = templates.find(t => t.id === filterId);
    return template ? { ...template.criteria } : baseDefault;
  }, [templates]);
  
  // Persist filter criteria
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTER_CRITERIA, JSON.stringify(filterCriteria));
  }, [filterCriteria]);
  
  // Persist current filter
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_FILTER, currentFilter);
  }, [currentFilter]);
  
  // Persist templates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTER_TEMPLATES, JSON.stringify(templates));
  }, [templates]);
  
  // Persist tab order
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAB_ORDER, JSON.stringify(tabOrder));
  }, [tabOrder]);
  
  // Persist column visibility
  useEffect(() => {
    localStorage.setItem('warehouseApp_columnVisibility', JSON.stringify(columnVisibility));
  }, [columnVisibility]);
  
  // Note: `data` no longer needs a localStorage-persist effect — every
  // mutation (create/update/delete/patch below) writes straight to Supabase,
  // and `data` itself is just the local in-memory mirror of what's there.
  

  const handleColumnVisibilityChange = useCallback((column: keyof ColumnVisibility, visible: boolean) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: visible
    }));
  }, []);
  
  // Check if current filter criteria differs from its default
  const hasModifiedFilters = useMemo(() => {
    const defaultForCurrentFilter = getDefaultCriteriaForFilter(currentFilter);
    
    // Compare each field
    const fieldsToCheck: (keyof FilterCriteria)[] = [
      'status', 'type', 'goodsNo', 'sender', 'consignee', 'owner',
      'declaredFrom', 'declaredTo', 'processedFrom', 'processedTo'
    ];
    
    return fieldsToCheck.some(field => {
      const currentValue = filterCriteria[field];
      const defaultValue = defaultForCurrentFilter[field];
      
      if (Array.isArray(currentValue) && Array.isArray(defaultValue)) {
        return JSON.stringify(currentValue.sort()) !== JSON.stringify(defaultValue.sort());
      }
      
      return currentValue !== defaultValue;
    });
  }, [filterCriteria, currentFilter, getDefaultCriteriaForFilter]);
  
  // Handle filter change
  const handleFilterChange = useCallback((filter: string) => {
    setCurrentFilter(filter);
    const newCriteria = getDefaultCriteriaForFilter(filter);
    setFilterCriteria(newCriteria);
    setManuallyAddedFilters(new Set());
    setSelectedRows(new Set());
    setIsSelectAllChecked(false);
  }, [getDefaultCriteriaForFilter]);
  
  // Handle individual filter field change
  const handleFilterCriteriaChange = useCallback((field: keyof FilterCriteria, value: string | string[]) => {
    setFilterCriteria(prev => {
      const updated = { ...prev, [field]: value };
      
      // Track manually added filters
      const defaultForCurrentFilter = getDefaultCriteriaForFilter(currentFilter);
      const defaultValue = defaultForCurrentFilter[field];
      
      setManuallyAddedFilters(prevManual => {
        const newManual = new Set(prevManual);
        
        // Check if this field has been changed from default
        const isChanged = Array.isArray(value) && Array.isArray(defaultValue)
          ? JSON.stringify(value.sort()) !== JSON.stringify(defaultValue.sort())
          : value !== defaultValue;
        
        if (isChanged && value && (Array.isArray(value) ? value.length > 0 : true)) {
          newManual.add(field);
        } else {
          newManual.delete(field);
        }
        
        return newManual;
      });
      
      return updated;
    });
  }, [currentFilter, getDefaultCriteriaForFilter]);
  
  // Handle removing a specific filter
  const handleRemoveFilter = useCallback((field: string) => {
    setFilterCriteria(prev => {
      const updated = { ...prev };
      const fieldKey = field as keyof FilterCriteria;
      
      if (Array.isArray(updated[fieldKey])) {
        (updated[fieldKey] as string[]) = [];
      } else {
        (updated[fieldKey] as string) = '';
      }
      
      // Also clear exclusion for this field
      if (updated.exclusions) {
        const exclusionKey = fieldKey as keyof typeof updated.exclusions;
        if (exclusionKey in updated.exclusions) {
          updated.exclusions = { ...updated.exclusions, [exclusionKey]: false };
        }
      }
      
      return updated;
    });
    
    setManuallyAddedFilters(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  }, []);
  
  // Clear all manually added filters
  const handleClearFilters = useCallback(() => {
    setFilterCriteria(prev => {
      const updated = { ...prev };
      
      manuallyAddedFilters.forEach(field => {
        const fieldKey = field as keyof FilterCriteria;
        if (Array.isArray(updated[fieldKey])) {
          (updated[fieldKey] as string[]) = [];
        } else if (fieldKey !== 'exclusions') {
          (updated[fieldKey] as string) = '';
        }
      });
      
      // Clear all exclusions for manually added filters
      if (updated.exclusions) {
        const clearedExclusions = { ...updated.exclusions };
        manuallyAddedFilters.forEach(field => {
          const exclusionKey = field as keyof typeof updated.exclusions;
          if (exclusionKey in clearedExclusions) {
            (clearedExclusions as any)[exclusionKey] = false;
          }
        });
        updated.exclusions = clearedExclusions;
      }
      
      return updated;
    });
    
    setManuallyAddedFilters(new Set());
  }, [manuallyAddedFilters]);
  
  // Create new template
  const handleCreateTemplate = useCallback(() => {
    setCreateTemplateModalOpen(true);
  }, []);
  
  const handleConfirmCreateTemplate = useCallback((name: string) => {
    const newTemplate: FilterTemplate = {
      id: `template_${Date.now()}`,
      name,
      criteria: { ...filterCriteria }
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setTabOrder(prev => [...prev, newTemplate.id]);
    setCurrentFilter(newTemplate.id);
    setManuallyAddedFilters(new Set());
    setCreateTemplateModalOpen(false);
  }, [filterCriteria]);
  
  // Save template
  const handleSaveTemplate = useCallback(() => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === currentFilter
          ? { ...t, criteria: { ...filterCriteria } }
          : t
      )
    );
    setManuallyAddedFilters(new Set());
  }, [currentFilter, filterCriteria]);
  
  // Rename template
  const handleRenameTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const newName = prompt('Enter new name for template:', template.name);
    if (newName && newName.trim()) {
      setTemplates(prev =>
        prev.map(t =>
          t.id === templateId
            ? { ...t, name: newName.trim() }
            : t
        )
      );
    }
  }, [templates]);
  
  // Delete template
  const handleDeleteTemplate = useCallback((templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setTabOrder(prev => prev.filter(id => id !== templateId));
      
      if (currentFilter === templateId) {
        setCurrentFilter('all');
        setFilterCriteria(defaultCriteria);
        setManuallyAddedFilters(new Set());
      }
    }
  }, [currentFilter, defaultCriteria]);
  
  // Handle tab reordering
  const handleReorderTabs = useCallback((newOrder: string[]) => {
    setTabOrder(newOrder);
    setReorderModalOpen(false);
  }, []);
  
  // Apply filters to data
  const filteredData = useMemo(() => {
    let result = data;
    
    // Apply search query first — matched against fields that actually exist on
    // TableRowData today (customsNo/referenceDeclaration/invoiceNo/consignor/
    // consignee replaced the old order/description/transportId/etc. fields).
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.customsNo.toLowerCase().includes(query) ||
        item.goodsNo.toLowerCase().includes(query) ||
        item.referenceDeclaration.toLowerCase().includes(query) ||
        item.invoiceNo.toLowerCase().includes(query) ||
        item.consignorName.toLowerCase().includes(query) ||
        item.consigneeName.toLowerCase().includes(query) ||
        item.sender.name.toLowerCase().includes(query) ||
        item.consignee.name.toLowerCase().includes(query) ||
        item.owner.name.toLowerCase().includes(query)
      );
    }

    // Tab-level filter — the 9 built-in FilterBar tabs each check a specific,
    // real condition directly (not via the detailed FilterCriteria panel).
    // Saved templates and 'all' skip this and rely on the panel criteria below.
    switch (currentFilter) {
      case 'open':
        result = result.filter(item => item.status === 'O' || item.status === 'PO');
        break;
      case 'created':
        result = result.filter(item => (item.stage || 'created') === 'created');
        break;
      case 'error':
        result = result.filter(item => item.stage === 'error');
        break;
      case 'message':
        result = result.filter(item => item.stage === 'message');
        break;
      case 'sent':
        result = result.filter(item => item.stage === 'sent');
        break;
      case 'processed':
        result = result.filter(item => !!item.processed);
        break;
      case 'temporary':
        result = result.filter(item => item.stage === 'temporary');
        break;
      case 'draft':
        result = result.filter(item => item.stage === 'draft');
        break;
      // 'all' and template ids: no tab-level filter here.
    }
    
    // Status filter (multi-select — matches any of the selected statuses)
    if (filterCriteria.status && filterCriteria.status.length > 0) {
      const isExcluded = filterCriteria.exclusions?.status;
      result = result.filter(item => {
        const matches = filterCriteria.status.includes(item.status);
        return isExcluded ? !matches : matches;
      });
    }

    // Type filter (multi-select — EX/IM/EU classification)
    if (filterCriteria.type && filterCriteria.type.length > 0) {
      const isExcluded = filterCriteria.exclusions?.type;
      result = result.filter(item => {
        const matches = !!item.declarationType && filterCriteria.type.includes(item.declarationType);
        return isExcluded ? !matches : matches;
      });
    }

    // Date range filters — dates are stored as DD.MM.YYYY strings, so compare
    // via Date objects rather than string comparison.
    const parseDMY = (s: string): number | null => {
      if (!s) return null;
      const parts = s.split('.');
      if (parts.length !== 3) return null;
      const [d, m, y] = parts.map(Number);
      if (!d || !m || !y) return null;
      return new Date(y, m - 1, d).getTime();
    };

    if (filterCriteria.declaredFrom || filterCriteria.declaredTo) {
      const isExcluded = filterCriteria.exclusions?.declaredFrom || filterCriteria.exclusions?.declaredTo;
      const from = parseDMY(filterCriteria.declaredFrom);
      const to = parseDMY(filterCriteria.declaredTo);
      result = result.filter(item => {
        const itemDate = parseDMY(item.declared);
        if (itemDate === null) return isExcluded ? true : false;
        const matches = (from === null || itemDate >= from) && (to === null || itemDate <= to);
        return isExcluded ? !matches : matches;
      });
    }

    if (filterCriteria.processedFrom || filterCriteria.processedTo) {
      const isExcluded = filterCriteria.exclusions?.processedFrom || filterCriteria.exclusions?.processedTo;
      const from = parseDMY(filterCriteria.processedFrom);
      const to = parseDMY(filterCriteria.processedTo);
      result = result.filter(item => {
        const itemDate = parseDMY(item.processed);
        if (itemDate === null) return isExcluded ? true : false;
        const matches = (from === null || itemDate >= from) && (to === null || itemDate <= to);
        return isExcluded ? !matches : matches;
      });
    }
    
    // Text filters — only fields that actually exist on TableRowData today.
    const textFilters: (keyof FilterCriteria)[] = ['goodsNo'];
    
    textFilters.forEach(field => {
      const value = filterCriteria[field];
      if (value && typeof value === 'string' && value.trim()) {
        const isExcluded = filterCriteria.exclusions?.[field as keyof typeof filterCriteria.exclusions];
        result = result.filter(item => {
          const itemValue = item[field as keyof TableRowData];
          const matches = typeof itemValue === 'string' && itemValue.toLowerCase().includes(value.toLowerCase());
          return isExcluded ? !matches : matches;
        });
      }
    });
    
    // Company filters (sender, consignee, owner)
    const companyFilters: (keyof FilterCriteria)[] = ['sender', 'consignee', 'owner'];
    
    companyFilters.forEach(field => {
      const value = filterCriteria[field];
      if (value && typeof value === 'string' && value.trim()) {
        const isExcluded = filterCriteria.exclusions?.[field as keyof typeof filterCriteria.exclusions];
        result = result.filter(item => {
          const itemValue = item[field as keyof TableRowData];
          const matches = typeof itemValue === 'object' && 'name' in itemValue &&
            (itemValue.name.toLowerCase().includes(value.toLowerCase()) ||
             itemValue.address.toLowerCase().includes(value.toLowerCase()));
          return isExcluded ? !matches : matches;
        });
      }
    });
    
    return result;
  }, [data, filterCriteria, searchQuery, currentFilter]);
  
  // Calculate counts for filter tabs
  const filterCounts = useMemo(() => {
    const all = data.length;
    const open = data.filter(item => item.status === 'O' || item.status === 'PO').length;
    const created = data.filter(item => (item.stage || 'created') === 'created').length;
    const error = data.filter(item => item.stage === 'error').length;
    const message = data.filter(item => item.stage === 'message').length;
    const sent = data.filter(item => item.stage === 'sent').length;
    const processed = data.filter(item => !!item.processed).length;
    const temporary = data.filter(item => item.stage === 'temporary').length;
    const draft = data.filter(item => item.stage === 'draft').length;
    
    return { all, open, created, error, message, sent, processed, temporary, draft };
  }, [data]);
  
  // Calculate template counts
  const templateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    
    templates.forEach(template => {
      let result = data;
      
      if (template.criteria.status && template.criteria.status.length > 0) {
        result = result.filter(item => template.criteria.status.includes(item.status));
      }
      
      if (template.criteria.type && template.criteria.type.length > 0) {
        result = result.filter(item => !!item.declarationType && template.criteria.type.includes(item.declarationType));
      }
      
      counts.set(template.id, result.length);
    });
    
    return counts;
  }, [data, templates]);
  

  
  // Handle add new assignment
  const handleAddAssignment = useCallback((assignment: Omit<TableRowData, 'id'>) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticRow: TableRowData = { ...assignment, id: tempId };

    setData(prev => [optimisticRow, ...prev]);
    setCreatedDeclarationNo(assignment.customsNo);
    setCreatedDeclarationId(tempId);
    setConfirmationDialogOpen(true);

    // Insert into Supabase in the background — the modal's onSave contract
    // is synchronous (it needs a declaration number back immediately to
    // show the confirmation dialog), so we optimistically show the row now
    // and reconcile its real id once the insert resolves. On failure, roll
    // the optimistic row back out.
    createDeclaration(assignment)
      .then((saved) => {
        setData(prev => prev.map(row => (row.id === tempId ? saved : row)));
        setCreatedDeclarationId((current) => (current === tempId ? saved.id : current));
        // If the user already clicked through to the detail view before this
        // resolved, they're currently looking at the temp id — swap it to
        // the real one so DetailView doesn't suddenly stop finding its record.
        setSelectedRecordId((current) => (current === tempId ? saved.id : current));
        addLog(saved.id, 'created', 'Declaration created').catch((err) => {
          console.error('Error writing log entry:', err);
        });
      })
      .catch((err) => {
        console.error('Error creating declaration in Supabase:', err);
        setData(prev => prev.filter(row => row.id !== tempId));
      });

    return assignment.customsNo;
  }, []);
  
  // Handle confirmation dialog actions
  const handleProceedToDetail = useCallback(() => {
    setConfirmationDialogOpen(false);
    
    // Clear the form data for the new declaration in DetailView
    if (createdDeclarationId) {
      try {
        const formStorageKey = `customs_declaration_form_${createdDeclarationId}`;
        localStorage.removeItem(formStorageKey);
      } catch (error) {
        console.error('Error clearing declaration form:', error);
      }
    }
    
    setSelectedRecordId(createdDeclarationId);
  }, [createdDeclarationId]);
  
  const handleCreateNewDeclaration = useCallback(() => {
    setConfirmationDialogOpen(false);
    setAddModalOpen(true);
    setAddModalKey(prev => prev + 1); // Force modal reset
  }, []);
  
  const handleCloseConfirmation = useCallback(() => {
    setConfirmationDialogOpen(false);
  }, []);
  
  // Handle navigate to detail from modal
  const handleNavigateToDetailFromModal = useCallback((declarationNo: string) => {
    const record = data.find(r => r.customsNo === declarationNo);
    if (record) {
      setSelectedRecordId(record.id);
    }
  }, [data]);
  
  // Handle row selection for bulk operations
  const handleRowSelect = useCallback((id: string, selected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);
  
  const handleSelectAll = useCallback((selected: boolean) => {
    setIsSelectAllChecked(selected);
    if (selected) {
      setSelectedRows(new Set(filteredData.map(item => item.id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [filteredData]);
  
  // Handle row click for navigation to detail view
  const handleRowClick = useCallback((id: string) => {
    setSelectedRecordId(id);
  }, []);
  
  // Handle back from detail view
  const handleBackFromDetail = useCallback(() => {
    setSelectedRecordId(null);
  }, []);
  
  // Handle edit row
  const handleEditRow = useCallback((id: string) => {
    const record = data.find(r => r.id === id);
    if (record) {
      setEditingRecord(record);
      setAddModalOpen(true);
      setAddModalKey(prev => prev + 1); // Force modal reset with new data
    }
  }, [data]);
  
  // Handle remove row
  const handleRemoveRow = useCallback((id: string) => {
    if (confirm('Are you sure you want to remove this customs declaration?')) {
      setData(prev => prev.filter(row => row.id !== id));
      // Also remove from selection if selected
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      deleteDeclaration(id).catch((err) => {
        console.error('Error deleting declaration from Supabase:', err);
      });
    }
  }, []);
  
  // Handle delete selected rows
  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size === 0) return;
    
    const count = selectedRows.size;
    const message = count === 1 
      ? 'Are you sure you want to remove this customs declaration?' 
      : `Are you sure you want to remove ${count} customs declarations?`;
    
    if (confirm(message)) {
      const idsToDelete: string[] = Array.from(selectedRows);
      setData(prev => prev.filter(row => !selectedRows.has(row.id)));
      setSelectedRows(new Set());
      setIsSelectAllChecked(false);
      Promise.all(idsToDelete.map((id: string) => deleteDeclaration(id))).catch((err) => {
        console.error('Error deleting declarations from Supabase:', err);
      });
    }
  }, [selectedRows]);
  
  // Handle update assignment (for edit mode)
  const handleUpdateAssignment = useCallback((id: string, assignment: Omit<TableRowData, 'id'>) => {
    setData(prev => prev.map(row => 
      row.id === id ? { ...assignment, id } : row
    ));
    setEditingRecord(null);
    updateDeclaration(id, assignment).catch((err) => {
      console.error('Error updating declaration in Supabase:', err);
    });
    addLog(id, 'updated', 'Declaration updated').catch((err) => {
      console.error('Error writing log entry:', err);
    });
    return assignment.customsNo;
  }, []);

  // Partial, in-place field update — used by DetailView's Freight/Invoices
  // panel to remove a single invoice or clear the freight cost without
  // going through the full edit modal.
  const handlePatchRecord = useCallback((id: string, updates: Partial<TableRowData>) => {
    setData(prev => prev.map(row =>
      row.id === id ? { ...row, ...updates } : row
    ));
    updateDeclaration(id, updates).catch((err) => {
      console.error('Error patching declaration in Supabase:', err);
    });
    // Generic log entry — the Freight/Invoices panel patches specific fields
    // (invoice removed, freight cleared) without telling this handler which,
    // so this stays a general note rather than a precise per-field message.
    const changedFields = Object.keys(updates).filter((k) => k !== 'invoices').join(', ') || 'invoices';
    addLog(id, 'updated', `Declaration fields updated (${changedFields})`).catch((err) => {
      console.error('Error writing log entry:', err);
    });
  }, []);
  
  // Sort state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);
  
  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof TableRowData];
      let bVal: any = b[sortColumn as keyof TableRowData];
      
      // Handle company objects
      if (typeof aVal === 'object' && aVal !== null && 'name' in aVal) {
        aVal = aVal.name;
        bVal = bVal.name;
      }
      
      // Handle numeric strings
      if (typeof aVal === 'string' && /^[\d,\.]+$/.test(aVal)) {
        aVal = parseFloat(aVal.replace(/,/g, ''));
        bVal = parseFloat(bVal.replace(/,/g, ''));
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);
  
  // Calculate if there are active filter chips
  const hasFilterChips = useMemo(() => {
    // Check if any filter criteria has a value (besides exclusions)
    const hasFilterValue = Object.entries(filterCriteria).some(([key, value]) => {
      if (key === 'exclusions') return false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== '';
    });
    
    // Also check if search query exists
    const hasSearch = searchQuery && searchQuery.trim().length > 0;
    
    return hasFilterValue || hasSearch;
  }, [filterCriteria, searchQuery]);
  
  // Calculate dynamic sidebar width
  const sidebarWidth = isSidebarCollapsed ? 60 : 235;
  
  return (
    <div className="min-h-screen bg-white">
      {dataError && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-[#d0021b] text-white text-[12px] font-['Inter'] font-semibold px-[16px] py-[8px] text-center">
          Could not connect to the database: {dataError}. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.
        </div>
      )}
      {dataLoading && (
        <div className="fixed inset-0 z-[90] bg-white flex items-center justify-center">
          <p className="font-['Inter'] text-[14px] text-[#003160]">Loading declarations…</p>
        </div>
      )}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(prev => !prev)}
        onNavigate={(mainTitle, subLink) => {
          setActiveMainTitle(mainTitle);
          setActiveSubLink(subLink);
        }}
        activeSubLink={activeSubLink}
        mainTitle={activeMainTitle}
      />
      <TopBar
        onAddClick={() => setAddModalOpen(true)}
        onBackClick={handleBackFromDetail}
        onDeleteSelected={handleDeleteSelected}
        onEditClick={() => selectedRecordId && handleEditRow(selectedRecordId)}
        onPdfPreviewClick={() => setPdfPreviewOpen((v) => !v)}
        onValidateAndSend={() => detailViewRef.current?.validateAndSend()}
        hasSelection={selectedRows.size > 0}
        showBackButton={!!selectedRecordId}
        sidebarWidth={sidebarWidth}
        mainTitle={activeMainTitle}
        activeSubLink={activeSubLink}
        showHeaderDetails={!!selectedRecordId}
        onHeightChange={setTopBarHeight}
        detailData={selectedRecordId ? (() => {
          const record = data.find(r => r.id === selectedRecordId);
          if (!record) return undefined;
          
          return {
            status: record.status,
            customsNo: record.customsNo,
            sendDate: record.sentDate,
            importExport: record.declarationType || (record.typeBadge === 'E' ? 'EX' : 'IM'),
            messageDeclarationType: record.messageDeclarationType,
            managedBy: record.managedBy || 'Not assigned',
            customsClearanceUnit: record.customsClearanceUnit || 'Not assigned',
            noOfParcels: record.noOfParcels,
            declarationDate: record.declared,
            consignorName: record.consignorName,
            consignorAddress: record.sender?.address,
            consigneeName: record.consigneeName,
            consigneeAddress: record.consignee?.address,
            invoiceAmount: record.value,
            currency: record.currency,
            netWeight: record.netWeight,
            totalStatisticalValue: record.value, // Using value as placeholder for calc of taxes
            usedAmount: itemsSummary?.totalAmount,
            usedNetWeight: itemsSummary?.totalNetWeight,
            usedNoOfParcels: itemsSummary?.totalNoOfParcels
          };
        })() : undefined}
      />
      {activeMainTitle === 'Application' && activeSubLink === 'Sub Link 1' ? (
        selectedRecordId && data.find(r => r.id === selectedRecordId) ? (
          <DetailView
            key={selectedRecordId}
            ref={detailViewRef}
            record={data.find(r => r.id === selectedRecordId)!}
            onBack={handleBackFromDetail}
            sidebarWidth={sidebarWidth}
            onItemsSummaryChange={setItemsSummary}
            headerHeight={topBarHeight}
            onEditClick={() => handleEditRow(selectedRecordId)}
            onUpdateRecord={(updates) => handlePatchRecord(selectedRecordId, updates)}
            pdfPreviewOpen={pdfPreviewOpen}
            onClosePdfPreview={() => setPdfPreviewOpen(false)}
          />
        ) : (
          <>
            <FilterBar
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
              onFilterClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              filterDrawerOpen={filterDrawerOpen}
              counts={filterCounts}
              hasModifiedFilters={hasModifiedFilters}
              templates={templates}
              templateCounts={templateCounts}
              filterCriteria={filterCriteria}
              onRemoveFilter={handleRemoveFilter}
              defaultCriteria={defaultCriteria}
              onCreateTemplate={handleCreateTemplate}
              onSaveTemplate={handleSaveTemplate}
              onRenameTemplate={handleRenameTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onClearFilters={handleClearFilters}
              onReorderClick={() => setReorderModalOpen(true)}
              tabOrder={tabOrder}
              manuallyAddedFilters={manuallyAddedFilters}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              sidebarWidth={sidebarWidth}
            />
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              sidebarWidth={sidebarWidth}
              filterDrawerOpen={filterDrawerOpen}
              hasFilterChips={hasFilterChips}
              filteredData={sortedData}
            />
            <DataTable
              data={sortedData}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              sidebarWidth={sidebarWidth}
              filterDrawerOpen={filterDrawerOpen}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              isSelectAllChecked={isSelectAllChecked}
              onSelectAll={handleSelectAll}
              columnVisibility={columnVisibility}
              onOpenColumnVisibility={() => setColumnVisibilityModalOpen(true)}
              hasFilterChips={hasFilterChips}
              onRowClick={handleRowClick}
              onCreateNew={() => setAddModalOpen(true)}
              currentSection={activeMainTitle}
              onEdit={handleEditRow}
              onRemove={handleRemoveRow}
            />
          </>
        )
      ) : (
        <div 
          className="flex items-center justify-center bg-white" 
          style={{ 
            marginLeft: `${sidebarWidth}px`,
            marginTop: '60px',
            height: 'calc(100vh - 60px)'
          }}
        >
          <div className="text-center flex flex-col items-center gap-4">
            {(() => {
              const IconComponent = getSectionIcon(activeMainTitle);
              return <IconComponent className="size-[100px] text-[#d3d3d3]" strokeWidth={1} />;
            })()}
            <p className="font-['Inter'] text-[#767676] text-[14px]">
              Content for {activeMainTitle} / {activeSubLink}
            </p>
          </div>
        </div>
      )}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filterCriteria}
        onFilterChange={handleFilterCriteriaChange}
        currentFilter={currentFilter}
        templates={templates}
        onCreateTemplate={handleCreateTemplate}
        onSaveTemplate={handleSaveTemplate}
        onRenameTemplate={handleRenameTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        companies={COMPANIES}
        manuallyAddedFilters={manuallyAddedFilters}
      />
      
      <AddAssignmentModal
        key={addModalKey}
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleAddAssignment}
        onNavigateToDetail={handleNavigateToDetailFromModal}
        editingRecord={editingRecord}
        onUpdate={handleUpdateAssignment}
      />
      
      <CreateTemplateModal
        isOpen={createTemplateModalOpen}
        onClose={() => setCreateTemplateModalOpen(false)}
        onConfirm={handleConfirmCreateTemplate}
        existingNames={templates.map(t => t.name)}
      />
      
      <ReorderTabsModal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
        tabOrder={tabOrder}
        templates={templates}
        onSave={handleReorderTabs}
      />
      
      <ColumnVisibilityModal
        isOpen={columnVisibilityModalOpen}
        onClose={() => setColumnVisibilityModalOpen(false)}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />
      
      <ConfirmationDialog
        isOpen={confirmationDialogOpen}
        declarationNo={createdDeclarationNo}
        onProceedToDetail={handleProceedToDetail}
        onCreateNew={handleCreateNewDeclaration}
        onClose={handleCloseConfirmation}
      />
    </div>
  );
}

export default App;