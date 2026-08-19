import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  existingNames?: string[];
}

export function CreateTemplateModal({ isOpen, onClose, onConfirm, existingNames = [] }: CreateTemplateModalProps) {
  const [templateName, setTemplateName] = useState('');
  
  if (!isOpen) return null;

  const handleSave = () => {
    if (templateName.trim()) {
      onConfirm(templateName.trim());
      setTemplateName('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[4px] shadow-xl z-50 w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-neutral-200">
          <h2 className="font-['Inter'] text-[18px] font-semibold text-[#003160] uppercase">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-[4px] hover:bg-neutral-100 rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="size-[18px] text-[#003160]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-[24px] py-[24px]">
          <div className="flex flex-col gap-[8px]">
            <label className="font-['Inter'] text-[12px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter template name"
              autoFocus
              className="w-full px-[12px] py-[10px] border border-neutral-300 rounded-[2px] bg-white font-['Inter'] text-[12px] text-[#003160] placeholder:text-neutral-400 focus:outline-none focus:border-[#003160] transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-[16px] py-[8px] border border-neutral-300 rounded-[2px] bg-white font-['Inter'] text-[12px] font-semibold text-[#003160] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!templateName.trim()}
            className="px-[16px] py-[8px] rounded-[2px] bg-[#003160] font-['Inter'] text-[12px] font-semibold text-white hover:bg-[#002147] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#003160]"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </>
  );
}
