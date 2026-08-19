import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface CircularProgressProps {
  percentage: number;
  withdrawalWeight: string | number;
  storedWeight: string | number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ percentage, withdrawalWeight, storedWeight, size = 18, strokeWidth = 3 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on percentage
  const getColor = () => {
    if (percentage === 100) return '#52B89C'; // Green for 100%
    if (percentage >= 80) return '#FF8F00'; // Orange for 80-99%
    return '#757575'; // Gray for <80%
  };
  
  const color = getColor();
  
  // Format weight values with proper thousand separators
  const formatWeight = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) || 0 : value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center justify-center gap-[6px] cursor-help">
            <svg width={size} height={size} className="transform -rotate-90 shrink-0">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#E0E0E0"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            {/* Percentage text to the right */}
            <span 
              className="font-roboto-mono font-medium text-[12px] shrink-0"
              style={{ color }}
            >
              {Math.round(percentage)}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-['Inter'] text-[12px]">
            Withdrawal <span className="font-roboto-mono font-medium">{formatWeight(withdrawalWeight)}</span> of <span className="font-roboto-mono font-medium">{formatWeight(storedWeight)}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
