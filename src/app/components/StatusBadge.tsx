interface StatusBadgeProps {
  status: 'C' | 'PO' | 'O';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'C': {
      bg: 'bg-[#52b89c]',
      label: 'C',
      title: 'Cleared'
    },
    'PO': {
      bg: 'bg-[#ff8f00]', 
      label: 'PO',
      title: 'Partly Open'
    },
    'O': {
      bg: 'bg-[#446bf9]',
      label: 'O', 
      title: 'Open'
    }
  };

  const config = statusConfig[status];

  return (
    <div 
      className={`${config.bg} content-stretch flex gap-[10px] h-[16px] items-center justify-center relative rounded-[1px] shrink-0 w-[20px]`}
      title={config.title}
    >
      <div className="flex flex-col font-['Inter'] justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-center text-nowrap text-white uppercase font-semibold">
        <p className="leading-[normal] overflow-ellipsis overflow-hidden whitespace-pre text-[10px] p-[0px]">{config.label}</p>
      </div>
    </div>
  );
}