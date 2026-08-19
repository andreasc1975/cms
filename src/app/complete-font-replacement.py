#!/usr/bin/env python3
"""
Complete the font size replacement from 14px to 12px
for all remaining component files
"""

import os

# Files and their expected instance counts
files_to_process = {
    '/components/RefreshIntervalModal.tsx': 4,
    '/components/ThresholdSettingsModal.tsx': 8,
    '/components/FilterBar.tsx': 7,
    '/components/AddAssignmentModal.tsx': 14,
    '/components/FilterDrawer.tsx': 16,
    '/components/WithdrawalModal.tsx': 23,
}

total_replacements = 0

for filepath, expected_count in files_to_process.items():
    try:
        # Read the file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count occurrences
        count = content.count('text-[14px]')
        
        if count > 0:
            # Replace all occurrences
            new_content = content.replace('text-[14px]', 'text-[12px]')
            
            # Write back
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ {filepath}: Replaced {count} instance(s) (expected: {expected_count})")
            total_replacements += count
        else:
            print(f"⏭️  {filepath}: No instances found")
            
    except FileNotFoundError:
        print(f"❌ {filepath}: File not found")
    except Exception as e:
        print(f"❌ {filepath}: Error - {str(e)}")

print(f"\n✨ Total replacements: {total_replacements}")
print(f"📊 Expected total: {sum(files_to_process.values())}")
