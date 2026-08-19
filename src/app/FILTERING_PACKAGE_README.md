# Advanced Filtering System - Reusable Package

A production-ready, feature-rich filtering system for React applications with TypeScript. Includes tab-based navigation, dynamic filter panels, include/exclude logic, template management, and persistent state.

## 🎯 Features

### FilterBar Component
- ✅ **Global Tabs** - Predefined filter categories (All, Open, Cleared, etc.)
- ✅ **Personal Tabs** - User-created filter templates
- ✅ **Tab Management** - Create, save, rename, delete, and reorder tabs
- ✅ **Active Filter Chips** - Visual display of applied filters with remove buttons
- ✅ **Include/Exclude Indicators** - Blue (include) and Orange (exclude) chips
- ✅ **Modified Indicator** - Orange dot shows when template filters are modified
- ✅ **Responsive Layout** - Adapts to sidebar and drawer visibility
- ✅ **Search Integration** - Shows active search queries as chips

### FilterDrawer Component
- ✅ **Multiple Input Types** - Text, dropdown, multi-select, date picker, numeric
- ✅ **Include/Exclude Toggle** - CheckCircle (include) and Ban (exclude) icons per filter
- ✅ **Favorites System** - Star/unstar frequently used filters
- ✅ **Shift-Click Exclusion** - Hold Shift while selecting to exclude
- ✅ **Real-time Updates** - Instant filter application with debouncing support
- ✅ **Clear Buttons** - Individual field clearing with X icons
- ✅ **Template Actions** - Save, create, and manage filter templates
- ✅ **Formatted Inputs** - Auto-formatting for numbers and dates

## 📦 Package Contents

### Core Components
```
filtering-system/
├── components/
│   ├── FilterBar.tsx          # Tab navigation and filter chips
│   ├── FilterDrawer.tsx        # Right-side filter panel
│   └── ui/                     # ShadCN dependencies
│       ├── select.tsx
│       ├── dropdown-menu.tsx
│       ├── calendar.tsx
│       ├── popover.tsx
│       └── ...
├── types/
│   └── filtering.ts            # TypeScript interfaces
├── hooks/
│   └── useFiltering.ts         # Optional: State management hook
├── utils/
│   └── filterHelpers.ts        # Helper functions
└── README.md
```

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install lucide-react date-fns
```

### 2. Install ShadCN Components

```bash
npx shadcn-ui@latest add select dropdown-menu calendar popover
```

### 3. Copy Package Files

Copy the following files to your project:

```
/components/FilterBar.tsx
/components/FilterDrawer.tsx
/components/ui/select.tsx
/components/ui/dropdown-menu.tsx
/components/ui/calendar.tsx
/components/ui/popover.tsx
```

## 🎨 Setup

### 1. Define Your Filter Criteria

```typescript
// types/filtering.ts
export interface FilterCriteria {
  // Add your filter fields here
  status: string;
  category: string;
  tags: string[];
  dateFrom: string;
  dateTo: string;
  minValue: string;
  maxValue: string;
  // Include/exclude configuration
  exclusions?: {
    status?: boolean;
    category?: boolean;
    tags?: boolean;
    dateFrom?: boolean;
    dateTo?: boolean;
    minValue?: boolean;
    maxValue?: boolean;
  };
}

export interface FilterTemplate {
  id: string;
  name: string;
  criteria: FilterCriteria;
  isGlobal?: boolean;
}
```

### 2. Initialize State in Parent Component

```typescript
// App.tsx or YourComponent.tsx
import { useState, useEffect } from 'react';
import { FilterBar } from './components/FilterBar';
import { FilterDrawer, FilterCriteria } from './components/FilterDrawer';

