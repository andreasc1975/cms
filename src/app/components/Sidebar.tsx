import { useState } from 'react';
import { Menu, X, Plus, Minus } from 'lucide-react';
import { getSectionIcon } from '../config/sectionIcons';
import svgPaths from "../imports/svg-b75trn6pxk";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate?: (mainTitle: string, subLink: string) => void;
  activeSubLink?: string;
  mainTitle?: string;
}

export function Sidebar({ isCollapsed, onToggle, onNavigate, activeSubLink = 'Sub Link 1', mainTitle = 'Application' }: SidebarProps) {
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [isMenuYExpanded, setIsMenuYExpanded] = useState(false);
  const [isMenuZExpanded, setIsMenuZExpanded] = useState(false);
  const [isMenuAExpanded, setIsMenuAExpanded] = useState(false);
  const [isMenuBExpanded, setIsMenuBExpanded] = useState(false);

  const toggleMenu = () => {
    setIsMenuExpanded(prev => !prev);
  };

  const toggleMenuY = () => {
    setIsMenuYExpanded(prev => !prev);
  };

  const toggleMenuZ = () => {
    setIsMenuZExpanded(prev => !prev);
  };

  const toggleMenuA = () => {
    setIsMenuAExpanded(prev => !prev);
  };

  const toggleMenuB = () => {
    setIsMenuBExpanded(prev => !prev);
  };
  
  // Determine which main section is active based on mainTitle
  const isApplicationActive = mainTitle === 'Application';
  const isApplicationYActive = mainTitle === 'Application Y';
  const isApplicationZActive = mainTitle === 'Application Z';
  const isApplicationAActive = mainTitle === 'Application A';
  const isApplicationBActive = mainTitle === 'Application B';
  
  // Get icon components dynamically from configuration
  const ApplicationIcon = getSectionIcon('Application');
  const ApplicationYIcon = getSectionIcon('Application Y');
  const ApplicationZIcon = getSectionIcon('Application Z');
  const ApplicationAIcon = getSectionIcon('Application A');
  const ApplicationBIcon = getSectionIcon('Application B');

  return (
    <div className={`fixed content-stretch flex flex-col h-screen left-0 top-0 transition-all duration-300 z-30 ${isCollapsed ? 'w-[60px]' : 'w-[235px]'}`}>
      {/* Menu Background */}
      <div className="absolute bg-white content-stretch flex gap-[10px] h-full items-center justify-end left-0 overflow-clip top-0 w-full p-[0px]">
        <div className="bg-[#e0e0e0] h-full shrink-0 w-[2px]" />
      </div>

      {/* Logo Header */}
      <div className="bg-white box-border content-stretch flex gap-[12px] h-[60px] items-center left-0 top-0 w-full z-10 pt-[5px] pr-[5px] pb-[5px] pl-[9px] relative shrink-0">
        <div className="absolute border-[#e0e0e0] border-[0px_0px_0.8px] border-solid inset-0 pointer-events-none" />
        
        {/* Menu Toggle Button */}
        <button
          onClick={onToggle}
          className="relative shrink-0 size-[40px] hover:opacity-80 transition-opacity flex items-center justify-center"
        >
          <div className="absolute size-[40px] rounded-full bg-[#DFE5EB]" />
          <div className="relative z-10">
            {isCollapsed ? (
              <Menu className="size-[24px] text-[#003160]" />
            ) : (
              <X className="size-[24px] text-[#003160]" />
            )}
          </div>
        </button>

        {/* Logo */}
        {!isCollapsed && (
          <div className="h-[31.496px] relative shrink-0 w-[155px]">
            <div className="absolute bottom-[23.56%] left-0 right-[8.26%] top-[23.56%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 143 17">
                <g>
                  <path d={svgPaths.pdb18100} fill="#003160" />
                </g>
              </svg>
            </div>
            <div className="absolute bottom-[59.08%] left-[92.89%] right-0 top-[23.56%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 6">
                <g>
                  <path d={svgPaths.p3f6b100} fill="#003160" />
                </g>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Navigation Menu Container */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Navigation Menu */}
        <div className="content-stretch flex flex-col gap-px items-start left-[4px] relative top-[4px] w-[calc(100%-8px)]">
        {/* Application Section */}
        <button
          onClick={toggleMenu}
          className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative rounded-tl-[2px] rounded-tr-[2px] shrink-0 w-full transition-colors cursor-pointer ${
            isApplicationActive 
              ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
              : 'bg-white hover:bg-[#f5f5f5]'
          }`}
        >
          <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div className="flex flex-row items-center relative size-full">
              <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                <div className="relative shrink-0 size-[30px] flex items-center justify-center">
                  <ApplicationIcon className={`size-[20px] ${isApplicationActive ? 'text-[#003160]' : 'text-[#767676]'}`} />
                </div>
                {!isCollapsed && (
                  <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap tracking-[0.7px] uppercase font-semibold`}>
                    <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-left">Application</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isCollapsed && (
            <div className="relative shrink-0 size-[18px] flex items-center justify-center">
              {isMenuExpanded ? (
                <Minus className={`size-[16px] ${isApplicationActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              ) : (
                <Plus className={`size-[16px] ${isApplicationActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              )}
            </div>
          )}
        </button>

        {/* Sublinks - Collapsible */}
        {isMenuExpanded && (
        <div className="w-full">
          {/* Sub Link 1 */}
          <button
            onClick={() => onNavigate?.('Application', 'Sub Link 1')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationActive && activeSubLink === 'Sub Link 1' ? '#003160' : isApplicationActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationActive && activeSubLink === 'Sub Link 1' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden text-left">Sub Link 1</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 2 */}
          <button
            onClick={() => onNavigate?.('Application', 'Sub Link 2')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationActive && activeSubLink === 'Sub Link 2' ? '#003160' : isApplicationActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationActive && activeSubLink === 'Sub Link 2' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden text-left">Sub Link 2</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 3 */}
          <button
            onClick={() => onNavigate?.('Application', 'Sub Link 3')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationActive && activeSubLink === 'Sub Link 3' ? '#003160' : isApplicationActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationActive && activeSubLink === 'Sub Link 3' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden text-left">Sub Link 3</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 4 */}
          <button
            onClick={() => onNavigate?.('Application', 'Sub Link 4')}
            className={`box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-[10px] py-0 relative rounded-bl-[2px] rounded-br-[2px] shrink-0 w-full transition-colors cursor-pointer pt-[3px] pb-[5px] ${
              isApplicationActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationActive && activeSubLink === 'Sub Link 4' ? '#003160' : isApplicationActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationActive && activeSubLink === 'Sub Link 4' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden text-left">Sub Link 4</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
        )}

        {/* Main Section Divider */}
        <div className="w-full py-[5px] px-[5px]">
          <div className="w-full h-[1px] bg-[#e0e0e0]" />
        </div>

        {/* Application Y Section */}
        <button
          onClick={toggleMenuY}
          className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative rounded-tl-[2px] rounded-tr-[2px] shrink-0 w-full transition-colors cursor-pointer ${
            isApplicationYActive 
              ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
              : 'bg-white hover:bg-[#f5f5f5]'
          }`}
        >
          <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div className="flex flex-row items-center relative size-full">
              <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                <div className="relative shrink-0 size-[30px] flex items-center justify-center">
                  <ApplicationYIcon className={`size-[20px] ${isApplicationYActive ? 'text-[#003160]' : 'text-[#767676]'}`} />
                </div>
                {!isCollapsed && (
                  <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationYActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap tracking-[0.7px] uppercase font-semibold`}>
                    <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-left">Application Y</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isCollapsed && (
            <div className="relative shrink-0 size-[18px] flex items-center justify-center">
              {isMenuYExpanded ? (
                <Minus className={`size-[16px] ${isApplicationYActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              ) : (
                <Plus className={`size-[16px] ${isApplicationYActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              )}
            </div>
          )}
        </button>

        {/* Application Y Sublinks - Collapsible */}
        {isMenuYExpanded && (
        <div className="w-full">
          {/* Sub Link 1 */}
          <button
            onClick={() => onNavigate?.('Application Y', 'Sub Link 1')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationYActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationYActive && activeSubLink === 'Sub Link 1' ? '#003160' : isApplicationYActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationYActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationYActive && activeSubLink === 'Sub Link 1' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 1</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 2 */}
          <button
            onClick={() => onNavigate?.('Application Y', 'Sub Link 2')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationYActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationYActive && activeSubLink === 'Sub Link 2' ? '#003160' : isApplicationYActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationYActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationYActive && activeSubLink === 'Sub Link 2' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 2</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 3 */}
          <button
            onClick={() => onNavigate?.('Application Y', 'Sub Link 3')}
            className={`box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-[10px] py-0 relative rounded-bl-[2px] rounded-br-[2px] shrink-0 w-full transition-colors cursor-pointer pt-[3px] pb-[5px] ${
              isApplicationYActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationYActive && activeSubLink === 'Sub Link 3' ? '#003160' : isApplicationYActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationYActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationYActive && activeSubLink === 'Sub Link 3' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 3</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
        )}

        {/* Main Section Divider */}
        <div className="w-full py-[5px] px-[5px]">
          <div className="w-full h-[1px] bg-[#e0e0e0]" />
        </div>

        {/* Application Z Section */}
        <button
          onClick={toggleMenuZ}
          className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative rounded-tl-[2px] rounded-tr-[2px] shrink-0 w-full transition-colors cursor-pointer ${
            isApplicationZActive 
              ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
              : 'bg-white hover:bg-[#f5f5f5]'
          }`}
        >
          <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div className="flex flex-row items-center relative size-full">
              <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                <div className="relative shrink-0 size-[30px] flex items-center justify-center">
                  <ApplicationZIcon className={`size-[20px] ${isApplicationZActive ? 'text-[#003160]' : 'text-[#767676]'}`} />
                </div>
                {!isCollapsed && (
                  <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationZActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap tracking-[0.7px] uppercase font-semibold`}>
                    <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-left">Application Z</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isCollapsed && (
            <div className="relative shrink-0 size-[18px] flex items-center justify-center">
              {isMenuZExpanded ? (
                <Minus className={`size-[16px] ${isApplicationZActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              ) : (
                <Plus className={`size-[16px] ${isApplicationZActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              )}
            </div>
          )}
        </button>

        {/* Application Z Sublinks - Collapsible */}
        {isMenuZExpanded && (
        <div className="w-full">
          {/* Sub Link 1 */}
          <button
            onClick={() => onNavigate?.('Application Z', 'Sub Link 1')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationZActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationZActive && activeSubLink === 'Sub Link 1' ? '#003160' : isApplicationZActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationZActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationZActive && activeSubLink === 'Sub Link 1' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 1</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 2 */}
          <button
            onClick={() => onNavigate?.('Application Z', 'Sub Link 2')}
            className={`box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-[10px] py-0 relative rounded-bl-[2px] rounded-br-[2px] shrink-0 w-full transition-colors cursor-pointer pt-[3px] pb-[5px] ${
              isApplicationZActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationZActive && activeSubLink === 'Sub Link 2' ? '#003160' : isApplicationZActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationZActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationZActive && activeSubLink === 'Sub Link 2' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 2</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
        )}

        {/* Main Section Divider */}
        <div className="w-full py-[5px] px-[5px]">
          <div className="w-full h-[1px] bg-[#e0e0e0]" />
        </div>

        {/* Application A Section */}
        <button
          onClick={toggleMenuA}
          className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative rounded-tl-[2px] rounded-tr-[2px] shrink-0 w-full transition-colors cursor-pointer ${
            isApplicationAActive 
              ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
              : 'bg-white hover:bg-[#f5f5f5]'
          }`}
        >
          <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div className="flex flex-row items-center relative size-full">
              <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                <div className="relative shrink-0 size-[30px] flex items-center justify-center">
                  <ApplicationAIcon className={`size-[20px] ${isApplicationAActive ? 'text-[#003160]' : 'text-[#767676]'}`} />
                </div>
                {!isCollapsed && (
                  <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationAActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap tracking-[0.7px] uppercase font-semibold`}>
                    <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-left">Application A</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isCollapsed && (
            <div className="relative shrink-0 size-[18px] flex items-center justify-center">
              {isMenuAExpanded ? (
                <Minus className={`size-[16px] ${isApplicationAActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              ) : (
                <Plus className={`size-[16px] ${isApplicationAActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              )}
            </div>
          )}
        </button>

        {/* Application A Sublinks - Collapsible */}
        {isMenuAExpanded && (
        <div className="w-full">
          {/* Sub Link 1 */}
          <button
            onClick={() => onNavigate?.('Application A', 'Sub Link 1')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationAActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationAActive && activeSubLink === 'Sub Link 1' ? '#003160' : isApplicationAActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationAActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationAActive && activeSubLink === 'Sub Link 1' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 1</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 2 */}
          <button
            onClick={() => onNavigate?.('Application A', 'Sub Link 2')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationAActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationAActive && activeSubLink === 'Sub Link 2' ? '#003160' : isApplicationAActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationAActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationAActive && activeSubLink === 'Sub Link 2' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 2</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 3 */}
          <button
            onClick={() => onNavigate?.('Application A', 'Sub Link 3')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationAActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationAActive && activeSubLink === 'Sub Link 3' ? '#003160' : isApplicationAActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationAActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationAActive && activeSubLink === 'Sub Link 3' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 3</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 4 */}
          <button
            onClick={() => onNavigate?.('Application A', 'Sub Link 4')}
            className={`box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-[10px] py-0 relative rounded-bl-[2px] rounded-br-[2px] shrink-0 w-full transition-colors cursor-pointer pt-[3px] pb-[5px] ${
              isApplicationAActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationAActive && activeSubLink === 'Sub Link 4' ? '#003160' : isApplicationAActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationAActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationAActive && activeSubLink === 'Sub Link 4' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 4</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
        )}

        {/* Main Section Divider */}
        <div className="w-full py-[5px] px-[5px]">
          <div className="w-full h-[1px] bg-[#e0e0e0]" />
        </div>

        {/* Application B Section */}
        <button
          onClick={toggleMenuB}
          className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative rounded-tl-[2px] rounded-tr-[2px] shrink-0 w-full transition-colors cursor-pointer ${
            isApplicationBActive 
              ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
              : 'bg-white hover:bg-[#f5f5f5]'
          }`}
        >
          <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div className="flex flex-row items-center relative size-full">
              <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                <div className="relative shrink-0 size-[30px] flex items-center justify-center">
                  <ApplicationBIcon className={`size-[20px] ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'}`} />
                </div>
                {!isCollapsed && (
                  <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap tracking-[0.7px] uppercase font-semibold`}>
                    <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[10px] text-left">Application B</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isCollapsed && (
            <div className="relative shrink-0 size-[18px] flex items-center justify-center">
              {isMenuBExpanded ? (
                <Minus className={`size-[16px] ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              ) : (
                <Plus className={`size-[16px] ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'}`} strokeWidth={2.5} />
              )}
            </div>
          )}
        </button>

        {/* Application B Sublinks - Collapsible */}
        {isMenuBExpanded && (
        <div className="w-full">
          {/* Sub Link 1 */}
          <button
            onClick={() => onNavigate?.('Application B', 'Sub Link 1')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationBActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationBActive && activeSubLink === 'Sub Link 1' ? '#003160' : isApplicationBActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationBActive && activeSubLink === 'Sub Link 1' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 1</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 2 */}
          <button
            onClick={() => onNavigate?.('Application B', 'Sub Link 2')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationBActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationBActive && activeSubLink === 'Sub Link 2' ? '#003160' : isApplicationBActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationBActive && activeSubLink === 'Sub Link 2' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 2</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 3 */}
          <button
            onClick={() => onNavigate?.('Application B', 'Sub Link 3')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationBActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationBActive && activeSubLink === 'Sub Link 3' ? '#003160' : isApplicationBActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationBActive && activeSubLink === 'Sub Link 3' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 3</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 4 */}
          <button
            onClick={() => onNavigate?.('Application B', 'Sub Link 4')}
            className={`box-border content-stretch flex gap-[5px] h-[37px] items-center pl-[5px] pr-[10px] py-0 relative shrink-0 w-full transition-colors cursor-pointer ${
              isApplicationBActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationBActive && activeSubLink === 'Sub Link 4' ? '#003160' : isApplicationBActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationBActive && activeSubLink === 'Sub Link 4' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 4</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="w-full h-[1px] bg-white" />

          {/* Sub Link 5 */}
          <button
            onClick={() => onNavigate?.('Application B', 'Sub Link 5')}
            className={`box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-[10px] py-0 relative rounded-bl-[2px] rounded-br-[2px] shrink-0 w-full transition-colors cursor-pointer pt-[3px] pb-[5px] ${
              isApplicationBActive 
                ? 'bg-gradient-to-r from-[#dfe5eb] to-[#dfe5eb] hover:from-[#d5dce3] hover:to-[#d5dce3]'
                : 'bg-white hover:bg-[#f5f5f5]'
            }`}
          >
            <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
              <div className="flex flex-row items-center relative size-full">
                <div className="box-border content-stretch flex gap-[5px] items-center pl-[5px] pr-0 py-0 relative w-full">
                  <div className="relative shrink-0 size-[30px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                      <g>
                        <circle cx="15" cy="15" fill={isApplicationBActive && activeSubLink === 'Sub Link 5' ? '#003160' : isApplicationBActive ? '#B3C2D0' : '#767676'} r="3" />
                      </g>
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className={`basis-0 font-['Inter'] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 ${isApplicationBActive ? 'text-[#003160]' : 'text-[#767676]'} text-[12px] text-nowrap ${isApplicationBActive && activeSubLink === 'Sub Link 5' ? 'font-semibold' : ''}`}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden">Sub Link 5</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
        )}
        </div>
      </div>
    </div>
  );
}