# 📋 Code Examples - Filtering System

Complete, copy-paste ready examples for common use cases.

## 📊 Example 1: E-commerce Product Filtering

### Data Structure

```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  brand: string;
  rating: number;
  dateAdded: string;
}

const products: Product[] = [
  { id: '1', name: 'Laptop', category: 'Electronics', price: 999, inStock: true, brand: 'Apple', rating: 4.5, dateAdded: '15/01/24' },
  { id: '2', name: 'Headphones', category: 'Audio', price: 199, inStock: false, brand: 'Sony', rating: 4.2, dateAdded: '20/01/24' },
  { id: '3', name: 'Mouse', category: 'Accessories', price: 49, inStock: true, brand: 'Logitech', rating: 4.8, dateAdded: '25/01/24' },
];
```

### Filter Criteria

```typescript
interface ProductFilterCriteria {
  category: string;
  priceRange: string[];
  brand: string;
  inStock: string;
  rating: string;
  dateFrom: string;
  dateTo: string;
  searchText: string;
  exclusions?: {
    category?: boolean;
    priceRange?: boolean;
    brand?: boolean;
    inStock?: boolean;
    rating?: boolean;
    dateFrom?: boolean;
    dateTo?: boolean;
  };
}
```

### Complete Component

```typescript
import { useState, useEffect } from 'react';
import { FilterBar } from './components/FilterBar';
import { FilterDrawer } from './components/FilterDrawer';

export default function ProductCatalog() {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<ProductFilterCriteria>({
    category: '',
    priceRange: [],
    brand: '',
    inStock: '',
    rating: '',
    dateFrom: '',
    dateTo: '',
    searchText: '',
    exclusions: {}
  });

  // Filter logic
  const filteredProducts = products.filter(product => {
    // Category filter
    if (filterCriteria.category) {
      const isExcluded = filterCriteria.exclusions?.category;
      const matches = product.category === filterCriteria.category;
      if (isExcluded ? matches : !matches) return false;
    }

    // Price range filter (multi-select)
    if (filterCriteria.priceRange.length > 0) {
      const isExcluded = filterCriteria.exclusions?.priceRange;
      const matches = filterCriteria.priceRange.some(range => {
        if (range === '0-100') return product.price >= 0 && product.price <= 100;
        if (range === '100-500') return product.price > 100 && product.price <= 500;
        if (range === '500+') return product.price > 500;
        return false;
      });
      if (isExcluded ? matches : !matches) return false;
    }

    // Brand filter
    if (filterCriteria.brand) {
      const isExcluded = filterCriteria.exclusions?.brand;
      const matches = product.brand === filterCriteria.brand;
      if (isExcluded ? matches : !matches) return false;
    }

    // Stock filter
    if (filterCriteria.inStock) {
      const isExcluded = filterCriteria.exclusions?.inStock;
      const matches = filterCriteria.inStock === 'yes' ? product.inStock : !product.inStock;
      if (isExcluded ? matches : !matches) return false;
    }

    // Search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!product.name.toLowerCase().includes(searchLower)) return false;
    }

    return true;
  });

  // Calculate counts
  const counts = {
    all: products.length,
    open: products.filter(p => p.inStock).length,
    cleared: products.filter(p => !p.inStock).length,
    manual: products.filter(p => p.category === 'Electronics').length,
    electronic: products.filter(p => p.category === 'Audio').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onFilterClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
        filterDrawerOpen={filterDrawerOpen}
        counts={counts}
        filterCriteria={filterCriteria}
        onRemoveFilter={(field) => {
          if (Array.isArray(filterCriteria[field])) {
            setFilterCriteria(prev => ({ ...prev, [field]: [] }));
          } else {
            setFilterCriteria(prev => ({ ...prev, [field]: '' }));
          }
        }}
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
      />

      {/* Product Grid */}
      <div className="pt-[170px] px-[250px] pb-8">
        <div className="grid grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600">{product.brand}</p>
              <p className="text-xl font-bold mt-2">${product.price}</p>
              <p className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Custom FilterDrawer Configuration

Modify FilterDrawer.tsx to include product-specific filters:

```typescript
// Inside FilterDrawer.tsx, replace filter fields with:

<FilterDropdown
  label="Category"
  field="category"
  options={[
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Audio', label: 'Audio' },
    { value: 'Accessories', label: 'Accessories' }
  ]}
/>

<MultiSelectDropdown
  label="Price Range"
  field="priceRange"
  options={[
    { value: '0-100', label: '$0 - $100' },
    { value: '100-500', label: '$100 - $500' },
    { value: '500+', label: '$500+' }
  ]}
/>

