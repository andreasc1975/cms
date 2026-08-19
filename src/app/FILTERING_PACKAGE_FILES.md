# 📦 Filtering Package - File Extraction Guide

This document lists all files you need to extract from the Customs Warehouse project to create your reusable filtering package.

---

## 📋 Files to Copy

### ✅ Core Components (REQUIRED)

These are the main filtering components you must copy:

```bash
# From Customs Warehouse → To Your Package/Project

/components/FilterBar.tsx           → /components/FilterBar.tsx
/components/FilterDrawer.tsx        → /components/FilterDrawer.tsx
```

**Size**: ~1,700 lines of code combined  
**Dependencies**: lucide-react, date-fns, ShadCN components

---

### ✅ ShadCN UI Components (REQUIRED)

These UI components are required by FilterBar and FilterDrawer:

```bash
# Install via ShadCN CLI (recommended):
npx shadcn-ui@latest add select dropdown-menu calendar popover

# Or copy manually from Customs Warehouse:
/components/ui/select.tsx           → /components/ui/select.tsx
/components/ui/dropdown-menu.tsx    → /components/ui/dropdown-menu.tsx
/components/ui/calendar.tsx         → /components/ui/calendar.tsx
/components/ui/popover.tsx          → /components/ui/popover.tsx
```

**Additional Dependencies** (installed automatically with ShadCN):
```bash
/components/ui/button.tsx           → /components/ui/button.tsx
/components/ui/utils.ts             → /components/ui/utils.ts
```

---

### ⚠️ SVG Icons (OPTIONAL)

Only needed if you want to use the custom refresh/filter icons from Customs Warehouse:

```bash
/imports/svg-b75trn6pxk.ts          → /imports/svg-b75trn6pxk.ts
```

**Note**: If you skip this file, you'll need to:
1. Remove SVG icon imports from FilterBar.tsx
2. Replace custom SVG buttons with Lucide icons

**Alternative**: Use Lucide icons instead (recommended):
```typescript
import { RefreshCw, Filter } from 'lucide-react';
```

---

### ✅ Styles (REQUIRED)

Critical CSS for proper rendering:

```bash
/styles/globals.css                 → /styles/globals.css
```

**Required styles from globals.css**:
- Scrollbar styles (light mode)
- Checkbox styles
- Font definitions
- Tailwind base styles

**Minimum required CSS**:
```css
/* Add to your globals.css */

/* Light mode scrollbars */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Checkbox styles */
.checkbox-light {
  appearance: none;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-light:checked {
  background-color: #003160;
  border-color: #003160;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}
```

---

### 📄 Documentation (RECOMMENDED)

Copy these documentation files to understand and use the package:

```bash
/FILTERING_PACKAGE_INDEX.md         → /docs/FILTERING_PACKAGE_INDEX.md
/FILTERING_PACKAGE_QUICKSTART.md    → /docs/FILTERING_PACKAGE_QUICKSTART.md
/FILTERING_PACKAGE_README.md        → /docs/FILTERING_PACKAGE_README.md
/FILTERING_PACKAGE_DEPENDENCIES.md  → /docs/FILTERING_PACKAGE_DEPENDENCIES.md
/FILTERING_PACKAGE_EXAMPLES.md      → /docs/FILTERING_PACKAGE_EXAMPLES.md
/FILTERING_PACKAGE_MIGRATION.md     → /docs/FILTERING_PACKAGE_MIGRATION.md
/FILTERING_PACKAGE_FILES.md         → /docs/FILTERING_PACKAGE_FILES.md
```

---

## 🚫 Files NOT Needed

These files are specific to Customs Warehouse and should NOT be copied:

```bash
# Application-specific components
/components/DataTable.tsx           ❌ Don't copy (customs-specific)
/components/TableRow.tsx            ❌ Don't copy (customs-specific)
/components/TableHeader.tsx         ❌ Don't copy (customs-specific)
/components/Sidebar.tsx             ❌ Don't copy (customs-specific)
/components/TopBar.tsx              ❌ Don't copy (customs-specific)
/components/AddAssignmentModal.tsx  ❌ Don't copy (customs-specific)
/components/WithdrawalModal.tsx     ❌ Don't copy (customs-specific)
/components/CreateTemplateModal.tsx ❌ Don't copy (customs-specific)
/components/ReorderTabsModal.tsx    ❌ Don't copy (customs-specific)

# Application file
/App.tsx                            ❌ Don't copy (reference only)

# Figma imports
/imports/CustomsWarehouse.tsx       ❌ Don't copy (customs-specific)
/imports/Frame93.tsx                ❌ Don't copy (customs-specific)

# Build/utility scripts
/replace-14px-to-12px.py            ❌ Don't copy
/complete-font-replacement.py       ❌ Don't copy
/batch-replace-14-to-12.sh          ❌ Don't copy
```

---

## 📦 Complete Package Structure

After extracting, your package should look like this:

