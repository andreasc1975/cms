#!/usr/bin/env python3
"""
Final batch replacement for the 3 remaining large files
"""

files = [
    'components/AddAssignmentModal.tsx',
    'components/FilterDrawer.tsx',
    'components/WithdrawalModal.tsx'
]

total = 0

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        count = content.count('text-[14px]')
        
        if count > 0:
            new_content = content.replace('text-[14px]', 'text-[12px]')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ {filepath}: {count} replacements")
            total += count
        else:
            print(f"⏭️  {filepath}: No instances")
            
    except Exception as e:
        print(f"❌ {filepath}: Error - {e}")

print(f"\n✨ Total: {total} replacements")