#!/bin/bash
# Script to replace all Calibre → Inter references in FilterDrawer.tsx

sed -i "s/font-\['Calibre'\]/font-\['Inter'\]/g" /components/FilterDrawer.tsx
sed -i "s/font-\[Calibre\]/font-\[Inter\]/g" /components/FilterDrawer.tsx

echo "✓ FilterDrawer.tsx updated - all Calibre → Inter replacements complete"
