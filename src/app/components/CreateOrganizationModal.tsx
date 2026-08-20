import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import type { BrregCompany } from './CustomDropdown';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (organizationData: OrganizationFormData) => void;
  prefillData?: BrregCompany | null;
}

export interface OrganizationFormData {
  // Organization fields
  organizationName: string;
  organizationNumber: string;
  countryCode: string;
  customsCreditNumber: string;
  exporterApprovalNumber: string;
  exporterAuthorizationNumber: string;
  vatRegistered: boolean;
  
  // Address/Contact fields
  address: string;
  address2: string;
  address3: string;
  postCode: string;
  city: string;
  state: string;
  contactPerson: string;
  phoneNo: string;
  emailAddress: string;
  alias: string;
}

export const COUNTRY_CODES = [
  { value: 'NO', label: 'NO | Norway' },
  { value: 'SE', label: 'SE | Sweden' },
  { value: 'DK', label: 'DK | Denmark' },
  { value: 'FI', label: 'FI | Finland' },
  { value: 'DE', label: 'DE | Germany' },
  { value: 'GB', label: 'GB | United Kingdom' },
  { value: 'US', label: 'US | United States' },
  { value: 'FR', label: 'FR | France' },
  { value: 'NL', label: 'NL | Netherlands' },
  { value: 'BE', label: 'BE | Belgium' },
  { value: 'AT', label: 'AT | Austria' },
  { value: 'PL', label: 'PL | Poland' },
  { value: 'IT', label: 'IT | Italy' },
  { value: 'ES', label: 'ES | Spain' },
  { value: 'PT', label: 'PT | Portugal' },
  { value: 'IE', label: 'IE | Ireland' },
  { value: 'CH', label: 'CH | Switzerland' },
  { value: 'JP', label: 'JP | Japan' },
  { value: 'CN', label: 'CN | China' },
];

/** Full country name for a 2-letter code, e.g. 'SE' -> 'Sweden'. Falls back
 * to the code itself if it's not in the list above. */
export function countryNameFromCode(code: string): string {
  const match = COUNTRY_CODES.find((c) => c.value === code);
  return match ? match.label.split(' | ')[1] : code;
}

