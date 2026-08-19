import svgPaths from "./svg-d35vvqd4wo";
import { img } from "./svg-4t6b8";

function Frame13() {
  return (
    <div className="content-stretch flex font-['Calibre:SemiBold',sans-serif] gap-[5px] items-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap tracking-[0.7px] uppercase">
      <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#ff8f00]">
        <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[12px] text-nowrap whitespace-pre">48</p>
      </div>
      <div className="flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[#003160]">
        <p className="leading-[normal] overflow-ellipsis overflow-hidden text-[12px] text-nowrap whitespace-pre">Control No</p>
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

export default function FormLabel4() {
  return (
    <div className="relative size-full" data-name="Form+Label 4">
      <Frame1 />
      <div className="absolute bg-white bottom-0 box-border content-stretch flex items-center justify-between left-0 pl-[10px] pr-0 py-0 right-0 rounded-[2px] top-[31.48%]" data-name="Form">
        <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[2px]" />
        <div className="basis-0 flex flex-col font-['Calibre:Regular',sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#9e9e9e] text-[14px] text-nowrap">
          <p className="[white-space-collapse:collapse] leading-[normal] overflow-ellipsis overflow-hidden">Add</p>
        </div>
      </div>
    </div>
  );
}