```
your-filtering-package/
│
├── docs/                                    # Documentation
│   ├── FILTERING_PACKAGE_INDEX.md
│   ├── FILTERING_PACKAGE_QUICKSTART.md
│   ├── FILTERING_PACKAGE_README.md
│   ├── FILTERING_PACKAGE_DEPENDENCIES.md
│   ├── FILTERING_PACKAGE_EXAMPLES.md
│   ├── FILTERING_PACKAGE_MIGRATION.md
│   └── FILTERING_PACKAGE_FILES.md
│
├── components/                              # Core components
│   ├── FilterBar.tsx                        ✅ Required
│   ├── FilterDrawer.tsx                     ✅ Required
│   └── ui/                                  ✅ Required (ShadCN)
│       ├── select.tsx
│       ├── dropdown-menu.tsx
│       ├── calendar.tsx
│       ├── popover.tsx
│       ├── button.tsx
│       └── utils.ts
│
├── imports/                                 # Optional
│   └── svg-b75trn6pxk.ts                    ⚠️ Optional (custom SVGs)
│
├── styles/                                  # Styles
│   └── globals.css                          ✅ Required (partial)
│
├── types/                                   # TypeScript types
│   └── filtering.ts                         ✅ Required (create new)
│
└── package.json                             # Dependencies
```

---

## 🎯 Quick Extraction Script

Use this bash script to copy all required files:

```bash
#!/bin/bash

# Create package directory
mkdir -p filtering-package/components/ui
mkdir -p filtering-package/docs
mkdir -p filtering-package/styles
mkdir -p filtering-package/types

# Copy core components
cp components/FilterBar.tsx filtering-package/components/
cp components/FilterDrawer.tsx filtering-package/components/

# Copy ShadCN components
cp components/ui/select.tsx filtering-package/components/ui/
cp components/ui/dropdown-menu.tsx filtering-package/components/ui/
cp components/ui/calendar.tsx filtering-package/components/ui/
cp components/ui/popover.tsx filtering-package/components/ui/
cp components/ui/button.tsx filtering-package/components/ui/
cp components/ui/utils.ts filtering-package/components/ui/

# Copy documentation
cp FILTERING_PACKAGE_*.md filtering-package/docs/

# Copy styles (you'll need to extract the relevant parts)
cp styles/globals.css filtering-package/styles/

echo "✅ Package files extracted to ./filtering-package/"
echo "⚠️ Next steps:"
echo "1. Review globals.css and extract only filtering-related styles"
echo "2. Create types/filtering.ts with your FilterCriteria interface"
echo "3. Install dependencies: npm install lucide-react date-fns"
echo "4. Read docs/FILTERING_PACKAGE_QUICKSTART.md to get started"
```

Save as `extract-filtering-package.sh` and run:
```bash
chmod +x extract-filtering-package.sh
./extract-filtering-package.sh
```

---

## 📝 Manual Extraction Checklist

Use this checklist when extracting files manually:

### Step 1: Create directories
- [ ] Create `filtering-package/` directory
- [ ] Create `components/` subdirectory
- [ ] Create `components/ui/` subdirectory
- [ ] Create `docs/` subdirectory
- [ ] Create `styles/` subdirectory
- [ ] Create `types/` subdirectory

### Step 2: Copy core files
- [ ] Copy `FilterBar.tsx`
- [ ] Copy `FilterDrawer.tsx`

### Step 3: Copy ShadCN components
- [ ] Copy `select.tsx`
- [ ] Copy `dropdown-menu.tsx`
- [ ] Copy `calendar.tsx`
- [ ] Copy `popover.tsx`
- [ ] Copy `button.tsx`
- [ ] Copy `utils.ts`

### Step 4: Copy documentation
- [ ] Copy all `FILTERING_PACKAGE_*.md` files

### Step 5: Extract styles
- [ ] Extract scrollbar styles from `globals.css`
- [ ] Extract checkbox styles from `globals.css`
- [ ] Extract font imports (if using custom fonts)

### Step 6: Create type definitions
- [ ] Create `types/filtering.ts`
- [ ] Define `FilterCriteria` interface
- [ ] Define `FilterTemplate` interface

### Step 7: Verify
- [ ] Check all imports resolve
- [ ] No broken references
- [ ] TypeScript compiles without errors
- [ ] All dependencies listed in package.json

---

## 📋 Dependency List

After extraction, ensure your `package.json` includes:

```json
{
  "name": "filtering-package",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## ✅ Verification Steps

After extraction, verify everything works:

1. **Install dependencies**
   ```bash
   npm install lucide-react date-fns
   ```

2. **Check imports**
   - Open `FilterBar.tsx` - all imports should resolve
   - Open `FilterDrawer.tsx` - all imports should resolve

3. **TypeScript check**
   ```bash
   npx tsc --noEmit
   ```

4. **Build test**
   - Try importing in a test component
   - Ensure no runtime errors

---

## 🎯 Minimal Package (Fastest Setup)

If you need only the essentials:

**Required Files** (minimum 8 files):
1. `FilterBar.tsx`
2. `FilterDrawer.tsx`
3. `ui/select.tsx`
4. `ui/dropdown-menu.tsx`
5. `ui/calendar.tsx`
6. `ui/popover.tsx`
7. `ui/button.tsx`
8. `ui/utils.ts`

**Plus**:
- Install: `lucide-react`, `date-fns`
- Add minimal CSS to your globals.css

This minimal setup will work, but read the docs for full functionality!

---

## 📞 Need Help?

- **Missing imports?** → Check ShadCN components are copied
- **TypeScript errors?** → Create `types/filtering.ts` file
- **Styling broken?** → Copy required CSS to globals.css
- **Icons not showing?** → Install `lucide-react`

Refer to the documentation files for detailed guidance!

---

✅ **Ready to extract!** Follow the steps above to create your reusable filtering package.
