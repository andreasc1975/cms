#!/usr/bin/env python3
import sys

files = [
    'components/AddAssignmentModal.tsx',
    'components/FilterDrawer.tsx',
    'components/WithdrawalModal.tsx'
]

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        count_before = content.count('text-[14px]')
        
        if count_before > 0:
            content = content.replace('text-[14px]', 'text-[12px]')
            
            with open(filepath, 'w') as f:
                f.write(content)
            
            print(f"✅ {filepath}: {count_before} → 0")
        else:
            print(f"✓ {filepath}: Already done")
    except Exception as e:
        print(f"❌ {filepath}: {e}")
        sys.exit(1)

print("\n🎉 ALL COMPLETE!")