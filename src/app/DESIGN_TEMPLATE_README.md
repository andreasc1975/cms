# 📦 Warehouse Management System - Design Template

**Version**: 1.0.0  
**Framework**: React 18+ with TypeScript  
**Styling**: Tailwind CSS 4.0+ with Inter & Roboto Mono fonts  
**UI Components**: ShadCN UI

---

## 🎯 Overview

This is a **production-ready design template** for a comprehensive Warehouse Management System with advanced filtering, real-time data updates, and sophisticated business logic. The template features a complete UI/UX implementation suitable for logistics, inventory management, customs clearance, or any warehouse tracking application.

## ✨ Key Features

### 📊 Data Management
- **51 sample records** with realistic data distribution:
  - 35 Cleared items (status 'C')
  - 12 Partly Open items (status 'PO')
  - 4 Open items (status 'O')
- **Dual entry types**: Manual (30%) and Electronic (70%)
- **Automatic status updates** based on withdrawal thresholds
- **Multi-field data tracking**: Order, goods number, date, description, transport ID, parties, officers, managers, packages, weight

### 🔍 Advanced Filtering System
- **Global Tabs**: All, Open, Cleared, Manual, Electronic
- **Personal Tabs**: User-created filter templates with save/load/delete
- **Tab Reordering**: Drag-and-drop tab customization
- **Include/Exclude Logic**: Toggle between filtering modes (blue/orange indicators)
- **Multi-Select Filters**: Progress ranges, multiple criteria
- **Filter Chips**: Visual display of active filters with remove buttons
- **Search Integration**: Global search across all fields
- **Persistent State**: localStorage auto-save

### 📋 Data Table
- **Sortable Columns**: Click to sort by any field
- **Multi-Select**: Bulk operations with checkbox selection
- **Progress Tracking**: Visual progress bars (0-100%)
- **Status Badges**: Color-coded status indicators
- **Inline Editing**: Editable cells (configurable)
- **Row Actions**: Click to open withdrawal modal
- **Responsive Layout**: Adapts to filter drawer visibility

### ⚙️ Business Logic
- **Auto-Clear Threshold**: Configurable percentage (default 80%)
- **Electronic Assignment Auto-Clear**: Automatically clears when withdrawal reaches threshold
- **Weight vs. Package Logic**: Uses maximum of either for progress calculation
- **Validation Rules**: 
  - Withdrawal cannot exceed stored amounts
  - Open items have blank receipts
  - Cleared items have complete data

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface
- **Consistent Typography**: 
  - 10px bold uppercase column headers with 0.7 letter-spacing
  - 12px body text throughout
  - Inter font for UI, Roboto Mono for numbers
- **Color System**:
  - Primary Blue: #003160 (included filters, primary actions)
  - Secondary Orange: #FF8F00 (excluded filters, manual additions)
  - Neutral grays for backgrounds and borders
- **Smooth Animations**: Transitions for drawers, modals, hovers
- **Light Mode Optimized**: Light scrollbars and UI elements

## 📁 File Structure

```
warehouse-template/
├── App.tsx                          # Main application logic
├── components/
│   ├── Sidebar.tsx                  # Left navigation sidebar
│   ├── TopBar.tsx                   # Top header with actions
│   ├── FilterBar.tsx                # Tab navigation + filter chips
│   ├── SearchBar.tsx                # Global search input
│   ├── DataTable.tsx                # Main data table
│   ├── TableHeader.tsx              # Sortable column headers
│   ├── TableRow.tsx                 # Table row with data cells
│   ├── FilterDrawer.tsx             # Right filter panel
│   ├── WithdrawalModal.tsx          # Withdrawal entry modal
│   ├── AddAssignmentModal.tsx       # Add new item modal
│   ├── ThresholdSettingsModal.tsx   # Auto-clear settings
│   ├── CreateTemplateModal.tsx      # Save filter template
│   ├── ReorderTabsModal.tsx         # Tab ordering interface
│   ├── StatusBadge.tsx              # Status indicators
│   ├── CircularProgress.tsx         # Progress visualization
│   ├── EditableInput.tsx            # Inline editing
│   ├── ActionButton.tsx             # Action buttons
│   ├── RefreshIntervalModal.tsx     # Refresh settings
│   └── ui/                          # ShadCN components
│       ├── select.tsx
│       ├── dropdown-menu.tsx
│       ├── calendar.tsx
│       ├── popover.tsx
│       └── ... (40+ UI components)
├── styles/
│   └── globals.css                  # Global styles
└── imports/
    └── svg-b75trn6pxk.ts           # SVG icon paths
```

## 🚀 Getting Started

### Prerequisites

```bash
# Install dependencies
npm install lucide-react date-fns

# Install ShadCN components (if needed)
npx shadcn-ui@latest add select dropdown-menu calendar popover
```

### Run the Template

```bash
# Development mode
npm run dev

# Build for production
npm run build
```

### First Time Setup

The template includes demo data and will work immediately. On first load:

1. **Explore Global Tabs** - Click All, Open, Cleared, Manual, Electronic
2. **Open Filter Drawer** - Click filter icon (top right)
3. **Try Filtering** - Select different criteria and see results update
4. **Create a Template** - Add filters, click "Create Template"
5. **Test Withdrawal** - Click any row to open withdrawal modal
6. **Add New Item** - Click "+" button to add assignment

## 📊 Data Structure

### TableRowData Interface

