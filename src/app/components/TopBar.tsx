import { useState, useEffect, useRef } from 'react';
import { Pencil, FileText } from 'lucide-react';
import svgPaths from "../imports/svg-b75trn6pxk";
import { imgRectangle20 } from "../imports/svg-ljevl";
import { AddAssignmentModal } from './AddAssignmentModal';
import { StatusBadge } from './StatusBadge';
import type { TableRowData } from './TableRow';

interface TopBarProps {
  onAddClick?: () => void;
  onGenerateClick?: () => void;
  onDeleteSelected?: () => void;
  onEditClick?: () => void;
  onPdfPreviewClick?: () => void;
  onValidateAndSend?: () => void;
  onBackClick?: () => void;
  showBackButton?: boolean;
  hasSelection?: boolean;
  sidebarWidth?: number;
  mainTitle?: string;
  activeSubLink?: string;
  showHeaderDetails?: boolean;
  hasTableRows?: boolean; // Flag to indicate if there are table rows
  // Data from registration modal
  detailData?: {
    status?: 'C' | 'PO' | 'O';
    customsNo?: string;
    sendDate?: string;
    stage?: string;
    importExport?: string;
    managedBy?: string;
    customsClearanceUnit?: string;
    messageDeclarationType?: string;
    noOfParcels?: string;
    declarationDate?: string;
    consignorName?: string;
    consignorAddress?: string;
    consigneeName?: string;
    consigneeAddress?: string;
    invoiceAmount?: string;
    currency?: string;
    netWeight?: string;
    totalStatisticalValue?: string;
    usedAmount?: number;
    usedNetWeight?: number;
    usedNoOfParcels?: number;
  };
  onSaveRegistration?: (newAssignment: Omit<TableRowData, 'id'>) => string;
  onNavigateToDetail?: (declarationNo?: string) => void;
  onHeightChange?: (height: number) => void;
}

// Header internal components
// Helper function to generate random Norwegian org number (9 digits)
const generateOrgNumber = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

