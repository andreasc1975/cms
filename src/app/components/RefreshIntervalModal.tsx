import { useState } from 'react';
import { X } from 'lucide-react';

interface RefreshIntervalModalProps {
  onClose: () => void;
  currentInterval: number;
  onSave: (interval: number) => void;
}

export function RefreshIntervalModal({ onClose, currentInterval, onSave }: RefreshIntervalModalProps) {
  const [interval, setInterval] = useState(currentInterval);

  const handleSave = () => {
    if (interval > 0) {
      onSave(interval);
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

  const presetIntervals = [5, 10, 30, 60, 120, 300];

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
            Auto-Refresh Settings
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
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label className="font-['Inter'] text-[12px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 0)}
                onKeyDown={handleKeyDown}
                min="1"
                placeholder="Enter interval in seconds"
                autoFocus
                className="w-full px-[12px] py-[10px] border border-neutral-300 rounded-[2px] bg-white font-roboto-mono font-medium text-[12px] text-[#003160] placeholder:text-neutral-400 focus:outline-none focus:border-[#003160] transition-colors text-right number-input-light"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="font-['Inter'] text-[12px] font-semibold text-[#003160] uppercase tracking-[0.7px]">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 gap-[8px]">
                {presetIntervals.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setInterval(preset)}
                    className={`px-[12px] py-[8px] border rounded-[2px] font-['Inter'] text-[12px] transition-colors cursor-pointer ${
                      interval === preset
                        ? 'border-[#003160] bg-[#003160] text-white'
                        : 'border-neutral-300 bg-white text-[#003160] hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    {preset}s
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[12px] font-['Inter'] text-neutral-600 mt-[8px]">
              Note: Auto-refresh functionality will be implemented in a future update.
            </div>
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
            disabled={interval <= 0}
            className="px-[16px] py-[8px] rounded-[2px] bg-[#446BF9] font-['Inter'] text-[12px] font-semibold text-white hover:bg-[#3257E0] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#446BF9]"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