export function CreateOrganizationModal({ isOpen, onClose, onSave, prefillData }: CreateOrganizationModalProps) {
  const [formData, setFormData] = useState<OrganizationFormData>({
    organizationName: '',
    organizationNumber: '',
    countryCode: 'NO',
    customsCreditNumber: '',
    exporterApprovalNumber: '',
    exporterAuthorizationNumber: '',
    vatRegistered: false,
    address: '',
    address2: '',
    address3: '',
    postCode: '',
    city: '',
    state: '',
    contactPerson: '',
    phoneNo: '',
    emailAddress: '',
    alias: ''
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false); // Track if user confirmed to save organization
  const aliasInputRef = useRef<HTMLInputElement>(null); // Ref for Alias input

  // Prefill data from Brreg API when available
  useEffect(() => {
    if (prefillData && isOpen) {
      const address = prefillData.forretningsadresse || prefillData.postadresse;
      const addressLines = address?.adresse || [];
      
      setFormData({
        organizationName: prefillData.navn,
        organizationNumber: prefillData.organisasjonsnummer,
        countryCode: address?.landkode || 'NO',
        customsCreditNumber: '',
        exporterApprovalNumber: '',
        exporterAuthorizationNumber: '',
        vatRegistered: false,
        address: addressLines[0] || '',
        address2: addressLines[1] || '',
        address3: addressLines[2] || '',
        postCode: address?.postnummer || '',
        city: address?.poststed || '',
        state: address?.kommune || '',
        contactPerson: '',
        phoneNo: '',
        emailAddress: '',
        alias: ''
      });
      setHasChanges(false);
      setIsConfirmed(false); // Reset confirmation state
    } else if (!prefillData && isOpen) {
      // Reset form
      setFormData({
        organizationName: '',
        organizationNumber: '',
        countryCode: 'NO',
        customsCreditNumber: '',
        exporterApprovalNumber: '',
        exporterAuthorizationNumber: '',
        vatRegistered: false,
        address: '',
        address2: '',
        address3: '',
        postCode: '',
        city: '',
        state: '',
        contactPerson: '',
        phoneNo: '',
        emailAddress: '',
        alias: ''
      });
      setHasChanges(false);
      setIsConfirmed(false); // Reset confirmation state
    }
  }, [prefillData, isOpen]);

  // Track changes
  useEffect(() => {
    const hasAnyChanges = 
      formData.organizationName !== '' ||
      formData.customsCreditNumber !== '' ||
      formData.contactPerson !== '' ||
      formData.phoneNo !== '' ||
      formData.emailAddress !== '';
    setHasChanges(hasAnyChanges);
  }, [formData]);

  // Focus on Alias input when isConfirmed becomes true
  useEffect(() => {
    if (isConfirmed && aliasInputRef.current) {
      // Small delay to ensure the DOM is updated
      setTimeout(() => {
        aliasInputRef.current?.focus();
      }, 100);
    }
  }, [isConfirmed]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isSaveDisabled = !formData.organizationName || !formData.organizationNumber;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white relative rounded-[4px] shadow-[0px_3px_10px_0px_rgba(0,0,0,0.12)] w-[95%] max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-[24px] pt-[24px] pb-[16px] border-b border-[#e0e0e0]">
          <div className="flex items-center justify-between">
            <h2 className="font-['Inter'] text-[16px] font-semibold text-[#003160] uppercase">
              Create Organization
            </h2>
            <button
              onClick={onClose}
              className="p-[6px] rounded-[2px] hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="size-[20px] text-[#003160]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-[24px] py-[20px]">
          <div className="flex flex-col gap-[20px]">
            {/* Section 1: Organization Details */}
            <div>
              <h3 className="font-['Inter'] text-[14px] font-semibold text-[#003160] uppercase mb-[12px]">
                Organization Details
              </h3>
              
              <div className="grid grid-cols-2 gap-[16px]">
                {isConfirmed ? (
                  <>
                    <FormSelect
                      label="ASSOCIATED ORGANIZATION"
                      value={`${formData.organizationName} - ${formData.organizationNumber}`}
                      options={[`${formData.organizationName} - ${formData.organizationNumber}`]}
                      onChange={(value) => {
                        // Handle associated organization change
                      }}
                      tabIndex={1}
                    />
                    <FormInput
                      label="NAME"
                      value={formData.organizationName}
                      onChange={(value) => setFormData({ ...formData, organizationName: value })}
                      placeholder="Name"
                      tabIndex={2}
                    />
                  </>
                ) : (
                  <>
                    <div className="relative h-[54px] w-full">
                      <div className="absolute left-0 top-0 content-stretch flex items-start justify-between w-full pointer-events-none">
                        <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic text-[12px] text-nowrap tracking-[0.7px] uppercase">
                          <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
                            <p className="leading-[normal] overflow-ellipsis overflow-hidden text-nowrap whitespace-pre font-bold text-[11px]">ORGANIZATION NAME</p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 box-border left-0 right-0 top-[31.48%] rounded-[2px] flex items-center group bg-[#f5f5f5]">
                        <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[2px]" />
                        <input
                          type="text"
                          value={formData.organizationName}
                          readOnly={!!prefillData}
                          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                          placeholder={prefillData ? '' : 'Organization name'}
                          tabIndex={1}
                          className={`relative z-10 w-full h-full pl-[10px] pr-[10px] bg-transparent border-none appearance-none font-[Inter] text-[12px] text-left outline-none ${
                            prefillData ? 'cursor-not-allowed text-[#666]' : 'cursor-text text-black'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="relative h-[54px] w-full">
                      <div className="absolute left-0 top-0 content-stretch flex items-start justify-between w-full pointer-events-none">
                        <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic text-[12px] text-nowrap tracking-[0.7px] uppercase">
                          <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
                            <p className="leading-[normal] overflow-ellipsis overflow-hidden text-nowrap whitespace-pre font-bold text-[11px]">ORGANIZATION NUMBER</p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 box-border left-0 right-0 top-[31.48%] rounded-[2px] flex items-center group bg-[#f5f5f5]">
                        <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[2px]" />
                        <input
                          type="text"
                          value={formData.organizationNumber}
                          readOnly={!!prefillData}
                          onChange={(e) => setFormData({ ...formData, organizationNumber: e.target.value })}
                          placeholder={prefillData ? '' : 'Organization number'}
                          tabIndex={2}
                          className={`relative z-10 w-full h-full pl-[10px] pr-[10px] bg-transparent border-none appearance-none font-[Inter] text-[12px] text-left outline-none ${
                            prefillData ? 'cursor-not-allowed text-[#666]' : 'cursor-text text-black'
                          }`}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-[16px] mt-[16px]">
                <FormSelect
                  label="COUNTRY CODE"
                  value={COUNTRY_CODES.find(c => c.value === formData.countryCode)?.label || 'NO | Norway'}
                  options={COUNTRY_CODES.map(c => c.label)}
                  onChange={(value) => {
                    const countryCode = COUNTRY_CODES.find(c => c.label === value);
                    setFormData({ ...formData, countryCode: countryCode?.value || 'NO' });
                  }}
                  tabIndex={3}
                />

                <FormInput
                  label="CUSTOMS CREDIT NUMBER"
                  value={formData.customsCreditNumber}
                  onChange={(value) => setFormData({ ...formData, customsCreditNumber: value })}
                  placeholder="Customs Credit Number"
                  tabIndex={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-[16px] mt-[16px]">
                <FormInput
                  label="EXPORTER'S APPROVAL NUMBER"
                  value={formData.exporterApprovalNumber}
                  onChange={(value) => setFormData({ ...formData, exporterApprovalNumber: value })}
                  placeholder="Exporter's Approval Number"
                  tabIndex={5}
                />

                <FormInput
                  label="EXPORTER'S AUTHORIZATION NUMBER"
                  value={formData.exporterAuthorizationNumber}
                  onChange={(value) => setFormData({ ...formData, exporterAuthorizationNumber: value })}
                  placeholder="Exporter's Authorization Number"
                  tabIndex={6}
                />
              </div>

              {/* VAT Registered Toggle */}
              <div className="mt-[16px] flex items-center gap-[12px]">
                {isConfirmed && (
                  <div className="flex-1">
                    <FormSelect
                      label="ASSOCIATED CUSTOMER"
                      value=""
                      options={[]}
                      onChange={(value) => {
                        // Handle associated customer change
                      }}
                      tabIndex={7}
                    />
                  </div>
                )}
                <div className={isConfirmed ? 'flex-1 flex items-end gap-[12px] pb-[10px]' : 'flex items-center gap-[12px]'}>
                  <span className="font-['Inter'] font-semibold text-[#003160] uppercase tracking-[0.7px] text-[10px]">
                    VAT REGISTERED
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.vatRegistered}
                    onClick={() => setFormData({ ...formData, vatRegistered: !formData.vatRegistered })}
                    className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors cursor-pointer ${
                      formData.vatRegistered ? 'bg-[#446BF9]' : 'bg-[#999]'
                    }`}
                    tabIndex={isConfirmed ? 8 : 7}
                  >
                    <span
                      className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform ${
                        formData.vatRegistered ? 'translate-x-[23px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Divider - Only shown after confirmation */}
            {isConfirmed && <div className="h-[1px] bg-[#e0e0e0]"></div>}

            {/* Section 2: Address & Contact Information - Only shown after confirmation */}
            {isConfirmed && (
              <div>
                <h3 className="font-['Inter'] text-[14px] font-semibold text-[#003160] uppercase mb-[12px]">
                  Address & Contact Information
                </h3>

                <div className="grid grid-cols-2 gap-[16px]">
                  <FormInput
                    label="ALIAS"
                    value={formData.alias}
                    onChange={(value) => setFormData({ ...formData, alias: value })}
                    placeholder="Alias"
                    tabIndex={9}
                    ref={aliasInputRef}
                  />

                  <FormInput
                    label="ADDRESS"
                    value={formData.address}
                    onChange={(value) => setFormData({ ...formData, address: value })}
                    placeholder="Address"
                    tabIndex={10}
                  />
                </div>

                <div className="grid grid-cols-2 gap-[16px] mt-[16px]">
                  <FormInput
                    label="ADDRESS 2"
                    value={formData.address2}
                    onChange={(value) => setFormData({ ...formData, address2: value })}
                    placeholder="Address 2"
                    tabIndex={11}
                  />

                  <FormInput
                    label="ADDRESS 3"
                    value={formData.address3}
                    onChange={(value) => setFormData({ ...formData, address3: value })}
                    placeholder="Address 3"
                    tabIndex={12}
                  />
                </div>

                <div className="grid grid-cols-2 gap-[16px] mt-[16px]">
                  <FormInput
                    label="POST CODE"
                    value={formData.postCode}
                    onChange={(value) => setFormData({ ...formData, postCode: value })}
                    placeholder="Post code"
                    tabIndex={13}
                  />

                  <FormInput
                    label="CITY"
                    value={formData.city}
                    onChange={(value) => setFormData({ ...formData, city: value })}
                    placeholder="City"
                    tabIndex={14}
                  />
                </div>

                <div className="grid grid-cols-2 gap-[16px] mt-[16px]">
                  <FormInput
                    label="STATE"
                    value={formData.state}
                    onChange={(value) => setFormData({ ...formData, state: value })}
                    placeholder="State"
                    tabIndex={15}
                  />

                  <FormInput
                    label="CONTACT PERSON"
                    value={formData.contactPerson}
                    onChange={(value) => setFormData({ ...formData, contactPerson: value })}
                    placeholder="Contact person"
                    tabIndex={16}
                  />
                </div>

                <div className="grid grid-cols-2 gap-[16px] mt-[16px]">
                  <FormInput
                    label="PHONE NO"
                    value={formData.phoneNo}
                    onChange={(value) => setFormData({ ...formData, phoneNo: value })}
                    placeholder="Phone number"
                    tabIndex={17}
                  />

                  <FormInput
                    label="EMAIL ADDRESS"
                    value={formData.emailAddress}
                    onChange={(value) => setFormData({ ...formData, emailAddress: value })}
                    placeholder="Email address"
                    tabIndex={18}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="px-[24px] py-[16px] border-t border-[#e0e0e0] flex gap-[12px] justify-end">
          <button
            onClick={onClose}
            tabIndex={19}
            className="h-[36px] px-[20px] rounded transition-all cursor-pointer font-['Inter'] text-[12px] text-[#446bf9] font-semibold hover:bg-blue-50"
          >
            Cancel
          </button>

          {/* Save Organization button - Only shown before confirmation */}
          {!isConfirmed && (
            <button
              onClick={() => setIsConfirmed(true)}
              disabled={isSaveDisabled}
              tabIndex={20}
              className={`h-[36px] px-[24px] rounded-[2px] transition-all font-['Inter'] font-semibold text-[12px] text-white ${
                isSaveDisabled 
                  ? 'bg-[#446bf9] opacity-50 cursor-not-allowed' 
                  : 'bg-[#446bf9] cursor-pointer hover:bg-[#3557d9]'
              }`}
            >
              Save Organization
            </button>
          )}

          {/* Final Save button - Only shown after confirmation */}
          {isConfirmed && (
            <button
              onClick={handleSave}
              disabled={isSaveDisabled}
              tabIndex={20}
              className={`h-[36px] px-[24px] rounded-[2px] transition-all font-['Inter'] font-semibold text-[12px] text-white ${
                isSaveDisabled 
                  ? 'bg-[#446bf9] opacity-50 cursor-not-allowed' 
                  : 'bg-[#446bf9] cursor-pointer hover:bg-[#3557d9]'
              }`}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}