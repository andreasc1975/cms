# 🔄 Migration Guide - From Customs Warehouse to Your Project

Step-by-step guide to adapt the Customs Warehouse filtering system to your specific project.

## 📋 Pre-Migration Checklist

Before you begin, gather the following information about your project:

- [ ] What data are you filtering? (products, users, tasks, etc.)
- [ ] What fields does your data have?
- [ ] What filter types do you need? (dropdowns, text search, dates, etc.)
- [ ] Do you need templates/saved filters?
- [ ] Do you need include/exclude functionality?
- [ ] Do you need multi-select filters?
- [ ] What are your main filter categories? (equivalent to All/Open/Cleared)

## Step 1: Analyze Current Implementation

### Customs Warehouse Structure

```typescript
// Current FilterCriteria in Customs Warehouse
interface FilterCriteria {
  status: string;           // Dropdown: C, O, PO
  progress: string[];       // Multi-select: 0-25%, 25-50%, etc.
  type: string;             // Dropdown: manual, electronic
  order: string;            // Text input
  goodsNo: string;          // Text input
  date: string;             // Date picker
  description: string;      // Text input
  transportId: string;      // Text input
  sender: string;           // Text input
  consignee: string;        // Text input
  owner: string;            // Text input
  customsReceipt: string;   // Text input
  customsOfficer: string;   // Text input
  caseManager: string;      // Text input
  storedPackages: string;   // Numeric input
  storedWeight: string;     // Numeric input
  exclusions?: { ... };     // Include/exclude toggles
}
```

### Your Project Structure

Map your data to a similar structure:

```typescript
// Example: E-commerce Product Filtering
interface YourFilterCriteria {
  category: string;         // Maps to: status
  priceRange: string[];     // Maps to: progress (multi-select)
  brand: string;            // Maps to: type
  name: string;             // Maps to: order (text search)
  sku: string;              // Maps to: goodsNo
  dateAdded: string;        // Maps to: date
  // Add your other fields...
  exclusions?: { ... };
}
```

## Step 2: Create Mapping Table

| Customs Warehouse Field | Your Field | Filter Type | Notes |
|------------------------|------------|-------------|-------|
| status | category | Dropdown | Product categories |
| progress | priceRange | Multi-select | Price ranges |
| type | brand | Dropdown | Product brands |
| order | productName | Text Input | Product name search |
| goodsNo | sku | Text Input | SKU search |
| date | dateAdded | Date Picker | When product was added |
| description | description | Text Input | Product description |
| customsOfficer | assignedTo | Dropdown | Assigned employee |
| storedPackages | quantity | Numeric | Stock quantity |
| storedWeight | weight | Numeric | Product weight |

## Step 3: Update Type Definitions

### Create Your FilterCriteria Type

```typescript
// types/filtering.ts
export interface YourFilterCriteria {
  // Map each Customs Warehouse field to your equivalent
  category: string;              // was: status
  priceRange: string[];          // was: progress
  brand: string;                 // was: type
  productName: string;           // was: order
  sku: string;                   // was: goodsNo
  dateAdded: string;             // was: date
  description: string;           // same
  assignedTo: string;            // was: customsOfficer
  quantity: string;              // was: storedPackages
  weight: string;                // was: storedWeight
  
  // Keep exclusions structure the same
  exclusions?: {
    category?: boolean;
    priceRange?: boolean;
    brand?: boolean;
    productName?: boolean;
    sku?: boolean;
    dateAdded?: boolean;
    description?: boolean;
    assignedTo?: boolean;
    quantity?: boolean;
    weight?: boolean;
  };
}

export interface FilterTemplate {
  id: string;
  name: string;
  criteria: YourFilterCriteria;
  isGlobal?: boolean;
}
```

## Step 4: Modify FilterDrawer.tsx

### Find and Replace Filter Fields

Open `FilterDrawer.tsx` and locate the section with filter inputs (around line 800-1000).

**Before (Customs Warehouse):**
```typescript
<FilterDropdown
  label="Status"
  field="status"
  options={[
    { value: 'C', label: 'Cleared' },
    { value: 'O', label: 'Open' },
    { value: 'PO', label: 'Partly Open' }
  ]}
/>
```

**After (Your Project):**
```typescript
<FilterDropdown
  label="Category"
  field="category"
  options={[
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Garden' }
  ]}
/>
```

### Complete Replacement Template

Replace the entire filter fields section in `FilterDrawer.tsx`:

