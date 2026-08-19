#!/usr/bin/env python3
"""
Script to replace all text-[14px] with text-[12px] in component files
"""

import os
import re

# List of files to update (excluding imports folder)
files_to_update = [
    'components/FilterDrawer.tsx',
    'components/WithdrawalModal.tsx',
    'components/AddAssignmentModal.tsx',
    'components/TableRow.tsx',
    'components/ThresholdSettingsModal.tsx',
    'components/ReorderTabsModal.tsx',
    'components/Sidebar.tsx',
    'components/FilterBar.tsx',
    'components/RefreshIntervalModal.tsx',
    'components/ActionButton.tsx',
    'components/TopBar.tsx',
    'components/CreateTemplateModal.tsx',
]

def replace_in_file(filepath):
    """Replace text-[14px] with text-[12px] in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count replacements
        count = content.count('text-[14px]')
        
        if count > 0:
            # Replace all occurrences
            new_content = content.replace('text-[14px]', 'text-[12px]')
            
            # Write back
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ {filepath}: Replaced {count} instance(s)")
            return count
        else:
            print(f"⏭️  {filepath}: No instances found")
            return 0
    except FileNotFoundError:
        print(f"❌ {filepath}: File not found")
        return 0
    except Exception as e:
        print(f"❌ {filepath}: Error - {str(e)}")
        return 0

def main():
    print("Starting font size replacement: 14px → 12px\n")
    print("=" * 60)
    
    total_replaced = 0
    
    for filepath in files_to_update:
        count = replace_in_file(filepath)
        total_replaced += count
    
    print("=" * 60)
    print(f"\n✨ Complete! Replaced {total_replaced} total instances across {len(files_to_update)} files")

if __name__ == "__main__":
    main()
