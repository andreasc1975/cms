interface StatusBadgeProps {
  status: 'C' | 'PO' | 'O' | 'SENT' | 'DRAFT';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'C': {
      bg: 'bg-[#52b89c]',
      label: 'C',
      title: 'Cleared',
      width: 'w-[20px]'
    },
    'PO': {
      bg: 'bg-[#ff8f00]', 
      label: 'PO',
      title: 'Partly Open',
      width: 'w-[20px]'
    },
    'O': {
      bg: 'bg-[#446bf9]',
      label: 'O', 
      title: 'Open',
      width: 'w-[20px]'
    },
    'SENT': {
      bg: 'bg-[#0058ac]',
      label: 'SENT',
      title: 'Sent to customs',
      width: 'w-[34px]'
    },
    'DRAFT': {
      bg: 'bg-[#9e9e9e]',
      label: 'D',
      title: 'Draft — missing data needed to send',
      width: 'w-[20px]'
    }
  };

  const config = statusConfig[status];

  return (
    <div 
      className={`${config.bg} ${config.width} content-stretch flex gap-[10px] h-[16px] items-center justify-center relative rounded-[1px] shrink-0`}
      title={config.title}
    >
      <div className="flex flex-col font-['Inter'] justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-center text-nowrap text-white uppercase font-semibold">
        <p className="leading-[normal] overflow-ellipsis overflow-hidden whitespace-pre text-[10px] p-[0px]">{config.label}</p>
      </div>
    </div>
  );
}