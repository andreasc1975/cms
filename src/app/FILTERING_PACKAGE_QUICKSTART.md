# 🚀 Quick Start Guide - Filtering System

Get the filtering system up and running in your project in **5 minutes**.

## Step 1: Install Dependencies (2 min)

```bash
# Install NPM packages
npm install lucide-react date-fns

# Install ShadCN components
npx shadcn-ui@latest add select dropdown-menu calendar popover
```

## Step 2: Copy Component Files (1 min)

Copy these files from the package to your project:

```bash
# From this package to your project:
components/FilterBar.tsx       → your-project/components/FilterBar.tsx
components/FilterDrawer.tsx    → your-project/components/FilterDrawer.tsx
```

## Step 3: Create Type Definitions (1 min)

Create `types/filtering.ts`:

```typescript
export interface FilterCriteria {
  status: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  exclusions?: {
    status?: boolean;
    category?: boolean;
    dateFrom?: boolean;
    dateTo?: boolean;
  };
}

export interface FilterTemplate {
  id: string;
  name: string;
  criteria: FilterCriteria;
}
```

## Step 4: Add to Your Component (1 min)

```typescript
import { useState } from 'react';
import { FilterBar } from './components/FilterBar';
import { FilterDrawer } from './components/FilterDrawer';
import type { FilterCriteria, FilterTemplate } from './types/filtering';

export default function App() {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    status: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    exclusions: {}
  });

  // Sample data
  const data = [
    { id: 1, name: 'Item 1', status: 'open', category: 'A' },
    { id: 2, name: 'Item 2', status: 'closed', category: 'B' },
  ];

  // Filter logic
  const filteredData = data.filter(item => {
    if (filterCriteria.status && item.status !== filterCriteria.status) {
      return false;
    }
    if (filterCriteria.category && item.category !== filterCriteria.category) {
      return false;
    }
    return true;
  });

  return (
    <div className="relative">
      {/* Filter Bar */}
      <FilterBar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onFilterClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
        filterDrawerOpen={filterDrawerOpen}
        counts={{
          all: data.length,
          open: data.filter(d => d.status === 'open').length,
          cleared: data.filter(d => d.status === 'closed').length,
          manual: 0,
          electronic: 0
        }}
        filterCriteria={filterCriteria}
        onRemoveFilter={(field) => {
          setFilterCriteria(prev => ({ ...prev, [field]: '' }));
        }}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filterCriteria}
        onFilterChange={(field, value) => {
          setFilterCriteria(prev => ({ ...prev, [field]: value }));
        }}
      />

      {/* Your content */}
      <div className="mt-[130px] p-4">
        {filteredData.map(item => (
          <div key={item.id} className="p-4 border mb-2">
            {item.name} - {item.status}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Step 5: Customize Filter Fields (Optional)

Edit `FilterDrawer.tsx` to add your specific filters. Find the section with filter inputs and modify:

```typescript
// In FilterDrawer.tsx, look for the filter fields section:

<FilterDropdown
  label="Status"
  field="status"
  options={[
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' }
  ]}
/>

<FilterDropdown
  label="Category"
  field="category"
  options={[
    { value: 'A', label: 'Category A' },
    { value: 'B', label: 'Category B' }
  ]}
/>

<FilterDatePicker
  label="Date From"
  field="dateFrom"
/>

<FilterDatePicker
  label="Date To"
  field="dateTo"
/>
```

## ✅ You're Done!

Your filtering system is now ready. You should see:

- ✅ Filter bar with tabs at the top
- ✅ Filter drawer on the right (click filter icon to open)
- ✅ Active filter chips below the tab bar
- ✅ Include/exclude toggle icons
- ✅ Working filters that update your data

## 🎨 Next Steps

### Add Template Support

```typescript
const [templates, setTemplates] = useState<FilterTemplate[]>([]);

const handleCreateTemplate = () => {
  const newTemplate: FilterTemplate = {
    id: `template_${Date.now()}`,
    name: prompt('Template name:') || 'My Filter',
    criteria: { ...filterCriteria }
  };
  setTemplates(prev => [...prev, newTemplate]);
};

// Add to FilterBar props:
<FilterBar
  {...existingProps}
  templates={templates}
  onCreateTemplate={handleCreateTemplate}
/>
```

### Add Persistence

```typescript
// Save to localStorage
useEffect(() => {
  localStorage.setItem('filterCriteria', JSON.stringify(filterCriteria));
}, [filterCriteria]);

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('filterCriteria');
  if (saved) setFilterCriteria(JSON.parse(saved));
}, []);
```

### Add Search

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredData = data.filter(item => {
  // Apply filters...
  
  // Add search
  if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return false;
  }
  
  return true;
});

// Add to FilterBar:
<FilterBar
  {...existingProps}
  searchQuery={searchQuery}
  onClearSearch={() => setSearchQuery('')}
/>
```

## 🐛 Common Issues

### "Module not found: FilterBar"
- ✅ Ensure FilterBar.tsx is in `/components/`
- ✅ Check import path matches file location

### "lucide-react not found"
- ✅ Run `npm install lucide-react`

### Styles not working
- ✅ Ensure Tailwind CSS is configured
- ✅ Add globals.css to your project
- ✅ Import globals.css in your main file

### Filter drawer not visible
- ✅ Check `filterDrawerOpen` state is toggling
- ✅ Ensure no z-index conflicts
- ✅ Verify drawer width calculations

## 📚 Full Documentation

For complete details, see:
- [FILTERING_PACKAGE_README.md](./FILTERING_PACKAGE_README.md) - Complete usage guide
- [FILTERING_PACKAGE_DEPENDENCIES.md](./FILTERING_PACKAGE_DEPENDENCIES.md) - All dependencies
- [FILTERING_PACKAGE_EXAMPLES.md](./FILTERING_PACKAGE_EXAMPLES.md) - Code examples

## 💡 Pro Tips

1. **Start Simple**: Begin with just FilterBar, add FilterDrawer later
2. **Use TypeScript**: Type safety prevents many common errors
3. **Test Incrementally**: Add one filter field at a time
4. **Customize Gradually**: Get basic filtering working first, then customize
5. **Check Browser Console**: Most issues show clear error messages

---

**Need help?** Check the full documentation or examine the source code comments.
