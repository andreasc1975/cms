import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (articleData: ArticleData) => void;
  initialArticleName?: string;
}

export interface ArticleData {
  articleName: string;
  description: string;
  statisticalNo: string;
  originCountry: string;
  originRegion: string;
  dutyReduction: string;
  preference: string;
  weightPerUnit: string;
  litresPerUnit: string;
}

const COUNTRIES = [
  'NO | Norway',
  'SE | Sweden',
  'DK | Denmark',
  'FI | Finland',
  'IS | Iceland',
  'DE | Germany',
  'FR | France',
  'IT | Italy',
  'ES | Spain',
  'PT | Portugal',
  'GB | United Kingdom',
  'IE | Ireland',
  'NL | Netherlands',
  'BE | Belgium',
  'LU | Luxembourg',
  'CH | Switzerland',
  'AT | Austria',
  'PL | Poland',
  'CZ | Czech Republic',
  'HU | Hungary',
  'RO | Romania',
  'BG | Bulgaria',
  'GR | Greece',
  'HR | Croatia',
  'SI | Slovenia',
  'SK | Slovakia',
  'EE | Estonia',
  'LV | Latvia',
  'LT | Lithuania',
  'US | United States',
  'CA | Canada',
  'MX | Mexico',
  'BR | Brazil',
  'AR | Argentina',
  'CL | Chile',
  'CN | China',
  'JP | Japan',
  'KR | South Korea',
  'TW | Taiwan',
  'IN | India',
  'AU | Australia',
  'NZ | New Zealand',
  'ZA | South Africa',
  'EG | Egypt',
  'TR | Turkey',
];

const REGIONS = [
  'Region 1',
  'Region 2',
  'Region 3',
  'Region 4',
  'Region 5',
];

const DUTY_REDUCTIONS = [
  'None',
  'Standard',
  'Reduced',
  'Exempt',
];

const PREFERENCES = [
  'A - EEA Agreement',
  'B - Free Trade Agreement EC-Norway',
  'C - Free Trade Agreement EFTA-Turkey',
  'D - Pan-European cumulation',
  'E - Bilateral cumulation',
  'F - PEM convention',
  'G - Other preferences',
  'H - No preference',
];

const STATISTICAL_NUMBERS = [
  '12345678',
  '87654321',
  '11223344',
  '55667788',
];

export function AddArticleModal({ isOpen, onClose, onSave, initialArticleName = '' }: AddArticleModalProps) {
  const [formData, setFormData] = useState<ArticleData>({
    articleName: '',
    description: '',
    statisticalNo: '',
    originCountry: '',
    originRegion: '',
    dutyReduction: '',
    preference: '',
    weightPerUnit: '',
    litresPerUnit: '',
  });

  const articleNameRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        articleName: initialArticleName,
        description: '',
        statisticalNo: '',
        originCountry: '',
        originRegion: '',
        dutyReduction: '',
        preference: '',
        weightPerUnit: '',
        litresPerUnit: '',
      });
      // Focus on article name field
      setTimeout(() => {
        articleNameRef.current?.focus();
      }, 0);
    }
  }, [isOpen, initialArticleName]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isSaveDisabled =
    !formData.articleName.trim() ||
    !formData.statisticalNo.trim() ||
    !formData.originCountry.trim() ||
    !formData.preference.trim();

  const handleCancel = () => {
    onClose();
  };

  const updateField = (field: keyof ArticleData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,49,96,0.5)] bg-opacity-50">
      <div className="bg-white rounded-[4px] shadow-lg w-[900px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-[32px] py-[24px] border-b border-[#e0e0e0]">
          <h2 className="font-['Inter'] font-semibold text-[18px] text-[#003160]">
            Add New Article
          </h2>
          <button
            onClick={handleCancel}
            className="text-[#999] hover:text-[#003160] transition-colors cursor-pointer"
            tabIndex={-1}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-[32px] py-[24px]">
          <div className="grid grid-cols-2 gap-[16px]">
            {/* Article Name */}
            <FormInput
              label="ARTICLE NAME"
              required
              value={formData.articleName}
              onChange={(value) => updateField('articleName', value)}
              tabIndex={1}
              ref={articleNameRef}
            />

            {/* Description */}
            <FormInput
              label="DESCRIPTION"
              value={formData.description}
              onChange={(value) => updateField('description', value)}
              tabIndex={2}
            />

            {/* Statistical No */}
            <FormSelect
              label="STATISTICAL NO"
              required
              value={formData.statisticalNo}
              options={STATISTICAL_NUMBERS}
              onChange={(value) => updateField('statisticalNo', value)}
              tabIndex={3}
            />

            {/* Origin Country */}
            <FormSelect
              label="ORIGIN"
              required
              value={formData.originCountry}
              options={COUNTRIES}
              onChange={(value) => updateField('originCountry', value)}
              tabIndex={4}
            />

            {/* Duty Reduction */}
            <FormSelect
              label="DUTY REDUCTION"
              value={formData.dutyReduction}
              options={DUTY_REDUCTIONS}
              onChange={(value) => updateField('dutyReduction', value)}
              tabIndex={5}
            />

            {/* Origin Region */}
            <FormSelect
              label="ORIGIN REGION"
              value={formData.originRegion}
              options={REGIONS}
              onChange={(value) => updateField('originRegion', value)}
              tabIndex={6}
            />

            {/* Preference */}
            <FormSelect
              label="PREFERENCE"
              required
              value={formData.preference}
              options={PREFERENCES}
              onChange={(value) => updateField('preference', value)}
              tabIndex={7}
            />

            {/* Weight per Unit */}
            <FormInput
              label="WEIGHT PER UNIT"
              value={formData.weightPerUnit}
              onChange={(value) => updateField('weightPerUnit', value)}
              tabIndex={8}
            />

            {/* Litres pr. Unit */}
            <FormInput
              label="LITRES PR. UNIT"
              value={formData.litresPerUnit}
              onChange={(value) => updateField('litresPerUnit', value)}
              tabIndex={9}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-[12px] px-[32px] py-[24px] border-t border-[#e0e0e0]">
          <button
            onClick={handleCancel}
            tabIndex={11}
            className="h-[36px] px-[24px] rounded-[2px] bg-white border border-[#e0e0e0] text-[#003160] font-['Inter'] font-semibold text-[12px] cursor-pointer hover:bg-[#f5f5f5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            tabIndex={10}
            className={`h-[36px] px-[24px] rounded-[2px] text-white font-['Inter'] font-semibold text-[12px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#446BF9] ${
              isSaveDisabled
                ? 'bg-[rgb(68,107,249)] opacity-50 cursor-not-allowed'
                : 'bg-[rgb(68,107,249)] cursor-pointer hover:bg-[#469c85]'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}