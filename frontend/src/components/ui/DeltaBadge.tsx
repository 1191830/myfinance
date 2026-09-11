import { formatPercent } from '../../lib/format';

interface DeltaBadgeProps {
  /** percent change; null renders nothing */
  value: number | null;
  /** when true, a positive delta is bad (e.g. expenses rising) -> crimson */
  invert?: boolean;
}

const Triangle = ({ up }: { up: boolean }) => (
  <svg width="8" height="8" viewBox="0 0 12 12" aria-hidden="true">
    <path d={up ? 'M6 2 10 9H2Z' : 'M6 10 2 3h8Z'} fill="currentColor" />
  </svg>
);

export const DeltaBadge = ({ value, invert = false }: DeltaBadgeProps) => {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  const positive = invert ? !up : up;
  const cls = positive
    ? 'text-income bg-income-tint'
    : 'text-expense bg-expense-tint';
  return (
    <span
      className={`inline-flex items-center gap-[3px] rounded px-[7px] py-[2px] text-xs font-semibold ${cls}`}
    >
      <Triangle up={up} />
      {formatPercent(Math.abs(value))}
    </span>
  );
};