export default function App() {
  const [currentFilter, setCurrentFilter] = useState('all');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    status: '',
    category: '',
    tags: [],
    dateFrom: '',
    dateTo: '',
    minValue: '',
    maxValue: '',
    exclusions: {}
  });
  
  const [templates, setTemplates] = useState<FilterTemplate[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([
    'all', 'open', 'cleared', 'manual', 'electronic'
  ]);
  const [manuallyAddedFilters, setManuallyAddedFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('filterTemplates');
    if (saved) setTemplates(JSON.parse(saved));
    
    const savedOrder = localStorage.getItem('tabOrder');
    if (savedOrder) setTabOrder(JSON.parse(savedOrder));
  }, []);

  // Save to localStorage when templates change
  useEffect(() => {
    localStorage.setItem('filterTemplates', JSON.stringify(templates));
  }, [templates]);

  // Your data filtering logic
  const filteredData = data.filter(item => {
    // Apply filter criteria to your data
    if (filterCriteria.status) {
      const isExcluded = filterCriteria.exclusions?.status;
      const matches = item.status === filterCriteria.status;
      if (isExcluded ? matches : !matches) return false;
    }
    
    // Add more filter logic...
    
    return true;
  });

  return (
    <div>
      <FilterBar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onFilterClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
        filterDrawerOpen={filterDrawerOpen}
        counts={{
          all: data.length,
          open: data.filter(d => d.status === 'open').length,
          cleared: data.filter(d => d.status === 'cleared').length,
          manual: data.filter(d => d.type === 'manual').length,
          electronic: data.filter(d => d.type === 'electronic').length
        }}
        templates={templates}
        templateCounts={new Map()} // Calculate template counts
        filterCriteria={filterCriteria}
        onRemoveFilter={(field) => {
          setFilterCriteria(prev => ({ ...prev, [field]: '' }));
        }}
        onCreateTemplate={() => {/* Create template logic */}}
        onSaveTemplate={() => {/* Save template logic */}}
        onRenameTemplate={(id) => {/* Rename template logic */}}
        onDeleteTemplate={(id) => {/* Delete template logic */}}
        onClearFilters={() => {/* Clear filters logic */}}
        onReorderClick={() => {/* Open reorder modal */}}
        tabOrder={tabOrder}
        manuallyAddedFilters={manuallyAddedFilters}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery('')}
      />

      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filterCriteria}
        onFilterChange={(field, value) => {
          setFilterCriteria(prev => ({ ...prev, [field]: value }));
        }}
        currentFilter={currentFilter}
        templates={templates}
        onCreateTemplate={() => {/* Create template logic */}}
        onSaveTemplate={() => {/* Save template logic */}}
        onRenameTemplate={(id) => {/* Rename template logic */}}
        onDeleteTemplate={(id) => {/* Delete template logic */}}
        manuallyAddedFilters={manuallyAddedFilters}
      />

      {/* Your data table/list */}
      <div>
        {filteredData.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}
```

## 🎯 Customization Guide

### 1. Modify Filter Fields in FilterDrawer

Edit the `FilterDrawer.tsx` component to add/remove filter fields:

```typescript
// In FilterDrawer.tsx, add your custom filters:

<FilterDropdown
  label="Your Field"
  field="yourField"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
/>

<FilterInput
  label="Text Field"
  field="textField"
  placeholder="Enter text..."
/>

<FilterDatePicker
  label="Date Field"
  field="dateField"
/>

<FilterNumericInput
  label="Numeric Field"
  field="numericField"
/>

<MultiSelectDropdown
  label="Multi-Select"
  field="multiSelectField"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
/>
```

### 2. Customize Global Tabs

Edit `FilterBar.tsx` to change global tab configuration:

```typescript
// In FilterBar.tsx, modify the tabConfig object:
const tabConfig: { [key: string]: { label: string; count: number } } = {
  all: { label: 'All Items', count: counts.all },
  active: { label: 'Active', count: counts.active },
  archived: { label: 'Archived', count: counts.archived },
  // Add your tabs here
};
```

### 3. Customize Styling

All components use Tailwind CSS. Key colors to customize:

```typescript
// Blue theme color (include): #003160
// Orange theme color (exclude/manual): #FF8F00
// Border color: #e0e0e0
// Text color: #003160
// Background: white

