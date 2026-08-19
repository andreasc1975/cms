import { Package, Database, Briefcase, Globe, BadgeEuro, LucideIcon } from 'lucide-react';

export interface SectionConfig {
  name: string;
  icon: LucideIcon;
}

/**
 * Centralized icon configuration for all main sections
 * 
 * ⚠️ IMPORTANT: Change icons here to update them everywhere in the app:
 * - Sidebar navigation icons
 * - Empty state icons
 * 
 * This ensures consistent icons throughout the entire application.
 * Simply import a different icon from 'lucide-react' and replace it below.
 */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  'Application': Package,
  'Application Y': Database,
  'Application Z': Briefcase,
  'Application A': Globe,
  'Application B': BadgeEuro,
};

// Helper function to get icon component for a section
export const getSectionIcon = (sectionName: string): LucideIcon => {
  return SECTION_ICONS[sectionName] || Package; // Default to Package if not found
};
