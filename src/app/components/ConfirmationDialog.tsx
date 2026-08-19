interface ConfirmationDialogProps {
  isOpen: boolean;
  declarationNo: string;
  onProceedToDetail: () => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export function ConfirmationDialog({
  isOpen,
  declarationNo,
  onProceedToDetail,
  onCreateNew,
  onClose
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" 
      onClick={onClose}
    >
      <div 
        className="bg-white relative rounded-[4px] shadow-[0px_3px_10px_0px_rgba(0,0,0,0.12)] w-[500px] flex flex-col p-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Message */}
        <div className="font-['Inter'] text-[12px] text-[rgb(0,0,0)] mb-[24px]">
          Do you want to proceed to the detail view for '<span className="font-semibold">{declarationNo}</span>'?
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-[12px]">
          <button
            onClick={onProceedToDetail}
            autoFocus
            className="h-[36px] px-[24px] rounded-[2px] bg-[#446bf9] text-white font-['Inter'] font-semibold text-[12px] cursor-pointer hover:bg-[#3557d9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9] text-center"
          >
            Yes, proceed
          </button>
          <button
            onClick={onCreateNew}
            className="h-[36px] px-[24px] rounded-[2px] bg-white text-[#446bf9] border border-[#446bf9] font-['Inter'] font-semibold text-[12px] cursor-pointer hover:bg-[#f5f5f5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9] text-center"
          >
            Create a new Declaration
          </button>
          <button
            onClick={onClose}
            className="h-[36px] px-[24px] rounded-[2px] bg-white text-[#666] border border-[#e5e5e5] font-['Inter'] font-semibold text-[12px] cursor-pointer hover:bg-[#f5f5f5] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}