// Search and replace these values in FilterBar.tsx and FilterDrawer.tsx
```

### 4. Add Custom Filter Logic

```typescript
// In your parent component:
const applyFilters = (data: YourDataType[]) => {
  return data.filter(item => {
    // Status filter with exclusion
    if (filterCriteria.status) {
      const isExcluded = filterCriteria.exclusions?.status;
      const matches = item.status === filterCriteria.status;
      if (isExcluded ? matches : !matches) return false;
    }

    // Multi-select with exclusion
    if (filterCriteria.tags && filterCriteria.tags.length > 0) {
      const isExcluded = filterCriteria.exclusions?.tags;
      const matches = filterCriteria.tags.some(tag => item.tags.includes(tag));
      if (isExcluded ? matches : !matches) return false;
    }

    // Text search
    if (filterCriteria.searchText) {
      const isExcluded = filterCriteria.exclusions?.searchText;
      const matches = item.name.toLowerCase().includes(filterCriteria.searchText.toLowerCase());
      if (isExcluded ? matches : !matches) return false;
    }

    return true;
  });
};
```

## 🔧 Template Management

### Create Template

```typescript
const handleCreateTemplate = () => {
  const newTemplate: FilterTemplate = {
    id: `template_${Date.now()}`,
    name: 'My Filter',
    criteria: { ...filterCriteria },
    isGlobal: false
  };
  
  setTemplates(prev => [...prev, newTemplate]);
  setTabOrder(prev => [...prev, newTemplate.id]);
  setCurrentFilter(newTemplate.id);
};
```

### Save Template

```typescript
const handleSaveTemplate = () => {
  setTemplates(prev =>
    prev.map(t =>
      t.id === currentFilter
        ? { ...t, criteria: { ...filterCriteria } }
        : t
    )
  );
};
```

### Rename Template

```typescript
const handleRenameTemplate = (templateId: string) => {
  const newName = prompt('Enter new name:');
  if (newName) {
    setTemplates(prev =>
      prev.map(t =>
        t.id === templateId ? { ...t, name: newName } : t
      )
    );
  }
};
```

### Delete Template

```typescript
const handleDeleteTemplate = (templateId: string) => {
  setTemplates(prev => prev.filter(t => t.id !== templateId));
  setTabOrder(prev => prev.filter(id => id !== templateId));
  if (currentFilter === templateId) {
    setCurrentFilter('all');
  }
};
```

## 📊 Tracking Manual Filters

To show orange chips for manually added filters:

```typescript
const handleFilterChange = (field: keyof FilterCriteria, value: any) => {
  setFilterCriteria(prev => ({ ...prev, [field]: value }));
  
  // Track if this is a manual addition (not from template)
  const isTemplateFilter = templates
    .find(t => t.id === currentFilter)
    ?.criteria[field];
  
  if (!isTemplateFilter && value) {
    setManuallyAddedFilters(prev => new Set([...prev, field]));
  }
};
```

## 🎨 Advanced Features

### 1. Auto-clear Modified Filters

```typescript
// Clear manual filters button functionality
const handleClearFilters = () => {
  const updatedCriteria = { ...filterCriteria };
  
  manuallyAddedFilters.forEach(field => {
    if (Array.isArray(updatedCriteria[field])) {
      updatedCriteria[field] = [];
    } else {
      updatedCriteria[field] = '';
    }
  });
  
  setFilterCriteria(updatedCriteria);
  setManuallyAddedFilters(new Set());
};
```

### 2. Filter Count Calculation

```typescript
const calculateTemplateCounts = () => {
  const counts = new Map<string, number>();
  
  templates.forEach(template => {
    const filtered = data.filter(item => {
      // Apply template criteria to item
      return matchesCriteria(item, template.criteria);
    });
    counts.set(template.id, filtered.length);
  });
  
  return counts;
};
```

### 3. Persist Filter State

```typescript
// Save filter state on change
useEffect(() => {
  localStorage.setItem('filterCriteria', JSON.stringify(filterCriteria));
}, [filterCriteria]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('filterCriteria');
  if (saved) {
    setFilterCriteria(JSON.parse(saved));
  }
}, []);
```

## 🎯 Props Reference

### FilterBar Props

```typescript
interface FilterBarProps {
  currentFilter: string;                          // Active tab ID
  onFilterChange: (filter: string) => void;       // Tab change handler
  onFilterClick?: () => void;                     // Filter drawer toggle
  filterDrawerOpen?: boolean;                     // Drawer open state
  counts: {                                        // Tab counts
    all: number;
    open: number;
    cleared: number;
    manual: number;
    electronic: number;
  };
  sidebarWidth?: number;                          // Sidebar width (default: 235)
  hasModifiedFilters?: boolean;                   // Show orange dot
  templates?: FilterTemplate[];                   // User templates
  templateCounts?: Map<string, number>;           // Template counts
  filterCriteria?: FilterCriteria;                // Current filters
  onRemoveFilter?: (field: string) => void;       // Remove chip handler
  defaultCriteria?: FilterCriteria;               // Default filters
  onCreateTemplate?: () => void;                  // Create template
  onSaveTemplate?: () => void;                    // Save template
  onRenameTemplate?: (id: string) => void;        // Rename template
  onDeleteTemplate?: (id: string) => void;        // Delete template
  onClearFilters?: () => void;                    // Clear manual filters
  onReorderClick?: () => void;                    // Open reorder modal
  tabOrder?: string[];                            // Tab display order
  manuallyAddedFilters?: Set<string>;             // Manual filter tracking
  searchQuery?: string;                           // Active search
  onClearSearch?: () => void;                     // Clear search
}
```

### FilterDrawer Props

```typescript
interface FilterDrawerProps {
  isOpen: boolean;                                // Drawer visibility
  onClose: () => void;                            // Close handler
  filters: FilterCriteria;                        // Current filters
  onFilterChange: (                               // Filter change handler
    field: keyof FilterCriteria, 
    value: string | string[]
  ) => void;
  currentFilter?: string;                         // Active tab
  templates?: FilterTemplate[];                   // User templates
  onCreateTemplate?: () => void;                  // Create template
  onSaveTemplate?: () => void;                    // Save template
  onRenameTemplate?: (id: string) => void;        // Rename template
  onDeleteTemplate?: (id: string) => void;        // Delete template
  companies?: { name: string; address: string }[]; // Dropdown data
  customsOfficers?: { name: string; address: string }[]; // Dropdown data
  manuallyAddedFilters?: Set<string>;             // Manual filter tracking
}
```

## 🐛 Troubleshooting

### Issue: Filters not updating
- Check that `onFilterChange` properly updates state
- Ensure `filterCriteria` prop is passed correctly

### Issue: Template not saving
- Verify localStorage is available
- Check that templates array is properly updated

### Issue: Chips not showing
- Ensure `filterCriteria` has values
- Check that field names match between criteria and chips

### Issue: Styling conflicts
- Verify Tailwind CSS is configured
- Check that globals.css is imported
- Ensure no CSS conflicts with existing styles

## 📝 TypeScript Support

The package is fully typed. Import types:

```typescript
import type { FilterCriteria, FilterTemplate } from './components/FilterDrawer';
```

## 🎨 Theme Customization

Create a theme configuration file:

```typescript
// theme/filterTheme.ts
export const filterTheme = {
  colors: {
    primary: '#003160',      // Blue (include)
    secondary: '#FF8F00',    // Orange (exclude/manual)
    border: '#e0e0e0',
    background: '#ffffff',
    hover: '#f5f5f5'
  },
  fonts: {
    main: 'Inter',
    mono: 'Roboto Mono'
  },
  spacing: {
    sidebarWidth: 235,
    drawerWidth: 340
  }
};
```

## 📄 License

MIT License - Feel free to use in commercial and personal projects.

## 🤝 Support

For issues or questions, refer to the source code comments and examples above.

---

**Built with ❤️ for modern React applications**
