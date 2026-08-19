#!/bin/bash

# Batch replace text-[14px] with text-[12px] in all component files

echo "Starting font size replacement: 14px → 12px"
echo "=============================================="

# Array of files to process
files=(
  "components/FilterDrawer.tsx"
  "components/WithdrawalModal.tsx"
  "components/AddAssignmentModal.tsx"
  "components/TableRow.tsx"
  "components/ThresholdSettingsModal.tsx"
  "components/ReorderTabsModal.tsx"
  "components/Sidebar.tsx"
  "components/FilterBar.tsx"
  "components/RefreshIntervalModal.tsx"
  "components/ActionButton.tsx"
  "components/TopBar.tsx"
  "components/CreateTemplateModal.tsx"
)

total=0

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Count occurrences before replacement
    count=$(grep -o 'text-\[14px\]' "$file" 2>/dev/null | wc -l)
    
    if [ $count -gt 0 ]; then
      # Perform replacement
      sed -i 's/text-\[14px\]/text-\[12px\]/g' "$file"
      echo "✅ $file: Replaced $count instance(s)"
      total=$((total + count))
    else
      echo "⏭️  $file: No instances found"
    fi
  else
    echo "❌ $file: File not found"
  fi
done

echo "=============================================="
echo "✨ Complete! Replaced $total total instances"
