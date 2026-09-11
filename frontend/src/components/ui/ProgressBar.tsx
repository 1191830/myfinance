interface ProgressBarProps {
  /** 0..100 */
  percent: number;
  className?: string;
  color?: string;
  height?: number;
}

export const ProgressBar = ({
  percent,
  className = '',
  color = 'var(--color-gold)',
  height = 6,
}: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={`overflow-hidden rounded-full bg-line-soft ${className}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  );
};
