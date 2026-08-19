# 🎨 Design Template - Quick Customization Guide

This guide shows you how to quickly customize the Warehouse Management template for your specific use case.

---

## 🚀 Quick Start (5 Minutes)

### 1. Run the Template

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see the template running.

### 2. Change the Data

**File**: `/App.tsx` (Lines 22-85)

Replace generic companies, offices, and other reference data:

```typescript
// Change company list
export const COMPANIES = [
  { name: 'Your Company A', address: 'Your Address 1' },
  { name: 'Your Company B', address: 'Your Address 2' },
  // Add more...
];

// Change office/location list
export const CUSTOMS_OFFICES = [
  { name: 'Your Office 1', address: 'Office Address 1' },
  { name: 'Your Office 2', address: 'Office Address 2' },
  // Add more...
];

// Change manager/user list
const CASE_MANAGERS = [
  'Manager Name 1',
  'Manager Name 2',
  // Add more...
];

// Change item descriptions
const DESCRIPTIONS = [
  'Your Product Type 1',
  'Your Product Type 2',
  // Add more...
];
```

### 3. Update localStorage Keys

**File**: `/App.tsx` (Lines 289-296)

Change the app identifier:

```typescript
const STORAGE_KEYS = {
  FILTER_TEMPLATES: 'yourApp_filterTemplates',      // was: warehouseApp_
  CURRENT_FILTER: 'yourApp_currentFilter',
  FILTER_CRITERIA: 'yourApp_filterCriteria',
  AUTO_CLEAR_THRESHOLD: 'yourApp_autoClearThreshold',
  TAB_ORDER: 'yourApp_tabOrder',
  FAVORITE_TAB: 'yourApp_favoriteTab'
};
```

✅ **Done!** Your template now has custom data.

---

## 🎨 Branding (10 Minutes)

### Change Colors

