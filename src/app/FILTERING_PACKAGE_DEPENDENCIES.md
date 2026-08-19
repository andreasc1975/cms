# Filtering System - Dependencies & Requirements

## 📦 NPM Dependencies

### Required Packages

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0"
  }
}
```

### Installation Commands

```bash
# Install core dependencies
npm install lucide-react date-fns

# Or with yarn
yarn add lucide-react date-fns

# Or with pnpm
pnpm add lucide-react date-fns
```

## 🎨 ShadCN UI Components

The filtering system uses the following ShadCN components. Install them using the ShadCN CLI:

```bash
# Install all required components at once
npx shadcn-ui@latest add select dropdown-menu calendar popover

# Or install individually
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
```

### ShadCN Component Files Required

After installation, you should have these files in your project:

```
/components/ui/
├── select.tsx              # Dropdown select component
├── dropdown-menu.tsx       # Context menu and dropdowns
├── calendar.tsx            # Date picker calendar
├── popover.tsx             # Popover positioning
├── button.tsx              # Button component (dependency)
├── dialog.tsx              # Dialog component (dependency)
└── utils.ts                # Utility functions (dependency)
```

## 🎨 Tailwind CSS Configuration

### Required Tailwind Setup

Ensure Tailwind CSS v4.0+ is installed and configured:

```bash
npm install tailwindcss@next
```

### Global Styles (globals.css)

Add these to your `styles/globals.css`:

```css
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

/* Checkbox styles for light mode */
.checkbox-light {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-light:checked {
  background-color: #003160;
  border-color: #003160;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}

.checkbox-light:hover {
  border-color: #9ca3af;
}
```

## 🖋️ Font Requirements

### Inter Font (Primary)

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

Or via CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
```

### Roboto Mono Font (Optional - for numeric inputs)

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## 📁 Project Structure

### Minimum Required Files

```
your-project/
├── components/
│   ├── FilterBar.tsx              # ✅ Required
│   ├── FilterDrawer.tsx           # ✅ Required
│   └── ui/                        # ✅ Required (from ShadCN)
│       ├── select.tsx
│       ├── dropdown-menu.tsx
│       ├── calendar.tsx
│       ├── popover.tsx
│       ├── button.tsx
│       └── utils.ts
├── styles/
│   └── globals.css                # ✅ Required
├── types/                         # ⚠️ Optional but recommended
│   └── filtering.ts
└── App.tsx                        # Your parent component
```

## 🔧 TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 🎯 SVG Icons (Optional)

If you want to use custom SVG icons instead of Lucide icons, you'll need:

```
/imports/
└── svg-b75trn6pxk.ts          # SVG paths file
```

Example structure:

```typescript
// svg-b75trn6pxk.ts
export default {
  p38ed0f00: "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z",
  p1783a400: "M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
};
```

## ⚙️ Build Tool Requirements

### Vite (Recommended)

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
});
```

### Next.js

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  // Tailwind CSS is automatically supported
};
```

### Create React App

Works out of the box with CRA. Just ensure Tailwind is configured.

## 🧪 Testing Dependencies (Optional)

If you want to test the filtering components:

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "vitest": "^1.0.0"
  }
}
```

## 📊 Bundle Size

Approximate bundle sizes (minified + gzipped):

- **FilterBar.tsx**: ~8 KB
- **FilterDrawer.tsx**: ~12 KB
- **Lucide Icons**: ~2 KB (tree-shaken)
- **date-fns**: ~2 KB (only used functions)
- **ShadCN Components**: ~15 KB (combined)

**Total**: ~40 KB (minified + gzipped)

## 🔄 Version Compatibility

| Package | Minimum Version | Recommended Version |
|---------|----------------|-------------------|
| React | 18.0.0 | 18.2.0+ |
| TypeScript | 5.0.0 | 5.3.0+ |
| Tailwind CSS | 4.0.0 | 4.0.0+ |
| lucide-react | 0.263.0 | Latest |
| date-fns | 2.30.0 | Latest |

## 🌐 Browser Support

- Chrome/Edge: 90+ ✅
- Firefox: 88+ ✅
- Safari: 14+ ✅
- Mobile Safari: 14+ ✅
- Chrome Android: 90+ ✅

## 🚫 Known Incompatibilities

- ❌ Internet Explorer (not supported)
- ❌ React < 18.0.0
- ❌ Tailwind CSS < 4.0.0

## 📝 Notes

1. **localStorage**: The package uses `localStorage` for persistence. Ensure it's available or provide fallback.
2. **Font Loading**: Inter and Roboto Mono fonts must be loaded for proper typography.
3. **ShadCN Setup**: Must have ShadCN UI properly configured in your project before using components.
4. **Tailwind Config**: Ensure Tailwind CSS is watching your component files.

## ✅ Quick Checklist

Before using the filtering system, verify:

- [ ] React 18+ installed
- [ ] TypeScript configured
- [ ] Tailwind CSS 4.0+ set up
- [ ] lucide-react installed
- [ ] date-fns installed
- [ ] ShadCN components installed (select, dropdown-menu, calendar, popover)
- [ ] globals.css has required styles
- [ ] Inter font loaded
- [ ] localStorage available

---

**All dependencies installed?** → Proceed to [FILTERING_PACKAGE_README.md](./FILTERING_PACKAGE_README.md) for usage guide.
