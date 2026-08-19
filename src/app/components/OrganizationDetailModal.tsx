import { X, Pencil } from 'lucide-react';

interface OrganizationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationData: {
    orgName: string;
    orgNo: string;
    name: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

export function OrganizationDetailModal({ isOpen, onClose, organizationData }: OrganizationDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[4px] shadow-[0px_8px_24px_rgba(0,0,0,0.15)] w-[640px] max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#e0e0e0]">
          <h2 className="font-['Inter'] text-[16px] font-semibold text-[#003160]">
            Organization Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-[#003160] transition-colors cursor-pointer"
          >
            <X className="w-[20px] h-[20px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-[24px]">
          <div className="bg-[#f5f5f5] rounded-[4px] border border-[#e0e0e0] p-[20px] relative">
            {/* Edit Icon */}
            <button 
              className="absolute top-[16px] right-[16px] text-[#446BF9] hover:text-[#2d4ec7] transition-colors cursor-pointer"
              onClick={() => {
                // TODO: Implement edit functionality
                console.log('Edit organization');
              }}
            >
              <Pencil className="w-[18px] h-[18px]" />
            </button>

            {/* Organization Details */}
            <div className="flex flex-col gap-[12px]">
              {/* Org.No. */}
              <div className="flex items-start gap-[12px]">
                <div className="font-['Inter'] text-[12px] font-semibold text-[#003160] w-[100px] shrink-0 text-right uppercase">
                  Org No:
                </div>
                <div className="font-['Inter'] text-[12px] text-black">
                  {organizationData.orgNo}
                </div>
              </div>

              {/* Name */}
              <div className="flex items-start gap-[12px]">
                <div className="font-['Inter'] font-semibold text-[#003160] w-[100px] shrink-0 text-right uppercase text-[11px]">
                  Name:
                </div>
                <div className="font-['Inter'] text-[12px] text-black">
                  {organizationData.name}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-[12px]">
                <div className="font-['Inter'] text-[12px] font-semibold text-[#003160] w-[100px] shrink-0 text-right uppercase">
                  Address:
                </div>
                <div className="font-['Inter'] text-[12px] text-black">
                  {organizationData.address}
                </div>
              </div>

              {/* City / State */}
              <div className="flex items-start gap-[12px]">
                <div className="font-['Inter'] text-[12px] font-semibold text-[#003160] w-[100px] shrink-0 text-right uppercase">
                  City / State:
                </div>
                <div className="font-['Inter'] text-[12px] text-black">
                  {organizationData.city} / {organizationData.state}
                </div>
              </div>

              {/* Postcode */}
              <div className="flex items-start gap-[12px]">
                <div className="font-['Inter'] text-[12px] font-semibold text-[#003160] w-[100px] shrink-0 text-right uppercase">
                  Postcode:
                </div>
                <div className="font-['Inter'] text-[12px] text-black">
                  {organizationData.postcode}
                </div>
              </div>

              {/* Country */}
              <div className="flex items-start gap-[12px]">
                <div className="font-['Inter'] text-[12px] font-semibold text-[#003160] w-[100px] shrink-0 text-right uppercase">
                  Country:
                </div>
                <div className="font-['Inter'] text-[12px] text-black">
                  {organizationData.country}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[24px] py-[16px] border-t border-[#e0e0e0]">
          <button
            onClick={onClose}
            className="px-[20px] py-[8px] rounded-[2px] border border-[#e0e0e0] bg-white font-['Inter'] text-[12px] text-[#003160] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}