**Primary Blue (#003160) → Your Primary Color**

Files to update:
- `/components/FilterBar.tsx`
- `/components/FilterDrawer.tsx`
- `/components/StatusBadge.tsx`
- `/components/CircularProgress.tsx`
- `/styles/globals.css`

**Find and Replace**:
```typescript
// In all component files
bg-[#003160]  →  bg-[#YourPrimary]
text-[#003160]  →  text-[#YourPrimary]
border-[#003160]  →  border-[#YourPrimary]
```

**Secondary Orange (#FF8F00) → Your Secondary Color**

```typescript
bg-[#FF8F00]  →  bg-[#YourSecondary]
text-[#FF8F00]  →  text-[#YourSecondary]
```

### Change Fonts

**File**: `/styles/globals.css`

```css
/* Replace Inter with your font */
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;600;700&display=swap');

/* Update font family */
font-family: 'YourFont', sans-serif;  /* was: Inter */
```

**In Components**: Find all instances of `font-['Inter']` and replace with `font-['YourFont']`

---

## 📊 Data Structure (15 Minutes)

### Add New Field to Data Table

**Step 1**: Update the interface

**File**: `/components/TableRow.tsx` (Top of file)

```typescript
export interface TableRowData {
  // ... existing fields ...
  yourNewField: string;  // Add your field here
}
```

**Step 2**: Add column header

**File**: `/components/DataTable.tsx` (Find the headers section)

```typescript
<TableHeader
  label="YOUR FIELD"
  field="yourNewField"
  width="w-[150px]"
  sortable
  sortDirection={sortColumn === 'yourNewField' ? sortDirection : null}
  onSort={() => onSort('yourNewField')}
/>
```

**Step 3**: Add table cell

**File**: `/components/TableRow.tsx` (In the row rendering)

```typescript
<div className="w-[150px]">
  <EditableInput
    value={data.yourNewField}
    field="yourNewField"
    align="left"
  />
</div>
```

**Step 4**: Add to filter drawer

**File**: `/components/FilterDrawer.tsx` (In the filters section)

```typescript
<FilterInput
  label="Your Field"
  field="yourNewField"
  placeholder="Filter by your field..."
/>
```

**Step 5**: Update data generation

**File**: `/App.tsx` (In `generateAssignment` function)

```typescript
return {
  // ... existing fields ...
  yourNewField: 'Your value here',
};
```

---

## 🔍 Customize Filters (20 Minutes)

### Change Filter Field Type

**File**: `/components/FilterDrawer.tsx`

**Dropdown → Text Input**:
```typescript
// Before:
<FilterDropdown
  label="Status"
  field="status"
  options={[...]}
/>

// After:
<FilterInput
  label="Status"
  field="status"
  placeholder="Enter status..."
/>
```

**Text → Date Picker**:
```typescript
// Before:
<FilterInput
  label="Date"
  field="date"
/>

// After:
<FilterDatePicker
  label="Date"
  field="date"
/>
```

**Single Select → Multi-Select**:
```typescript
// Before:
<FilterDropdown
  label="Category"
  field="category"
  options={[...]}
/>

// After:
<MultiSelectDropdown
  label="Category"
  field="category"
  options={[...]}
/>
```

### Add New Filter Type

**File**: `/components/FilterDrawer.tsx`

Add anywhere in the scrollable filters section:

```typescript
<FilterDropdown
  label="Your Filter"
  field="yourFilterField"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]}
/>
```

**Update FilterCriteria Interface**:

**File**: `/components/FilterDrawer.tsx` (Lines 26-61)

```typescript
export interface FilterCriteria {
  // ... existing fields ...
  yourFilterField: string;  // Add here
  exclusions?: {
    // ... existing fields ...
    yourFilterField?: boolean;  // Add here too
  };
}
```

---

## ⚙️ Business Logic (30 Minutes)

### Change Auto-Clear Logic

**File**: `/App.tsx` (Lines ~950)

```typescript
// Current logic:
if (selectedRow.type === 'electronic' && progress >= autoClearThreshold) {
  newStatus = 'C';
}

// Custom logic examples:

// 1. Auto-clear all types (not just electronic)
if (progress >= autoClearThreshold) {
  newStatus = 'C';
}

// 2. Different threshold for different types
const threshold = selectedRow.type === 'electronic' ? 80 : 90;
if (progress >= threshold) {
  newStatus = 'C';
}

// 3. Additional conditions
if (
  selectedRow.type === 'electronic' && 
  progress >= autoClearThreshold &&
  customsReceipt.includes('Section 4-1-27')  // Your condition
) {
  newStatus = 'C';
}
```

### Change Status Options

**Current**: `'C' | 'PO' | 'O'` (Cleared, Partly Open, Open)

**To Change**:

1. **Update Type Definition** - Find all `status: 'C' | 'PO' | 'O'` and change to your statuses
2. **Update Status Badge** - `/components/StatusBadge.tsx` - change label mapping
3. **Update Filter Logic** - `/App.tsx` - update filter conditions
4. **Update Data Generation** - `/App.tsx` - generate with new statuses

### Add Validation Rules

**File**: `/components/WithdrawalModal.tsx` (In validation section)

```typescript
// Add custom validation
if (parseFloat(packages) > someLimit) {
  alert('Packages exceed limit');
  return;
}

if (weight && !customCondition) {
  alert('Custom condition not met');
  return;
}
```

---

## 🏷️ Rename Terminology (15 Minutes)

### Change "Assignment" to Your Term

**Find and Replace Across All Files**:

```
"Assignment"  →  "Your Term" (e.g., "Order", "Shipment", "Entry")
"assignment"  →  "yourterm"
```

**Files to Update**:
- `/components/AddAssignmentModal.tsx` → Rename to `AddYourTermModal.tsx`
- `/App.tsx` - Update all references
- `/components/TopBar.tsx` - Update button label

### Change "Customs Officer" to Your Term

**Examples**:
- "Customs Officer" → "Warehouse Manager"
- "Customs Officer" → "Processing Agent"
- "Customs Officer" → "Assigned To"

**Files**:
- `/App.tsx` - Rename `CUSTOMS_OFFICES` to `YOUR_OFFICES`
- `/components/FilterDrawer.tsx` - Update label
- `/components/TableRow.tsx` - Update cell label

### Change Column Labels

**File**: `/components/DataTable.tsx`

Find column headers and update labels:

```typescript
<TableHeader label="ORDER" />  →  <TableHeader label="YOUR LABEL" />
```

---

## 🎯 Remove Unused Features (10 Minutes)

### Remove Multi-Select Checkboxes

**File**: `/components/DataTable.tsx`

1. Remove the checkbox column header
2. Remove `selectedRows` prop
3. Remove `onRowSelect` handling

**File**: `/components/TableRow.tsx`

1. Remove checkbox cell

### Remove Auto-Clear Threshold

**File**: `/components/TopBar.tsx`

1. Remove settings button
2. Remove threshold display

**File**: `/App.tsx`

1. Remove `ThresholdSettingsModal`
2. Remove threshold state
3. Remove threshold logic from withdrawal

### Remove Filter Templates

**File**: `/components/FilterBar.tsx`

1. Remove template tabs
2. Remove template context menus
3. Keep only global tabs

**File**: `/App.tsx`

1. Remove `templates` state
2. Remove template-related handlers
3. Remove `CreateTemplateModal`

---

## 📱 Add New Features (Advanced)

### Add Export to CSV

```typescript
const exportToCSV = () => {
  const headers = ['Order', 'Goods No', 'Description', /* ... */];
  const rows = filteredData.map(item => [
    item.order,
    item.goodsNo,
    item.description,
    // ... more fields
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  a.click();
};
```

### Add Print View

```typescript
const printTable = () => {
  window.print();
};

// Add to globals.css:
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
}
```

### Add Backend Integration

```typescript
// Fetch data from API
useEffect(() => {
  fetch('https://your-api.com/data')
    .then(res => res.json())
    .then(data => setData(data));
}, []);

// Save withdrawal to API
const handleWithdrawalSave = async (packages, weight, receipt) => {
  await fetch(`https://your-api.com/withdrawals/${selectedRow.id}`, {
    method: 'POST',
    body: JSON.stringify({ packages, weight, receipt }),
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Then update local state...
};
```

---

## 🔍 Debugging Tips

### Check localStorage

```javascript
// In browser console:
localStorage.getItem('warehouseApp_filterTemplates')  // See saved templates
localStorage.clear()  // Clear all saved state
```

### Enable React DevTools

```bash
# Install browser extension
# Chrome/Edge: React Developer Tools
# Firefox: React Developer Tools
```

### Common Issues

**Filters not working**:
- Check field names match in FilterCriteria interface
- Verify filter logic in App.tsx

**Data not saving**:
- Check localStorage keys are correct
- Verify useEffect dependencies

**Styling broken**:
- Ensure Tailwind CSS is configured
- Check globals.css is imported

---

## ✅ Quick Reference Checklist

Use this checklist when customizing:

- [ ] Updated COMPANIES data
- [ ] Updated CUSTOMS_OFFICES data  
- [ ] Updated CASE_MANAGERS data
- [ ] Changed localStorage keys
- [ ] Updated primary color (#003160)
- [ ] Updated secondary color (#FF8F00)
- [ ] Changed font family (if needed)
- [ ] Added/removed data fields
- [ ] Customized filter fields
- [ ] Updated business logic
- [ ] Renamed terminology
- [ ] Removed unused features
- [ ] Tested all modals
- [ ] Tested filtering
- [ ] Tested sorting
- [ ] Verified localStorage persistence

---

## 📚 Next Steps

1. **Test Thoroughly** - Try all features with your custom data
2. **Review Code** - Read through modified files
3. **Add Features** - Extend with your requirements
4. **Deploy** - Build and deploy your customized template

---

**Need more help?** Check the main documentation files or review the code comments!