```typescript
interface TableRowData {
  id: string;                        // Unique identifier
  status: 'C' | 'PO' | 'O';         // Cleared, Partly Open, Open
  type: 'manual' | 'electronic';     // Entry type
  order: string;                     // Order number
  goodsNo: string;                   // Goods/Item number
  date: string;                      // Date (DD/MM/YY)
  description: string;               // Item description
  transportId: string;               // Transport/Shipment ID
  sender: Company;                   // Sender company
  consignee: Company;                // Consignee company
  owner: Company;                    // Owner company
  customsReceipt: string;            // Receipt/Classification
  customsOfficer: Office;            // Processing office
  caseManager: string;               // Assigned manager
  drawnPackages: string;             // Number of withdrawals
  storedPackages: string;            // Total packages (formatted)
  storedWeight: string;              // Total weight (formatted)
  withdrawalPackages: string;        // Withdrawn packages (formatted)
  withdrawalWeight: string;          // Withdrawn weight (formatted)
}
```

### Company/Office Interface

```typescript
interface Company {
  name: string;
  address: string;
}
```

## 🎨 Customization Guide

### 1. Change Color Scheme

Update colors in components:

```typescript
// Primary color (currently #003160)
className="bg-[#003160]"  →  className="bg-[#YourColor]"

// Secondary color (currently #FF8F00)
className="bg-[#FF8F00]"  →  className="bg-[#YourSecondary]"
```

### 2. Modify Data Fields

Edit `TableRowData` interface in `App.tsx` and update corresponding components:
- TableRow.tsx (cell rendering)
- TableHeader.tsx (column headers)
- FilterDrawer.tsx (filter fields)

### 3. Add New Filter Types

In `FilterDrawer.tsx`, add new filter components:

```typescript
<FilterDropdown
  label="Your Field"
  field="yourField"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
/>
```

### 4. Customize Business Logic

Modify auto-clear logic in `App.tsx`:

```typescript
// Line ~950 in handleWithdrawalSave
if (selectedRow.type === 'electronic' && progress >= autoClearThreshold) {
  newStatus = 'C';  // Your custom logic here
}
```

### 5. Change Sample Data

Update data generators in `App.tsx`:

```typescript
// Lines 22-85: Company lists, officers, managers, descriptions
export const COMPANIES = [
  { name: 'Your Company', address: 'Your Address' },
  // ... more companies
];
```

## 🔧 Technical Details

### State Management

- **React useState**: All state management
- **localStorage**: Automatic persistence of:
  - Filter templates
  - Current filter selection
  - Filter criteria
  - Auto-clear threshold
  - Tab order

### Performance Optimizations

- **useMemo**: Filtered data, counts, template counts
- **useCallback**: Event handlers to prevent re-renders
- **Lazy Loading**: Components only load when needed

### TypeScript

Fully typed with strict mode:
- Interface definitions for all data structures
- Type-safe props for all components
- No `any` types in production code

### Responsive Design

- **Sidebar**: Fixed 235px width
- **Filter Drawer**: Fixed 340px width when open
- **Main Content**: Fluid width adjusts based on sidebar/drawer state
- **Mobile**: Optimized for tablet and desktop (mobile requires custom breakpoints)

## 📝 Key Files to Customize

### Essential Files

1. **App.tsx** - Main logic, data, filters
2. **TableRow.tsx** - Row rendering and cell display
3. **FilterDrawer.tsx** - Filter fields and options
4. **FilterBar.tsx** - Tab configuration

### Optional Files

5. **WithdrawalModal.tsx** - Withdrawal/update logic
6. **AddAssignmentModal.tsx** - New item creation
7. **ThresholdSettingsModal.tsx** - Settings interface
8. **globals.css** - Styling and typography

## 🎯 Use Cases

This template is perfect for:

- ✅ **Customs Warehouse Management** (original use case)
- ✅ **Inventory Tracking Systems**
- ✅ **Logistics & Distribution**
- ✅ **Shipment Management**
- ✅ **Order Fulfillment Systems**
- ✅ **Stock Control Applications**
- ✅ **Import/Export Management**
- ✅ **Warehouse Operations**

## 📚 Additional Resources

### Documentation Files

- **FILTERING_PACKAGE_README.md** - Complete filtering system guide
- **FILTERING_PACKAGE_QUICKSTART.md** - 5-minute setup guide
- **FILTERING_PACKAGE_EXAMPLES.md** - Code examples
- **FILTERING_PACKAGE_MIGRATION.md** - Adaptation guide
- **FILTERING_PACKAGE_DEPENDENCIES.md** - Requirements

### Reference Implementation

The filtering system has been extracted into a reusable package. See the `FILTERING_PACKAGE_*` files for:
- Standalone filtering components
- Integration examples
- Migration guides for different use cases

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Generic data instead of domain-specific
- ✅ 51 sample records with realistic distribution
- ✅ Complete filtering system with templates
- ✅ Auto-clear logic for electronic entries
- ✅ Multi-select bulk operations
- ✅ Sortable columns
- ✅ Persistent state with localStorage
- ✅ Fully documented and commented code

## 🎓 Learning Path

### Beginner (Explore the Template)
1. Run the application
2. Test all features (filtering, sorting, modals)
3. Review the data structure
4. Understand the status flow

### Intermediate (Customize)
1. Change colors and branding
2. Modify sample data
3. Add/remove filter fields
4. Adjust business logic

### Advanced (Extend)
1. Add new features (export, import, reports)
2. Integrate with backend API
3. Add authentication
4. Create mobile version

## 📄 License

MIT License - Free to use in commercial and personal projects.

## 🤝 Support

For questions or issues:
- Review the code comments (extensively documented)
- Check the filtering package documentation
- Examine the example data and logic

---

**Built with ❤️ for modern web applications**

*Ready to customize and deploy!* 🚀