<FilterDropdown
  label="Brand"
  field="brand"
  options={[
    { value: 'Apple', label: 'Apple' },
    { value: 'Sony', label: 'Sony' },
    { value: 'Logitech', label: 'Logitech' }
  ]}
/>

<FilterDropdown
  label="In Stock"
  field="inStock"
  options={[
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ]}
/>
```

---

## 📧 Example 2: Email Inbox Filtering

### Data Structure

```typescript
interface Email {
  id: string;
  from: string;
  subject: string;
  isRead: boolean;
  hasAttachment: boolean;
  priority: 'high' | 'normal' | 'low';
  folder: string;
  date: string;
  tags: string[];
}

const emails: Email[] = [
  { id: '1', from: 'john@example.com', subject: 'Meeting Tomorrow', isRead: false, hasAttachment: true, priority: 'high', folder: 'inbox', date: '15/01/24', tags: ['work', 'urgent'] },
  { id: '2', from: 'jane@example.com', subject: 'Project Update', isRead: true, hasAttachment: false, priority: 'normal', folder: 'inbox', date: '14/01/24', tags: ['work'] },
];
```

### Filter Implementation

```typescript
const [filterCriteria, setFilterCriteria] = useState({
  from: '',
  subject: '',
  isRead: '',
  hasAttachment: '',
  priority: '',
  folder: '',
  tags: [],
  dateFrom: '',
  dateTo: '',
  exclusions: {}
});

const filteredEmails = emails.filter(email => {
  // Read status
  if (filterCriteria.isRead) {
    const isExcluded = filterCriteria.exclusions?.isRead;
    const matches = (filterCriteria.isRead === 'read') === email.isRead;
    if (isExcluded ? matches : !matches) return false;
  }

  // Priority
  if (filterCriteria.priority) {
    const isExcluded = filterCriteria.exclusions?.priority;
    const matches = email.priority === filterCriteria.priority;
    if (isExcluded ? matches : !matches) return false;
  }

  // Tags (multi-select)
  if (filterCriteria.tags.length > 0) {
    const isExcluded = filterCriteria.exclusions?.tags;
    const matches = filterCriteria.tags.some(tag => email.tags.includes(tag));
    if (isExcluded ? matches : !matches) return false;
  }

  // Attachment
  if (filterCriteria.hasAttachment) {
    const isExcluded = filterCriteria.exclusions?.hasAttachment;
    const matches = (filterCriteria.hasAttachment === 'yes') === email.hasAttachment;
    if (isExcluded ? matches : !matches) return false;
  }

  return true;
});

