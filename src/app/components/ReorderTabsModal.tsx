import { useState } from 'react';
import { X, GripVertical, Star } from 'lucide-react';
import type { FilterTemplate } from '../App';

interface ReorderTabsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabOrder: string[];
  templates: FilterTemplate[];
  onSave: (newOrder: string[]) => void;
  favoriteTab?: string;
  onFavoriteChange?: (tabId: string) => void;
}

interface TabItem {
  id: string;
  label: string;
  isTemplate: boolean;
}

export function ReorderTabsModal({ isOpen, onClose, tabOrder, templates, onSave, favoriteTab = '', onFavoriteChange = () => {} }: ReorderTabsModalProps) {
  // Global tabs are fixed and cannot be reordered
  const GLOBAL_TABS = ['all', 'open', 'cleared', 'manual', 'electronic'];
  
  // Separate global and personal tabs
  const personalTabs = tabOrder.filter(id => !GLOBAL_TABS.includes(id));
  
  const [originalPersonalOrder] = useState<string[]>([...personalTabs]);
  const [localPersonalOrder, setLocalPersonalOrder] = useState<string[]>([...personalTabs]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localFavoriteTab, setLocalFavoriteTab] = useState<string>(favoriteTab);
  
  if (!isOpen) return null;

  // Check if order has changed or favorite has changed (only personal tabs can be reordered)
  const hasChanges = localPersonalOrder.length !== originalPersonalOrder.length || 
    localPersonalOrder.some((id, index) => id !== originalPersonalOrder[index]) ||
    localFavoriteTab !== favoriteTab;

  // Map tab IDs to labels
  const getTabLabel = (tabId: string): TabItem => {
    const template = templates.find(t => t.id === tabId);
    if (template) {
      return { id: tabId, label: template.name, isTemplate: true };
    }

    const defaultLabels: { [key: string]: string } = {
      all: 'All',
      open: 'Open',
      cleared: 'Cleared',
      manual: 'Manual',
      electronic: 'Electronic'
    };

    return { id: tabId, label: defaultLabels[tabId] || tabId, isTemplate: false };
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      const newOrder = [...localPersonalOrder];
      const [movedTab] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(index, 0, movedTab);
      setLocalPersonalOrder(newOrder);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = () => {
    // Combine global tabs (in fixed order) with personal tabs (in user-defined order)
    const finalOrder = [...GLOBAL_TABS, ...localPersonalOrder];
    onReorder(finalOrder);
    onFavoriteChange(localFavoriteTab);
    onClose();
  };

  const handleToggleFavorite = (tabId: string) => {
    // If clicking the same tab, unfavorite it
    if (localFavoriteTab === tabId) {
      setLocalFavoriteTab('');
    } else {
      setLocalFavoriteTab(tabId);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[4px] shadow-xl z-50 w-[500px] max-h-[780px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-neutral-200 shrink-0">
          <h2 className="font-['Inter'] text-[18px] font-semibold text-[#003160] uppercase">
            Reorder Tabs
          </h2>
          <button
            onClick={onClose}
            className="p-[4px] hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="size-[18px] text-[#003160]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-[24px] py-[20px]">
          <p className="font-['Inter'] text-[16px] text-[rgba(0,0,0,1)] mb-[16px]">
            Click the star icon to set a tab as your default favorite. Only Personal tabs can be reordered.
          </p>
          
          {/* Global Tabs Section */}
          <div className="mb-[24px]">
            <div className="font-['Inter'] text-[12px] font-semibold text-neutral-500 uppercase tracking-[0.7px] mb-[8px] px-[4px]">
              Global
            </div>
            <div className="flex flex-col gap-[8px]">
              {GLOBAL_TABS.map((tabId, index) => {
                const tabItem = getTabLabel(tabId);

                return (
                  <div
                    key={tabId}
                    className="flex items-center gap-[12px] bg-[#f5f5f5] rounded-[4px] py-[6px] px-[16px] px-[10px] py-[5px]"
                  >
                    <div className="flex-1">
                      <div className="font-['Inter'] text-[12px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
                        {tabItem.label}
                      </div>
                    </div>
                    <div className="font-['Inter'] text-[12px] text-neutral-400">
                      Position {index + 1}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(tabId);
                      }}
                      className="p-[4px] hover:bg-white/50 rounded-[2px] transition-colors cursor-pointer"
                      title={localFavoriteTab === tabId ? "Remove from favorite" : "Set as favorite"}
                    >
                      {localFavoriteTab === tabId ? (
                        <Star className="size-[18px] text-[#FF8F00]" fill="#FF8F00" strokeWidth={2} />
                      ) : (
                        <Star className="size-[18px] text-neutral-400" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Tabs Section */}
          {localPersonalOrder.length > 0 && (
            <div>
              <div className="font-['Inter'] text-[12px] font-semibold text-neutral-500 uppercase tracking-[0.7px] mb-[8px] px-[4px]">
                Personal
              </div>
              <div className="flex flex-col gap-[8px]">
                {localPersonalOrder.map((tabId, index) => {
                  const tabItem = getTabLabel(tabId);
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index && draggedIndex !== index;

                  return (
                    <div
                      key={tabId}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-[12px] px-[10px] py-[12px] bg-[#f5f5f5] rounded-[4px] transition-all cursor-grab active:cursor-grabbing ${
                        isDragging ? 'opacity-40' : ''
                      } ${isDragOver ? 'border-l-4 border-[#FF8F00]' : ''}`}
                    >
                      <GripVertical className="size-[20px] text-neutral-400 shrink-0" />
                      <div className="flex-1">
                        <div className="font-['Inter'] text-[12px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
                          {tabItem.label}
                        </div>
                      </div>
                      <div className="font-['Inter'] text-[12px] text-neutral-400">
                        Position {GLOBAL_TABS.length + index + 1}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(tabId);
                        }}
                        className="p-[4px] hover:bg-white/50 rounded-[2px] transition-colors cursor-pointer"
                        title={localFavoriteTab === tabId ? "Remove from favorite" : "Set as favorite"}
                      >
                        {localFavoriteTab === tabId ? (
                          <Star className="size-[18px] text-[#FF8F00]" fill="#FF8F00" strokeWidth={2} />
                        ) : (
                          <Star className="size-[18px] text-neutral-400" strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-neutral-200 shrink-0">
          <button
            onClick={onClose}
            className="px-[16px] py-[8px] border border-neutral-300 rounded-[2px] bg-white font-['Inter'] text-[12px] font-semibold text-[#003160] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-[16px] py-[8px] rounded-[2px] font-['Inter'] text-[12px] font-semibold transition-colors ${
              hasChanges
                ? 'bg-[rgba(68,107,249,1)] text-white hover:bg-[#3558E0] cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
