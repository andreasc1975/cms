#!/usr/bin/env python3
"""
Final font replacement script for FilterDrawer.tsx
Replaces all Calibre → Inter font references
"""

# Read the file
with open('/components/FilterDrawer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace both patterns
content = content.replace("font-['Calibre']", "font-['Inter']")
content = content.replace("font-[Calibre]", "font-[Inter]")

# Write back
with open('/components/FilterDrawer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ FilterDrawer.tsx updated successfully")
print("✓ All Calibre → Inter font replacements complete!")
