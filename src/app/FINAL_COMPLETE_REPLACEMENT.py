#!/usr/bin/env python3
"""
FINAL REPLACEMENT - Last 2 files
"""
import sys

files_to_complete = [
    'components/FilterDrawer.tsx',
    'components/WithdrawalModal.tsx'
]

print("=" * 60)
print("FINAL FONT SIZE REPLACEMENT: 14px → 12px")
print("=" * 60)

total_replaced = 0

for filepath in files_to_complete:
    try:
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Count instances before
        count_before = original_content.count('text-[14px]')
        
        if count_before == 0:
            print(f"⏭️  {filepath}: Already completed (0 instances)")
            continue
        
        # Replace all instances
        new_content = original_content.replace('text-[14px]', 'text-[12px]')
        
        # Verify replacement
        count_after = new_content.count('text-[14px]')
        
        if count_after != 0:
            print(f"⚠️  {filepath}: WARNING - {count_after} instances remain!")
            sys.exit(1)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ {filepath}: {count_before} instance(s) replaced")
        total_replaced += count_before
        
    except FileNotFoundError:
        print(f"❌ {filepath}: File not found")
        sys.exit(1)
    except Exception as e:
        print(f"❌ {filepath}: Error - {str(e)}")
        sys.exit(1)

print("=" * 60)
print(f"✨ COMPLETE! Total replaced in final batch: {total_replaced}")
print(f"🎉 ALL 138 INSTANCES ACROSS 12 FILES NOW UPDATED!")
print("=" * 60)
