#!/usr/bin/env python3
"""
Script to replace all Calibre font references with Inter across component files.
"""
import os
import re

# List of files to update
files_to_update = [
    '/components/FilterDrawer.tsx',
    '/components/WithdrawalModal.tsx',
    '/components/AddAssignmentModal.tsx',
    '/components/TopBar.tsx',
    '/components/TableRow.tsx',
    '/components/Sidebar.tsx',
    '/components/FilterBar.tsx',
    '/components/DataTable.tsx',
    '/components/TableHeader.tsx',
    '/components/ThresholdSettingsModal.tsx',
    '/components/ReorderTabsModal.tsx',
    '/components/RefreshIntervalModal.tsx',
    '/components/ActionButton.tsx',
    '/components/StatusBadge.tsx',
    '/components/CircularProgress.tsx',
    '/components/SearchBar.tsx',
    '/components/CreateTemplateModal.tsx'
]

def replace_font_in_file(filepath):
    """Replace Calibre with Inter in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace font-['Calibre'] with font-['Inter']
        content = content.replace("font-['Calibre']", "font-['Inter']")
        
        # Replace font-[Calibre] with font-[Inter]
        content = content.replace("font-[Calibre]", "font-[Inter]")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Updated {filepath}")
        return True
    except Exception as e:
        print(f"✗ Error updating {filepath}: {e}")
        return False

def main():
    print("Starting font replacement: Calibre → Inter\n")
    
    success_count = 0
    for filepath in files_to_update:
        if replace_font_in_file(filepath):
            success_count += 1
    
    print(f"\n✓ Successfully updated {success_count}/{len(files_to_update)} files")
    print("Font replacement complete!")

if __name__ == '__main__':
    main()