// Tab counts
const counts = {
  all: emails.length,
  open: emails.filter(e => !e.isRead).length,
  cleared: emails.filter(e => e.isRead).length,
  manual: emails.filter(e => e.hasAttachment).length,
  electronic: emails.filter(e => e.priority === 'high').length
};
```

---

## 👥 Example 3: CRM Contact Filtering

### Data Structure

```typescript
interface Contact {
  id: string;
  name: string;
  company: string;
  status: 'lead' | 'customer' | 'inactive';
  industry: string;
  lastContact: string;
  assignedTo: string;
  revenue: number;
  tags: string[];
}
```

### Advanced Filtering with Templates

```typescript
export default function CRMDashboard() {
  const [templates, setTemplates] = useState<FilterTemplate[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    industry: '',
    assignedTo: '',
    revenueRange: [],
    tags: [],
    lastContactFrom: '',
    lastContactTo: '',
    exclusions: {}
  });

  // Template management
  const handleCreateTemplate = () => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    const newTemplate: FilterTemplate = {
      id: `template_${Date.now()}`,
      name: templateName,
      criteria: { ...filterCriteria }
    };

    setTemplates(prev => [...prev, newTemplate]);
    setCurrentFilter(newTemplate.id);
    
    // Save to localStorage
    localStorage.setItem('contactTemplates', JSON.stringify([...templates, newTemplate]));
  };

  const handleSaveTemplate = () => {
    const updatedTemplates = templates.map(t =>
      t.id === currentFilter ? { ...t, criteria: { ...filterCriteria } } : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem('contactTemplates', JSON.stringify(updatedTemplates));
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('contactTemplates', JSON.stringify(updatedTemplates));
    
    if (currentFilter === templateId) {
      setCurrentFilter('all');
    }
  };

  // Load templates on mount
  useEffect(() => {
    const saved = localStorage.getItem('contactTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  // Apply template when selected
  useEffect(() => {
    const template = templates.find(t => t.id === currentFilter);
    if (template) {
      setFilterCriteria(template.criteria);
    } else {
      // Reset to default for global tabs
      setFilterCriteria({
        status: currentFilter === 'all' ? '' : currentFilter,
        industry: '',
        assignedTo: '',
        revenueRange: [],
        tags: [],
        lastContactFrom: '',
        lastContactTo: '',
        exclusions: {}
      });
    }
  }, [currentFilter, templates]);

  return (
    <div>
      <FilterBar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        templates={templates}
        onCreateTemplate={handleCreateTemplate}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        // ... other props
      />
      {/* Rest of component */}
    </div>
  );
}
```

---

## 📊 Example 4: Task Management Filtering

### Data Structure

```typescript
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: string;
  labels: string[];
  project: string;
}
```

### Smart Filter with Auto-Update

```typescript
export default function TaskManager() {
  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    priority: '',
    assignee: '',
    project: '',
    labels: [],
    dueDateFrom: '',
    dueDateTo: '',
    exclusions: {}
  });

  // Smart filter update with debouncing
  const [debouncedCriteria, setDebouncedCriteria] = useState(filterCriteria);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCriteria(filterCriteria);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [filterCriteria]);

  // Use debounced criteria for filtering
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (debouncedCriteria.status && task.status !== debouncedCriteria.status) {
      return false;
    }

    // Priority filter
    if (debouncedCriteria.priority && task.priority !== debouncedCriteria.priority) {
      return false;
    }

    // Labels (multi-select with exclusion)
    if (debouncedCriteria.labels.length > 0) {
      const isExcluded = debouncedCriteria.exclusions?.labels;
      const matches = debouncedCriteria.labels.some(label => task.labels.includes(label));
      if (isExcluded ? matches : !matches) return false;
    }

    return true;
  });

  return (
    <div>
      {/* Filtering UI */}
      {/* Task list */}
      <div>
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔄 Example 5: Real-time Filter Updates with URL Sync

### Sync Filters with URL Parameters

```typescript
import { useSearchParams } from 'react-router-dom';

export default function FilteredList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize from URL
  const [filterCriteria, setFilterCriteria] = useState(() => ({
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    exclusions: {}
  }));

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filterCriteria).forEach(([key, value]) => {
      if (value && key !== 'exclusions') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });

    setSearchParams(params);
  }, [filterCriteria, setSearchParams]);

  return (
    <div>
      {/* Your filtering components */}
    </div>
  );
}
```

---

## 📱 Example 6: Mobile-Responsive Filter Panel

### Responsive Filter Drawer

```typescript
import { useMediaQuery } from './hooks/useMediaQuery';

export default function ResponsiveFilters() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  return (
    <div>
      {isMobile ? (
        // Mobile: Full-screen modal
        <div className={`fixed inset-0 z-50 bg-white transform transition-transform ${
          filterDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4">
            <button onClick={() => setFilterDrawerOpen(false)}>Close</button>
            <FilterDrawer
              isOpen={true}
              onClose={() => setFilterDrawerOpen(false)}
              filters={filterCriteria}
              onFilterChange={(field, value) => {
                setFilterCriteria(prev => ({ ...prev, [field]: value }));
              }}
            />
          </div>
        </div>
      ) : (
        // Desktop: Side drawer
        <FilterDrawer
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          filters={filterCriteria}
          onFilterChange={(field, value) => {
            setFilterCriteria(prev => ({ ...prev, [field]: value }));
          }}
        />
      )}
    </div>
  );
}

// hooks/useMediaQuery.ts
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

---

## 🎨 Example 7: Custom Themed Filters

### Custom Color Scheme

```typescript
// Create a custom theme wrapper
const CustomFilterBar = styled(FilterBar)`
  --filter-primary: #1a73e8;      // Google Blue
  --filter-secondary: #ea4335;    // Google Red
  --filter-border: #dadce0;
  
  .filter-button-active {
    background-color: var(--filter-primary);
  }
  
  .filter-chip-exclude {
    background-color: var(--filter-secondary);
  }
`;

// Or use inline styles
<FilterBar
  {...props}
  className="custom-filter-bar"
  style={{
    '--primary-color': '#1a73e8',
    '--secondary-color': '#ea4335'
  } as any}
/>
```

---

## 💾 Example 8: Export/Import Filter Configurations

### Save and Load Filter Presets

```typescript
const exportFilterConfig = () => {
  const config = {
    templates,
    tabOrder,
    currentFilter,
    filterCriteria
  };
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'filter-config.json';
  a.click();
};

const importFilterConfig = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const config = JSON.parse(e.target?.result as string);
    setTemplates(config.templates || []);
    setTabOrder(config.tabOrder || []);
    setCurrentFilter(config.currentFilter || 'all');
    setFilterCriteria(config.filterCriteria || {});
  };
  reader.readAsText(file);
};
```

---

Each example is production-ready and can be copy-pasted into your project with minimal modifications. Adjust the data structures and filter fields to match your specific needs.
