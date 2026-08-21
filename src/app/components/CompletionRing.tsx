interface CompletionRingProps {
  percent: number;
  filled: number;
  total: number;
  missingLabels: string[];
}

/**
 * Small circular progress ring showing how many of the 15 required GENERAL
 * fields (the orange box numbers) are filled in — the same check
 * "Validate and Send" runs before allowing a declaration to be sent.
 * Doesn't reflect the invoice-vs-Items match, only the field-completion
 * side of that validation (see lib/declarationCompleteness.ts).
 */
export function CompletionRing({ percent, filled, total, missingLabels }: CompletionRingProps) {
  const size = 22;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color = percent === 100 ? '#52b89c' : percent >= 50 ? '#446bf9' : '#ff8f00';

  const tooltip =
    percent === 100
      ? `All ${total} required fields are filled in`
      : `${filled}/${total} required fields filled in — missing: ${missingLabels.join(', ')}`;

  return (
    <div className="flex items-center justify-center" title={tooltip}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
        />
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
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 300ms' }}
        />
      </svg>
    </div>
  );
}