// Helper function to generate random 6 digit number
const generateSequence = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate a placeholder "Tollkvitteringsnummer" (customs
// receipt number issued by Tullverket), format XXXXXX-XXXXXXXXX
const generateCustomsReceipt = () => {
  const part1 = Math.floor(100000 + Math.random() * 900000).toString();
  const part2 = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `${part1}-${part2}`;
};

// Helper function to generate a placeholder control number (box 48)
const generateControlNo = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

export function TopBar({ 
  onAddClick, 
  onGenerateClick, 
  onDeleteSelected, 
  onEditClick, 
  onPdfPreviewClick, 
  onValidateAndSend, 
  onBackClick, 
  showBackButton = false, 
  hasSelection = false, 
  sidebarWidth = 235, 
  mainTitle = 'Application', 
  activeSubLink = 'Sub Link 2',
  showHeaderDetails = false,
  hasTableRows = false, // Flag to indicate if there are table rows
  detailData,
  onSaveRegistration,
  onNavigateToDetail,
  onHeightChange
}: TopBarProps = {}) {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Report the actual rendered height so pages positioned below this
  // (fixed-position) bar can offset themselves correctly instead of relying
  // on a hardcoded pixel value that goes stale whenever the header's content
  // changes size.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !onHeightChange) return;

    const report = () => onHeightChange(el.offsetHeight);
    report();

    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onHeightChange, showHeaderDetails, detailData]);

  // Parse a formatted number string like "24,345.72" back into a plain number
  const parseAmount = (v?: string): number => {
    if (!v) return 0;
    return parseFloat(v.replace(/,/g, '')) || 0;
  };

  // Format a plain number back into "24,345.72" style, matching the rest of the app
  const formatAmount = (v: number): string => {
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const invoiceAmountTotal = parseAmount(detailData?.invoiceAmount);
  const invoiceAmountUsed = detailData?.usedAmount ?? 0;
  const invoiceAmountPercent = invoiceAmountTotal > 0 ? (invoiceAmountUsed / invoiceAmountTotal) * 100 : 0;

  const netWeightTotal = parseAmount(detailData?.netWeight);
  const netWeightUsed = detailData?.usedNetWeight ?? 0;
  const netWeightPercent = netWeightTotal > 0 ? (netWeightUsed / netWeightTotal) * 100 : 0;

  const noOfParcelsTotal = parseAmount(detailData?.noOfParcels);
  const noOfParcelsUsed = detailData?.usedNoOfParcels ?? 0;
  const noOfParcelsPercent = noOfParcelsTotal > 0 ? (noOfParcelsUsed / noOfParcelsTotal) * 100 : 0;

  // Placeholder reference numbers not yet backed by real data — generated once
  // per mount (not on every render) so they stay stable while the page is open.
  const [sequence] = useState(generateSequence);
  const [customsReceipt] = useState(generateCustomsReceipt);
  const [controlNo] = useState(generateControlNo);

  // Auto-focus the add button when the page loads with table rows
  useEffect(() => {
    if (hasTableRows && addButtonRef.current) {
      addButtonRef.current.focus();
    }
  }, [hasTableRows]);

  const IconButton = ({ 
    id, 
    path, 
    hasNotification = false, 
    onClick,
    buttonRef
  }: { 
    id: string; 
    path: string; 
    hasNotification?: boolean;
    onClick?: () => void;
    buttonRef?: React.RefObject<HTMLButtonElement>;
  }) => (
    <button
      ref={buttonRef}
      onMouseEnter={() => setHoveredIcon(id)}
      onMouseLeave={() => setHoveredIcon(null)}
      onClick={onClick}
      className={`relative shrink-0 size-[24px] transition-all duration-150 ${
        hoveredIcon === id ? 'scale-105 opacity-80' : ''
      }`}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <mask height="24" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="#D9D9D9" height="24" width="24" />
          </mask>
          <g mask="url(#mask0_topbar)">
            <path d={path} fill="white" />
            {hasNotification && (
              <circle cx="17.5" cy="5.5" fill="url(#paint0_linear_notification)" r="4.25" stroke="#003160" strokeWidth="1.5" />
            )}
          </g>
        </g>
        {hasNotification && (
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_notification" x1="17.5" x2="17.5" y1="2" y2="9">
              <stop stopColor="#D0021B" />
              <stop offset="1" stopColor="#940012" />
            </linearGradient>
          </defs>
        )}
      </svg>
    </button>
  );

  return (
    <div 
      ref={rootRef}
      className="fixed top-0 transition-all duration-300 z-20 bg-white"
      style={{ left: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px)` }}
    >
      {/* Original TopBar - Dark Blue Section */}
      <div className="bg-[#003160] box-border content-stretch flex h-[60px] items-center justify-between p-[20px]">
        {/* Back Button & Account Info */}
        <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="relative shrink-0 size-[24px] transition-all duration-150 hover:scale-105 hover:opacity-80 cursor-pointer"
              title="Back to Main Page"
            >
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="white" />
              </svg>
            </button>
          )}
          <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-[125px]">
          <div className="content-stretch flex font-['Inter'] justify-center leading-[normal] not-italic relative shrink-0 text-[10px] text-nowrap text-white tracking-[0.7px] uppercase font-bold whitespace-pre flex-col">
            <p className="mb-0 text-[9px] font-bold font-[Inter]">Account name</p>
            <p className="text-[#b3c2d0] text-[9px]">Domain Name</p>
          </div>
          <div className="relative shrink-0 size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <g>
                <mask height="24" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
                  <rect fill="#D9D9D9" height="24" width="24" />
                </mask>
                <g mask="url(#mask0_dropdown)">
                  <path d={svgPaths.p1d753300} fill="white" />
                </g>
              </g>
            </svg>
          </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex flex-col font-['Inter'] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-white font-semibold">
          <p className="leading-[normal] whitespace-pre text-[13px]">{mainTitle} / {activeSubLink}</p>
        </div>

        {/* Action Icons */}
        <div className="content-stretch flex gap-[15px] items-center justify-end relative shrink-0">
          {showBackButton && onEditClick && detailData?.stage !== 'sent' && (
            <button
              onClick={onEditClick}
              className="relative shrink-0 size-[24px] transition-all duration-150 hover:scale-105 hover:opacity-80 cursor-pointer"
              title="Edit declaration"
            >
              <Pencil className="size-full" color="white" strokeWidth={2} />
            </button>
          )}

          {showBackButton && onPdfPreviewClick && (
            <button
              onClick={onPdfPreviewClick}
              className="relative shrink-0 size-[24px] transition-all duration-150 hover:scale-105 hover:opacity-80 cursor-pointer"
              title="Preview document"
            >
              <FileText className="size-full" color="white" strokeWidth={2} />
            </button>
          )}

          <IconButton 
            id="add"
            path={svgPaths.p2fd7c000}
            onClick={onAddClick}
            buttonRef={addButtonRef}
          />
          
          <IconButton 
            id="generate"
            path="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            onClick={onGenerateClick}
          />
          
          <button
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            className={`relative shrink-0 size-[24px] transition-all duration-150 ${
              hasSelection ? 'hover:scale-105 hover:opacity-80 cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <g>
                <mask height="24" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
                  <rect fill="#D9D9D9" height="24" width="24" />
                </mask>
                <g mask="url(#mask0_delete)">
                  <path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21ZM17 6H7v13h10ZM9 17h2V8H9Zm4 0h2V8h-2Z" fill="white" />
                </g>
              </g>
            </svg>
          </button>
          
          {/* Divider */}
          <div className="relative shrink-0 size-[24px]">
            <div 
              className="absolute bg-white bottom-0 left-[45.83%] right-[45.83%] rounded-[1px] top-0"
              style={{ 
                maskImage: `url('${imgRectangle20}')`,
                maskPosition: '-11px 0px',
                maskSize: '24px 24px',
                maskRepeat: 'no-repeat'
              }} 
            />
          </div>

          <IconButton 
            id="settings"
            path={svgPaths.p291d6e80}
          />
          
          <IconButton 
            id="history"
            path={svgPaths.p2225cd00}
            onClick={() => console.log('History clicked')}
          />
          
          <IconButton 
            id="notification"
            path={svgPaths.p2d171200}
            hasNotification={true}
            onClick={() => console.log('Notification clicked')}
          />
          
          <IconButton 
            id="apps"
            path={svgPaths.p2c42bc80}
            onClick={() => console.log('Apps clicked')}
          />
        </div>
      </div>

      {/* Header Details Section - Only show when showHeaderDetails is true */}
      {showHeaderDetails && (
        <div className="bg-white shadow-[0px_3px_10px_0px_rgba(0,0,0,0.12)]">
          <div className="box-border content-stretch flex flex-col gap-[10px] items-start pt-[20px] pr-[20px] pb-[10px] pl-[20px] p-[20px]">
            {/* Metadata box: declaration/sequence/version/managed by/dates on row 1,
                receipt/type/department/control no/message type on row 2 */}
            <div className="bg-neutral-100 box-border content-stretch p-[10px] relative rounded-[2px] shrink-0 w-full">
              {onEditClick && detailData?.stage !== 'sent' && (
                <button
                  onClick={onEditClick}
                  className="absolute top-[8px] right-[8px] cursor-pointer hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#446BF9] rounded z-10"
                  title="Edit declaration"
                >
                  <Pencil className="size-[16px] text-[#003160]" strokeWidth={2} />
                </button>
              )}
              <div className="grid grid-cols-[64px_minmax(90px,1fr)_minmax(90px,1fr)_minmax(70px,0.7fr)_minmax(140px,1.2fr)_minmax(90px,1fr)_minmax(90px,1fr)] gap-x-[16px] gap-y-[10px] items-start">
                <div className="row-span-2 pt-[2px] flex items-center gap-[6px]" data-name="Status">
                  {detailData?.status ? <StatusBadge status={detailData.stage === 'sent' ? 'SENT' : detailData.status} /> : <div className="bg-[#9e9e9e] h-[16px] w-[20px] rounded-[1px]" />}
                  <div
                    className="bg-[#003160] content-stretch flex items-center justify-center h-[16px] px-[4px] rounded-[1px] shrink-0"
                    title={detailData?.importExport === 'IM' ? 'Import' : detailData?.importExport === 'EU' ? 'EU trade' : 'Export'}
                  >
                    <p className="font-['Inter'] text-[10px] font-semibold text-white uppercase leading-none">
                      {detailData?.importExport || 'EX'}
                    </p>
                  </div>
                </div>

                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Declaration</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">{detailData?.customsNo || '—'}</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Sequence</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">{sequence}</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Version</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-[#446bf9] w-full font-bold">1</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Managed by</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">{detailData?.managedBy || 'Not assigned'}</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Declaration date</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">{detailData?.declarationDate || '—'}</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Send date</p>
                  <p className={`relative shrink-0 text-[12px] w-full ${detailData?.sendDate ? "font-['Calibre:Regular',sans-serif] text-black" : 'text-[#999]'}`}>{detailData?.sendDate || 'not sent'}</p>
                </div>

                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Related declarations</p>
                  {/* Not built yet — always "none" for now, no such functionality exists to link declarations together. */}
                  <p className="relative shrink-0 text-[12px] text-[#999] w-full">none</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Customs receipt</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">{customsReceipt}</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Type</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">
                    {detailData?.importExport === 'IM' ? 'Import' : detailData?.importExport === 'EU' ? 'EU trade' : 'Export'}
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Department</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">{detailData?.customsClearanceUnit || 'Not assigned'}</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">
                    <span className="text-[#ff8f00]">48. </span><span className="text-[#003160]">Control no</span>
                  </p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">{controlNo}</p>
                </div>
                <div className="content-stretch flex flex-col gap-px items-start leading-[normal] not-italic" data-name="Label + Text">
                  <p className="font-['Calibre:SemiBold',sans-serif] overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160] text-[10px] text-nowrap tracking-[0.7px] uppercase w-full font-bold">Message/Declaration type</p>
                  <p className="font-['Calibre:Regular',sans-serif] relative shrink-0 text-[12px] text-black w-full">{detailData?.messageDeclarationType || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Stats bar: live totals + Validate and Send */}
            <div className="bg-white content-stretch flex items-center relative shrink-0 w-full gap-[24px]">
              {/* Invoice Amount Total */}
              <div className="basis-0 grow min-w-0">
                <p className="leading-[normal] text-[13px]">
                  <span className="font-['Calibre:SemiBold',sans-serif] text-[#003160] text-[11px] tracking-[0.7px] uppercase font-bold">Invoice Amount Total: </span>
                  <span className="font-[Inter] text-black">{detailData?.currency || 'NOK'} {formatAmount(invoiceAmountTotal)}</span>
                </p>
                <div className="flex items-center gap-[10px] mt-[6px]">
                  <div className="flex-1 h-[6px] bg-[#e0e0e0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#52b89c] rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, invoiceAmountPercent))}%` }} />
                  </div>
                  <span className="text-[#52b89c] text-[11px] font-bold whitespace-nowrap font-['Calibre:SemiBold',sans-serif]">{Math.round(Math.max(0, Math.min(100, invoiceAmountPercent)))}% USED</span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-[36px] bg-[#e0e0e0] shrink-0" />

              {/* Net Weight Total */}
              <div className="basis-0 grow min-w-0">
                <p className="leading-[normal] text-[13px]">
                  <span className="font-['Calibre:SemiBold',sans-serif] text-[#003160] text-[11px] tracking-[0.7px] uppercase font-bold">Net Weight Total: </span>
                  <span className="font-[Inter] text-black">{formatAmount(netWeightTotal)} KG</span>
                </p>
                <div className="flex items-center gap-[10px] mt-[6px]">
                  <div className="flex-1 h-[6px] bg-[#e0e0e0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#52b89c] rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, netWeightPercent))}%` }} />
                  </div>
                  <span className="text-[#52b89c] text-[11px] font-bold whitespace-nowrap font-['Calibre:SemiBold',sans-serif]">{Math.round(Math.max(0, Math.min(100, netWeightPercent)))}% USED</span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-[36px] bg-[#e0e0e0] shrink-0" />

              {/* No of Parcels Total — validated against the sum of "No of Parcels" across Item Lines */}
              <div className="basis-0 grow min-w-0">
                <p className="leading-[normal] text-[13px]">
                  <span className="font-['Calibre:SemiBold',sans-serif] text-[#003160] text-[11px] tracking-[0.7px] uppercase font-bold">No of Parcels Total: </span>
                  <span className="font-[Inter] text-black">{Math.round(noOfParcelsTotal)}</span>
                </p>
                <div className="flex items-center gap-[10px] mt-[6px]">
                  <div className="flex-1 h-[6px] bg-[#e0e0e0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#52b89c] rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, noOfParcelsPercent))}%` }} />
                  </div>
                  <span className="text-[#52b89c] text-[11px] font-bold whitespace-nowrap font-['Calibre:SemiBold',sans-serif]">{Math.round(Math.max(0, Math.min(100, noOfParcelsPercent)))}% USED</span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-[36px] bg-[#e0e0e0] shrink-0" />

              {/* Total Statistical Value - no progress bar, it's not a "used from Items" figure */}
              <div className="shrink-0">
                <p className="leading-[normal] text-[13px] whitespace-nowrap">
                  <span className="font-['Calibre:SemiBold',sans-serif] text-[#003160] text-[11px] tracking-[0.7px] uppercase font-bold">Total Statistical Value: </span>
                  <span className="font-[Inter] text-black">{detailData?.totalStatisticalValue || '0,00'}</span>
                </p>
              </div>

              {/* Validate and Send — hidden once the declaration has been sent, there's nothing left to send */}
              {detailData?.stage !== 'sent' && (
                <button
                  onClick={onValidateAndSend}
                  className="bg-gradient-to-t from-[#0058ac] to-[#446bf9] box-border content-stretch flex gap-[10px] h-[36px] items-center px-[16px] py-0 rounded-[2px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#446BF9]"
                  data-name="Button/Validate and Send"
                >
                  <span className="font-['Calibre:SemiBold',sans-serif] font-bold text-[12px] text-white whitespace-nowrap">Validate and Send</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}