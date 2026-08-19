# Komma igång i VS Code

Detta projekt kommer från Figma Make och är ett React + TypeScript + Vite-projekt
med Tailwind CSS och Radix UI-komponenter.

## Vad som har fixats i den här versionen

Figma Make-exporten saknade några saker som behövs för att köra projektet utanför
Figma Make, så jag har lagt till/ändrat:

- **`tsconfig.json` och `tsconfig.node.json`** – saknades helt, behövs för att
  TypeScript och VS Code ska förstå projektet.
- **`package.json`** – `react` och `react-dom` låg bara som `peerDependencies`
  (och markerade som "optional"), vilket gör att de aldrig installeras. Jag har
  flyttat dem till vanliga `dependencies` och lagt till `typescript`,
  `@types/react`, `@types/react-dom` och `@types/node` som `devDependencies`.
  Jag rensade även bort ett antal dubblettrader i stil med
  `"paket@1.2.3": "npm:paket@1.2.3"` som är en pnpm-specifik notation och som
  npm inte hanterar korrekt.
- **`.gitignore`** – saknades, så `node_modules`/`dist` la annars av misstag
  hamna i versionskontroll.
- **Versionsnummer i importer** – Figma Make skriver ut importer som
  `import X from "@radix-ui/react-popover@1.1.6"` (med versionsnumret inbakat
  i sökvägen). Det fungerar i Figma Makes egen bundler men inte i vanlig
  Vite/npm, vilket gav felet `Failed to resolve import`. Jag har rensat bort
  versionssuffixen i 41 filer under `src/app/components/ui/` så att
  importerna blir vanliga, t.ex. `from "@radix-ui/react-popover"`.

Resten av koden (komponenter, styles, config) är orörd.

## Steg för steg

1. **Öppna mappen i VS Code**
   `File > Open Folder…` och välj projektmappen.

2. **Installera Node.js** (om det inte redan finns) – version 18 eller nyare.
   Kolla med:
   ```bash
   node -v
   ```

3. **Installera beroenden**
   ```bash
   npm install
   ```

4. **Starta utvecklingsservern**
   ```bash
   npm run dev
   ```
   Öppna sedan `http://localhost:5173` i webbläsaren.

5. **Bygg för produktion** (när du är klar)
   ```bash
   npm run build
   ```
   Filerna hamnar i `dist/`.

## Fortsätta jobba med Claude

- I VS Code kan du använda **Claude Code** (Anthropics CLI/extension) för att
  fortsätta utveckla direkt i projektet – be den öppna filer, göra ändringar,
  köra `npm run dev` osv.
- Projektstrukturen:
  - `src/app/App.tsx` – huvudkomponent/state
  - `src/app/components/` – alla UI-komponenter
  - `src/app/components/ui/` – shadcn/Radix-baserade basskomponenter
  - `src/app/config/` – konfiguration (t.ex. ikoner för sektioner)
  - `src/styles/` – Tailwind/globala stilar
- Det finns redan gott om dokumentation i `src/app/*.md`
  (t.ex. `START_HERE.md`, `TEMPLATE_CUSTOMIZATION_GUIDE.md`) som beskriver
  funktionerna i appen (filtrering, tabeller, mallar osv.) – bra att läsa om
  du vill sätta dig in i vad som redan är byggt.

## Om något krånglar

- **"Cannot find module 'react'" eller liknande** → kör `npm install` igen.
- **Portkonflikt på 5173** → Vite föreslår automatiskt en annan port, eller
  ange `npm run dev -- --port 3000`.
- **Typfel i VS Code men appen kör fint** → starta om TS-servern
  (`Cmd/Ctrl+Shift+P` → "TypeScript: Restart TS server").
