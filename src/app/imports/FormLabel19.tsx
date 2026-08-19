import svgPaths from "./svg-pw63lxz1i1";
import { img, img1 } from "./svg-iib1q";

function Frame13() {
  return (
    <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap tracking-[0.7px] uppercase">
      <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#ff8f00]">
        <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[12px] text-nowrap whitespace-pre">30</p>
      </div>
      <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
        <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[12px] text-nowrap whitespace-pre">Item storage location</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-0 top-0 w-[189px]">
      <Frame13 />
      <div className="opacity-0 relative shrink-0 size-[15px]" data-name="info">
        <div className="absolute inset-[8.333%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[24px_24px]" data-name="info" style={{ maskImage: `url('${img}')` }}>
          <div className="absolute inset-0" style={{ "--fill-0": "rgba(68, 107, 249, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
              <path d={svgPaths.p3aa6c500} fill="var(--fill-0, #446BF9)" id="info" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormLabel19() {
  return (
    <div className="relative size-full" data-name="Form+Label 19">
      <Frame1 />
      <div className="absolute bg-white bottom-0 box-border content-stretch flex items-center justify-between left-0 pl-[10px] pr-0 py-0 right-0 rounded-[2px] top-[31.48%]" data-name="Form">
        <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[2px]" />
        <div className="basis-0 flex flex-col font-['Calibre:Regular',sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-black text-nowrap">
          <p className="[white-space-collapse:collapse] leading-[normal] overflow-ellipsis overflow-hidden">A Tollager A</p>
        </div>
        <div className="bg-[#e0e0e0] relative rounded-br-[2px] rounded-tr-[2px] shrink-0 size-[36px]" data-name="MatIconsForms">
          <div className="absolute inset-[44.44%_37.22%_42.5%_38.89%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-14px_-16px] mask-size-[36px_36px]" data-name="arrow_drop_down" style={{ maskImage: `url('${img1}')` }}>
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(0, 49, 96, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 5">
                <path d={svgPaths.p601ad80} fill="var(--fill-0, #003160)" id="arrow_drop_down" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}