```typescript
{/* YOUR CUSTOM FILTERS START HERE */}

{/* Dropdown Example */}
<FilterDropdown
  label="Category"
  field="category"
  options={[
    { value: 'cat1', label: 'Category 1' },
    { value: 'cat2', label: 'Category 2' }
  ]}
/>

{/* Multi-Select Example */}
<MultiSelectDropdown
  label="Price Range"
  field="priceRange"
  options={[
    { value: '0-50', label: '$0 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100+', label: '$100+' }
  ]}
/>

{/* Text Input Example */}
<FilterInput
  label="Product Name"
  field="productName"
  placeholder="Search by name..."
/>

{/* Date Picker Example */}
<FilterDatePicker
  label="Date Added"
  field="dateAdded"
/>

{/* Numeric Input Example */}
<FilterNumericInput
  label="Quantity"
  field="quantity"
/>

{/* YOUR CUSTOM FILTERS END HERE */}
```

## Step 5: Update FilterBar.tsx

### Modify Tab Configuration

Find the `tabConfig` object in `FilterBar.tsx` (around line 536):

**Before (Customs Warehouse):**
```typescript
const tabConfig: { [key: string]: { label: string; count: number } } = {
  all: { label: 'All', count: counts.all },
  open: { label: 'open', count: counts.open },
  cleared: { label: 'Cleared', count: counts.cleared },
  manual: { label: 'Manual', count: counts.manual },
  electronic: { label: 'Electronic', count: counts.electronic }
};
```

**After (Your Project):**
```typescript
const tabConfig: { [key: string]: { label: string; count: number } } = {
  all: { label: 'All Products', count: counts.all },
  inStock: { label: 'In Stock', count: counts.inStock },
  outOfStock: { label: 'Out of Stock', count: counts.outOfStock },
  featured: { label: 'Featured', count: counts.featured },
  onSale: { label: 'On Sale', count: counts.onSale }
};
```

### Update Filter Chip Labels

Find the `getActiveFilterChips` function in `FilterBar.tsx` (around line 270):

**Replace chip label generation:**
```typescript
// Before (Customs Warehouse)
if (filterCriteria.status) {
  const statusLabel = filterCriteria.status === 'C' ? 'Cleared' : 
                     filterCriteria.status === 'O' ? 'Open' : filterCriteria.status;
  chips.push({ 
    key: 'status', 
    label: `STATUS: ${statusLabel}`, 
    field: 'status'
  });
}

// After (Your Project)
if (filterCriteria.category) {
  chips.push({ 
    key: 'category', 
    label: `CATEGORY: ${filterCriteria.category}`, 
    field: 'category'
  });
}
```

## Step 6: Update Parent Component (App.tsx)

### Replace Filter Logic

**Before (Customs Warehouse):**
```typescript
const filteredData = data.filter(item => {
  // Customs-specific logic
  if (filterCriteria.status === 'OPEN') {
    if (item.status !== 'O' && item.status !== 'PO') return false;
  }
  // ... more customs logic
});
```

**After (Your Project):**
```typescript
const filteredData = products.filter(product => {
  // Category filter
  if (filterCriteria.category) {
    const isExcluded = filterCriteria.exclusions?.category;
    const matches = product.category === filterCriteria.category;
    if (isExcluded ? matches : !matches) return false;
  }

  // Price range filter
  if (filterCriteria.priceRange.length > 0) {
    const isExcluded = filterCriteria.exclusions?.priceRange;
    const matches = filterCriteria.priceRange.some(range => {
      const [min, max] = range.split('-').map(Number);
      return product.price >= min && (!max || product.price <= max);
    });
    if (isExcluded ? matches : !matches) return false;
  }

  // Text search
  if (filterCriteria.productName) {
    const isExcluded = filterCriteria.exclusions?.productName;
    const matches = product.name.toLowerCase().includes(filterCriteria.productName.toLowerCase());
    if (isExcluded ? matches : !matches) return false;
  }

  return true;
});
```

### Update Count Calculations

**Before (Customs Warehouse):**
```typescript
const counts = {
  all: data.length,
  open: data.filter(d => d.status === 'O' || d.status === 'PO').length,
  cleared: data.filter(d => d.status === 'C').length,
  manual: data.filter(d => d.type === 'manual').length,
  electronic: data.filter(d => d.type === 'electronic').length
};
```

**After (Your Project):**
```typescript
const counts = {
  all: products.length,
  inStock: products.filter(p => p.inStock).length,
  outOfStock: products.filter(p => !p.inStock).length,
  featured: products.filter(p => p.isFeatured).length,
  onSale: products.filter(p => p.discount > 0).length
};
```

## Step 7: Update Default Tab Behavior

### Modify Tab Click Handler

In your parent component:

**Before (Customs Warehouse):**
```typescript
const handleFilterChange = (filter: string) => {
  setCurrentFilter(filter);
  
  if (filter === 'all') {
    setFilterCriteria(defaultCriteria);
  } else if (filter === 'open') {
    setFilterCriteria({ ...defaultCriteria, status: 'OPEN' });
  } else if (filter === 'cleared') {
    setFilterCriteria({ ...defaultCriteria, status: 'C' });
  }
  // ... more cases
};
```

**After (Your Project):**
```typescript
const handleFilterChange = (filter: string) => {
  setCurrentFilter(filter);
  
  if (filter === 'all') {
    setFilterCriteria(defaultCriteria);
  } else if (filter === 'inStock') {
    setFilterCriteria({ ...defaultCriteria, inStock: 'yes' });
  } else if (filter === 'outOfStock') {
    setFilterCriteria({ ...defaultCriteria, inStock: 'no' });
  } else if (filter === 'onSale') {
    setFilterCriteria({ ...defaultCriteria, onSale: 'yes' });
  }
  // ... your cases
};
```

## Step 8: Remove Customs-Specific Code

### Items to Remove/Replace

1. **SVG Imports** (if not using custom icons):
```typescript
// Remove this line from FilterBar.tsx
import svgPaths from "../imports/svg-b75trn6pxk";
```

2. **Company/Officer Dropdowns** (if not needed):
```typescript
// Remove from FilterDrawer props
companies?: { name: string; address: string }[];
customsOfficers?: { name: string; address: string }[];
```

3. **Customs-Specific Validation**:
Remove any business logic specific to customs (e.g., "Open items must have blank Customs Receipt")

## Step 9: Test Migration

### Checklist

- [ ] All filter fields render correctly
- [ ] Dropdown options match your data
- [ ] Text inputs accept and filter data
- [ ] Date pickers work with your date format
- [ ] Multi-select filters work
- [ ] Include/exclude toggle works
- [ ] Filter chips display correctly
- [ ] Clearing filters works
- [ ] Templates can be created and saved
- [ ] Tab switching works
- [ ] Counts update correctly
- [ ] Mobile responsive (if needed)

## Step 10: Customize Styling (Optional)

### Update Colors

Find and replace color values in both files:

```typescript
// Primary blue: #003160
// Replace with your primary color

// Secondary orange: #FF8F00
// Replace with your secondary color

// Find in both FilterBar.tsx and FilterDrawer.tsx:
className="text-[#003160]"          → className="text-[#yourColor]"
style={{ backgroundColor: '#003160' }} → style={{ backgroundColor: '#yourColor' }}
```

### Update Typography

```typescript
// Replace font family if needed:
font-['Inter']  → font-['YourFont']
font-roboto-mono → font-['YourMonoFont']
```

## 🎯 Quick Migration Example

### Minimal Migration (10 minutes)

If you just want to get it working quickly:

1. **Copy files** → `FilterBar.tsx`, `FilterDrawer.tsx`
2. **Update types** → Change `FilterCriteria` interface
3. **Replace filter fields** → Update fields in `FilterDrawer.tsx`
4. **Update tabs** → Modify `tabConfig` in `FilterBar.tsx`
5. **Add filter logic** → Implement filtering in parent component

### Complete Migration (1 hour)

For production-ready implementation:

1. All steps from Minimal Migration
2. Update all filter chip labels
3. Implement template management
4. Add localStorage persistence
5. Customize styling to match your brand
6. Add comprehensive filtering logic
7. Test all edge cases
8. Add error handling

## 🐛 Common Migration Issues

### Issue 1: TypeScript Errors

**Problem**: `Property 'yourField' does not exist on type 'FilterCriteria'`

**Solution**: Make sure you updated the `FilterCriteria` interface in both `FilterDrawer.tsx` and your types file.

### Issue 2: Filter Not Working

**Problem**: Selecting filter doesn't filter data

**Solution**: Check that field names in `FilterCriteria` match exactly in:
- Type definition
- FilterDrawer field prop
- Parent component filter logic

### Issue 3: Chips Show Wrong Labels

**Problem**: Filter chips display "undefined" or wrong text

**Solution**: Update the `getActiveFilterChips` function in `FilterBar.tsx` with your field names.

### Issue 4: Counts Not Updating

**Problem**: Tab counts show 0 or wrong numbers

**Solution**: Update the count calculation logic in parent component to match your data structure.

## 📚 Additional Resources

- See `FILTERING_PACKAGE_EXAMPLES.md` for complete working examples
- See `FILTERING_PACKAGE_README.md` for detailed API documentation
- Check source code comments for inline guidance

---

**Migration Complete!** 🎉

Your filtering system should now be adapted to your project. Test thoroughly and customize further as needed.
